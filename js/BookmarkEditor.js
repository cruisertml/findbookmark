/**
 * 书签编辑器类
 */
import { CONFIG } from './config.js';
import { createButton } from './utils.js';

export class BookmarkEditor {
  constructor(bookmarkManager, renderer, onUpdateCallback) {
    this.bookmarkManager = bookmarkManager;
    this.renderer = renderer;
    this.onUpdateCallback = onUpdateCallback; // 更新后的回调函数
  }

  /**
   * 开始编辑书签
   * @param {string} bookmarkId - 书签 ID
   * @param {HTMLElement} titleElement - 标题元素
   * @param {HTMLInputElement} inputElement - 输入框元素
   * @param {HTMLElement} editBtn - 编辑按钮
   * @param {HTMLElement} actionsContainer - 操作按钮容器
   */
  startEdit(bookmarkId, titleElement, inputElement, editBtn, actionsContainer) {
    titleElement.classList.add(CONFIG.CLASSES.EDITING);
    inputElement.classList.remove(CONFIG.CLASSES.HIDDEN);
    inputElement.focus();
    inputElement.select();

    // 创建保存和取消按钮
    const saveBtn = createButton(CONFIG.BUTTONS.SAVE, 'btn-save', () => {
      this.saveBookmark(bookmarkId, inputElement.value, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
    });

    const cancelBtn = createButton(CONFIG.BUTTONS.CANCEL, 'btn-cancel', () => {
      this.cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
    });

    // 替换按钮
    actionsContainer.innerHTML = '';
    actionsContainer.appendChild(saveBtn);
    actionsContainer.appendChild(cancelBtn);

    // 键盘事件处理
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveBookmark(bookmarkId, inputElement.value, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
        inputElement.removeEventListener('keydown', handleKeyDown);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer);
        inputElement.removeEventListener('keydown', handleKeyDown);
      }
    };

    inputElement.addEventListener('keydown', handleKeyDown);
  }

  /**
   * 保存书签
   * @param {string} bookmarkId - 书签 ID
   * @param {string} newTitle - 新标题
   * @param {HTMLElement} titleElement - 标题元素
   * @param {HTMLInputElement} inputElement - 输入框元素
   * @param {HTMLElement} editBtn - 编辑按钮
   * @param {HTMLElement} saveBtn - 保存按钮
   * @param {HTMLElement} cancelBtn - 取消按钮
   * @param {HTMLElement} actionsContainer - 操作按钮容器
   */
  async saveBookmark(bookmarkId, newTitle, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer) {
    if (newTitle.trim() === '') {
      alert('书签名称不能为空');
      return;
    }

    try {
      await this.bookmarkManager.updateBookmarkTitle(bookmarkId, newTitle);
      
      // 更新UI
      titleElement.textContent = newTitle;
      titleElement.classList.remove(CONFIG.CLASSES.EDITING);
      inputElement.classList.add(CONFIG.CLASSES.HIDDEN);

      // 恢复按钮
      this.restoreActionButtons(bookmarkId, editBtn, actionsContainer);
      
      // 触发更新回调（如果需要重新搜索）
      if (this.onUpdateCallback) {
        this.onUpdateCallback();
      }
    } catch (error) {
      alert(`保存失败: ${error.message}`);
    }
  }

  /**
   * 取消编辑
   * @param {string} bookmarkId - 书签 ID
   * @param {HTMLElement} titleElement - 标题元素
   * @param {HTMLInputElement} inputElement - 输入框元素
   * @param {HTMLElement} editBtn - 编辑按钮
   * @param {HTMLElement} saveBtn - 保存按钮
   * @param {HTMLElement} cancelBtn - 取消按钮
   * @param {HTMLElement} actionsContainer - 操作按钮容器
   */
  cancelEdit(bookmarkId, titleElement, inputElement, editBtn, saveBtn, cancelBtn, actionsContainer) {
    // 恢复原始值
    const bookmark = this.bookmarkManager.findBookmarkById(bookmarkId);
    if (bookmark) {
      inputElement.value = bookmark.title;
    }

    titleElement.classList.remove(CONFIG.CLASSES.EDITING);
    inputElement.classList.add(CONFIG.CLASSES.HIDDEN);

    // 恢复按钮
    this.restoreActionButtons(bookmarkId, editBtn, actionsContainer);
  }

  /**
   * 恢复操作按钮（编辑和删除）
   * @param {string} bookmarkId - 书签 ID
   * @param {HTMLElement} editBtn - 编辑按钮
   * @param {HTMLElement} actionsContainer - 操作按钮容器
   */
  restoreActionButtons(bookmarkId, editBtn, actionsContainer) {
    const deleteBtn = createButton(CONFIG.BUTTONS.DELETE, 'btn-delete', () => {
      this.deleteBookmark(bookmarkId);
    });

    actionsContainer.innerHTML = '';
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);
  }

  /**
   * 删除书签
   * @param {string} bookmarkId - 书签 ID
   */
  async deleteBookmark(bookmarkId) {
    if (!confirm('确定要删除这个书签吗？')) {
      return;
    }

    try {
      await this.bookmarkManager.deleteBookmark(bookmarkId);
      
      // 触发更新回调
      if (this.onUpdateCallback) {
        this.onUpdateCallback();
      }
    } catch (error) {
      alert(`删除失败: ${error.message}`);
    }
  }
}
