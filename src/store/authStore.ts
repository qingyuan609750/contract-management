import { create } from 'zustand'

export interface User {
  id: number
  username: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,

  login: async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const json = await res.json()
      if (json.success) {
        localStorage.setItem('token', json.data.token)
        set({ token: json.data.token, user: json.data.user, isAuthenticated: true })
        return { success: true }
      }
      return { success: false, error: json.error }
    } catch (e) {
      return { success: false, error: '网络错误' }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false })
      return false
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) {
        set({ token, user: json.data, isAuthenticated: true })
        return true
      }
      localStorage.removeItem('token')
      set({ token: null, user: null, isAuthenticated: false })
      return false
    } catch (e) {
      set({ isAuthenticated: false })
      return false
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
      })
      const json = await res.json()
      if (json.success) {
        return { success: true }
      }
      return { success: false, error: json.error }
    } catch (e) {
      return { success: false, error: '网络错误' }
    }
  }
}))
