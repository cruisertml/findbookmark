/**
 * 配置常量
 */
export const CONFIG = {
  // DOM 元素 ID
  ELEMENTS: {
    SEARCH_INPUT: 'searchInput',
    RESULTS_LIST: 'resultsList',
    LOADING: 'loading',
    NO_RESULTS: 'noResults',
    BOOKMARK_COUNT: 'bookmarkCount'
  },
  
  // CSS 类名
  CLASSES: {
    HIDDEN: 'hidden',
    EDITING: 'editing'
  },
  
  // 根节点 ID（Chrome 书签树的特殊节点）
  ROOT_NODE_IDS: ['0', '1', '2'],
  
  // 默认路径
  DEFAULT_PATH: '书签栏',
  
  // 路径分隔符
  PATH_SEPARATOR: ' / ',
  
  // 按钮文本
  BUTTONS: {
    EDIT: '编辑',
    SAVE: '保存',
    CANCEL: '取消',
    DELETE: '删除'
  }
};
