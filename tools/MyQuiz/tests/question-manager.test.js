// QuestionManager Tests

// ============================================================
// Mock localStorage
// ============================================================
var mockStorage = {};
var originalLocalStorage = null;
var globalObj = typeof window !== 'undefined' ? window : global;

if (globalObj.localStorage) {
    originalLocalStorage = globalObj.localStorage;
}

function setupMockStorage() {
    mockStorage = {};
    var mockLS = {
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
    if (typeof Object.defineProperty === 'function') {
        Object.defineProperty(globalObj, 'localStorage', {
            value: mockLS,
            writable: true,
            configurable: true
        });
    } else {
        globalObj.localStorage = mockLS;
    }
}

function restoreLocalStorage() {
    if (originalLocalStorage) {
        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(globalObj, 'localStorage', {
                value: originalLocalStorage,
                writable: true,
                configurable: true
            });
        } else {
            globalObj.localStorage = originalLocalStorage;
        }
    }
}

// ============================================================
// 辅助函数：生成测试题目
// ============================================================
function makeParsedQuestions(count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push({
            type: 'choice',
            question: '测试题目' + (i + 1),
            options: ['A', 'B', 'C', 'D'],
            answer: 'A'
        });
    }
    return result;
}

// ============================================================
// Task 3.1 Storage 模块测试
// ============================================================
describe('Task 3.1: Storage 模块', function() {
    test('getQuestions 空 storage 返回空数组', function() {
        setupMockStorage();
        var result = Storage.getQuestions();
        assertEqual(result.length, 0);
        restoreLocalStorage();
    });

    test('saveQuestions 和 getQuestions 正常工作', function() {
        setupMockStorage();
        var questions = [{ id: 'q1', question: 'test' }];
        Storage.saveQuestions(questions);
        var result = Storage.getQuestions();
        assertEqual(result.length, 1);
        assertEqual(result[0].id, 'q1');
        restoreLocalStorage();
    });

    test('getSettings 返回默认设置', function() {
        setupMockStorage();
        var settings = Storage.getSettings();
        assertEqual(settings.shuffleOptions, true);
        assertEqual(settings.lastQuizMode, 'all');
        assertEqual(settings.lastQuizCount, 20);
        restoreLocalStorage();
    });

    test('saveSettings 和 getSettings 正常工作', function() {
        setupMockStorage();
        var newSettings = { shuffleOptions: false, lastQuizMode: 'wrong', lastQuizCount: 10 };
        Storage.saveSettings(newSettings);
        var result = Storage.getSettings();
        assertEqual(result.shuffleOptions, false);
        assertEqual(result.lastQuizMode, 'wrong');
        assertEqual(result.lastQuizCount, 10);
        restoreLocalStorage();
    });

    test('clearAll 清除所有数据', function() {
        setupMockStorage();
        Storage.saveQuestions([{ id: 'q1' }]);
        Storage.saveSettings({ shuffleOptions: false });
        Storage.clearAll();
        assertEqual(Storage.getQuestions().length, 0);
        assertEqual(Storage.getSettings().shuffleOptions, true);
        restoreLocalStorage();
    });
});

// ============================================================
// Task 3.2 初始化与基本查询测试
// ============================================================
describe('Task 3.2: 初始化与基本查询', function() {
    test('初始化空题库，getAll 返回空数组', function() {
        setupMockStorage();
        QuestionManager.init();
        var all = QuestionManager.getAll();
        assertEqual(all.length, 0);
        restoreLocalStorage();
    });

    test('getById 找不到返回 null', function() {
        setupMockStorage();
        QuestionManager.init();
        var q = QuestionManager.getById('not_exist');
        assertTrue(q === null, '找不到应返回 null');
        restoreLocalStorage();
    });
});

