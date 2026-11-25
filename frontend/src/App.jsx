import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Events from './pages/Events'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ranking from './pages/Ranking'

export default function App() {
  return <><Navbar /><main className="shell content"><Routes>
    <Route index element={<Events />} />
    <Route path="ingresar" element={<Login />} />
    <Route path="clasificacion/:id" element={<Ranking />} />
    <Route element={<ProtectedRoute />}><Route path="mi-cuenta" element={<Dashboard />} /></Route>
    <Route path="*" element={<><h1>Página no encontrada</h1><Link to="/">Volver a carreras</Link></>} />
  </Routes></main></>
}
