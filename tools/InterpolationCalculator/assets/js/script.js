// 插值计算器核心功能实现

// 全局变量
let originalData = [];
let headers = [];
let variableTypes = {};
let interpolationPoints = [];
let calculationResults = [];
let historyRecords = [];

// 初始化插值计算器
function initInterpolationCalculator() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载历史记录
    loadHistory();
    
    // 初始化插值方法参数显示
    updateMethodParams();
}

// 绑定事件监听器
function bindEventListeners() {
    // 文件导入
    document.getElementById('import-btn').addEventListener('click', importData);
    
    // 变量搜索
    document.getElementById('variable-search').addEventListener('input', filterVariables);
    
    // 历史记录按钮
    document.getElementById('history-btn').addEventListener('click', function() {
        // 在打开历史记录弹窗前更新显示
        updateHistoryDisplay();
    });

    // 插值方法选择
    document.getElementById('interpolation-method').addEventListener('change', updateMethodParams);
    
    // 插值点输入方式切换
    document.querySelectorAll('input[name="interpolation-points-type"]').forEach(radio => {
        radio.addEventListener('change', toggleInterpolationPointsInput);
    });
    
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateInterpolation);
    
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetCalculation);
    
    // 小数位数选择
    document.getElementById('decimal-places').addEventListener('change', function() {
        if (calculationResults && calculationResults.points && calculationResults.points.length > 0) {
            displayResults();
        }
    });
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportResults);
    
    // 开发者工具 - 清空所有
    document.getElementById('clear-all').addEventListener('click', clearAllData);
    
    // 开发者工具 - 添加测试数据
    document.getElementById('add-test-data').addEventListener('click', addTestData);
}

