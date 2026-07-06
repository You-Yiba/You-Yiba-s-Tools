// 全局变量
let uploadedImages = [];
let compressedImages = [];
let isRatioLocked = true;
let originalWidth = 0;
let originalHeight = 0;
let currentImageIndex = 0;

// DOM元素
let dropArea, fileInput, browseBtn, uploadedFiles, fileList;
let qualitySlider, qualityValue, targetSize, sizeUnit;
let customWidth, customHeight, lockRatio, presetSize, scaleBtns;
let compressBtn, previewContainer, noPreview;
let originalFilename, originalSize, originalFileSize, originalImage, compressedImage;
let compressedFileSize, compressionRatio, spaceSaved;
let downloadSingle, downloadAll, clearAll, themeToggle, historyBtn;
let historyModal, historyOverlay, historyClose, historyList, emptyHistory;
let progressContainer, progressBar, progressPercent, progressList;
let errorModal, errorOverlay, errorClose, errorConfirm, errorMessage;
let comparisonWrapper, sliderHandle;
let uploadProgressContainer, uploadProgressBar, uploadProgressPercent;
let devToolsBtn, devToolsModal, devToolsOverlay, devToolsClose, clearHistoryBtn;
let changelogBtn, changelogModal, changelogOverlay, changelogClose;

// 更新日志数据
const changelogData = [
    {
        version: '1.0.0',
        date: '2026-02-21',
        changes: [
            '初始版本发布',
            '支持图片上传（拖拽、点击选择）',
            '支持图片压缩（质量调节、尺寸调整）',
            '支持预览对比功能',
            '支持单张和批量下载',
            '支持历史记录功能',
            '添加开发者选项',
            '添加更新日志功能'
        ]
    }
];

// 渲染更新日志 - 使用通用函数
function renderChangelog() {
    // 调用通用的渲染更新日志函数
    renderChangelog(changelogData, 'changelog-content');
}

