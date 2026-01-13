/**
 * 书签渲染器类
 */
import { CONFIG } from './config.js';
import { createButton } from './utils.js';

export class BookmarkRenderer {
  constructor() {
    this.elements = this.initElements();
  }

  /**
   * 初始化 DOM 元素引用
   * @returns {Object} DOM 元素对象
   */
  initElements() {
    return {
      searchInput: document.getElementById(CONFIG.ELEMENTS.SEARCH_INPUT),
      resultsList: document.getElementById(CONFIG.ELEMENTS.RESULTS_LIST),
      loading: document.getElementById(CONFIG.ELEMENTS.LOADING),
      noResults: document.getElementById(CONFIG.ELEMENTS.NO_RESULTS),
      bookmarkCount: document.getElementById(CONFIG.ELEMENTS.BOOKMARK_COUNT)
    };
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    this.elements.loading.classList.remove(CONFIG.CLASSES.HIDDEN);
    this.elements.resultsList.innerHTML = '';
    this.elements.noResults.classList.add(CONFIG.CLASSES.HIDDEN);
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.elements.loading.classList.add(CONFIG.CLASSES.HIDDEN);
  }

  /**
   * 更新书签计数
   * @param {number} totalCount - 总书签数
   * @param {number} filteredCount - 过滤后的书签数
   * @param {boolean} isSearching - 是否正在搜索
   */
  updateBookmarkCount(totalCount, filteredCount, isSearching) {
    if (isSearching) {
      this.elements.bookmarkCount.textContent = `找到 ${filteredCount} / ${totalCount} 个书签`;
    } else {
      this.elements.bookmarkCount.textContent = `共 ${totalCount} 个书签`;
    }
  }

  /**
   * 渲染书签列表
   * @param {Array} bookmarks - 要渲染的书签数组
   * @param {Object} callbacks - 回调函数对象 { onEdit, onDelete }
   */
  renderBookmarks(bookmarks, callbacks) {
    this.elements.resultsList.innerHTML = '';

    if (bookmarks.length === 0) {
      const isSearching = this.elements.searchInput.value.trim() !== '';
      if (isSearching) {
        this.elements.noResults.classList.remove(CONFIG.CLASSES.HIDDEN);
      } else {
        this.elements.noResults.classList.add(CONFIG.CLASSES.HIDDEN);
      }
      return;
    }

    this.elements.noResults.classList.add(CONFIG.CLASSES.HIDDEN);

    bookmarks.forEach(bookmark => {
      const item = this.createBookmarkItem(bookmark, callbacks);
      this.elements.resultsList.appendChild(item);
    });
  }

  /**
   * 创建书签项元素
   * @param {Object} bookmark - 书签对象
   * @param {Object} callbacks - 回调函数对象
   * @returns {HTMLElement} 书签项元素
   */
  createBookmarkItem(bookmark, callbacks) {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    item.dataset.id = bookmark.id;

    // 创建头部
    const header = this.createBookmarkHeader(bookmark, callbacks);
    
    // 创建 URL
    const url = this.createBookmarkUrl(bookmark);
    
    // 创建位置信息
    const location = this.createBookmarkLocation(bookmark);

    item.appendChild(header);
    item.appendChild(url);
    item.appendChild(location);

    return item;
  }

  /**
   * 创建书签头部
   * @param {Object} bookmark - 书签对象
   * @param {Object} callbacks - 回调函数对象
   * @returns {HTMLElement} 头部元素
   */
  createBookmarkHeader(bookmark, callbacks) {
    const header = document.createElement('div');
    header.className = 'bookmark-header';

    // 图标
    const icon = document.createElement('span');
    icon.className = 'bookmark-icon';
    icon.textContent = '🔖';

    // 标题
    const title = document.createElement('span');
    title.className = 'bookmark-title';
    title.textContent = bookmark.title;

    // 标题输入框（编辑时使用）
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'bookmark-title-input hidden';
    titleInput.value = bookmark.title;

    // 操作按钮
    const actions = document.createElement('div');
    actions.className = 'bookmark-actions';

    const editBtn = createButton('编辑', 'btn-edit', () => {
      callbacks.onEdit(bookmark.id, title, titleInput, editBtn, actions);
    });

    const deleteBtn = createButton('删除', 'btn-delete', () => {
      callbacks.onDelete(bookmark.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(titleInput);
    header.appendChild(actions);

    return header;
  }

  /**
   * 创建书签 URL 元素
   * @param {Object} bookmark - 书签对象
   * @returns {HTMLElement} URL 元素
   */
  createBookmarkUrl(bookmark) {
    const url = document.createElement('div');
    url.className = 'bookmark-url';
    
    const urlLink = document.createElement('a');
    urlLink.href = bookmark.url;
    urlLink.target = '_blank';
    urlLink.textContent = bookmark.url;
    
    url.appendChild(urlLink);
    return url;
  }

  /**
   * 创建书签位置元素
   * @param {Object} bookmark - 书签对象
   * @returns {HTMLElement} 位置元素
   */
  createBookmarkLocation(bookmark) {
    const location = document.createElement('div');
    location.className = 'bookmark-location';
    
    const locationIcon = document.createElement('span');
    locationIcon.className = 'location-icon';
    locationIcon.textContent = '📁';
    
    const locationText = document.createElement('span');
    locationText.textContent = bookmark.path || CONFIG.DEFAULT_PATH;
    
    location.appendChild(locationIcon);
    location.appendChild(locationText);
    
    return location;
  }

  /**
   * 更新书签项标题
   * @param {string} bookmarkId - 书签 ID
   * @param {string} newTitle - 新标题
   */
  updateBookmarkTitle(bookmarkId, newTitle) {
    const item = this.elements.resultsList.querySelector(`[data-id="${bookmarkId}"]`);
    if (item) {
      const titleElement = item.querySelector('.bookmark-title');
      if (titleElement) {
        titleElement.textContent = newTitle;
      }
    }
  }

  /**
   * 移除书签项
   * @param {string} bookmarkId - 书签 ID
   */
  removeBookmarkItem(bookmarkId) {
    const item = this.elements.resultsList.querySelector(`[data-id="${bookmarkId}"]`);
    if (item) {
      item.remove();
    }
  }
}
