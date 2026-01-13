# 打包扩展指南

在提交到 Chrome Web Store 之前，需要将扩展打包为 ZIP 文件。

## 快速打包步骤

### Windows 系统

1. **选择需要打包的文件**
   - 在文件资源管理器中，进入项目目录
   - 选中以下文件和文件夹：
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `popup.css`
     - `icons/` 文件夹（包含所有图标）

2. **创建 ZIP 文件**
   - 右键点击选中的文件
   - 选择"发送到" → "压缩(zipped)文件夹"
   - 或使用压缩软件（如 WinRAR、7-Zip）创建 ZIP 文件

3. **重命名**
   - 将 ZIP 文件重命名为 `bookmark-search-extension-v1.0.0.zip`（或您喜欢的名称）

### Mac 系统

1. **选择文件**
   - 在 Finder 中选中需要打包的文件和文件夹

2. **创建 ZIP**
   - 右键点击选中的文件
   - 选择"压缩 X 个项目"
   - 会自动创建 `归档.zip` 文件

3. **重命名**
   - 重命名为合适的名称

### Linux 系统

使用命令行：

```bash
# 进入项目目录
cd /path/to/findbookmark

# 创建 ZIP 文件（排除不需要的文件）
zip -r bookmark-search-extension-v1.0.0.zip \
  manifest.json \
  popup.html \
  popup.js \
  popup.css \
  icons/
```

## 打包检查清单

打包前请确认：

- [ ] `manifest.json` 存在且格式正确
- [ ] `popup.html` 存在
- [ ] `popup.js` 存在
- [ ] `popup.css` 存在
- [ ] `icons/` 文件夹存在
- [ ] `icons/icon16.png` 存在
- [ ] `icons/icon48.png` 存在
- [ ] `icons/icon128.png` 存在
- [ ] ZIP 文件大小 < 10MB
- [ ] 没有包含以下文件：
  - `README.md`
  - `CHROME_STORE_GUIDE.md`
  - `PACKAGING_GUIDE.md`
  - `PRIVACY_POLICY.md`
  - `create-icons.html`
  - `.git/` 文件夹
  - 其他开发文件

## 验证 ZIP 文件

1. **解压测试**
   - 将 ZIP 文件解压到新文件夹
   - 确认所有必需文件都在

2. **加载测试**
   - 在 Chrome 中打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹
   - 确认扩展可以正常加载和运行

## 常见问题

### Q: ZIP 文件应该包含哪些文件？
A: 只包含运行扩展必需的文件：
- manifest.json
- popup.html
- popup.js
- popup.css
- icons/ 文件夹

### Q: 可以包含 README 吗？
A: 不建议。Chrome Web Store 不需要这些文件，会增加文件大小。

### Q: ZIP 文件大小限制是多少？
A: Chrome Web Store 限制为 10MB。本扩展通常只有几百 KB。

### Q: 需要压缩级别吗？
A: 不需要特殊设置，使用默认压缩即可。

## 自动化打包脚本（可选）

如果您熟悉命令行，可以创建自动化脚本：

### Windows (PowerShell)

```powershell
# package.ps1
$files = @(
    "manifest.json",
    "popup.html",
    "popup.js",
    "popup.css",
    "icons"
)

Compress-Archive -Path $files -DestinationPath "bookmark-search-extension-v1.0.0.zip" -Force
Write-Host "打包完成！"
```

### Mac/Linux (Bash)

```bash
#!/bin/bash
# package.sh

VERSION="1.0.0"
ZIP_NAME="bookmark-search-extension-v${VERSION}.zip"

zip -r "$ZIP_NAME" \
  manifest.json \
  popup.html \
  popup.js \
  popup.css \
  icons/ \
  -x "*.md" "*.html" ".git/*"

echo "打包完成：$ZIP_NAME"
```

使用方法：
```bash
chmod +x package.sh
./package.sh
```

---

打包完成后，就可以按照 `CHROME_STORE_GUIDE.md` 中的步骤提交到 Chrome Web Store 了！

