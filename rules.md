# 游一八工具箱添加工具规范

## 1. 核心原则

### 1.1 代码复用优先
- **必须优先**使用 `assets` 文件夹内的可复用资源
- **CSS 复用**: 优先使用 `../../assets/css/common.css` 中定义的样式类
- **JavaScript 复用**: 优先使用 `../../assets/js/common.js` 中提供的函数
- 仅在需要工具特定功能时才创建本地样式和脚本文件

### 1.2 一致性原则
- 保持与现有工具一致的界面风格和用户体验
- 遵循统一的命名规范和目录结构
- 确保所有工具使用相同的技术栈和依赖管理方式

### 1.3 文档同步
- **必须**更新工具的更新日志
- **必须**更新 `readme.md` 中的工具信息
- 确保文档与实际功能保持同步

## 2. 工具添加流程

### 2.1 创建目录结构
1. 在 `tools` 文件夹下新建一个文件夹，命名为当前工具的名称（使用驼峰命名或 Pascal 命名，保持一致性）
2. 在工具目录内创建以下结构：
   ```
   tools/工具名称/
   ├── 工具名称.html        # 工具主页面
   └── assets/             # 工具特定资源（可选）
       ├── css/
       │   └── style.css   # 工具特定样式（仅在需要时创建）
       └── js/
           └── script.js   # 工具特定脚本（仅在需要时创建）
   ```

### 2.2 更新主页卡片
1. 在 `index.html` 中复制工具卡片模板
2. 如果有"即将上线"字样的卡片，则替换为当前工具
3. 修改工具名称、描述、图标路径和按钮链接
4. 确保添加 `recordToolUsage('工具名称')` 点击事件

### 2.3 创建工具页面
1. **复制现有工具页面**（如 `ImageCompress.html` 或 `Task!.html`）作为模板
2. 修改页面标题、描述和具体功能实现
3. **必须**保持以下引用结构：
   ```html
   <!-- 引入通用样式（必须） -->
   <link rel="stylesheet" href="../../assets/css/common.css">
   <!-- 引入工具特定样式（可选） -->
   <link rel="stylesheet" href="assets/css/style.css">
   
   <!-- 引入通用脚本（必须） -->
   <script src="../../assets/js/common.js"></script>
   <!-- 引入工具特定脚本（可选） -->
   <script src="assets/js/script.js"></script>
   ```

### 2.4 更新文档
1. **更新 readme.md**：添加工具卡片，包括工具名称、描述、图标路径和按钮链接
2. **更新更新日志**：在工具页面的 `changelogData` 中添加初始版本记录

## 3. 资源复用规范

### 3.1 CSS 复用
- **优先**使用 `../../assets/css/common.css` 中定义的样式类
- 包括：玻璃效果、动画效果、滚动条样式、主题切换样式、模态框样式等
- 仅在需要工具特定样式时才在本地 `style.css` 中添加
- 避免重复定义已在 `common.css` 中存在的样式

### 3.2 JavaScript 复用
- **优先**使用 `../../assets/js/common.js` 中提供的函数
- 推荐复用的功能：
  - `initModal()` - 通用弹窗控制
  - `openModal()`, `closeModal()` - 模态框操作
  - `storageGet()`, `storageSet()`, `storageRemove()`, `storageClear()` - 本地存储操作
  - `formatDate()` - 日期格式化
  - `formatFileSize()` - 文件大小格式化
  - `showToast()` - 显示提示消息
  - `getBrowserInfo()` - 获取浏览器信息
  - `renderChangelog()` - 渲染更新日志
  - `toggleTheme()`, `loadTheme()` - 主题切换功能
- 在工具特定脚本中仅实现工具核心逻辑

### 3.3 HTML 结构复用
- 复用现有的页面布局结构，包括头部、功能按钮区域、主要内容区、弹窗和底部信息
- 复用现有的模态框结构，如历史记录、开发者工具、更新日志等
- 保持一致的卡片样式和交互模式

## 4. 工具页面模板

