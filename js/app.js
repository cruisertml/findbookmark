/**
 * 主应用控制器
 */
import { BookmarkManager } from './BookmarkManager.js';
import { BookmarkRenderer } from './BookmarkRenderer.js';
import { BookmarkEditor } from './BookmarkEditor.js';
import { SearchEngine } from './SearchEngine.js';
import { debounce } from './utils.js';

export class BookmarkSearchApp {
  constructor() {
    this.bookmarkManager = new BookmarkManager();
    this.renderer = new BookmarkRenderer();
    this.editor = new BookmarkEditor(
      this.bookmarkManager, 
      this.renderer,
      () => this.renderResults() // 更新回调
    );
    this.searchEngine = new SearchEngine();
    
    this.init();
  }

  /**
   * 初始化应用
   */
  async init() {
    this.setupEventListeners();
    await this.loadBookmarks();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    const searchInput = this.renderer.elements.searchInput;
    
    // 搜索输入（使用防抖优化性能）
    const debouncedSearch = debounce((e) => this.handleSearch(e), 150);
    searchInput.addEventListener('input', debouncedSearch);
    
    // 阻止回车提交
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

  /**
   * 加载书签
   */
  async loadBookmarks() {
    try {
      this.renderer.showLoading();
      await this.bookmarkManager.loadAllBookmarks();
      this.renderResults();
      this.renderer.hideLoading();
    } catch (error) {
      this.renderer.hideLoading();
      alert(`加载书签失败: ${error.message}`);
    }
  }

  /**
   * 处理搜索
   * @param {Event} e - 输入事件
   */
  handleSearch(e) {
    const query = e.target.value.trim();
    const allBookmarks = this.bookmarkManager.getAllBookmarks();
    
    const filteredBookmarks = this.searchEngine.search(allBookmarks, query);
    this.bookmarkManager.setFilteredBookmarks(filteredBookmarks);
    
    this.renderResults();
  }

  /**
   * 渲染结果
   */
  renderResults() {
    const allBookmarks = this.bookmarkManager.getAllBookmarks();
    const filteredBookmarks = this.bookmarkManager.getFilteredBookmarks();
    const isSearching = this.renderer.elements.searchInput.value.trim() !== '';

    // 更新计数
    this.renderer.updateBookmarkCount(
      allBookmarks.length,
      filteredBookmarks.length,
      isSearching
    );

    // 渲染书签列表
    this.renderer.renderBookmarks(filteredBookmarks, {
      onEdit: (bookmarkId, titleElement, inputElement, editBtn, actionsContainer) => {
        this.editor.startEdit(bookmarkId, titleElement, inputElement, editBtn, actionsContainer);
      },
      onDelete: async (bookmarkId) => {
        await this.editor.deleteBookmark(bookmarkId);
        this.renderResults(); // 重新渲染
      }
    });
  }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  new BookmarkSearchApp();
});
