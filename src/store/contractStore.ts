import { create } from 'zustand'
import type { Contract, ContractDetail, ContractStats } from '@/types'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

interface ContractState {
  contracts: Contract[]
  currentContract: ContractDetail | null
  stats: ContractStats | null
  loading: boolean
  total: number
  page: number
  pageSize: number
  filters: {
    type: string
    status: string
    keyword: string
  }
  setFilters: (filters: Partial<ContractState['filters']>) => void
  setPage: (page: number) => void
  fetchContracts: () => Promise<void>
  fetchContract: (id: number) => Promise<void>
  fetchStats: () => Promise<void>
  createContract: (data: any) => Promise<boolean>
  updateContract: (id: number, data: any) => Promise<boolean>
  deleteContract: (id: number) => Promise<boolean>
  updateMilestone: (contractId: number, milestoneId: number, status: string) => Promise<boolean>
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  currentContract: null,
  stats: null,
  loading: false,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: { type: 'all', status: 'all', keyword: '' },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 }))
    get().fetchContracts()
  },

  setPage: (page) => {
    set({ page })
    get().fetchContracts()
  },

  fetchContracts: async () => {
    set({ loading: true })
    try {
      const { filters, page, pageSize } = get()
      const params = new URLSearchParams()
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.keyword) params.append('keyword', filters.keyword)
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))

      const res = await fetch(`/api/contracts?${params}`, { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({
          contracts: json.data.list,
          total: json.data.total,
          page: json.data.page,
          pageSize: json.data.pageSize
        })
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchContract: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/contracts/${id}`, { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({ currentContract: json.data })
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch('/api/contracts/stats', { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        set({ stats: json.data })
      }
    } catch (e) {}
  },

  createContract: async (data) => {
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) {
        get().fetchContracts()
        return true
      }
      return false
    } catch (e) {
      return false
    }
  },

  updateContract: async (id, data) => {
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) {
        get().fetchContracts()
        return true
      }
      return false
    } catch (e) {
      return false
    }
  },

  deleteContract: async (id) => {
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const json = await res.json()
      if (json.success) {
        get().fetchContracts()
        return true
      }
      return false
    } catch (e) {
      return false
    }
  },

  updateMilestone: async (contractId, milestoneId, status) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })
      const json = await res.json()
      if (json.success) {
        get().fetchContract(contractId)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }
}))
