# MyQuiz 刷题助手 — 响应式设计规格文档

## 1. 背景与目标

MyQuiz 桌面端采用左-中-右三栏固定高度布局（题库管理 / 答题卡片 / 题库浏览与错题）。本设计的目标是在 **不破坏桌面端体验** 的前提下，为手机端（<1024px）提供完善的单栏适配，并通过底部固定导航栏在三栏之间快速切换。

## 2. 断点策略

沿用项目已有的 Tailwind CSS `lg` 断点：

| 断点 | 宽度 | 布局模式 |
|------|------|---------|
| `< 1024px` | 移动端 | 单栏 + 底部 Tab 导航 |
| `>= 1024px` | 桌面端 | 三栏并排（保持现有布局） |

## 3. 桌面端布局（保持不变）

```
┌─────────────────────────────────────────────────────────────┐
│  顶部标题栏                                                  │
├──────────┬──────────────────────────────┬───────────────────┤
│          │                              │                   │
│  左栏     │         中栏                  │      右栏          │
│  题库管理 │       答题卡片                │   题库 / 错题      │
│  + 设置   │                              │   (内部 Tab 切换)  │
│          │                              │                   │
│ lg:col-3 │        lg:col-8              │    lg:col-4       │
└──────────┴──────────────────────────────┴───────────────────┘
```

- 外层容器 `.quiz-layout-wrapper` 保持 `height: calc(100vh - 200px)`
- 三栏各自独立滚动，滚动条样式沿用现有定义

## 4. 移动端布局（< 1024px）

### 4.1 整体结构

```
┌─────────────────────────────┐
│        顶部标题栏            │
├─────────────────────────────┤
│                             │
│      当前激活的单栏面板       │
│    （题库 / 刷题 / 浏览）     │
│                             │
│                             │
├─────────────────────────────┤
│  📁 题库  │  📝 刷题  │  📋 浏览 │  ← 底部固定导航
└─────────────────────────────┘
```

- 三个面板默认全部 `hidden`，仅由底部导航激活的面板显示
- 默认激活第一个 Tab：**题库**（原左栏内容）
- 主内容区底部增加 padding（约 `pb-20`），防止内容被底部导航遮挡

### 4.2 底部导航栏（仅移动端）

```html
<nav id="mobile-bottom-nav" class="fixed bottom-0 left-0 right-0 z-50 lg:hidden ...">
  <button data-mobile-tab="bank">📁 题库</button>
  <button data-mobile-tab="quiz">📝 刷题</button>
  <button data-mobile-tab="browse">📋 浏览</button>
</nav>
```

**样式要求**：
- 背景使用玻璃态效果（`backdrop-blur` + 半透明白色），与项目视觉风格一致
- 高度约 64px，顶部加 1px 细边框分隔（`border-t border-gray-200`）
- 当前激活 Tab：图标与文字使用主色（`#3b82f6`）高亮，其余为灰色（`#9ca3af`）
- 每个 Tab 均分底部宽度，文字居中
- 适配 iPhone 底部安全区：`padding-bottom: env(safe-area-inset-bottom)`

**防泄露措施**：外层容器使用 `lg:hidden`，确保桌面端完全不渲染。

## 5. 三栏面板在移动端的适配

### 5.1 题库面板（原左栏）

- 单栏全宽显示，取消固定高度限制
- 保持原有上下结构：导入区域 → 分隔线 → 刷题设置
- 玻璃卡片 `rounded-2xl` 和 `shadow-card` 保留
- 导入区域的拖拽/点击区域在移动端适当增大，方便手指操作

### 5.2 刷题面板（原中栏）

- 单栏全宽显示，答题卡片占满屏幕宽度
- 选项按钮（`.option-btn`）保持现有样式，但确保最小点击高度不低于 48px（已满足）
- 题目文字在移动端保持可读性，无需额外缩放
- 结算页面统计卡片（`.result-stat`）在窄屏下改为单列堆叠（现有 `@media (max-width: 1024px)` 已做部分调整，如需可进一步优化）

### 5.3 浏览面板（原右栏）

- 单栏全宽显示
- **内部保留"题库 / 错题" Tab 切换**，样式与桌面端一致
- 列表卡片（`.bank-card`）占满宽度，保持原有 hover/active 效果
- 题库浏览模式（`bank-mode`）下的左右分栏在移动端自然堆叠为单栏（现有 `@media (min-width: 1024px)` 已处理）

### 5.4 样式隔离措施

- 底部导航：`lg:hidden`
- 移动端主内容区底部 padding：`pb-20 lg:pb-0`
- 桌面端面板显示：通过 `lg:block` / `lg:grid` / `lg:flex` 强制显示，不受 JS 切换状态影响
- 移动端面板隐藏：通过 `.hidden` 类控制，桌面端媒体查询覆盖

## 6. JS 切换逻辑

```javascript
function switchMobileTab(tabName) {
  // 1. 隐藏所有移动端面板
  document.querySelectorAll('.mobile-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // 2. 显示目标面板
  const target = document.getElementById('mobile-panel-' + tabName);
  if (target) target.classList.remove('hidden');

  // 3. 更新底部导航激活样式
  document.querySelectorAll('#mobile-bottom-nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mobileTab === tabName);
  });
}

// 初始化：绑定底部导航点击事件
document.querySelectorAll('#mobile-bottom-nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    switchMobileTab(btn.dataset.mobileTab);
  });
});
```

**关键约束**：
- 仅在页面初始化时绑定一次事件，无需监听 resize
- 从移动端缩放到桌面端时，CSS 媒体查询自动接管显示逻辑，JS 无需额外处理
- 从桌面端缩放到移动端时，默认显示"题库"Tab（页面刷新后或首次进入移动端断点）

## 7. 文件改动范围

| 文件 | 改动内容 |
|------|---------|
| `tools/MyQuiz/MyQuiz.html` | 1. 给三个面板增加 `mobile-panel` ID 和对应 class<br>2. 在 `</body>` 前插入底部导航栏 HTML<br>3. 引入底部导航的初始化逻辑 |
| `tools/MyQuiz/assets/css/style.css` | 1. 新增底部导航栏样式（`.mobile-bottom-nav`、`.mobile-nav-btn`、`.mobile-nav-btn.active`）<br>2. 新增移动端面板显示/隐藏的辅助样式<br>3. 补充移动端的安全区适配（`env(safe-area-inset-bottom)`）<br>4. 调整 `.quiz-layout-wrapper` 在移动端的高度限制（取消或改为 `auto`） |
| `tools/MyQuiz/assets/js/script.js` | 新增 `switchMobileTab()` 函数及底部导航事件绑定 |

## 8. 测试要点

1. **桌面端回归**：≥1024px 时三栏布局、独立滚动、题库浏览模式均保持原有行为
2. **移动端切换**：<1024px 时底部三个 Tab 可正常切换，无内容重叠或空白
3. **边界尺寸**：在 1024px 附近反复缩放，确认布局切换自然，无元素闪烁或残留
4. **内容防遮挡**：移动端主内容区最底部元素不会被底部导航遮挡
5. **安全区**：在 iPhone Safari 等带底部手势条的浏览器中，底部导航文字不被遮挡

## 9. 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-07-06 | 初始设计文档 |
