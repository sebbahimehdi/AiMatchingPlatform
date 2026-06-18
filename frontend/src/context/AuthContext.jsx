import { startTransition, useEffect, useState } from 'react'
import api from '../api/client.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ai_matcher_token'))
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setBootstrapping(false)
        return
      }

      try {
        const { data } = await api.get('/me')

        startTransition(() => {
          setUser(data.user)
        })
      } catch {
        localStorage.removeItem('ai_matcher_token')
        setToken(null)
        setUser(null)
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [token])

  async function login(payload) {
    const { data } = await api.post('/login', payload)

    localStorage.setItem('ai_matcher_token', data.token)
    setToken(data.token)
    setUser(data.user)

    return data.user
  }

  async function register(payload, config = {}) {
    const { data } = await api.post('/register', payload, config)

    localStorage.setItem('ai_matcher_token', data.token)
    setToken(data.token)
    setUser(data.user)

    return data.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // Ignore logout transport errors and clear the local session anyway.
    } finally {
      localStorage.removeItem('ai_matcher_token')
      setToken(null)
      setUser(null)
    }
  }

  async function refreshUser() {
    if (!token) {
      return null
    }

    const { data } = await api.get('/me')
    setUser(data.user)

    return data.user
  }

  return (
    <AuthContext.Provider
      value={{
        bootstrapping,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        refreshUser,
        register,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