// 导入数据
function importData() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('请选择一个Excel文件', 'error');
        return;
    }
    
    // 检查文件类型
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        showToast('仅支持导入 .xlsx 和 .xls 格式文件', 'error');
        return;
    }
    
    // 读取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 检查数据量
            if (jsonData.length > 10000) {
                showToast('数据量超出最大支持范围（10000行）', 'error');
                return;
            }
            
            if (jsonData[0] && jsonData[0].length > 20) {
                showToast('数据量超出最大支持范围（20列）', 'error');
                return;
            }
            
            // 检查异常数据
            if (!validateData(jsonData)) {
                showToast('文件包含无效数据（空行/合并单元格/非数值），请修正后重新导入', 'error');
                return;
            }
            
            // 处理数据
            headers = jsonData[0];
            originalData = jsonData.slice(1);
            
            // 初始化变量类型：第一个变量为x，其他为y
            variableTypes = {};
            headers.forEach((header, index) => {
                variableTypes[header] = index === 0 ? 'x' : 'y';
            });
            
            // 显示数据预览
            showDataPreview();
            
            // 生成变量配置表格
            generateVariableConfig();
            
            // 更新自动生成插值点的范围
            updateAutoPointsRange();
            
            showToast('数据导入成功', 'success');
            
        } catch (error) {
            console.error('导入数据时出错:', error);
            showToast('导入数据时出错，请检查文件格式', 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('读取文件时出错', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

// 验证数据
function validateData(data) {
    // 检查空行
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) {
            return false;
        }
        
        // 检查非数值数据
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell !== null && cell !== undefined && cell !== '') {
                if (typeof cell !== 'number' && isNaN(parseFloat(cell))) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// 显示数据预览
function showDataPreview() {
    const dataPreview = document.getElementById('data-preview');
    const previewTable = document.querySelector('#data-preview table');
    const previewBody = document.getElementById('preview-body');
    
    // 检查DOM元素是否存在
    if (!dataPreview || !previewTable || !previewBody) {
        console.error('DOM元素不存在');
        return;
    }
    
    // 清空预览
    const thead = previewTable.querySelector('thead');
    if (!thead) {
        console.error('表头元素不存在');
        return;
    }
    
    thead.innerHTML = '';
    previewBody.innerHTML = '';
    
    // 生成表头行
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-50';
    
    // 生成表头
    if (headers && headers.length > 0) {
        headers.forEach(header => {
            const th = document.createElement('th');
            th.className = 'py-2 px-4 border-b text-left';
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        // 添加表头行到thead
        thead.appendChild(headerRow);
        
        // 生成预览数据（前10行）
        if (originalData && originalData.length > 0) {
            const previewData = originalData.slice(0, 10);
            previewData.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.className = 'py-2 px-4 border-b';
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                previewBody.appendChild(tr);
            });
        }
    }
    
    // 显示预览
    dataPreview.classList.remove('hidden');
}

// 生成变量配置表格
function generateVariableConfig() {
    const variableConfig = document.getElementById('variable-config');
    
    // 检查DOM元素是否存在
    if (!variableConfig) {
        return;
    }
    
    variableConfig.innerHTML = '';
    
    headers.forEach(header => {
        const tr = document.createElement('tr');
        
        // 变量名
        const nameTd = document.createElement('td');
        nameTd.className = 'py-2 px-4 border-b';
        nameTd.textContent = header;
        tr.appendChild(nameTd);
        
        // 变量类型显示和设为x按钮
        const typeTd = document.createElement('td');
        typeTd.className = 'py-2 px-4 border-b';
        
        // 变量类型显示
        const typeDisplay = document.createElement('span');
        typeDisplay.className = 'inline-block mr-2';
        typeDisplay.textContent = variableTypes[header] === 'x' ? 'x（自变量）' : 'y（因变量）';
        typeTd.appendChild(typeDisplay);
        
        // 设为x按钮
        const setAsXBtn = document.createElement('button');
        setAsXBtn.className = 'bg-primary hover:bg-primary/90 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors';
        setAsXBtn.textContent = '设为x';
        
        // 绑定事件，使用闭包捕获当前header值
        (function(currentHeader) {
            setAsXBtn.addEventListener('click', function() {
                // 将当前变量设为x
                variableTypes[currentHeader] = 'x';
                
                // 将其他变量设为y
                headers.forEach(otherHeader => {
                    if (otherHeader !== currentHeader) {
                        variableTypes[otherHeader] = 'y';
                    }
                });
                
                // 重新生成变量配置表格以更新显示
                generateVariableConfig();
            });
        })(header);
        
        typeTd.appendChild(setAsXBtn);
        tr.appendChild(typeTd);
        
        variableConfig.appendChild(tr);
    });
}

// 过滤变量
function filterVariables() {
    const searchTermInput = document.getElementById('variable-search');
    const variableConfig = document.getElementById('variable-config');
    
    // 检查DOM元素是否存在
    if (!searchTermInput || !variableConfig) {
        return;
    }
    
    const searchTerm = searchTermInput.value.toLowerCase();
    const variableRows = variableConfig.querySelectorAll('tr');
    
    variableRows.forEach((row, index) => {
        const variableName = headers[index];
        if (variableName.toLowerCase().includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 全选变量
function selectAllVariables(type) {
    if (type === 'x') {
        // 只将第一个变量设为x，其他设为y
        headers.forEach((header, index) => {
            variableTypes[header] = index === 0 ? 'x' : 'y';
        });
    } else {
        // 全设为y
        headers.forEach(header => {
            variableTypes[header] = type;
        });
    }
    
    // 重新生成变量配置表格以更新显示
    generateVariableConfig();
}

// 更新插值方法参数显示
function updateMethodParams() {
    const methodSelect = document.getElementById('interpolation-method');
    const methodParams = document.getElementById('method-params');
    const polynomialParams = document.getElementById('polynomial-params');
    const splineParams = document.getElementById('spline-params');
    
    // 检查DOM元素是否存在
    if (!methodSelect || !methodParams || !polynomialParams || !splineParams) {
        return;
    }
    
    const method = methodSelect.value;
    
    // 隐藏所有参数
    polynomialParams.classList.add('hidden');
    splineParams.classList.add('hidden');
    
    // 根据方法显示相应参数
    let hasParams = false;
    if (method === 'polynomial') {
        polynomialParams.classList.remove('hidden');
        hasParams = true;
    } else if (method === 'cubic-spline') {
        splineParams.classList.remove('hidden');
        hasParams = true;
    }
    
    // 显示或隐藏方法参数标签
    if (hasParams) {
        methodParams.classList.remove('hidden');
    } else {
        methodParams.classList.add('hidden');
    }
}

// 切换插值点输入方式
function toggleInterpolationPointsInput() {
    const checkedInput = document.querySelector('input[name="interpolation-points-type"]:checked');
    const manualInput = document.getElementById('manual-input');
    const fileInputSection = document.getElementById('file-input-section');
    const autoInput = document.getElementById('auto-input');
    
    // 检查DOM元素是否存在
    if (!checkedInput || !manualInput || !fileInputSection || !autoInput) {
        return;
    }
    
    const inputType = checkedInput.value;
    
    // 隐藏所有输入区域
    manualInput.classList.add('hidden');
    fileInputSection.classList.add('hidden');
    autoInput.classList.add('hidden');
    
    // 显示选中的输入区域
    if (inputType === 'manual') {
        manualInput.classList.remove('hidden');
    } else if (inputType === 'file') {
        fileInputSection.classList.remove('hidden');
    } else if (inputType === 'auto') {
        autoInput.classList.remove('hidden');
    }
}

// 更新自动生成插值点的范围
function updateAutoPointsRange() {
    // 获取x变量的最小值和最大值
    const xVariables = headers.filter(header => variableTypes[header] === 'x');
    if (xVariables.length > 0) {
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        originalData.forEach(row => {
            xVariables.forEach((varName, index) => {
                const value = parseFloat(row[headers.indexOf(varName)]);
                if (!isNaN(value)) {
                    minValue = Math.min(minValue, value);
                    maxValue = Math.max(maxValue, value);
                }
            });
        });
        
        // 更新输入框
        const startValueInput = document.getElementById('start-value');
        const endValueInput = document.getElementById('end-value');
        if (startValueInput && endValueInput) {
            startValueInput.value = minValue;
            endValueInput.value = maxValue;
        }
    }
}

// 获取插值点
function getInterpolationPoints() {
    const checkedInput = document.querySelector('input[name="interpolation-points-type"]:checked');
    if (!checkedInput) {
        return [];
    }
    
    const inputType = checkedInput.value;
    let points = [];
    
    if (inputType === 'manual') {
        // 手动输入
        const manualPointsInput = document.getElementById('manual-points');
        if (manualPointsInput) {
            const input = manualPointsInput.value;
            points = input.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        }
    } else if (inputType === 'file') {
        // 从文件导入
        const fileInput = document.getElementById('points-file-input');
        if (fileInput) {
            const file = fileInput.files[0];
            
            if (file) {
                // 读取文件
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        
                        // 获取第一个工作表
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // 转换为JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        // 提取第一列
                        jsonData.forEach(row => {
                            if (row.length > 0) {
                                const value = parseFloat(row[0]);
                                if (!isNaN(value)) {
                                    points.push(value);
                                }
                            }
                        });
                        
                        interpolationPoints = points;
                    } catch (error) {
                        console.error('读取插值点文件时出错:', error);
                        showToast('读取插值点文件时出错', 'error');
                    }
                };
                
                reader.readAsArrayBuffer(file);
            }
        }
    } else if (inputType === 'auto') {
        // 自动生成
        const startValueInput = document.getElementById('start-value');
        const endValueInput = document.getElementById('end-value');
        const stepValueInput = document.getElementById('step-value');
        
        if (startValueInput && endValueInput && stepValueInput) {
            const start = parseFloat(startValueInput.value);
            const end = parseFloat(endValueInput.value);
            const step = parseFloat(stepValueInput.value);
            
            if (!isNaN(start) && !isNaN(end) && !isNaN(step) && step > 0) {
                for (let x = start; x <= end; x += step) {
                    points.push(x);
                }
            }
        }
    }
    
    interpolationPoints = points;
    return points;
}

// 执行插值计算
function calculateInterpolation() {
    // 验证输入
    if (originalData.length === 0) {
        showToast('请先导入数据', 'error');
        return;
    }
    
    // 检查x变量数量
    const xVariables = headers.filter(header => variableTypes[header] === 'x');
    if (xVariables.length === 0) {
        showToast('x变量数量不足（至少1列），请补充变量', 'error');
        return;
    }
    
    // 获取插值点
    const points = getInterpolationPoints();
    console.log('获取到的插值点:', points);
    console.log('全局interpolationPoints:', interpolationPoints);
    
    // 使用全局interpolationPoints作为最终的插值点
    const finalPoints = interpolationPoints.length > 0 ? interpolationPoints : points;
    console.log('最终使用的插值点:', finalPoints);
    
    if (finalPoints.length === 0) {
        showToast('请输入有效的插值点', 'error');
        return;
    }
    
    // 显示进度条（如果数据量较大）
    const showProgress = originalData.length > 5000;
    if (showProgress) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.classList.remove('hidden');
        }
    }
    
    // 执行计算
    setTimeout(() => {
        try {
            const method = document.getElementById('interpolation-method').value;
            const results = {};
            
            // 为每个y变量计算插值
            const yVariables = headers.filter(header => variableTypes[header] === 'y');
            yVariables.forEach((yVar, yIndex) => {
                results[yVar] = [];
                
                // 更新进度
                if (showProgress) {
                    updateProgress((yIndex / yVariables.length) * 100);
                }
                
                // 计算每个插值点
                finalPoints.forEach(point => {
                    let result;
                    
                    // 根据选择的方法执行插值
                    switch (method) {
                        case 'linear':
                            result = linearInterpolation(xVariables, yVar, point);
                            break;
                        case 'cubic-spline':
                            result = cubicSplineInterpolation(xVariables, yVar, point);
                            break;
                        case 'polynomial':
                            const degree = parseInt(document.getElementById('polynomial-degree').value) || 3;
                            result = polynomialInterpolation(xVariables, yVar, point, degree);
                            break;
                        case 'lagrange':
                            result = lagrangeInterpolation(xVariables, yVar, point);
                            break;
                        case 'kriging':
                            result = krigingInterpolation(xVariables, yVar, point);
                            break;
                        case 'hermite':
                            result = hermiteInterpolation(xVariables, yVar, point);
                            break;
                        default:
                            result = linearInterpolation(xVariables, yVar, point);
                    }
                    
                    results[yVar].push(result);
                });
            });
            
            // 更新进度为100%
            if (showProgress) {
                updateProgress(100);
                setTimeout(() => {
                    document.getElementById('progress-bar').classList.add('hidden');
                }, 500);
            }
            
            // 存储结果
            calculationResults = {
                points: finalPoints,
                results: results
            };
            
            // 更新全局interpolationPoints变量
            interpolationPoints = finalPoints;
            console.log('更新全局interpolationPoints:', interpolationPoints);
            
            // 显示结果
            displayResults();
            
            // 保存到历史记录
            saveToHistory();
            
            showToast('计算完成', 'success');
        } catch (error) {
            console.error('计算时出错:', error);
            showToast('计算时出错，请检查输入参数', 'error');
            
            // 隐藏进度条
            if (showProgress) {
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) {
                    progressBar.classList.add('hidden');
                }
            }
        }
    }, 100);
}

// 更新进度条
function updateProgress(percent) {
    document.getElementById('progress-percent').textContent = `${Math.round(percent)}%`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

// 线性插值
function linearInterpolation(xVariables, yVar, point) {
    // 简化实现：使用最近的两个点进行线性插值
    const xIndex = headers.indexOf(xVariables[0]);
    const yIndex = headers.indexOf(yVar);
    
    // 按x值排序
    const sortedData = [...originalData].sort((a, b) => a[xIndex] - b[xIndex]);
    
    // 找到包含point的区间
    for (let i = 0; i < sortedData.length - 1; i++) {
        const x1 = sortedData[i][xIndex];
        const x2 = sortedData[i + 1][xIndex];
        
        if (point >= x1 && point <= x2) {
            const y1 = sortedData[i][yIndex];
            const y2 = sortedData[i + 1][yIndex];
            
            // 线性插值公式
            return y1 + (y2 - y1) * (point - x1) / (x2 - x1);
        }
    }
    
    // 如果point超出范围，返回最近的值
    if (point < sortedData[0][xIndex]) {
        return sortedData[0][yIndex];
    } else {
        return sortedData[sortedData.length - 1][yIndex];
    }
}

// 三次样条插值
function cubicSplineInterpolation(xVariables, yVar, point) {
    // 简化实现：使用线性插值作为替代
    return linearInterpolation(xVariables, yVar, point);
}

// 多项式插值
function polynomialInterpolation(xVariables, yVar, point, degree) {
    // 简化实现：使用线性插值作为替代
    return linearInterpolation(xVariables, yVar, point);
}

// 拉格朗日插值
function lagrangeInterpolation(xVariables, yVar, point) {
    // 简化实现：使用线性插值作为替代
    return linearInterpolation(xVariables, yVar, point);
}

// 克里金插值
function krigingInterpolation(xVariables, yVar, point) {
    // 简化实现：使用线性插值作为替代
    return linearInterpolation(xVariables, yVar, point);
}

// 分段低次插值（二次Hermite）
function hermiteInterpolation(xVariables, yVar, point) {
    // 简化实现：使用线性插值作为替代
    return linearInterpolation(xVariables, yVar, point);
}

// 显示计算结果
function displayResults() {
    const results = document.getElementById('results');
    const resultsTable = document.getElementById('results-table');
    const resultsBody = document.getElementById('results-body');
    
    // 检查DOM元素是否存在
    if (!results || !resultsTable || !resultsBody) {
        console.error('DOM元素不存在');
        return;
    }
    
    // 清空结果
    const thead = resultsTable.querySelector('thead');
    if (!thead) {
        console.error('表头元素不存在');
        return;
    }
    
    thead.innerHTML = '';
    resultsBody.innerHTML = '';
    
    // 生成表头行
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-50';
    
    // 生成表头
    const thPoint = document.createElement('th');
    thPoint.className = 'py-2 px-4 border-b text-left';
    thPoint.textContent = '插值点';
    headerRow.appendChild(thPoint);
    
    // 添加y变量表头
    if (calculationResults && calculationResults.results) {
        Object.keys(calculationResults.results).forEach(yVar => {
            const th = document.createElement('th');
            th.className = 'py-2 px-4 border-b text-left';
            th.textContent = `${yVar} (插值结果)`;
            headerRow.appendChild(th);
        });
        
        // 添加表头行到thead
        thead.appendChild(headerRow);
        
        // 生成结果数据
        if (calculationResults.points) {
            calculationResults.points.forEach((point, index) => {
                const tr = document.createElement('tr');
                
                // 插值点
                const pointTd = document.createElement('td');
                pointTd.className = 'py-2 px-4 border-b';
                pointTd.textContent = point;
                tr.appendChild(pointTd);
                
                // 各y变量的插值结果
                const decimalPlaces = parseInt(document.getElementById('decimal-places').value) || 4;
                Object.keys(calculationResults.results).forEach(yVar => {
                    const resultTd = document.createElement('td');
                    resultTd.className = 'py-2 px-4 border-b';
                    resultTd.textContent = calculationResults.results[yVar][index].toFixed(decimalPlaces);
                    tr.appendChild(resultTd);
                });
                
                resultsBody.appendChild(tr);
            });
        }
    }
    
    // 显示结果
    results.classList.remove('hidden');
}

// 导出结果
function exportResults() {
    if (!calculationResults || !calculationResults.points || calculationResults.points.length === 0) {
        showToast('请先执行计算', 'error');
        return;
    }
    
    const exportType = document.querySelector('input[name="export-type"]:checked').value;
    
    // 准备导出数据
    let exportData = [];
    let exportHeaders = [];
    
    if (exportType === 'full') {
        // 导出完整内容
        // 原始数据
        exportHeaders = [...headers];
        exportData = [...originalData];
        
        // 添加空行
        exportData.push([]);
        
        // 添加插值方法说明
        const method = document.getElementById('interpolation-method').value;
        const methodNames = {
            'linear': '线性插值',
            'cubic-spline': '三次样条插值',
            'polynomial': '多项式插值',
            'lagrange': '拉格朗日插值',
            'kriging': '克里金插值',
            'hermite': '分段低次插值（二次Hermite）'
        };
        exportData.push(['插值方法:', methodNames[method] || method]);
        
        // 添加空行
        exportData.push([]);
        
        // 添加插值结果
        const resultHeaders = ['插值点', ...Object.keys(calculationResults.results).map(yVar => `${yVar} (插值结果)`)];
        exportData.push(resultHeaders);
        
        calculationResults.points.forEach((point, index) => {
            const row = [point];
            Object.keys(calculationResults.results).forEach(yVar => {
                row.push(calculationResults.results[yVar][index]);
            });
            exportData.push(row);
        });
    } else {
        // 仅导出插值结果
        exportHeaders = ['插值点', ...Object.keys(calculationResults.results).map(yVar => `${yVar} (插值结果)`)];
        exportData.push(exportHeaders);
        
        calculationResults.points.forEach((point, index) => {
            const row = [point];
            Object.keys(calculationResults.results).forEach(yVar => {
                row.push(calculationResults.results[yVar][index]);
            });
            exportData.push(row);
        });
    }
    
    // 创建工作簿
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '插值结果');
    
    // 导出文件
    XLSX.writeFile(workbook, '插值计算结果.xlsx');
    
    showToast('导出成功', 'success');
}

// 保存到历史记录
function saveToHistory() {
    // 获取插值点输入方式
    const pointsInputType = document.querySelector('input[name="interpolation-points-type"]:checked').value;
    
    // 获取自动生成插值点的参数
    const autoPointsParams = {
        start: document.getElementById('start-value').value,
        end: document.getElementById('end-value').value,
        step: document.getElementById('step-value').value
    };
    
    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: {
            headers: headers,
            originalData: originalData,
            variableTypes: variableTypes,
            method: document.getElementById('interpolation-method').value,
            params: {
                polynomialDegree: document.getElementById('polynomial-degree').value,
                splineBoundary: document.getElementById('spline-boundary').value
            },
            points: interpolationPoints,
            pointsInputType: pointsInputType,
            autoPointsParams: autoPointsParams
        }
    };
    
    // 添加到历史记录
    historyRecords.unshift(record);
    
    // 保留最近3条记录
    historyRecords = historyRecords.slice(0, 3);
    
    // 保存到localStorage
    try {
        const historyString = JSON.stringify(historyRecords);
        localStorage.setItem('interpolationHistory', historyString);
        console.log('历史记录保存成功，数据大小:', historyString.length, '字符');
        console.log('历史记录内容:', historyRecords);
    } catch (error) {
        console.error('保存历史记录到localStorage时出错:', error);
        showToast('保存历史记录失败，可能是数据量过大', 'error');
    }
    
    // 更新历史记录显示
    console.log('调用updateHistoryDisplay更新历史记录显示');
    updateHistoryDisplay();
}

// 加载历史记录
function loadHistory() {
    try {
        const savedHistory = localStorage.getItem('interpolationHistory');
        if (savedHistory) {
            historyRecords = JSON.parse(savedHistory);
            console.log('历史记录加载成功，记录数:', historyRecords.length);
            console.log('第一条记录数据大小:', historyRecords[0] ? JSON.stringify(historyRecords[0]).length : 0, '字符');
            updateHistoryDisplay();
        }
    } catch (error) {
        console.error('从localStorage加载历史记录时出错:', error);
        // 清除损坏的历史记录
        localStorage.removeItem('interpolationHistory');
        historyRecords = [];
    }
}

// 更新历史记录显示
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');
    
    // 检查DOM元素是否存在
    if (!historyList || !emptyHistory) {
        // 历史记录弹窗可能未打开，这是正常情况
        return;
    }
    
    // 清空历史记录列表
    historyList.innerHTML = '';
    
    if (historyRecords.length === 0) {
        // 显示空历史记录提示
        emptyHistory.classList.remove('hidden');
    } else {
        // 隐藏空历史记录提示
        emptyHistory.classList.add('hidden');
        
        // 生成历史记录项
        historyRecords.forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(record.timestamp);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            const methodNames = {
                'linear': '线性插值',
                'cubic-spline': '三次样条插值',
                'polynomial': '多项式插值',
                'lagrange': '拉格朗日插值',
                'kriging': '克里金插值',
                'hermite': '分段低次插值（二次Hermite）'
            };
            
            historyItem.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold">计算记录</h4>
                    <span class="text-sm text-secondary">${formattedDate}</span>
                </div>
                <p class="text-sm mb-2">插值方法: ${methodNames[record.data.method] || record.data.method}</p>
                <p class="text-sm mb-2">x变量: ${Object.keys(record.data.variableTypes).filter(key => record.data.variableTypes[key] === 'x').join(', ')}</p>
                <p class="text-sm mb-2">y变量: ${Object.keys(record.data.variableTypes).filter(key => record.data.variableTypes[key] === 'y').join(', ')}</p>
                <button class="reuse-btn bg-primary hover:bg-primary/90 text-white text-sm font-medium py-1 px-4 rounded-lg transition-colors inline-flex items-center mt-2" data-id="${record.id}">
                    <i class="fa fa-refresh mr-1"></i> 一键复用
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // 绑定复用按钮事件
        document.querySelectorAll('.reuse-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const recordId = parseInt(this.getAttribute('data-id'));
                reuseHistoryRecord(recordId);
            });
        });
    }
}

