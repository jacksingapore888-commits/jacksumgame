# 数字堆叠 (Sum Merge)

一款极具挑战性的数学益智游戏。通过组合数字达到目标和来消除方块。

## 部署到 GitHub 和 Vercel 指南

由于我是一个 AI 助手，无法直接访问您的 GitHub 或 Vercel 账户，请按照以下步骤手动完成部署：

### 1. 推送到 GitHub

1. 在 GitHub 上创建一个新的仓库（例如 `sum-merge-game`）。
2. 在本地终端（或您下载代码后的目录）执行以下命令：

```bash
# 初始化 git
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Sum Merge Game"

# 关联远程仓库 (请替换为您自己的仓库地址)
git remote add origin https://github.com/您的用户名/sum-merge-game.git

# 推送到主分支
git branch -M main
git push -u origin main
```

### 2. 部署到 Vercel

1. 登录 [Vercel 官网](https://vercel.com/)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入您刚刚创建的 GitHub 仓库。
4. Vercel 会自动识别这是一个 **Vite** 项目。
5. **配置环境变量 (可选)**:
   - 如果您的项目将来需要使用 Gemini AI，请在 "Environment Variables" 中添加 `GEMINI_API_KEY`。
6. 点击 **"Deploy"**。
7. 等待几秒钟，您的游戏就会在线运行了！

## 项目结构

- `src/App.tsx`: 核心游戏逻辑和 UI。
- `src/utils/gameUtils.ts`: 游戏辅助函数（生成方块、检查游戏结束等）。
- `src/constants.ts`: 游戏配置常量。
- `src/types.ts`: TypeScript 类型定义。

## 技术栈

- **React 19**
- **Vite** (构建工具)
- **Tailwind CSS 4** (样式)
- **Motion** (动画)
- **Lucide React** (图标)
- **Canvas Confetti** (特效)
