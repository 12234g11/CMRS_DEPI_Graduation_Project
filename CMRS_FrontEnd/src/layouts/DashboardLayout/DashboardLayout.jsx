// src/layouts/DashboardLayout/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

function DashboardLayout() {
  return (
    <div>
      <DashboardHeader />
      <DashboardSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;