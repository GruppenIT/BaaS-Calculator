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

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dados" element={<Dados />} />
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
