# MyQuiz 响应式设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 MyQuiz 刷题助手添加移动端响应式适配，在 <1024px 下切换为单栏布局 + 底部固定 Tab 导航，桌面端保持现有三栏布局完全不变。

**Architecture:** 沿用 Tailwind `lg` 断点，桌面端通过 `lg:block` / `lg:grid` 强制显示三栏；移动端通过 JS 切换 `.hidden` 类控制单栏显示。底部导航栏使用 `lg:hidden` 确保桌面端不渲染。

**Tech Stack:** HTML5, Tailwind CSS v3, Vanilla JavaScript, Font Awesome 4.7

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `tools/MyQuiz/MyQuiz.html` | 修改 | 给三栏面板增加 `mobile-panel` ID，插入底部导航栏 HTML |
| `tools/MyQuiz/assets/css/style.css` | 修改 | 新增底部导航样式、移动端面板样式、安全区适配、移动端高度调整 |
| `tools/MyQuiz/assets/js/script.js` | 修改 | 新增 `switchMobileTab()` 函数及底部导航事件绑定 |
| `tools/MyQuiz/tests/responsive.test.js` | 创建 | 移动端 Tab 切换逻辑的单元测试 |
| `tools/MyQuiz/tests/test-runner.html` | 修改 | 引入 responsive 测试文件 |

---

### Task 1: HTML 结构改造

**Files:**
- Modify: `tools/MyQuiz/MyQuiz.html`

**背景：** 当前三个面板在移动端会自然堆叠，但我们需要让它们默认隐藏，并通过底部导航切换。

- [ ] **Step 1: 给左栏（题库管理）增加移动端标识**

  将左栏 div 增加 `id="mobile-panel-bank"` 和 `mobile-panel` class：

  ```html
  <!-- 修改前 -->
  <div class="lg:col-span-3 glass-effect rounded-2xl shadow-card p-6 fade-in quiz-left-panel overflow-y-auto">

  <!-- 修改后 -->
  <div id="mobile-panel-bank" class="mobile-panel lg:col-span-3 glass-effect rounded-2xl shadow-card p-6 fade-in quiz-left-panel overflow-y-auto">
  ```

- [ ] **Step 2: 给中栏（答题卡片）增加移动端标识**

  中栏外层已经是 `#quiz-panel`，直接增加 `mobile-panel` class 和移动端 ID：

  ```html
  <!-- 修改前 -->
  <div id="quiz-panel" class="lg:col-span-8 glass-effect rounded-2xl shadow-card p-6 fade-in h-full overflow-hidden">

  <!-- 修改后 -->
  <div id="mobile-panel-quiz" class="mobile-panel lg:col-span-8 glass-effect rounded-2xl shadow-card p-6 fade-in h-full overflow-hidden hidden lg:block">
  ```

  **注意：** 这里增加 `hidden lg:block` 是为了让移动端默认隐藏中栏，桌面端通过 `lg:block` 强制显示。

- [ ] **Step 3: 给右栏（题库浏览）增加移动端标识**

  ```html
  <!-- 修改前 -->
  <div id="side-panel" class="lg:col-span-4 glass-effect rounded-2xl shadow-card p-6 fade-in h-full flex flex-col quiz-right-panel overflow-y-auto">

  <!-- 修改后 -->
  <div id="mobile-panel-browse" class="mobile-panel lg:col-span-4 glass-effect rounded-2xl shadow-card p-6 fade-in h-full flex flex-col quiz-right-panel overflow-y-auto hidden lg:flex">
  ```

  **注意：** 右栏使用 `hidden lg:flex` 因为桌面端是 flex 布局。

- [ ] **Step 4: 调整主内容区移动端 padding**

  在主内容区外层增加移动端底部 padding：

  ```html
  <!-- 修改前 -->
  <div class="container mx-auto px-4 py-8 max-w-7xl">

  <!-- 修改后 -->
  <div class="container mx-auto px-4 py-8 max-w-7xl pb-20 lg:pb-8">
  ```

