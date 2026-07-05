// CSV Parser Tests

// ============================================================
// Task 2.1 选择题识别测试
// ============================================================
describe('Task 2.1: 选择题识别', function() {
    test('6列CSV识别为选择题，type=choice，有question/options/answer字段', function() {
        var csvText = '中国的首都是哪里？,北京,上海,广州,深圳,A';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.errors.length, 0);
        assertEqual(result.duplicates.length, 0);

        var q = result.success[0];
        assertEqual(q.type, 'choice');
        assertEqual(q.question, '中国的首都是哪里？');
        assertEqual(q.options.length, 4);
        assertEqual(q.options[0], '北京');
        assertEqual(q.options[1], '上海');
        assertEqual(q.options[2], '广州');
        assertEqual(q.options[3], '深圳');
        assertEqual(q.answer, 'A');
    });

    test('多道选择题正确解析', function() {
        var csvText = '题目1,A,B,C,D,A\n题目2,W,X,Y,Z,B';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.success[0].type, 'choice');
        assertEqual(result.success[0].question, '题目1');
        assertEqual(result.success[0].answer, 'A');
        assertEqual(result.success[1].type, 'choice');
        assertEqual(result.success[1].question, '题目2');
        assertEqual(result.success[1].answer, 'B');
    });

    test('带引号的CSV字段正确解析', function() {
        var csvText = '"题目,带逗号",选项A,选项B,选项C,选项D,C';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.success[0].question, '题目,带逗号');
        assertEqual(result.success[0].options[0], '选项A');
        assertEqual(result.success[0].answer, 'C');
    });
});

// ============================================================
// Task 2.2 填空题识别测试
// ============================================================
describe('Task 2.2: 填空题识别', function() {
    test('2列CSV识别为填空题，type=fill，有question/answer字段，无options', function() {
        var csvText = '中国的首都是哪里？,北京';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.errors.length, 0);
        assertEqual(result.duplicates.length, 0);

        var q = result.success[0];
        assertEqual(q.type, 'fill');
        assertEqual(q.question, '中国的首都是哪里？');
        assertEqual(q.answer, '北京');
        assertTrue(q.options === undefined || q.options === null, '填空题不应有options字段');
    });

    test('多道填空题正确解析', function() {
        var csvText = '题目1,答案1\n题目2,答案2';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.success[0].type, 'fill');
        assertEqual(result.success[0].question, '题目1');
        assertEqual(result.success[0].answer, '答案1');
        assertEqual(result.success[1].type, 'fill');
        assertEqual(result.success[1].question, '题目2');
        assertEqual(result.success[1].answer, '答案2');
    });
});

// ============================================================
// Task 2.3 错误行处理测试
// ============================================================
describe('Task 2.3: 错误行处理', function() {
    test('列数不对的行计入errors', function() {
        var csvText = '只有一列\n题目,答案,A,B,C,D,E,F';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 0);
        assertEqual(result.errors.length, 2);
        assertTrue(result.errors[0].reason.indexOf('列数') !== -1, '错误原因应包含列数');
        assertTrue(result.errors[1].reason.indexOf('列数') !== -1, '错误原因应包含列数');
    });

    test('题目为空的行计入errors', function() {
        var csvText = ',答案\n  ,A,B,C,D,A';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 0);
        assertEqual(result.errors.length, 2);
        assertEqual(result.errors[0].reason, '题目为空');
        assertEqual(result.errors[1].reason, '题目为空');
    });

    test('选择题答案不是A/B/C/D的计入errors', function() {
        var csvText = '题目1,A,B,C,D,E\n题目2,A,B,C,D,F';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 0);
        assertEqual(result.errors.length, 2);
        assertEqual(result.errors[0].reason, '选择题答案必须是A/B/C/D');
        assertEqual(result.errors[1].reason, '选择题答案必须是A/B/C/D');
    });

    test('正确答案大小写不敏感（b→B）', function() {
        var csvText = '题目1,A,B,C,D,b\n题目2,W,X,Y,Z,c';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.errors.length, 0);
        assertEqual(result.success[0].answer, 'B');
        assertEqual(result.success[1].answer, 'C');
    });

    test('错误行包含行号和原始内容', function() {
        var csvText = '好题,答案\n坏题目\n好题2,答案2';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.errors.length, 1);
        assertEqual(result.errors[0].line, 2);
        assertTrue(result.errors[0].raw !== undefined, '错误应包含raw字段');
    });
});

