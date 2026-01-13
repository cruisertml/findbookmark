/**
 * 书签数据管理类
 */
import { promisifyChromeAPI } from './utils.js';
import { CONFIG } from './config.js';

export class BookmarkManager {
  constructor() {
    this.allBookmarks = [];
    this.filteredBookmarks = [];
    this.bookmarkTree = null;
  }

  /**
   * 加载所有书签
   * @returns {Promise<void>}
   */
  async loadAllBookmarks() {
    try {
      const bookmarkTreeNodes = await promisifyChromeAPI(chrome.bookmarks.getTree);
      this.bookmarkTree = bookmarkTreeNodes;
      this.allBookmarks = [];
      this.extractBookmarks(bookmarkTreeNodes, []);
      this.filteredBookmarks = [...this.allBookmarks];
      return this.allBookmarks;
    } catch (error) {
      throw new Error(`加载书签失败: ${error.message}`);
    }
  }

  /**
   * 递归提取所有书签
   * @param {Array} nodes - 书签树节点
   * @param {Array} path - 当前路径
   */
  extractBookmarks(nodes, path) {
    nodes.forEach(node => {
      const currentPath = [...path];
      
      // 跳过根节点
      if (!CONFIG.ROOT_NODE_IDS.includes(node.id)) {
        currentPath.push(node.title);
      }
      
      if (node.url) {
        // 这是一个书签（不是文件夹）
        const pathString = currentPath.length > 0 
          ? currentPath.join(CONFIG.PATH_SEPARATOR) 
          : CONFIG.DEFAULT_PATH;
        
        this.allBookmarks.push({
          id: node.id,
          title: node.title,
          url: node.url,
          path: pathString,
          parentId: node.parentId
        });
      }
      
      if (node.children) {
        // 递归处理子节点
        this.extractBookmarks(node.children, currentPath);
      }
    });
  }

  /**
   * 更新书签标题
   * @param {string} bookmarkId - 书签 ID
   * @param {string} newTitle - 新标题
   * @returns {Promise<Object>} 更新后的书签
   */
  async updateBookmarkTitle(bookmarkId, newTitle) {
    try {
      const updatedBookmark = await promisifyChromeAPI(
        chrome.bookmarks.update,
        bookmarkId,
        { title: newTitle }
      );
      
      // 更新本地数据
      const bookmark = this.allBookmarks.find(b => b.id === bookmarkId);
      if (bookmark) {
        bookmark.title = newTitle;
      }
      
      return updatedBookmark;
    } catch (error) {
      throw new Error(`更新书签失败: ${error.message}`);
    }
  }

  /**
   * 删除书签
   * @param {string} bookmarkId - 书签 ID
   * @returns {Promise<void>}
   */
  async deleteBookmark(bookmarkId) {
    try {
      await promisifyChromeAPI(chrome.bookmarks.remove, bookmarkId);
      
      // 从本地数据中移除
      this.allBookmarks = this.allBookmarks.filter(b => b.id !== bookmarkId);
      this.filteredBookmarks = this.filteredBookmarks.filter(b => b.id !== bookmarkId);
      
      return true;
    } catch (error) {
      throw new Error(`删除书签失败: ${error.message}`);
    }
  }

  /**
   * 获取所有书签
   * @returns {Array} 所有书签数组
   */
  getAllBookmarks() {
    return this.allBookmarks;
  }

  /**
   * 获取过滤后的书签
   * @returns {Array} 过滤后的书签数组
   */
  getFilteredBookmarks() {
    return this.filteredBookmarks;
  }

  /**
   * 设置过滤后的书签
   * @param {Array} bookmarks - 书签数组
   */
  setFilteredBookmarks(bookmarks) {
    this.filteredBookmarks = bookmarks;
  }

  /**
   * 根据 ID 查找书签
   * @param {string} bookmarkId - 书签 ID
   * @returns {Object|null} 书签对象
   */
  findBookmarkById(bookmarkId) {
    return this.allBookmarks.find(b => b.id === bookmarkId) || null;
  }
}