- [ ] **Step 5: 插入底部导航栏**

  在 `</body>` 标签之前（`#footer-container` 之后）插入底部导航：

  ```html
  <!-- 移动端底部导航栏 -->
  <nav id="mobile-bottom-nav" class="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 backdrop-blur-md border-t border-gray-200">
    <div class="flex items-center justify-around h-16 pb-safe">
      <button data-mobile-tab="bank" class="mobile-nav-btn active flex flex-col items-center justify-center flex-1 h-full text-primary">
        <i class="fa fa-folder-open text-lg mb-1" aria-hidden="true"></i>
        <span class="text-xs font-medium">题库</span>
      </button>
      <button data-mobile-tab="quiz" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 h-full text-gray-400">
        <i class="fa fa-pencil-square-o text-lg mb-1" aria-hidden="true"></i>
        <span class="text-xs font-medium">刷题</span>
      </button>
      <button data-mobile-tab="browse" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 h-full text-gray-400">
        <i class="fa fa-list-alt text-lg mb-1" aria-hidden="true"></i>
        <span class="text-xs font-medium">浏览</span>
      </button>
    </div>
  </nav>
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add tools/MyQuiz/MyQuiz.html
  git commit -m "feat(responsive): add mobile-panel IDs and bottom navigation bar"
  ```

---

### Task 2: CSS 样式补充

**Files:**
- Modify: `tools/MyQuiz/assets/css/style.css`

- [ ] **Step 1: 新增底部导航栏样式**

  在 `style.css` 末尾（`@media (max-width: 1024px)` 区域之前或之后均可）插入：

  ```css
  /* ------------------------------------------------------------
     11. 移动端底部导航栏
     ------------------------------------------------------------ */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .mobile-nav-btn {
    transition: all 0.2s ease;
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
  }

  .mobile-nav-btn:active {
    opacity: 0.7;
  }

  .mobile-nav-btn.active {
    color: #3b82f6;
  }

  .mobile-nav-btn.active i {
    color: #3b82f6;
  }
  ```

- [ ] **Step 2: 新增移动端面板切换样式**

  在底部导航样式之后插入：

  ```css
  /* ------------------------------------------------------------
     12. 移动端面板显示控制
     ------------------------------------------------------------ */
  @media (max-width: 1023px) {
    .mobile-panel {
      display: none;
    }

    .mobile-panel.active {
      display: block;
    }

    /* 右栏在移动端是 flex 布局，需要覆盖 */
    #mobile-panel-browse.mobile-panel.active {
      display: flex;
    }

    /* 取消移动端固定高度限制，改为自然流式 */
    .quiz-layout-wrapper {
      height: auto;
      min-height: auto;
      max-height: none;
    }

    .quiz-layout-wrapper > div {
      height: auto;
    }

    #main-content {
      height: auto;
      overflow: visible;
    }

    #quiz-panel,
    #side-panel {
      height: auto;
      overflow: visible;
    }

    #quiz-container {
      height: auto;
      overflow: visible;
    }

    /* 确保中栏在移动端默认显示（当它有 active 类时） */
    #mobile-panel-quiz.hidden {
      display: none;
    }
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add tools/MyQuiz/assets/css/style.css
  git commit -m "feat(responsive): add mobile bottom nav and panel styles"
  ```

---

### Task 3: JS 切换逻辑

**Files:**
- Modify: `tools/MyQuiz/assets/js/script.js`

