import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Dados from './pages/Dados';
import Scenarios from './pages/Scenarios';
import ScenarioForm from './pages/ScenarioForm';
import ScenarioResult from './pages/ScenarioResult';
import Users from './pages/Users';
import Profile from './pages/Profile';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dados" element={<AdminRoute><Dados /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/scenarios/new" element={<ScenarioForm />} />
        <Route path="/scenarios/:id" element={<ScenarioResult />} />
        <Route path="/scenarios/:id/edit" element={<ScenarioForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/baas">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
