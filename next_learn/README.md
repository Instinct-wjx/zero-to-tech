# 岁时记 · 传统黄历（Next.js 版）

由 `html_learn/` 的原生 HTML/CSS/JS 版本改造而来，功能与原版完全一致：
农历查询、二十四节气、顺时养生、节日倒计时、月历落印、名号系统、水墨背景。

## 运行

```bash
npm install
npm run dev      # 开发模式 → http://localhost:3000
npm run build    # 生产构建
npm run start    # 运行生产构建
```

## 文件结构对照

| 原生文件 | Next.js 对应 | 说明 |
| --- | --- | --- |
| `index.html` | `app/layout.js` + `app/page.js` + `components/*.jsx` | 页面骨架拆成布局、首页与组件 |
| `style.css` | `app/globals.css` | 样式原样保留（字体改用 next/font） |
| `script.js` 第 1 部分 | `lib/lunar.js` | 历法纯函数，服务端/客户端通用 |
| `script.js` 第 2 部分 | `lib/paintings.js` | 六幅程序绘制的水墨画 |
| `script.js` 第 3 部分 | `components/` | 页面交互改为 React 组件 |

```
next_learn/
├── app/
│   ├── layout.js        # 根布局：next/font 字体、元数据、全局样式
│   ├── page.js          # 首页（服务端组件）
│   └── globals.css      # 原 style.css
├── components/
│   ├── AlmanacApp.jsx   # 主组件（时钟/查询/背景/名号状态）
│   ├── CalendarModal.jsx# 月历弹窗
│   ├── DetailModal.jsx  # 卷轴详情弹窗
│   └── UserModal.jsx    # 名号弹窗
└── lib/
    ├── lunar.js         # 农历/节气/节日/养生纯函数
    └── paintings.js     # 水墨画生成
```

## 改造要点（学习笔记）

- **App Router**：`app/` 目录即路由，`layout.js` 包全局，`page.js` 是首页
- **服务端 / 客户端组件**：`page.js` 是服务端组件（渲染静态装饰层）；
  含交互的组件顶部标注 `'use client'`
- **状态管理**：原版的 `document.getElementById` + `innerHTML` 改为
  `useState`（数据）+ `useMemo`（派生结果）+ `useEffect`（初始化/持久化）
- **名号与印记数据**：仍存于浏览器 localStorage，键名与原版一致
  （`suishiji.users` / `suishiji.user.<名号>`），旧数据可直接沿用
- **字体**：`next/font/google` 在构建时自动下载字体并本地化，
  通过 CSS 变量注入 `--font-brush-next` / `--font-body-next`

## 单独测试纯函数（无需浏览器）

```bash
node -e "import('./lib/lunar.js').then(L => console.log(L.solarToLunar(2026, 10, 26)))"
```
