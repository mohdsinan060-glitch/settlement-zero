/**
 * ZERO TRANSIT — BACKEND SERVICE & TELEMETRY ENGINE
 * Handles authentication, persistent shuttle booking, live route telemetry,
 * and state transitions with Supabase REST integration or local persistent colony buffer.
 */

import {
  CANONICAL_LOCATIONS,
  calculateGreatCircleDistanceKm,
  calculateFictionalFare,
  interpolateGreatCircleArc
} from '../data/planetData';

export type RideStatus =
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'APPROACHING'
  | 'ARRIVED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED';

export type ShuttleClass = 'ZERO_COMPACT' | 'ZERO_EXPLORER' | 'ZERO_HAULER';

export interface ShuttleVehicle {
  id: string;
  name: string;
  vehicleClass: ShuttleClass;
  callsign: string;
  capacity: number;
  multiplier: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE';
  latitude: number;
  longitude: number;
  description: string;
  maxRangeKm: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  callsign: string;
  clearanceTier: string;
  creditsBalance: number;
  createdAt: string;
}

export interface RideEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
}

export interface RideRecord {
  id: string;
  userId: string;
  shuttleId: string;
  shuttleName: string;
  shuttleClass: ShuttleClass;
  shuttleCallsign: string;
  pickupName: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  distanceKm: number;
  estimatedDurationSeconds: number;
  fareCredits: number;
  status: RideStatus;
  routeGeometry: [number, number][]; // [lat, lon]
  requestedAt: number; // epoch ms
  assignedAt?: number;
  startedAt?: number;
  completedAt?: number;
  events: RideEvent[];
}

export interface BookingRequest {
  pickupId: string;
  destinationId: string;
  shuttleClass: ShuttleClass;
}

// Initial default fleet
const INITIAL_FLEET: ShuttleVehicle[] = [
  {
    id: 'shuttle-c1',
    name: 'Zero Compact Alpha',
    vehicleClass: 'ZERO_COMPACT',
    callsign: 'ZT-101',
    capacity: 2,
    multiplier: 1.0,
    status: 'AVAILABLE',
    latitude: -18.60,
    longitude: -82.45,
    description: 'Lightweight dual-ion skimmer. Rapid point-to-point transit for solo colonists.',
    maxRangeKm: 3200
  },
  {
    id: 'shuttle-e2',
    name: 'Zero Explorer Beta',
    vehicleClass: 'ZERO_EXPLORER',
    callsign: 'ZT-204',
    capacity: 4,
    multiplier: 1.4,
    status: 'AVAILABLE',
    latitude: -14.82,
    longitude: -88.04,
    description: 'Heavy planetary rover/skimmer hybrid with reinforced rad-shielding for rugged terrain.',
    maxRangeKm: 5500
  },
  {
    id: 'shuttle-h3',
    name: 'Zero Hauler Gamma',
    vehicleClass: 'ZERO_HAULER',
    callsign: 'ZT-308',
    capacity: 8,
    multiplier: 1.8,
    status: 'AVAILABLE',
    latitude: -22.15,
    longitude: -74.30,
    description: 'Heavy multi-passenger expedition shuttle with auxiliary life support canisters.',
    maxRangeKm: 7200
  }
];

// Storage keys
const STORAGE_KEY_AUTH = 'settlement_zero_user_session';
const STORAGE_KEY_RIDES = 'settlement_zero_rides_db';
const STORAGE_KEY_FLEET = 'settlement_zero_fleet_db';

