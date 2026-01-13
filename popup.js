// 获取DOM元素
const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');

// 存储所有书签
let allBookmarks = [];
let filteredBookmarks = [];
let bookmarkTree = null; // 存储书签树结构，用于查找路径

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadAllBookmarks();
  setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
}

// 加载所有书签
function loadAllBookmarks() {
  showLoading();
  
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    allBookmarks = [];
    bookmarkTree = bookmarkTreeNodes;
    extractBookmarks(bookmarkTreeNodes, []);
    filteredBookmarks = allBookmarks;
    updateBookmarkCount();
    renderResults();
    hideLoading();
  });
}

// 递归提取所有书签
function extractBookmarks(nodes, path) {
  nodes.forEach(node => {
    const currentPath = [...path];
    
    // 跳过根节点（"书签栏"和"其他书签"）
    if (node.id !== '0' && node.id !== '1' && node.id !== '2') {
      currentPath.push(node.title);
    }
    
    if (node.url) {
      // 这是一个书签（不是文件夹）
      const pathString = currentPath.length > 0 ? currentPath.join(' / ') : '书签栏';
      allBookmarks.push({
        id: node.id,
        title: node.title,
        url: node.url,
        path: pathString,
        parentId: node.parentId
      });
    }
    
    if (node.children) {
      // 递归处理子节点
      extractBookmarks(node.children, currentPath);
    }
  });
}

// 处理搜索
function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  
  if (query === '') {
    // 搜索框为空时，显示所有书签
    filteredBookmarks = allBookmarks;
    renderResults();
    return;
  }
  
  // 模糊匹配搜索（包括标题、URL和路径）
  filteredBookmarks = allBookmarks.filter(bookmark => {
    const titleMatch = bookmark.title.toLowerCase().includes(query);
    const urlMatch = bookmark.url.toLowerCase().includes(query);
    const pathMatch = bookmark.path && bookmark.path.toLowerCase().includes(query);
    return titleMatch || urlMatch || pathMatch;
  });
  
  renderResults();
}

// 渲染结果
function renderResults() {
  resultsList.innerHTML = '';
  
  if (filteredBookmarks.length === 0) {
    if (searchInput.value.trim() !== '') {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
    }
    updateBookmarkCount();
    return;
  }
  
  noResults.classList.add('hidden');
  
  filteredBookmarks.forEach(bookmark => {
    const item = createBookmarkItem(bookmark);
    resultsList.appendChild(item);
  });
  
  updateBookmarkCount();
}

// 更新书签计数
function updateBookmarkCount() {
  const countElement = document.getElementById('bookmarkCount');
  const totalCount = allBookmarks.length;
  const filteredCount = filteredBookmarks.length;
  
  if (searchInput.value.trim() === '') {
    countElement.textContent = `共 ${totalCount} 个书签`;
  } else {
    countElement.textContent = `找到 ${filteredCount} / ${totalCount} 个书签`;
  }
}

// 创建书签项
function createBookmarkItem(bookmark) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  item.dataset.id = bookmark.id;
  
  const header = document.createElement('div');
  header.className = 'bookmark-header';
  
  const icon = document.createElement('span');
  icon.className = 'bookmark-icon';
  icon.textContent = '🔖';
  
  const title = document.createElement('span');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title;
  
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'bookmark-title-input hidden';
  titleInput.value = bookmark.title;
  
  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-edit';
  editBtn.textContent = '编辑';
  editBtn.onclick = () => startEdit(bookmark.id, title, titleInput, editBtn, actions);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => deleteBookmark(bookmark.id);
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  header.appendChild(icon);
  header.appendChild(title);
  header.appendChild(titleInput);
  header.appendChild(actions);
  
  const url = document.createElement('div');
  url.className = 'bookmark-url';
  const urlLink = document.createElement('a');
  urlLink.href = bookmark.url;
  urlLink.target = '_blank';
  urlLink.textContent = bookmark.url;
  url.appendChild(urlLink);
  
  // 添加书签位置信息
  const location = document.createElement('div');
  location.className = 'bookmark-location';
  const locationIcon = document.createElement('span');
  locationIcon.className = 'location-icon';
  locationIcon.textContent = '📁';
  const locationText = document.createElement('span');
  locationText.textContent = bookmark.path || '书签栏';
  location.appendChild(locationIcon);
  location.appendChild(locationText);
  
  item.appendChild(header);
  item.appendChild(url);
  item.appendChild(location);
  
  return item;
}

// 开始编辑
function startEdit(bookmarkId, titleElement, inputElement, editBtn, actionsContainer) {
  titleElement.classList.add('editing');
  inputElement.classList.remove('hidden');
  inputElement.focus();
  inputElement.select();
  
  // 创建保存和取消按钮
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-save';
  saveBtn.textContent = '保存';
  saveBtn.onclick = () => saveBookmark(bookmarkId, inputElement.value, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-cancel';
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = () => cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
  
  // 替换按钮
  actionsContainer.innerHTML = '';
  actionsContainer.appendChild(saveBtn);
  actionsContainer.appendChild(cancelBtn);
  
  // 回车保存，ESC取消
  inputElement.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveBookmark(bookmarkId, inputElement.value, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
    }
  };
}

// 保存书签
function saveBookmark(bookmarkId, newTitle, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer) {
  if (newTitle.trim() === '') {
    alert('书签名称不能为空');
    return;
  }
  
  chrome.bookmarks.update(bookmarkId, { title: newTitle }, (updatedBookmark) => {
    if (chrome.runtime.lastError) {
      alert('保存失败: ' + chrome.runtime.lastError.message);
      return;
    }
    
    // 更新本地数据
    const bookmark = allBookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      bookmark.title = newTitle;
    }
    
    // 更新UI
    titleElement.textContent = newTitle;
    titleElement.classList.remove('editing');
    inputElement.classList.add('hidden');
    
    // 恢复按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = '删除';
    deleteBtn.onclick = () => deleteBookmark(bookmarkId);
    
    actionsContainer.innerHTML = '';
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);
    
    // 如果正在搜索，重新渲染以保持搜索结果
    if (searchInput.value.trim() !== '') {
      handleSearch({ target: searchInput });
    }
  });
}

// 取消编辑
function cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer) {
  // 恢复原始值
  const bookmark = allBookmarks.find(b => b.id === bookmarkId);
  if (bookmark) {
    inputElement.value = bookmark.title;
  }
  
  titleElement.classList.remove('editing');
  inputElement.classList.add('hidden');
  
  // 恢复按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => deleteBookmark(bookmarkId);
  
  actionsContainer.innerHTML = '';
  actionsContainer.appendChild(editBtn);
  actionsContainer.appendChild(deleteBtn);
}

// 删除书签
function deleteBookmark(bookmarkId) {
  if (!confirm('确定要删除这个书签吗？')) {
    return;
  }
  
  chrome.bookmarks.remove(bookmarkId, () => {
    if (chrome.runtime.lastError) {
      alert('删除失败: ' + chrome.runtime.lastError.message);
      return;
    }
    
    // 从本地数据中移除
    allBookmarks = allBookmarks.filter(b => b.id !== bookmarkId);
    
    // 重新加载或更新显示
    if (searchInput.value.trim() !== '') {
      handleSearch({ target: searchInput });
    } else {
      filteredBookmarks = allBookmarks;
      renderResults();
    }
  });
}

// 显示加载中
function showLoading() {
  loading.classList.remove('hidden');
  resultsList.innerHTML = '';
  noResults.classList.add('hidden');
}

// 隐藏加载中
function hideLoading() {
  loading.classList.add('hidden');
}

