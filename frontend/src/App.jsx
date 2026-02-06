import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Wallet from './pages/Wallet';
import Redeem from './pages/Redeem';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminPackages from './pages/admin/AdminPackages';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAudit from './pages/admin/AdminAudit';
import AdminInventory from './pages/admin/AdminInventory';
import AdminManagement from './pages/admin/AdminManagement';
import Network from './pages/Network';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const RedirectIfAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/signup" element={<RedirectIfAuth><Signup /></RedirectIfAuth>} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Member Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute><DashboardLayout><Packages /></DashboardLayout></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><DashboardLayout><Wallet /></DashboardLayout></ProtectedRoute>} />
          <Route path="/redeem" element={<ProtectedRoute><DashboardLayout><Redeem /></DashboardLayout></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><DashboardLayout><Network /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

          {/* Administrative Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN']}><AdminLayout><AdminOverview /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'OPS_ADMIN']}><AdminLayout><AdminPackages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'OPS_ADMIN']}><AdminLayout><AdminInventory /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN']}><AdminLayout><AdminApprovals /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'SUPPORT_ADMIN']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'SUPPORT_ADMIN']}><AdminLayout><AdminAudit /></AdminLayout></ProtectedRoute>} />

          {/* Super Admin Restricted */}
          <Route path="/admin/management" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><AdminLayout><AdminManagement /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
