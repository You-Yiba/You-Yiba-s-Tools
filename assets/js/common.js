// 可复用的JavaScript功能

// 页面加载完成后执行的通用函数
function initCommon() {
    // 添加滚动效果
    const toolCards = document.querySelectorAll('.tool-card');
    
    // 简单的滚动动画效果
    function checkScroll() {
        toolCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.classList.add('fade-in');
            }
        });
    }
    
    // 初始检查
    checkScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', checkScroll);
}

// 初始化函数
function initApp() {
    // 调用通用初始化
    initCommon();
    
    // 这里可以添加应用特定的初始化代码
}

// 浏览器信息相关功能
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let operatingSystem = 'Unknown';

    // 检测浏览器名称和版本
    if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
        browserName = 'Chrome';
        browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Edg') > -1) {
        browserName = 'Edge';
        browserVersion = userAgent.match(/Edg\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
        browserName = 'Safari';
        browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
        browserName = 'Internet Explorer';
        browserVersion = userAgent.match(/(MSIE|rv):(\d+\.\d+)/)[2];
    }

    // 检测操作系统
    if (userAgent.indexOf('Windows') > -1) {
        operatingSystem = 'Windows';
    } else if (userAgent.indexOf('Macintosh') > -1) {
        operatingSystem = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
        operatingSystem = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
        operatingSystem = 'Android';
    } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
        operatingSystem = 'iOS';
    }

    return {
        browserName,
        browserVersion,
        userAgent,
        operatingSystem
    };
}

function displayBrowserInfo() {
    const browserInfo = getBrowserInfo();
    const browserNameEl = document.getElementById('browser-name');
    const browserVersionEl = document.getElementById('browser-version');
    const userAgentEl = document.getElementById('user-agent');
    const operatingSystemEl = document.getElementById('operating-system');
    
    if (browserNameEl) browserNameEl.textContent = browserInfo.browserName;
    if (browserVersionEl) browserVersionEl.textContent = browserInfo.browserVersion;
    if (userAgentEl) userAgentEl.textContent = browserInfo.userAgent;
    if (operatingSystemEl) operatingSystemEl.textContent = browserInfo.operatingSystem;
}

// 通用弹窗控制功能
function initModal(modalId, btnId, closeId, overlayId) {
    const modal = document.getElementById(modalId);
    const btn = document.getElementById(btnId);
    const close = document.getElementById(closeId);
    const overlay = document.getElementById(overlayId);

    if (!modal || !btn || !close || !overlay) return;

    // 打开弹窗
    btn.addEventListener('click', function() {
        modal.classList.remove('hidden');
    });

    // 关闭弹窗
    function closeModal() {
        modal.classList.add('hidden');
    }

    // 点击关闭按钮
    close.addEventListener('click', closeModal);

    // 点击遮罩层
    overlay.addEventListener('click', closeModal);
}

// 日期格式化功能
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 显示提示消息
function showToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-neutral-dark text-white px-4 py-2 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.classList.add('slide-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 文件大小格式化
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 本地存储操作
function storageGet(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Error getting from localStorage:', error);
        return defaultValue;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting to localStorage:', error);
        return false;
    }
}

function storageRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

function storageClear() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

// 主题切换
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    
    // 保存主题设置
    storageSet('theme', isDark ? 'dark' : 'light');
    
    // 更新按钮图标
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (isDark) {
            themeToggle.innerHTML = '<i class="fa fa-sun-o mr-2"></i> 切换主题';
        } else {
            themeToggle.innerHTML = '<i class="fa fa-moon-o mr-2"></i> 切换主题';
        }
    }
}

// 加载主题设置
function loadTheme() {
    const theme = storageGet('theme', 'light');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fa fa-sun-o mr-2"></i> 切换主题';
        }
    }
}

// 模态框操作
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 渲染更新日志
function renderChangelog(changelogData, containerId) {
    const changelogContent = document.getElementById(containerId);
    if (!changelogContent) return;
    
    changelogContent.innerHTML = '';
    
    changelogData.forEach(item => {
        const versionEl = document.createElement('div');
        versionEl.className = 'bg-white p-4 rounded-lg shadow-sm';
        
        versionEl.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-lg text-neutral-dark">版本 ${item.version}</h4>
                <span class="text-sm text-secondary">${item.date}</span>
            </div>
            <ul class="space-y-2 text-gray-700">
                ${item.changes.map(change => `<li class="flex items-start"><i class="fa fa-check-circle text-green-500 mt-1 mr-2"></i><span>${change}</span></li>`).join('')}
            </ul>
        `;
        
        changelogContent.appendChild(versionEl);
    });
}

// 当DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initApp);
