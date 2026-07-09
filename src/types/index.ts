export interface Contract {
  id: number
  project_id: number | null
  contract_no: string
  name: string
  type: string
  customer: string
  amount: number
  sign_date: string | null
  effective_date: string | null
  expiry_date: string
  status: 'draft' | 'active' | 'completed' | 'overdue' | 'terminated'
  payment_terms: string
  remark: string
  attachment: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: number
  contract_id: number
  name: string
  due_date: string
  amount: number
  status: 'pending' | 'completed' | 'overdue'
  remark: string
  completed_at: string | null
  contract_name?: string
  contract_no?: string
}

export interface LogEntry {
  id: number
  contract_id: number
  action: string
  operator: string
  detail: string
  created_at: string
}

export interface ContractDetail extends Contract {
  milestones: Milestone[]
  logs: LogEntry[]
}

export interface ContractStats {
  total: number
  active: number
  overdue: number
  completed: number
  upcoming: number
  totalAmount: number
  typeStats: { type: string; count: number; amount: number }[]
  monthly: { month: string; count: number; amount: number }[]
}

export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const CONTRACT_TYPES = ['采购', '销售', '服务', '租赁', '其他']

export const CONTRACT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  active: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  overdue: { label: '已逾期', color: 'bg-red-100 text-red-700' },
  terminated: { label: '已终止', color: 'bg-gray-100 text-gray-700' }
}

export const MILESTONE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待完成', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  overdue: { label: '已逾期', color: 'bg-red-100 text-red-700' }
}

export interface Project {
  id: number
  project_no: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'terminated'
  total_amount: number
  start_date: string | null
  end_date: string | null
  manager_id: number | null
  manager_name?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectPartner {
  id: number
  project_id: number
  party_role: string
  name: string
  contact_person: string
  contact_phone: string
  email: string
  address: string
  description: string
  sort_order: number
}

export interface ProjectMember {
  id: number
  project_id: number
  user_id: number
  user_name?: string
  role_title: string
  share_percent: number
}

export interface ProjectPermission {
  id: number
  project_id: number
  user_id: number
  user_name?: string
  can_view: number
  can_edit: number
  can_delete: number
  can_manage_members: number
  can_manage_partners: number
  can_manage_finance: number
  can_manage_milestones: number
}

export interface ProjectMilestone {
  id: number
  project_id: number
  name: string
  due_date: string
  amount: number
  status: 'pending' | 'completed' | 'overdue'
  remark: string
  completed_at: string | null
}

export interface ProjectLog {
  id: number
  project_id: number
  action: string
  operator: string
  detail: string
  created_at: string
}

export interface ProjectDetail extends Project {
  partners: ProjectPartner[]
  members: ProjectMember[]
  permissions: ProjectPermission[]
  milestones: ProjectMilestone[]
  logs: ProjectLog[]
  contracts?: Contract[]
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  totalAmount: number
}

export const PROJECT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-700' },
  terminated: { label: '已终止', color: 'bg-gray-100 text-gray-700' }
}

export const PARTY_ROLES = ['甲方', '乙方', '丙方', '丁方', '监理方', '供货方', '服务方']
