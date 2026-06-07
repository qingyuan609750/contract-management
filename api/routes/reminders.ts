import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/upcoming', (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query
    const now = new Date().toISOString().split('T')[0]

    const contracts = db.prepare(`
      SELECT * FROM contract 
      WHERE expiry_date > ? 
      AND expiry_date <= date(?, '+${days} days') 
      AND status = 'active'
      ORDER BY expiry_date ASC
    `).all(now, now)

    const milestones = db.prepare(`
      SELECT m.*, c.name as contract_name, c.contract_no 
      FROM milestone m
      JOIN contract c ON m.contract_id = c.id
      WHERE m.due_date > ? 
      AND m.due_date <= date(?, '+${days} days')
      AND m.status = 'pending'
      AND c.status = 'active'
      ORDER BY m.due_date ASC
    `).all(now, now)

    res.json({ success: true, data: { contracts, milestones } })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

router.get('/overdue', (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString().split('T')[0]

    const contracts = db.prepare(`
      SELECT * FROM contract 
      WHERE expiry_date < ? 
      AND status = 'active'
      ORDER BY expiry_date ASC
    `).all(now)

    const milestones = db.prepare(`
      SELECT m.*, c.name as contract_name, c.contract_no 
      FROM milestone m
      JOIN contract c ON m.contract_id = c.id
      WHERE m.due_date < ?
      AND m.status = 'pending'
      AND c.status = 'active'
      ORDER BY m.due_date ASC
    `).all(now)

    res.json({ success: true, data: { contracts, milestones } })
  } catch (error) {
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

export default router
