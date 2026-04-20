import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './routePaths';
import ProtectedRoute from './guards/ProtectedRoute';
import RoleRoute from './guards/RoleRoute';
import MainLayout from '../layouts/MainLayout/MainLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';

import LandingPage from '../features/landing/pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import CompanyLoginPage from '../features/auth/pages/CompanyLoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import AddReportPage from '../features/reports/pages/AddReportPage';
import MyReportsPage from '../features/reports/pages/MyReportsPage';
import NearbyIssuesPage from '../features/map/pages/NearbyIssuesPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import ReviewReportsPage from '../features/admin/pages/ReviewReportsPage';
import CompanyApprovalPage from '../features/admin/pages/CompanyApprovalPage';
import CompanyDashboardPage from '../features/company/pages/CompanyDashboardPage';
import CompanyReportsPage from '../features/company/pages/CompanyReportsPage';
import NotFoundPage from '../features/common/pages/NotFoundPage';
import UnauthorizedPage from '../features/common/pages/UnauthorizedPage';
import { ROLES } from '../shared/constants/roles';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.COMPANY_LOGIN} element={<CompanyLoginPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.ADD_REPORT} element={<AddReportPage />} />
          <Route path={ROUTES.MY_REPORTS} element={<MyReportsPage />} />
          <Route path={ROUTES.NEARBY_ISSUES} element={<NearbyIssuesPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_REVIEW_REPORTS} element={<ReviewReportsPage />} />
            <Route path={ROUTES.ADMIN_COMPANY_REQUESTS} element={<CompanyApprovalPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.COMPANY]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.COMPANY_DASHBOARD} element={<CompanyDashboardPage />} />
            <Route path={ROUTES.COMPANY_REPORTS} element={<CompanyReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;