// ============================================================
// Task 2.4 去重测试
// ============================================================
describe('Task 2.4: 去重测试', function() {
    test('相同题目文字视为重复，duplicates数组记录', function() {
        var csvText = '相同题目,答案1\n相同题目,答案2';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.duplicates.length, 1);
        assertEqual(result.duplicates[0].question, '相同题目');
        assertEqual(result.duplicates[0].line, 2);
    });

    test('多次重复都计入duplicates', function() {
        var csvText = '题目A,答案A\n题目B,答案B\n题目A,答案A2\n题目A,答案A3';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.duplicates.length, 2);
        assertEqual(result.duplicates[0].line, 3);
        assertEqual(result.duplicates[1].line, 4);
    });

    test('选择题相同题目也视为重复', function() {
        var csvText = '题目,A,B,C,D,A\n题目,W,X,Y,Z,B';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.duplicates.length, 1);
        assertEqual(result.duplicates[0].question, '题目');
    });

    test('填空题和选择题题目相同也视为重复', function() {
        var csvText = '同一个题目,答案\n同一个题目,A,B,C,D,A';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.duplicates.length, 1);
    });
});

// ============================================================
// _splitCSVLine 内部辅助方法测试
// ============================================================
describe('_splitCSVLine 辅助方法', function() {
    test('简单CSV行分割', function() {
        var result = CSVParser._splitCSVLine('a,b,c,d');
        assertEqual(result.length, 4);
        assertEqual(result[0], 'a');
        assertEqual(result[3], 'd');
    });

    test('带引号的字段分割', function() {
        var result = CSVParser._splitCSVLine('"a,b",c,"d,e,f"');
        assertEqual(result.length, 3);
        assertEqual(result[0], 'a,b');
        assertEqual(result[1], 'c');
        assertEqual(result[2], 'd,e,f');
    });

    test('空字段处理', function() {
        var result = CSVParser._splitCSVLine('a,,b');
        assertEqual(result.length, 3);
        assertEqual(result[0], 'a');
        assertEqual(result[1], '');
        assertEqual(result[2], 'b');
    });

    test('带引号中的双引号转义', function() {
        var result = CSVParser._splitCSVLine('"he said ""hello""",world');
        assertEqual(result.length, 2);
        assertEqual(result[0], 'he said "hello"');
        assertEqual(result[1], 'world');
    });
});

// ============================================================
// 判断题识别测试
// ============================================================
describe('判断题识别', function() {
    test('选项为对/错时识别为判断题', function() {
        var csvText = '地球是圆的,对,错,对';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        var q = result.success[0];
        assertEqual(q.type, 'judge');
        assertEqual(q.options.length, 2);
        assertEqual(q.options[0], '对');
        assertEqual(q.options[1], '错');
        assertEqual(q.answer, 'A');
    });

    test('答案为错时返回B', function() {
        var csvText = '太阳从西边升起,对,错,错';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 1);
        assertEqual(result.success[0].type, 'judge');
        assertEqual(result.success[0].answer, 'B');
    });

    test('两列且答案为T/F时识别为判断题', function() {
        var csvText = '水往低处流,T\n太阳绕地球转,F';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.success[0].type, 'judge');
        assertEqual(result.success[0].answer, 'A');
        assertEqual(result.success[1].type, 'judge');
        assertEqual(result.success[1].answer, 'B');
    });

    test('答案为TRUE/FALSE也识别为判断题', function() {
        var csvText = '1+1=2,TRUE\n1+1=3,FALSE';
        var result = CSVParser.parse(csvText);

        assertEqual(result.success.length, 2);
        assertEqual(result.success[0].type, 'judge');
        assertEqual(result.success[0].answer, 'A');
        assertEqual(result.success[1].type, 'judge');
        assertEqual(result.success[1].answer, 'B');
    });
});
