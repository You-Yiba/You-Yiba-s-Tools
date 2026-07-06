// ============================================================
// MyQuiz - 刷题助手
// ============================================================

// ------------------------------------------------------------
// Module 1: Storage - localStorage 封装
// ------------------------------------------------------------
var Storage = {
    QUESTIONS_KEY: 'myquiz:questions',
    SETTINGS_KEY: 'myquiz:settings',

    getQuestions: function() {
        try {
            var value = localStorage.getItem(this.QUESTIONS_KEY);
            return value ? JSON.parse(value) : [];
        } catch (e) {
            return [];
        }
    },

    saveQuestions: function(questions) {
        try {
            localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
            return true;
        } catch (e) {
            return false;
        }
    },

    getSettings: function() {
        var defaults = {
            shuffleOptions: true,
            lastQuizMode: 'all',
            lastQuizCount: 20,
            masterThreshold: 2
        };
        try {
            var value = localStorage.getItem(this.SETTINGS_KEY);
            if (value) {
                var parsed = JSON.parse(value);
                return {
                    shuffleOptions: parsed.shuffleOptions !== undefined ? parsed.shuffleOptions : defaults.shuffleOptions,
                    lastQuizMode: parsed.lastQuizMode !== undefined ? parsed.lastQuizMode : defaults.lastQuizMode,
                    lastQuizCount: parsed.lastQuizCount !== undefined ? parsed.lastQuizCount : defaults.lastQuizCount,
                    masterThreshold: parsed.masterThreshold !== undefined ? parsed.masterThreshold : defaults.masterThreshold
                };
            }
            return defaults;
        } catch (e) {
            return defaults;
        }
    },

    saveSettings: function(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    },

    clearAll: function() {
        try {
            localStorage.removeItem(this.QUESTIONS_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// ------------------------------------------------------------
// Module 2: CSVParser - CSV 解析与题型识别
// ------------------------------------------------------------
var CSVParser = {
    parse: function(csvText) {
        var result = {
            success: [],
            errors: [],
            duplicates: []
        };

        if (!csvText || csvText.trim() === '') {
            return result;
        }

        var lines = csvText.split('\n');
        var seenQuestions = {};

        for (var i = 0; i < lines.length; i++) {
            var lineNum = i + 1;
            var rawLine = lines[i];

            if (rawLine.trim() === '') {
                continue;
            }

            var fields = this._splitCSVLine(rawLine);

            if (fields.length < 2 || fields.length === 5 || fields.length > 7) {
                result.errors.push({
                    line: lineNum,
                    raw: rawLine,
                    reason: '列数不正确（填空题2-3列，判断题2-4列，选择题6-7列）'
                });
                continue;
            }

            var question = fields[0].trim();
            if (question === '') {
                result.errors.push({
                    line: lineNum,
                    raw: rawLine,
                    reason: '题目为空'
                });
                continue;
            }

            if (seenQuestions[question]) {
                result.duplicates.push({
                    line: lineNum,
                    question: question,
                    raw: rawLine
                });
                continue;
            }

            var answer = '';
            var answerUpper = '';
            var isJudge = false;
            var judgeAnswerText = '';

            if (fields.length >= 6) {
                answer = fields[5].trim();
                answerUpper = answer.toUpperCase();
                var hasOptions = fields[1].trim() !== '' || fields[2].trim() !== '' ||
                                  fields[3].trim() !== '' || fields[4].trim() !== '';
                var isJudgeOption6 = (fields[1].trim() === '对' && fields[2].trim() === '错') ||
                                     (fields[1].trim() === '对' && fields[2].trim() === '错');
                var isJudgeAnswer6 = answer === '对' || answer === '错' ||
                                     answerUpper === 'T' || answerUpper === 'F' ||
                                     answerUpper === 'TRUE' || answerUpper === 'FALSE';

                if (isJudgeOption6 || (hasOptions === false && isJudgeAnswer6)) {
                    isJudge = true;
                    judgeAnswerText = answer;
                } else if (hasOptions && (answerUpper === 'A' || answerUpper === 'B' ||
                    answerUpper === 'C' || answerUpper === 'D')) {
                    seenQuestions[question] = true;
                    result.success.push({
                        type: 'choice',
                        question: question,
                        options: [
                            fields[1].trim(),
                            fields[2].trim(),
                            fields[3].trim(),
                            fields[4].trim()
                        ],
                        answer: answerUpper
                    });
                } else if (!hasOptions) {
                    seenQuestions[question] = true;
                    result.success.push({
                        type: 'fill',
                        question: question,
                        answer: this._parseFillAnswer(answer)
                    });
                } else {
                    result.errors.push({
                        line: lineNum,
                        raw: rawLine,
                        reason: '选择题答案必须是A/B/C/D'
                    });
                    continue;
                }
            } else if (fields.length === 4) {
                answer = fields[3].trim();
                answerUpper = answer.toUpperCase();
                var opt1 = fields[1].trim();
                var opt2 = fields[2].trim();
                if ((opt1 === '对' && opt2 === '错') ||
                    (opt1 === '错' && opt2 === '对')) {
                    isJudge = true;
                    judgeAnswerText = answer;
                } else {
                    seenQuestions[question] = true;
                    result.success.push({
                        type: 'fill',
                        question: question,
                        answer: this._parseFillAnswer(answer)
                    });
                }
            } else if (fields.length === 2 || fields.length === 3) {
                answer = fields[1].trim();
                answerUpper = answer.toUpperCase();
                var isJudgeAns = answer === '对' || answer === '错' ||
                                 answerUpper === 'T' || answerUpper === 'F' ||
                                 answerUpper === 'TRUE' || answerUpper === 'FALSE';
                if (isJudgeAns) {
                    isJudge = true;
                    judgeAnswerText = answer;
                } else {
                    seenQuestions[question] = true;
                    result.success.push({
                        type: 'fill',
                        question: question,
                        answer: this._parseFillAnswer(answer)
                    });
                }
            }

            if (isJudge) {
                var judgeLetter = 'A';
                var judgeAnsUpper = judgeAnswerText.toUpperCase();
                if (judgeAnswerText === '错' || judgeAnsUpper === 'F' || judgeAnsUpper === 'FALSE') {
                    judgeLetter = 'B';
                }
                seenQuestions[question] = true;
                result.success.push({
                    type: 'judge',
                    question: question,
                    options: ['对', '错'],
                    answer: judgeLetter
                });
            }
        }

        return result;
    },

    _splitCSVLine: function(line) {
        var result = [];
        var current = '';
        var inQuotes = false;
        var i = 0;

        while (i < line.length) {
            var ch = line.charAt(i);

            if (inQuotes) {
                if (ch === '"') {
                    if (i + 1 < line.length && line.charAt(i + 1) === '"') {
                        current += '"';
                        i += 2;
                    } else {
                        inQuotes = false;
                        i++;
                    }
                } else {
                    current += ch;
                    i++;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                    i++;
                } else if (ch === ',') {
                    result.push(current);
                    current = '';
                    i++;
                } else {
                    current += ch;
                    i++;
                }
            }
        }

        result.push(current);
        return result;
    },

    _parseFillAnswer: function(rawAnswer) {
        var trimmed = rawAnswer.trim();
        if (trimmed.indexOf('|') !== -1) {
            var parts = trimmed.split('|');
            var answers = [];
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].trim();
                if (part) {
                    answers.push(part);
                }
            }
            return answers.length > 1 ? answers : (answers[0] || trimmed);
        }
        return trimmed;
    }
};

// ------------------------------------------------------------
// Module 3: QuestionManager - 题库增删改查与错题管理
// ------------------------------------------------------------
var QuestionManager = {
    _questions: [],

    init: function() {
        this._questions = Storage.getQuestions();
    },

    getAll: function() {
        var result = [];
        for (var i = 0; i < this._questions.length; i++) {
            result.push(this._shallowCopy(this._questions[i]));
        }
        return result;
    },

    getById: function(id) {
        for (var i = 0; i < this._questions.length; i++) {
            if (this._questions[i].id === id) {
                return this._shallowCopy(this._questions[i]);
            }
        }
        return null;
    },

    importQuestions: function(parsed, mode) {
        var result = {
            success: 0,
            duplicates: 0,
            errors: 0
        };

        if (!parsed || !Array.isArray(parsed)) {
            return result;
        }

        var existingQuestions = {};
        var startIdx = 0;

        if (mode === 'append') {
            for (var i = 0; i < this._questions.length; i++) {
                existingQuestions[this._questions[i].question] = true;
            }
        } else if (mode === 'overwrite') {
            this._questions = [];
        }

        var now = Date.now();

        for (var j = 0; j < parsed.length; j++) {
            var item = parsed[j];

            if (!item || !item.question || !item.type) {
                result.errors++;
                continue;
            }

            if (existingQuestions[item.question]) {
                result.duplicates++;
                continue;
            }

            var question = this._shallowCopy(item);
            question.id = this._generateId();
            question.wrongCount = 0;
            question.correctStreak = 0;
            question.createdAt = now;
            question.updatedAt = now;

            this._questions.push(question);
            existingQuestions[item.question] = true;
            result.success++;
        }

        this._save();
        return result;
    },

    recordAnswer: function(id, isCorrect) {
        var q = this._findById(id);
        if (!q) return;

        if (isCorrect) {
            q.correctStreak++;
        } else {
            q.wrongCount++;
            q.correctStreak = 0;
        }
        q.updatedAt = Date.now();
        this._save();
    },

    isWrong: function(id) {
        var q = this._findById(id);
        if (!q) return false;
        var threshold = Storage.getSettings().masterThreshold;
        return q.wrongCount > 0 && q.correctStreak < threshold;
    },

    toggleStar: function(id, starred) {
        var q = this._findById(id);
        if (!q) return;

        var threshold = Storage.getSettings().masterThreshold;
        if (starred) {
            q.wrongCount = Math.max(q.wrongCount, 1);
            q.correctStreak = 0;
        } else {
            q.correctStreak = threshold;
        }
        q.updatedAt = Date.now();
        this._save();
    },

    getWrongQuestions: function() {
        var result = [];
        var threshold = Storage.getSettings().masterThreshold;
        for (var i = 0; i < this._questions.length; i++) {
            var q = this._questions[i];
            if (q.wrongCount > 0 && q.correctStreak < threshold) {
                result.push(this._shallowCopy(q));
            }
        }
        return result;
    },

    updateQuestion: function(id, data) {
        var q = this._findById(id);
        if (!q) {
            return { success: false, reason: 'not_found' };
        }

        if (data.question !== undefined && data.question !== q.question) {
            for (var i = 0; i < this._questions.length; i++) {
                if (this._questions[i].id !== id && this._questions[i].question === data.question) {
                    return { success: false, reason: 'duplicate' };
                }
            }
        }

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                q[key] = data[key];
            }
        }
        q.updatedAt = Date.now();
        this._save();
        return { success: true };
    },

    deleteQuestion: function(id) {
        for (var i = 0; i < this._questions.length; i++) {
            if (this._questions[i].id === id) {
                this._questions.splice(i, 1);
                this._save();
                return true;
            }
        }
        return false;
    },

    _generateId: function() {
        return 'q_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    },

    _save: function() {
        Storage.saveQuestions(this._questions);
    },

    _findById: function(id) {
        for (var i = 0; i < this._questions.length; i++) {
            if (this._questions[i].id === id) {
                return this._questions[i];
            }
        }
        return null;
    },

    _shallowCopy: function(obj) {
        var copy = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = obj[key];
            }
        }
        return copy;
    }
};

