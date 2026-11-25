import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function ProtectedRoute() {
  const { user, checking, error, retry } = useAuth()
  const location = useLocation()
  if (checking) return <p role="status">Validando sesión…</p>
  if (error) return <div><p role="alert">No pudimos validar tu sesión.</p><button onClick={retry}>Reintentar</button></div>
  return user ? <Outlet /> : <Navigate replace to="/ingresar" state={{ from: location.pathname + location.search }} />
}
