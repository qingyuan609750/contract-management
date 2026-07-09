# 合同管理系统 - 免费部署指南

## 概述

本指南提供**三种免费部署方式**，帮助你把合同管理系统部署到互联网上：

| 方式 | 适合人群 | 难度 | 国内访问 |
|------|---------|------|---------|
| **Railway** | 想快速部署，不用买服务器 | 简单 | 较快 |
| **Render** | 国外用户或网络环境好 | 简单 | 较慢/打不开 |
| **Docker** | 自己有服务器或想本地运行 | 中等 | 取决于服务器位置 |

> **国内用户推荐**：优先使用 **Railway**（https://railway.app），访问速度和稳定性都比 Render 好。

---

## 本次版本新增功能

- **项目管理模块**：一个项目可包含甲方、乙方、丙方等多方合作方，记录各自介绍与联系方式
- **成员与资金分成**：支持多名员工参与项目，老板可按分工设置不同比例（%）的资金分配
- **权限细则化**：可为不同员工单独设置 7 项细粒度权限（查看、编辑、删除、管理成员、合作方、资金、里程碑）
- **项目关联合同**：合同可归属到具体项目

---

## 方式一：Railway 部署（推荐，国内可用）

### 1.1 前置条件

1. **GitHub 账号**（https://github.com）
2. 代码已推送到 GitHub

> 如果 GitHub 打不开，请使用 Gitee 管理代码，但部署时仍需要 GitHub 账号授权 Railway。

### 1.2 推送代码到 GitHub

```bash
git init
git add .
git commit -m "合同管理系统 v2.0"
git remote add origin https://github.com/你的用户名/contract-management.git
git branch -M main
git push -u origin main
```

### 1.3 在 Railway 部署

1. 打开 https://railway.app（国内可以访问）
2. 点击 **Start a New Project**
3. 选择 **Deploy from GitHub repo**
4. 授权 Railway 访问你的 GitHub
5. 选择 `contract-management` 仓库
6. Railway 会自动检测 `Dockerfile` 并使用 Docker 构建
7. 等待构建完成（约 3-5 分钟）

### 1.4 添加持久化存储（重要）

SQLite 数据库需要持久化存储，否则每次重新部署数据会丢失：

1. 在 Railway 项目页面，点击你的服务
2. 进入 **Settings** → **Volumes**
3. 点击 **New Volume**
4. Mount Path 填写：`/data`
5. 点击 **Create Volume**

### 1.5 获取访问链接

1. 进入 **Settings** → **Networking**
2. 点击 **Generate Domain**
3. Railway 会分配一个免费域名，如：
   ```
   https://contract-management-production-xxx.up.railway.app
   ```
4. 打开这个链接即可访问你的网站

### 1.6 重新部署

修改代码后推送到 GitHub，Railway 会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push
```

---

## 方式二：Render 部署（国外用户推荐）

> **注意**：Render（https://render.com）在国内部分地区打不开或访问很慢。如果你在国外或网络环境好，可以使用此方式。

### 2.1 前置条件

1. **GitHub 账号**
2. **Render 账号**（用 GitHub 登录）

### 2.2 创建 Blueprint 部署

1. 登录 https://render.com
2. 点击 **New +** → **Blueprint**
3. 找到你的 `contract-management` 仓库
4. 点击 **Connect**
5. Render 自动读取 `render.yaml`
6. 点击 **Apply**
7. 等待 3-5 分钟部署完成

### 2.3 获取访问链接

部署成功后，Render 会分配免费域名：
```
https://contract-management-system-xxx.onrender.com
```

---

## 方式三：Docker 部署（自己有服务器）

如果你有阿里云、腾讯云、或自己的服务器，可以用 Docker 一键部署。

### 3.1 服务器要求

- 任意云服务器（1核2G即可）
- 已安装 Docker 和 Docker Compose

### 3.2 上传代码到服务器

```bash
# 在服务器上克隆代码
git clone https://github.com/你的用户名/contract-management.git
cd contract-management
```

### 3.3 启动服务

```bash
docker-compose up -d --build
```

服务会在后台运行，访问 `http://服务器IP:3001` 即可。

### 3.4 数据持久化

数据库和备份文件保存在 `./data` 目录，即使容器重启也不会丢失。

### 3.5 更新网站

```bash
git pull
docker-compose up -d --build
```

---

## 首次使用

### 登录系统

使用默认管理员账号登录：

| 项目 | 值 |
|------|-----|
| 用户名 | `admin` |
| 密码 | `admin123` |

### 立即修改默认密码

1. 登录后进入 **系统设置**
2. 修改 admin 密码
3. 这是最重要的一步

### 创建员工账号

1. 进入 **系统设置 → 用户管理**
2. 为每个员工创建独立账号
3. 普通员工选择角色 **普通用户**

### 创建项目

1. 点击左侧 **项目管理**
2. 点击 **新建项目**
3. 填写基本信息
4. 在 **合作方** 标签页添加甲方、乙方等
5. 在 **成员与分成** 标签页设置分成比例
6. 在 **权限细则** 标签页配置员工权限

---

## 数据安全

### 自动备份

系统每次操作合同/项目都会自动备份 CSV 文件。

- **Railway/Render**：存储在 `/data/backups/`
- **Docker**：存储在 `./data/backups/`

### 定期下载备份

1. 登录系统 → **系统设置 → 数据备份**
2. 点击备份文件右侧的 **下载** 按钮
3. 保存到本地电脑

---

## 常见问题

### Q: Railway 部署失败怎么办？

A: 检查以下几点：
1. `Dockerfile` 是否在项目根目录
2. `railway.toml` 是否存在
3. 是否添加了 `/data` 持久化卷
4. 查看 Railway 构建日志排查错误

### Q: 数据会丢失吗？

A: 只要正确配置了持久化存储（Railway 的 Volume 或 Docker 的挂载），数据就不会丢失。

### Q: 免费版有什么限制？

**Railway 免费版**：
- 每月 5 美元免费额度
- 足够一个小型网站运行整月
- 有持久化存储

**Render 免费版**：
- 每月 750 小时运行时间
- 1GB 磁盘空间
- 15 分钟无访问自动休眠

### Q: 国内访问慢怎么办？

A: 如果 Railway 访问也慢，建议：
1. 购买国内云服务器（阿里云/腾讯云轻量应用服务器，约 100 元/年）
2. 使用上面的 Docker 方式部署
3. 或者购买一个国内 CDN 加速域名

---

## 技术支持

如遇到问题，可以：
1. 查看 Railway/Render 构建日志
2. 检查 `Dockerfile` 和 `railway.toml` 配置
3. 确认持久化存储已正确挂载
