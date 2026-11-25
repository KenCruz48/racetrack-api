import axios from 'axios'

export const sessionKey = 'racetrack.jwt'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(sessionKey)
  if (token && config.url !== '/users/login') {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

export function errorMessage(error) {
  return error.response?.data?.message || 'No pudimos conectar con RaceTrack. Intenta nuevamente.'
}
