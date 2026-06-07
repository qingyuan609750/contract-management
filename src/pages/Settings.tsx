import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings2,
  Building2,
  Bell,
  Shield,
  Save,
  Users,
  KeyRound,
  ChevronRight,
  Database
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Settings() {
  const { user, changePassword } = useAuthStore()
  const [settings, setSettings] = useState({
    companyName: '科技有限公司',
    reminderDays: '7',
    emailNotification: true,
    autoRemind: true
  })
  const [saved, setSaved] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError('请填写完整')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    const result = await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    if (result.success) {
      setPasswordSuccess(true)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordError(result.error || '修改失败')
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">配置系统参数和账号管理</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {/* Company Info */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">企业信息</h3>
              <p className="text-sm text-gray-500">设置企业基本信息</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">企业名称</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={e => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>
          </div>
        </div>

        {/* User Management - Admin Only */}
        {isAdmin && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">用户管理</h3>
                <p className="text-sm text-gray-500">管理系统用户账号</p>
              </div>
              <Link
                to="/settings/users"
                className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors text-sm"
              >
                进入管理
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {/* Backup Management */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">数据备份</h3>
              <p className="text-sm text-gray-500">查看和管理自动备份文件</p>
            </div>
            <Link
              to="/settings/backup"
              className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors text-sm"
            >
              进入管理
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Change Password */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <KeyRound className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">修改密码</h3>
              <p className="text-sm text-gray-500">修改当前账号的登录密码</p>
            </div>
          </div>
          <div className="space-y-4 ml-11">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原密码</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="请输入原密码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="请输入新密码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="请再次输入新密码"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">密码修改成功</p>
            )}
            <button
              onClick={handleChangePassword}
              className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors text-sm"
            >
              确认修改
            </button>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">提醒设置</h3>
              <p className="text-sm text-gray-500">配置合同到期提醒规则</p>
            </div>
          </div>
          <div className="space-y-4 ml-11">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提前提醒天数
              </label>
              <select
                value={settings.reminderDays}
                onChange={e => setSettings(prev => ({ ...prev, reminderDays: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              >
                <option value="3">3天</option>
                <option value="7">7天</option>
                <option value="15">15天</option>
                <option value="30">30天</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">自动提醒</p>
                <p className="text-sm text-gray-500">系统自动检查并提醒即将到期的合同</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoRemind: !prev.autoRemind }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.autoRemind ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoRemind ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">数据安全</h3>
              <p className="text-sm text-gray-500">数据备份与导出设置</p>
            </div>
          </div>
          <div className="space-y-4 ml-11">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">操作日志记录</p>
                <p className="text-sm text-gray-500">记录所有合同的创建、修改和删除操作</p>
              </div>
              <div className="w-11 h-6 rounded-full bg-[#1e3a5f] relative">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full translate-x-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2">关于系统</h3>
        <div className="text-sm text-gray-500 space-y-1">
          <p>合同管理系统 v1.0</p>
          <p>数据库: SQLite</p>
          <p>技术栈: React + Express + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