### 4.1 完整模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工具名称</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23eff6ff'/%3E%3Cstop offset='100%25' style='stop-color:%23e0e7ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' fill='url(%23bg)'/%3E%3Ctext x='16' y='22' font-family='Inter, system-ui, sans-serif' font-size='14' font-weight='bold' text-anchor='middle' fill='%233b82f6'%3E工具名称%3C/text%3E%3C/svg%3E" type="image/svg+xml">
    <!-- Tailwind CSS v3 -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#64748b',
                        accent: '#f43f5e',
                        neutral: '#f1f5f9',
                        'neutral-dark': '#334155'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif']
                    },
                    boxShadow: {
                        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    </script>
    <!-- 通用样式（必须） -->
    <link rel="stylesheet" href="../../assets/css/common.css">
    <!-- 工具特定样式（可选） -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-neutral-dark">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- 顶部信息区 -->
        <header class="mb-8 text-center">
            <h1 class="text-4xl font-bold text-primary mb-2 fade-in">工具名称</h1>
            <p class="text-xl text-secondary max-w-2xl mx-auto fade-in">
                工具描述
            </p>
        </header>

        <!-- 功能按钮区域 -->
        <div class="text-center mb-8 flex justify-center space-x-4">
            <!-- 历史记录按钮（可选） -->
            <button id="history-btn" class="bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-history mr-2"></i> 历史记录
            </button>
            <!-- 开发者选项按钮（推荐） -->
            <button id="dev-tools-btn" class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-code mr-2"></i> 开发者选项
            </button>
        </div>

        <!-- 主要内容区 -->
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
            <!-- 工具功能区域 -->
            <div class="glass-effect rounded-xl shadow-card p-6 fade-in">
                <h2 class="text-2xl font-bold text-neutral-dark mb-4">功能标题</h2>
                <!-- 功能实现 -->
            </div>
        </div>
    </div>

    <!-- 历史记录弹窗（可选） -->
    <div id="history-modal" class="fixed inset-0 z-50 hidden">
        <!-- 遮罩层 -->
        <div id="history-overlay" class="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <!-- 弹窗容器 -->
        <div id="history-container" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] glass-effect rounded-xl shadow-lg flex flex-col">
            <!-- 弹窗头部 -->
            <div id="history-header" class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-neutral-dark flex items-center">
                    <i class="fa fa-history mr-2 text-secondary"></i> 历史记录
                </h2>
                <button id="history-close" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <i class="fa fa-times text-secondary"></i>
                </button>
            </div>
            
            <!-- 历史记录列表 -->
            <div class="flex-1 overflow-y-auto p-6">
                <div id="history-list" class="space-y-4">
                    <!-- 历史记录将通过JavaScript动态生成 -->
                    <div class="text-center text-secondary py-8" id="empty-history">
                        <i class="fa fa-clock-o text-4xl mb-3 opacity-50"></i>
                        <p>暂无历史记录</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 开发者工具弹窗（推荐） -->
    <div id="dev-tools-modal" class="fixed inset-0 z-50 hidden">
        <!-- 遮罩层 -->
        <div id="dev-tools-overlay" class="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <!-- 弹窗容器 -->
        <div id="dev-tools-container" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] glass-effect rounded-xl shadow-lg flex flex-col">
            <!-- 弹窗头部 -->
            <div id="dev-tools-header" class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-neutral-dark flex items-center">
                    <i class="fa fa-code mr-2 text-gray-700"></i> 开发者选项
                </h2>
                <button id="dev-tools-close" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <i class="fa fa-times text-secondary"></i>
                </button>
            </div>
            
            <!-- 开发者工具内容 -->
            <div class="flex-1 overflow-y-auto p-6">
                <h3 class="text-lg font-semibold mb-4">调试功能</h3>
                
                <!-- 其他调试功能 -->
                <div class="space-y-4">
                    <div>
                        <h4 class="font-medium mb-2">数据管理</h4>
                        <div class="flex flex-wrap gap-2">
                            <button id="clear-all" class="bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                                <i class="fa fa-trash mr-2"></i> 清空所有
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 更新日志弹窗（必须） -->
    <div id="changelog-modal" class="fixed inset-0 z-50 hidden">
        <!-- 遮罩层 -->
        <div id="changelog-overlay" class="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <!-- 弹窗容器 -->
        <div id="changelog-container" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] glass-effect rounded-xl shadow-lg flex flex-col">
            <!-- 弹窗头部 -->
            <div id="changelog-header" class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-neutral-dark flex items-center">
                    <i class="fa fa-list-alt mr-2 text-secondary"></i> 更新日志
                </h2>
                <button id="changelog-close" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <i class="fa fa-times text-secondary"></i>
                </button>
            </div>
            
            <!-- 更新日志内容 -->
            <div class="flex-1 overflow-y-auto p-6">
                <div id="changelog-content" class="space-y-6">
                    <!-- 更新日志将通过JavaScript动态生成 -->
                </div>
            </div>
        </div>
    </div>
    
    <div class="container mx-auto px-4 py-2 max-w-6xl">
        <div class="text-center text-gray-500 text-sm">工具名称 v1.0.0beta 作者:游一八 power by Trae <a href="#" id="changelog-btn" class="text-blue-500 underline ml-2">更新日志</a></div>
    </div>

    <!-- 通用脚本（必须） -->
    <script src="../../assets/js/common.js"></script>
    <!-- 工具特定脚本（可选） -->
    <script src="assets/js/script.js"></script>
    <script>
        // 更新日志数据（必须）
        const changelogData = [
            {
                version: '1.0.0',
                date: '发布日期', // 例如: '2026-02-01',
                changes: [
                    '添加工具核心功能',
                    '优化用户界面',
                    '实现历史记录功能'
                ]
            }
            // 后续版本更新记录...
        ];

        // 工具特定初始化代码
        document.addEventListener('DOMContentLoaded', function() {
            // 加载主题设置
            loadTheme();
            
            // 初始化主题切换
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', toggleTheme);
            }
            
            // 初始化模态框
            initModal('changelog-modal', 'changelog-btn', 'changelog-close', 'changelog-overlay');
            initModal('dev-tools-modal', 'dev-tools-btn', 'dev-tools-close', 'dev-tools-overlay');
            
            // 这里添加工具特定的初始化代码
        });
    </script>
