import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Users, Landmark, Shield, Clock, ClipboardList } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { PARTY_ROLES, PROJECT_STATUS_MAP } from '@/types'

interface PartnerForm {
  id?: number
  party_role: string
  name: string
  contact_person: string
  contact_phone: string
  email: string
  address: string
  description: string
}

interface MemberForm {
  id?: number
  user_id: number
  role_title: string
  share_percent: number
}

interface PermissionForm {
  id?: number
  user_id: number
  can_view: boolean
  can_edit: boolean
  can_delete: boolean
  can_manage_members: boolean
  can_manage_partners: boolean
  can_manage_finance: boolean
  can_manage_milestones: boolean
}

interface MilestoneForm {
  id?: number
  name: string
  due_date: string
  amount: number
  status: string
  remark: string
}

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { currentProject, loading, users, fetchProject, fetchUsers, createProject, updateProject } = useProjectStore()

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    total_amount: '',
    start_date: '',
    end_date: '',
    manager_id: ''
  })
  const [partners, setPartners] = useState<PartnerForm[]>([])
  const [members, setMembers] = useState<MemberForm[]>([])
  const [permissions, setPermissions] = useState<PermissionForm[]>([])
  const [milestones, setMilestones] = useState<MilestoneForm[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('basic')

  useEffect(() => {
    fetchUsers()
    if (isEdit) {
      fetchProject(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (isEdit && currentProject) {
      setForm({
        name: currentProject.name,
        description: currentProject.description || '',
        status: currentProject.status,
        total_amount: String(currentProject.total_amount || ''),
        start_date: currentProject.start_date || '',
        end_date: currentProject.end_date || '',
        manager_id: currentProject.manager_id ? String(currentProject.manager_id) : ''
      })
      setPartners(currentProject.partners.map(p => ({ ...p, description: p.description || '' })))
      setMembers(currentProject.members.map(m => ({ ...m, user_id: m.user_id, role_title: m.role_title || '', share_percent: Number(m.share_percent) || 0 })))
      setPermissions(currentProject.permissions.map(p => ({
        ...p,
        can_view: !!p.can_view,
        can_edit: !!p.can_edit,
        can_delete: !!p.can_delete,
        can_manage_members: !!p.can_manage_members,
        can_manage_partners: !!p.can_manage_partners,
        can_manage_finance: !!p.can_manage_finance,
        can_manage_milestones: !!p.can_manage_milestones
      })))
      setMilestones(currentProject.milestones.map(m => ({ ...m, amount: Number(m.amount) || 0 })))
    }
  }, [currentProject, isEdit])

  const addPartner = () => {
    setPartners([...partners, { party_role: '甲方', name: '', contact_person: '', contact_phone: '', email: '', address: '', description: '' }])
  }

  const updatePartner = (index: number, field: keyof PartnerForm, value: string) => {
    const next = [...partners]
    next[index] = { ...next[index], [field]: value }
    setPartners(next)
  }

  const removePartner = (index: number) => {
    setPartners(partners.filter((_, i) => i !== index))
  }

  const addMember = () => {
    setMembers([...members, { user_id: users[0]?.id || 0, role_title: '', share_percent: 0 }])
  }

  const updateMember = (index: number, field: keyof MemberForm, value: string | number) => {
    const next = [...members]
    next[index] = { ...next[index], [field]: value }
    setMembers(next)
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const shareTotal = members.reduce((sum, m) => sum + (Number(m.share_percent) || 0), 0)

  const addPermission = () => {
    const availableUser = users.find(u => !permissions.some(p => p.user_id === u.id))
    if (availableUser) {
      setPermissions([...permissions, {
        user_id: availableUser.id,
        can_view: true, can_edit: false, can_delete: false,
        can_manage_members: false, can_manage_partners: false,
        can_manage_finance: false, can_manage_milestones: false
      }])
    }
  }

  const updatePermission = (index: number, field: keyof PermissionForm, value: string | number | boolean) => {
    const next = [...permissions]
    next[index] = { ...next[index], [field]: value }
    setPermissions(next)
  }

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index))
  }

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', due_date: '', amount: 0, status: 'pending', remark: '' }])
  }

  const updateMilestone = (index: number, field: keyof MilestoneForm, value: string | number) => {
    const next = [...milestones]
    next[index] = { ...next[index], [field]: value }
    setMilestones(next)
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const validate = () => {
    if (!form.name.trim()) return '请输入项目名称'
    if (shareTotal > 100) return `分成比例总和不能超过100%，当前为${shareTotal}%`
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
      total_amount: Number(form.total_amount) || 0,
      start_date: form.start_date,
      end_date: form.end_date,
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      partners: partners.filter(p => p.name.trim()).map(p => ({
        party_role: p.party_role,
        name: p.name,
        contact_person: p.contact_person,
        contact_phone: p.contact_phone,
        email: p.email,
        address: p.address,
        description: p.description
      })),
      members: members.filter(m => m.user_id).map(m => ({
        user_id: m.user_id,
        role_title: m.role_title,
        share_percent: Number(m.share_percent) || 0
      })),
      permissions: permissions.filter(p => p.user_id).map(p => ({
        user_id: p.user_id,
        can_view: p.can_view,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
        can_manage_members: p.can_manage_members,
        can_manage_partners: p.can_manage_partners,
        can_manage_finance: p.can_manage_finance,
        can_manage_milestones: p.can_manage_milestones
      })),
      milestones: milestones.filter(m => m.name.trim()).map(m => ({
        name: m.name,
        due_date: m.due_date,
        amount: Number(m.amount) || 0,
        status: m.status,
        remark: m.remark
      }))
    }

    let result
    if (isEdit) {
      result = await updateProject(Number(id), payload)
    } else {
      result = await createProject(payload)
    }

    setSaving(false)

    if (result.success) {
      navigate(isEdit ? `/projects/${id}` : `/projects/${result.id}`)
    } else {
      setError(result.error || '保存失败')
    }
  }

  const sections = [
    { key: 'basic', label: '基本信息', icon: ClipboardList },
    { key: 'partners', label: '合作方', icon: Landmark },
    { key: 'members', label: '成员与分成', icon: Users },
    { key: 'permissions', label: '权限细则', icon: Shield },
    { key: 'milestones', label: '里程碑', icon: Clock },
  ]

  if (isEdit && loading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? '编辑项目' : '新增项目'}</h1>
          <p className="text-gray-500 mt-1">{isEdit ? '修改项目信息、合作方、成员与权限' : '创建新项目并配置相关方'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeSection === section.key
                      ? 'border-[#1e3a5f] text-[#1e3a5f]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeSection === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  {Object.entries(PROJECT_STATUS_MAP).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <select
                  value={form.manager_id}
                  onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  <option value="">请选择</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">总金额</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
            </div>
          )}

          {activeSection === 'partners' && (
            <div className="space-y-4">
              {partners.map((partner, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">合作方 {index + 1}</h4>
                    <button type="button" onClick={() => removePartner(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={partner.party_role}
                      onChange={(e) => updatePartner(index, 'party_role', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    >
                      {PARTY_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="合作方名称"
                      value={partner.name}
                      onChange={(e) => updatePartner(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <input
                      type="text"
                      placeholder="联系人"
                      value={partner.contact_person}
                      onChange={(e) => updatePartner(index, 'contact_person', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <input
                      type="text"
                      placeholder="联系电话"
                      value={partner.contact_phone}
                      onChange={(e) => updatePartner(index, 'contact_phone', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <input
                      type="email"
                      placeholder="邮箱"
                      value={partner.email}
                      onChange={(e) => updatePartner(index, 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <input
                      type="text"
                      placeholder="地址"
                      value={partner.address}
                      onChange={(e) => updatePartner(index, 'address', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                  </div>
                  <textarea
                    placeholder="合作方介绍（公司背景、业务范围、合作内容等）"
                    value={partner.description}
                    onChange={(e) => updatePartner(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addPartner}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加合作方
              </button>
            </div>
          )}

          {activeSection === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  分成比例总计：<span className={`font-medium ${shareTotal > 100 ? 'text-red-600' : 'text-gray-900'}`}>{shareTotal}%</span>
                </div>
              </div>
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                  <select
                    value={member.user_id}
                    onChange={(e) => updateMember(index, 'user_id', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="项目角色/分工"
                    value={member.role_title}
                    onChange={(e) => updateMember(index, 'role_title', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="分成%"
                      value={member.share_percent}
                      onChange={(e) => updateMember(index, 'share_percent', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <button type="button" onClick={() => removeMember(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加成员
              </button>
            </div>
          )}

          {activeSection === 'permissions' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">为指定员工设置项目级细粒度权限。管理员和负责人默认拥有全部权限。</p>
              {permissions.map((perm, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={perm.user_id}
                      onChange={(e) => updatePermission(index, 'user_id', Number(e.target.value))}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    >
                      {users.filter(u => u.id === perm.user_id || !permissions.some(p => p.user_id === u.id)).map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removePermission(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([
                      { key: 'can_view', label: '查看项目' },
                      { key: 'can_edit', label: '编辑项目' },
                      { key: 'can_delete', label: '删除项目' },
                      { key: 'can_manage_members', label: '管理成员' },
                      { key: 'can_manage_partners', label: '管理合作方' },
                      { key: 'can_manage_finance', label: '管理资金' },
                      { key: 'can_manage_milestones', label: '管理里程碑' },
                    ] as { key: keyof PermissionForm; label: string }[]).map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={perm[key] as boolean}
                          onChange={(e) => updatePermission(index, key, e.target.checked)}
                          className="rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPermission}
                disabled={permissions.length >= users.length}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加权限配置
              </button>
            </div>
          )}

          {activeSection === 'milestones' && (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 border border-gray-200 rounded-lg p-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">里程碑名称</label>
                    <input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">截止日期</label>
                    <input
                      type="date"
                      value={milestone.due_date}
                      onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">金额</label>
                    <input
                      type="number"
                      step="0.01"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => removeMilestone(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加里程碑
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