- [ ] **Step 1: 在 script.js 底部新增移动端切换函数**

  在文件底部（或 DOMContentLoaded 事件之外的全局作用域）插入：

  ```javascript
  // ------------------------------------------------------------
  // 移动端底部导航 Tab 切换
  // ------------------------------------------------------------
  function switchMobileTab(tabName) {
    // 隐藏所有移动端面板
    document.querySelectorAll('.mobile-panel').forEach(function(panel) {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    });

    // 显示目标面板
    var target = document.getElementById('mobile-panel-' + tabName);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }

    // 更新底部导航激活样式
    document.querySelectorAll('#mobile-bottom-nav .mobile-nav-btn').forEach(function(btn) {
      if (btn.dataset.mobileTab === tabName) {
        btn.classList.add('active');
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-primary');
      } else {
        btn.classList.remove('active');
        btn.classList.remove('text-primary');
        btn.classList.add('text-gray-400');
      }
    });
  }

  function initMobileNav() {
    var nav = document.getElementById('mobile-bottom-nav');
    if (!nav) return;

    nav.querySelectorAll('.mobile-nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchMobileTab(btn.dataset.mobileTab);
      });
    });

    // 默认显示第一个 Tab（题库）
    // 仅在移动端断点下执行（通过检查导航栏是否可见）
    if (window.innerWidth < 1024) {
      switchMobileTab('bank');
    }
  }
  ```

- [ ] **Step 2: 在 DOMContentLoaded 中调用初始化**

  找到现有的 `DOMContentLoaded` 事件监听器，在其中加入：

  ```javascript
  document.addEventListener('DOMContentLoaded', function() {
    // ... 现有代码 ...

    // 初始化移动端底部导航
    initMobileNav();
  });
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add tools/MyQuiz/assets/js/script.js
  git commit -m "feat(responsive): add mobile tab switching logic"
  ```

---

### Task 4: 单元测试

**Files:**
- Create: `tools/MyQuiz/tests/responsive.test.js`
- Modify: `tools/MyQuiz/tests/test-runner.html`

- [ ] **Step 1: 创建 responsive 单元测试**

  ```javascript
  // responsive.test.js
  // 测试移动端 Tab 切换逻辑

  (function() {
    'use strict';

    var tests = {
      'switchMobileTab should show target panel and hide others': function() {
        // 准备：确保三个面板都在 DOM 中
        var bankPanel = document.getElementById('mobile-panel-bank');
        var quizPanel = document.getElementById('mobile-panel-quiz');
        var browsePanel = document.getElementById('mobile-panel-browse');

        if (!bankPanel || !quizPanel || !browsePanel) {
          throw new Error('Mobile panels not found in DOM');
        }

        // 执行：切换到 quiz
        switchMobileTab('quiz');

        // 断言：quiz 显示，其他隐藏
        assert(!quizPanel.classList.contains('hidden'), 'quiz panel should be visible');
        assert(bankPanel.classList.contains('hidden'), 'bank panel should be hidden');
        assert(browsePanel.classList.contains('hidden'), 'browse panel should be hidden');

        // 执行：切换到 browse
        switchMobileTab('browse');

        // 断言：browse 显示，其他隐藏
        assert(!browsePanel.classList.contains('hidden'), 'browse panel should be visible');
        assert(bankPanel.classList.contains('hidden'), 'bank panel should be hidden');
        assert(quizPanel.classList.contains('hidden'), 'quiz panel should be hidden');
      },

      'switchMobileTab should update nav button active state': function() {
        var bankBtn = document.querySelector('[data-mobile-tab="bank"]');
        var quizBtn = document.querySelector('[data-mobile-tab="quiz"]');

        if (!bankBtn || !quizBtn) {
          throw new Error('Mobile nav buttons not found');
        }

        // 执行：切换到 quiz
        switchMobileTab('quiz');

        // 断言：quiz 按钮激活，bank 按钮非激活
        assert(quizBtn.classList.contains('active'), 'quiz button should be active');
        assert(!bankBtn.classList.contains('active'), 'bank button should not be active');
        assert(quizBtn.classList.contains('text-primary'), 'quiz button should have primary color');
        assert(bankBtn.classList.contains('text-gray-400'), 'bank button should have gray color');
      },

      'initMobileNav should bind click events': function() {
        var quizBtn = document.querySelector('[data-mobile-tab="quiz"]');
        if (!quizBtn) {
          throw new Error('Quiz nav button not found');
        }

        // 模拟点击
        quizBtn.click();

        var quizPanel = document.getElementById('mobile-panel-quiz');
        assert(!quizPanel.classList.contains('hidden'), 'quiz panel should be visible after click');
      }
    };

    // 注册到测试运行器
    if (typeof window.testSuites === 'undefined') {
      window.testSuites = {};
    }
    window.testSuites.responsive = tests;
  })();
  ```

