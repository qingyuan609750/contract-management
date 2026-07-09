import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backupDir = process.env.RENDER_DISK_MOUNT_PATH
  ? path.join(process.env.RENDER_DISK_MOUNT_PATH, 'backups')
  : path.join(__dirname, '..', '..', 'backups')

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

function getTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function getDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function writeCsv(filename: string, headers: string[], rows: any[][]): string {
  const filepath = path.join(backupDir, filename)
  const lines = [headers.map(escapeCsv).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(','))
  }
  fs.writeFileSync(filepath, '\ufeff' + lines.join('\n'), 'utf8')
  return filepath
}

export function backupContracts(): string {
  const timestamp = getTimestamp()
  const contracts = db.prepare('SELECT * FROM contract ORDER BY id').all() as any[]

  const headers = [
    'ID', '合同编号', '合同名称', '类型', '客户/供应商', '金额',
    '签订日期', '生效日期', '到期日期', '状态', '付款条款',
    '备注', '创建人', '创建时间', '更新时间'
  ]

  const rows = contracts.map(c => [
    c.id, c.contract_no, c.name, c.type, c.customer, c.amount,
    c.sign_date || '', c.effective_date || '', c.expiry_date,
    c.status, c.payment_terms || '', c.remark || '',
    c.created_by, c.created_at, c.updated_at
  ])

  const filename = `contracts_${timestamp}.csv`
  return writeCsv(filename, headers, rows)
}

export function backupMilestones(): string {
  const timestamp = getTimestamp()
  const milestones = db.prepare(`
    SELECT m.*, c.contract_no, c.name as contract_name
    FROM milestone m
    JOIN contract c ON m.contract_id = c.id
    ORDER BY m.id
  `).all() as any[]

  const headers = [
    'ID', '合同ID', '合同编号', '合同名称', '节点名称',
    '截止日期', '节点金额', '状态', '备注', '完成时间'
  ]

  const rows = milestones.map(m => [
    m.id, m.contract_id, m.contract_no, m.contract_name,
    m.name, m.due_date, m.amount, m.status,
    m.remark || '', m.completed_at || ''
  ])

  const filename = `milestones_${timestamp}.csv`
  return writeCsv(filename, headers, rows)
}

export function appendChangelog(action: string, operator: string, detail: string): string {
  const dateStr = getDateStr()
  const filename = `changelog_${dateStr}.csv`
  const filepath = path.join(backupDir, filename)

  const timestamp = new Date().toLocaleString('zh-CN')
  const line = [timestamp, action, operator, detail].map(escapeCsv).join(',') + '\n'

  if (!fs.existsSync(filepath)) {
    const header = ['时间', '操作', '操作人', '详情'].map(escapeCsv).join(',') + '\n'
    fs.writeFileSync(filepath, '\ufeff' + header + line, 'utf8')
  } else {
    fs.appendFileSync(filepath, line, 'utf8')
  }

  return filepath
}

export function fullBackup(): { contracts: string; milestones: string; changelog: string } {
  const contractsFile = backupContracts()
  const milestonesFile = backupMilestones()
  const changelogFile = appendChangelog('全量备份', '系统', '执行全量数据备份')

  return { contracts: contractsFile, milestones: milestonesFile, changelog: changelogFile }
}

export function getBackupFiles(): { name: string; size: number; created: string; path: string }[] {
  if (!fs.existsSync(backupDir)) return []

  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.csv'))
    .map(f => {
      const filepath = path.join(backupDir, f)
      const stat = fs.statSync(filepath)
      return {
        name: f,
        size: stat.size,
        created: stat.birthtime.toISOString(),
        path: filepath
      }
    })
    .sort((a, b) => b.created.localeCompare(a.created))

  return files
}

export function deleteBackupFile(filename: string): boolean {
  const filepath = path.join(backupDir, filename)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
    return true
  }
  return false
}

export { backupDir }