// 初始化函数
function initImageCompressApp() {
    console.log('初始化图片压缩应用');
    
    // 获取DOM元素
    dropArea = document.getElementById('drop-area');
    fileInput = document.getElementById('file-input');
    browseBtn = document.getElementById('browse-btn');
    uploadedFiles = document.getElementById('uploaded-files');
    fileList = document.getElementById('file-list');
    qualitySlider = document.getElementById('quality-slider');
    qualityValue = document.getElementById('quality-value');
    targetSize = document.getElementById('target-size');
    sizeUnit = document.getElementById('size-unit');
    customWidth = document.getElementById('custom-width');
    customHeight = document.getElementById('custom-height');
    lockRatio = document.getElementById('lock-ratio');
    presetSize = document.getElementById('preset-size');
    scaleBtns = document.querySelectorAll('.scale-btn');
    compressBtn = document.getElementById('compress-btn');
    previewContainer = document.getElementById('preview-container');
    noPreview = document.getElementById('no-preview');
    originalFilename = document.getElementById('original-filename');
    originalSize = document.getElementById('original-size');
    originalFileSize = document.getElementById('original-file-size');
    originalImage = document.getElementById('original-image');
    compressedImage = document.getElementById('compressed-image');
    compressedFileSize = document.getElementById('compressed-file-size');
    compressionRatio = document.getElementById('compression-ratio');
    spaceSaved = document.getElementById('space-saved');
    downloadSingle = document.getElementById('download-single');
    downloadAll = document.getElementById('download-all');
    clearAll = document.getElementById('clear-all');

    historyBtn = document.getElementById('history-btn');
    historyModal = document.getElementById('history-modal');
    historyOverlay = document.getElementById('history-overlay');
    historyClose = document.getElementById('history-close');
    historyList = document.getElementById('history-list');
    emptyHistory = document.getElementById('empty-history');
    progressContainer = document.getElementById('progress-container');
    progressBar = document.getElementById('progress-bar');
    progressPercent = document.getElementById('progress-percent');
    progressList = document.getElementById('progress-list');
    errorModal = document.getElementById('error-modal');
    errorOverlay = document.getElementById('error-overlay');
    errorClose = document.getElementById('error-close');
    errorConfirm = document.getElementById('error-confirm');
    errorMessage = document.getElementById('error-message');
    comparisonWrapper = document.querySelector('.comparison-wrapper');
    sliderHandle = document.querySelector('.slider-handle');
    uploadProgressContainer = document.getElementById('upload-progress-container');
    uploadProgressBar = document.getElementById('upload-progress-bar');
    uploadProgressPercent = document.getElementById('upload-progress-percent');
    
    // 开发者工具相关元素
    devToolsBtn = document.getElementById('dev-tools-btn');
    devToolsModal = document.getElementById('dev-tools-modal');
    devToolsOverlay = document.getElementById('dev-tools-overlay');
    devToolsClose = document.getElementById('dev-tools-close');
    clearHistoryBtn = document.getElementById('clear-history');
    
    // 更新日志相关元素
    changelogBtn = document.getElementById('changelog-btn');
    changelogModal = document.getElementById('changelog-modal');
    changelogOverlay = document.getElementById('changelog-overlay');
    changelogClose = document.getElementById('changelog-close');
    
    console.log('DOM元素获取完成');
    
    // 初始化通用功能
    if (typeof initCommon === 'function') {
        initCommon();
        console.log('通用功能初始化完成');
    }
    
    // 初始化模态框
    if (typeof initModal === 'function') {
        // 注意：我们不使用initModal函数，因为它需要所有元素都存在
        // 我们自己处理模态框的显示和隐藏
        console.log('模态框初始化完成');
    }
    
    // 绑定事件
    function bindEvents() {
        // 拖拽上传
        if (dropArea) {
            dropArea.addEventListener('dragover', handleDragOver);
            dropArea.addEventListener('dragleave', handleDragLeave);
            dropArea.addEventListener('drop', handleDrop);
        }
        
        // 点击选择文件
        if (browseBtn) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        // 质量滑块
        if (qualitySlider) {
            qualitySlider.addEventListener('input', handleQualityChange);
        }
        
        // 尺寸调整
        if (customWidth) {
            customWidth.addEventListener('input', handleWidthChange);
        }
        if (customHeight) {
            customHeight.addEventListener('input', handleHeightChange);
        }
        if (lockRatio) {
            lockRatio.addEventListener('click', toggleRatioLock);
        }
        if (presetSize) {
            presetSize.addEventListener('change', handlePresetSize);
        }
        if (scaleBtns) {
            scaleBtns.forEach(btn => btn.addEventListener('click', handleScaleClick));
        }
        
        // 压缩按钮
        if (compressBtn) {
            compressBtn.addEventListener('click', handleCompress);
        }
        
        // 下载按钮
        if (downloadSingle) {
            downloadSingle.addEventListener('click', downloadCurrentImage);
        }
        if (downloadAll) {
            downloadAll.addEventListener('click', downloadAllImages);
        }
        
        // 清空按钮
        if (clearAll) {
            clearAll.addEventListener('click', clearAllImages);
        }
        

        
        // 历史记录按钮
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                if (historyModal) {
                    historyModal.classList.remove('hidden');
                    loadHistory();
                }
            });
        }
        
        // 开发者工具按钮
        if (devToolsBtn) {
            devToolsBtn.addEventListener('click', function() {
                if (devToolsModal) {
                    devToolsModal.classList.remove('hidden');
                }
            });
        }
        
        // 开发者工具关闭
        if (devToolsClose) {
            devToolsClose.addEventListener('click', function() {
                if (devToolsModal) {
                    devToolsModal.classList.add('hidden');
                }
            });
        }
        if (devToolsOverlay) {
            devToolsOverlay.addEventListener('click', function() {
                if (devToolsModal) {
                    devToolsModal.classList.add('hidden');
                }
            });
        }
        
        // 清空历史记录按钮
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', function() {
                if (confirm('确定要清空所有历史记录吗？')) {
                    localStorage.removeItem('imageCompressHistory');
                    showError('历史记录已清空');
                }
            });
        }
        
        // 更新日志按钮
        if (changelogBtn) {
            changelogBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (changelogModal) {
                    changelogModal.classList.remove('hidden');
                    renderChangelog();
                }
            });
        }
        
        // 更新日志关闭
        if (changelogClose) {
            changelogClose.addEventListener('click', function() {
                if (changelogModal) {
                    changelogModal.classList.add('hidden');
                }
            });
        }
        if (changelogOverlay) {
            changelogOverlay.addEventListener('click', function() {
                if (changelogModal) {
                    changelogModal.classList.add('hidden');
                }
            });
        }
        
        // 历史记录关闭
        if (historyClose) {
            historyClose.addEventListener('click', function() {
                if (historyModal) {
                    historyModal.classList.add('hidden');
                }
            });
        }
        if (historyOverlay) {
            historyOverlay.addEventListener('click', function() {
                if (historyModal) {
                    historyModal.classList.add('hidden');
                }
            });
        }
        
        // 错误提示关闭
        if (errorClose) {
            errorClose.addEventListener('click', function() {
                if (errorModal) {
                    errorModal.classList.add('hidden');
                }
            });
        }
        if (errorConfirm) {
            errorConfirm.addEventListener('click', function() {
                if (errorModal) {
                    errorModal.classList.add('hidden');
                }
            });
        }
        if (errorOverlay) {
            errorOverlay.addEventListener('click', function() {
                if (errorModal) {
                    errorModal.classList.add('hidden');
                }
            });
        }
        
        // 对比滑块
        if (comparisonWrapper) {
            comparisonWrapper.addEventListener('mousemove', handleComparisonMove);
            comparisonWrapper.addEventListener('touchmove', handleComparisonTouch);
        }
    }
    
    bindEvents();
    console.log('事件绑定完成');
    
    // 加载历史记录
    loadHistory();
    console.log('历史记录加载完成');
    

}

