document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const currentDateEl = document.getElementById('current-date');
    const currentMonthEl = document.getElementById('current-month');
    const calendarGridEl = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const addTodoForm = document.getElementById('add-todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoNote = document.getElementById('todo-note');
    const timePrecisionRadios = document.querySelectorAll('input[name="time-precision"]');
    const timeSelectContainer = document.getElementById('time-select-container');
    const todoHour = document.getElementById('todo-hour');
    const todoMinute = document.getElementById('todo-minute');
    const todoListEl = document.getElementById('todo-list');
    const emptyTodoMessage = document.getElementById('empty-todo-message');
    
    // 历史记录相关元素
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyOverlay = document.getElementById('history-overlay');
    const historyContainer = document.getElementById('history-container');
    const historyHeader = document.getElementById('history-header');
    const historyClose = document.getElementById('history-close');
    const timeFilter = document.getElementById('time-filter');
    const statusFilter = document.getElementById('status-filter');
    const clearHistoryBtn = document.getElementById('clear-history');
    const historyList = document.getElementById('history-list');
    const emptyHistoryMessage = document.getElementById('empty-history-message');
    
    // 历史记录详情相关元素
    const historyDetailModal = document.getElementById('history-detail-modal');
    const historyDetailOverlay = document.getElementById('history-detail-overlay');
    const historyDetailContainer = document.getElementById('history-detail-container');
    const historyDetailClose = document.getElementById('history-detail-close');
    const historyDetailContent = document.getElementById('history-detail-content');
    
    // 开发者工具相关元素
    const devToolsBtn = document.getElementById('dev-tools-btn');
    const devToolsModal = document.getElementById('dev-tools-modal');
    const devToolsOverlay = document.getElementById('dev-tools-overlay');
    const devToolsContainer = document.getElementById('dev-tools-container');
    const devToolsHeader = document.getElementById('dev-tools-header');
    const devToolsClose = document.getElementById('dev-tools-close');
    const devAddTodoForm = document.getElementById('dev-add-todo-form');
    const devTodoInput = document.getElementById('dev-todo-input');
    const devTodoDate = document.getElementById('dev-todo-date');
    const devTodoNote = document.getElementById('dev-todo-note');
    const clearAllDataBtn = document.getElementById('clear-all-data');
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const importDataFile = document.getElementById('import-data-file');
    const addTestDataBtn = document.getElementById('add-test-data');
    
    // 更新日志相关元素
    const changelogBtn = document.getElementById('changelog-btn');
    const changelogModal = document.getElementById('changelog-modal');
    const changelogOverlay = document.getElementById('changelog-overlay');
    const changelogContainer = document.getElementById('changelog-container');
    const changelogHeader = document.getElementById('changelog-header');
    const changelogClose = document.getElementById('changelog-close');
    const changelogContent = document.getElementById('changelog-content');

    // 当前日期和日历状态
    let currentDate = new Date();
    let currentMonth = new Date();
    let todos = storageGet('todos') || [];
    let historyTodos = storageGet('historyTodos') || [];
    
    // 为旧数据添加默认tag属性
    todos = todos.map(todo => ({
        ...todo,
        tag: todo.tag || '其他'
    }));
    
    // 为历史记录中的旧数据添加默认tag属性
    historyTodos = historyTodos.map(item => ({
        ...item,
        tag: item.tag || '其他'
    }));
    
    // 保存更新后的数据到localStorage
    storageSet('todos', todos);
    storageSet('historyTodos', historyTodos);
    
    // 拖动相关变量
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    // 初始化应用
    initApp();

    function initApp() {
        // 调用通用初始化
        initCommon();
        
        // 设置当前日期显示
        updateCurrentDate();
        
        // 添加定时器，每秒更新一次时间
        setInterval(updateCurrentDate, 1000);
        
        // 设置默认日期为今天
        const today = formatDate(currentDate);
        todoDate.value = today;
        todoDate.min = today;
        
        // 渲染日历
        renderCalendar();
        
        // 渲染待办列表
        renderTodoList();
        
        // 添加事件监听器
        addEventListeners();
    }

    function updateCurrentDate() {
        currentDate = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateEl.textContent = currentDate.toLocaleString('zh-CN', options);
    }

    function renderCalendar() {
        // 清空日历网格
        calendarGridEl.innerHTML = '';
        
        // 更新当前月份显示
        const monthOptions = { year: 'numeric', month: 'long' };
        currentMonthEl.textContent = currentMonth.toLocaleDateString('zh-CN', monthOptions);
        
        // 获取当前月份的第一天和最后一天
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        // 获取第一天是星期几（0-6，0表示星期日）
        const firstDayWeekday = firstDay.getDay();
        
        // 获取当前月份的天数
        const daysInMonth = lastDay.getDate();
        
        // 添加空白格子（上个月的日期）
        for (let i = 0; i < firstDayWeekday; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day text-gray-200';
            calendarGridEl.appendChild(emptyDay);
        }
        
        // 添加当前月份的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // 设置日期文本
            dayEl.textContent = day;
            
            // 检查是否是今天
            const isToday = currentDate.getDate() === day && 
                           currentDate.getMonth() === currentMonth.getMonth() && 
                           currentDate.getFullYear() === currentMonth.getFullYear();
            
            if (isToday) {
                dayEl.classList.add('today');
            }
            
            // 检查是否有待办事项
            const dateStr = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            if (hasTodoOnDate(dateStr)) {
                dayEl.classList.add('has-task');
            }
            
            calendarGridEl.appendChild(dayEl);
        }
        
        // 更新当月任务统计
        updateMonthlyStats();
    }
    
    function updateMonthlyStats() {
        // 获取当前月份的开始和结束日期
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        // 统计当月任务
        let overdueCount = 0;
        let pendingCount = 0;
        
        // 统计待办事项
        todos.forEach(todo => {
            const todoDate = new Date(todo.date);
            // 检查是否在当前月份内
            if (todoDate >= startOfMonth && todoDate <= endOfMonth) {
                if (todoDate < new Date()) {
                    overdueCount++;
                } else {
                    pendingCount++;
                }
            }
        });
        
        // 统计已完成任务
        let completedCount = 0;
        historyTodos.forEach(item => {
            if (item.status === 'completed') {
                const itemDate = new Date(item.timestamp);
                if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
                    completedCount++;
                }
            }
        });
        
        // 更新统计显示
        document.getElementById('overdue-count').textContent = overdueCount;
        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('pending-count').textContent = pendingCount;
        
        // 生成扇形图
        generateTaskChart(overdueCount, completedCount, pendingCount);
    }
    
    function generateTaskChart(overdue, completed, pending) {
        const chartEl = document.getElementById('task-chart');
        chartEl.innerHTML = '';
        
        const total = overdue + completed + pending;
        if (total === 0) {
            // 无任务时显示空状态
            const emptyState = document.createElement('div');
            emptyState.className = 'flex flex-col items-center justify-center h-full text-secondary';
            emptyState.innerHTML = '<i class="fa fa-tasks text-2xl mb-2"></i><span>本月无任务</span>';
            chartEl.appendChild(emptyState);
            return;
        }
        
        // 计算各部分角度
        const overdueAngle = (overdue / total) * 360;
        const completedAngle = (completed / total) * 360;
        const pendingAngle = (pending / total) * 360;
        
        // 创建扇形图SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '160');
        svg.setAttribute('height', '160');
        svg.setAttribute('viewBox', '0 0 160 160');
        
        let currentAngle = 0;
        
        // 添加逾期任务扇形
        if (overdue > 0) {
            addPieSegment(svg, 80, 80, 60, currentAngle, currentAngle + overdueAngle, '#e53e3e');
            currentAngle += overdueAngle;
        }
        
        // 添加已完成任务扇形
        if (completed > 0) {
            addPieSegment(svg, 80, 80, 60, currentAngle, currentAngle + completedAngle, '#38a169');
            currentAngle += completedAngle;
        }
        
        // 添加待完成任务扇形
        if (pending > 0) {
            addPieSegment(svg, 80, 80, 60, currentAngle, currentAngle + pendingAngle, '#3182ce');
        }
        
        // 添加中心圆
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', '80');
        centerCircle.setAttribute('cy', '80');
        centerCircle.setAttribute('r', '40');
        centerCircle.setAttribute('fill', 'white');
        svg.appendChild(centerCircle);
        
        // 添加中心文本
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', '80');
        centerText.setAttribute('y', '80');
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dominant-baseline', 'middle');
        centerText.setAttribute('font-size', '16');
        centerText.setAttribute('font-weight', 'bold');
        centerText.setAttribute('fill', '#4a5568');
        centerText.textContent = total;
        svg.appendChild(centerText);
        
        const centerTextLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerTextLabel.setAttribute('x', '80');
        centerTextLabel.setAttribute('y', '95');
        centerTextLabel.setAttribute('text-anchor', 'middle');
        centerTextLabel.setAttribute('dominant-baseline', 'middle');
        centerTextLabel.setAttribute('font-size', '10');
        centerTextLabel.setAttribute('fill', '#718096');
        centerTextLabel.textContent = '任务';
        svg.appendChild(centerTextLabel);
        
        chartEl.appendChild(svg);
    }
    
    function addPieSegment(svg, centerX, centerY, radius, startAngle, endAngle, color) {
        // 转换角度为弧度
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        // 计算起点和终点坐标
        const startX = centerX + radius * Math.cos(startRad);
        const startY = centerY + radius * Math.sin(startRad);
        const endX = centerX + radius * Math.cos(endRad);
        const endY = centerY + radius * Math.sin(endRad);
        
        // 确定是否为大弧
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        
        // 创建路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', color);
        
        svg.appendChild(path);
    }

    function renderTodoList() {
        // 检查是否有待办事项
        if (todos.length === 0) {
            emptyTodoMessage.classList.remove('hidden');
            return;
        }
        
        // 隐藏空消息
        emptyTodoMessage.classList.add('hidden');
        
        // 清空待办列表
        todoListEl.innerHTML = '';
        
        // 按日期排序（最近的日期在前）
        todos.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 添加待办事项到列表
        todos.forEach((todo, index) => {
            const todoEl = createTodoElement(todo, index);
            todoListEl.appendChild(todoEl);
        });
    }

    function getTagColor(tag) {
        switch (tag) {
            case '学习':
                return 'bg-blue-400 text-white';
            case '科研':
                return 'bg-purple-400 text-white';
            case '其他':
                return 'bg-gray-400 text-white';
            default:
                return 'bg-gray-400 text-white';
        }
    }

    function createTodoElement(todo, index) {
        const todoEl = document.createElement('div');
        todoEl.className = 'todo-item bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center fade-in';
        
        // 格式化日期显示
        const date = new Date(todo.date);
        let formattedDate;
        // 检查是否包含时间信息
        if (todo.date.includes('T')) {
            // 包含时间信息，显示日期和时间
            const dateTimeOptions = { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' };
            formattedDate = date.toLocaleString('zh-CN', dateTimeOptions);
        } else {
            // 仅日期信息，按原有格式显示
            const dateOptions = { month: 'short', day: 'numeric', weekday: 'short' };
            formattedDate = date.toLocaleDateString('zh-CN', dateOptions);
        }
        
        // 计算距离截止日期的时间差
        const today = new Date();
        let diffDays;
        let diffHours;
        let diffMinutes;
        let isOverdue;
        let timeText = '';
        let timeClass = '';
        
        // 检查是否包含时间信息
        if (todo.date.includes('T')) {
            // 包含时间信息，使用完整日期时间计算
            const diffTime = date - today;
            diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            isOverdue = diffTime < 0;
            
            // 设置剩余时间的显示样式和文本（精确到分钟）
            if (isOverdue) {
                timeText = '已逾期';
                timeClass = 'bg-accent text-white';
            } else if (diffDays === 0 && diffHours === 0 && diffMinutes === 0) {
                timeText = '现在截止';
                timeClass = 'bg-red-500 text-white';
            } else if (diffDays === 0) {
                if (diffHours === 0) {
                    timeText = `剩余 ${diffMinutes} 分钟`;
                } else {
                    timeText = `剩余 ${diffHours} 小时 ${diffMinutes} 分钟`;
                }
                timeClass = 'bg-orange-500 text-white';
            } else if (diffDays === 1) {
                timeText = `明天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} 截止`;
                timeClass = 'bg-yellow-500 text-white';
            } else if (diffDays <= 3) {
                timeText = `剩余 ${diffDays} 天 ${diffHours} 小时`;
                timeClass = 'bg-yellow-400 text-white';
            } else {
                timeText = `剩余 ${diffDays} 天`;
                timeClass = 'bg-green-500 text-white';
            }
        } else {
            // 仅日期信息，按原有逻辑计算
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            const diffTime = date - today;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            isOverdue = diffDays < 0;
            
            // 设置剩余天数的显示样式和文本（保持原有逻辑）
            if (isOverdue) {
                timeText = '已逾期';
                timeClass = 'bg-accent text-white';
            } else if (diffDays === 0) {
                timeText = '今天截止';
                timeClass = 'bg-orange-500 text-white';
            } else if (diffDays === 1) {
                timeText = '明天截止';
                timeClass = 'bg-yellow-500 text-white';
            } else if (diffDays <= 3) {
                timeText = `剩余 ${diffDays} 天`;
                timeClass = 'bg-yellow-400 text-white';
            } else {
                timeText = `剩余 ${diffDays} 天`;
                timeClass = 'bg-green-500 text-white';
            }
        }
        
        // 获取标签颜色
        const tagClass = getTagColor(todo.tag);
        
        // 构建待办事项HTML，包含备注和编辑按钮
        let todoHTML = `
            <div class="flex-1">
                <p class="font-medium ${isOverdue ? 'text-accent' : ''}">${todo.text}</p>
                <div class="flex items-center mt-1 flex-wrap gap-2">
                    <p class="text-sm text-secondary">截止: ${formattedDate}</p>
                    <span class="text-xs px-2 py-1 rounded-full ${timeClass}">${timeText}</span>
                    <span class="text-xs px-2 py-1 rounded-full ${tagClass}">${todo.tag}</span>
                </div>
        `;
        
        // 如果有备注，显示备注信息
        if (todo.note && todo.note.trim() !== '') {
            todoHTML += `
                <div class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <i class="fa fa-comment-o mr-1"></i> ${todo.note}
                </div>
            `;
        }
        
        todoHTML += `
            </div>
            <div class="flex space-x-1">
                <button class="complete-todo p-2 rounded-full hover:bg-green-100 text-green-500 transition-colors" data-index="${index}">
                    <i class="fa fa-check"></i>
                </button>
                <button class="edit-todo p-2 rounded-full hover:bg-blue-100 text-primary transition-colors" data-index="${index}">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="delete-todo p-2 rounded-full hover:bg-red-100 text-accent transition-colors" data-index="${index}">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
        
        todoEl.innerHTML = todoHTML;
        
        return todoEl;
    }

    function addEventListeners() {
        // 上一个月按钮
        prevMonthBtn.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            renderCalendar();
        });
        
        // 下一个月按钮
        nextMonthBtn.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            renderCalendar();
        });
        
        // 时间精度选择
        timePrecisionRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'hour') {
                    timeSelectContainer.style.display = 'block';
                } else {
                    timeSelectContainer.style.display = 'none';
                }
            });
        });
        
        // 添加待办表单提交
        addTodoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTodo();
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        let date = todoDate.value;
        const note = todoNote.value.trim();
        const tag = document.querySelector('input[name="todo-tag"]:checked').value;
        
        // 验证输入
        if (!text) {
            showToast('请输入待办内容');
            return;
        }
        
        if (!date) {
            showToast('请选择截止日期');
            return;
        }
        
        // 检查时间精度选择
        const selectedPrecision = document.querySelector('input[name="time-precision"]:checked').value;
        if (selectedPrecision === 'hour') {
            const hour = todoHour.value.padStart(2, '0');
            const minute = todoMinute.value.padStart(2, '0');
            date += `T${hour}:${minute}:00`;
        }
        
        // 添加新的待办事项
        const newTodo = {
            text,
            date,
            note,
            tag,
            id: Date.now() // 添加唯一ID
        };
        
        todos.push(newTodo);
        
        // 保存到localStorage
        saveTodos();
        
        // 重新渲染日历和待办列表
        renderCalendar();
        renderTodoList();
        
        // 清空输入框
        todoInput.value = '';
        todoNote.value = '';
        
        // 显示成功提示
        showToast('待办事项添加成功');
        
        // 添加事件监听器
        addButtonListeners();
    }

    function deleteTodo(index) {
        // 显示确认对话框
        if (confirm('确定要删除这个待办事项吗？')) {
            // 添加删除动画
            const todoEl = document.querySelector(`.delete-todo[data-index="${index}"]`).closest('.todo-item');
            todoEl.classList.add('slide-out');
            
            // 等待动画完成后删除
            setTimeout(() => {
                // 获取要删除的待办事项
                const deletedTodo = todos[index];
                
                // 从数组中删除
                todos.splice(index, 1);
                
                // 添加到历史记录
                addToHistory(deletedTodo, 'deleted');
                
                // 保存到localStorage
                saveTodos();
                saveHistoryTodos();
                
                // 重新渲染日历和待办列表
                renderCalendar();
                renderTodoList();
                
                // 添加事件监听器
                addButtonListeners();
                
                // 显示成功提示
                showToast('待办事项已删除');
            }, 300);
        }
    }

    // 添加编辑功能
    function completeTodo(index) {
        // 添加完成动画
        const todoEl = document.querySelector(`.complete-todo[data-index="${index}"]`).closest('.todo-item');
        todoEl.classList.add('slide-out');
        
        // 等待动画完成后处理
        setTimeout(() => {
            // 获取要完成的待办事项
            const completedTodo = todos[index];
            
            // 从数组中删除
            todos.splice(index, 1);
            
            // 添加到历史记录
            addToHistory(completedTodo, 'completed');
            
            // 保存到localStorage
            saveTodos();
            saveHistoryTodos();
            
            // 重新渲染日历和待办列表
            renderCalendar();
            renderTodoList();
            
            // 添加事件监听器
            addButtonListeners();
            
            // 显示成功提示
            showToast('待办事项已完成');
        }, 300);
    }
    
    function editTodo(index) {
        const todo = todos[index];
        
        // 填充表单数据
        todoInput.value = todo.text;
        todoDate.value = todo.date;
        todoNote.value = todo.note || '';
        
        // 滚动到表单
        addTodoForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 聚焦到输入框
        todoInput.focus();
        
        // 删除原待办事项
        todos.splice(index, 1);
        
        // 保存更改
        saveTodos();
        
        // 重新渲染日历和待办列表
        renderCalendar();
        renderTodoList();
        
        // 添加事件监听器
        addButtonListeners();
        
        // 显示提示
        showToast('编辑模式：修改内容后点击添加按钮保存');
    }
    
    function addButtonListeners() {
        // 添加完成按钮事件监听器
        const completeButtons = document.querySelectorAll('.complete-todo');
        completeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                completeTodo(index);
            });
        });
        
        // 添加编辑按钮事件监听器
        const editButtons = document.querySelectorAll('.edit-todo');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                editTodo(index);
            });
        });
        
        // 添加删除按钮事件监听器
        const deleteButtons = document.querySelectorAll('.delete-todo');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                deleteTodo(index);
            });
        });
    }

    function hasTodoOnDate(date) {
        return todos.some(todo => todo.date === date);
    }

    function saveTodos() {
        storageSet('todos', todos);
    }
    
    function saveHistoryTodos() {
        storageSet('historyTodos', historyTodos);
    }
    
    function addToHistory(todo, status) {
        const historyItem = {
            ...todo,
            status: status,
            timestamp: new Date().toISOString(),
            historyId: Date.now()
        };
        
        historyTodos.push(historyItem);
    }

    // 注意：formatDate 和 showToast 函数已移至通用 JavaScript 文件中

    // 初始添加按钮事件监听器
    addButtonListeners();
    
    // 添加历史记录相关事件监听器
    addHistoryEventListeners();
    
    // 添加开发者工具相关事件监听器
    addDevToolsEventListeners();
    
    // 添加开发者工具时间精度事件监听器
    const devTimePrecisionRadios = document.querySelectorAll('input[name="dev-time-precision"]');
    const devTimeSelectContainer = document.getElementById('dev-time-select-container');
    
    devTimePrecisionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'hour') {
                devTimeSelectContainer.style.display = 'block';
            } else {
                devTimeSelectContainer.style.display = 'none';
            }
        });
    });
    
    // 历史记录相关函数
    function addHistoryEventListeners() {
        // 历史记录按钮点击事件
        historyBtn.addEventListener('click', () => {
            openHistoryModal();
        });
        
        // 关闭按钮点击事件
        historyClose.addEventListener('click', () => {
            closeHistoryModal();
        });
        
        // 遮罩层点击事件
        historyOverlay.addEventListener('click', () => {
            closeHistoryModal();
        });
        
        // 详情关闭按钮点击事件
        historyDetailClose.addEventListener('click', () => {
            closeHistoryDetailModal();
        });
        
        // 详情遮罩层点击事件
        historyDetailOverlay.addEventListener('click', () => {
            closeHistoryDetailModal();
        });
        
        // 筛选条件变化事件
        timeFilter.addEventListener('change', () => {
            saveFilterState();
            renderHistoryList();
        });
        
        statusFilter.addEventListener('change', () => {
            saveFilterState();
            renderHistoryList();
        });
        
        // 清空历史记录按钮点击事件
        clearHistoryBtn.addEventListener('click', () => {
            clearHistory();
        });
        

        
        // 加载保存的筛选状态
        loadFilterState();
    }
    
    function openHistoryModal() {
        historyModal.classList.remove('hidden');
        renderHistoryList();
        
        // 添加动画效果
        setTimeout(() => {
            historyContainer.classList.add('fade-in');
        }, 10);
    }
    
    function closeHistoryModal() {
        historyContainer.classList.add('slide-out');
        
        setTimeout(() => {
            historyModal.classList.add('hidden');
            historyContainer.classList.remove('slide-out');
        }, 300);
    }
    
    function openHistoryDetailModal(historyItem) {
        renderHistoryDetail(historyItem);
        historyDetailModal.classList.remove('hidden');
        
        // 添加动画效果
        setTimeout(() => {
            historyDetailContainer.classList.add('fade-in');
        }, 10);
    }
    
    function closeHistoryDetailModal() {
        historyDetailContainer.classList.add('slide-out');
        
        setTimeout(() => {
            historyDetailModal.classList.add('hidden');
            historyDetailContainer.classList.remove('slide-out');
        }, 300);
    }
    
    function renderHistoryList() {
        // 获取筛选条件
        const timeFilterValue = timeFilter.value;
        const statusFilterValue = statusFilter.value;
        
        // 筛选历史记录
        let filteredHistory = historyTodos.filter(item => {
            // 状态筛选
            if (statusFilterValue !== 'all' && item.status !== statusFilterValue) {
                return false;
            }
            
            // 时间范围筛选
            const itemDate = new Date(item.timestamp);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch (timeFilterValue) {
                case 'today':
                    return itemDate >= today;
                case '7days':
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return itemDate >= sevenDaysAgo;
                case '30days':
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    return itemDate >= thirtyDaysAgo;
                case 'all':
                default:
                    return true;
            }
        });
        
        // 按时间倒序排序（最新的在前）
        filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // 检查是否有筛选后的历史记录
        if (filteredHistory.length === 0) {
            emptyHistoryMessage.classList.remove('hidden');
            historyList.innerHTML = '';
            historyList.appendChild(emptyHistoryMessage);
            return;
        }
        
        // 隐藏空消息
        emptyHistoryMessage.classList.add('hidden');
        
        // 清空历史记录列表
        historyList.innerHTML = '';
        
        // 添加历史记录到列表
        filteredHistory.forEach(item => {
            const historyEl = createHistoryElement(item);
            historyList.appendChild(historyEl);
        });
    }
    
    function createHistoryElement(historyItem) {
        const historyEl = document.createElement('div');
        historyEl.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer';
        
        // 格式化日期显示
        const timestamp = new Date(historyItem.timestamp);
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedTimestamp = timestamp.toLocaleDateString('zh-CN', dateOptions);
        
        // 设置状态样式和文本
        let statusText = '';
        let statusClass = '';
        
        if (historyItem.status === 'completed') {
            statusText = '已完成';
            statusClass = 'bg-green-500 text-white';
        } else if (historyItem.status === 'deleted') {
            statusText = '已删除';
            statusClass = 'bg-accent text-white';
        }
        
        // 获取标签颜色
        const tagClass = getTagColor(historyItem.tag);
        
        historyEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-medium text-neutral-dark">${historyItem.text}</h4>
                    <div class="flex items-center mt-1 text-sm flex-wrap gap-2">
                        <span class="text-secondary">${formattedTimestamp}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${statusClass}">${statusText}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${tagClass}">${historyItem.tag}</span>
                    </div>
                </div>
                <div class="flex space-x-1">
                    <button class="view-history-detail p-2 rounded-full hover:bg-gray-100 transition-colors" data-id="${historyItem.historyId}">
                        <i class="fa fa-eye text-secondary"></i>
                    </button>
                    <button class="delete-history-item p-2 rounded-full hover:bg-red-100 transition-colors" data-id="${historyItem.historyId}">
                        <i class="fa fa-trash text-accent"></i>
                    </button>
                </div>
            </div>
        `;
        
        // 添加点击事件
        historyEl.addEventListener('click', (e) => {
            // 如果点击的是查看按钮或其子元素
            if (e.target.closest('.view-history-detail')) {
                const historyId = parseInt(e.target.closest('.view-history-detail').dataset.id);
                const item = historyTodos.find(h => h.historyId === historyId);
                if (item) {
                    openHistoryDetailModal(item);
                }
            }
            // 如果点击的是删除按钮或其子元素
            else if (e.target.closest('.delete-history-item')) {
                e.stopPropagation(); // 阻止事件冒泡
                const historyId = parseInt(e.target.closest('.delete-history-item').dataset.id);
                deleteHistoryItem(historyId, historyEl);
            }
        });
        
        return historyEl;
    }
    
    function renderHistoryDetail(historyItem) {
        // 格式化日期显示
        const timestamp = new Date(historyItem.timestamp);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedTimestamp = timestamp.toLocaleDateString('zh-CN', dateOptions);
        
        const deadline = new Date(historyItem.date);
        let formattedDeadline;
        // 检查是否包含时间信息
        if (historyItem.date.includes('T')) {
            // 包含时间信息，显示日期和时间
            const deadlineOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' };
            formattedDeadline = deadline.toLocaleString('zh-CN', deadlineOptions);
        } else {
            // 仅日期信息，按原有格式显示
            const deadlineOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            formattedDeadline = deadline.toLocaleDateString('zh-CN', deadlineOptions);
        }
        
        // 设置状态样式和文本
        let statusText = '';
        let statusClass = '';
        
        if (historyItem.status === 'completed') {
            statusText = '已完成';
            statusClass = 'bg-green-500 text-white';
        } else if (historyItem.status === 'deleted') {
            statusText = '已删除';
            statusClass = 'bg-accent text-white';
        }
        
        // 获取标签颜色
        const tagClass = getTagColor(historyItem.tag);
        
        // 构建详情HTML
        let detailHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="text-lg font-medium text-neutral-dark mb-2">${historyItem.text}</h4>
                    <div class="flex items-center flex-wrap gap-2">
                        <span class="text-sm text-secondary">状态：</span>
                        <span class="text-xs px-2 py-1 rounded-full ${statusClass}">${statusText}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${tagClass}">${historyItem.tag}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-secondary mb-1">截止日期</p>
                        <p class="font-medium">${formattedDeadline}</p>
                    </div>
                    <div>
                        <p class="text-sm text-secondary mb-1">${historyItem.status === 'completed' ? '完成时间' : '删除时间'}</p>
                        <p class="font-medium">${formattedTimestamp}</p>
                    </div>
                </div>
        `;
        
        // 如果有备注，显示备注信息
        if (historyItem.note && historyItem.note.trim() !== '') {
            detailHTML += `
                <div>
                    <p class="text-sm text-secondary mb-1">备注</p>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p>${historyItem.note}</p>
                    </div>
                </div>
            `;
        }
        
        detailHTML += `</div>`;
        
        historyDetailContent.innerHTML = detailHTML;
    }
    
    function clearHistory() {
        // 显示确认对话框
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            // 清空历史记录
            historyTodos = [];
            
            // 保存到localStorage
            saveHistoryTodos();
            
            // 重新渲染历史记录列表
            renderHistoryList();
            
            // 显示成功提示
            showToast('历史记录已清空');
        }
    }
    
    function deleteHistoryItem(historyId, element) {
        // 显示确认对话框
        if (confirm('确定要删除这条历史记录吗？此操作不可恢复。')) {
            // 添加删除动画
            element.classList.add('slide-out');
            
            // 等待动画完成后删除
            setTimeout(() => {
                // 从数组中删除
                const index = historyTodos.findIndex(item => item.historyId === historyId);
                if (index !== -1) {
                    historyTodos.splice(index, 1);
                    
                    // 保存到localStorage
                    saveHistoryTodos();
                    
                    // 重新渲染历史记录列表
                    renderHistoryList();
                    
                    // 显示成功提示
                    showToast('历史记录已删除');
                }
            }, 300);
        }
    }
    
    function setupDragAndDrop() {
        historyHeader.addEventListener('mousedown', startDrag);
        historyHeader.addEventListener('touchstart', startDrag, { passive: false });
        
        function startDrag(e) {
            e.preventDefault();
            
            isDragging = true;
            historyContainer.style.cursor = 'grabbing';
            
            if (e.type === 'mousedown') {
                startX = e.clientX;
                startY = e.clientY;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
            } else {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('touchend', stopDrag);
            }
            
            const rect = historyContainer.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }
        
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            
            let clientX, clientY;
            if (e.type === 'mousemove') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            historyContainer.style.left = `${startLeft + dx}px`;
            historyContainer.style.top = `${startTop + dy}px`;
            historyContainer.style.transform = 'none';
        }
        
        function stopDrag() {
            isDragging = false;
            historyContainer.style.cursor = '';
            
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }
    }
    
    function saveFilterState() {
        const filterState = {
            timeFilter: timeFilter.value,
            statusFilter: statusFilter.value
        };
        localStorage.setItem('historyFilterState', JSON.stringify(filterState));
    }
    
    function loadFilterState() {
        const savedFilterState = JSON.parse(localStorage.getItem('historyFilterState'));
        if (savedFilterState) {
            timeFilter.value = savedFilterState.timeFilter || 'all';
            statusFilter.value = savedFilterState.statusFilter || 'all';
        }
    }
    
    // 开发者工具相关函数
    function addDevToolsEventListeners() {
        // 开发者工具按钮点击事件
        devToolsBtn.addEventListener('click', () => {
            openDevToolsModal();
        });
        
        // 关闭按钮点击事件
        devToolsClose.addEventListener('click', () => {
            closeDevToolsModal();
        });
        
        // 遮罩层点击事件
        devToolsOverlay.addEventListener('click', () => {
            closeDevToolsModal();
        });
        
        // 添加已过期待办事项表单提交
        devAddTodoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            devAddTodo();
        });
        
        // 清空所有数据按钮点击事件
        clearAllDataBtn.addEventListener('click', () => {
            clearAllData();
        });
        
        // 导出数据按钮点击事件
        exportDataBtn.addEventListener('click', () => {
            exportData();
        });
        
        // 导入数据按钮点击事件
        importDataBtn.addEventListener('click', () => {
            importDataFile.click();
        });
        
        // 导入数据文件选择事件
        importDataFile.addEventListener('change', (e) => {
            handleImportData(e);
        });
        
        // 添加测试数据按钮点击事件
        addTestDataBtn.addEventListener('click', () => {
            addTestData();
        });
        
        // 更新日志按钮点击事件
        changelogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openChangelogModal();
        });
        
        // 关闭更新日志弹窗
        changelogClose.addEventListener('click', closeChangelogModal);
        changelogOverlay.addEventListener('click', closeChangelogModal);
        

    }
    
    function openDevToolsModal() {
        devToolsModal.classList.remove('hidden');
        
        // 设置默认日期为3天前（示例过期日期）
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        devTodoDate.value = formatDate(threeDaysAgo);
        
        // 添加动画效果
        setTimeout(() => {
            devToolsContainer.classList.add('fade-in');
        }, 10);
    }
    
    function closeDevToolsModal() {
        devToolsContainer.classList.add('slide-out');
        
        setTimeout(() => {
            devToolsModal.classList.add('hidden');
            devToolsContainer.classList.remove('slide-out');
        }, 300);
    }
    
    // 更新日志相关函数
    function openChangelogModal() {
        changelogModal.classList.remove('hidden');
        renderChangelog();
        
        // 添加动画效果
        setTimeout(() => {
            changelogContainer.classList.add('fade-in');
        }, 10);
    }
    
    function closeChangelogModal() {
        changelogContainer.classList.add('slide-out');
        
        setTimeout(() => {
            changelogModal.classList.add('hidden');
            changelogContainer.classList.remove('fade-in', 'slide-out');
        }, 300);
    }
    
    function renderChangelog() {
        const changelogData = [
            {
                version: '1.3.0beta',
                date: '2026-02-14',
                changes: [
                    '添加标签功能，支持从"学习"、"科研"、"其他"三个标签中选择',
                    '为开发者工具中的添加过期待办事项功能添加时间精度选项',
                    '为开发者工具中的添加过期待办事项功能添加标签选择',
                    '更新测试数据生成功能，包含标签信息',
                    '优化界面布局，调整标签显示位置'
                ]
            },
            {
                version: '1.1.0beta',
                date: '2026-02-14',
                changes: [
                    '添加时间精度选择功能，支持精确至天和精确至小时',
                    '优化待办事项列表中剩余时间的显示方式',
                    '在日历界面添加当月任务统计模块',
                    '移除历史记录和开发者选项的拖动功能，添加滚动条',
                    '添加更新日志功能'
                ]
            },
            {
                version: '1.0.0beta',
                date: '2026-02-13',
                changes: [
                    '初始版本发布',
                    '实现待办事项的添加、编辑、删除功能',
                    '支持任务完成状态管理',
                    '添加日历视图',
                    '添加历史记录功能',
                    '添加开发者工具'
                ]
            }
        ];
        
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
    
    function devAddTodo() {
        const text = devTodoInput.value.trim();
        let date = devTodoDate.value;
        const note = devTodoNote.value.trim();
        const tag = document.querySelector('input[name="dev-todo-tag"]:checked').value;
        
        // 验证输入
        if (!text) {
            showToast('请输入待办内容');
            return;
        }
        
        if (!date) {
            showToast('请选择截止日期');
            return;
        }
        
        // 检查时间精度选择
        const selectedPrecision = document.querySelector('input[name="dev-time-precision"]:checked').value;
        if (selectedPrecision === 'hour') {
            const hour = document.getElementById('dev-todo-hour').value.padStart(2, '0');
            const minute = document.getElementById('dev-todo-minute').value.padStart(2, '0');
            date += `T${hour}:${minute}:00`;
        }
        
        // 添加新的待办事项
        const newTodo = {
            text,
            date,
            note,
            tag,
            id: Date.now() // 添加唯一ID
        };
        
        todos.push(newTodo);
        
        // 保存到localStorage
        saveTodos();
        
        // 重新渲染日历和待办列表
        renderCalendar();
        renderTodoList();
        
        // 清空输入框
        devTodoInput.value = '';
        devTodoNote.value = '';
        
        // 显示成功提示
        showToast('待办事项添加成功（开发者模式）');
        
        // 添加事件监听器
        addButtonListeners();
    }
    
    function clearAllData() {
        // 显示确认对话框
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            // 清空所有数据
            todos = [];
            historyTodos = [];
            
            // 清空localStorage
            localStorage.removeItem('todos');
            localStorage.removeItem('historyTodos');
            localStorage.removeItem('historyFilterState');
            
            // 重新渲染日历和待办列表
            renderCalendar();
            renderTodoList();
            
            // 显示成功提示
            showToast('所有数据已清空');
        }
    }
    
    function exportData() {
        // 准备导出数据
        const exportData = {
            todos: todos,
            historyTodos: historyTodos,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // 转换为JSON字符串
        const dataStr = JSON.stringify(exportData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-app-data-${formatDate(new Date())}.json`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // 显示成功提示
        showToast('数据导出成功');
    }
    
    function handleImportData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 创建FileReader对象
        const reader = new FileReader();
        
        // 文件读取完成事件
        reader.onload = (e) => {
            try {
                // 解析JSON数据
                const importData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!importData.todos || !Array.isArray(importData.todos)) {
                    throw new Error('无效的数据格式');
                }
                
                // 显示确认对话框
                if (confirm('确定要导入数据吗？当前数据将被覆盖！')) {
                    // 导入数据
                    todos = importData.todos || [];
                    historyTodos = importData.historyTodos || [];
                    
                    // 保存到localStorage
                    saveTodos();
                    saveHistoryTodos();
                    
                    // 重新渲染日历和待办列表
                    renderCalendar();
                    renderTodoList();
                    
                    // 显示成功提示
                    showToast('数据导入成功');
                }
            } catch (error) {
                console.error('导入数据失败:', error);
                showToast('导入数据失败：' + error.message);
            }
        };
        
        // 读取文件
        reader.readAsText(file);
        
        // 重置文件输入
        e.target.value = '';
    }
    
    function addTestData() {
        // 创建测试数据
        const now = new Date();
        const testTodos = [
            // 已过期的任务（精确至天）
            {
                text: '完成大作业',
                date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)), // 2天前
                note: '这是一个已过期的测试任务（精确至天）',
                tag: '学习',
                id: Date.now() + 1
            },
            // 已过期的任务（精确至小时）
            {
                text: '做实验并数据造假',
                date: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)) + 'T09:00:00', // 昨天上午9点
                note: '这是一个已过期的测试任务（精确至小时）',
                tag: '科研',
                id: Date.now() + 2
            },
            // 今天的任务（精确至天）
            {
                text: '打两把cfm',
                date: formatDate(new Date()), // 今天
                note: '这是今天的测试任务（精确至天）',
                tag: '其他',
                id: Date.now() + 3
            },
            // 今天的任务（精确至小时）
            {
                text: '找导师签月工作记录表',
                date: formatDate(new Date()) + 'T14:30:00', // 今天下午2:30
                note: '这是今天的测试任务（精确至小时）',
                tag: '科研',
                id: Date.now() + 4
            },
            // 明天的任务（精确至天）
            {
                text: '组会',
                date: formatDate(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)), // 明天
                note: '需要准备PPT和讲稿（精确至天）',
                tag: '科研',
                id: Date.now() + 5
            },
            // 明天的任务（精确至小时）
            {
                text: 'xx考试',
                date: formatDate(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)) + 'T10:00:00', // 明天上午10点
                note: '需要提前准备（精确至小时）',
                tag: '其他',
                id: Date.now() + 6
            },
            // 未来的任务（精确至天）
            {
                text: '和小飞象玩耍',
                date: formatDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)), // 3天后
                note: '小飞象一定是个好人，不对，好象🐘（精确至天）',
                tag: '其他',
                id: Date.now() + 7
            },
            // 未来的任务（精确至小时）
            {
                text: 'xxx生日聚会',
                date: formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) + 'T18:00:00', // 7天后晚上6点
                note: '记得带礼物（精确至小时）',
                tag: '其他',
                id: Date.now() + 8
            },
            // 额外的学习任务
            {
                text: '复习英语单词',
                date: formatDate(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)), // 2天后
                note: '每天坚持复习100个单词',
                tag: '学习',
                id: Date.now() + 9
            },
            // 额外的科研任务
            {
                text: '阅读论文',
                date: formatDate(new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)) + 'T15:00:00', // 4天后下午3点
                note: '把论文发给豆包让她生成总结',
                tag: '科研',
                id: Date.now() + 10
            }
        ];
        
        // 添加测试数据
        todos = [...todos, ...testTodos];
        
        // 保存到localStorage
        saveTodos();
        
        // 重新渲染日历和待办列表
        renderCalendar();
        renderTodoList();
        
        // 添加事件监听器
        addButtonListeners();
        
        // 显示成功提示
        showToast('测试数据添加成功');
    }
    
    function setupDevToolsDragAndDrop() {
        devToolsHeader.addEventListener('mousedown', startDrag);
        devToolsHeader.addEventListener('touchstart', startDrag, { passive: false });
        
        function startDrag(e) {
            e.preventDefault();
            
            isDragging = true;
            devToolsContainer.style.cursor = 'grabbing';
            
            if (e.type === 'mousedown') {
                startX = e.clientX;
                startY = e.clientY;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
            } else {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('touchend', stopDrag);
            }
            
            const rect = devToolsContainer.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }
        
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            
            let clientX, clientY;
            if (e.type === 'mousemove') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            devToolsContainer.style.left = `${startLeft + dx}px`;
            devToolsContainer.style.top = `${startTop + dy}px`;
            devToolsContainer.style.transform = 'none';
        }
        
        function stopDrag() {
            isDragging = false;
            devToolsContainer.style.cursor = '';
            
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }
    }
});
