import { Router, type Request, type Response } from 'express'
import path from 'path'
import fs from 'fs'
import { getBackupFiles, deleteBackupFile, fullBackup, backupDir } from '../utils/backup.js'

const router = Router()

// Get all backup files
router.get('/files', (req: Request, res: Response) => {
  try {
    const files = getBackupFiles()
    res.json({ success: true, data: files })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取备份列表失败' })
  }
})

// Manual full backup
router.post('/now', (req: Request, res: Response) => {
  try {
    const operator = (req as any).user?.name || '管理员'
    const result = fullBackup()
    res.json({
      success: true,
      data: {
        contracts: path.basename(result.contracts),
        milestones: path.basename(result.milestones),
        changelog: path.basename(result.changelog)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '备份失败' })
  }
})

// Download backup file
router.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    // Security: prevent directory traversal
    const safeName = path.basename(filename)
    const filepath = path.join(backupDir, safeName)

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ success: false, error: '文件不存在' })
      return
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
    fs.createReadStream(filepath).pipe(res)
  } catch (error) {
    res.status(500).json({ success: false, error: '下载失败' })
  }
})

// Delete backup file
router.delete('/files/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const safeName = path.basename(filename)
    const success = deleteBackupFile(safeName)
    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ success: false, error: '文件不存在' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

export default router
