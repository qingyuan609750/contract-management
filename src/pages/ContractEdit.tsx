import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save
} from 'lucide-react'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { CONTRACT_TYPES, CONTRACT_STATUS_MAP } from '@/types'

interface FormData {
  project_id: string
  contract_no: string
  name: string
  type: string
  customer: string
  amount: string
  sign_date: string
  effective_date: string
  expiry_date: string
  status: string
  payment_terms: string
  remark: string
  milestones: MilestoneForm[]
}

interface MilestoneForm {
  id?: number
  name: string
  due_date: string
  amount: string
  status: string
  remark: string
}

const emptyForm: FormData = {
  project_id: '',
  contract_no: '',
  name: '',
  type: '服务',
  customer: '',
  amount: '',
  sign_date: '',
  effective_date: '',
  expiry_date: '',
  status: 'active',
  payment_terms: '',
  remark: '',
  milestones: []
}

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { currentContract, fetchContract, createContract, updateContract } = useContractStore()
  const { user } = useAuthStore()
  const userName = user?.name || '管理员'

  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [projects, setProjects] = useState<{ id: number; project_no: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/contracts/projects/list', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setProjects(json.data)
      })
      .catch(() => {})

    if (isEdit && id) {
      fetchContract(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (isEdit && currentContract) {
      setForm({
        project_id: currentContract.project_id ? String(currentContract.project_id) : '',
        contract_no: currentContract.contract_no,
        name: currentContract.name,
        type: currentContract.type,
        customer: currentContract.customer,
        amount: String(currentContract.amount),
        sign_date: currentContract.sign_date || '',
        effective_date: currentContract.effective_date || '',
        expiry_date: currentContract.expiry_date,
        status: currentContract.status,
        payment_terms: currentContract.payment_terms,
        remark: currentContract.remark,
        milestones: currentContract.milestones.map(m => ({
          id: m.id,
          name: m.name,
          due_date: m.due_date,
          amount: String(m.amount),
          status: m.status,
          remark: m.remark
        }))
      })
    }
  }, [currentContract])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.contract_no.trim()) errs.contract_no = '请输入合同编号'
    if (!form.name.trim()) errs.name = '请输入合同名称'
    if (!form.customer.trim()) errs.customer = '请输入客户名称'
    if (!form.expiry_date) errs.expiry_date = '请选择到期日期'
    if (!form.amount || Number(form.amount) < 0) errs.amount = '请输入有效金额'

    form.milestones.forEach((m, i) => {
      if (!m.name.trim()) errs[`milestone_${i}_name`] = '请输入节点名称'
      if (!m.due_date) errs[`milestone_${i}_due_date`] = '请选择截止日期'
    })

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSaving(true)
    const data = {
      project_id: form.project_id ? Number(form.project_id) : null,
      contract_no: form.contract_no,
      name: form.name,
      type: form.type,
      customer: form.customer,
      amount: Number(form.amount),
      sign_date: form.sign_date || null,
      effective_date: form.effective_date || null,
      expiry_date: form.expiry_date,
      status: form.status,
      payment_terms: form.payment_terms,
      remark: form.remark,
      milestones: form.milestones.map(m => ({
        id: m.id,
        name: m.name,
        due_date: m.due_date,
        amount: Number(m.amount) || 0,
        status: m.status,
        remark: m.remark
      })),
      created_by: userName,
      updated_by: userName
    }

    let success: boolean
    if (isEdit) {
      success = await updateContract(Number(id), data)
    } else {
      success = await createContract(data)
    }

    setSaving(false)
    if (success) {
      navigate('/contracts')
    }
  }

  const addMilestone = () => {
    setForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', due_date: '', amount: '', status: 'pending', remark: '' }]
    }))
  }

  const removeMilestone = (index: number) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const updateMilestone = (index: number, field: keyof MilestoneForm, value: string) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }))
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contracts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑合同' : '新增合同'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合同编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.contract_no}
                onChange={e => setForm(prev => ({ ...prev, contract_no: e.target.value }))}
                className={inputClass('contract_no')}
                placeholder="如：HT-2024-001"
              />
              {errors.contract_no && <p className="text-xs text-red-500 mt-1">{errors.contract_no}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合同名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass('name')}
                placeholder="请输入合同名称"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合同类型</label>
              <select
                value={form.type}
                onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              >
                {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户/供应商 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.customer}
                onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                className={inputClass('customer')}
                placeholder="请输入客户或供应商名称"
              />
              {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合同金额 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                className={inputClass('amount')}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合同状态</label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              >
                {Object.entries(CONTRACT_STATUS_MAP).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属项目</label>
              <select
                value={form.project_id}
                onChange={e => setForm(prev => ({ ...prev, project_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              >
                <option value="">无</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_no} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">签订日期</label>
              <input
                type="date"
                value={form.sign_date}
                onChange={e => setForm(prev => ({ ...prev, sign_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生效日期</label>
              <input
                type="date"
                value={form.effective_date}
                onChange={e => setForm(prev => ({ ...prev, effective_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到期日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={e => setForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                className={inputClass('expiry_date')}
              />
              {errors.expiry_date && <p className="text-xs text-red-500 mt-1">{errors.expiry_date}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">付款条款</label>
              <input
                type="text"
                value={form.payment_terms}
                onChange={e => setForm(prev => ({ ...prev, payment_terms: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="如：首付30%，验收后付尾款"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                value={form.remark}
                onChange={e => setForm(prev => ({ ...prev, remark: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none"
                rows={3}
                placeholder="其他补充说明..."
              />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">交付节点</h2>
            <button
              onClick={addMilestone}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加节点
            </button>
          </div>

          {form.milestones.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-400">暂无交付节点，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.milestones.map((milestone, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">节点 {index + 1}</span>
                    <button
                      onClick={() => removeMilestone(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">节点名称 *</label>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={e => updateMilestone(index, 'name', e.target.value)}
                        className={inputClass(`milestone_${index}_name`)}
                        placeholder="如：首付款、验收"
                      />
                      {errors[`milestone_${index}_name`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`milestone_${index}_name`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">截止日期 *</label>
                      <input
                        type="date"
                        value={milestone.due_date}
                        onChange={e => updateMilestone(index, 'due_date', e.target.value)}
                        className={inputClass(`milestone_${index}_due_date`)}
                      />
                      {errors[`milestone_${index}_due_date`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`milestone_${index}_due_date`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">节点金额</label>
                      <input
                        type="number"
                        value={milestone.amount}
                        onChange={e => updateMilestone(index, 'amount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">备注</label>
                      <input
                        type="text"
                        value={milestone.remark}
                        onChange={e => updateMilestone(index, 'remark', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                        placeholder="节点说明..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
