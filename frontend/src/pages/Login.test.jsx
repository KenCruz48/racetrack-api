import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { api } from '../api/axiosClient'
import { AuthProvider } from '../store/useAuth'
import Login from './Login'

afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks() })

test('envía las credenciales y presenta el error de la API', async () => {
  const post = vi.spyOn(api, 'post').mockRejectedValue({ response: { data: { message: 'Credenciales inválidas' } } })
  render(<MemoryRouter><AuthProvider><Login /></AuthProvider></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'corredor@example.test' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
  expect((await screen.findByRole('alert')).textContent).toBe('Credenciales inválidas')
  expect(post).toHaveBeenCalledWith('/users/login', { email: 'corredor@example.test', password: 'password' })
})