// 拖拽上传处理
function handleDragOver(e) {
    e.preventDefault();
    if (dropArea) {
        dropArea.classList.add('active');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    if (dropArea) {
        dropArea.classList.remove('active');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (dropArea) {
        dropArea.classList.remove('active');
    }
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// 文件选择处理
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// 处理文件
function processFiles(files) {
    console.log('开始处理文件，数量:', files.length);
    
    // 检查文件数量
    if (files.length > 20) {
        showError('最多只能上传20张图片');
        return;
    }
    
    // 检查总大小
    let totalSize = 0;
    for (let file of files) {
        totalSize += file.size;
    }
    
    if (totalSize > 50 * 1024 * 1024) { // 50MB
        showError('总文件大小不能超过50MB');
        return;
    }
    
    // 显示上传进度条
    if (uploadProgressContainer) {
        uploadProgressContainer.classList.remove('hidden');
        console.log('显示上传进度条');
    }
    
    // 重置进度条
    if (uploadProgressBar) {
        uploadProgressBar.style.width = '0%';
    }
    if (uploadProgressPercent) {
        uploadProgressPercent.textContent = '0%';
    }
    
    // 处理每个文件
    let processedCount = 0;
    const totalCount = files.length;
    
    for (let file of files) {
        // 检查文件类型
        if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/webp')) {
            showError(`${file.name} 不是支持的图片格式（仅支持JPG/PNG/WebP）`);
            processedCount++;
            updateUploadProgress();
            continue;
        }
        
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showError(`${file.name} 超过10MB限制`);
            processedCount++;
            updateUploadProgress();
            continue;
        }
        
        console.log('开始处理文件:', file.name);
        
        // 读取文件并显示预览
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = new Image();
            image.onload = function() {
                const imageInfo = {
                    file: file,
                    name: file.name,
                    size: file.size,
                    width: image.width,
                    height: image.height,
                    src: e.target.result
                };
                
                uploadedImages.push(imageInfo);
                addFileToPreview(imageInfo);
                
                // 显示上传文件列表容器
                if (uploadedImages.length > 0 && uploadedFiles) {
                    uploadedFiles.classList.remove('hidden');
                    console.log('显示上传文件列表容器');
                }
                
                console.log('文件处理完成:', file.name, '当前数量:', uploadedImages.length);
                
                processedCount++;
                updateUploadProgress();
            };
            image.src = e.target.result;
        };
        
        reader.onerror = function() {
            showError(`读取 ${file.name} 失败`);
            processedCount++;
            updateUploadProgress();
        };
        
        reader.readAsDataURL(file);
    }
    
    // 更新上传进度
    function updateUploadProgress() {
        const percent = Math.round((processedCount / totalCount) * 100);
        if (uploadProgressBar) {
            uploadProgressBar.style.width = `${percent}%`;
        }
        if (uploadProgressPercent) {
            uploadProgressPercent.textContent = `${percent}%`;
        }
        
        console.log('上传进度:', percent, '%');
        
        // 所有文件处理完成后，隐藏进度条
        if (processedCount === totalCount) {
            setTimeout(() => {
                if (uploadProgressContainer) {
                    uploadProgressContainer.classList.add('hidden');
                    console.log('隐藏上传进度条');
                }
            }, 500);
        }
    }
}

