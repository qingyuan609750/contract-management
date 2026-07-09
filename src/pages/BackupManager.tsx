import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Clock,
  HardDrive
} from 'lucide-react'
import { formatDateTime } from '@/utils/format'

interface BackupFile {
  name: string
  size: number
  created: string
  path: string
}

export default function BackupManager() {
  const [files, setFiles] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/backup/files', { headers: getAuthHeaders() })
      const json = await res.json()
      if (json.success) {
        setFiles(json.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleBackupNow = async () => {
    setBackingUp(true)
    try {
      const res = await fetch('/api/backup/now', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const json = await res.json()
      if (json.success) {
        fetchFiles()
      }
    } finally {
      setBackingUp(false)
    }
  }

  const handleDownload = (filename: string) => {
    const token = localStorage.getItem('token')
    const url = `/api/backup/download/${encodeURIComponent(filename)}`
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
      })
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除备份文件「${filename}」？`)) return
    try {
      await fetch(`/api/backup/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      fetchFiles()
    } catch { /* ignore */ }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const contractBackups = files.filter(f => f.name.startsWith('contracts_'))
  const milestoneBackups = files.filter(f => f.name.startsWith('milestones_'))
  const changelogs = files.filter(f => f.name.startsWith('changelog_'))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据备份</h1>
            <p className="text-gray-500 mt-1">自动备份与手动备份管理</p>
          </div>
        </div>
        <button
          onClick={handleBackupNow}
          disabled={backingUp}
          className="flex items-center px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${backingUp ? 'animate-spin' : ''}`} />
          {backingUp ? '备份中...' : '立即备份'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">合同备份</p>
              <p className="text-2xl font-bold text-gray-900">{contractBackups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">节点备份</p>
              <p className="text-2xl font-bold text-gray-900">{milestoneBackups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <HardDrive className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">操作日志</p>
              <p className="text-2xl font-bold text-gray-900">{changelogs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">自动备份说明</p>
            <p className="mt-1">每次创建、修改或删除合同时，系统会自动生成备份文件。合同数据和交付节点分别存储，操作日志按天记录。</p>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">备份文件列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">文件名</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">大小</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无备份文件</td></tr>
              ) : (
                files.map((file) => {
                  let typeLabel = '其他'
                  let typeColor = 'bg-gray-100 text-gray-700'
                  if (file.name.startsWith('contracts_')) {
                    typeLabel = '合同数据'
                    typeColor = 'bg-blue-100 text-blue-700'
                  } else if (file.name.startsWith('milestones_')) {
                    typeLabel = '节点数据'
                    typeColor = 'bg-green-100 text-green-700'
                  } else if (file.name.startsWith('changelog_')) {
                    typeLabel = '操作日志'
                    typeColor = 'bg-amber-100 text-amber-700'
                  }

                  return (
                    <tr key={file.name} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <span className="text-sm font-mono text-gray-900">{file.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {formatDateTime(file.created)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(file.name)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="下载"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.name)}
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
      </div>
    </div>
  )
}
