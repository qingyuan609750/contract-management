import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'

const router = Router()

// Middleware to check admin role
function requireAdmin(req: Request, res: Response, next: Function) {
  const currentUser = (req as any).user
  if (!currentUser || currentUser.role !== 'admin') {
    res.status(403).json({ success: false, error: '无权限' })
    return
  }
  next()
}

// Get all users (admin only)
router.get('/', requireAdmin, (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, username, name, role, active, created_at FROM user ORDER BY created_at DESC').all()
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Create user (admin only)
router.post('/', requireAdmin, (req: Request, res: Response) => {
  try {
    const { username, name, password, role = 'user' } = req.body
    if (!username || !name || !password) {
      res.status(400).json({ success: false, error: '请填写完整信息' })
      return
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const result = db.prepare('INSERT INTO user (username, password, name, role) VALUES (?, ?, ?, ?)')
      .run(username, hashedPassword, name, role)

    res.json({ success: true, data: { id: result.lastInsertRowid } })
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: '用户名已存在' })
      return
    }
    res.status(500).json({ success: false, error: '创建失败' })
  }
})

// Update user (admin only)
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, role, active } = req.body

    db.prepare('UPDATE user SET name = ?, role = ?, active = ? WHERE id = ?')
      .run(name, role, active ? 1 : 0, id)

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

// Reset password (admin only)
router.post('/:id/reset-password', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { password } = req.body
    if (!password) {
      res.status(400).json({ success: false, error: '请输入新密码' })
      return
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashedPassword, id)

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '重置失败' })
  }
})

// Delete user (admin only)
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const { id } = req.params
    // Prevent deleting yourself
    if (String(currentUser.id) === id) {
      res.status(400).json({ success: false, error: '不能删除自己的账号' })
      return
    }

    db.prepare('DELETE FROM user WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

export default router