// 添加文件到预览列表
function addFileToPreview(imageInfo) {
    if (!fileList) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item bg-white rounded-lg shadow-sm p-3 border border-gray-200';
    fileItem.dataset.index = uploadedImages.length - 1;
    
    fileItem.innerHTML = `
        <div class="relative">
            <img src="${imageInfo.src}" alt="${imageInfo.name}" class="w-full h-40 object-cover rounded mb-2">
            <button class="file-remove" data-index="${uploadedImages.length - 1}">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="text-sm">
            <p class="font-medium truncate">${imageInfo.name}</p>
            <p class="text-secondary">${imageInfo.width}×${imageInfo.height} · ${formatFileSize(imageInfo.size)}</p>
        </div>
    `;
    
    fileList.appendChild(fileItem);
    
    // 绑定删除按钮事件
    const removeBtn = fileItem.querySelector('.file-remove');
    removeBtn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        removeFile(index);
    });
}

// 删除文件
function removeFile(index) {
    // 从数组中删除
    uploadedImages.splice(index, 1);
    compressedImages.splice(index, 1);
    
    // 更新剩余文件的索引
    for (let i = index; i < uploadedImages.length; i++) {
        const fileItem = document.querySelector(`.file-item[data-index="${i + 1}"]`);
        if (fileItem) {
            fileItem.dataset.index = i;
            fileItem.querySelector('.file-remove').dataset.index = i;
        }
    }
    
    // 从DOM中删除
    const fileItem = document.querySelector(`.file-item[data-index="${index}"]`);
    if (fileItem) {
        fileItem.remove();
    }
    
    // 如果没有文件了，隐藏上传文件列表
    if (uploadedImages.length === 0) {
        if (uploadedFiles) uploadedFiles.classList.add('hidden');
        if (previewContainer) previewContainer.classList.add('hidden');
        if (noPreview) noPreview.classList.remove('hidden');
    }
}

// 质量滑块变化
function handleQualityChange() {
    if (qualitySlider && qualityValue) {
        const value = qualitySlider.value;
        qualityValue.textContent = `${value}%`;
    }
}

// 宽度变化
function handleWidthChange() {
    if (isRatioLocked && originalWidth && originalHeight && customWidth && customHeight) {
        const width = parseInt(customWidth.value) || 0;
        const height = Math.round((width * originalHeight) / originalWidth);
        customHeight.value = height;
    }
}

