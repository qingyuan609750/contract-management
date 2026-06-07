# 合同管理系统 - 免费部署到 Render 完整指南

## 概述

本指南将帮助你把合同管理系统部署到互联网上，让任何人都能通过链接访问。使用 **Render** 免费服务，无需购买服务器。

---

## 前置条件

1. **GitHub 账号**（免费注册：https://github.com）
2. **Render 账号**（用 GitHub 直接登录：https://render.com）
3. 本项目代码已准备就绪

---

## 第一步：把代码推送到 GitHub

### 1.1 初始化 Git 仓库

在项目根目录打开终端，执行：

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "合同管理系统 v1.0"
```

### 1.2 创建 GitHub 仓库

1. 打开 https://github.com/new
2. 仓库名称填写：`contract-management`
3. 选择 **Public**（公开，免费）
4. 点击 **Create repository**

### 1.3 推送代码到 GitHub

在终端执行（将 `你的用户名` 替换为你的 GitHub 用户名）：

```bash
git remote add origin https://github.com/你的用户名/contract-management.git
git branch -M main
git push -u origin main
```

推送完成后，刷新 GitHub 页面应该能看到代码。

---

## 第二步：在 Render 部署

### 2.1 登录 Render

1. 访问 https://render.com
2. 点击 **Sign In**，选择 **GitHub** 登录
3. 授权 Render 访问你的 GitHub 仓库

### 2.2 创建 Blueprint 部署

1. 登录后点击右上角的 **New +**
2. 选择 **Blueprint**
3. 在列表中找到你的 `contract-management` 仓库
4. 点击 **Connect**
5. Render 会自动读取 `render.yaml` 配置文件
6. 确认服务名称为 `contract-management-system`
7. 点击页面底部的 **Apply**

### 2.3 等待部署完成

- 首次部署需要 **3-5 分钟**
- 可以在 Render 控制台看到构建日志
- 构建完成后，状态变为 **Live**

### 2.4 获取访问链接

部署成功后，Render 会分配一个免费域名：

```
https://contract-management-system-xxx.onrender.com
```

（`xxx` 是随机生成的字符串）

把这个链接发给任何人，他们都能访问你的网站。

---

## 第三步：首次使用

### 3.1 登录系统

打开部署后的链接，使用默认管理员账号登录：

| 项目 | 值 |
|------|-----|
| 用户名 | `admin` |
| 密码 | `admin123` |

### 3.2 立即修改默认密码

1. 登录后进入 **系统设置**
2. 在 **修改密码** 区域修改 admin 密码
3. 这是最重要的一步，防止他人用默认密码登录

### 3.3 创建员工账号

1. 进入 **系统设置 → 用户管理**
2. 点击 **添加用户**
3. 为每个员工创建独立账号（用户名、姓名、初始密码）
4. 普通员工选择角色 **普通用户**

---

## 第四步：数据安全（重要）

### 4.1 备份文件位置

系统每次操作合同都会自动备份到：

- **Render 服务器**：`/data/backups/`
- 这些文件在 Render 控制台看不到，但数据不会丢失

### 4.2 定期下载备份

1. 登录系统 → **系统设置 → 数据备份**
2. 点击备份文件右侧的 **下载** 按钮
3. 将 CSV 文件保存到本地电脑

### 4.3 防止服务休眠

Render 免费版 15 分钟无访问会自动休眠，下次访问需要等待 30 秒唤醒。

**解决方案**：使用 UptimeRobot 定时访问

1. 访问 https://uptimerobot.com
2. 注册免费账号
3. 点击 **Add New Monitor**
4. Monitor Type 选择 **HTTP(s)**
5. Friendly Name 填写：`合同管理系统`
6. URL 填写你的 Render 域名
7. Monitoring Interval 选择 **5 minutes**
8. 点击 **Create Monitor**

这样每 5 分钟会访问一次你的网站，服务就不会休眠。

---

## 第五步：绑定自定义域名（可选）

如果你想用自己的域名（如 `contract.yourcompany.com`）：

### 5.1 购买域名

推荐平台：
- 阿里云（https://wanwang.aliyun.com）约 30-70元/年
- 腾讯云（https://dnspod.cloud.tencent.com）约 30-70元/年

### 5.2 在 Render 配置域名

1. 打开 Render 控制台 → 你的服务 → Settings
2. 找到 **Custom Domains** 区域
3. 点击 **Add Custom Domain**
4. 输入你的域名，如 `contract.yourcompany.com`
5. Render 会显示一个 CNAME 记录值

### 5.3 在域名服务商添加解析

1. 登录你的域名服务商控制台
2. 找到 DNS 解析/域名解析设置
3. 添加一条 **CNAME** 记录：
   - 主机记录：`contract`
   - 记录值：Render 提供的 CNAME 值
   - TTL：默认
4. 保存后等待 10-30 分钟生效

---

## 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
1. `render.yaml` 文件是否在项目根目录
2. `package.json` 中的 `build` 和 `start` 脚本是否正确
3. 查看 Render 构建日志，根据错误信息修复

### Q: 数据会丢失吗？

A: 不会。Render 免费版提供 1GB 持久化磁盘，SQLite 数据库和备份文件都存储在这里。即使重新部署，数据也不会丢失。

### Q: 免费版有什么限制？

| 项目 | 限制 |
|------|------|
| 运行时间 | 每月 750 小时（足够整月）|
| 休眠 | 15分钟无访问自动休眠 |
| 磁盘空间 | 1GB |
| 带宽 | 100GB/月 |
| 费用 | **完全免费** |

### Q: 如何更新网站？

A: 修改代码后推送到 GitHub，Render 会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push
```

---

## 部署完成检查清单

- [ ] 代码已推送到 GitHub
- [ ] Render Blueprint 部署成功
- [ ] 能用域名访问网站
- [ ] 用 admin/admin123 能登录
- [ ] 已修改默认密码
- [ ] 已创建员工账号
- [ ] 已配置 UptimeRobot 防止休眠（可选）
- [ ] 已绑定自定义域名（可选）

---

## 技术支持

如遇到问题，可以：
1. 查看 Render 构建日志排查错误
2. 检查 `DEPLOY.md` 中的常见问题
3. 确认 `render.yaml` 配置正确