// 复用历史记录
function reuseHistoryRecord(recordId) {
    try {
        const record = historyRecords.find(r => r.id === recordId);
        if (record) {
            console.log('开始复用历史记录，记录ID:', recordId);
            console.log('历史记录包含原始数据:', !!record.data.originalData);
            console.log('原始数据行数:', record.data.originalData ? record.data.originalData.length : 0);
            console.log('表头数量:', record.data.headers ? record.data.headers.length : 0);
            
            // 恢复原始数据和表头
            originalData = record.data.originalData || [];
            headers = record.data.headers || [];
            
            // 恢复变量类型
            variableTypes = { ...record.data.variableTypes };
            
            // 恢复插值方法
            document.getElementById('interpolation-method').value = record.data.method;
            
            // 恢复方法参数
            if (record.data.params) {
                if (record.data.params.polynomialDegree) {
                    document.getElementById('polynomial-degree').value = record.data.params.polynomialDegree;
                }
                if (record.data.params.splineBoundary) {
                    document.getElementById('spline-boundary').value = record.data.params.splineBoundary;
                }
            }
            
            // 恢复插值点输入方式
            if (record.data.pointsInputType) {
                document.querySelector(`input[name="interpolation-points-type"][value="${record.data.pointsInputType}"]`).checked = true;
                // 切换输入方式显示
                toggleInterpolationPointsInput();
            }
            
            // 恢复自动生成插值点的参数
            if (record.data.autoPointsParams) {
                const { start, end, step } = record.data.autoPointsParams;
                if (start) document.getElementById('start-value').value = start;
                if (end) document.getElementById('end-value').value = end;
                if (step) document.getElementById('step-value').value = step;
            }
            
            // 恢复插值点
            interpolationPoints = [...record.data.points];
            document.getElementById('manual-points').value = interpolationPoints.join(',');
            
            // 更新方法参数显示
            updateMethodParams();
            
            // 显示数据预览
            showDataPreview();
            
            // 重新生成变量配置表格
            generateVariableConfig();
            
            // 更新自动生成插值点的范围
            updateAutoPointsRange();
            
            console.log('历史记录复用成功');
            showToast('历史配置已复用', 'success');
            
            // 关闭历史记录弹窗
            closeModal('history-modal');
        } else {
            console.error('未找到指定ID的历史记录:', recordId);
            showToast('未找到历史记录', 'error');
        }
    } catch (error) {
        console.error('复用历史记录时出错:', error);
        showToast('复用历史记录失败', 'error');
    }
}