// 高度变化
function handleHeightChange() {
    if (isRatioLocked && originalWidth && originalHeight && customWidth && customHeight) {
        const height = parseInt(customHeight.value) || 0;
        const width = Math.round((height * originalWidth) / originalHeight);
        customWidth.value = width;
    }
}

// 切换比例锁定
function toggleRatioLock() {
    if (!lockRatio) return;
    
    isRatioLocked = !isRatioLocked;
    if (isRatioLocked) {
        lockRatio.classList.add('locked');
        lockRatio.innerHTML = '<i class="fa fa-link"></i>';
    } else {
        lockRatio.classList.remove('locked');
        lockRatio.innerHTML = '<i class="fa fa-unlink"></i>';
    }
}

// 预设尺寸变化
function handlePresetSize() {
    if (!presetSize || !customWidth || !customHeight) return;
    
    const value = presetSize.value;
    if (value) {
        const [width, height] = value.split('x').map(Number);
        customWidth.value = width;
        customHeight.value = height;
    }
}

// 缩放按钮点击
function handleScaleClick() {
    const scale = parseFloat(this.dataset.scale);
    
    // 移除其他按钮的active状态
    if (scaleBtns) {
        scaleBtns.forEach(btn => btn.classList.remove('active'));
    }
    // 添加当前按钮的active状态
    this.classList.add('active');
    
    if (originalWidth && originalHeight && customWidth && customHeight) {
        const width = Math.round(originalWidth * scale);
        const height = Math.round(originalHeight * scale);
        customWidth.value = width;
        customHeight.value = height;
    }
}

