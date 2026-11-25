import { createContext, useContext, useEffect, useState } from 'react'
import { api, sessionKey } from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(() => Boolean(sessionStorage.getItem(sessionKey)))
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sessionStorage.getItem(sessionKey)) return
    const controller = new AbortController()
    api.get('/users/me', { signal: controller.signal }).then(({ data }) => {
      setUser(data.data.user)
      setChecking(false)
    }).catch((failure) => {
      if (controller.signal.aborted) return
      if (failure.response?.status === 401) sessionStorage.removeItem(sessionKey)
      else setError(true)
      setChecking(false)
    })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setError(false)
    setChecking(true)
    setAttempt((value) => value + 1)
  }

  async function login(credentials) {
    const { data } = await api.post('/users/login', credentials)
    sessionStorage.setItem(sessionKey, data.data.token)
    setUser(data.data.user)
    setError(false)
  }

  function logout() {
    sessionStorage.removeItem(sessionKey)
    setUser(null)
    setError(false)
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, (failure) => {
      const sent = failure.config?.headers?.get('Authorization')
      if (failure.response?.status === 401 && sent && sent === `Bearer ${sessionStorage.getItem(sessionKey)}`) {
        logout()
      }
      return Promise.reject(failure)
    })
    return () => api.interceptors.response.eject(interceptor)
  }, [])

  return <AuthContext.Provider value={{ user, checking, error, retry, login, logout }}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
