// 天选之子工具核心脚本

class TianXuanZhiZi {
    constructor() {
        // 数据存储
        this.originalList = []; // 原始名单
        this.extractionPool = []; // 抽取池
        this.extractedList = []; // 已抽取人员
        this.isExtracting = false; // 是否正在抽取
        this.rollingInterval = null; // 滚动动画定时器
        this.currentRollIndex = 0; // 当前滚动索引
        
        // 配置参数
        this.config = {
            extractType: 'id', // 抽取类型：id, name, both
            extractCount: 1, // 抽取人数
            noRepeat: true, // 是否不重复抽取
            scrollSpeed: 100, // 滚动速度（毫秒）
            scrollDuration: 3, // 滚动持续时间（秒）
            currentListName: '' // 当前名单名称
        };
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        this.bindEvents();
        this.loadSavedLists();
        this.loadState(); // 加载保存的状态
        this.bindHistoryEvents(); // 绑定历史记录事件
    }
    
    // 保存当前状态到localStorage
    saveState() {
        try {
            const state = {
                config: this.config,
                originalList: this.originalList,
                extractionPool: this.extractionPool,
                extractedList: this.extractedList,
                uiState: {
                    startId: document.getElementById('start-id').value,
                    endId: document.getElementById('end-id').value,
                    listName: document.getElementById('list-name').value,
                    savedList: document.getElementById('saved-lists').value,
                    extractCount: document.getElementById('extract-count').value,
                    scrollSpeed: document.getElementById('scroll-speed').value,
                    scrollDuration: document.getElementById('scroll-duration').value,
                    skipHeader: document.getElementById('skip-header').checked
                },
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('tianxuanzhizi_state', JSON.stringify(state));
            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
    
    // 从localStorage加载状态
    loadState() {
        try {
            const savedState = localStorage.getItem('tianxuanzhizi_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // 恢复配置
                if (state.config) {
                    this.config = { ...this.config, ...state.config };
                }
                
                // 恢复数据列表
                if (state.originalList) {
                    this.originalList = state.originalList;
                }
                if (state.extractionPool) {
                    this.extractionPool = state.extractionPool;
                }
                if (state.extractedList) {
                    this.extractedList = state.extractedList;
                }
                
                // 恢复UI状态
                if (state.uiState) {
                    const ui = state.uiState;
                    if (ui.startId) document.getElementById('start-id').value = ui.startId;
                    if (ui.endId) document.getElementById('end-id').value = ui.endId;
                    if (ui.listName) document.getElementById('list-name').value = ui.listName;
                    if (ui.savedList) document.getElementById('saved-lists').value = ui.savedList;
                    if (ui.extractCount) document.getElementById('extract-count').value = ui.extractCount;
                    if (ui.scrollSpeed) {
                        document.getElementById('scroll-speed').value = ui.scrollSpeed;
                        // 同时更新显示值
                        const speedValue = document.getElementById('speed-value');
                        if (speedValue) speedValue.textContent = ui.scrollSpeed;
                    }
                    if (ui.scrollDuration) {
                        document.getElementById('scroll-duration').value = ui.scrollDuration;
                        // 同时更新显示值
                        const durationValue = document.getElementById('duration-value');
                        if (durationValue) durationValue.textContent = ui.scrollDuration;
                    }
                    if (typeof ui.skipHeader === 'boolean') document.getElementById('skip-header').checked = ui.skipHeader;
                    
                    // 恢复抽取类型单选按钮
                    if (this.config.extractType) {
                        const radio = document.querySelector(`input[name="extract-type"][value="${this.config.extractType}"]`);
                        if (radio) radio.checked = true;
                    }
                    
                    // 恢复不重复抽取复选框
                    if (typeof this.config.noRepeat === 'boolean') {
                        document.getElementById('no-repeat').checked = this.config.noRepeat;
                    }
                }
                
                // 更新UI
                this.updateExtractedList();
                this.loadSavedLists();
                
                console.log('State loaded successfully');
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }
    
    // 清空保存的状态
    clearSavedState() {
        try {
            localStorage.removeItem('tianxuanzhizi_state');
            console.log('Saved state cleared');
        } catch (error) {
            console.error('Error clearing saved state:', error);
        }
    }
    
    // 绑定事件
    bindEvents() {
        const self = this;
        // 文件上传事件
        document.getElementById('txt-upload').addEventListener('change', function(e) { self.handleTxtUpload(e); });
        document.getElementById('excel-upload').addEventListener('change', function(e) { self.handleExcelUpload(e); });
        
        // 学号范围生成
        document.getElementById('generate-ids').addEventListener('click', function() { self.generateIds(); });
        
        // 名单操作
        document.getElementById('remove-duplicates').addEventListener('click', function() { self.removeDuplicates(); });
        document.getElementById('reset-pool').addEventListener('click', function() { self.resetPool(); });
        
        // 多名单管理
        document.getElementById('save-list').addEventListener('click', function() { self.saveList(); });
        document.getElementById('load-list').addEventListener('click', function() { self.loadList(); });
        document.getElementById('edit-list').addEventListener('click', function() { self.editList(); });
        document.getElementById('delete-list').addEventListener('click', function() { self.deleteList(); });
        
        // 抽取设置
        document.querySelectorAll('input[name="extract-type"]').forEach(radio => {
            radio.addEventListener('change', function(e) {
                self.config.extractType = e.target.value;
                self.saveState(); // 保存状态
            });
        });
        
        document.getElementById('extract-count').addEventListener('change', function(e) {
            self.config.extractCount = parseInt(e.target.value) || 1;
            self.saveState(); // 保存状态
        });
        
        document.getElementById('no-repeat').addEventListener('change', function(e) {
            self.config.noRepeat = e.target.checked;
            self.saveState(); // 保存状态
        });
        
        document.getElementById('scroll-speed').addEventListener('input', function(e) {
            self.config.scrollSpeed = parseInt(e.target.value);
            self.saveState(); // 保存状态
        });
        
        document.getElementById('scroll-duration').addEventListener('input', function(e) {
            self.config.scrollDuration = parseInt(e.target.value);
            self.saveState(); // 保存状态
        });
        
        // UI输入变化时保存
        const uiInputs = ['start-id', 'end-id', 'list-name'];
        uiInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', function() {
                    self.saveState(); // 保存状态
                });
            }
        });
        
        // 下拉选择变化时保存
        document.getElementById('saved-lists').addEventListener('change', function() {
            self.saveState(); // 保存状态
        });
        
        // 复选框变化时保存
        document.getElementById('skip-header').addEventListener('change', function() {
            self.saveState(); // 保存状态
        });
        
        // 开始抽取
        document.getElementById('start-extraction').addEventListener('click', function() { self.startExtraction(); });
        
        // 结果弹窗
        document.getElementById('result-confirm').addEventListener('click', function() {
            closeModal('result-modal');
        });
        
        // 确认弹窗
        document.getElementById('confirm-ok').addEventListener('click', function() { self.handleConfirm(); });
        document.getElementById('confirm-cancel').addEventListener('click', function() {
            closeModal('confirm-modal');
        });
        
        // 编辑名单弹窗
        document.getElementById('edit-list-save').addEventListener('click', function() { self.saveEditedList(); });
        document.getElementById('edit-list-cancel').addEventListener('click', function() {
            closeModal('edit-list-modal');
        });
        
        // 开发者工具
        document.getElementById('clear-all').addEventListener('click', function() { self.clearAll(); });
        document.getElementById('add-test-data').addEventListener('click', function() { self.addTestData(); });
    }
    
