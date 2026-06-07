import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useContractStore } from '@/store/contractStore'
import { formatCurrency, formatDate, getDaysBadge } from '@/utils/format'
import { CONTRACT_STATUS_MAP } from '@/types'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

const COLORS = ['#1e3a5f', '#3b82f6', '#f59e0b', '#10b981', '#ef4444']

export default function Dashboard() {
  const { stats, fetchStats } = useContractStore()

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      title: '合同总数',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/contracts'
    },
    {
      title: '进行中',
      value: stats?.active || 0,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      link: '/contracts?status=active'
    },
    {
      title: '即将到期',
      value: stats?.upcoming || 0,
      icon: Clock,
      color: 'bg-amber-500',
      link: '/reminders'
    },
    {
      title: '已逾期',
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/reminders?tab=overdue'
    }
  ]

  const typeChartData = stats?.typeStats.map(t => ({
    name: t.type,
    value: t.count,
    amount: t.amount
  })) || []

  const monthlyData = stats?.monthly.map(m => ({
    month: m.month,
    count: m.count,
    amount: (m.amount / 10000).toFixed(1)
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">合同管理概览与关键指标</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                <span>查看详情</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">合同类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {typeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value}份 (${formatCurrency(props.payload.amount)})`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">近6个月合同趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="合同数量"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  dot={{ fill: '#1e3a5f' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="金额(万元)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">合同总金额</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(stats?.totalAmount || 0)}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
