# Code Line Counter

Code Line Counter 是一个 Visual Studio Code 扩展，用于统计多个目录中的代码行数。

## Cursor

本项目所有代码由Cursor完成

## 功能

- 统计指定目录中的代码行数
- 支持多种编程语言
- 可以通过右键菜单快速统计特定文件夹的代码行数
- 可配置包含和排除的目录/文件模式

## 使用方法

1. 在 VS Code 中安装 Code Line Counter 扩展。

2. 使用命令面板统计代码行数：
   - 按 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（Mac）打开命令面板
   - 输入 "Count Code Lines" 并选择该命令

3. 使用右键菜单统计特定文件夹的代码行数：
   - 在 VS Code 的文件资源管理器中右键点击一个文件夹
   - 选择 "Count Code Lines in This Folder"

4. 配置扩展：
   - 打开 VS Code 的设置
   - 搜索 "Code Line Counter"
   - 可以配置以下选项：
     - `codeLineCounter.includeDirs`: 要统计的目录列表
     - `codeLineCounter.excludePatterns`: 要排除的文件或文件夹模式

## 开发

如果您想要修改或构建这个扩展，请按照以下步骤操作：

1. 克隆仓库：
   ```
   git clone <repository-url>
   cd code-line-counter
   ```

2. 安装依赖：
   ```
   pnpm install
   ```

3. 编译 TypeScript：
   ```
   pnpm run compile
   ```

4. 打包扩展：
   ```
   python build_vsix.py
   ```

## 发布流程

要发布这个扩展到 Visual Studio Code Marketplace，请按照以下步骤操作：

1. 确保您有一个 Visual Studio Marketplace 账户。如果没有，请在 https://marketplace.visualstudio.com/manage 创建一个。

2. 创建一个发布者（Publisher）：
   - 在 Marketplace 管理页面创建一个新的发布者或使用现有的发布者。

3. 获取个人访问令牌（Personal Access Token）：
   - 访问 https://dev.azure.com
   - 点击右上角的用户图标，选择"Security"
   - 在左侧菜单中选择"Personal access tokens"
   - 点击"New Token"
   - 给令牌一个名称，选择组织，设置过期时间
   - 在"Scopes"下，选择"Custom defined"，然后选择"Marketplace > Manage"
   - 点击"Create"，并保存生成的令牌

4. 使用令牌登录 vsce：
   ```
   vsce login <your_publisher_name>
   ```
   系统会提示您输入令牌。

5. 更新 package.json 中的版本号（如果需要）。

6. 发布扩展：
   ```
   python build_vsix.py -p
   ```

   这个命令会自动打包并发布扩展到 Marketplace。

注意：每次发布新版本时，都需要更新 `package.json` 中的版本号。

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个扩展。

## 许可证

[MIT License](LICENSE)
