import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loading } from './PageState.jsx'

export default function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // A signed-in reader who isn't an administrator goes to their own home rather
  // than a dead end. The API enforces this too — this is only the UI half.
  if (!isAdmin) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
