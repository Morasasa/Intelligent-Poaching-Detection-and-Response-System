import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/common/Spinner';
import { ToastContainer } from './components/common/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadVideo from './pages/UploadVideo';
import DetectionResults from './pages/DetectionResults';
import AlertsPage from './pages/AlertsPage';
import OfficerDashboard from './pages/OfficerDashboard';
import SystemSettings from './pages/SystemSettings';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ─── Protected Route Guard ─────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Authenticating secure channel..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ─── Public Route Guard (redirect to dashboard if logged in) ──
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Authenticating secure channel..." />;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ─── Route Definitions ─────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer-dashboard"
        element={
          <ProtectedRoute>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadVideo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/detections"
        element={
          <ProtectedRoute>
            <DetectionResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/detections/:id"
        element={
          <ProtectedRoute>
            <DetectionResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SystemSettings />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ─── Root App ──────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
