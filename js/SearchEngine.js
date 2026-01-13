/**
 * 搜索引擎类
 */
export class SearchEngine {
  /**
   * 搜索书签
   * @param {Array} bookmarks - 书签数组
   * @param {string} query - 搜索关键词
   * @returns {Array} 匹配的书签数组
   */
  search(bookmarks, query) {
    if (!query || query.trim() === '') {
      return bookmarks;
    }

    const lowerQuery = query.trim().toLowerCase();
    
    return bookmarks.filter(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(lowerQuery);
      const urlMatch = bookmark.url.toLowerCase().includes(lowerQuery);
      const pathMatch = bookmark.path && bookmark.path.toLowerCase().includes(lowerQuery);
      
      return titleMatch || urlMatch || pathMatch;
    });
  }
}
