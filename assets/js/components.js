// 公共 UI 组件模块
// 提供可复用的弹窗、页脚、工具栏等组件，避免各工具页面重复 HTML

/**
 * 创建通用弹窗模态框
 * @param {Object} config
 * @param {string} config.id - 弹窗 ID 前缀（如 'changelog'、'dev-tools'、'history'）
 * @param {string} config.title - 弹窗标题
 * @param {string} config.icon - Font Awesome 图标类名（如 'fa-list-alt'）
 * @param {string} config.iconColor - 图标颜色类（如 'text-secondary'）
 * @param {string} [config.size='max-w-4xl'] - 弹窗最大宽度
 * @param {string} [config.content=''] - 弹窗内容 HTML
 * @param {string} [config.headerExtra=''] - 头部额外按钮 HTML
 * @returns {HTMLElement}
 */
function createModal(config) {
    const {
        id,
        title,
        icon,
        iconColor = 'text-secondary',
        size = 'max-w-4xl',
        content = '',
        headerExtra = ''
    } = config;

    const modal = document.createElement('div');
    modal.id = `${id}-modal`;
    modal.className = 'fixed inset-0 z-50 hidden';

    modal.innerHTML = `
        <div id="${id}-overlay" class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div id="${id}-container" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full ${size} max-h-[90vh] glass-effect rounded-xl shadow-lg flex flex-col">
            <div id="${id}-header" class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-neutral-dark flex items-center">
                    <i class="fa ${icon} mr-2 ${iconColor}"></i> ${title}
                </h2>
                <div class="flex items-center space-x-2">
                    ${headerExtra}
                    <button id="${id}-close" class="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="关闭">
                        <i class="fa fa-times text-secondary" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
                <div id="${id}-content" class="space-y-6">
                    ${content}
                </div>
            </div>
        </div>
    `;

    return modal;
}

/**
 * 创建更新日志弹窗
 * @returns {HTMLElement}
 */
function createChangelogModal() {
    return createModal({
        id: 'changelog',
        title: '更新日志',
        icon: 'fa-list-alt',
        iconColor: 'text-secondary'
    });
}

/**
 * 创建开发者工具弹窗
 * @param {string} [content=''] - 开发者工具内容 HTML
 * @returns {HTMLElement}
 */
function createDevToolsModal(content) {
    return createModal({
        id: 'dev-tools',
        title: '开发者选项',
        icon: 'fa-code',
        iconColor: 'text-gray-700',
        size: 'max-w-2xl',
        content: content || `
            <h3 class="text-lg font-semibold mb-4">调试功能</h3>
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
        `
    });
}

/**
 * 创建历史记录弹窗
 * @param {Object} [config]
 * @param {string} [config.size='max-w-4xl'] - 弹窗最大宽度
 * @param {string} [config.extraHeader=''] - 头部额外按钮 HTML
 * @param {string} [config.filterBar=''] - 筛选栏 HTML
 * @param {string} [config.emptyIcon='fa-clock-o'] - 空状态图标
 * @param {string} [config.emptyText='暂无历史记录'] - 空状态文字
 * @returns {HTMLElement}
 */
function createHistoryModal(config) {
    const {
        size = 'max-w-4xl',
        extraHeader = '',
        filterBar = '',
        emptyIcon = 'fa-clock-o',
        emptyText = '暂无历史记录'
    } = config || {};

    return createModal({
        id: 'history',
        title: '历史记录',
        icon: 'fa-history',
        iconColor: 'text-secondary',
        size: size,
        headerExtra: extraHeader,
        content: `${filterBar}
            <div id="history-list" class="space-y-4">
                <div class="text-center text-secondary py-8" id="empty-history">
                    <i class="fa ${emptyIcon} text-4xl mb-3 opacity-50" aria-hidden="true"></i>
                    <p>${emptyText}</p>
                </div>
            </div>`
    });
}

/**
 * 创建页面底部信息栏
 * @param {Object} config
 * @param {string} config.name - 工具名称
 * @param {string} config.version - 版本号
 * @returns {HTMLElement}
 */
function createFooter(config) {
    const { name, version } = config;
    const footer = document.createElement('div');
    footer.className = 'container mx-auto px-4 py-2 max-w-6xl fade-in';
    footer.innerHTML = `
        <div class="text-center text-gray-500 text-sm">
            ${name} v${version} 作者:游一八 power by Trae
            <a href="#" id="changelog-btn" class="text-blue-500 underline ml-2">更新日志</a>
        </div>
    `;
    return footer;
}

