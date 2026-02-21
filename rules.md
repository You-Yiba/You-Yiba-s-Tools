# 游一八工具箱设计规范

## 1. 配色方案

### 主色调
- **primary**: #3b82f6 (蓝色) - 用于主要按钮、图标和强调元素
- **secondary**: #64748b (灰色) - 用于次要文本、标签和边框
- **accent**: #f43f5e (红色) - 用于警告、错误和删除操作
- **neutral**: #f1f5f9 (浅灰色) - 用于背景和卡片
- **neutral-dark**: #334155 (深灰色) - 用于主要文本

### 背景色
- 全局背景: `bg-gradient-to-br from-blue-50 to-indigo-100` - 从浅蓝色到靛蓝色的渐变
- 卡片背景: 白色或玻璃态效果
- 表单背景: 白色
- 模态框背景: 玻璃态效果

### 功能色
- 已完成任务: 绿色 (#10b981)
- 待完成任务: 主色调蓝色 (#3b82f6)
- 逾期任务: 强调色红色 (#f43f5e)

## 2. UI设计

### 整体风格
- **现代简约** - 干净的界面，充分利用空白空间
- **响应式设计** - 适配不同屏幕尺寸
- **卡片式布局** - 模块化设计，每个功能区块独立成卡片
- **玻璃态效果** - 使用 `glass-effect` 类实现半透明模糊效果
- **阴影层次** - 使用不同层级的阴影区分元素优先级
  - `shadow-card`: 基础卡片阴影
  - `shadow-card-hover`: 悬停时的增强阴影

### 组件设计

#### 按钮
- **主要按钮**: 蓝色背景，白色文字，悬停时背景透明度降低
- **次要按钮**: 灰色背景，白色文字
- **危险按钮**: 红色背景，白色文字
- **禁用按钮**: 灰色背景，降低透明度，cursor-not-allowed

#### 卡片
- 圆角: `rounded-xl`
- 内边距: `p-6`
- 阴影: `shadow-card`
- 悬停效果: `hover:shadow-card-hover`
- 玻璃态: `glass-effect`

#### 表单元素
- 输入框: 浅灰色边框，聚焦时蓝色边框和阴影
- 标签: 次要文本颜色，小字体
- 选择框: 与输入框风格一致
- 单选按钮: 自定义样式，选中时蓝色

#### 模态框
- 居中定位: `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
- 背景遮罩: 黑色半透明 `bg-black bg-opacity-50`
- 玻璃态容器: `glass-effect`
- 最大宽度和高度限制
- 可拖动头部

### 排版
- **字体**: Inter, system-ui, sans-serif
- **标题层级**:
  - H1: 4-5xl, 粗体, 主色调
  - H2: 2xl, 粗体, 深灰色
  - H3: lg, 半粗体, 深灰色
- **正文**: 16px, 深灰色
- **次要文本**: 14px, 灰色
- **辅助文本**: 12px, 浅灰色

### 图标
- 使用 Font Awesome 4.7.0
- 图标颜色与文本颜色保持一致
- 图标大小根据上下文调整

## 3. 页面结构

### 通用结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 元数据和外部资源 -->
    <!-- Tailwind CSS 配置 -->
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-neutral-dark">
    <div class="container mx-auto px-4 py-8 max-w-[size]">
        <!-- 顶部信息区 -->
        <header class="mb-[spacing] text-center">
            <h1 class="text-[size] font-bold text-primary mb-[spacing]">标题</h1>
            <p class="text-[size] text-secondary max-w-[size] mx-auto">描述</p>
        </header>

        <!-- 主要内容区 -->
        <div class="[layout]">
            <!-- 功能模块 -->
        </div>

        <!-- 功能按钮区域 -->
        <div class="text-center mb-[spacing] flex justify-center space-x-4">
            <!-- 按钮组 -->
        </div>

        <!-- 底部信息区 -->
        <footer class="text-center text-gray-500 text-sm">
            <p>版权信息</p>
        </footer>
    </div>

    <!-- 脚本 -->
    <script src="assets/js/common.js"></script>
    <script>
        // 页面特定脚本
    </script>

    <!-- 模态框 -->
    <!-- 开发者工具弹窗 -->
    <!-- 其他弹窗 -->
</body>
</html>
```

### 工具卡片结构 (index.html)
```html
<div class="tool-card glass-effect rounded-xl shadow-card hover:shadow-card-hover p-6 cursor-pointer fade-in">
    <div class="flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <img src="path/to/icon" alt="工具图标" class="w-10 h-10">
        </div>
        <h2 class="text-2xl font-bold text-neutral-dark mb-2">工具名称</h2>
        <p class="text-secondary mb-4">工具描述</p>
        <div class="mt-auto w-full">
            <button class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <i class="fa fa-arrow-right mr-2"></i> 打开工具
            </button>
        </div>
    </div>
</div>
```
### 更新日志弹窗结构
```html
<!-- 更新日志弹窗 -->
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
```


## 4. 功能实现

### 数据存储
- 使用 `localStorage` 存储任务和历史记录数据
- 数据格式: JSON


### 核心功能实现


####  开发者工具
- 添加测试数据功能
- 数据导入导出
- 清空所有数据
- 其他调试功能

#### 更新日志
- 记录每次更新的功能添加、修复和改进
- 提供版本号和日期信息

### 交互实现

#### 事件处理
- 使用 `addEventListener` 绑定事件
- 事件委托处理动态生成的元素
- 表单提交事件处理
- 按钮点击事件处理

#### 动画效果
- 淡入效果: `fade-in` 类
- 悬停效果: `hover:` 伪类
- 过渡动画: `transition-colors` 等

#### 模态框
- 使用 `initModal` 函数初始化模态框
- 实现模态框的显示/隐藏
- 实现模态框的拖动功能
- 点击遮罩层关闭模态框



## 5. 响应式设计

### 断点设置
- **sm**: 640px - 小屏幕手机
- **lg**: 1024px - 平板和桌面

### 布局调整
- 在小屏幕上使用单列布局
- 在大屏幕上使用多列网格布局
- 调整容器最大宽度以适应不同屏幕
- 调整字体大小和间距

### 交互优化
- 触摸设备优化
- 按钮大小适合手指点击
- 合理的点击区域

## 6. 性能优化

### 代码组织
- 模块化JavaScript代码
- 优先使用assets中的可复用代码
- 分离通用功能到 common.js
- 页面特定功能在各自页面实现

### 渲染优化
- 批量DOM操作
- 使用文档片段减少重排
- 避免频繁的localStorage操作

### 加载优化
- 使用CDN加载外部资源
- 最小化内联脚本
- 延迟加载非关键资源

## 7. 可访问性

### 语义化HTML
- 使用适当的HTML标签
- 合理的标题层级
- 表单标签关联

### 键盘导航
- 支持Tab键导航
- 支持Enter键提交表单
- 模态框可通过Esc键关闭

### 屏幕阅读器
- 添加适当的ARIA属性
- 确保颜色对比度符合标准
- 提供文本替代方案

## 8. 工具开发规范

### 工具添加流程
1. **创建目录结构**
   - 在tools文件夹下新建一个文件夹，命名为当前工具的名称（使用驼峰命名或 Pascal 命名，保持一致性）
   - 在工具目录内创建以下结构：
     ```
     tools/工具名称/
     ├── 工具名称.html        # 工具主页面
     └── assets/
         ├── css/
         │   └── style.css   # 工具特定样式（可选）
         └── js/
             └── script.js   # 工具特定脚本（可选）
     ```

2. **更新主页卡片**
   - 在 index.html 中复制工具卡片模板，如果有"即将上线"字样的卡片，则替换为当前工具
   - 修改工具名称、描述、图标路径和按钮链接

3. **创建工具页面**
   - 复制现有工具页面（如 ImageCompress.html 或 Task!.html）作为模板
   - 修改页面标题、描述和具体功能实现
   - **必须**保持以下引用结构：
     ```html
     <!-- 引入通用样式 -->
     <link rel="stylesheet" href="../../assets/css/common.css">
     <!-- 引入工具特定样式（可选） -->
     <link rel="stylesheet" href="assets/css/style.css">
     
     <!-- 引入通用脚本 -->
     <script src="../../assets/js/common.js"></script>
     <!-- 引入工具特定脚本（可选） -->
     <script src="assets/js/script.js"></script>
     ```
4. **添加工具到readme.md**
   - 在readme.md中添加工具卡片，包括工具名称、描述、图标路径和按钮链接

### 代码复用规范

#### 必须复用的资源
1. **CSS 复用**
   - **优先**使用 `../../assets/css/common.css` 中定义的样式类
   - 包括：玻璃效果、动画效果、滚动条样式、主题切换样式、模态框样式等
   - 仅在需要工具特定样式时才在本地 style.css 中添加

2. **JavaScript 复用**
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

3. **HTML 结构复用**
   - 复用现有的页面布局结构，包括头部、功能按钮区域、主要内容区、弹窗和底部信息
   - 复用现有的模态框结构，如历史记录、开发者工具、更新日志等
   - 保持一致的卡片样式和交互模式

#### 工具页面模板
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
            <!-- 主题切换按钮（推荐） -->
            <button id="theme-toggle" class="bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-moon-o mr-2"></i> 切换主题
            </button>
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

### 代码复用最佳实践

1. **样式复用**
   - 使用 `common.css` 中定义的颜色变量和工具类
   - 优先使用玻璃效果、动画效果等通用样式
   - 仅在需要工具特定样式时才添加到本地 style.css

2. **脚本复用**
   - 使用 `common.js` 中提供的函数处理通用功能
   - 避免重复实现本地存储、模态框控制等功能
   - 在工具特定脚本中仅实现工具核心逻辑

3. **功能复用**
   - 复用现有的弹窗结构（历史记录、开发者工具、更新日志）
   - 复用主题切换功能
   - 复用本地存储操作函数

### 性能优化
- 最小化工具特定的CSS和JavaScript代码
- 优先使用CDN加载第三方库
- 避免重复的DOM操作
- 使用事件委托处理动态生成的元素

## 9. 未来扩展

### 功能扩展
- 添加用户账户系统
- 实现数据同步功能
- 添加更多统计图表
- 支持任务分类和标签管理

### 样式定制
- 在 tailwind.config 中扩展主题
- 添加自定义工具类
- 实现主题切换功能

