import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Users, FileText, ClipboardList, Landmark, Shield, Clock } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/utils/format'
import { PROJECT_STATUS_MAP, MILESTONE_STATUS_MAP } from '@/types'

const TABS = [
  { key: 'overview', label: '概览', icon: ClipboardList },
  { key: 'partners', label: '合作方', icon: Landmark },
  { key: 'members', label: '成员与分成', icon: Users },
  { key: 'permissions', label: '权限细则', icon: Shield },
  { key: 'milestones', label: '里程碑', icon: Clock },
  { key: 'contracts', label: '关联合同', icon: FileText },
]

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentProject, loading, fetchProject, updateMilestone } = useProjectStore()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) fetchProject(Number(id))
  }, [id])

  const isAdmin = user?.role === 'admin'
  const isCreator = currentProject?.created_by === user?.name
  const isManager = currentProject?.manager_id === user?.id
  const canEdit = isAdmin || isCreator || isManager

  const handleMilestoneStatus = async (milestoneId: number, status: string) => {
    if (!id) return
    await updateMilestone(Number(id), milestoneId, status)
  }

  if (loading || !currentProject) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>
  }

  const statusInfo = PROJECT_STATUS_MAP[currentProject.status]
  const shareTotal = currentProject.members.reduce((sum, m) => sum + Number(m.share_percent), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-gray-500 mt-1">{currentProject.project_no}</p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
            {statusInfo?.label}
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            编辑项目
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#1e3a5f] text-[#1e3a5f]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-500">项目编号</div>
                  <div className="text-gray-900">{currentProject.project_no}</div>
                  <div className="text-gray-500">项目名称</div>
                  <div className="text-gray-900">{currentProject.name}</div>
                  <div className="text-gray-500">项目状态</div>
                  <div className="text-gray-900">{statusInfo?.label}</div>
                  <div className="text-gray-500">负责人</div>
                  <div className="text-gray-900">{currentProject.manager_name || '-'}</div>
                  <div className="text-gray-500">创建人</div>
                  <div className="text-gray-900">{currentProject.created_by}</div>
                  <div className="text-gray-500">开始日期</div>
                  <div className="text-gray-900">{formatDate(currentProject.start_date)}</div>
                  <div className="text-gray-500">结束日期</div>
                  <div className="text-gray-900">{formatDate(currentProject.end_date)}</div>
                  <div className="text-gray-500">总金额</div>
                  <div className="text-gray-900 font-medium">{formatCurrency(currentProject.total_amount)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">项目描述</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{currentProject.description || '暂无描述'}</p>
                <h3 className="font-semibold text-gray-900 pt-4">成员分成统计</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">已分配比例</span>
                    <span className={`font-medium ${shareTotal > 100 ? 'text-red-600' : 'text-gray-900'}`}>{shareTotal}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">未分配比例</span>
                    <span className="font-medium text-gray-900">{Math.max(0, 100 - shareTotal)}%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">参与成员</span>
                    <span className="font-medium text-gray-900">{currentProject.members.length} 人</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-4">
              {currentProject.partners.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无合作方</p>
              ) : (
                currentProject.partners.map((partner) => (
                  <div key={partner.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-[#1e3a5f] text-white text-xs rounded">{partner.party_role}</span>
                      <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                      {partner.contact_person && <div className="text-gray-600">联系人：{partner.contact_person}</div>}
                      {partner.contact_phone && <div className="text-gray-600">电话：{partner.contact_phone}</div>}
                      {partner.email && <div className="text-gray-600">邮箱：{partner.email}</div>}
                      {partner.address && <div className="text-gray-600">地址：{partner.address}</div>}
                    </div>
                    {partner.description && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">{partner.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {currentProject.members.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无成员</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">成员</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">项目角色</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">分成比例</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">预计金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentProject.members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{member.user_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{member.role_title}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{member.share_percent}%</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency((currentProject.total_amount * member.share_percent) / 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              {currentProject.permissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">未设置特殊权限（管理员/负责人拥有全部权限）</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">员工</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">查看</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">编辑</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">删除</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">管理成员</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">管理合作方</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">管理资金</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">管理里程碑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentProject.permissions.map((perm) => (
                        <tr key={perm.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{perm.user_name}</td>
                          {(['can_view', 'can_edit', 'can_delete', 'can_manage_members', 'can_manage_partners', 'can_manage_finance', 'can_manage_milestones'] as const).map((key) => (
                            <td key={key} className="px-4 py-3 text-center">
                              <span className={`inline-block w-2 h-2 rounded-full ${perm[key] ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              {currentProject.milestones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无里程碑</p>
              ) : (
                <div className="space-y-3">
                  {currentProject.milestones.map((milestone) => {
                    const msStatus = MILESTONE_STATUS_MAP[milestone.status]
                    return (
                      <div key={milestone.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                        <div>
                          <div className="font-medium text-gray-900">{milestone.name}</div>
                          <div className="text-sm text-gray-500 mt-1">截止：{formatDate(milestone.due_date)}</div>
                          {milestone.remark && <div className="text-sm text-gray-500">{milestone.remark}</div>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(milestone.amount)}</div>
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${msStatus?.color}`}>
                              {msStatus?.label}
                            </span>
                          </div>
                          {canEdit && milestone.status !== 'completed' && (
                            <button
                              onClick={() => handleMilestoneStatus(milestone.id, 'completed')}
                              className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              完成
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-4">
              {(!currentProject.contracts || currentProject.contracts.length === 0) ? (
                <p className="text-gray-500 text-center py-8">暂无关联合同</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">合同编号</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">合同名称</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">金额</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">到期日</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentProject.contracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <Link to={`/contracts/${contract.id}`} className="text-[#1e3a5f] hover:underline">{contract.contract_no}</Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{contract.name}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(contract.amount)}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(contract.expiry_date)}</td>
                          <td className="px-4 py-3 text-sm">{contract.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">操作日志</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {currentProject.logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无日志</p>
          ) : (
            currentProject.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-3 last:border-0">
                <div className="w-16 text-xs text-gray-400 shrink-0">{new Date(log.created_at).toLocaleDateString('zh-CN')}</div>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{log.action}</span>
                  <span className="text-gray-500 ml-2">{log.detail}</span>
                </div>
                <div className="text-xs text-gray-400">{log.operator}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
