import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/home/Home';
import PropertyDetail from './pages/properties/PropertyDetail';
import { Login, Register } from './pages/auth/Auth';
import MyBookings from './pages/bookings/MyBookings';
import Favorites from './pages/bookings/Favorites';
import Dashboard from './pages/dashboard/Dashboard';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

function HostRoute({ children }) {
  const { isAuth, user } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.rol !== 'HOST' && user?.rol !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isAuth } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propiedad/:id" element={<PropertyDetail />} />
      <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuth ? <Navigate to="/" /> : <Register />} />
      <Route path="/mis-reservas" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
      <Route path="/favoritos" element={<PrivateRoute><Favorites /></PrivateRoute>} />
      <Route path="/dashboard" element={<HostRoute><Dashboard /></HostRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
