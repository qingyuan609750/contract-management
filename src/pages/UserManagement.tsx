import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { formatDateTime } from '@/utils/format'

interface SystemUser {
  id: number
  username: string
  name: string
  role: string
  active: number
  created_at: string
}

export default function UserManagement() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)

  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'user' })
  const [resetPassword, setResetPassword] = useState('')
  const [error, setError] = useState('')

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        setUsers(json.data)
      } else if (json.error === '无权限') {
        setError('您没有管理员权限')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.username || !form.name || !form.password) {
      setError('请填写完整信息')
      return
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (json.success) {
        setShowAddModal(false)
        setForm({ username: '', name: '', password: '', role: 'user' })
        fetchUsers()
      } else {
        setError(json.error)
      }
    } catch {
      setError('创建失败')
    }
  }

  const handleToggleActive = async (user: SystemUser) => {
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: user.name,
          role: user.role,
          active: !user.active
        })
      })
      fetchUsers()
    } catch { /* ignore */ }
  }

  const handleResetPassword = async () => {
    setError('')
    if (!resetPassword) {
      setError('请输入新密码')
      return
    }
    try {
      const res = await fetch(`/api/users/${selectedUser?.id}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: resetPassword })
      })
      const json = await res.json()
      if (json.success) {
        setShowResetModal(false)
        setResetPassword('')
        setSelectedUser(null)
      } else {
        setError(json.error)
      }
    } catch {
      setError('重置失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该用户？')) return
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      fetchUsers()
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-500 mt-1">管理系统用户账号</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">用户名</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">姓名</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">角色</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无用户</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.active ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.active
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={u.active ? '禁用' : '启用'}
                        >
                          {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setSelectedUser(u); setShowResetModal(true); setError('') }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="重置密码"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加用户</h3>
              <button onClick={() => { setShowAddModal(false); setError('') }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  placeholder="如：zhangsan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  placeholder="如：张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  placeholder="初始密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleCreate}
                className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors font-medium"
              >
                创建用户
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">重置密码</h3>
              <button onClick={() => { setShowResetModal(false); setError('') }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              为用户 <span className="font-medium text-gray-900">{selectedUser.name}</span> 设置新密码
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="新密码"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleResetPassword}
                className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors font-medium"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
