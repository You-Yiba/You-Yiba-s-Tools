// QuizEngine Tests

// ============================================================
// 辅助函数：生成测试题目
// ============================================================
function makeChoiceQuestions(count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push({
            type: 'choice',
            question: '选择题' + (i + 1),
            options: ['选项A', '选项B', '选项C', '选项D'],
            answer: 'A'
        });
    }
    return result;
}

function makeFillQuestions(count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push({
            type: 'fill',
            question: '填空题' + (i + 1),
            answer: '答案' + (i + 1)
        });
    }
    return result;
}

// ============================================================
// Task 4.1 判题测试
// ============================================================
describe('Task 4.1: 判题功能', function() {
    test('选择题答对', function() {
        var q = { type: 'choice', options: ['北京', '上海', '广州', '深圳'], answer: 'A' };
        var result = QuizEngine.checkAnswer(q, 'A');
        assertTrue(result.isCorrect, '选A应正确');
    });

    test('选择题答错', function() {
        var q = { type: 'choice', options: ['北京', '上海', '广州', '深圳'], answer: 'A' };
        var result = QuizEngine.checkAnswer(q, 'B');
        assertFalse(result.isCorrect, '选B应错误');
    });

    test('选择题大小写不敏感', function() {
        var q = { type: 'choice', options: ['北京', '上海', '广州', '深圳'], answer: 'B' };
        var result1 = QuizEngine.checkAnswer(q, 'b');
        assertTrue(result1.isCorrect, '小写b应正确');
        var result2 = QuizEngine.checkAnswer(q, ' B ');
        assertTrue(result2.isCorrect, '带空格的B应正确');
    });

    test('填空题宽松匹配（trim、大小写）', function() {
        var q = { type: 'fill', answer: 'Hello World' };
        var result1 = QuizEngine.checkAnswer(q, 'hello world');
        assertTrue(result1.isCorrect, '大小写不敏感应正确');
        var result2 = QuizEngine.checkAnswer(q, '  Hello World  ');
        assertTrue(result2.isCorrect, 'trim后应正确');
        var result3 = QuizEngine.checkAnswer(q, '  hello world  ');
        assertTrue(result3.isCorrect, 'trim+小写应正确');
    });

    test('填空题内容不同算错', function() {
        var q = { type: 'fill', answer: '北京' };
        var result = QuizEngine.checkAnswer(q, '上海');
        assertFalse(result.isCorrect, '内容不同应错误');
    });

    test('checkAnswer 返回 { isCorrect: boolean } 格式', function() {
        var q = { type: 'choice', answer: 'A' };
        var result = QuizEngine.checkAnswer(q, 'A');
        assertTrue(result.hasOwnProperty('isCorrect'), '应有isCorrect字段');
        assertTrue(typeof result.isCorrect === 'boolean', 'isCorrect应为布尔值');
    });
});

// ============================================================
// Task 4.2 出题与打乱
// ============================================================
describe('Task 4.2: 出题与打乱', function() {
    test('all 模式全部题目', function() {
        var questions = makeChoiceQuestions(5);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        assertEqual(quiz.mode, 'all');
        assertEqual(quiz.questions.length, 5);
        assertEqual(quiz.currentIndex, 0);
        assertEqual(quiz.answers.length, 0);
        assertFalse(quiz.isFinished, '初始isFinished应为false');
    });

    test('count 模式指定数量', function() {
        var questions = makeChoiceQuestions(10);
        var quiz = QuizEngine.createQuiz(questions, 'count', { count: 3 });
        assertEqual(quiz.questions.length, 3);
    });

    test('count 超过总数取全部', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'count', { count: 10 });
        assertEqual(quiz.questions.length, 3);
    });

    test('选项打乱后数量不变', function() {
        var questions = makeChoiceQuestions(1);
        var quiz = QuizEngine.createQuiz(questions, 'all', { shuffleOptions: true });
        assertEqual(quiz.questions[0].options.length, 4);
    });

    test('Fisher-Yates 打乱后元素都在', function() {
        var questions = makeChoiceQuestions(5);
        var originalQuestions = [];
        for (var i = 0; i < questions.length; i++) {
            originalQuestions.push(questions[i].question);
        }
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        var shuffledQuestions = [];
        for (var j = 0; j < quiz.questions.length; j++) {
            shuffledQuestions.push(quiz.questions[j].question);
        }
        assertEqual(shuffledQuestions.length, originalQuestions.length);
        for (var k = 0; k < originalQuestions.length; k++) {
            var found = false;
            for (var m = 0; m < shuffledQuestions.length; m++) {
                if (shuffledQuestions[m] === originalQuestions[k]) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, '打乱后所有题目都应存在：' + originalQuestions[k]);
        }
    });

    test('shuffleOptions 为 true 时打乱选择题选项并更新 answer', function() {
        var q = {
            type: 'choice',
            question: '测试题',
            options: ['A选项', 'B选项', 'C选项', 'D选项'],
            answer: 'B'
        };
        var shuffled = QuizEngine._shuffleOptions(JSON.parse(JSON.stringify(q)));
        assertEqual(shuffled.options.length, 4);
        assertTrue(shuffled.answer === 'A' || shuffled.answer === 'B' ||
            shuffled.answer === 'C' || shuffled.answer === 'D',
            'answer应为A/B/C/D');
        var answerIdx = shuffled.answer.charCodeAt(0) - 65;
        assertEqual(shuffled.options[answerIdx], 'B选项', '打乱后answer指向的选项应是原正确答案');
    });

    test('填空题 _shuffleOptions 直接返回', function() {
        var q = { type: 'fill', question: '填空题', answer: '答案' };
        var result = QuizEngine._shuffleOptions(q);
        assertEqual(result.type, 'fill');
        assertEqual(result.answer, '答案');
    });

    test('createQuiz 不修改原数组', function() {
        var questions = makeChoiceQuestions(3);
        var originalFirst = questions[0].question;
        QuizEngine.createQuiz(questions, 'all', {});
        assertEqual(questions[0].question, originalFirst, '原数组不应被修改');
    });
});

