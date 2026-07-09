import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'
import { backupContracts, backupMilestones, appendChangelog } from '../utils/backup.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const { type, status, keyword, project_id, page = '1', pageSize = '10' } = req.query
    let sql = 'SELECT * FROM contract WHERE 1=1'
    const params: any[] = []

    if (type && type !== 'all') {
      sql += ' AND type = ?'
      params.push(type)
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?'
      params.push(status)
    }
    if (project_id && project_id !== 'all') {
      sql += ' AND project_id = ?'
      params.push(project_id)
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR contract_no LIKE ? OR customer LIKE ?)'
      const like = `%${keyword}%`
      params.push(like, like, like)
    }

    sql += ' ORDER BY updated_at DESC'

    const pageNum = parseInt(page as string)
    const size = parseInt(pageSize as string)
    const offset = (pageNum - 1) * size

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
    const totalResult = db.prepare(countSql).get(...params) as { total: number }

    sql += ' LIMIT ? OFFSET ?'
    params.push(size, offset)

    const contracts = db.prepare(sql).all(...params)

    res.json({
      success: true,
      data: {
        list: contracts,
        total: totalResult.total,
        page: pageNum,
        pageSize: size
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Get all projects for contract dropdown
router.get('/projects/list', (req: Request, res: Response) => {
  try {
    const projects = db.prepare('SELECT id, project_no, name FROM project ORDER BY updated_at DESC').all()
    res.json({ success: true, data: projects })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

router.get('/stats', (req: Request, res: Response) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM contract').get() as { count: number }
    const active = db.prepare("SELECT COUNT(*) as count FROM contract WHERE status = 'active'").get() as { count: number }
    const overdue = db.prepare("SELECT COUNT(*) as count FROM contract WHERE status = 'overdue'").get() as { count: number }
    const completed = db.prepare("SELECT COUNT(*) as count FROM contract WHERE status = 'completed'").get() as { count: number }

    const now = new Date().toISOString().split('T')[0]
    const upcoming = db.prepare(
      "SELECT COUNT(*) as count FROM contract WHERE expiry_date > ? AND expiry_date <= date(?, '+30 days') AND status = 'active'"
    ).get(now, now) as { count: number }

    const amountResult = db.prepare('SELECT SUM(amount) as total FROM contract').get() as { total: number }

    const typeStats = db.prepare(`
      SELECT type, COUNT(*) as count, SUM(amount) as amount 
      FROM contract GROUP BY type
    `).all()

    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count, SUM(amount) as amount
      FROM contract WHERE created_at >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all()

    res.json({
      success: true,
      data: {
        total: total.count,
        active: active.count,
        overdue: overdue.count,
        completed: completed.count,
        upcoming: upcoming.count,
        totalAmount: amountResult.total || 0,
        typeStats,
        monthly
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '统计失败' })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const contract = db.prepare('SELECT * FROM contract WHERE id = ?').get(id) as Record<string, any> | undefined
    if (!contract) {
      res.status(404).json({ success: false, error: '合同不存在' })
      return
    }

    const milestones = db.prepare('SELECT * FROM milestone WHERE contract_id = ? ORDER BY due_date').all(id)
    const logs = db.prepare('SELECT * FROM log WHERE contract_id = ? ORDER BY created_at DESC').all(id)

    res.json({
      success: true,
      data: { ...contract, milestones, logs }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body
    const insert = db.prepare(`
      INSERT INTO contract (project_id, contract_no, name, type, customer, amount, sign_date, effective_date, expiry_date, status, payment_terms, remark, created_by)
      VALUES (@project_id, @contract_no, @name, @type, @customer, @amount, @sign_date, @effective_date, @expiry_date, @status, @payment_terms, @remark, @created_by)
    `)

    const result = insert.run({
      project_id: body.project_id || null,
      contract_no: body.contract_no,
      name: body.name,
      type: body.type,
      customer: body.customer,
      amount: body.amount || 0,
      sign_date: body.sign_date || null,
      effective_date: body.effective_date || null,
      expiry_date: body.expiry_date,
      status: body.status || 'active',
      payment_terms: body.payment_terms || '',
      remark: body.remark || '',
      created_by: body.created_by || '管理员'
    })

    const contractId = result.lastInsertRowid

    if (body.milestones && body.milestones.length > 0) {
      const insertMilestone = db.prepare(`
        INSERT INTO milestone (contract_id, name, due_date, amount, status, remark)
        VALUES (@contract_id, @name, @due_date, @amount, @status, @remark)
      `)
      for (const m of body.milestones) {
        insertMilestone.run({
          contract_id: contractId,
          name: m.name,
          due_date: m.due_date,
          amount: m.amount || 0,
          status: m.status || 'pending',
          remark: m.remark || ''
        })
      }
    }

    const operator = (req as any).user?.name || body.created_by || '管理员'
    db.prepare(`
      INSERT INTO log (contract_id, action, operator, detail)
      VALUES (?, '创建', ?, '合同创建成功')
    `).run(contractId, operator)

    // Auto backup after create
    try {
      backupContracts()
      backupMilestones()
      appendChangelog('创建合同', operator, `创建合同「${body.name}」(${body.contract_no})`)
    } catch (e) {
      console.error('Backup failed:', e)
    }

    res.json({ success: true, data: { id: contractId } })
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: '合同编号已存在' })
      return
    }
    res.status(500).json({ success: false, error: '创建失败' })
  }
})

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const body = req.body

    db.prepare(`
      UPDATE contract SET
        project_id = @project_id,
        contract_no = @contract_no,
        name = @name,
        type = @type,
        customer = @customer,
        amount = @amount,
        sign_date = @sign_date,
        effective_date = @effective_date,
        expiry_date = @expiry_date,
        status = @status,
        payment_terms = @payment_terms,
        remark = @remark,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      id,
      project_id: body.project_id || null,
      contract_no: body.contract_no,
      name: body.name,
      type: body.type,
      customer: body.customer,
      amount: body.amount || 0,
      sign_date: body.sign_date || null,
      effective_date: body.effective_date || null,
      expiry_date: body.expiry_date,
      status: body.status,
      payment_terms: body.payment_terms || '',
      remark: body.remark || ''
    })

    if (body.milestones) {
      db.prepare('DELETE FROM milestone WHERE contract_id = ?').run(id)
      const insertMilestone = db.prepare(`
        INSERT INTO milestone (contract_id, name, due_date, amount, status, remark)
        VALUES (@contract_id, @name, @due_date, @amount, @status, @remark)
      `)
      for (const m of body.milestones) {
        insertMilestone.run({
          contract_id: id,
          name: m.name,
          due_date: m.due_date,
          amount: m.amount || 0,
          status: m.status || 'pending',
          remark: m.remark || ''
        })
      }
    }

    const updateOperator = (req as any).user?.name || body.updated_by || '管理员'
    db.prepare(`
      INSERT INTO log (contract_id, action, operator, detail)
      VALUES (?, '更新', ?, '合同信息更新')
    `).run(id, updateOperator)

    // Auto backup after update
    try {
      backupContracts()
      backupMilestones()
      appendChangelog('更新合同', updateOperator, `更新合同「${body.name}」(${body.contract_no})`)
    } catch (e) {
      console.error('Backup failed:', e)
    }

    res.json({ success: true })
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: '合同编号已存在' })
      return
    }
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Get contract info before delete for changelog
    const contract = db.prepare('SELECT contract_no, name FROM contract WHERE id = ?').get(id) as any
    const operator = (req as any).user?.name || '管理员'

    db.prepare('DELETE FROM contract WHERE id = ?').run(id)

    // Auto backup after delete
    try {
      backupContracts()
      backupMilestones()
      if (contract) {
        appendChangelog('删除合同', operator, `删除合同「${contract.name}」(${contract.contract_no})`)
      }
    } catch (e) {
      console.error('Backup failed:', e)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

router.patch('/:id/milestones/:milestoneId', (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params
    const { status } = req.body
    const operator = (req as any).user?.name || '管理员'

    db.prepare(`
      UPDATE milestone SET status = ?, completed_at = ? WHERE id = ?
    `).run(status, status === 'completed' ? new Date().toISOString() : null, milestoneId)

    const milestone = db.prepare('SELECT * FROM milestone WHERE id = ?').get(milestoneId) as any
    if (milestone) {
      db.prepare(`
        INSERT INTO log (contract_id, action, operator, detail)
        VALUES (?, '更新节点', ?, ?)
      `).run(milestone.contract_id, operator, `节点「${milestone.name}」状态更新为${status === 'completed' ? '已完成' : status === 'pending' ? '待完成' : '已逾期'}`)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

export default router
