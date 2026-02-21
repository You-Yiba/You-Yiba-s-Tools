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

// 当DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initApp);
