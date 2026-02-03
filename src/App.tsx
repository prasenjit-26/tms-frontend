import { Navigate, Route, Routes } from 'react-router-dom';
import { MainNav } from './components/MainNav';
import { LoginPage } from './pages/LoginPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNav />
      <Routes>
        <Route path="/" element={<Navigate to="/shipments" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/shipments" element={<ShipmentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/shipments" replace />} />
      </Routes>
    </div>
  );
}