// ============================================================
// Task 3.3 批量导入测试
// ============================================================
describe('Task 3.3: 批量导入', function() {
    test('覆盖模式导入成功', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(3);
        var result = QuestionManager.importQuestions(parsed, 'overwrite');
        assertEqual(result.success, 3);
        assertEqual(result.duplicates, 0);
        assertEqual(result.errors, 0);
        assertEqual(QuestionManager.getAll().length, 3);
        restoreLocalStorage();
    });

    test('导入的题目有 id、wrongCount、correctStreak、createdAt、updatedAt', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var q = QuestionManager.getAll()[0];
        assertTrue(q.id !== undefined && q.id !== null, '应有 id');
        assertTrue(q.id.indexOf('q_') === 0, 'id 应以 q_ 开头');
        assertEqual(q.wrongCount, 0);
        assertEqual(q.correctStreak, 0);
        assertTrue(q.createdAt !== undefined, '应有 createdAt');
        assertTrue(q.updatedAt !== undefined, '应有 updatedAt');
        restoreLocalStorage();
    });

    test('追加模式导入，相同题目文字视为重复', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed1 = makeParsedQuestions(2);
        QuestionManager.importQuestions(parsed1, 'overwrite');
        var parsed2 = [
            { type: 'choice', question: '测试题目2', options: ['A','B','C','D'], answer: 'A' },
            { type: 'choice', question: '测试题目3', options: ['A','B','C','D'], answer: 'A' }
        ];
        var result = QuestionManager.importQuestions(parsed2, 'append');
        assertEqual(result.success, 1);
        assertEqual(result.duplicates, 1);
        assertEqual(result.errors, 0);
        assertEqual(QuestionManager.getAll().length, 3);
        restoreLocalStorage();
    });

    test('覆盖模式会清除原有题目', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed1 = makeParsedQuestions(5);
        QuestionManager.importQuestions(parsed1, 'overwrite');
        assertEqual(QuestionManager.getAll().length, 5);
        var parsed2 = makeParsedQuestions(2);
        QuestionManager.importQuestions(parsed2, 'overwrite');
        assertEqual(QuestionManager.getAll().length, 2);
        restoreLocalStorage();
    });

    test('getAll 返回浅拷贝，修改返回值不影响内部数据', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var all = QuestionManager.getAll();
        all[0].question = '被修改了';
        var all2 = QuestionManager.getAll();
        assertEqual(all2[0].question, '测试题目1');
        restoreLocalStorage();
    });
});

// ============================================================
// Task 3.4 错题本逻辑测试
// ============================================================
describe('Task 3.4: 错题本逻辑', function() {
    test('答错后加入错题本（isWrong = true）', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        assertTrue(QuestionManager.isWrong(id), '答错后 isWrong 应为 true');
        restoreLocalStorage();
    });

    test('答错后 wrongCount++，correctStreak=0', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        var q = QuestionManager.getById(id);
        assertEqual(q.wrongCount, 1);
        assertEqual(q.correctStreak, 0);
        QuestionManager.recordAnswer(id, false);
        q = QuestionManager.getById(id);
        assertEqual(q.wrongCount, 2);
        assertEqual(q.correctStreak, 0);
        restoreLocalStorage();
    });

    test('答对1次 correctStreak=1，仍在错题本中', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        QuestionManager.recordAnswer(id, true);
        var q = QuestionManager.getById(id);
        assertEqual(q.correctStreak, 1);
        assertTrue(QuestionManager.isWrong(id), '答对1次仍在错题本');
        restoreLocalStorage();
    });

    test('连续答对2次移出错题本（isWrong = false）', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        QuestionManager.recordAnswer(id, true);
        QuestionManager.recordAnswer(id, true);
        var q = QuestionManager.getById(id);
        assertEqual(q.correctStreak, 2);
        assertFalse(QuestionManager.isWrong(id), '连续答对2次移出错题本');
        restoreLocalStorage();
    });

    test('答错重置连续答对计数', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        QuestionManager.recordAnswer(id, true);
        QuestionManager.recordAnswer(id, false);
        var q = QuestionManager.getById(id);
        assertEqual(q.correctStreak, 0);
        assertEqual(q.wrongCount, 2);
        assertTrue(QuestionManager.isWrong(id), '答错后仍在错题本');
        restoreLocalStorage();
    });

    test('getWrongQuestions 返回所有错题本题目', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(3);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var all = QuestionManager.getAll();
        QuestionManager.recordAnswer(all[0].id, false);
        QuestionManager.recordAnswer(all[1].id, false);
        QuestionManager.recordAnswer(all[1].id, true);
        QuestionManager.recordAnswer(all[1].id, true);
        var wrong = QuestionManager.getWrongQuestions();
        assertEqual(wrong.length, 1);
        assertEqual(wrong[0].id, all[0].id);
        restoreLocalStorage();
    });
});

