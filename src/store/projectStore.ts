import { create } from 'zustand'
import type { Project, ProjectDetail, ProjectStats } from '@/types'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

interface ProjectState {
  projects: Project[]
  currentProject: ProjectDetail | null
  stats: ProjectStats | null
  users: { id: number; username: string; name: string; role: string }[]
  loading: boolean
  total: number
  page: number
  pageSize: number
  filters: {
    status: string
    keyword: string
  }
  setFilters: (filters: Partial<ProjectState['filters']>) => void
  setPage: (page: number) => void
  fetchProjects: () => Promise<void>
  fetchProject: (id: number) => Promise<void>
  fetchStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  createProject: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; id?: number }>
  updateProject: (id: number, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  deleteProject: (id: number) => Promise<boolean>
  updateMilestone: (projectId: number, milestoneId: number, status: string) => Promise<boolean>
  getMyPermissions: (projectId: number) => Promise<Record<string, number> | null>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  stats: null,
  users: [],
  loading: false,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: { status: 'all', keyword: '' },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 }))
    get().fetchProjects()
  },

  setPage: (page) => {
    set({ page })
    get().fetchProjects()
  },

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const { filters, page, pageSize } = get()
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.keyword) params.append('keyword', filters.keyword)
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))

      const res = await fetch(`/api/projects?${params}`, { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({
          projects: json.data.list,
          total: json.data.total,
          page: json.data.page,
          pageSize: json.data.pageSize
        })
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchProject: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/projects/${id}`, { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({ currentProject: json.data })
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch('/api/projects/stats', { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({ stats: json.data })
      }
    } catch { /* ignore */ }
  },

  fetchUsers: async () => {
    try {
      const res = await fetch('/api/projects/users/list', { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({ users: json.data })
      }
    } catch { /* ignore */ }
  },

  createProject: async (data) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) {
        get().fetchProjects()
        return { success: true, id: json.data.id }
      }
      return { success: false, error: json.error }
    } catch {
      return { success: false, error: '网络错误' }
    }
  },

  updateProject: async (id, data) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) {
        get().fetchProjects()
        return { success: true }
      }
      return { success: false, error: json.error }
    } catch {
      return { success: false, error: '网络错误' }
    }
  },

  deleteProject: async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const json = await res.json()
      if (json.success) {
        get().fetchProjects()
        return true
      }
      return false
    } catch {
      return false
    }
  },

  updateMilestone: async (projectId, milestoneId, status) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })
      const json = await res.json()
      if (json.success) {
        get().fetchProject(projectId)
        return true
      }
      return false
    } catch {
      return false
    }
  },

  getMyPermissions: async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/permissions/me`, { headers: getAuthHeaders() })
      const json = await res.json()
      return json.success ? json.data : null
    } catch {
      return null
    }
  }
}))
