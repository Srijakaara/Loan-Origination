import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleGuard } from '@/components/shared/RoleGuard'
import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import ApplicationCreate from '@/pages/customer/ApplicationCreate'
import MyApplications from '@/pages/customer/MyApplications'
import OperationalDashboard from '@/pages/operational/OperationalDashboard'
import ApplicationQueue from '@/pages/operational/ApplicationQueue'
import ApplicationWorkbench from '@/pages/operational/ApplicationWorkbench'
import Replay from '@/pages/governance/Replay'
import AuditorConsole from '@/pages/governance/AuditorConsole'
import ExecutiveDashboard from '@/pages/executive/ExecutiveDashboard'
import AdminConsole from '@/pages/admin/AdminConsole'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/customer"
          element={
            <RoleGuard allow={['customer']}>
              <CustomerDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/customer/new"
          element={
            <RoleGuard allow={['customer']}>
              <ApplicationCreate />
            </RoleGuard>
          }
        />
        <Route
          path="/customer/applications"
          element={
            <RoleGuard allow={['customer']}>
              <MyApplications />
            </RoleGuard>
          }
        />

        <Route
          path="/operational"
          element={
            <RoleGuard allow={['loan_officer', 'domain_lead']}>
              <OperationalDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/operational/queue"
          element={
            <RoleGuard allow={['loan_officer', 'domain_lead']}>
              <ApplicationQueue />
            </RoleGuard>
          }
        />
        <Route
          path="/operational/workbench/:id"
          element={
            <RoleGuard allow={['loan_officer', 'domain_lead']}>
              <ApplicationWorkbench />
            </RoleGuard>
          }
        />

        <Route
          path="/governance/replay"
          element={
            <RoleGuard allow={['internal_auditor', 'domain_lead']}>
              <Replay />
            </RoleGuard>
          }
        />
        <Route
          path="/governance/auditor"
          element={
            <RoleGuard allow={['internal_auditor']}>
              <AuditorConsole />
            </RoleGuard>
          }
        />

        <Route
          path="/executive"
          element={
            <RoleGuard allow={['executive']}>
              <ExecutiveDashboard />
            </RoleGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleGuard allow={['administrator']}>
              <AdminConsole />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
