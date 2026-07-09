import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Bell,
  Settings,
  Menu,
  X,
  ChevronRight,
  FileSignature,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/contracts', label: '合同管理', icon: FileText },
  { path: '/projects', label: '项目管理', icon: FolderKanban },
  { path: '/reminders', label: '提醒中心', icon: Bell },
  { path: '/settings', label: '系统设置', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#1e3a5f] text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <FileSignature className="w-7 h-7 mr-3 flex-shrink-0" />
            <span className={`font-bold text-lg whitespace-nowrap ${!sidebarOpen && 'lg:hidden'}`}>
              合同管理系统
            </span>
          </div>

          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 mx-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`ml-3 whitespace-nowrap ${!sidebarOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {isActive && sidebarOpen && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                {user?.name?.[0] || '管'}
              </div>
              <div className={`ml-3 flex-1 min-w-0 ${!sidebarOpen && 'lg:hidden'}`}>
                <p className="text-sm font-medium">{user?.name || '管理员'}</p>
                <p className="text-xs text-white/50">{user?.username || 'admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${!sidebarOpen && 'lg:hidden'}`}
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="ml-4 text-sm text-gray-500">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