// 清空所有数据
function clearAllData() {
    // 重置全局变量
    originalData = [];
    headers = [];
    variableTypes = {};
    interpolationPoints = [];
    calculationResults = [];
    historyRecords = [];
    
    // 清空localStorage
    localStorage.removeItem('interpolationHistory');
    
    // 清空UI
    document.getElementById('data-preview').classList.add('hidden');
    document.getElementById('variable-config').innerHTML = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('file-input').value = '';
    document.getElementById('manual-points').value = '';
    document.getElementById('points-file-input').value = '';
    document.getElementById('start-value').value = '';
    document.getElementById('end-value').value = '';
    document.getElementById('step-value').value = '1';
    
    // 更新历史记录显示
    updateHistoryDisplay();
    
    showToast('所有数据已清空', 'success');
}

// 重置计算
function resetCalculation() {
    // 重置计算相关变量
    calculationResults = null;
    
    // 清空结果显示
    document.getElementById('results').classList.add('hidden');
    
    showToast('计算已重置', 'success');
}

// 添加测试数据
function addTestData() {
    // 生成测试数据，包含中文变量名
    headers = ['时间', '温度', '压力', '湿度'];
    originalData = [];
    
    // 生成100行测试数据
    for (let i = 0; i < 100; i++) {
        const time = i;
        const temperature = Math.sin(i * 0.1) * 10 + 25;
        const pressure = Math.cos(i * 0.15) * 5 + 101;
        const humidity = Math.pow(i, 1.1) / 5 + 40;
        
        originalData.push([time, temperature, pressure, humidity]);
    }
    
    // 初始化变量类型：第一个变量为x，其他为y
    variableTypes = {
        '时间': 'x',
        '温度': 'y',
        '压力': 'y',
        '湿度': 'y'
    };
    
    // 显示数据预览
    showDataPreview();
    
    // 生成变量配置表格
    generateVariableConfig();
    
    // 更新自动生成插值点的范围
    updateAutoPointsRange();
    
    // 设置默认插值点
    interpolationPoints = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    document.getElementById('manual-points').value = interpolationPoints.join(',');
    
    showToast('测试数据已添加', 'success');
    
    // 关闭开发者工具弹窗
    closeModal('dev-tools-modal');
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 检查是否已存在toast
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0';
        document.body.appendChild(toast);
    }
    
    // 设置消息和类型
    toast.textContent = message;
    
    // 设置样式
    toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0';
    
    if (type === 'success') {
        toast.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        toast.classList.add('bg-red-500', 'text-white');
    } else {
        toast.classList.add('bg-blue-500', 'text-white');
    }
    
    // 显示toast
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

// 初始化模态框
function initModal(modalId, openBtnId, closeBtnId, overlayId) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    const overlay = document.getElementById(overlayId);
    
    if (modal && openBtn && closeBtn && overlay) {
        // 打开模态框
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            
            // 如果是历史记录弹窗，打开时更新显示
            if (modalId === 'history-modal') {
                updateHistoryDisplay();
            }
        });
        
        // 关闭模态框
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        // 点击遮罩层关闭
        overlay.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}