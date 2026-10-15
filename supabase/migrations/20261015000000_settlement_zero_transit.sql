-- ==============================================================================
-- SETTLEMENT ZERO — ZERO TRANSIT DATABASE SCHEMA & SECURITY POLICIES
-- PostgreSQL schema for Supabase integration with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type ride_status as enum (
    'SEARCHING',
    'ASSIGNED',
    'APPROACHING',
    'ARRIVED',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type shuttle_class as enum (
    'ZERO_COMPACT',
    'ZERO_EXPLORER',
    'ZERO_HAULER'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type shuttle_status as enum (
    'AVAILABLE',
    'DISPATCHED',
    'MAINTENANCE',
    'OFFLINE'
  );
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  callsign text,
  clearance_tier text default 'COLONIST',
  credits_balance integer default 500,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. SHUTTLES TABLE
create table if not exists public.shuttles (
  id uuid primary key default uuid_generate_v4(),
  vehicle_name text not null,
  vehicle_class shuttle_class not null,
  callsign text not null unique,
  capacity integer not null,
  status shuttle_status default 'AVAILABLE' not null,
  current_latitude double precision not null,
  current_longitude double precision not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. RIDES TABLE
create table if not exists public.rides (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shuttle_id uuid references public.shuttles(id) on delete set null,
  pickup_name text not null,
  pickup_latitude double precision not null,
  pickup_longitude double precision not null,
  destination_name text not null,
  destination_latitude double precision not null,
  destination_longitude double precision not null,
  distance_km integer not null check (distance_km > 0),
  estimated_duration_seconds integer not null check (estimated_duration_seconds > 0),
  fare_credits integer not null check (fare_credits >= 0),
  status ride_status default 'SEARCHING' not null,
  route_geometry jsonb default '[]'::jsonb not null,
  requested_at timestamptz default timezone('utc'::text, now()) not null,
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. RIDE EVENTS TABLE (Auditable telemetry log)
create table if not exists public.ride_events (
  id uuid primary key default uuid_generate_v4(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  event_type text not null,
  event_payload jsonb default '{}'::jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. SHUTTLE LOCATIONS TABLE (Periodic telemetry tracking)
create table if not exists public.shuttle_locations (
  id uuid primary key default uuid_generate_v4(),
  shuttle_id uuid not null references public.shuttles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  timestamp timestamptz default timezone('utc'::text, now()) not null
);

-- 8. INDEXES FOR PERFORMANCE
create index if not exists idx_rides_user_id on public.rides(user_id);
create index if not exists idx_rides_shuttle_id on public.rides(shuttle_id);
create index if not exists idx_rides_status on public.rides(status);
create index if not exists idx_ride_events_ride_id on public.ride_events(ride_id);
create index if not exists idx_shuttle_locations_shuttle_id on public.shuttle_locations(shuttle_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.shuttles enable row level security;
alter table public.rides enable row level security;
alter table public.ride_events enable row level security;
alter table public.shuttle_locations enable row level security;

-- Profiles: Users can read and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Shuttles: Authenticated users can view available/active shuttles
create policy "Authenticated users can view shuttles"
  on public.shuttles for select
  to authenticated
  using (true);

-- Rides: Users can only see and manage their own rides
create policy "Users can view own rides"
  on public.rides for select
  using (auth.uid() = user_id);

create policy "Users can create own rides"
  on public.rides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rides"
  on public.rides for update
  using (auth.uid() = user_id);

-- Ride Events: Users can view events for their own rides
create policy "Users can view events for own rides"
  on public.ride_events for select
  using (
    exists (
      select 1 from public.rides
      where rides.id = ride_events.ride_id
      and rides.user_id = auth.uid()
    )
  );

-- Shuttle Locations: Read access for authenticated riders
create policy "Authenticated users can view shuttle locations"
  on public.shuttle_locations for select
  to authenticated
  using (true);

-- 10. SEED DATA (Default Initial Shuttles on Proxima-Zero)
insert into public.shuttles (vehicle_name, vehicle_class, callsign, capacity, status, current_latitude, current_longitude)
values
  ('Zero Compact Alpha', 'ZERO_COMPACT', 'ZT-101', 2, 'AVAILABLE', -18.60, -82.45),
  ('Zero Explorer Beta', 'ZERO_EXPLORER', 'ZT-204', 4, 'AVAILABLE', -14.82, -88.04),
  ('Zero Hauler Gamma', 'ZERO_HAULER', 'ZT-308', 8, 'AVAILABLE', -22.15, -74.30)
on conflict (callsign) do nothing;
