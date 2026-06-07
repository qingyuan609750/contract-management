import { Router, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'contract-management-secret-key-2024'

// Initialize default admin user
export function initAuth() {
  const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get()
  if (!exists) {
    db.exec(`
      CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    // Default password: admin123
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    db.prepare('INSERT INTO user (username, password, name, role) VALUES (?, ?, ?, ?)')
      .run('admin', hashedPassword, '管理员', 'admin')
  } else {
    // Migration: add active column if not exists
    try {
      db.prepare('SELECT active FROM user LIMIT 1').get()
    } catch (e) {
      db.exec('ALTER TABLE user ADD COLUMN active INTEGER DEFAULT 1')
    }
  }
}

router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ success: false, error: '请输入用户名和密码' })
      return
    }

    const user = db.prepare('SELECT * FROM user WHERE username = ?').get(username) as any
    if (!user) {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
      return
    }

    if (user.active === 0) {
      res.status(403).json({ success: false, error: '账号已被禁用' })
      return
    }

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
      return
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    res.json({
      success: true,
      data: {
        id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role
      }
    })
  } catch (error) {
    res.status(401).json({ success: false, error: '登录已过期' })
  }
})

// Get all users (admin only)
router.get('/users', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser || currentUser.role !== 'admin') {
      res.status(403).json({ success: false, error: '无权限' })
      return
    }

    const users = db.prepare('SELECT id, username, name, role, active, created_at FROM user ORDER BY created_at DESC').all()
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

// Create user (admin only)
router.post('/users', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser || currentUser.role !== 'admin') {
      res.status(403).json({ success: false, error: '无权限' })
      return
    }

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
router.put('/users/:id', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser || currentUser.role !== 'admin') {
      res.status(403).json({ success: false, error: '无权限' })
      return
    }

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
router.post('/users/:id/reset-password', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser || currentUser.role !== 'admin') {
      res.status(403).json({ success: false, error: '无权限' })
      return
    }

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
router.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser || currentUser.role !== 'admin') {
      res.status(403).json({ success: false, error: '无权限' })
      return
    }

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

// Change own password
router.post('/change-password', (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }

    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, error: '请填写完整' })
      return
    }

    const user = db.prepare('SELECT * FROM user WHERE id = ?').get(currentUser.id) as any
    const valid = bcrypt.compareSync(oldPassword, user.password)
    if (!valid) {
      res.status(400).json({ success: false, error: '原密码错误' })
      return
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashedPassword, currentUser.id)

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '修改失败' })
  }
})

export function authMiddleware(req: Request, res: Response, next: Function) {
  // Public paths that don't require authentication
  const publicPaths = ['/api/auth/login', '/api/health']
  if (publicPaths.includes(req.path)) {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' })
    return
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).user = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: '登录已过期' })
  }
}

export default router