// ------------------------------------------------------------
// Module 4: QuizEngine - 答题引擎（出题、判题、进度）
// ------------------------------------------------------------
var QuizEngine = {
    checkAnswer: function(question, userAnswer) {
        var userAns = (userAnswer || '').toString().trim();

        if (question.type === 'choice' || question.type === 'judge') {
            var correctAns = (question.answer || '').toString();
            return { isCorrect: userAns.toUpperCase() === correctAns.toUpperCase() };
        } else {
            if (Array.isArray(question.answer)) {
                var userLower = userAns.toLowerCase();
                for (var i = 0; i < question.answer.length; i++) {
                    if (userLower === question.answer[i].trim().toLowerCase()) {
                        return { isCorrect: true };
                    }
                }
                return { isCorrect: false };
            }
            var correctStr = (question.answer || '').toString();
            return { isCorrect: userAns.toLowerCase() === correctStr.trim().toLowerCase() };
        }
    },

    createQuiz: function(questions, mode, options) {
        options = options || {};
        var qArr = [];
        for (var i = 0; i < questions.length; i++) {
            qArr.push(this._shallowCopy(questions[i]));
        }

        if (mode === 'weighted') {
            var count = options.count || 20;
            qArr = this._weightedSample(qArr, count);
        } else {
            qArr = this._shuffleArray(qArr);

            if (mode === 'count') {
                var countVal = options.count || 0;
                if (countVal > 0 && countVal < qArr.length) {
                    qArr = qArr.slice(0, countVal);
                }
            }
        }

        if (options.shuffleOptions) {
            for (var j = 0; j < qArr.length; j++) {
                if (qArr[j].type === 'choice' || qArr[j].type === 'judge') {
                    qArr[j] = this._shuffleOptions(qArr[j]);
                }
            }
        }

        return {
            mode: mode,
            questions: qArr,
            currentIndex: 0,
            answers: [],
            isFinished: false
        };
    },

    getCurrent: function(quiz) {
        if (!quiz || !quiz.questions || quiz.currentIndex < 0 || quiz.currentIndex >= quiz.questions.length) {
            return null;
        }
        return quiz.questions[quiz.currentIndex];
    },

    goNext: function(quiz) {
        if (!quiz || quiz.currentIndex >= quiz.questions.length - 1) {
            if (quiz) {
                quiz.isFinished = true;
            }
            return false;
        }
        quiz.currentIndex++;
        if (quiz.currentIndex >= quiz.questions.length - 1 && quiz.answers.length >= quiz.questions.length) {
            quiz.isFinished = true;
        }
        return true;
    },

    goPrev: function(quiz) {
        if (!quiz || quiz.currentIndex <= 0) {
            return false;
        }
        quiz.currentIndex--;
        quiz.isFinished = false;
        return true;
    },

    submitAnswer: function(quiz, userAnswer) {
        var current = this.getCurrent(quiz);
        if (!current) {
            return { isCorrect: false };
        }
        var result = this.checkAnswer(current, userAnswer);
        quiz.answers.push(result);
        if (quiz.answers.length >= quiz.questions.length && quiz.currentIndex >= quiz.questions.length - 1) {
            quiz.isFinished = true;
        }
        return result;
    },

    getResult: function(quiz) {
        var total = quiz.questions.length;
        var correct = 0;
        for (var i = 0; i < quiz.answers.length; i++) {
            if (quiz.answers[i].isCorrect) {
                correct++;
            }
        }
        var wrong = quiz.answers.length - correct;
        var accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        return {
            total: total,
            correct: correct,
            wrong: wrong,
            accuracy: accuracy
        };
    },

    _shuffleArray: function(arr) {
        var result = arr.slice();
        for (var i = result.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    },

    _calcWeight: function(question) {
        var wrongCount = question.wrongCount || 0;
        var streak = question.correctStreak || 0;
        var weight = (2 + wrongCount) / (1 + streak / 2);
        return Math.max(0.3, weight);
    },

    _weightedSample: function(arr, count) {
        var pool = arr.slice();
        var result = [];
        var n = Math.min(count, pool.length);

        for (var i = 0; i < n; i++) {
            var totalWeight = 0;
            for (var k = 0; k < pool.length; k++) {
                totalWeight += this._calcWeight(pool[k]);
            }

            var rand = Math.random() * totalWeight;
            var cumulative = 0;
            var pickIdx = pool.length - 1;

            for (var j = 0; j < pool.length; j++) {
                cumulative += this._calcWeight(pool[j]);
                if (rand < cumulative) {
                    pickIdx = j;
                    break;
                }
            }

            result.push(pool[pickIdx]);
            pool.splice(pickIdx, 1);
        }

        return result;
    },

    _shuffleOptions: function(question) {
        if (question.type !== 'choice') {
            return question;
        }
        var correctIdx = question.answer.charCodeAt(0) - 65;
        var correctOption = question.options[correctIdx];
        var shuffledOptions = this._shuffleArray(question.options.slice());
        var newCorrectIdx = 0;
        for (var i = 0; i < shuffledOptions.length; i++) {
            if (shuffledOptions[i] === correctOption) {
                newCorrectIdx = i;
                break;
            }
        }
        var newAnswer = String.fromCharCode(65 + newCorrectIdx);
        return {
            id: question.id,
            type: question.type,
            question: question.question,
            options: shuffledOptions,
            answer: newAnswer,
            wrongCount: question.wrongCount,
            correctStreak: question.correctStreak
        };
    },

    _shallowCopy: function(obj) {
        var copy = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (Array.isArray(obj[key])) {
                    copy[key] = obj[key].slice();
                } else {
                    copy[key] = obj[key];
                }
            }
        }
        return copy;
    }
};