// ============================================================
// Task 3.5 手动标星测试
// ============================================================
describe('Task 3.5: 手动标星/取消标星', function() {
    test('手动标星加入错题本', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.toggleStar(id, true);
        assertTrue(QuestionManager.isWrong(id), '标星后 isWrong 应为 true');
        var q = QuestionManager.getById(id);
        assertTrue(q.wrongCount >= 1, '标星后 wrongCount 至少为 1');
        assertEqual(q.correctStreak, 0);
        restoreLocalStorage();
    });

    test('取消标星移出错题本', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.toggleStar(id, true);
        assertTrue(QuestionManager.isWrong(id));
        QuestionManager.toggleStar(id, false);
        assertFalse(QuestionManager.isWrong(id), '取消标星后 isWrong 应为 false');
        var q = QuestionManager.getById(id);
        assertTrue(q.wrongCount >= 1, '取消标星后 wrongCount 保留历史数据');
        var threshold = Storage.getSettings().masterThreshold;
        assertTrue(q.correctStreak >= threshold, '取消标星后 correctStreak 应达到阈值');
        restoreLocalStorage();
    });
});

// ============================================================
// Task 3.6 更新与删除测试
// ============================================================
describe('Task 3.6: 更新与删除题目', function() {
    test('updateQuestion 更新题目成功', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(1);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        var result = QuestionManager.updateQuestion(id, { question: '更新后的题目' });
        assertEqual(result.success, true);
        var q = QuestionManager.getById(id);
        assertEqual(q.question, '更新后的题目');
        restoreLocalStorage();
    });

    test('updateQuestion 更新后题目重复则失败', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(2);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var all = QuestionManager.getAll();
        var result = QuestionManager.updateQuestion(all[1].id, { question: '测试题目1' });
        assertEqual(result.success, false);
        assertEqual(result.reason, 'duplicate');
        restoreLocalStorage();
    });

    test('updateQuestion 题目不存在返回 not_found', function() {
        setupMockStorage();
        QuestionManager.init();
        var result = QuestionManager.updateQuestion('not_exist', { question: 'test' });
        assertEqual(result.success, false);
        assertEqual(result.reason, 'not_found');
        restoreLocalStorage();
    });

    test('deleteQuestion 删除成功返回 true', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(2);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        var result = QuestionManager.deleteQuestion(id);
        assertTrue(result, '删除应返回 true');
        assertEqual(QuestionManager.getAll().length, 1);
        assertTrue(QuestionManager.getById(id) === null, '删除后 getById 应返回 null');
        restoreLocalStorage();
    });

    test('deleteQuestion 删除不存在的题目返回 false', function() {
        setupMockStorage();
        QuestionManager.init();
        var result = QuestionManager.deleteQuestion('not_exist');
        assertFalse(result, '删除不存在的题目应返回 false');
        restoreLocalStorage();
    });

    test('数据持久化：修改后刷新 storage 仍在', function() {
        setupMockStorage();
        QuestionManager.init();
        var parsed = makeParsedQuestions(2);
        QuestionManager.importQuestions(parsed, 'overwrite');
        var id = QuestionManager.getAll()[0].id;
        QuestionManager.recordAnswer(id, false);
        var savedQuestions = Storage.getQuestions();
        assertEqual(savedQuestions.length, 2);
        assertEqual(savedQuestions[0].wrongCount, 1);
        restoreLocalStorage();
    });
});
