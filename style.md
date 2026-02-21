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



## 4. 功能实现方法

### 数据存储
- 使用 `localStorage` 存储任务和历史记录数据
- 数据格式: JSON


### 核心功能实现



####  开发者工具
- 添加测试数据功能
- 数据导入导出
- 清空所有数据
- 其他调试功能

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

## 8. 未来扩展

### 工具添加
- 在tools文件夹下新建一个文件夹，命名为当前工具的名称，工具的所有代码都放在这个文件夹下
- 在 index.html 中复制工具卡片模板，如果有“即将上线”字样的卡片，则替换为当前工具
- 修改工具名称、描述和图标
- 创建对应的工具页面

### 功能扩展
- 添加用户账户系统
- 实现数据同步功能
- 添加更多统计图表
- 支持任务分类和标签管理

### 样式定制
- 在 tailwind.config 中扩展主题
- 添加自定义工具类
- 实现主题切换功能