    // 处理TXT文件上传
    handleTxtUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseTxtContent(content);
        };
        reader.readAsText(file, 'UTF-8');
    }
    
    // 解析TXT内容
    parseTxtContent(content) {
        // 自动识别分隔符
        let separator = '\n'; // 默认换行
        if (content.includes(',')) {
            separator = ',';
        } else if (content.includes(' ')) {
            separator = ' ';
        }
        
        // 分割内容
        const lines = content.split(separator).filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            this.showMessage('无法识别分隔符，请手动调整文件', 'error');
            return;
        }
        
        // 解析为人员列表
        this.originalList = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                id: parts[0],
                name: parts.length > 1 ? parts.slice(1).join(' ') : ''
            };
        });
        
        this.extractionPool = [...this.originalList];
        this.extractedList = [];
        this.updateExtractedList();
        this.saveState(); // 保存状态
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.IMPORT,
            description: `导入了 ${this.originalList.length} 条记录`,
            details: {
                fileType: 'txt',
                recordCount: this.originalList.length
            }
        });
        
        this.showMessage(`成功导入 ${this.originalList.length} 条记录`, 'success');
    }
    
    // 处理Excel文件上传
    handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
            this.showMessage('请上传有效的Excel文件', 'error');
            return;
        }
        
        this.showMessage('Excel文件导入功能需要依赖ExcelJS库，暂不支持', 'error');
        // 实际项目中可以使用ExcelJS库来处理Excel文件
    }
    
    // 生成学号列表
    generateIds() {
        const startId = parseInt(document.getElementById('start-id').value);
        const endId = parseInt(document.getElementById('end-id').value);
        
        if (isNaN(startId) || isNaN(endId) || startId > endId) {
            this.showMessage('请输入有效的学号范围', 'error');
            return;
        }
        
        this.originalList = [];
        for (let i = startId; i <= endId; i++) {
            this.originalList.push({ id: i.toString(), name: '' });
        }
        
        this.extractionPool = [...this.originalList];
        this.extractedList = [];
        this.updateExtractedList();
        this.saveState(); // 保存状态
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.GENERATE_IDS,
            description: `生成了 ${this.originalList.length} 个学号`,
            details: {
                startId: startId,
                endId: endId,
                recordCount: this.originalList.length
            }
        });
        
        this.showMessage(`成功生成 ${this.originalList.length} 个学号`, 'success');
    }
    
    // 去重
    removeDuplicates() {
        if (this.originalList.length === 0) {
            this.showMessage('名单为空，无需去重', 'info');
            return;
        }
        
        const uniqueList = [];
        const seen = new Set();
        
        for (const item of this.originalList) {
            const key = `${item.id}-${item.name}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueList.push(item);
            }
        }
        
        const removedCount = this.originalList.length - uniqueList.length;
        this.originalList = uniqueList;
        this.extractionPool = [...this.originalList];
        this.saveState(); // 保存状态
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.REMOVE_DUPLICATES,
            description: `删除了 ${removedCount} 条重复记录`,
            details: {
                removedCount: removedCount,
                remainingCount: uniqueList.length
            }
        });
        
        this.showMessage(`已删除 ${removedCount} 条重复记录`, 'success');
    }
    
    // 重置抽取池
    resetPool() {
        this.extractionPool = [...this.originalList];
        this.extractedList = [];
        this.updateExtractedList();
        this.saveState(); // 保存状态
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.RESET_POOL,
            description: '重置了抽取池',
            details: {
                poolSize: this.extractionPool.length
            }
        });
        
        this.showMessage('抽取池已重置，所有人员可重新参与抽取', 'success');
    }
    
    // 保存当前名单
    saveList() {
        const listName = document.getElementById('list-name').value.trim();
        if (!listName) {
            this.showMessage('请输入名单名称', 'error');
            return;
        }
        
        if (this.originalList.length === 0) {
            this.showMessage('名单为空，无法保存', 'error');
            return;
        }
        
        const listData = {
            name: listName,
            data: this.originalList,
            timestamp: new Date().toISOString()
        };
        
        // 获取已保存的名单
        let savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        savedLists[listName] = listData;
        
        // 保存到本地存储
        localStorage.setItem('tianxuanzhizi_lists', JSON.stringify(savedLists));
        
        this.config.currentListName = listName;
        this.loadSavedLists();
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.SAVE_LIST,
            description: `保存了名单 "${listName}"`,
            details: {
                listName: listName,
                recordCount: this.originalList.length
            }
        });
        
        this.showMessage(`名单 "${listName}" 保存成功`, 'success');
    }
    
    // 加载已保存的名单
    loadSavedLists() {
        const savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        const select = document.getElementById('saved-lists');
        
        // 清空现有选项
        select.innerHTML = '<option value="">选择名单</option>';
        
        // 添加已保存的名单
        for (const [name, listData] of Object.entries(savedLists)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        }
    }
    
    // 加载选中的名单
    loadList() {
        const listName = document.getElementById('saved-lists').value;
        if (!listName) {
            this.showMessage('请选择要加载的名单', 'error');
            return;
        }
        
        const savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        const listData = savedLists[listName];
        
        if (listData) {
            this.originalList = listData.data;
            this.extractionPool = [...this.originalList];
            this.extractedList = [];
            this.config.currentListName = listName;
            document.getElementById('list-name').value = listName;
            this.updateExtractedList();
            this.saveState(); // 保存状态
            
            // 添加历史记录
            this.addHistory({
                operation: TianXuanZhiZi.OPERATION_TYPES.LOAD_LIST,
                description: `加载了名单 "${listName}"`,
                details: {
                    listName: listName,
                    recordCount: listData.data.length
                }
            });
            
            this.showMessage(`名单 "${listName}" 加载成功`, 'success');
        }
    }
    
    // 编辑名单
    editList() {
        const listName = document.getElementById('saved-lists').value;
        if (!listName) {
            this.showMessage('请选择要编辑的名单', 'error');
            return;
        }
        
        const savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        const listData = savedLists[listName];
        
        if (listData) {
            // 填充编辑弹窗
            document.getElementById('edit-list-name').value = listData.name;
            
            // 将名单数据转换为文本格式
            let content = '';
            listData.data.forEach(item => {
                if (item.name) {
                    content += `${item.id} ${item.name}\n`;
                } else {
                    content += `${item.id}\n`;
                }
            });
            document.getElementById('edit-list-content').value = content.trim();
            
            // 保存当前编辑的名单名称
            this.currentEditingList = listName;
            
            // 打开编辑弹窗
            openModal('edit-list-modal');
        }
    }
    
    // 保存编辑后的名单
    saveEditedList() {
        const oldName = this.currentEditingList;
        if (!oldName) return;
        
        const newName = document.getElementById('edit-list-name').value.trim();
        if (!newName) {
            this.showMessage('请输入名单名称', 'error');
            return;
        }
        
        const content = document.getElementById('edit-list-content').value.trim();
        if (!content) {
            this.showMessage('名单内容不能为空', 'error');
            return;
        }
        
        // 解析编辑后的内容
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const newData = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                id: parts[0],
                name: parts.length > 1 ? parts.slice(1).join(' ') : ''
            };
        });
        
        // 保存到本地存储
        const savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        
        // 删除旧名单
        if (oldName !== newName) {
            delete savedLists[oldName];
        }
        
        // 添加新名单
        savedLists[newName] = {
            name: newName,
            data: newData,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('tianxuanzhizi_lists', JSON.stringify(savedLists));
        
        // 重新加载名单
        this.loadSavedLists();
        
        // 如果当前正在使用的是被编辑的名单，更新当前数据
        if (this.config.currentListName === oldName) {
            this.originalList = newData;
            this.extractionPool = [...this.originalList];
            this.extractedList = [];
            this.config.currentListName = newName;
            document.getElementById('list-name').value = newName;
            this.updateExtractedList();
            this.saveState();
        }
        
        // 关闭弹窗
        closeModal('edit-list-modal');
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.EDIT_LIST,
            description: `编辑了名单 "${newName}"`,
            details: {
                oldName: oldName,
                newName: newName,
                recordCount: newData.length
            }
        });
        
        // 显示成功消息
        this.showMessage(`名单 "${newName}" 编辑成功`, 'success');
    }
    
    // 删除名单
    deleteList() {
        const listName = document.getElementById('saved-lists').value;
        if (!listName) {
            this.showMessage('请选择要删除的名单', 'error');
            return;
        }
        
        this.showConfirm('确定要删除该名单吗？', () => {
            const savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
            if (savedLists[listName]) {
                delete savedLists[listName];
                localStorage.setItem('tianxuanzhizi_lists', JSON.stringify(savedLists));
                this.loadSavedLists();
                
                // 添加历史记录
                this.addHistory({
                    operation: TianXuanZhiZi.OPERATION_TYPES.DELETE_LIST,
                    description: `删除了名单 "${listName}"`
                });
                
                this.showMessage(`名单 "${listName}" 已删除`, 'success');
            }
        });
    }
    
    // 开始抽取
    startExtraction() {
        console.log('startExtraction called, this:', this);
        console.log('isExtracting:', this.isExtracting);
        console.log('extractionPool length:', this.extractionPool.length);
        
        // 检查是否正在抽取
        if (this.isExtracting) {
            console.log('Already extracting, returning');
            return;
        }
        
        // 检查抽取池是否为空
        if (this.extractionPool.length === 0) {
            this.showMessage('抽取池为空，请先导入名单', 'error');
            return;
        }
        
        // 强制更新所有配置
        const extractTypeRadio = document.querySelector('input[name="extract-type"]:checked');
        this.config.extractType = extractTypeRadio ? extractTypeRadio.value : 'id';
        this.config.extractCount = parseInt(document.getElementById('extract-count').value) || 1;
        this.config.noRepeat = document.getElementById('no-repeat').checked;
        this.config.scrollSpeed = parseInt(document.getElementById('scroll-speed').value);
        this.config.scrollDuration = parseInt(document.getElementById('scroll-duration').value);
        
        console.log('Updated config:', this.config);
        
        // 限制抽取人数
        const maxExtractable = this.extractionPool.length;
        if (this.config.extractCount > maxExtractable) {
            this.config.extractCount = maxExtractable;
            document.getElementById('extract-count').value = maxExtractable;
            this.showMessage(`抽取人数已调整为 ${maxExtractable}（抽取池最大容量）`, 'info');
        }
        
        // 标记为正在抽取
        this.isExtracting = true;
        console.log('Set isExtracting to:', this.isExtracting);
        
        // 开始滚动动画
        this.startRolling();
        
        // 保存当前实例引用
        const currentInstance = this;
        console.log('Saving current instance:', currentInstance);
        
        // 设定抽取结束时间
        setTimeout(function() {
            console.log('Timeout callback executed');
            console.log('Current instance in timeout:', currentInstance);
            if (!currentInstance) {
                console.log('Current instance is null or undefined, skipping');
                return;
            }
            console.log('Calling forceStopExtraction on current instance');
            // 直接执行抽取逻辑
            currentInstance.forceStopExtraction();
        }, currentInstance.config.scrollDuration * 1000);
    }
    
    // 强制停止抽取（备用方法）
    forceStopExtraction() {
        console.log('forceStopExtraction called, this:', this);
        
        // 清除滚动定时器
        if (this.rollingInterval) {
            clearInterval(this.rollingInterval);
            this.rollingInterval = null;
        }
        
        // 执行抽取
        const results = [];
        console.log('Starting extraction in forceStopExtraction');
        console.log('extractCount:', this.config.extractCount);
        console.log('extractionPool length:', this.extractionPool.length);
        
        for (let i = 0; i < this.config.extractCount; i++) {
            if (this.extractionPool.length === 0) {
                console.log('Extraction pool empty, breaking');
                break;
            }
            
            const randomIndex = Math.floor(Math.random() * this.extractionPool.length);
            const selectedItem = this.extractionPool[randomIndex];
            results.push(selectedItem);
            console.log('Selected item:', selectedItem);
            
            // 从抽取池中移除（如果设置了不重复抽取）
            if (this.config.noRepeat) {
                this.extractionPool.splice(randomIndex, 1);
                this.extractedList.push(selectedItem);
                console.log('Added to extractedList, length:', this.extractedList.length);
            }
        }
        
        // 更新滚动显示
        const rollingContent = document.getElementById('rolling-content');
        if (results.length > 0) {
            rollingContent.textContent = this.formatExtractionItem(results[results.length - 1]);
            console.log('Updated rolling content to:', results[results.length - 1]);
        }
        
        // 重置状态
        this.isExtracting = false;
        console.log('Set isExtracting to:', this.isExtracting);
        
        // 更新已抽取列表
        this.updateExtractedList();
        console.log('Updated extracted list');
        
        // 显示结果
        if (results.length > 0) {
            console.log('Showing extraction results:', results);
            this.showExtractionResults(results);
            this.saveToHistory(results);
            this.saveState(); // 保存状态
        }
    }
    
    // 开始滚动动画
    startRolling() {
        const rollingContent = document.getElementById('rolling-content');
        rollingContent.textContent = '';
        
        this.rollingInterval = setInterval(() => {
            this.currentRollIndex = (this.currentRollIndex + 1) % this.extractionPool.length;
            const item = this.extractionPool[this.currentRollIndex];
            rollingContent.textContent = this.formatExtractionItem(item);
        }, this.config.scrollSpeed);
    }
    
    // 停止抽取（保留作为兼容方法）
    stopExtraction() {
        console.log('stopExtraction called, redirecting to forceStopExtraction');
        this.forceStopExtraction();
    }
    
    // 格式化抽取项
    formatExtractionItem(item) {
        switch (this.config.extractType) {
            case 'id':
                return item.id;
            case 'name':
                return item.name || item.id;
            case 'both':
                return item.name ? `${item.id} - ${item.name}` : item.id;
            default:
                return item.id;
        }
    }
    
    // 显示抽取结果
    showExtractionResults(results) {
        console.log('showExtractionResults called, results:', results);
        if (results.length === 0) {
            console.log('No results, returning');
            return;
        }
        
        const resultContent = document.getElementById('result-content');
        const resultSummary = document.getElementById('result-summary');
        
        if (results.length === 1) {
            // 单个结果
            resultContent.textContent = this.formatExtractionItem(results[0]);
            resultSummary.classList.add('hidden');
            openModal('result-modal');
        } else {
            // 多个结果，逐个显示
            let currentIndex = 0;
            const showNextResult = () => {
                if (currentIndex < results.length) {
                    resultContent.textContent = this.formatExtractionItem(results[currentIndex]);
                    resultSummary.classList.add('hidden');
                    openModal('result-modal');
                    
                    setTimeout(() => {
                        closeModal('result-modal');
                        currentIndex++;
                        
                        if (currentIndex < results.length) {
                            showNextResult();
                        } else {
                            // 显示汇总结果
                            const summaryText = '本次抽中：' + results.map(item => this.formatExtractionItem(item)).join('、');
                            resultContent.textContent = '抽取完成';
                            resultSummary.textContent = summaryText;
                            resultSummary.classList.remove('hidden');
                            openModal('result-modal');
                        }
                    }, 1000);
                }
            };
            
            showNextResult();
        }
    }
    
    // 更新已抽取列表
    updateExtractedList() {
        const extractedList = document.getElementById('extracted-list');
        
        if (this.extractedList.length === 0) {
            // 清空列表并添加空状态
            extractedList.innerHTML = `
                <div class="text-center text-secondary py-8" id="empty-extracted">
                    <i class="fa fa-user-o text-4xl mb-3 opacity-50"></i>
                    <p>暂无抽取记录</p>
                </div>
            `;
        } else {
            // 清空列表并添加抽取记录
            extractedList.innerHTML = '';
            
            this.extractedList.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'extracted-item';
                itemElement.innerHTML = `
                    <div class="extracted-info">
                        <div class="extracted-id">${item.id}</div>
                        ${item.name ? `<div class="extracted-name">${item.name}</div>` : ''}
                    </div>
                `;
                extractedList.appendChild(itemElement);
            });
        }
    }
    

    
    // 操作类型常量
    static get OPERATION_TYPES() {
        return {
            EXTRACT: 'extract',
            IMPORT: 'import',
            GENERATE_IDS: 'generate_ids',
            REMOVE_DUPLICATES: 'remove_duplicates',
            RESET_POOL: 'reset_pool',
            SAVE_LIST: 'save_list',
            LOAD_LIST: 'load_list',
            EDIT_LIST: 'edit_list',
            DELETE_LIST: 'delete_list',
            ADD_TEST_DATA: 'add_test_data',
            CLEAR_ALL: 'clear_all'
        };
    }
    
    // 保存到历史记录（抽取操作专用）
    saveToHistory(results) {
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.EXTRACT,
            results: results,
            config: { ...this.config },
            listName: this.config.currentListName,
            description: `抽取了 ${results.length} 人`
        });
    }
    
    // 添加通用历史记录
    addHistory(data) {
        try {
            const history = JSON.parse(localStorage.getItem('tianxuanzhizi_history') || '[]');
            
            const historyItem = {
                timestamp: new Date().toISOString(),
                operation: data.operation,
                results: data.results,
                config: data.config,
                listName: data.listName || this.config.currentListName,
                description: data.description || '',
                details: data.details || {}
            };
            
            history.unshift(historyItem);
            if (history.length > 100) { // 增加历史记录限制
                history.pop();
            }
            
            localStorage.setItem('tianxuanzhizi_history', JSON.stringify(history));
            console.log('History added:', historyItem);
        } catch (error) {
            console.error('Error adding history:', error);
        }
    }
    
    // 获取历史记录
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('tianxuanzhizi_history') || '[]');
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
    
    // 删除历史记录
    deleteHistory(index) {
        try {
            const history = this.getHistory();
            if (index >= 0 && index < history.length) {
                history.splice(index, 1);
                localStorage.setItem('tianxuanzhizi_history', JSON.stringify(history));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting history:', error);
            return false;
        }
    }
    
    // 清空历史记录
    clearHistory() {
        try {
            localStorage.removeItem('tianxuanzhizi_history');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // 删除符合筛选条件的历史记录
    deleteFilteredHistory(timeFilter, operationFilter) {
        try {
            let history = this.getHistory();
            const originalLength = history.length;
            
            // 应用与渲染相同的筛选逻辑
            if (timeFilter !== 'all') {
                const now = new Date();
                history = history.filter(item => {
                    const itemDate = new Date(item.timestamp);
                    switch (timeFilter) {
                        case 'today':
                            return itemDate.toDateString() === now.toDateString();
                        case 'week':
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            return itemDate >= weekAgo;
                        case 'month':
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            return itemDate >= monthAgo;
                        default:
                            return true;
                    }
                });
            }
            
            if (operationFilter !== 'all') {
                history = history.filter(item => item.operation === operationFilter);
            }
            
            // 获取要保留的历史记录（反向筛选）
            const allHistory = this.getHistory();
            const filteredHistory = allHistory.filter(item => {
                let keep = true;
                
                if (timeFilter !== 'all') {
                    const now = new Date();
                    const itemDate = new Date(item.timestamp);
                    switch (timeFilter) {
                        case 'today':
                            keep = itemDate.toDateString() !== now.toDateString();
                            break;
                        case 'week':
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            keep = itemDate < weekAgo;
                            break;
                        case 'month':
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            keep = itemDate < monthAgo;
                            break;
                    }
                }
                
                if (keep && operationFilter !== 'all') {
                    keep = item.operation !== operationFilter;
                }
                
                return keep;
            });
            
            // 保存更新后的历史记录
            localStorage.setItem('tianxuanzhizi_history', JSON.stringify(filteredHistory));
            
            const deletedCount = originalLength - filteredHistory.length;
            return {
                success: true,
                deletedCount: deletedCount
            };
        } catch (error) {
            console.error('Error deleting filtered history:', error);
            return {
                success: false,
                deletedCount: 0
            };
        }
    }
    
    // 渲染历史记录
    renderHistory(filters = { time: 'all', operation: 'all' }) {
        const historyList = document.getElementById('history-list');
        const emptyHistory = document.getElementById('empty-history');
        
        let history = this.getHistory();
        
        // 应用筛选
        if (filters.time !== 'all') {
            const now = new Date();
            history = history.filter(item => {
                const itemDate = new Date(item.timestamp);
                switch (filters.time) {
                    case 'today':
                        return itemDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return itemDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return itemDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        if (filters.operation !== 'all') {
            history = history.filter(item => item.operation === filters.operation);
        }
        
        if (history.length === 0) {
            // 创建新的空状态元素
            const emptyStateHtml = `
                <div class="text-center text-secondary py-8" id="empty-history">
                    <i class="fa fa-clock-o text-4xl mb-3 opacity-50"></i>
                    <p>暂无历史记录</p>
                </div>
            `;
            historyList.innerHTML = emptyStateHtml;
        } else {
            historyList.innerHTML = '';
            
            history.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'bg-white rounded-lg p-4 shadow-sm border border-gray-100';
                
                // 操作类型图标
                let icon = 'fa-circle-o';
                let color = 'text-gray-500';
                switch (item.operation) {
                    case TianXuanZhiZi.OPERATION_TYPES.EXTRACT:
                        icon = 'fa-random';
                        color = 'text-primary';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.IMPORT:
                        icon = 'fa-upload';
                        color = 'text-success';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.GENERATE_IDS:
                        icon = 'fa-id-card';
                        color = 'text-info';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.REMOVE_DUPLICATES:
                        icon = 'fa-refresh';
                        color = 'text-warning';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.RESET_POOL:
                        icon = 'fa-recycle';
                        color = 'text-info';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.SAVE_LIST:
                        icon = 'fa-save';
                        color = 'text-success';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.LOAD_LIST:
                        icon = 'fa-folder-open';
                        color = 'text-primary';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.EDIT_LIST:
                        icon = 'fa-edit';
                        color = 'text-warning';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.DELETE_LIST:
                        icon = 'fa-trash';
                        color = 'text-accent';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.ADD_TEST_DATA:
                        icon = 'fa-database';
                        color = 'text-success';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.CLEAR_ALL:
                        icon = 'fa-trash-o';
                        color = 'text-accent';
                        break;
                }
                
                // 格式化时间
                const date = new Date(item.timestamp);
                const formattedTime = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                // 操作类型文本
                let operationText = '未知操作';
                switch (item.operation) {
                    case TianXuanZhiZi.OPERATION_TYPES.EXTRACT:
                        operationText = '抽取';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.IMPORT:
                        operationText = '导入';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.GENERATE_IDS:
                        operationText = '生成学号';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.REMOVE_DUPLICATES:
                        operationText = '去重';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.RESET_POOL:
                        operationText = '重置抽取池';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.SAVE_LIST:
                        operationText = '保存名单';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.LOAD_LIST:
                        operationText = '加载名单';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.EDIT_LIST:
                        operationText = '编辑名单';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.DELETE_LIST:
                        operationText = '删除名单';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.ADD_TEST_DATA:
                        operationText = '添加测试数据';
                        break;
                    case TianXuanZhiZi.OPERATION_TYPES.CLEAR_ALL:
                        operationText = '清空所有';
                        break;
                }
                
                historyItem.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex items-start">
                            <i class="fa ${icon} ${color} text-xl mr-3 mt-1"></i>
                            <div>
                                <div class="flex items-center">
                                    <h4 class="font-medium text-neutral-dark">${operationText}</h4>
                                    <span class="text-xs text-gray-500 ml-2">${formattedTime}</span>
                                </div>
                                <p class="text-sm text-secondary mt-1">${item.description || '无描述'}</p>
                                ${item.listName ? `<p class="text-xs text-gray-500 mt-1">名单: ${item.listName}</p>` : ''}
                                ${item.results && item.results.length > 0 ? `
                                    <div class="mt-2 text-sm">
                                        <span class="font-medium">抽取结果:</span>
                                        <span>${item.results.map(r => r.id + (r.name ? `(${r.name})` : '')).join(', ')}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button class="delete-history-btn text-gray-400 hover:text-accent p-1 rounded-full" data-index="${index}">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            });
            
            // 添加删除按钮事件
            document.querySelectorAll('.delete-history-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.deleteHistory(index);
                    this.renderHistory(filters);
                });
            });
        }
    }
    
    // 绑定历史记录相关事件
    bindHistoryEvents() {
        const self = this;
        
        // 历史记录按钮点击
        document.getElementById('history-btn').addEventListener('click', function() {
            self.renderHistory();
        });
        
        // 清空历史记录
        document.getElementById('clear-history').addEventListener('click', function() {
            self.showConfirm('确定要清空所有历史记录吗？', () => {
                if (self.clearHistory()) {
                    self.renderHistory();
                    self.showMessage('历史记录已清空', 'success');
                }
            });
        });
        
        // 应用筛选
        document.getElementById('apply-filters').addEventListener('click', function() {
            const timeFilter = document.getElementById('history-filter-time').value;
            const operationFilter = document.getElementById('history-filter-operation').value;
            self.renderHistory({ time: timeFilter, operation: operationFilter });
        });
        
        // 删除筛选结果
        document.getElementById('delete-filtered-history').addEventListener('click', function() {
            const timeFilter = document.getElementById('history-filter-time').value;
            const operationFilter = document.getElementById('history-filter-operation').value;
            
            // 获取筛选后的历史记录数量，用于确认消息
            let history = self.getHistory();
            if (timeFilter !== 'all') {
                const now = new Date();
                history = history.filter(item => {
                    const itemDate = new Date(item.timestamp);
                    switch (timeFilter) {
                        case 'today':
                            return itemDate.toDateString() === now.toDateString();
                        case 'week':
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            return itemDate >= weekAgo;
                        case 'month':
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            return itemDate >= monthAgo;
                        default:
                            return true;
                    }
                });
            }
            
            if (operationFilter !== 'all') {
                history = history.filter(item => item.operation === operationFilter);
            }
            
            if (history.length === 0) {
                self.showMessage('当前筛选条件下没有历史记录', 'info');
                return;
            }
            
            self.showConfirm(`确定要删除当前筛选条件下的 ${history.length} 条历史记录吗？`, () => {
                const result = self.deleteFilteredHistory(timeFilter, operationFilter);
                if (result.success && result.deletedCount > 0) {
                    self.renderHistory({ time: timeFilter, operation: operationFilter });
                    self.showMessage(`成功删除 ${result.deletedCount} 条历史记录`, 'success');
                } else if (result.success && result.deletedCount === 0) {
                    self.showMessage('没有符合条件的历史记录可删除', 'info');
                } else {
                    self.showMessage('删除历史记录失败', 'error');
                }
            });
        });
    }
    
    // 显示确认弹窗
    showConfirm(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        this.confirmCallback = callback;
        openModal('confirm-modal');
    }
    
    // 处理确认操作
    handleConfirm() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        closeModal('confirm-modal');
        this.confirmCallback = null;
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        // 使用通用的showToast函数
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }
    
    // 清空所有数据
    clearAll() {
        this.showConfirm('确定要清空所有数据吗？此操作不可恢复！', () => {
            this.originalList = [];
            this.extractionPool = [];
            this.extractedList = [];
            this.config.currentListName = '';
            
            // 清空本地存储
            localStorage.removeItem('tianxuanzhizi_lists');
            localStorage.removeItem('tianxuanzhizi_history');
            
            this.updateExtractedList();
            this.loadSavedLists();
            document.getElementById('list-name').value = '';
            document.getElementById('saved-lists').value = '';
            this.saveState(); // 保存状态
            
            // 添加历史记录
            this.addHistory({
                operation: TianXuanZhiZi.OPERATION_TYPES.CLEAR_ALL,
                description: '清空了所有数据'
            });
            
            this.showMessage('所有数据已清空', 'success');
        });
    }
    
    // 添加测试数据
    addTestData() {
        // 生成包含各种类型数据的测试数据
        this.originalList = [
            // 完整的学号+姓名数据
            { id: '2024001', name: '张三' },
            { id: '2024002', name: '李四' },
            { id: '2024003', name: '王五' },
            { id: '2024004', name: '赵六' },
            { id: '2024005', name: '钱七' },
            
            // 只有学号的数据
            { id: '2024006', name: '' },
            { id: '2024007', name: '' },
            { id: '2024008', name: '' },
            
            // 不同格式的学号
            { id: 'A001', name: '孙八' },
            { id: 'B002', name: '周九' },
            { id: 'C003', name: '吴十' },
            
            // 较长的姓名
            { id: '2024009', name: '诸葛孔明' },
            { id: '2024010', name: '司马相如' },
            
            // 重复的学号但不同姓名（测试去重功能）
            { id: '2024011', name: '刘备' },
            { id: '2024011', name: '关羽' }, // 学号重复但姓名不同
            { id: '2024012', name: '张飞' },
            { id: '2024012', name: '张飞' }, // 学号和姓名都重复
        ];
        
        this.extractionPool = [...this.originalList];
        this.extractedList = [];
        this.updateExtractedList();
        
        // 保存测试数据为默认名单
        const testListData = {
            name: '测试数据',
            data: this.originalList,
            timestamp: new Date().toISOString()
        };
        
        let savedLists = JSON.parse(localStorage.getItem('tianxuanzhizi_lists') || '{}');
        savedLists['测试数据'] = testListData;
        localStorage.setItem('tianxuanzhizi_lists', JSON.stringify(savedLists));
        
        this.config.currentListName = '测试数据';
        this.loadSavedLists();
        document.getElementById('list-name').value = '测试数据';
        this.saveState(); // 保存状态
        
        // 添加历史记录
        this.addHistory({
            operation: TianXuanZhiZi.OPERATION_TYPES.ADD_TEST_DATA,
            description: '添加了测试数据',
            details: {
                recordCount: this.originalList.length
            }
        });
        
        this.showMessage('测试数据已添加，包含完整数据、只有学号数据、不同格式学号和重复数据', 'success');
    }
}

// 初始化天选之子工具
function initTianXuanZhiZi() {
    window.tianXuanZhiZi = new TianXuanZhiZi();
}