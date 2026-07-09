import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

interface UserContext {
  id: number
  username: string
  name: string
  role: string
}

function getCurrentUser(req: Request): UserContext | null {
  return (req as any).user || null
}

function isAdmin(user: UserContext | null): boolean {
  return !!user && user.role === 'admin'
}

function getProjectAccess(projectId: number, user: UserContext | null) {
  if (!user) return null
  if (isAdmin(user)) {
    return {
      can_view: 1, can_edit: 1, can_delete: 1,
      can_manage_members: 1, can_manage_partners: 1,
      can_manage_finance: 1, can_manage_milestones: 1
    }
  }

  const project = db.prepare('SELECT created_by, manager_id FROM project WHERE id = ?').get(projectId) as any
  if (!project) return null

  if (project.created_by === user.username || project.manager_id === user.id) {
    return {
      can_view: 1, can_edit: 1, can_delete: 1,
      can_manage_members: 1, can_manage_partners: 1,
      can_manage_finance: 1, can_manage_milestones: 1
    }
  }

  const perm = db.prepare(`
    SELECT can_view, can_edit, can_delete, can_manage_members,
           can_manage_partners, can_manage_finance, can_manage_milestones
    FROM project_permission WHERE project_id = ? AND user_id = ?
  `).get(projectId, user.id) as any

  return perm || { can_view: 0, can_edit: 0, can_delete: 0, can_manage_members: 0, can_manage_partners: 0, can_manage_finance: 0, can_manage_milestones: 0 }
}

function requireView(projectId: number, user: UserContext | null, res: Response): boolean {
  const access = getProjectAccess(projectId, user)
  if (!access || !access.can_view) {
    res.status(403).json({ success: false, error: '无权限查看该项目' })
    return false
  }
  return true
}

function requireEdit(projectId: number, user: UserContext | null, res: Response): boolean {
  const access = getProjectAccess(projectId, user)
  if (!access || !access.can_edit) {
    res.status(403).json({ success: false, error: '无权限编辑该项目' })
    return false
  }
  return true
}

function requireDelete(projectId: number, user: UserContext | null, res: Response): boolean {
  const access = getProjectAccess(projectId, user)
  if (!access || !access.can_delete) {
    res.status(403).json({ success: false, error: '无权限删除该项目' })
    return false
  }
  return true
}

function logAction(projectId: number, action: string, operator: string, detail: string) {
  db.prepare('INSERT INTO project_log (project_id, action, operator, detail) VALUES (?, ?, ?, ?)')
    .run(projectId, action, operator, detail)
}

function generateProjectNo(): string {
  const date = new Date()
  const prefix = `XM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const count = db.prepare(`SELECT COUNT(*) as count FROM project WHERE project_no LIKE ?`).get(`${prefix}-%`) as { count: number }
  return `${prefix}-${String(count.count + 1).padStart(3, '0')}`
}

// List projects
router.get('/', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { keyword = '', status = 'all', page = '1', pageSize = '10' } = req.query

    let where = 'WHERE 1=1'
    const params: any[] = []

    if (!isAdmin(user) && user) {
      where += ` AND (
        p.created_by = ? OR p.manager_id = ? OR
        EXISTS (SELECT 1 FROM project_permission pp WHERE pp.project_id = p.id AND pp.user_id = ? AND pp.can_view = 1)
      )`
      params.push(user.username, user.id, user.id)
    }

    if (status !== 'all') {
      where += ' AND p.status = ?'
      params.push(status)
    }

    if (keyword) {
      where += ' AND (p.name LIKE ? OR p.project_no LIKE ? OR p.description LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM project p ${where}`).get(...params) as { total: number }

    const offset = (Number(page) - 1) * Number(pageSize)
    const list = db.prepare(`
      SELECT p.*, u.name as manager_name
      FROM project p
      LEFT JOIN user u ON p.manager_id = u.id
      ${where}
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(pageSize), offset) as any[]

    res.json({
      success: true,
      data: {
        list,
        total: countRow.total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Stats
router.get('/stats', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    let where = ''
    const params: any[] = []

    if (!isAdmin(user) && user) {
      where = `WHERE created_by = ? OR manager_id = ? OR
        EXISTS (SELECT 1 FROM project_permission pp WHERE pp.project_id = project.id AND pp.user_id = ? AND pp.can_view = 1)`
      params.push(user.username, user.id, user.id)
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM project ${where}`).get(...params) as { count: number }
    const active = db.prepare(`SELECT COUNT(*) as count FROM project ${where ? where + ' AND' : 'WHERE'} status = 'active'`).get(...params) as { count: number }
    const completed = db.prepare(`SELECT COUNT(*) as count FROM project ${where ? where + ' AND' : 'WHERE'} status = 'completed'`).get(...params) as { count: number }
    const amount = db.prepare(`SELECT COALESCE(SUM(total_amount), 0) as total FROM project ${where}`).get(...params) as { total: number }

    res.json({
      success: true,
      data: {
        total: total.count,
        active: active.count,
        completed: completed.count,
        totalAmount: amount.total
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '统计失败' })
  }
})