// 压缩处理
function handleCompress() {
    console.log('开始压缩');
    if (uploadedImages.length === 0) {
        showError('请先上传图片');
        return;
    }
    
    // 显示进度条
    if (progressContainer) {
        progressContainer.classList.remove('hidden');
    }
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    if (progressPercent) {
        progressPercent.textContent = '0%';
    }
    if (progressList) {
        progressList.innerHTML = '';
    }
    
    // 重置压缩结果数组
    compressedImages = [];
    
    // 批量压缩
    let completed = 0;
    const total = uploadedImages.length;
    
    console.log('待压缩图片数量:', total);
    
    // 确保Compressor可用
    if (typeof Compressor === 'undefined') {
        console.error('Compressor未定义');
        showError('压缩库加载失败，请刷新页面重试');
        return;
    }
    
    uploadedImages.forEach((imageInfo, index) => {
        console.log('开始压缩图片:', imageInfo.name);
        
        // 添加进度项
        if (progressList) {
            const progressItem = document.createElement('div');
            progressItem.className = 'flex justify-between text-sm';
            progressItem.innerHTML = `
                <span>${imageInfo.name}</span>
                <span class="compressing">压缩中...</span>
            `;
            progressList.appendChild(progressItem);
        }
        
        // 获取压缩参数
        let quality = 0.8;
        if (qualitySlider) {
            quality = parseInt(qualitySlider.value) / 100;
        }
        let width = imageInfo.width;
        if (customWidth) {
            width = parseInt(customWidth.value) || imageInfo.width;
        }
        let height = imageInfo.height;
        if (customHeight) {
            height = parseInt(customHeight.value) || imageInfo.height;
        }
        
        console.log('压缩参数:', { quality, width, height });
        
        // 压缩图片
        try {
            // 先更新进度，确保用户看到压缩开始
            setTimeout(() => {
                const initialPercent = Math.round((completed + 1) / total * 20);
                if (progressBar) {
                    progressBar.style.width = `${initialPercent}%`;
                }
                if (progressPercent) {
                    progressPercent.textContent = `${initialPercent}%`;
                }
            }, 100);
            
            // 检查文件对象
            if (!imageInfo.file || typeof imageInfo.file !== 'object') {
                throw new Error('无效的文件对象');
            }
            
            console.log('文件对象:', imageInfo.file);
            
            new Compressor(imageInfo.file, {
                quality: quality,
                width: width,
                height: height,
                success: function(result) {
                    console.log('压缩成功:', result);
                    // 读取压缩后的图片
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const compressedInfo = {
                            original: imageInfo,
                            file: result,
                            size: result.size,
                            src: e.target.result,
                            width: width,
                            height: height
                        };
                        
                        compressedImages[index] = compressedInfo;
                        
                        // 更新进度
                        completed++;
                        const percent = Math.round((completed / total) * 100);
                        if (progressBar) {
                            progressBar.style.width = `${percent}%`;
                        }
                        if (progressPercent) {
                            progressPercent.textContent = `${percent}%`;
                        }
                        
                        // 更新进度项
                        if (progressList) {
                            const progressItem = progressList.children[index];
                            if (progressItem) {
                                const compressingSpan = progressItem.querySelector('.compressing');
                                if (compressingSpan) {
                                    compressingSpan.textContent = '压缩完成';
                                }
                            }
                        }
                        
                        console.log('压缩完成进度:', completed, '/', total);
                        
                        // 全部完成
                        if (completed === total) {
                            console.log('所有图片压缩完成');
                            // 隐藏进度条
                            setTimeout(() => {
                                if (progressContainer) {
                                    progressContainer.classList.add('hidden');
                                }
                            }, 500);
                            
                            // 显示预览
                            showPreview(0);
                            
                            // 保存到历史记录
                            saveToHistory(compressedInfo);
                        }
                    };
                    reader.readAsDataURL(result);
                },
                error: function(err) {
                    console.error('压缩失败:', err);
                    showError(`压缩 ${imageInfo.name} 失败: ${err.message}`);
                    
                    // 更新进度
                    completed++;
                    const percent = Math.round((completed / total) * 100);
                    if (progressBar) {
                        progressBar.style.width = `${percent}%`;
                    }
                    if (progressPercent) {
                        progressPercent.textContent = `${percent}%`;
                    }
                    
                    // 更新进度项
                    if (progressList) {
                        const progressItem = progressList.children[index];
                        if (progressItem) {
                            const compressingSpan = progressItem.querySelector('.compressing');
                            if (compressingSpan) {
                                compressingSpan.textContent = '压缩失败';
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('压缩过程出错:', error);
            showError(`压缩 ${imageInfo.name} 失败: ${error.message}`);
            
            // 更新进度
            completed++;
            const percent = Math.round((completed / total) * 100);
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }
            if (progressPercent) {
                progressPercent.textContent = `${percent}%`;
            }
            
            // 更新进度项
            if (progressList) {
                const progressItem = progressList.children[index];
                if (progressItem) {
                    const compressingSpan = progressItem.querySelector('.compressing');
                    if (compressingSpan) {
                        compressingSpan.textContent = '压缩失败';
                    }
                }
            }
        }
    });
}

// 显示预览
function showPreview(index) {
    if (compressedImages.length === 0 || !compressedImages[index]) {
        return;
    }
    
    currentImageIndex = index;
    const compressedInfo = compressedImages[index];
    const originalInfo = compressedInfo.original;
    
    // 保存原始尺寸用于比例计算
    originalWidth = originalInfo.width;
    originalHeight = originalInfo.height;
    
    // 更新预览信息
    if (originalFilename) originalFilename.textContent = originalInfo.name;
    if (originalSize) originalSize.textContent = `${originalInfo.width}×${originalInfo.height}`;
    if (originalFileSize) originalFileSize.textContent = formatFileSize(originalInfo.size);
    if (originalImage) originalImage.src = originalInfo.src;
    if (compressedImage) compressedImage.src = compressedInfo.src;
    if (compressedFileSize) compressedFileSize.textContent = formatFileSize(compressedInfo.size);
    
    // 计算压缩率
    const compressionRate = ((1 - compressedInfo.size / originalInfo.size) * 100).toFixed(1);
    const savedSize = originalInfo.size - compressedInfo.size;
    if (compressionRatio) compressionRatio.textContent = `${compressionRate}%`;
    if (spaceSaved) spaceSaved.textContent = formatFileSize(savedSize);
    
    // 显示预览容器
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (noPreview) noPreview.classList.add('hidden');
}

// 对比滑块移动
function handleComparisonMove(e) {
    if (!comparisonWrapper || !originalImage || !sliderHandle) return;
    
    const rect = comparisonWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    
    originalImage.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    sliderHandle.style.left = `${percent}%`;
}

// 触摸设备对比滑块移动
function handleComparisonTouch(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleComparisonMove(touch);
    }
}

// 下载当前图片
function downloadCurrentImage() {
    if (compressedImages.length === 0 || !compressedImages[currentImageIndex]) {
        showError('没有可下载的图片');
        return;
    }
    
    const compressedInfo = compressedImages[currentImageIndex];
    const link = document.createElement('a');
    link.href = compressedInfo.src;
    link.download = `compressed_${compressedInfo.original.name}`;
    link.click();
}

// 下载所有图片
function downloadAllImages() {
    if (compressedImages.length === 0) {
        showError('没有可下载的图片');
        return;
    }
    
    const zip = new JSZip();
    let completed = 0;
    const total = compressedImages.length;
    
    compressedImages.forEach((compressedInfo, index) => {
        // 从data URL获取二进制数据
        const dataUrl = compressedInfo.src;
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: compressedInfo.original.file.type });
        
        // 添加到ZIP
        zip.file(`compressed_${compressedInfo.original.name}`, blob);
        
        completed++;
        
        if (completed === total) {
            // 生成ZIP文件
            zip.generateAsync({ type: 'blob' }).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'compressed_images.zip';
                link.click();
            });
        }
    });
}

