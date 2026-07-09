import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysBadge } from '@/utils/format'
import { CONTRACT_STATUS_MAP } from '@/types'
import type { Contract, Milestone } from '@/types'

interface ReminderData {
  contracts: Contract[]
  milestones: Milestone[]
}

export default function Reminders() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue'>('upcoming')
  const [data, setData] = useState<ReminderData>({ contracts: [], milestones: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/reminders/${activeTab}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'upcoming' as const, label: '即将到期', icon: Clock, count: 0 },
    { key: 'overdue' as const, label: '已逾期', icon: AlertTriangle, count: 0 }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">提醒中心</h1>
        <p className="text-gray-500 mt-1">合同到期与交付节点提醒</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {tab.label}
              {tab.key === 'upcoming' && data.contracts.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {data.contracts.length + data.milestones.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="space-y-6">
          {/* Contracts */}
          {data.contracts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {activeTab === 'upcoming' ? '即将到期的合同' : '已逾期的合同'}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {data.contracts.map((contract) => {
                  const statusInfo = CONTRACT_STATUS_MAP[contract.status]
                  const daysBadge = getDaysBadge(contract.expiry_date)
                  return (
                    <Link
                      key={contract.id}
                      to={`/contracts/${contract.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-medium text-gray-900">{contract.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                            {statusInfo?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="font-mono">{contract.contract_no}</span>
                          <span>{contract.customer}</span>
                          <span>{formatCurrency(contract.amount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${daysBadge.color}`}>
                          {daysBadge.text}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{formatDate(contract.expiry_date)}</div>
                          <div className="text-xs text-gray-400">到期日</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Milestones */}
          {data.milestones.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {activeTab === 'upcoming' ? '即将到期的节点' : '已逾期的节点'}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {data.milestones.map((milestone) => {
                  const daysBadge = getDaysBadge(milestone.due_date)
                  return (
                    <Link
                      key={milestone.id}
                      to={`/contracts/${milestone.contract_id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.name}</h4>
                          <span className="text-xs text-gray-400">
                            所属合同: {milestone.contract_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="font-mono">{milestone.contract_no}</span>
                          {milestone.amount > 0 && (
                            <span>{formatCurrency(milestone.amount)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${daysBadge.color}`}>
                          {daysBadge.text}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{formatDate(milestone.due_date)}</div>
                          <div className="text-xs text-gray-400">截止日</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {data.contracts.length === 0 && data.milestones.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'upcoming' ? '暂无即将到期的合同' : '暂无已逾期的合同'}
              </h3>
              <p className="text-gray-500 mt-1">
                {activeTab === 'upcoming'
                  ? '所有合同都在安全期内'
                  : '很好，所有合同都已按时处理'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