// ============================================================
// Task 4.3 导航与结算
// ============================================================
describe('Task 4.3: 导航与结算', function() {
    test('下一题导航', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        assertEqual(quiz.currentIndex, 0);
        var result = QuizEngine.goNext(quiz);
        assertTrue(result, 'goNext应返回true');
        assertEqual(quiz.currentIndex, 1);
        QuizEngine.goNext(quiz);
        assertEqual(quiz.currentIndex, 2);
    });

    test('上一题导航', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        QuizEngine.goNext(quiz);
        QuizEngine.goNext(quiz);
        assertEqual(quiz.currentIndex, 2);
        var result = QuizEngine.goPrev(quiz);
        assertTrue(result, 'goPrev应返回true');
        assertEqual(quiz.currentIndex, 1);
    });

    test('第一题不能再上一题', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        assertEqual(quiz.currentIndex, 0);
        var result = QuizEngine.goPrev(quiz);
        assertFalse(result, '第一题goPrev应返回false');
        assertEqual(quiz.currentIndex, 0);
    });

    test('答完结算统计正确', function() {
        var questions = makeChoiceQuestions(4);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        QuizEngine.submitAnswer(quiz, 'A');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'A');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'B');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'A');
        var result = QuizEngine.getResult(quiz);
        assertEqual(result.total, 4);
        assertEqual(result.correct, 3);
        assertEqual(result.wrong, 1);
        assertEqual(result.accuracy, 75);
    });

    test('提交答案记录正确', function() {
        var questions = makeChoiceQuestions(2);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        QuizEngine.submitAnswer(quiz, 'A');
        assertEqual(quiz.answers.length, 1);
        assertTrue(quiz.answers[0].hasOwnProperty('isCorrect'), '答案记录应有isCorrect');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'B');
        assertEqual(quiz.answers.length, 2);
    });

    test('isFinished 标记', function() {
        var questions = makeChoiceQuestions(2);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        assertFalse(quiz.isFinished, '初始不应finished');
        QuizEngine.submitAnswer(quiz, 'A');
        var canGo = QuizEngine.goNext(quiz);
        assertTrue(canGo, '第一题后应能前进');
        assertFalse(quiz.isFinished, '第二题时不应finished');
        QuizEngine.submitAnswer(quiz, 'A');
        var canGo2 = QuizEngine.goNext(quiz);
        assertFalse(canGo2, '最后一题后不能前进');
        assertTrue(quiz.isFinished, '答完后isFinished应为true');
    });

    test('getCurrent 返回当前题目', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        var current = QuizEngine.getCurrent(quiz);
        assertTrue(current !== null, '应有当前题目');
        assertEqual(current.question, quiz.questions[0].question);
        QuizEngine.goNext(quiz);
        var current2 = QuizEngine.getCurrent(quiz);
        assertEqual(current2.question, quiz.questions[1].question);
    });

    test('accuracy 四舍五入到整数百分比', function() {
        var questions = makeChoiceQuestions(3);
        var quiz = QuizEngine.createQuiz(questions, 'all', {});
        QuizEngine.submitAnswer(quiz, 'A');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'A');
        QuizEngine.goNext(quiz);
        QuizEngine.submitAnswer(quiz, 'B');
        var result = QuizEngine.getResult(quiz);
        assertEqual(result.accuracy, 67);
    });
});

// ============================================================
// _shuffleArray 辅助方法测试
// ============================================================
describe('_shuffleArray 辅助方法', function() {
    test('打乱后元素都在', function() {
        var arr = [1, 2, 3, 4, 5];
        var shuffled = QuizEngine._shuffleArray(arr.slice());
        assertEqual(shuffled.length, 5);
        for (var i = 0; i < arr.length; i++) {
            var found = false;
            for (var j = 0; j < shuffled.length; j++) {
                if (shuffled[j] === arr[i]) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, '元素' + arr[i] + '应存在');
        }
    });

    test('不修改原数组', function() {
        var arr = [1, 2, 3];
        var original = arr.slice();
        QuizEngine._shuffleArray(arr);
        assertEqual(arr.length, original.length);
        for (var i = 0; i < original.length; i++) {
            assertEqual(arr[i], original[i]);
        }
    });
});
