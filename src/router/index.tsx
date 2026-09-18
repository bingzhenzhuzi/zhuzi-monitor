import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/feedback'
import { AppLayout } from '../components/layout/AppLayout'
import { Login } from '../pages/Login'
import { Dashboard } from '../pages/Dashboard'
import { DeviceList } from '../pages/DeviceList'
import { DeviceDetail } from '../pages/DeviceDetail'
import { HistoryData } from '../pages/HistoryData'
import { DeviceMap } from '../pages/DeviceMap'
import { AlertCenter } from '../pages/AlertCenter'
import { CalendarNotes } from '../pages/CalendarNotes'
import { Memos } from '../pages/Memos'
import { NotFound } from '../pages/NotFound'

/** 登录保护：未登录跳转到登录页 */
function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'devices', element: <DeviceList /> },
          { path: 'devices/:id', element: <DeviceDetail /> },
          { path: 'history', element: <HistoryData /> },
          { path: 'map', element: <DeviceMap /> },
          { path: 'alerts', element: <AlertCenter /> },
          { path: 'calendar', element: <CalendarNotes /> },
          { path: 'memos', element: <Memos /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
