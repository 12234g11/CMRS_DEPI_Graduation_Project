import { Navigate, Routes, Route } from 'react-router-dom';
import { ROUTES, ROLES } from '../shared/navigation';
import ProtectedRoute from './guards/ProtectedRoute';
import RoleRoute from './guards/RoleRoute';
import GuestRoute from './guards/GuestRoute';
import MainLayout from '../layouts/MainLayout/MainLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';

import LandingPage from '../features/landing/pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import CompanySetupPasswordPage from '../features/auth/pages/CompanySetupPasswordPage';
import AddReportPage from '../features/user/add-report/pages/AddReportPage';
import MyReportsPage from '../features/user/reports/pages/MyReportsPage';
import NearbyIssuesPage from '../features/user/nearby-issues/pages/NearbyIssuesPage';
import UserNotificationsPage from '../features/user/notifications/pages/UserNotificationsPage';
import UserProfilePage from '../features/user/profile/pages/UserProfilePage';

import AdminDashboardPage from '../features/admin/dashboard/pages/AdminDashboardPage';
import ReviewReportsPage from '../features/admin/reports/pages/ReviewReportsPage';
import AdminReportDetailsPage from '../features/admin/reports/pages/AdminReportDetailsPage';
import AdminCompaniesPage from '../features/admin/companies/pages/AdminCompaniesPage';
import AdminAnalyticsPage from '../features/admin/analytics/pages/AdminAnalyticsPage';
import AdminNotificationsPage from '../features/admin/notifications/pages/AdminNotificationsPage';
import AdminProfilePage from '../features/admin/profile/pages/AdminProfilePage';

import CompanyDashboardPage from '../features/company/dashboard/pages/CompanyDashboardPage';
import CompanyReportsPage from '../features/company/reports/pages/CompanyReportsPage';
import CompanyReportDetailsPage from '../features/company/reports/pages/CompanyReportDetailsPage';
import CompanyNotificationsPage from '../features/company/notifications/pages/CompanyNotificationsPage';
import CompanyProfilePage from '../features/company/profile/pages/CompanyProfilePage';
import CompanyTeamsPage from '../features/company/teams/pages/CompanyTeamsPage';
import CompanyAnalyticsPage from '../features/company/analytics/pages/CompanyAnalyticsPage';

import NotFoundPage from '../features/common/pages/NotFoundPage';
import UnauthorizedPage from '../features/common/pages/UnauthorizedPage';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route
            path={ROUTES.COMPANY_SETUP_PASSWORD}
            element={<CompanySetupPasswordPage />}
          />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.USER]} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path={ROUTES.DASHBOARD}
              element={<Navigate to={ROUTES.MY_REPORTS} replace />}
            />
            <Route path={ROUTES.ADD_REPORT} element={<AddReportPage />} />
            <Route path={ROUTES.MY_REPORTS} element={<MyReportsPage />} />
            <Route path={ROUTES.NEARBY_ISSUES} element={<NearbyIssuesPage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<UserNotificationsPage />} />
            <Route path={ROUTES.PROFILE} element={<UserProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_REVIEW_REPORTS} element={<ReviewReportsPage />} />
            <Route path={ROUTES.ADMIN_REPORT_DETAILS} element={<AdminReportDetailsPage />} />
            <Route path={ROUTES.ADMIN_COMPANIES} element={<AdminCompaniesPage />} />
            <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
            <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<AdminNotificationsPage />} />
            <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.COMPANY]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.COMPANY_DASHBOARD} element={<CompanyDashboardPage />} />
            <Route path={ROUTES.COMPANY_REPORTS} element={<CompanyReportsPage />} />
            <Route
              path={`${ROUTES.COMPANY_REPORTS}/:reportId`}
              element={<CompanyReportDetailsPage />}
            />
            <Route path={ROUTES.COMPANY_TEAMS} element={<CompanyTeamsPage />} />
            <Route path={ROUTES.COMPANY_NOTIFICATIONS} element={<CompanyNotificationsPage />} />
            <Route path={ROUTES.COMPANY_PROFILE} element={<CompanyProfilePage />} />
            <Route path={ROUTES.COMPANY_ANALYTICS} element={<CompanyAnalyticsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;