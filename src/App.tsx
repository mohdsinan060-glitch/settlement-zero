import { RouterProvider, Routes, Route } from './router';
import { HomePage } from './pages/HomePage';
import { HabitatPage } from './pages/HabitatPage';
import { NavigationPage } from './pages/NavigationPage';
import { TransitBookingPage } from './pages/transit/TransitBookingPage';
import { TransitLoginPage } from './pages/transit/TransitLoginPage';
import { TransitRidesHistoryPage } from './pages/transit/TransitRidesHistoryPage';
import { TransitRideDetailsPage } from './pages/transit/TransitRideDetailsPage';
import { TransitAccountPage } from './pages/transit/TransitAccountPage';

function App() {
  return (
    <RouterProvider>
      <Routes>
        {/* Main Dedicated Gateway Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 1. Planet Habitability Management */}
        <Route path="/habitat" element={<HabitatPage />} />

        {/* 2. Planetary Navigation & Cartography */}
        <Route path="/navigation" element={<NavigationPage />} />

        {/* 3. ZERO TRANSIT Passenger Shuttle System */}
        <Route path="/transit" element={<TransitBookingPage />} />
        <Route path="/transit/login" element={<TransitLoginPage />} />
        <Route path="/transit/rides" element={<TransitRidesHistoryPage />} />
        <Route path="/transit/rides/:rideId" element={<TransitRideDetailsPage />} />
        <Route path="/transit/account" element={<TransitAccountPage />} />
      </Routes>
    </RouterProvider>
  );
}

export default App;