/**
 * 创建工具页顶部功能按钮区域
 * @param {Object} [config]
 * @param {boolean} [config.showHome=true] - 是否显示回首页按钮
 * @param {string} [config.homeUrl='../../index.html'] - 首页链接地址
 * @param {boolean} [config.showHistory=true] - 是否显示历史记录按钮
 * @param {boolean} [config.showDevTools=true] - 是否显示开发者选项按钮
 * @returns {HTMLElement}
 */
function createToolbar(config) {
    const { showHome = true, homeUrl = '../../index.html', showHistory = true, showDevTools = true } = config || {};
    const toolbar = document.createElement('div');
    toolbar.className = 'text-center mb-8 flex justify-center space-x-4 fade-in';

    let buttons = '';
    if (showHome) {
        buttons += `
            <a href="${homeUrl}" class="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-home mr-2" aria-hidden="true"></i><span class="hidden sm:inline">回首页</span>
            </a>
        `;
    }
    if (showHistory) {
        buttons += `
            <button id="history-btn" class="bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-history mr-2" aria-hidden="true"></i><span class="hidden sm:inline">历史记录</span>
            </button>
        `;
    }
    if (showDevTools) {
        buttons += `
            <button id="dev-tools-btn" class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center">
                <i class="fa fa-code mr-2" aria-hidden="true"></i><span class="hidden sm:inline">开发者选项</span>
            </button>
        `;
    }

    toolbar.innerHTML = buttons;
    return toolbar;
}

/**
 * 渲染更新日志列表
 * @param {Array} changelogData - 更新日志数据
 * @param {string} containerId - 容器元素 ID
 */
function renderChangelog(changelogData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    changelogData.forEach(function(item) {
        const versionEl = document.createElement('div');
        versionEl.className = 'bg-white p-4 rounded-lg shadow-sm';

        versionEl.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-lg text-neutral-dark">版本 ${item.version}</h4>
                <span class="text-sm text-secondary">${item.date}</span>
            </div>
            <ul class="space-y-2 text-gray-700">
                ${item.changes.map(function(change) {
                    return '<li class="flex items-start"><i class="fa fa-check-circle text-green-500 mt-1 mr-2" aria-hidden="true"></i><span>' + change + '</span></li>';
                }).join('')}
            </ul>
        `;

        container.appendChild(versionEl);
    });
}

/**
 * 自动注入公共组件到页面
 * 应在 DOMContentLoaded 时调用
 * @param {Object} config
 * @param {string} config.toolName - 工具名称
 * @param {string} config.version - 版本号
 * @param {string} [config.devToolsContent] - 开发者工具弹窗内容 HTML
 * @param {Object} [config.historyConfig] - 历史记录弹窗配置
 * @param {Array} [config.changelogData] - 更新日志数据
 */
function initComponents(config) {
    const {
        toolName,
        version,
        devToolsContent,
        historyConfig,
        changelogData
    } = config;

    // 注入工具栏（如果页面中有 toolbar-container）
    const toolbarContainer = document.getElementById('toolbar-container');
    if (toolbarContainer) {
        toolbarContainer.appendChild(createToolbar());
    }

    // 注入更新日志弹窗
    const modalsContainer = document.getElementById('modals-container') || document.body;
    modalsContainer.appendChild(createChangelogModal());

    // 注入开发者工具弹窗
    modalsContainer.appendChild(createDevToolsModal(devToolsContent));

    // 注入历史记录弹窗
    modalsContainer.appendChild(createHistoryModal(historyConfig));

    // 注入页脚（如果页面中有 footer-container）
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.appendChild(createFooter({ name: toolName, version: version }));
    }

    // 初始化弹窗交互
    initModal('changelog-modal', 'changelog-btn', 'changelog-close', 'changelog-overlay');
    initModal('dev-tools-modal', 'dev-tools-btn', 'dev-tools-close', 'dev-tools-overlay');
    initModal('history-modal', 'history-btn', 'history-close', 'history-overlay');

    // 渲染更新日志内容
    if (changelogData) {
        renderChangelog(changelogData, 'changelog-content');
    }
}