// List users for member selection
router.get('/users/list', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, username, name, role FROM user WHERE active = 1 ORDER BY name').all()
    res.json({ success: true, data: users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Get project detail
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { id } = req.params

    if (!requireView(Number(id), user, res)) return

    const project = db.prepare(`
      SELECT p.*, u.name as manager_name
      FROM project p
      LEFT JOIN user u ON p.manager_id = u.id
      WHERE p.id = ?
    `).get(id) as any

    if (!project) {
      res.status(404).json({ success: false, error: '项目不存在' })
      return
    }

    const partners = db.prepare('SELECT * FROM project_partner WHERE project_id = ? ORDER BY sort_order, id').all(id) as any[]
    const members = db.prepare(`
      SELECT pm.*, u.name as user_name
      FROM project_member pm
      JOIN user u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY pm.id
    `).all(id) as any[]
    const permissions = db.prepare(`
      SELECT pp.*, u.name as user_name
      FROM project_permission pp
      JOIN user u ON pp.user_id = u.id
      WHERE pp.project_id = ?
      ORDER BY pp.id
    `).all(id) as any[]
    const milestones = db.prepare('SELECT * FROM project_milestone WHERE project_id = ? ORDER BY due_date').all(id) as any[]
    const logs = db.prepare('SELECT * FROM project_log WHERE project_id = ? ORDER BY created_at DESC').all(id) as any[]
    const contracts = db.prepare('SELECT id, contract_no, name, amount, status, expiry_date FROM contract WHERE project_id = ?').all(id) as any[]

    res.json({
      success: true,
      data: {
        ...project,
        partners,
        members,
        permissions,
        milestones,
        logs,
        contracts
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Get my permissions for a project
router.get('/:id/permissions/me', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { id } = req.params
    const access = getProjectAccess(Number(id), user)
    res.json({ success: true, data: access })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Create project
router.post('/', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    if (!user) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }

    const {
      name, description = '', status = 'active', total_amount = 0,
      start_date, end_date, manager_id,
      partners = [], members = [], permissions = [], milestones = []
    } = req.body

    if (!name) {
      res.status(400).json({ success: false, error: '请输入项目名称' })
      return
    }

    const shareSum = (members as any[]).reduce((sum, m) => sum + (Number(m.share_percent) || 0), 0)
    if (shareSum > 100) {
      res.status(400).json({ success: false, error: `分成比例总和不能超过100%，当前为${shareSum}%` })
      return
    }

    const projectNo = generateProjectNo()
    const insertProject = db.prepare(`
      INSERT INTO project (project_no, name, description, status, total_amount, start_date, end_date, manager_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = insertProject.run(projectNo, name, description, status, total_amount, start_date || null, end_date || null, manager_id || null, user.name)
    const projectId = Number(result.lastInsertRowid)

    const insertPartner = db.prepare(`
      INSERT INTO project_partner (project_id, party_role, name, contact_person, contact_phone, email, address, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (let i = 0; i < partners.length; i++) {
      const p = partners[i]
      insertPartner.run(projectId, p.party_role, p.name, p.contact_person || '', p.contact_phone || '', p.email || '', p.address || '', p.description || '', i)
    }

    const insertMember = db.prepare(`
      INSERT INTO project_member (project_id, user_id, role_title, share_percent)
      VALUES (?, ?, ?, ?)
    `)
    for (const m of members) {
      insertMember.run(projectId, m.user_id, m.role_title || '', Number(m.share_percent) || 0)
    }

    const insertPerm = db.prepare(`
      INSERT INTO project_permission (project_id, user_id, can_view, can_edit, can_delete, can_manage_members, can_manage_partners, can_manage_finance, can_manage_milestones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of permissions) {
      insertPerm.run(
        projectId, p.user_id,
        p.can_view ? 1 : 0, p.can_edit ? 1 : 0, p.can_delete ? 1 : 0,
        p.can_manage_members ? 1 : 0, p.can_manage_partners ? 1 : 0,
        p.can_manage_finance ? 1 : 0, p.can_manage_milestones ? 1 : 0
      )
    }

    const insertMilestone = db.prepare(`
      INSERT INTO project_milestone (project_id, name, due_date, amount, status, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    for (const m of milestones) {
      insertMilestone.run(projectId, m.name, m.due_date, Number(m.amount) || 0, m.status || 'pending', m.remark || '')
    }

    logAction(projectId, '创建', user.name, `创建项目 ${projectNo}`)

    res.json({ success: true, data: { id: projectId } })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message || '创建失败' })
  }
})

// Update project
router.put('/:id', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { id } = req.params

    if (!requireEdit(Number(id), user, res)) return

    const {
      name, description, status, total_amount,
      start_date, end_date, manager_id,
      partners = [], members = [], permissions = [], milestones = []
    } = req.body

    if (!name) {
      res.status(400).json({ success: false, error: '请输入项目名称' })
      return
    }

    const shareSum = (members as any[]).reduce((sum, m) => sum + (Number(m.share_percent) || 0), 0)
    if (shareSum > 100) {
      res.status(400).json({ success: false, error: `分成比例总和不能超过100%，当前为${shareSum}%` })
      return
    }

    db.prepare(`
      UPDATE project SET name = ?, description = ?, status = ?, total_amount = ?,
      start_date = ?, end_date = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, status, total_amount, start_date || null, end_date || null, manager_id || null, id)

    // Replace partners
    db.prepare('DELETE FROM project_partner WHERE project_id = ?').run(id)
    const insertPartner = db.prepare(`
      INSERT INTO project_partner (project_id, party_role, name, contact_person, contact_phone, email, address, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (let i = 0; i < partners.length; i++) {
      const p = partners[i]
      insertPartner.run(id, p.party_role, p.name, p.contact_person || '', p.contact_phone || '', p.email || '', p.address || '', p.description || '', i)
    }

    // Replace members
    db.prepare('DELETE FROM project_member WHERE project_id = ?').run(id)
    const insertMember = db.prepare(`
      INSERT INTO project_member (project_id, user_id, role_title, share_percent)
      VALUES (?, ?, ?, ?)
    `)
    for (const m of members) {
      insertMember.run(id, m.user_id, m.role_title || '', Number(m.share_percent) || 0)
    }

    // Replace permissions
    db.prepare('DELETE FROM project_permission WHERE project_id = ?').run(id)
    const insertPerm = db.prepare(`
      INSERT INTO project_permission (project_id, user_id, can_view, can_edit, can_delete, can_manage_members, can_manage_partners, can_manage_finance, can_manage_milestones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of permissions) {
      insertPerm.run(
        id, p.user_id,
        p.can_view ? 1 : 0, p.can_edit ? 1 : 0, p.can_delete ? 1 : 0,
        p.can_manage_members ? 1 : 0, p.can_manage_partners ? 1 : 0,
        p.can_manage_finance ? 1 : 0, p.can_manage_milestones ? 1 : 0
      )
    }

    // Replace milestones
    db.prepare('DELETE FROM project_milestone WHERE project_id = ?').run(id)
    const insertMilestone = db.prepare(`
      INSERT INTO project_milestone (project_id, name, due_date, amount, status, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    for (const m of milestones) {
      insertMilestone.run(id, m.name, m.due_date, Number(m.amount) || 0, m.status || 'pending', m.remark || '')
    }

    logAction(Number(id), '更新', user!.name, '更新项目信息')

    res.json({ success: true })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message || '更新失败' })
  }
})

// Delete project
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { id } = req.params

    if (!requireDelete(Number(id), user, res)) return

    db.prepare('DELETE FROM project WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

// Update project milestone status
router.patch('/:id/milestones/:milestoneId', (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    const { id, milestoneId } = req.params
    const { status } = req.body

    const access = getProjectAccess(Number(id), user)
    if (!access || (!access.can_manage_milestones && !access.can_edit)) {
      res.status(403).json({ success: false, error: '无权限更新里程碑' })
      return
    }

    const completedAt = status === 'completed' ? new Date().toISOString() : null
    db.prepare('UPDATE project_milestone SET status = ?, completed_at = ? WHERE id = ? AND project_id = ?')
      .run(status, completedAt, milestoneId, id)

    logAction(Number(id), '里程碑更新', user!.name, `里程碑状态更新为 ${status}`)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

export default router