</body>
</html>
```

## 5. 更新日志规范

### 5.1 数据结构
```javascript
const changelogData = [
    {
        version: '版本号', // 例如: '1.0.0',
        date: '发布日期', // 例如: '2026-02-01',
        changes: [
            '更新内容1',
            '更新内容2',
            '更新内容3'
        ]
    }
    // 更多版本记录...
];
```

### 5.2 更新要求
- **每次添加工具**：必须在 `changelogData` 中添加初始版本记录
- **每次功能更新**：必须在 `changelogData` 中添加新版本记录
- **版本号规则**：使用语义化版本号（Major.Minor.Patch）
- **日期格式**：使用 ISO 格式（YYYY-MM-DD）
- **更新内容**：清晰描述功能添加、修复和改进

## 6. README.md 更新规范

### 6.1 工具卡片添加
在 `readme.md` 中添加工具卡片，包括：
- 工具名称
- 工具描述
- 图标路径
- 按钮链接

### 6.2 格式要求
- 保持与现有工具卡片一致的格式
- 确保链接路径正确
- 提供清晰的工具功能说明

## 7. 最佳实践

### 7.1 代码组织
- 模块化JavaScript代码
- 优先使用assets中的可复用代码
- 分离通用功能到 common.js
- 页面特定功能在各自页面实现

### 7.2 性能优化
- 最小化工具特定的CSS和JavaScript代码
- 优先使用CDN加载第三方库
- 避免重复的DOM操作
- 使用事件委托处理动态生成的元素

### 7.3 用户体验
- 保持一致的界面风格
- 提供清晰的操作反馈
- 实现合理的错误处理
- 确保响应式设计适配不同设备

## 8. 技术规范

### 8.1 技术栈
- HTML5
- CSS3 (Tailwind CSS v3)
- JavaScript (ES6+)
- Font Awesome 4.7.0

### 8.2 数据存储
- 使用 `localStorage` 存储任务和历史记录数据
- 数据格式: JSON

### 8.3 响应式设计
- **sm**: 640px - 小屏幕手机
- **lg**: 1024px - 平板和桌面

### 8.4 可访问性
- 使用适当的HTML标签
- 合理的标题层级
- 表单标签关联
- 支持键盘导航
- 确保颜色对比度符合标准