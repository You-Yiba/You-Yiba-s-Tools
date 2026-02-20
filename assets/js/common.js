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

// 当DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initApp);