// ------------------------------------------------------------
// Module 5: UI - 渲染与交互
// ------------------------------------------------------------
var UI = {
    _currentQuiz: null,
    _autoNextTimer: null,
    _isBankMode: false,
    _bankFilter: 'all',
    _bankSearch: '',
    _selectedQuestionId: null,

    // ============================================================
    // 5.1 刷题设置区
    // ============================================================
    initQuizSettings: function() {
        var container = document.getElementById('quiz-settings');
        if (!container) return;

        var settings = Storage.getSettings();
        var allQuestions = QuestionManager.getAll();
        var wrongQuestions = QuestionManager.getWrongQuestions();

        container.innerHTML = '';

        var title = document.createElement('h3');
        title.className = 'font-semibold text-neutral-dark flex items-center mb-3';
        title.innerHTML = '<i class="fa fa-cog mr-2 text-primary"></i>刷题设置';
        container.appendChild(title);

        var modeGroup = document.createElement('div');
        modeGroup.className = 'bg-white rounded-xl p-3 shadow-sm mb-3';
        modeGroup.innerHTML = '<p class="text-sm font-medium text-neutral-dark mb-2">模式选择</p>';

        var modes = [
            { value: 'all', label: '全部题目', icon: 'fa-book' },
            { value: 'count', label: '指定数量', icon: 'fa-hashtag' },
            { value: 'weighted', label: '加权随机', icon: 'fa-balance-scale' },
            { value: 'wrong', label: '错题重刷', icon: 'fa-star' }
        ];

        for (var i = 0; i < modes.length; i++) {
            var modeLabel = document.createElement('label');
            modeLabel.className = 'flex items-center cursor-pointer' + (i < modes.length - 1 ? ' mb-2' : '');
            var checked = settings.lastQuizMode === modes[i].value ? ' checked' : '';
            modeLabel.innerHTML = '<input type="radio" name="quiz-mode" value="' + modes[i].value + '"' + checked + ' class="mr-2 text-primary"><span class="text-sm text-gray-700"><i class="fa ' + modes[i].icon + ' mr-1 text-secondary" aria-hidden="true"></i>' + modes[i].label + '</span>';
            modeGroup.appendChild(modeLabel);
        }

        var countInputDiv = document.createElement('div');
        countInputDiv.id = 'quiz-count-input';
        var showCountInput = settings.lastQuizMode === 'count' || settings.lastQuizMode === 'weighted';
        countInputDiv.className = 'mt-3 pl-6' + (showCountInput ? '' : ' hidden');
        countInputDiv.innerHTML = '\
            <div class="flex items-center">\
                <span class="text-sm text-gray-600 mr-2">数量：</span>\
                <input type="number" id="quiz-count" min="1" value="' + settings.lastQuizCount + '" class="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary">\
                <span class="text-sm text-gray-500 ml-2">道</span>\
            </div>\
        ';
        modeGroup.appendChild(countInputDiv);

        container.appendChild(modeGroup);

        var thresholdGroup = document.createElement('div');
        thresholdGroup.className = 'bg-white rounded-xl p-3 shadow-sm mb-3';
        thresholdGroup.innerHTML = '\
            <p class="text-sm font-medium text-neutral-dark mb-2">错题康复阈值</p>\
            <div class="flex items-center">\
                <span class="text-sm text-gray-600 mr-2">连续答对</span>\
                <input type="number" id="master-threshold" min="1" max="10" value="' + settings.masterThreshold + '" class="w-16 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary text-center">\
                <span class="text-sm text-gray-500 ml-2">次后从错题本移除</span>\
            </div>\
        ';
        container.appendChild(thresholdGroup);

        var shuffleGroup = document.createElement('div');
        shuffleGroup.className = 'bg-white rounded-xl p-3 shadow-sm mb-3';
        var shuffleChecked = settings.shuffleOptions ? ' checked' : '';
        shuffleGroup.innerHTML = '\
            <label class="flex items-center cursor-pointer">\
                <input type="checkbox" id="shuffle-options"' + shuffleChecked + ' class="mr-2 text-primary">\
                <span class="text-sm text-gray-700"><i class="fa fa-random mr-1 text-secondary" aria-hidden="true"></i>选项打乱</span>\
            </label>\
        ';
        container.appendChild(shuffleGroup);

        var statsGroup = document.createElement('div');
        statsGroup.className = 'bg-white rounded-xl p-3 shadow-sm mb-4';
        statsGroup.innerHTML = '\
            <p class="text-sm font-medium text-neutral-dark mb-2">统计信息</p>\
            <div class="flex justify-between text-sm">\
                <span class="text-gray-600">总题数：<span class="font-semibold text-neutral-dark" id="stat-total">' + allQuestions.length + '</span> 道</span>\
                <span class="text-gray-600">错题：<span class="font-semibold text-red-500" id="stat-wrong">' + wrongQuestions.length + '</span> 道</span>\
            </div>\
        ';
        container.appendChild(statsGroup);

        var startBtn = document.createElement('button');
        startBtn.id = 'start-quiz-btn';
        startBtn.className = 'w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg';
        startBtn.innerHTML = '<i class="fa fa-play mr-2"></i>开始刷题';
        container.appendChild(startBtn);

        var disabledTip = document.createElement('p');
        disabledTip.id = 'quiz-disabled-tip';
        disabledTip.className = 'text-xs text-red-500 text-center mt-2 hidden';
        container.appendChild(disabledTip);

        var self = this;
        var radios = modeGroup.querySelectorAll('input[name="quiz-mode"]');
        for (var j = 0; j < radios.length; j++) {
            radios[j].addEventListener('change', function() {
                var countInput = document.getElementById('quiz-count-input');
                if (this.value === 'count' || this.value === 'weighted') {
                    countInput.classList.remove('hidden');
                } else {
                    countInput.classList.add('hidden');
                }
                self._updateStartButtonState();
                self._saveSettingsFromUI();
            });
        }

        var countInput = document.getElementById('quiz-count');
        if (countInput) {
            countInput.addEventListener('input', function() {
                var val = parseInt(this.value);
                if (isNaN(val) || val < 1) {
                    this.value = 1;
                }
                self._saveSettingsFromUI();
            });
        }

        var shuffleCheckbox = document.getElementById('shuffle-options');
        if (shuffleCheckbox) {
            shuffleCheckbox.addEventListener('change', function() {
                self._saveSettingsFromUI();
            });
        }

        var thresholdInput = document.getElementById('master-threshold');
        if (thresholdInput) {
            thresholdInput.addEventListener('input', function() {
                var val = parseInt(this.value);
                if (isNaN(val) || val < 1) {
                    this.value = 1;
                } else if (val > 10) {
                    this.value = 10;
                }
                self._saveSettingsFromUI();
                self.refreshWrongList();
                self.refreshBankList();
                self.refreshSettingsStats();
            });
        }

        startBtn.addEventListener('click', function() {
            self._handleStartQuiz();
        });

        this._updateStartButtonState();
    },

    _updateStartButtonState: function() {
        var startBtn = document.getElementById('start-quiz-btn');
        var disabledTip = document.getElementById('quiz-disabled-tip');
        if (!startBtn) return;

        var mode = this._getSelectedMode();
        var allQuestions = QuestionManager.getAll();
        var wrongQuestions = QuestionManager.getWrongQuestions();

        var disabled = false;
        var tipText = '';

        if (allQuestions.length === 0) {
            disabled = true;
            tipText = '题库为空，请先导入题目';
        } else if (mode === 'wrong' && wrongQuestions.length === 0) {
            disabled = true;
            tipText = '暂无错题，无需重刷';
        }

        if (disabled) {
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            startBtn.classList.remove('hover:bg-primary/90', 'hover:shadow-lg');
            if (disabledTip) {
                disabledTip.textContent = tipText;
                disabledTip.classList.remove('hidden');
            }
        } else {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            startBtn.classList.add('hover:bg-primary/90', 'hover:shadow-lg');
            if (disabledTip) {
                disabledTip.classList.add('hidden');
            }
        }
    },

    _getSelectedMode: function() {
        var radios = document.querySelectorAll('input[name="quiz-mode"]');
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                return radios[i].value;
            }
        }
        return 'all';
    },

    _saveSettingsFromUI: function() {
        var mode = this._getSelectedMode();
        var countInput = document.getElementById('quiz-count');
        var count = countInput ? parseInt(countInput.value) || 20 : 20;
        var shuffleCheckbox = document.getElementById('shuffle-options');
        var shuffle = shuffleCheckbox ? shuffleCheckbox.checked : true;
        var thresholdInput = document.getElementById('master-threshold');
        var threshold = thresholdInput ? parseInt(thresholdInput.value) || 2 : 2;

        Storage.saveSettings({
            shuffleOptions: shuffle,
            lastQuizMode: mode,
            lastQuizCount: count,
            masterThreshold: threshold
        });
    },

    _handleStartQuiz: function() {
        var mode = this._getSelectedMode();
        var countInput = document.getElementById('quiz-count');
        var count = countInput ? parseInt(countInput.value) || 20 : 20;
        var shuffleCheckbox = document.getElementById('shuffle-options');
        var shuffle = shuffleCheckbox ? shuffleCheckbox.checked : true;

        var questions = [];
        if (mode === 'all') {
            questions = QuestionManager.getAll();
        } else if (mode === 'count') {
            questions = QuestionManager.getAll();
        } else if (mode === 'weighted') {
            questions = QuestionManager.getAll();
        } else if (mode === 'wrong') {
            questions = QuestionManager.getWrongQuestions();
        }

        if (questions.length === 0) {
            showToast('没有可用的题目', 'error');
            return;
        }

        this._saveSettingsFromUI();
        this.startQuiz(mode, count, shuffle);

        if (window.innerWidth < 1024 && typeof switchMobileTab === 'function') {
            switchMobileTab('quiz');
        }
    },

    refreshSettingsStats: function() {
        var totalEl = document.getElementById('stat-total');
        var wrongEl = document.getElementById('stat-wrong');
        var allQuestions = QuestionManager.getAll();
        var wrongQuestions = QuestionManager.getWrongQuestions();

        if (totalEl) {
            totalEl.textContent = allQuestions.length;
        }
        if (wrongEl) {
            wrongEl.textContent = wrongQuestions.length;
        }

        this._updateStartButtonState();
    },

    // ============================================================
    // 5.2 答题卡片
    // ============================================================
    startQuiz: function(mode, count, shuffleOptions) {
        if (this._autoNextTimer) {
            clearTimeout(this._autoNextTimer);
            this._autoNextTimer = null;
        }

        var questions = [];
        if (mode === 'all' || mode === 'count' || mode === 'weighted') {
            questions = QuestionManager.getAll();
        } else if (mode === 'wrong') {
            questions = QuestionManager.getWrongQuestions();
        }

        var quiz = QuizEngine.createQuiz(questions, mode, {
            count: count,
            shuffleOptions: shuffleOptions
        });

        this._currentQuiz = quiz;
        this.renderQuizCard();
    },

    renderQuizCard: function() {
        var container = document.getElementById('quiz-container');
        if (!container || !this._currentQuiz) return;

        var quiz = this._currentQuiz;
        var current = QuizEngine.getCurrent(quiz);
        if (!current) return;

        var index = quiz.currentIndex + 1;
        var total = quiz.questions.length;
        var progress = (index / total) * 100;

        var answeredIndex = quiz.currentIndex;
        var hasAnswered = answeredIndex < quiz.answers.length;
        var lastAnswer = hasAnswered ? quiz.answers[answeredIndex] : null;

        container.innerHTML = '';
        container.className = 'min-h-[500px] flex flex-col';

        var progressSection = document.createElement('div');
        progressSection.className = 'mb-6';
        var typeText = '填空题';
        if (current.type === 'choice') typeText = '选择题';
        if (current.type === 'judge') typeText = '判断题';

        progressSection.innerHTML = '\
            <div class="flex items-center justify-between mb-2">\
                <span class="text-sm font-medium text-gray-600">第 ' + index + ' / ' + total + ' 题</span>\
                <span class="type-tag ' + current.type + '">' + typeText + '</span>\
            </div>\
            <div class="quiz-progress-bar">\
                <div class="quiz-progress-fill" style="width: ' + progress + '%"></div>\
            </div>\
        ';
        container.appendChild(progressSection);

        var questionSection = document.createElement('div');
        questionSection.className = 'flex-1 flex flex-col justify-center mb-6';
        var questionText = document.createElement('h2');
        questionText.className = 'text-xl md:text-2xl font-semibold text-neutral-dark text-center leading-relaxed mb-8';
        questionText.textContent = current.question;
        questionSection.appendChild(questionText);

        var answerSection = document.createElement('div');
        answerSection.className = 'space-y-3';

        if (current.type === 'choice' || current.type === 'judge') {
            for (var i = 0; i < current.options.length; i++) {
                var letter = String.fromCharCode(65 + i);
                var optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn w-full';
                if (current.type === 'judge') {
                    optionBtn.className += ' judge-option-btn';
                }
                optionBtn.dataset.letter = letter;

                if (current.type === 'judge') {
                    var judgeIcon = document.createElement('span');
                    judgeIcon.className = 'judge-option-icon';
                    if (i === 0) {
                        judgeIcon.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
                        judgeIcon.classList.add('judge-correct');
                    } else {
                        judgeIcon.innerHTML = '<i class="fa fa-times-circle" aria-hidden="true"></i>';
                        judgeIcon.classList.add('judge-wrong');
                    }
                    optionBtn.appendChild(judgeIcon);

                    var judgeText = document.createElement('span');
                    judgeText.className = 'text-gray-700 text-lg font-medium';
                    judgeText.textContent = current.options[i];
                    optionBtn.appendChild(judgeText);
                } else {
                    var optionLetter = document.createElement('span');
                    optionLetter.className = 'option-letter';
                    optionLetter.textContent = letter;
                    optionBtn.appendChild(optionLetter);

                    var optionText = document.createElement('span');
                    optionText.className = 'text-gray-700 flex-1';
                    optionText.textContent = current.options[i];
                    optionBtn.appendChild(optionText);
                }

                if (hasAnswered) {
                    var isCorrectOption = letter === current.answer;
                    var userAnswer = lastAnswer.userAnswer || '';
                    var isUserSelected = userAnswer.toUpperCase() === letter;

                    optionBtn.disabled = true;
                    optionBtn.classList.add('cursor-default');

                    if (isCorrectOption) {
                        optionBtn.classList.add('correct');
                        var correctIcon = document.createElement('span');
                        correctIcon.className = current.type === 'judge' ? 'text-green-500 ml-2 text-xl' : 'text-green-500 ml-2';
                        correctIcon.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
                        optionBtn.appendChild(correctIcon);
                    } else if (isUserSelected && !lastAnswer.isCorrect) {
                        optionBtn.classList.add('wrong');
                        var wrongIcon = document.createElement('span');
                        wrongIcon.className = current.type === 'judge' ? 'text-red-500 ml-2 text-xl' : 'text-red-500 ml-2';
                        wrongIcon.innerHTML = '<i class="fa fa-times-circle" aria-hidden="true"></i>';
                        optionBtn.appendChild(wrongIcon);
                    }
                } else {
                    var self = this;
                    optionBtn.addEventListener('click', (function(letter) {
                        return function() {
                            UI.submitAnswer(letter);
                        };
                    })(letter));
                }

                answerSection.appendChild(optionBtn);
            }
        } else {
            var fillContainer = document.createElement('div');
            fillContainer.className = 'space-y-3';

            var fillInput = document.createElement('input');
            fillInput.type = 'text';
            fillInput.id = 'fill-answer-input';
            fillInput.placeholder = '请输入你的答案...';
            fillInput.className = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-primary transition-colors';

            if (hasAnswered) {
                fillInput.disabled = true;
                fillInput.value = lastAnswer.userAnswer || '';
                if (lastAnswer.isCorrect) {
                    fillInput.classList.add('border-green-500', 'bg-green-50');
                } else {
                    fillInput.classList.add('border-red-500', 'bg-red-50');
                }
            }
            fillContainer.appendChild(fillInput);

            if (!hasAnswered) {
                var submitFillBtn = document.createElement('button');
                submitFillBtn.id = 'submit-fill-btn';
                submitFillBtn.className = 'w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-colors';
                submitFillBtn.innerHTML = '<i class="fa fa-check mr-2"></i>提交答案';
                fillContainer.appendChild(submitFillBtn);

                var self = this;
                submitFillBtn.addEventListener('click', function() {
                    var input = document.getElementById('fill-answer-input');
                    if (input) {
                        UI.submitAnswer(input.value);
                    }
                });

                fillInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        var input = document.getElementById('fill-answer-input');
                        if (input) {
                            UI.submitAnswer(input.value);
                        }
                    }
                });
            }

            answerSection.appendChild(fillContainer);
        }

        questionSection.appendChild(answerSection);

        if (hasAnswered) {
            var feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'mt-6 p-4 rounded-xl text-center ' + (lastAnswer.isCorrect ? 'bg-green-50' : 'bg-red-50');
            if (lastAnswer.isCorrect) {
                feedbackDiv.innerHTML = '<p class="text-green-600 font-semibold"><i class="fa fa-check-circle mr-2"></i>回答正确！</p>';
            } else {
                var displayAnswer = current.answer;
                if (Array.isArray(displayAnswer)) {
                    displayAnswer = displayAnswer.join(' 或 ');
                }
                feedbackDiv.innerHTML = '<p class="text-red-600 font-semibold"><i class="fa fa-times-circle mr-2"></i>回答错误，正确答案是：<span class="underline">' + displayAnswer + '</span></p>';
            }
            questionSection.appendChild(feedbackDiv);
        }

        container.appendChild(questionSection);

        var navSection = document.createElement('div');
        navSection.className = 'flex justify-between items-center pt-4 border-t border-gray-200';

        var prevBtn = document.createElement('button');
        prevBtn.id = 'prev-question-btn';
        prevBtn.className = 'px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center';
        prevBtn.innerHTML = '<i class="fa fa-chevron-left mr-2"></i>上一题';
        if (quiz.currentIndex === 0) {
            prevBtn.disabled = true;
            prevBtn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        } else {
            prevBtn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-50');
        }
        navSection.appendChild(prevBtn);

        var nextBtn = document.createElement('button');
        nextBtn.id = 'next-question-btn';
        nextBtn.className = 'px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center';
        var isLast = quiz.currentIndex >= quiz.questions.length - 1;
        nextBtn.innerHTML = (isLast ? '完成' : '下一题') + '<i class="fa fa-chevron-right ml-2"></i>';
        if (!hasAnswered) {
            nextBtn.disabled = true;
            nextBtn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        } else {
            nextBtn.classList.add('bg-primary', 'text-white', 'hover:bg-primary/90');
        }
        navSection.appendChild(nextBtn);

        container.appendChild(navSection);

        var self = this;
        prevBtn.addEventListener('click', function() {
            self.goPrevQuestion();
        });

        nextBtn.addEventListener('click', function() {
            self.goNextQuestion();
        });

        if (!hasAnswered && current.type === 'fill') {
            var inputEl = document.getElementById('fill-answer-input');
            if (inputEl) {
                inputEl.focus();
            }
        }
    },

    submitAnswer: function(userAnswer) {
        if (!this._currentQuiz) return;

        var quiz = this._currentQuiz;
        var current = QuizEngine.getCurrent(quiz);
        if (!current) return;

        var answeredIndex = quiz.currentIndex;
        if (answeredIndex < quiz.answers.length) {
            return;
        }

        if (current.type === 'fill') {
            var trimmed = (userAnswer || '').trim();
            if (trimmed === '') {
                showToast('请输入答案', 'info');
                var inputEl = document.getElementById('fill-answer-input');
                if (inputEl) {
                    inputEl.focus();
                }
                return;
            }
        }

        var result = QuizEngine.submitAnswer(quiz, userAnswer);
        quiz.answers[quiz.answers.length - 1].userAnswer = userAnswer;

        QuestionManager.recordAnswer(current.id, result.isCorrect);

        this.refreshWrongList();
        this.refreshSettingsStats();

        this.renderQuizCard();

        var self = this;
        if (result.isCorrect) {
            this._autoNextTimer = setTimeout(function() {
                self._autoNextTimer = null;
                if (quiz.currentIndex >= quiz.questions.length - 1) {
                    self.showResultView();
                } else {
                    self.goNextQuestion();
                }
            }, 800);
        }
    },

    goNextQuestion: function() {
        if (!this._currentQuiz) return;

        if (this._autoNextTimer) {
            clearTimeout(this._autoNextTimer);
            this._autoNextTimer = null;
        }

        var quiz = this._currentQuiz;
        if (quiz.currentIndex >= quiz.questions.length - 1) {
            this.showResultView();
            return;
        }

        QuizEngine.goNext(quiz);
        this.renderQuizCard();
    },

    goPrevQuestion: function() {
        if (!this._currentQuiz) return;

        if (this._autoNextTimer) {
            clearTimeout(this._autoNextTimer);
            this._autoNextTimer = null;
        }

        var quiz = this._currentQuiz;
        if (quiz.currentIndex <= 0) return;

        QuizEngine.goPrev(quiz);
        this.renderQuizCard();
    },

    // ============================================================
    // 5.3 结算页面（Task 8 完善）
    // ============================================================
    showResultView: function() {
        if (!this._currentQuiz) return;

        if (this._autoNextTimer) {
            clearTimeout(this._autoNextTimer);
            this._autoNextTimer = null;
        }

        var container = document.getElementById('quiz-container');
        if (!container) return;

        var result = QuizEngine.getResult(this._currentQuiz);

        container.innerHTML = '';
        container.className = 'min-h-[500px] flex flex-col items-center justify-center';

        var resultCard = document.createElement('div');
        resultCard.className = 'text-center w-full max-w-md';
        resultCard.innerHTML = '\
            <div class="mb-6">\
                <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">\
                    <i class="fa fa-trophy text-4xl text-primary" aria-hidden="true"></i>\
                </div>\
                <h2 class="text-2xl font-bold text-neutral-dark mb-2">答题完成！</h2>\
                <p class="text-gray-500">本次刷题结果如下</p>\
            </div>\
            <div class="grid grid-cols-3 gap-3 mb-8">\
                <div class="result-stat">\
                    <div class="number">' + result.total + '</div>\
                    <div class="label">总题数</div>\
                </div>\
                <div class="result-stat correct">\
                    <div class="number">' + result.correct + '</div>\
                    <div class="label">答对</div>\
                </div>\
                <div class="result-stat wrong">\
                    <div class="number">' + result.wrong + '</div>\
                    <div class="label">答错</div>\
                </div>\
            </div>\
            <div class="result-stat accuracy mb-8">\
                <div class="number">' + result.accuracy + '%</div>\
                <div class="label">正确率</div>\
            </div>\
            <div class="space-y-3">\
                <button id="result-retry-btn" class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-colors">\
                    <i class="fa fa-refresh mr-2"></i>再来一次\
                </button>\
                <button id="result-back-btn" class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-3 px-4 rounded-xl transition-colors">\
                    <i class="fa fa-arrow-left mr-2"></i>返回设置\
                </button>\
            </div>\
        ';
        container.appendChild(resultCard);

        var self = this;
        var retryBtn = document.getElementById('result-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                var mode = self._currentQuiz.mode;
                var settings = Storage.getSettings();
                self.startQuiz(mode, settings.lastQuizCount, settings.shuffleOptions);
            });
        }

        var backBtn = document.getElementById('result-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                self._currentQuiz = null;
                self._showEmptyState();
            });
        }
    },

    _showEmptyState: function() {
        var container = document.getElementById('quiz-container');
        if (!container) return;

        container.innerHTML = '';
        container.className = 'min-h-[500px] flex flex-col';

        var emptyState = document.createElement('div');
        emptyState.id = 'quiz-empty-state';
        emptyState.className = 'flex-1 flex flex-col items-center justify-center text-center py-12';
        emptyState.innerHTML = '\
            <i class="fa fa-graduation-cap text-6xl text-gray-300 mb-4" aria-hidden="true"></i>\
            <p class="text-lg text-secondary">导入题库后开始刷题吧~</p>\
        ';
        container.appendChild(emptyState);
    },

    // ============================================================
    // 5.4 导入区域
    // ============================================================
    initImportSection: function() {
        var container = document.getElementById('import-section');
        if (!container) return;

        container.innerHTML = '';

        var title = document.createElement('h3');
        title.className = 'font-semibold text-neutral-dark flex items-center mb-3';
        title.innerHTML = '<i class="fa fa-cloud-upload mr-2 text-primary"></i>导入 CSV 题库';
        container.appendChild(title);

        var fileLabel = document.createElement('label');
        fileLabel.className = 'block w-full cursor-pointer bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center mb-3';
        fileLabel.innerHTML = '<i class="fa fa-file-text-o mr-2"></i>选择 CSV 文件';
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.id = 'csv-file-input';
        fileInput.className = 'hidden';
        fileLabel.appendChild(fileInput);
        container.appendChild(fileLabel);

        var fileName = document.createElement('p');
        fileName.id = 'selected-file-name';
        fileName.className = 'text-sm text-secondary text-center mb-3 truncate';
        container.appendChild(fileName);

        var modeGroup = document.createElement('div');
        modeGroup.className = 'bg-white rounded-xl p-3 shadow-sm mb-3';
        modeGroup.innerHTML = '<p class="text-sm font-medium text-neutral-dark mb-2">导入模式</p>';

        var overwriteLabel = document.createElement('label');
        overwriteLabel.className = 'flex items-center cursor-pointer mb-2';
        overwriteLabel.innerHTML = '<input type="radio" name="import-mode" value="overwrite" checked class="mr-2 text-primary"><span class="text-sm text-gray-700">覆盖导入</span>';
        modeGroup.appendChild(overwriteLabel);

        var appendLabel = document.createElement('label');
        appendLabel.className = 'flex items-center cursor-pointer';
        appendLabel.innerHTML = '<input type="radio" name="import-mode" value="append" class="mr-2 text-primary"><span class="text-sm text-gray-700">追加导入</span>';
        modeGroup.appendChild(appendLabel);
        container.appendChild(modeGroup);

        var tip = document.createElement('p');
        tip.className = 'text-xs text-secondary leading-relaxed';
        tip.innerHTML = '<i class="fa fa-info-circle mr-1"></i>UTF-8 编码，选择题6列，填空题2列';
        container.appendChild(tip);

        var self = this;
        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            fileName.textContent = file.name;

            var mode = 'overwrite';
            var radios = document.querySelectorAll('input[name="import-mode"]');
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    mode = radios[i].value;
                    break;
                }
            }

            var reader = new FileReader();
            reader.onload = function(event) {
                var csvText = self._decodeFileContent(event.target.result, file);
                var parsed = CSVParser.parse(csvText);

                var importResult = QuestionManager.importQuestions(parsed.success, mode);

                var totalErrors = importResult.errors + parsed.errors.length;
                var totalDuplicates = importResult.duplicates + parsed.duplicates.length;

                var result = {
                    success: importResult.success,
                    duplicates: totalDuplicates,
                    errors: totalErrors
                };

                self.showImportResult(result);
                self.refreshBankList();
                self.refreshWrongList();
                self.refreshStats();
                showToast('导入完成');

                fileInput.value = '';
                fileName.textContent = '';
            };
            reader.readAsArrayBuffer(file);
        });
    },

    _decodeFileContent: function(arrayBuffer, file) {
        var bytes = new Uint8Array(arrayBuffer);
        var isUTF8 = this._detectUTF8(bytes);
        
        if (isUTF8) {
            return new TextDecoder('UTF-8').decode(bytes);
        } else {
            return new TextDecoder('GBK').decode(bytes);
        }
    },

    _detectUTF8: function(bytes) {
        var i = 0;
        while (i < bytes.length) {
            if (bytes[i] < 0x80) {
                i++;
            } else if (bytes[i] >= 0xC2 && bytes[i] <= 0xDF) {
                if (i + 1 >= bytes.length) return false;
                if (bytes[i + 1] < 0x80 || bytes[i + 1] > 0xBF) return false;
                i += 2;
            } else if (bytes[i] >= 0xE0 && bytes[i] <= 0xEF) {
                if (i + 2 >= bytes.length) return false;
                if (bytes[i + 1] < 0x80 || bytes[i + 1] > 0xBF) return false;
                if (bytes[i + 2] < 0x80 || bytes[i + 2] > 0xBF) return false;
                i += 3;
            } else if (bytes[i] >= 0xF0 && bytes[i] <= 0xF4) {
                if (i + 3 >= bytes.length) return false;
                if (bytes[i + 1] < 0x80 || bytes[i + 1] > 0xBF) return false;
                if (bytes[i + 2] < 0x80 || bytes[i + 2] > 0xBF) return false;
                if (bytes[i + 3] < 0x80 || bytes[i + 3] > 0xBF) return false;
                i += 4;
            } else {
                return false;
            }
        }
        return true;
    },

    showImportResult: function(result) {
        var modalId = 'import-result';
        var existing = document.getElementById(modalId + '-modal');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var modal = createModal({
            id: modalId,
            title: '导入结果',
            icon: 'fa-check-circle',
            iconColor: 'text-green-500',
            size: 'max-w-md',
            content: ''
        });

        var modalsContainer = document.getElementById('modals-container') || document.body;
        modalsContainer.appendChild(modal);

        var content = document.getElementById(modalId + '-content');
        if (content) {
            content.innerHTML = '\
                <div class="space-y-4">\
                    <div class="flex items-center justify-between bg-green-50 rounded-lg p-4">\
                        <span class="text-gray-700">成功导入</span>\
                        <span class="text-2xl font-bold text-green-600">' + result.success + ' 道</span>\
                    </div>\
                    <div class="flex items-center justify-between bg-yellow-50 rounded-lg p-4">\
                        <span class="text-gray-700">重复跳过</span>\
                        <span class="text-2xl font-bold text-yellow-600">' + result.duplicates + ' 道</span>\
                    </div>\
                    <div class="flex items-center justify-between bg-red-50 rounded-lg p-4">\
                        <span class="text-gray-700">错误跳过</span>\
                        <span class="text-2xl font-bold text-red-500">' + result.errors + ' 道</span>\
                    </div>\
                    <div class="pt-4">\
                        <button id="import-result-ok" class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors">\
                            确定\
                        </button>\
                    </div>\
                </div>\
            ';
        }

        initModal(modalId + '-modal', null, modalId + '-close', modalId + '-overlay');

        var okBtn = document.getElementById('import-result-ok');
        if (okBtn) {
            okBtn.addEventListener('click', function() {
                closeModal(modalId + '-modal');
            });
        }

        openModal(modalId + '-modal');
    },

    refreshBankList: function() {
        var container = document.getElementById('bank-list');
        if (!container) return;

        var questions = QuestionManager.getAll();

        if (questions.length === 0) {
            container.innerHTML = '\
                <div class="text-center text-secondary py-8">\
                    <i class="fa fa-file-text-o text-3xl mb-2 opacity-50" aria-hidden="true"></i>\
                    <p class="text-sm">暂无题目</p>\
                </div>\
            ';
            return;
        }

        container.innerHTML = '';
        var self = this;

        var exportBankBtnContainer = document.createElement('div');
        exportBankBtnContainer.className = 'mb-3';
        var exportBankBtn = document.createElement('button');
        exportBankBtn.id = 'export-bank-btn';
        exportBankBtn.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center';
        exportBankBtn.innerHTML = '<i class="fa fa-upload mr-2"></i>导出题库';
        if (questions.length === 0) {
            exportBankBtn.disabled = true;
            exportBankBtn.classList.add('opacity-50', 'cursor-not-allowed');
            exportBankBtn.classList.remove('hover:bg-blue-600');
        }
        exportBankBtn.addEventListener('click', function() {
            self.exportQuestions();
        });
        exportBankBtnContainer.appendChild(exportBankBtn);
        container.appendChild(exportBankBtnContainer);

        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var card = this._createQuestionCard(q);
            container.appendChild(card);
        }
    },

    refreshWrongList: function() {
        var container = document.getElementById('wrong-list');
        if (!container) return;

        var questions = QuestionManager.getWrongQuestions();
        var self = this;

        container.innerHTML = '';

        var exportBtnContainer = document.createElement('div');
        exportBtnContainer.className = 'mb-3';
        var exportBtn = document.createElement('button');
        exportBtn.id = 'export-wrong-btn';
        exportBtn.className = 'w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center';
        exportBtn.innerHTML = '<i class="fa fa-download mr-2"></i>导出错题';
        exportBtn.addEventListener('click', function() {
            self.exportWrongQuestions();
        });
        exportBtnContainer.appendChild(exportBtn);
        container.appendChild(exportBtnContainer);

        if (questions.length === 0) {
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'text-center text-secondary py-8';
            emptyDiv.innerHTML = '\
                <i class="fa fa-star-o text-3xl mb-2 opacity-50" aria-hidden="true"></i>\
                <p class="text-sm">暂无错题</p>\
            ';
            container.appendChild(emptyDiv);
            return;
        }

        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var card = this._createQuestionCard(q);
            container.appendChild(card);
        }
    },

    refreshStats: function() {
        this.refreshSettingsStats();
    },

    _createQuestionCard: function(question) {
        var self = this;
        var card = document.createElement('div');
        card.className = 'bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer';
        card.dataset.id = question.id;

        var typeLabel = document.createElement('span');
        typeLabel.className = 'inline-block text-xs font-medium px-2 py-0.5 rounded mb-2 ' +
            (question.type === 'choice' ? 'bg-blue-100 text-blue-700' :
             question.type === 'judge' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700');
        var typeName = '填空题';
        if (question.type === 'choice') typeName = '选择题';
        if (question.type === 'judge') typeName = '判断题';
        typeLabel.textContent = typeName;
        card.appendChild(typeLabel);

        var contentRow = document.createElement('div');
        contentRow.className = 'flex items-start justify-between';

        var textEl = document.createElement('p');
        textEl.className = 'text-sm text-gray-700 flex-1 mr-2 line-clamp-2';
        var qText = question.question;
        if (qText.length > 30) {
            qText = qText.substring(0, 30) + '...';
        }
        textEl.textContent = qText;
        contentRow.appendChild(textEl);

        var starBtn = document.createElement('button');
        starBtn.className = 'text-yellow-400 hover:text-yellow-500 transition-colors flex-shrink-0 p-1';
        starBtn.innerHTML = '<i class="fa ' + (QuestionManager.isWrong(question.id) ? 'fa-star' : 'fa-star-o') + '" aria-hidden="true"></i>';
        starBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isStarred = QuestionManager.isWrong(question.id);
            QuestionManager.toggleStar(question.id, !isStarred);
            self.refreshBankList();
            self.refreshWrongList();
            if (self._isBankMode) {
                self.renderBankBrowserList();
                self.renderQuestionDetail(self._selectedQuestionId);
            }
        });
        contentRow.appendChild(starBtn);

        card.appendChild(contentRow);

        card.addEventListener('click', function() {
            self.enterBankMode(question.id);
        });

        return card;
    },

    // ============================================================
    // 5.5 题库浏览模式
    // ============================================================
    initBankBrowser: function() {
        var self = this;
        var browserBtn = document.getElementById('bank-browser-btn');
        if (browserBtn) {
            browserBtn.addEventListener('click', function() {
                self.enterBankMode(null);
            });
        }
    },

    enterBankMode: function(questionId) {
        this._isBankMode = true;
        this._bankFilter = 'all';
        this._bankSearch = '';

        var mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('bank-mode');
        }

        var browserContainer = document.getElementById('bank-browser-container');
        if (!browserContainer) {
            browserContainer = this._createBrowserContainer();
            var mainContentEl = document.getElementById('main-content');
            if (mainContentEl) {
                mainContentEl.insertBefore(browserContainer, mainContentEl.firstChild);
            }
        }

        if (questionId) {
            this._selectedQuestionId = questionId;
        } else {
            var questions = this._getFilteredBankQuestions();
            this._selectedQuestionId = questions.length > 0 ? questions[0].id : null;
        }

        this.renderBankBrowserList();
        this.renderQuestionDetail(this._selectedQuestionId);
    },

    exitBankMode: function() {
        this._isBankMode = false;
        this._selectedQuestionId = null;

        var mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('bank-mode');
        }
    },

    _createBrowserContainer: function() {
        var container = document.createElement('div');
        container.id = 'bank-browser-container';
        container.className = 'bank-browser-container';
        return container;
    },

    renderBankBrowserList: function() {
        var container = document.getElementById('bank-browser-container');
        if (!container) return;

        var self = this;
        container.innerHTML = '';

        var listPanel = document.createElement('div');
        listPanel.className = 'bank-browser-list';

        var header = document.createElement('div');
        header.className = 'bank-browser-header';
        header.innerHTML = '\
            <h3 class="bank-browser-title">\
                <i class="fa fa-list-ul" aria-hidden="true"></i>题目列表\
            </h3>\
            <button id="exit-bank-mode-btn" class="back-quiz-btn">\
                <i class="fa fa-arrow-left" aria-hidden="true"></i>返回答题\
            </button>\
        ';
        listPanel.appendChild(header);

        var searchContainer = document.createElement('div');
        searchContainer.className = 'bank-search-container relative';
        searchContainer.innerHTML = '\
            <i class="fa fa-search bank-search-icon" aria-hidden="true"></i>\
            <input type="text" id="bank-search-input" class="bank-search-input" placeholder="搜索题目...">\
        ';
        listPanel.appendChild(searchContainer);

        var filterTabs = document.createElement('div');
        filterTabs.className = 'bank-filter-tabs';
        var filters = [
            { value: 'all', label: '全部' },
            { value: 'choice', label: '选择题' },
            { value: 'judge', label: '判断题' },
            { value: 'fill', label: '填空题' },
            { value: 'wrong', label: '只看错题' }
        ];
        for (var i = 0; i < filters.length; i++) {
            var tab = document.createElement('button');
            tab.className = 'bank-filter-tab' + (this._bankFilter === filters[i].value ? ' active' : '');
            tab.dataset.filter = filters[i].value;
            tab.textContent = filters[i].label;
            tab.addEventListener('click', (function(filterVal) {
                return function() {
                    self._bankFilter = filterVal;
                    self.renderBankBrowserList();
                };
            })(filters[i].value));
            filterTabs.appendChild(tab);
        }
        listPanel.appendChild(filterTabs);

        var listContainer = document.createElement('div');
        listContainer.className = 'bank-list-container';
        listContainer.id = 'bank-browser-list-content';

        var questions = this._getFilteredBankQuestions();

        if (questions.length === 0) {
            listContainer.innerHTML = '\
                <div class="bank-list-empty">\
                    <i class="fa fa-file-text-o" aria-hidden="true"></i>\
                    <p>暂无符合条件的题目</p>\
                </div>\
            ';
        } else {
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                var card = this._getBankCardHTML(q);
                listContainer.appendChild(card);
            }
        }

        listPanel.appendChild(listContainer);
        container.appendChild(listPanel);

        var detailPanel = document.createElement('div');
        detailPanel.className = 'bank-browser-detail';
        detailPanel.id = 'bank-browser-detail';
        container.appendChild(detailPanel);

        var exitBtn = document.getElementById('exit-bank-mode-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function() {
                self.exitBankMode();
            });
        }

        var searchInput = document.getElementById('bank-search-input');
        if (searchInput) {
            searchInput.value = this._bankSearch;
            searchInput.addEventListener('input', function() {
                self._bankSearch = this.value;
                self.renderBankBrowserList();
            });
        }
    },

    _getFilteredBankQuestions: function() {
        var all = QuestionManager.getAll();
        var filtered = [];
        var search = this._bankSearch.toLowerCase();

        for (var i = 0; i < all.length; i++) {
            var q = all[i];

            if (this._bankFilter === 'choice' && q.type !== 'choice') continue;
            if (this._bankFilter === 'judge' && q.type !== 'judge') continue;
            if (this._bankFilter === 'fill' && q.type !== 'fill') continue;
            if (this._bankFilter === 'wrong' && !QuestionManager.isWrong(q.id)) continue;

            if (search && q.question.toLowerCase().indexOf(search) === -1) continue;

            filtered.push(q);
        }

        return filtered;
    },

    _getBankCardHTML: function(question) {
        var self = this;
        var card = document.createElement('div');
        card.className = 'bank-list-card' + (this._selectedQuestionId === question.id ? ' selected' : '');
        card.dataset.id = question.id;

        var header = document.createElement('div');
        header.className = 'bank-list-card-header';

        var typeTag = document.createElement('span');
        typeTag.className = 'type-tag ' + question.type;
        var typeName = '填空题';
        if (question.type === 'choice') typeName = '选择题';
        if (question.type === 'judge') typeName = '判断题';
        typeTag.textContent = typeName;
        header.appendChild(typeTag);

        var actions = document.createElement('div');
        actions.className = 'bank-list-card-actions';

        var editBtn = document.createElement('button');
        editBtn.className = 'bank-list-card-action-btn';
        editBtn.title = '编辑';
        editBtn.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self.openEditModal(question.id);
        });
        actions.appendChild(editBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'bank-list-card-action-btn delete';
        deleteBtn.title = '删除';
        deleteBtn.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self.handleDeleteQuestion(question.id);
        });
        actions.appendChild(deleteBtn);

        var isStarred = QuestionManager.isWrong(question.id);
        var starBtn = document.createElement('button');
        starBtn.className = 'bank-list-card-action-btn star' + (isStarred ? ' active' : '');
        starBtn.title = isStarred ? '移出错题本' : '加入错题本';
        starBtn.innerHTML = '<i class="fa ' + (isStarred ? 'fa-star' : 'fa-star-o') + '" aria-hidden="true"></i>';
        starBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var starred = QuestionManager.isWrong(question.id);
            QuestionManager.toggleStar(question.id, !starred);
            self.refreshBankList();
            self.refreshWrongList();
            self.renderBankBrowserList();
            self.renderQuestionDetail(self._selectedQuestionId);
        });
        actions.appendChild(starBtn);

        header.appendChild(actions);
        card.appendChild(header);

        var questionEl = document.createElement('p');
        questionEl.className = 'bank-list-card-question';
        questionEl.textContent = question.question;
        card.appendChild(questionEl);

        if ((question.type === 'choice' || question.type === 'judge') && question.options) {
            var optionsEl = document.createElement('div');
            optionsEl.className = 'bank-list-card-options';
            for (var i = 0; i < question.options.length; i++) {
                var letter = String.fromCharCode(65 + i);
                var isCorrect = letter === question.answer;
                var optionItem = document.createElement('div');
                optionItem.className = 'option-item' + (isCorrect ? ' correct' : '');
                var iconHtml = '';
                if (question.type === 'judge') {
                    iconHtml = '<span class="option-letter-sm">' + (i === 0 ? '✓' : '✗') + '</span>';
                } else {
                    iconHtml = '<span class="option-letter-sm">' + letter + '</span>';
                }
                optionItem.innerHTML = '\
                    ' + iconHtml + '\
                    <span class="option-text">' + question.options[i] + '</span>\
                ';
                optionsEl.appendChild(optionItem);
            }
            card.appendChild(optionsEl);
        } else if (question.type === 'fill') {
            var answerPreview = document.createElement('div');
            answerPreview.className = 'bank-list-card-options';
            var fillDisplay = question.answer;
            if (Array.isArray(fillDisplay)) {
                fillDisplay = fillDisplay.join(' | ');
            }
            answerPreview.innerHTML = '<span style="color: #b45309; font-weight: 500;">答案：' + fillDisplay + '</span>';
            card.appendChild(answerPreview);
        }

        var footer = document.createElement('div');
        footer.className = 'bank-list-card-footer';

        var stats = document.createElement('span');
        stats.className = 'bank-list-card-stats';
        stats.innerHTML = '错误 <span style="color: #ef4444; font-weight: 500;">' + (question.wrongCount || 0) + '</span> 次 / 连续答对 <span style="color: #22c55e; font-weight: 500;">' + (question.correctStreak || 0) + '</span>';
        footer.appendChild(stats);

        card.appendChild(footer);

        card.addEventListener('click', function() {
            self._selectedQuestionId = question.id;
            self.renderBankBrowserList();
            self.renderQuestionDetail(question.id);
        });

        return card;
    },

    renderQuestionDetail: function(id) {
        var detailPanel = document.getElementById('bank-browser-detail');
        if (!detailPanel) return;

        if (!id) {
            detailPanel.innerHTML = '\
                <div class="detail-empty">\
                    <i class="fa fa-file-text-o" aria-hidden="true"></i>\
                    <p>选择一道题目查看详情</p>\
                </div>\
            ';
            return;
        }

        var question = QuestionManager.getById(id);
        if (!question) {
            detailPanel.innerHTML = '\
                <div class="detail-empty">\
                    <i class="fa fa-exclamation-circle" aria-hidden="true"></i>\
                    <p>题目不存在或已被删除</p>\
                </div>\
            ';
            return;
        }

        var self = this;
        var isStarred = QuestionManager.isWrong(id);

        detailPanel.innerHTML = '';
        detailPanel.className = 'bank-browser-detail';

        var header = document.createElement('div');
        header.className = 'bank-browser-header';
        header.innerHTML = '\
            <h3 class="bank-browser-title">\
                <i class="fa fa-eye" aria-hidden="true"></i>题目详情\
            </h3>\
        ';
        detailPanel.appendChild(header);

        var content = document.createElement('div');
        content.className = 'detail-content';

        var typeTag = document.createElement('span');
        typeTag.className = 'detail-type-tag ' + question.type;
        var typeName = '填空题';
        if (question.type === 'choice') typeName = '选择题';
        if (question.type === 'judge') typeName = '判断题';
        typeTag.textContent = typeName;
        content.appendChild(typeTag);

        var questionText = document.createElement('h2');
        questionText.className = 'detail-question';
        questionText.textContent = question.question;
        content.appendChild(questionText);

        if ((question.type === 'choice' || question.type === 'judge') && question.options) {
            var optionsContainer = document.createElement('div');
            for (var i = 0; i < question.options.length; i++) {
                var letter = String.fromCharCode(65 + i);
                var isCorrect = letter === question.answer;
                var optionItem = document.createElement('div');
                optionItem.className = 'detail-option-item' + (isCorrect ? ' correct' : '');
                var letterHtml = question.type === 'judge' ? (i === 0 ? '✓' : '✗') : letter;
                optionItem.innerHTML = '\
                    <span class="detail-option-letter">' + letterHtml + '</span>\
                    <span class="detail-option-text">' + question.options[i] + '</span>\
                    ' + (isCorrect ? '<span class="detail-option-correct-icon"><i class="fa fa-check-circle" aria-hidden="true"></i></span>' : '') + '\
                ';
                optionsContainer.appendChild(optionItem);
            }
            content.appendChild(optionsContainer);
        } else if (question.type === 'fill') {
            var fillDetailAnswer = question.answer;
            if (Array.isArray(fillDetailAnswer)) {
                fillDetailAnswer = fillDetailAnswer.join(' | ');
            }
            var answerBox = document.createElement('div');
            answerBox.className = 'detail-fill-answer';
            answerBox.innerHTML = '\
                <p class="detail-fill-answer-label">正确答案</p>\
                <p class="detail-fill-answer-text">' + fillDetailAnswer + '</p>\
            ';
            content.appendChild(answerBox);
        }

        var statsGrid = document.createElement('div');
        statsGrid.className = 'detail-stats';
        statsGrid.innerHTML = '\
            <div class="detail-stat-item wrong">\
                <div class="detail-stat-number">' + (question.wrongCount || 0) + '</div>\
                <div class="detail-stat-label">错误次数</div>\
            </div>\
            <div class="detail-stat-item streak">\
                <div class="detail-stat-number">' + (question.correctStreak || 0) + '</div>\
                <div class="detail-stat-label">连续答对</div>\
            </div>\
        ';
        content.appendChild(statsGrid);

        detailPanel.appendChild(content);

        var actions = document.createElement('div');
        actions.className = 'detail-actions';

        var editBtn = document.createElement('button');
        editBtn.className = 'detail-action-btn edit';
        editBtn.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>编辑';
        editBtn.addEventListener('click', function() {
            self.openEditModal(id);
        });
        actions.appendChild(editBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'detail-action-btn delete';
        deleteBtn.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>删除';
        deleteBtn.addEventListener('click', function() {
            self.handleDeleteQuestion(id);
        });
        actions.appendChild(deleteBtn);

        var starBtn = document.createElement('button');
        starBtn.className = 'detail-action-btn star';
        starBtn.innerHTML = '<i class="fa ' + (isStarred ? 'fa-star' : 'fa-star-o') + '" aria-hidden="true"></i>' + (isStarred ? '移出错题' : '加入错题');
        starBtn.addEventListener('click', function() {
            var starred = QuestionManager.isWrong(id);
            QuestionManager.toggleStar(id, !starred);
            self.refreshBankList();
            self.refreshWrongList();
            self.renderBankBrowserList();
            self.renderQuestionDetail(id);
            showToast(!starred ? '已加入错题本' : '已移出错题本', 'success');
        });
        actions.appendChild(starBtn);

        detailPanel.appendChild(actions);
    },

    handleDeleteQuestion: function(id) {
        var self = this;
        var question = QuestionManager.getById(id);
        if (!question) return;

        var modalId = 'delete-confirm';
        var existing = document.getElementById(modalId + '-modal');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var modal = createModal({
            id: modalId,
            title: '确认删除',
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-yellow-500',
            size: 'max-w-sm',
            content: ''
        });

        var modalsContainer = document.getElementById('modals-container') || document.body;
        modalsContainer.appendChild(modal);

        var content = document.getElementById(modalId + '-content');
        if (content) {
            content.innerHTML = '\
                <div class="space-y-4">\
                    <p class="text-gray-700 text-center">确定要删除这道题吗？</p>\
                    <p class="text-sm text-gray-500 text-center line-clamp-2 bg-gray-50 p-3 rounded-lg">' + question.question + '</p>\
                    <p class="text-xs text-red-500 text-center">此操作不可撤销</p>\
                    <div class="flex gap-3 pt-2">\
                        <button id="delete-cancel-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors">\
                            取消\
                        </button>\
                        <button id="delete-confirm-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors">\
                            删除\
                        </button>\
                    </div>\
                </div>\
            ';
        }

        initModal(modalId + '-modal', null, modalId + '-close', modalId + '-overlay');

        var cancelBtn = document.getElementById('delete-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeModal(modalId + '-modal');
            });
        }

        var confirmBtn = document.getElementById('delete-confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                QuestionManager.deleteQuestion(id);
                closeModal(modalId + '-modal');
                showToast('已删除', 'success');

                self.refreshBankList();
                self.refreshWrongList();
                self.refreshSettingsStats();

                if (self._isBankMode) {
                    var questions = self._getFilteredBankQuestions();
                    if (questions.length > 0) {
                        var newIdx = 0;
                        for (var i = 0; i < questions.length; i++) {
                            if (questions[i].id !== id) {
                                newIdx = i;
                                break;
                            }
                        }
                        self._selectedQuestionId = questions[newIdx].id;
                    } else {
                        self._selectedQuestionId = null;
                    }
                    self.renderBankBrowserList();
                    self.renderQuestionDetail(self._selectedQuestionId);
                }
            });
        }

        openModal(modalId + '-modal');
    },

    // ============================================================
    // 5.6 编辑弹窗（Task 10）
    // ============================================================
    openEditModal: function(questionId) {
        var question = QuestionManager.getById(questionId);
        if (!question) {
            showToast('题目不存在', 'error');
            return;
        }

        var modalId = 'edit-question';
        var existing = document.getElementById(modalId + '-modal');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var modal = createModal({
            id: modalId,
            title: '编辑题目',
            icon: 'fa-pencil',
            iconColor: 'text-blue-500',
            size: 'max-w-lg',
            content: ''
        });

        var modalsContainer = document.getElementById('modals-container') || document.body;
        modalsContainer.appendChild(modal);

        this._renderEditForm(question);

        initModal(modalId + '-modal', null, modalId + '-close', modalId + '-overlay');

        var self = this;
        var saveBtn = document.getElementById('edit-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                self._handleEditSave(questionId);
            });
        }

        var cancelBtn = document.getElementById('edit-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeModal(modalId + '-modal');
            });
        }

        openModal(modalId + '-modal');
    },

    _renderEditForm: function(question) {
        var content = document.getElementById('edit-question-content');
        if (!content) return;

        var isChoice = question.type === 'choice';
        var isJudge = question.type === 'judge';
        var isFill = question.type === 'fill';
        var options = question.options || ['', '', '', ''];
        if (isJudge) {
            options = ['对', '错'];
        }
        var answer = question.answer || '';
        if (Array.isArray(answer)) {
            answer = answer.join(' | ');
        }

        var typeOptions = '\
            <option value="choice"' + (isChoice ? ' selected' : '') + '>选择题</option>\
            <option value="judge"' + (isJudge ? ' selected' : '') + '>判断题</option>\
            <option value="fill"' + (isFill ? ' selected' : '') + '>填空题</option>';

        var optionsHTML = '';
        if (isChoice) {
            optionsHTML = '\
                <div id="edit-choice-options" class="space-y-2">\
                    <label class="block text-sm font-medium text-gray-700 mb-1">选项</label>\
                    <div class="flex items-center gap-2">\
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg font-semibold text-sm text-gray-600">A</span>\
                        <input type="text" id="edit-option-a" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="选项 A" value="' + (options[0] || '') + '">\
                    </div>\
                    <div class="flex items-center gap-2">\
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg font-semibold text-sm text-gray-600">B</span>\
                        <input type="text" id="edit-option-b" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="选项 B" value="' + (options[1] || '') + '">\
                    </div>\
                    <div class="flex items-center gap-2">\
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg font-semibold text-sm text-gray-600">C</span>\
                        <input type="text" id="edit-option-c" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="选项 C" value="' + (options[2] || '') + '">\
                    </div>\
                    <div class="flex items-center gap-2">\
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg font-semibold text-sm text-gray-600">D</span>\
                        <input type="text" id="edit-option-d" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="选项 D" value="' + (options[3] || '') + '">\
                    </div>\
                </div>\
                <div>\
                    <label class="block text-sm font-medium text-gray-700 mb-1">正确答案</label>\
                    <select id="edit-answer-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">\
                        <option value="A"' + (answer === 'A' ? ' selected' : '') + '>A</option>\
                        <option value="B"' + (answer === 'B' ? ' selected' : '') + '>B</option>\
                        <option value="C"' + (answer === 'C' ? ' selected' : '') + '>C</option>\
                        <option value="D"' + (answer === 'D' ? ' selected' : '') + '>D</option>\
                    </select>\
                </div>';
        } else if (isJudge) {
            optionsHTML = '\
                <div class="space-y-2">\
                    <label class="block text-sm font-medium text-gray-700 mb-1">选项</label>\
                    <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">\
                        <span class="text-green-500 text-xl"><i class="fa fa-check-circle"></i></span>\
                        <span class="text-gray-700">对</span>\
                    </div>\
                    <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">\
                        <span class="text-red-500 text-xl"><i class="fa fa-times-circle"></i></span>\
                        <span class="text-gray-700">错</span>\
                    </div>\
                </div>\
                <div>\
                    <label class="block text-sm font-medium text-gray-700 mb-1">正确答案</label>\
                    <select id="edit-answer-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">\
                        <option value="A"' + (answer === 'A' ? ' selected' : '') + '>对</option>\
                        <option value="B"' + (answer === 'B' ? ' selected' : '') + '>错</option>\
                    </select>\
                </div>';
        } else {
            optionsHTML = '\
                <div>\
                    <label class="block text-sm font-medium text-gray-700 mb-1">正确答案（多答案用 | 分隔）</label>\
                    <input type="text" id="edit-fill-answer" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" placeholder="如：答案1 | 答案2" value="' + answer + '">\
                </div>';
        }

        content.innerHTML = '\
            <div class="space-y-4">\
                <div>\
                    <label class="block text-sm font-medium text-gray-700 mb-1">题型</label>\
                    <select id="edit-type-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">\
                        ' + typeOptions + '\
                    </select>\
                </div>\
                <div>\
                    <label class="block text-sm font-medium text-gray-700 mb-1">题目内容</label>\
                    <textarea id="edit-question-text" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none" placeholder="请输入题目内容...">' + (question.question || '') + '</textarea>\
                </div>\
                ' + optionsHTML + '\
                <div class="flex gap-3 pt-2">\
                    <button id="edit-cancel-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors">\
                        取消\
                    </button>\
                    <button id="edit-save-btn" class="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-xl transition-colors">\
                        保存\
                    </button>\
                </div>\
            </div>\
        ';

        var self = this;
        var typeSelect = document.getElementById('edit-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', function() {
                var updatedQ = {
                    type: this.value,
                    question: question.question,
                    options: this.value === 'judge' ? ['对', '错'] : options,
                    answer: ''
                };
                self._renderEditForm(updatedQ);
            });
        }
    },

    _handleEditSave: function(questionId) {
        var questionText = document.getElementById('edit-question-text');
        var typeSelect = document.getElementById('edit-type-select');

        if (!questionText || !typeSelect) return;

        var qText = questionText.value.trim();
        var type = typeSelect.value;

        if (!qText) {
            showToast('题目不能为空', 'error');
            return;
        }

        var data = {
            type: type,
            question: qText
        };

        if (type === 'choice') {
            var optA = document.getElementById('edit-option-a');
            var optB = document.getElementById('edit-option-b');
            var optC = document.getElementById('edit-option-c');
            var optD = document.getElementById('edit-option-d');
            var answerSelect = document.getElementById('edit-answer-select');

            if (!optA || !optB || !optC || !optD || !answerSelect) return;

            var options = [
                optA.value.trim(),
                optB.value.trim(),
                optC.value.trim(),
                optD.value.trim()
            ];

            for (var i = 0; i < options.length; i++) {
                if (!options[i]) {
                    showToast('选项不能为空', 'error');
                    return;
                }
            }

            data.options = options;
            data.answer = answerSelect.value;
        } else if (type === 'judge') {
            var judgeAnswerSelect = document.getElementById('edit-answer-select');
            if (!judgeAnswerSelect) return;

            data.options = ['对', '错'];
            data.answer = judgeAnswerSelect.value;
        } else {
            var fillAnswer = document.getElementById('edit-fill-answer');
            if (!fillAnswer) return;

            var ans = fillAnswer.value.trim();
            if (!ans) {
                showToast('答案不能为空', 'error');
                return;
            }
            data.answer = CSVParser._parseFillAnswer(ans);
        }

        var result = QuestionManager.updateQuestion(questionId, data);

        if (!result.success) {
            if (result.reason === 'duplicate') {
                showToast('已存在相同题目', 'error');
            } else {
                showToast('保存失败', 'error');
            }
            return;
        }

        showToast('保存成功', 'success');
        closeModal('edit-question-modal');

        this.refreshBankList();
        this.refreshWrongList();
        this.refreshSettingsStats();

        if (this._isBankMode) {
            this.renderBankBrowserList();
            this.renderQuestionDetail(questionId);
        }
    },

    // ============================================================
    // 5.7 错题导出（Task 11）
    // ============================================================
    exportWrongQuestions: function() {
        var wrongQuestions = QuestionManager.getWrongQuestions();

        if (wrongQuestions.length === 0) {
            showToast('暂无错题可导出', 'info');
            return;
        }

        var csvContent = this._generateCSV(wrongQuestions);
        var dateStr = formatDate(new Date());
        var filename = dateStr + '_错题.csv';

        this._downloadCSV(csvContent, filename);
        showToast('已导出 ' + wrongQuestions.length + ' 道错题', 'success');
    },

    exportQuestions: function() {
        var questions = QuestionManager.getAll();

        if (questions.length === 0) {
            showToast('暂无题目可导出', 'info');
            return;
        }

        var csvContent = this._generateCSV(questions);
        var dateStr = formatDate(new Date());
        var filename = dateStr + '_题库.csv';

        this._downloadCSV(csvContent, filename);
        showToast('已导出 ' + questions.length + ' 道题目', 'success');
    },

    _generateCSV: function(questions) {
        var lines = [];

        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var fields = [];

            fields.push(this._escapeCSVField(q.question));

            if ((q.type === 'choice' || q.type === 'judge') && q.options) {
                for (var j = 0; j < q.options.length; j++) {
                    fields.push(this._escapeCSVField(q.options[j]));
                }
                var answerText = q.answer;
                if (q.type === 'judge') {
                    answerText = q.answer === 'A' ? '对' : '错';
                }
                fields.push(this._escapeCSVField(answerText));
            } else {
                var fillExportAnswer = q.answer;
                if (Array.isArray(fillExportAnswer)) {
                    fillExportAnswer = fillExportAnswer.join('|');
                }
                fields.push(this._escapeCSVField(fillExportAnswer));
            }

            lines.push(fields.join(','));
        }

        return '\uFEFF' + lines.join('\n');
    },

    _escapeCSVField: function(field) {
        var str = (field || '').toString();
        if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    },

    _downloadCSV: function(content, filename) {
        var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // ============================================================
    // 5.8 开发者选项（Task 12）
    // ============================================================
    _initDevTools: function() {
        var devContent = document.getElementById('dev-tools-content');
        if (!devContent) return;

        var self = this;

        devContent.innerHTML = '\
            <div class="space-y-6">\
                <div>\
                    <h3 class="text-lg font-semibold text-neutral-dark mb-4 flex items-center">\
                        <i class="fa fa-database mr-2 text-primary"></i>存储信息\
                    </h3>\
                    <div class="bg-white rounded-xl p-4 shadow-sm space-y-3">\
                        <div class="flex justify-between items-center">\
                            <span class="text-gray-600">题库总题数</span>\
                            <span class="font-semibold text-neutral-dark" id="dev-total-count">0</span>\
                        </div>\
                        <div class="flex justify-between items-center">\
                            <span class="text-gray-600">错题数</span>\
                            <span class="font-semibold text-red-500" id="dev-wrong-count">0</span>\
                        </div>\
                        <div class="flex justify-between items-center">\
                            <span class="text-gray-600">存储占用</span>\
                            <span class="font-semibold text-secondary" id="dev-storage-size">0 B</span>\
                        </div>\
                    </div>\
                </div>\
                <div>\
                    <h3 class="text-lg font-semibold text-neutral-dark mb-4 flex items-center">\
                        <i class="fa fa-cogs mr-2 text-primary"></i>数据管理\
                    </h3>\
                    <div class="space-y-2">\
                        <button id="dev-clear-bank-btn" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center">\
                            <i class="fa fa-trash-o mr-2"></i>清空题库\
                        </button>\
                        <button id="dev-clear-wrong-btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center">\
                            <i class="fa fa-refresh mr-2"></i>重置统计\
                        </button>\
                        <button id="dev-clear-all-btn" class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center">\
                            <i class="fa fa-exclamation-triangle mr-2"></i>一键清空所有数据\
                        </button>\
                    </div>\
                    <p class="text-xs text-gray-400 mt-2 text-center">警告：以上操作不可撤销</p>\
                </div>\
            </div>\
        ';

        this._updateDevToolsStats();

        var clearBankBtn = document.getElementById('dev-clear-bank-btn');
        if (clearBankBtn) {
            clearBankBtn.addEventListener('click', function() {
                self._clearBank();
            });
        }

        var clearWrongBtn = document.getElementById('dev-clear-wrong-btn');
        if (clearWrongBtn) {
            clearWrongBtn.addEventListener('click', function() {
                self._clearWrongRecords();
            });
        }

        var clearAllBtn = document.getElementById('dev-clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                self._clearAllData();
            });
        }

        var devToolsBtn = document.getElementById('dev-tools-btn');
        if (devToolsBtn) {
            devToolsBtn.addEventListener('click', function() {
                setTimeout(function() {
                    self._updateDevToolsStats();
                }, 50);
            });
        }
    },

    _updateDevToolsStats: function() {
        var totalEl = document.getElementById('dev-total-count');
        var wrongEl = document.getElementById('dev-wrong-count');
        var sizeEl = document.getElementById('dev-storage-size');

        var allQuestions = QuestionManager.getAll();
        var wrongQuestions = QuestionManager.getWrongQuestions();

        if (totalEl) {
            totalEl.textContent = allQuestions.length;
        }
        if (wrongEl) {
            wrongEl.textContent = wrongQuestions.length;
        }
        if (sizeEl) {
            var totalSize = 0;
            try {
                var questionsStr = localStorage.getItem(Storage.QUESTIONS_KEY);
                var settingsStr = localStorage.getItem(Storage.SETTINGS_KEY);
                if (questionsStr) totalSize += questionsStr.length * 2;
                if (settingsStr) totalSize += settingsStr.length * 2;
            } catch (e) {}
            sizeEl.textContent = this._formatBytes(totalSize);
        }
    },

    _formatBytes: function(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    _showConfirmModal: function(title, message, onConfirm) {
        var modalId = 'dev-confirm';
        var existing = document.getElementById(modalId + '-modal');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var modal = createModal({
            id: modalId,
            title: title,
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-yellow-500',
            size: 'max-w-sm',
            content: ''
        });

        var modalsContainer = document.getElementById('modals-container') || document.body;
        modalsContainer.appendChild(modal);

        var content = document.getElementById(modalId + '-content');
        if (content) {
            content.innerHTML = '\
                <div class="space-y-4">\
                    <p class="text-gray-700 text-center">' + message + '</p>\
                    <p class="text-xs text-red-500 text-center">此操作不可撤销</p>\
                    <div class="flex gap-3 pt-2">\
                        <button id="dev-confirm-cancel" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors">\
                            取消\
                        </button>\
                        <button id="dev-confirm-ok" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors">\
                            确定\
                        </button>\
                    </div>\
                </div>\
            ';
        }

        initModal(modalId + '-modal', null, modalId + '-close', modalId + '-overlay');

        var self = this;

        var cancelBtn = document.getElementById('dev-confirm-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeModal(modalId + '-modal');
            });
        }

        var okBtn = document.getElementById('dev-confirm-ok');
        if (okBtn) {
            okBtn.addEventListener('click', function() {
                closeModal(modalId + '-modal');
                if (onConfirm) {
                    onConfirm();
                }
            });
        }

        openModal(modalId + '-modal');
    },

    _clearBank: function() {
        var self = this;
        this._showConfirmModal(
            '清空题库',
            '确定要清空所有题目吗？此操作不可撤销。',
            function() {
                Storage.saveQuestions([]);
                QuestionManager.init();
                self.refreshBankList();
                self.refreshWrongList();
                self.refreshSettingsStats();
                self._updateDevToolsStats();
                if (self._isBankMode) {
                    self._selectedQuestionId = null;
                    self.renderBankBrowserList();
                    self.renderQuestionDetail(null);
                }
                showToast('题库已清空', 'success');
            }
        );
    },

    _clearWrongRecords: function() {
        var self = this;
        this._showConfirmModal(
            '重置统计',
            '确定要重置所有题目统计吗？题目会保留，但错误次数和连续答对次数将全部归零。',
            function() {
                var all = QuestionManager.getAll();
                for (var i = 0; i < all.length; i++) {
                    QuestionManager.updateQuestion(all[i].id, {
                        wrongCount: 0,
                        correctStreak: 0
                    });
                }
                self.refreshWrongList();
                self.refreshSettingsStats();
                self._updateDevToolsStats();
                if (self._isBankMode) {
                    self.renderBankBrowserList();
                    self.renderQuestionDetail(self._selectedQuestionId);
                }
                showToast('统计已重置', 'success');
            }
        );
    },

    _clearAllData: function() {
        var self = this;
        this._showConfirmModal(
            '一键清空所有数据',
            '确定要清空所有数据吗？包括题目和设置，此操作不可撤销。',
            function() {
                Storage.clearAll();
                QuestionManager.init();
                self.refreshBankList();
                self.refreshWrongList();
                self.refreshSettingsStats();
                self._updateDevToolsStats();
                if (self._isBankMode) {
                    self._selectedQuestionId = null;
                    self.renderBankBrowserList();
                    self.renderQuestionDetail(null);
                }
                showToast('所有数据已清空', 'success');
            }
        );
    }
};

