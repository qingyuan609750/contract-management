import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { formatCurrency, formatDate } from '@/utils/format'
import { PROJECT_STATUS_MAP } from '@/types'

export default function ProjectList() {
  const navigate = useNavigate()
  const {
    projects, total, page, pageSize, filters, loading,
    setFilters, setPage, fetchProjects, deleteProject
  } = useProjectStore()

  const [showFilters, setShowFilters] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [page, pageSize])

  const handleDelete = async (id: number) => {
    if (await deleteProject(id)) {
      setDeleteId(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const exportToCsv = () => {
    const headers = ['项目编号', '项目名称', '状态', '总金额', '开始日期', '结束日期', '负责人']
    const rows = projects.map(p => [
      p.project_no, p.name, PROJECT_STATUS_MAP[p.status]?.label || p.status,
      p.total_amount, p.start_date || '', p.end_date || '', p.manager_name || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `项目列表_${new Date().toLocaleDateString('zh-CN')}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-500 mt-1">管理公司项目、合作方、成员与分成</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCsv}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </button>
          <Link
            to="/projects/new"
            className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增项目
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索项目编号、名称..."
                value={filters.keyword}
                onChange={(e) => setFilters({ keyword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="all">全部状态</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="paused">已暂停</option>
              <option value="terminated">已终止</option>
            </select>
            <button
              onClick={() => setFilters({ status: 'all', keyword: '' })}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              重置筛选
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">项目编号</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">项目名称</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">总金额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">开始/结束日期</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">负责人</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无项目数据</td></tr>
              ) : (
                projects.map((project) => {
                  const statusInfo = PROJECT_STATUS_MAP[project.status]
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">{project.project_no}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{project.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                          {statusInfo?.label || project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-mono font-medium text-gray-900">{formatCurrency(project.total_amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(project.start_date)} ~ {formatDate(project.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{project.manager_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/projects/${project.id}/edit`)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(project.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {total} 条记录，第 {page}/{totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            <p className="text-gray-500 mt-2">删除后无法恢复，是否继续？</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