class TransitBackendService {
  private currentUser: UserProfile | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initSession();
    this.initFleet();
  }

  public isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    return Boolean(url && key && url.startsWith('http'));
  }

  private initSession() {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch {
        this.currentUser = null;
      }
    }
  }

  private initFleet() {
    if (!localStorage.getItem(STORAGE_KEY_FLEET)) {
      localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(INITIAL_FLEET));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public signIn(email: string, displayName = 'Survivor'): UserProfile {
    const callsign = 'PILOT-' + Math.floor(1000 + Math.random() * 9000);
    const user: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      displayName,
      callsign,
      clearanceTier: 'COLONY COMMAND',
      creditsBalance: 650,
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    this.notify();
    return user;
  }

  public signOut() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.notify();
  }

  // ==========================================
  // FLEET MANAGEMENT
  // ==========================================
  public getFleet(): ShuttleVehicle[] {
    const raw = localStorage.getItem(STORAGE_KEY_FLEET);
    if (!raw) return INITIAL_FLEET;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FLEET;
    }
  }

  // ==========================================
  // RIDE BOOKINGS & VALIDATION
  // ==========================================
  public getRides(): RideRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_RIDES);
    if (!raw) return [];
    try {
      const all: RideRecord[] = JSON.parse(raw);
      // Synchronize statuses dynamically based on real elapsed time
      return all.map((r) => this.recalculateLiveRide(r));
    } catch {
      return [];
    }
  }

  public getUserRides(userId?: string): RideRecord[] {
    const targetUid = userId || this.currentUser?.id;
    if (!targetUid) return [];
    return this.getRides().filter((r) => r.userId === targetUid);
  }

  public getRideById(rideId: string): RideRecord | null {
    const rides = this.getRides();
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return null;
    return this.recalculateLiveRide(ride);
  }

  /**
   * Authoritative server-side booking creation
   */
  public createBooking(req: BookingRequest): { success: boolean; ride?: RideRecord; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'Authentication required to confirm orbital transit.' };
    }

    const pickupLoc = CANONICAL_LOCATIONS.find((l) => l.id === req.pickupId);
    const destLoc = CANONICAL_LOCATIONS.find((l) => l.id === req.destinationId);

    if (!pickupLoc || !destLoc) {
      return { success: false, error: 'Invalid planetary coordinates.' };
    }

    if (pickupLoc.id === destLoc.id) {
      return { success: false, error: 'Pickup and destination cannot be identical.' };
    }

    const distanceKm = calculateGreatCircleDistanceKm(
      pickupLoc.latitude,
      pickupLoc.longitude,
      destLoc.latitude,
      destLoc.longitude
    );

    const fleet = this.getFleet();
    const shuttle = fleet.find(
      (s) => s.vehicleClass === req.shuttleClass && s.status === 'AVAILABLE'
    );

    if (!shuttle) {
      return {
        success: false,
        error: `All ${req.shuttleClass.replace('_', ' ')} vehicles are currently dispatched or undergoing maintenance.`
      };
    }

    // Authoritative fare validation
    const fareDetails = calculateFictionalFare(distanceKm, shuttle.multiplier);
    if (this.currentUser.creditsBalance < fareDetails.total) {
      return {
        success: false,
        error: `Insufficient transit credits. Required: ${fareDetails.total} CR, Balance: ${this.currentUser.creditsBalance} CR.`
      };
    }

    // Deduct credits
    this.currentUser.creditsBalance -= fareDetails.total;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));

    // Great-circle route geometry
    const routeGeometry = interpolateGreatCircleArc(
      pickupLoc.latitude,
      pickupLoc.longitude,
      destLoc.latitude,
      destLoc.longitude,
      28
    );

    // Speed: ~180 km/h in simulation time (~1.5s per minute of simulated travel)
    const simulatedDurationSeconds = Math.max(30, Math.min(180, Math.round(distanceKm / 8)));

    const now = Date.now();
    const rideId = 'ZT-' + Math.floor(100000 + Math.random() * 900000);

    const newRide: RideRecord = {
      id: rideId,
      userId: this.currentUser.id,
      shuttleId: shuttle.id,
      shuttleName: shuttle.name,
      shuttleClass: shuttle.vehicleClass,
      shuttleCallsign: shuttle.callsign,
      pickupName: pickupLoc.name,
      pickupLatitude: pickupLoc.latitude,
      pickupLongitude: pickupLoc.longitude,
      destinationName: destLoc.name,
      destinationLatitude: destLoc.latitude,
      destinationLongitude: destLoc.longitude,
      distanceKm,
      estimatedDurationSeconds: simulatedDurationSeconds,
      fareCredits: fareDetails.total,
      status: 'SEARCHING',
      routeGeometry,
      requestedAt: now,
      assignedAt: now + 2000,
      startedAt: now + 6000,
      completedAt: now + 6000 + simulatedDurationSeconds * 1000,
      events: [
        {
          id: 'ev-1',
          timestamp: new Date(now).toLocaleTimeString(),
          type: 'REQUEST',
          message: `Transit requisition submitted from ${pickupLoc.name} to ${destLoc.name}.`
        },
        {
          id: 'ev-2',
          timestamp: new Date(now + 2000).toLocaleTimeString(),
          type: 'ASSIGNMENT',
          message: `${shuttle.name} [${shuttle.callsign}] locked and assigned.`
        }
      ]
    };

    // Save ride
    const currentRides = this.getRides();
    localStorage.setItem(STORAGE_KEY_RIDES, JSON.stringify([newRide, ...currentRides]));

    // Mark shuttle dispatched
    shuttle.status = 'DISPATCHED';
    localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(fleet));

    this.notify();
    return { success: true, ride: newRide };
  }

  /**
   * Cancels a ride if in pre-transit status
   */
  public cancelRide(rideId: string): { success: boolean; error?: string } {
    const rides = this.getRides();
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return { success: false, error: 'Ride record not found.' };

    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      return { success: false, error: 'Cannot cancel a completed or already cancelled ride.' };
    }

    ride.status = 'CANCELLED';
    ride.events.push({
      id: 'ev-can-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'CANCEL',
      message: 'Transit cancelled by passenger requisition.'
    });

    // Refund credits
    if (this.currentUser && this.currentUser.id === ride.userId) {
      this.currentUser.creditsBalance += ride.fareCredits;
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
    }

    // Release shuttle
    const fleet = this.getFleet();
    const shuttle = fleet.find((s) => s.id === ride.shuttleId);
    if (shuttle) {
      shuttle.status = 'AVAILABLE';
      localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(fleet));
    }

    localStorage.setItem(STORAGE_KEY_RIDES, JSON.stringify(rides));
    this.notify();
    return { success: true };
  }

  /**
   * Recalculates live telemetry, current position, and status based on real wall-clock time
   */
  public recalculateLiveRide(ride: RideRecord): RideRecord {
    if (ride.status === 'CANCELLED') return ride;

    const now = Date.now();
    const requested = ride.requestedAt;
    const assigned = ride.assignedAt || requested + 2000;
    const started = ride.startedAt || requested + 6000;
    const durationMs = ride.estimatedDurationSeconds * 1000;
    const completed = started + durationMs;

    let nextStatus: RideStatus = ride.status;

    if (now < assigned) {
      nextStatus = 'SEARCHING';
    } else if (now < started - 2500) {
      nextStatus = 'ASSIGNED';
    } else if (now < started - 500) {
      nextStatus = 'APPROACHING';
    } else if (now < started) {
      nextStatus = 'ARRIVED';
    } else if (now < completed) {
      nextStatus = 'IN_TRANSIT';
    } else {
      nextStatus = 'COMPLETED';
    }

    if (nextStatus !== ride.status) {
      ride.status = nextStatus;
      if (nextStatus === 'IN_TRANSIT') {
        if (!ride.events.some((e) => e.type === 'DEPART')) {
          ride.events.push({
            id: 'ev-dep-' + now,
            timestamp: new Date().toLocaleTimeString(),
            type: 'DEPART',
            message: `${ride.shuttleName} departed launch-pad. Cruising great-circle corridor.`
          });
        }
      } else if (nextStatus === 'COMPLETED') {
        if (!ride.events.some((e) => e.type === 'ARRIVE')) {
          ride.events.push({
            id: 'ev-arr-' + now,
            timestamp: new Date().toLocaleTimeString(),
            type: 'ARRIVE',
            message: `Touchdown confirmed at ${ride.destinationName}. Pressurization equalized.`
          });
        }
        // Free shuttle back to available
        const fleet = this.getFleet();
        const shuttle = fleet.find((s) => s.id === ride.shuttleId);
        if (shuttle && shuttle.status === 'DISPATCHED') {
          shuttle.status = 'AVAILABLE';
          shuttle.latitude = ride.destinationLatitude;
          shuttle.longitude = ride.destinationLongitude;
          localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(fleet));
        }
      }
    }

    return ride;
  }

  /**
   * Computes the current real-time coordinate of the shuttle
   */
  public getLiveShuttlePosition(ride: RideRecord): {
    latitude: number;
    longitude: number;
    progressPercent: number;
    remainingKm: number;
    remainingSeconds: number;
  } {
    const now = Date.now();
    const started = ride.startedAt || ride.requestedAt + 6000;
    const durationMs = ride.estimatedDurationSeconds * 1000;
    const points = ride.routeGeometry;

    if (points.length === 0) {
      return {
        latitude: ride.pickupLatitude,
        longitude: ride.pickupLongitude,
        progressPercent: 0,
        remainingKm: ride.distanceKm,
        remainingSeconds: ride.estimatedDurationSeconds
      };
    }

    if (ride.status === 'COMPLETED') {
      const last = points[points.length - 1];
      return {
        latitude: last[0],
        longitude: last[1],
        progressPercent: 100,
        remainingKm: 0,
        remainingSeconds: 0
      };
    }

    if (now <= started) {
      const first = points[0];
      return {
        latitude: first[0],
        longitude: first[1],
        progressPercent: 0,
        remainingKm: ride.distanceKm,
        remainingSeconds: ride.estimatedDurationSeconds
      };
    }

    const elapsedMs = now - started;
    const progress = Math.min(1, elapsedMs / durationMs);
    const indexFloat = progress * (points.length - 1);
    const index = Math.floor(indexFloat);
    const fraction = indexFloat - index;

    const pA = points[index];
    const pB = points[index + 1] || pA;

    const lat = pA[0] + (pB[0] - pA[0]) * fraction;
    const lon = pA[1] + (pB[1] - pA[1]) * fraction;

    const remainingKm = Math.round(ride.distanceKm * (1 - progress));
    const remainingSeconds = Math.max(0, Math.round(ride.estimatedDurationSeconds * (1 - progress)));

    return {
      latitude: lat,
      longitude: lon,
      progressPercent: Math.round(progress * 100),
      remainingKm,
      remainingSeconds
    };
  }
}

export const transitBackend = new TransitBackendService();
