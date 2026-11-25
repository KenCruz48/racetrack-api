import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { api, sessionKey } from '../api/axiosClient'
import { AuthProvider } from '../store/useAuth'
import ProtectedRoute from './ProtectedRoute'

afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks() })

function visit() {
  render(<MemoryRouter initialEntries={['/mi-cuenta']}><AuthProvider><Routes>
    <Route path="/ingresar" element={<h1>Acceso público</h1>} />
    <Route element={<ProtectedRoute />}><Route path="/mi-cuenta" element={<h1>Área privada</h1>} /></Route>
  </Routes></AuthProvider></MemoryRouter>)
}

test('redirige al visitante sin sesión', async () => {
  visit()
  expect(await screen.findByText('Acceso público')).toBeTruthy()
})

test('valida la sesión guardada antes de mostrar la ruta privada', async () => {
  sessionStorage.setItem(sessionKey, 'test-session')
  const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: { user: { id: 'test' } } } })
  visit()
  expect(screen.getByRole('status').textContent).toBe('Validando sesión…')
  expect(await screen.findByText('Área privada')).toBeTruthy()
  expect(get).toHaveBeenCalledWith('/users/me', { signal: expect.any(AbortSignal) })
})

test('elimina el token que el servidor rechaza', async () => {
  sessionStorage.setItem(sessionKey, 'expired')
  vi.spyOn(api, 'get').mockRejectedValue({ response: { status: 401 } })
  visit()
  expect(await screen.findByText('Acceso público')).toBeTruthy()
  expect(sessionStorage.getItem(sessionKey)).toBeNull()
})
