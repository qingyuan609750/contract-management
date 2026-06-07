import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use /data for Render persistent disk, fallback to project root for local dev
const dataDir = process.env.RENDER_DISK_MOUNT_PATH || path.join(__dirname, '..')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'data.db')
export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contract (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_no VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      type VARCHAR(50) NOT NULL,
      customer VARCHAR(200) NOT NULL,
      amount DECIMAL(15,2) DEFAULT 0,
      sign_date DATE,
      effective_date DATE,
      expiry_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'draft',
      payment_terms VARCHAR(500),
      remark TEXT,
      attachment VARCHAR(500),
      created_by VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS milestone (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      name VARCHAR(200) NOT NULL,
      due_date DATE NOT NULL,
      amount DECIMAL(15,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      remark VARCHAR(500),
      completed_at DATETIME,
      FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      action VARCHAR(50) NOT NULL,
      operator VARCHAR(100),
      detail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contract_status ON contract(status);
    CREATE INDEX IF NOT EXISTS idx_contract_expiry ON contract(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_milestone_contract ON milestone(contract_id);
    CREATE INDEX IF NOT EXISTS idx_milestone_due ON milestone(due_date);
  `)

  const count = db.prepare('SELECT COUNT(*) as count FROM contract').get() as { count: number }
  if (count.count === 0) {
    insertSampleData()
  }
}

function insertSampleData() {
  const contracts = [
    {
      contract_no: 'HT-2024-001',
      name: '软件开发服务合同',
      type: '服务',
      customer: '科技创新有限公司',
      amount: 150000,
      sign_date: '2024-01-15',
      effective_date: '2024-01-20',
      expiry_date: '2025-12-31',
      status: 'active',
      payment_terms: '首付30%，中期40%，尾款30%',
      remark: '企业ERP系统定制开发',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2024-002',
      name: '办公设备采购合同',
      type: '采购',
      customer: '办公设备供应商',
      amount: 85000,
      sign_date: '2024-02-10',
      effective_date: '2024-02-15',
      expiry_date: '2025-08-15',
      status: 'active',
      payment_terms: '货到付款',
      remark: '50台电脑及配套设备',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2024-003',
      name: '年度咨询服务协议',
      type: '服务',
      customer: '管理咨询有限公司',
      amount: 200000,
      sign_date: '2024-03-01',
      effective_date: '2024-03-01',
      expiry_date: '2026-02-28',
      status: 'active',
      payment_terms: '季度付款',
      remark: '年度战略咨询',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2024-004',
      name: '房屋租赁合同',
      type: '租赁',
      customer: '物业管理公司',
      amount: 360000,
      sign_date: '2024-01-01',
      effective_date: '2024-01-01',
      expiry_date: '2025-12-31',
      status: 'active',
      payment_terms: '月付',
      remark: '办公场地租赁，每月3万',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2024-005',
      name: '产品销售合同',
      type: '销售',
      customer: '国际贸易公司',
      amount: 500000,
      sign_date: '2024-04-01',
      effective_date: '2024-04-10',
      expiry_date: '2025-10-10',
      status: 'active',
      payment_terms: '信用证60天',
      remark: '出口产品订单',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2023-001',
      name: '2023年度广告合同',
      type: '服务',
      customer: '广告传媒公司',
      amount: 120000,
      sign_date: '2023-06-01',
      effective_date: '2023-06-01',
      expiry_date: '2024-05-31',
      status: 'completed',
      payment_terms: '项目完成支付',
      remark: '品牌推广服务',
      created_by: '管理员'
    },
    {
      contract_no: 'HT-2024-006',
      name: '服务器维护合同',
      type: '服务',
      customer: '云计算服务商',
      amount: 60000,
      sign_date: '2024-05-01',
      effective_date: '2024-05-01',
      expiry_date: '2025-06-30',
      status: 'active',
      payment_terms: '服务完成支付',
      remark: '服务器运维服务',
      created_by: '管理员'
    }
  ]

  const insertContract = db.prepare(`
    INSERT INTO contract (contract_no, name, type, customer, amount, sign_date, effective_date, expiry_date, status, payment_terms, remark, created_by)
    VALUES (@contract_no, @name, @type, @customer, @amount, @sign_date, @effective_date, @expiry_date, @status, @payment_terms, @remark, @created_by)
  `)

  for (const c of contracts) {
    const result = insertContract.run(c)
    const contractId = result.lastInsertRowid

    if (c.contract_no === 'HT-2024-001') {
      db.prepare(`
        INSERT INTO milestone (contract_id, name, due_date, amount, status)
        VALUES 
        (?, '首付款', '2024-01-25', 45000, 'completed'),
        (?, '中期验收', '2025-06-30', 60000, 'pending'),
        (?, '项目交付', '2025-12-31', 45000, 'pending')
      `).run(contractId, contractId, contractId)
    } else if (c.contract_no === 'HT-2024-002') {
      db.prepare(`
        INSERT INTO milestone (contract_id, name, due_date, amount, status)
        VALUES 
        (?, '设备交付', '2024-03-01', 85000, 'completed'),
        (?, '验收付款', '2025-08-15', 85000, 'pending')
      `).run(contractId, contractId)
    } else if (c.contract_no === 'HT-2024-003') {
      db.prepare(`
        INSERT INTO milestone (contract_id, name, due_date, amount, status)
        VALUES 
        (?, 'Q1服务费', '2024-03-31', 50000, 'completed'),
        (?, 'Q2服务费', '2024-06-30', 50000, 'completed'),
        (?, 'Q3服务费', '2025-09-30', 50000, 'pending'),
        (?, 'Q4服务费', '2025-12-31', 50000, 'pending')
      `).run(contractId, contractId, contractId, contractId)
    }

    db.prepare(`
      INSERT INTO log (contract_id, action, operator, detail)
      VALUES (?, '创建', '管理员', '合同创建成功')
    `).run(contractId)
  }
}
