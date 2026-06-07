import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit2,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle
} from 'lucide-react'
import { useContractStore } from '@/store/contractStore'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'
import { CONTRACT_STATUS_MAP, MILESTONE_STATUS_MAP } from '@/types'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentContract, fetchContract, updateMilestone } = useContractStore()

  useEffect(() => {
    if (id) fetchContract(Number(id))
  }, [id])

  if (!currentContract) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  const statusInfo = CONTRACT_STATUS_MAP[currentContract.status]

  const handleMilestoneStatus = async (milestoneId: number, status: string) => {
    if (id) {
      await updateMilestone(Number(id), milestoneId, status)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contracts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{currentContract.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
                {statusInfo?.label}
              </span>
            </div>
            <p className="text-gray-500 mt-1 font-mono">{currentContract.contract_no}</p>
          </div>
        </div>
        <Link
          to={`/contracts/${currentContract.id}/edit`}
          className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          编辑合同
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#1e3a5f]" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">合同类型</label>
                  <p className="text-base font-medium text-gray-900 mt-1">{currentContract.type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">客户/供应商</label>
                  <p className="text-base font-medium text-gray-900 mt-1 flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                    {currentContract.customer}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">合同金额</label>
                  <p className="text-base font-medium text-gray-900 mt-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    {formatCurrency(currentContract.amount)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">签订日期</label>
                  <p className="text-base font-medium text-gray-900 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(currentContract.sign_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">生效日期</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formatDate(currentContract.effective_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">到期日期</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formatDate(currentContract.expiry_date)}
                  </p>
                </div>
              </div>
            </div>
            {currentContract.payment_terms && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="text-sm text-gray-500">付款条款</label>
                <p className="text-base text-gray-900 mt-1">{currentContract.payment_terms}</p>
              </div>
            )}
            {currentContract.remark && (
              <div className="mt-4">
                <label className="text-sm text-gray-500">备注</label>
                <p className="text-base text-gray-900 mt-1">{currentContract.remark}</p>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#1e3a5f]" />
              交付节点
            </h2>
            {currentContract.milestones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无交付节点</p>
            ) : (
              <div className="space-y-4">
                {currentContract.milestones.map((milestone, index) => {
                  const msStatus = MILESTONE_STATUS_MAP[milestone.status]
                  return (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : milestone.status === 'overdue' ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{milestone.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${msStatus?.color}`}>
                            {msStatus?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>截止: {formatDate(milestone.due_date)}</span>
                          {milestone.amount > 0 && (
                            <span>金额: {formatCurrency(milestone.amount)}</span>
                          )}
                        </div>
                        {milestone.remark && (
                          <p className="text-sm text-gray-500 mt-1">{milestone.remark}</p>
                        )}
                      </div>
                      {milestone.status === 'pending' && (
                        <button
                          onClick={() => handleMilestoneStatus(milestone.id, 'completed')}
                          className="flex-shrink-0 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          标记完成
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">合同信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">创建人</span>
                <span className="text-gray-900 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {currentContract.created_by}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900">{formatDateTime(currentContract.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">更新时间</span>
                <span className="text-gray-900">{formatDateTime(currentContract.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">操作记录</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentContract.logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {log.operator} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
