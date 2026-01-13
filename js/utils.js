/**
 * 工具函数
 */

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
export function showError(message) {
  // 可以使用更优雅的提示方式，暂时使用 alert
  alert(message);
}

/**
 * 确认对话框
 * @param {string} message - 确认消息
 * @returns {boolean} 用户是否确认
 */
export function confirmAction(message) {
  return confirm(message);
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 创建按钮元素
 * @param {string} text - 按钮文本
 * @param {string} className - CSS 类名
 * @param {Function} onClick - 点击事件处理函数
 * @returns {HTMLButtonElement} 按钮元素
 */
export function createButton(text, className, onClick) {
  const button = document.createElement('button');
  button.className = `btn ${className}`;
  button.textContent = text;
  if (onClick) {
    button.onclick = onClick;
  }
  return button;
}

/**
 * Chrome API Promise 包装器
 * @param {Function} chromeApiFunction - Chrome API 函数
 * @param {...any} args - API 函数参数
 * @returns {Promise} Promise 对象
 */
export function promisifyChromeAPI(chromeApiFunction, ...args) {
  return new Promise((resolve, reject) => {
    chromeApiFunction(...args, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}