- [ ] **Step 2: 修改 test-runner.html 引入新测试**

  在 `test-runner.html` 的 `<script src="...">` 列表末尾添加：

  ```html
  <script src="responsive.test.js"></script>
  ```

- [ ] **Step 3: 运行测试**

  打开 `tools/MyQuiz/tests/test-runner.html`，确认 responsive 测试全部通过。

  预期结果：
  - `switchMobileTab should show target panel and hide others` → PASS
  - `switchMobileTab should update nav button active state` → PASS
  - `initMobileNav should bind click events` → PASS

- [ ] **Step 4: Commit**

  ```bash
  git add tools/MyQuiz/tests/responsive.test.js tools/MyQuiz/tests/test-runner.html
  git commit -m "test(responsive): add mobile tab switching unit tests"
  ```

---

### Task 5: 浏览器手动验证

**Files:** 无需修改，仅验证

- [ ] **Step 1: 桌面端回归验证**

  在浏览器中以 **≥1024px 宽度** 打开 `tools/MyQuiz/MyQuiz.html`：

  - [ ] 三栏布局正常显示，无错位
  - [ ] 左栏（题库管理）、中栏（答题区）、右栏（题库/错题 Tab）同时可见
  - [ ] 底部导航栏 **不可见**
  - [ ] 独立滚动正常（左栏、中栏、右栏可各自滚动）
  - [ ] 导入题库、答题、错题本功能正常使用
  - [ ] 题库浏览模式（点击"题库浏览"按钮）正常显示

- [ ] **Step 2: 移动端功能验证**

  打开浏览器 DevTools，切换到 **iPhone 14 Pro** 或类似移动设备（<1024px）：

  - [ ] 页面加载后默认显示"题库"面板（左栏内容）
  - [ ] 底部导航栏可见，包含三个 Tab：题库、刷题、浏览
  - [ ] 点击"刷题"切换到答题面板
  - [ ] 点击"浏览"切换到题库/错题面板，内部 Tab 切换正常
  - [ ] 点击"题库"返回题库管理面板
  - [ ] 主内容区最底部元素不被底部导航遮挡（可滚动到底部查看）
  - [ ] 从手机模式拖拽到桌面模式（>1024px），三栏自动恢复，底部导航消失

- [ ] **Step 3: Commit（如发现问题并修复后）**

  ```bash
  git add -A
  git commit -m "fix(responsive): address manual test findings"
  ```

---

## 自检清单

### Spec 覆盖检查

| 设计文档章节 | 对应任务 |
|-------------|---------|
| 断点策略（沿用 `lg`） | Task 1, 2 |
| 桌面端保持不变 | Task 1, 5 |
| 移动端单栏 + 底部导航 | Task 1, 2, 3 |
| 默认激活"题库"Tab | Task 3 |
| 三栏面板移动端适配 | Task 1, 2 |
| 样式隔离（`lg:hidden` 等） | Task 1, 2 |
| JS 切换逻辑 | Task 3 |
| 安全区适配 | Task 2 |
| 测试要点 | Task 4, 5 |

### Placeholder 检查

- [x] 无 "TBD" / "TODO" / "implement later"
- [x] 无 "Add appropriate error handling" 等模糊描述
- [x] 每个代码步骤包含完整代码
- [x] 每个测试步骤包含预期输出

### 命名一致性检查

- `switchMobileTab` — 在 Task 3 和 Task 4 中一致
- `initMobileNav` — 在 Task 3 中定义
- `mobile-panel` — CSS class 在 Task 1, 2, 3, 4 中一致
- `data-mobile-tab` — HTML 属性在 Task 1, 3, 4 中一致
- `mobile-nav-btn` — CSS class 在 Task 1, 2, 3, 4 中一致

---

## 执行方式选择

Plan complete and saved to `docs/superpowers/plans/2026-07-06-myquiz-responsive.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
