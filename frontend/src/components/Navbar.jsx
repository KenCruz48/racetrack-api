import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  return <header className="top"><nav className="shell nav" aria-label="Principal">
    <Link to="/" className="brand">RaceTrack<span>.</span></Link>
    <div className="nav-links"><NavLink to="/">Carreras</NavLink>
      {user ? <><NavLink to="/mi-cuenta">Mi cuenta</NavLink><button type="button" className="ghost" onClick={logout}>Cerrar sesión</button></>
        : <NavLink to="/ingresar">Iniciar sesión</NavLink>}
    </div>
  </nav></header>
}
