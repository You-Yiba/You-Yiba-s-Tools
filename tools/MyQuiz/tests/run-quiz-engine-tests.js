// Node.js 测试运行器 - QuizEngine
var fs = require('fs');
var path = require('path');

// Mock document 对象
global.document = {
    addEventListener: function() {}
};

// Mock localStorage
var mockStorage = {};
global.localStorage = {
    getItem: function(key) {
        return mockStorage.hasOwnProperty(key) ? mockStorage[key] : null;
    },
    setItem: function(key, value) {
        mockStorage[key] = String(value);
    },
    removeItem: function(key) {
        delete mockStorage[key];
    },
    clear: function() {
        mockStorage = {};
    }
};

// 加载 script.js
var scriptContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'script.js'), 'utf8');
eval(scriptContent);

// 极简测试框架
var tests = [];
var currentSuite = '';
var passed = 0;
var failed = 0;

function describe(name, fn) {
    currentSuite = name;
    fn();
}

function test(name, fn) {
    tests.push({ suite: currentSuite, name: name, fn: fn });
}

function assertEqual(actual, expected, msg) {
    var actualStr = JSON.stringify(actual);
    var expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        throw new Error((msg || 'Assertion failed') + '\n  Expected: ' + expectedStr + '\n  Actual:   ' + actualStr);
    }
}

function assertTrue(value, msg) {
    if (!value) {
        throw new Error(msg || 'Expected true but got false');
    }
}

function assertFalse(value, msg) {
    if (value) {
        throw new Error(msg || 'Expected false but got true');
    }
}

// 加载测试文件
var testContent = fs.readFileSync(path.join(__dirname, 'quiz-engine.test.js'), 'utf8');
eval(testContent);

// 运行测试
console.log('========================================');
console.log('MyQuiz QuizEngine 测试');
console.log('========================================\n');

var currentSuiteName = '';
for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    if (t.suite !== currentSuiteName) {
        currentSuiteName = t.suite;
        console.log('📦 ' + currentSuiteName);
    }
    try {
        t.fn();
        console.log('  ✓ ' + t.name);
        passed++;
    } catch (e) {
        console.log('  ✗ ' + t.name);
        console.log('    ' + e.message.replace(/\n/g, '\n    '));
        failed++;
    }
}

console.log('\n========================================');
var total = passed + failed;
if (failed === 0) {
    console.log('✅ 全部通过: ' + passed + '/' + total);
} else {
    console.log('❌ 失败: ' + passed + '/' + total + ' 通过, ' + failed + ' 失败');
}
console.log('========================================');

process.exit(failed === 0 ? 0 : 1);
