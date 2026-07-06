// responsive.test.js
// 测试移动端 Tab 切换逻辑

describe('Responsive Mobile Navigation', function() {
  // 在每个测试前创建所需的 DOM 元素
  function setupDOM() {
    // 如果已存在则先移除
    ['mobile-panel-bank', 'mobile-panel-quiz', 'mobile-panel-browse', 'mobile-bottom-nav'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });

    // 创建三个面板
    var bankPanel = document.createElement('div');
    bankPanel.id = 'mobile-panel-bank';
    bankPanel.className = 'mobile-panel';
    document.body.appendChild(bankPanel);

    var quizPanel = document.createElement('div');
    quizPanel.id = 'mobile-panel-quiz';
    quizPanel.className = 'mobile-panel hidden';
    document.body.appendChild(quizPanel);

    var browsePanel = document.createElement('div');
    browsePanel.id = 'mobile-panel-browse';
    browsePanel.className = 'mobile-panel hidden';
    document.body.appendChild(browsePanel);

    // 创建底部导航
    var nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';
    nav.innerHTML =
      '<button data-mobile-tab="bank" class="mobile-nav-btn active text-primary">题库</button>' +
      '<button data-mobile-tab="quiz" class="mobile-nav-btn text-gray-400">刷题</button>' +
      '<button data-mobile-tab="browse" class="mobile-nav-btn text-gray-400">浏览</button>';
    document.body.appendChild(nav);
  }

  test('switchMobileTab should show target panel and hide others', function() {
    setupDOM();

    // 切换到 quiz
    switchMobileTab('quiz');

    var bankPanel = document.getElementById('mobile-panel-bank');
    var quizPanel = document.getElementById('mobile-panel-quiz');
    var browsePanel = document.getElementById('mobile-panel-browse');

    assertTrue(bankPanel.classList.contains('hidden'), 'bank panel should be hidden');
    assertTrue(!quizPanel.classList.contains('hidden'), 'quiz panel should be visible');
    assertTrue(browsePanel.classList.contains('hidden'), 'browse panel should be hidden');

    // 切换到 browse
    switchMobileTab('browse');

    assertTrue(bankPanel.classList.contains('hidden'), 'bank panel should be hidden after second switch');
    assertTrue(quizPanel.classList.contains('hidden'), 'quiz panel should be hidden after second switch');
    assertTrue(!browsePanel.classList.contains('hidden'), 'browse panel should be visible after second switch');
  });

  test('switchMobileTab should update nav button active state', function() {
    setupDOM();

    // 切换到 quiz
    switchMobileTab('quiz');

    var bankBtn = document.querySelector('[data-mobile-tab="bank"]');
    var quizBtn = document.querySelector('[data-mobile-tab="quiz"]');

    assertTrue(quizBtn.classList.contains('active'), 'quiz button should be active');
    assertTrue(!bankBtn.classList.contains('active'), 'bank button should not be active');
    assertTrue(quizBtn.classList.contains('text-primary'), 'quiz button should have primary color');
    assertTrue(bankBtn.classList.contains('text-gray-400'), 'bank button should have gray color');
  });

  test('initMobileNav should bind click events', function() {
    setupDOM();

    // 重新初始化导航绑定
    initMobileNav();

    var quizBtn = document.querySelector('[data-mobile-tab="quiz"]');
    quizBtn.click();

    var quizPanel = document.getElementById('mobile-panel-quiz');
    assertTrue(!quizPanel.classList.contains('hidden'), 'quiz panel should be visible after click');
  });
});
