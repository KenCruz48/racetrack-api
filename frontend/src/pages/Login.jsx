import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { errorMessage } from '../api/axiosClient'
import { useAuth } from '../store/useAuth'

export default function Login() {
  const { user, login, checking } = useAuth()
  const { state } = useLocation()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await login(Object.fromEntries(new FormData(event.currentTarget)))
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setPending(false)
    }
  }

  if (checking) return <p role="status">Validando sesión…</p>
  if (user) return <Navigate replace to={state?.from || '/mi-cuenta'} />
  return <section className="panel form-panel">
    <h1>Iniciar sesión</h1>
    <form onSubmit={submit}>
      <label>Correo electrónico<input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></label>
      <label>Contraseña<input id="password" name="password" type="password" autoComplete="current-password" required /></label>
      <button id="login" disabled={pending}>{pending ? 'Ingresando…' : 'Ingresar'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  </section>
}