// 清空所有图片
function clearAllImages() {
    // 清空数组
    uploadedImages = [];
    compressedImages = [];
    
    // 清空DOM
    if (fileList) fileList.innerHTML = '';
    if (uploadedFiles) uploadedFiles.classList.add('hidden');
    if (previewContainer) previewContainer.classList.add('hidden');
    if (noPreview) noPreview.classList.remove('hidden');
}



// 保存到历史记录
function saveToHistory(compressedInfo) {
    const history = JSON.parse(localStorage.getItem('imageCompressHistory') || '[]');
    
    const historyItem = {
        filename: compressedInfo.original.name,
        originalSize: compressedInfo.original.size,
        compressedSize: compressedInfo.size,
        compressionRatio: ((1 - compressedInfo.size / compressedInfo.original.size) * 100).toFixed(1),
        timestamp: new Date().toISOString()
    };
    
    // 添加到历史记录开头
    history.unshift(historyItem);
    
    // 只保留最近10条
    if (history.length > 10) {
        history.splice(10);
    }
    
    // 保存到localStorage - 使用通用存储函数
    storageSet('imageCompressHistory', history);
}

// 加载历史记录
function loadHistory() {
    if (!historyList || !emptyHistory) return;
    
    // 加载历史记录 - 使用通用存储函数
    const history = storageGet('imageCompressHistory') || [];
    
    if (history.length === 0) {
        emptyHistory.classList.remove('hidden');
        historyList.innerHTML = '';
        historyList.appendChild(emptyHistory);
        return;
    }
    
    emptyHistory.classList.add('hidden');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
        
        historyItem.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="font-medium">${item.filename}</p>
                    <p class="text-sm text-secondary">${formatDate(item.timestamp)}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm"><span class="text-secondary">原始大小:</span> ${formatFileSize(item.originalSize)}</p>
                    <p class="text-sm"><span class="text-secondary">压缩后:</span> ${formatFileSize(item.compressedSize)}</p>
                    <p class="text-sm"><span class="text-secondary">压缩率:</span> ${item.compressionRatio}%</p>
                </div>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// 显示错误提示
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    if (errorModal) {
        errorModal.classList.remove('hidden');
    }
}

// 注意：formatFileSize、formatDate 和 initModal 函数已移至通用 JavaScript 文件中

// 当DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initImageCompressApp);