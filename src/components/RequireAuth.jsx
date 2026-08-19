import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loading } from './PageState.jsx'

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Waiting on the session check matters: redirecting before it resolves would
  // bounce a signed-in reader to the login screen on every refresh.
  if (loading) return <Loading />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