// ------------------------------------------------------------
// App Entry
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    QuestionManager.init();
    UI.initImportSection();
    UI.initQuizSettings();
    UI.initBankBrowser();
    UI.refreshBankList();
    UI.refreshWrongList();
    UI.refreshStats();

    setTimeout(function() {
        UI._initDevTools();
    }, 100);

    // 初始化移动端底部导航
    initMobileNav();

    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabContents = document.querySelectorAll('.tab-content');

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener('click', function() {
            var tab = this.dataset.tab;

            for (var j = 0; j < tabBtns.length; j++) {
                tabBtns[j].classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
                tabBtns[j].classList.add('text-secondary');
            }
            this.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
            this.classList.remove('text-secondary');

            for (var k = 0; k < tabContents.length; k++) {
                tabContents[k].classList.add('hidden');
            }
            document.getElementById(tab + '-list').classList.remove('hidden');
        });
    }

    var activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        activeTab.classList.add('text-primary', 'border-b-2', 'border-primary');
        activeTab.classList.remove('text-secondary');
    }
});

// ------------------------------------------------------------
// 移动端底部导航 Tab 切换
// ------------------------------------------------------------
function switchMobileTab(tabName) {
  // 隐藏所有移动端面板
  document.querySelectorAll('.mobile-panel').forEach(function(panel) {
    panel.classList.add('hidden');
    panel.classList.remove('active');
  });

  // 显示目标面板
  var target = document.getElementById('mobile-panel-' + tabName);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // 更新底部导航激活样式
  document.querySelectorAll('#mobile-bottom-nav .mobile-nav-btn').forEach(function(btn) {
    if (btn.dataset.mobileTab === tabName) {
      btn.classList.add('active');
      btn.classList.remove('text-gray-400');
      btn.classList.add('text-primary');
    } else {
      btn.classList.remove('active');
      btn.classList.remove('text-primary');
      btn.classList.add('text-gray-400');
    }
  });
}

function initMobileNav() {
  var nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;

  nav.querySelectorAll('.mobile-nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchMobileTab(btn.dataset.mobileTab);
    });
  });

  // 默认显示第一个 Tab（题库）
  // 仅在移动端断点下执行
  if (window.innerWidth < 1024) {
    switchMobileTab('bank');
  }
}
