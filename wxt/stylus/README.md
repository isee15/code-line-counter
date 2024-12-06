# Stylus

一个基于 WXT (Web Extension Tools) 开发的浏览器扩展，用于管理和修改网页样式与功能。通过简单的配置，你可以自定义网页的样式和行为，实现个性化的浏览体验。

## 功能特点

### 样式管理
- 创建和管理多个样式表
- 支持 CSS 样式实时编辑和预览
- 可针对特定网站应用样式
- 支持样式的导入导出
- 内置常用样式模板

### 函数管理
- 注入自定义 JavaScript 函数
- 支持多种内容类型的处理：
  - JavaScript 代码注入
  - HTML 内容修改
  - CSS 样式动态修改
  - JSON 数据处理
- 提供预定义函数模板
- 支持函数的启用/禁用控制

### 规则系统
- 灵活的 URL 匹配规则
  - 支持正则表达式
  - 支持通配符匹配
  - 支持多个 URL 模式
- 多种规则类型：
  - 阻止资源加载
  - 修改资源内容
  - 注入自定义代码
- 规则优先级管理

### 多语言支持
- 简体中文
- 繁体中文
- 日语
- 韩语
- 英语

## 项目截图

### 主界面
![主界面](docs/images/main.png)
*样式和函数管理的主界面*

### 样式编辑器
![样式编辑器](docs/images/style-editor.png)
*强大的样式编辑功能*

### 函数编辑器
![函数编辑器](docs/images/function-editor.png)
*JavaScript 函数编辑界面*

## 技术栈

- WXT (Web Extension Tools)
- React 18
- TypeScript 5
- Stylus
- Chrome Extension Manifest V3

## 开发环境设置

### 系统要求
- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- Edge 浏览器（用于开发和测试）

### 开发步骤

1. 克隆项目

```bash
git clone [项目地址]
cd stylus
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 在 Edge 浏览器中加载扩展
- 打开 Edge 浏览器
- 访问 `edge://extensions/`
- 启用"开发人员模式"
- 点击"加载解压缩的扩展"
- 选择项目的 `dist` 目录

### 开发指南

#### 项目结构
```
stylus/
├── src/                # 源代码目录
│   ├── components/     # React 组件
│   ├── hooks/         # 自定义 Hooks
│   ├── i18n/          # 国际化文件
│   ├── store/         # 状态管理
│   └── utils/         # 工具函数
├── entrypoints/       # 扩展入口点
├── public/            # 静态资源
└── docs/             # 文档和图片
```

#### 更换扩展图标

1. 准备图标文件
   - 准备不同尺寸的图标：16x16、32x32、48x48、128x128
   - 支持的格式：PNG（推荐）或 ICO
   - 建议使用透明背景

2. 替换图标文件
   - 将准备好的图标文件放入 `public/icons/` 目录
   - 图标命名规范：
     ```
     icon-16.png
     icon-32.png
     icon-48.png
     icon-128.png
     ```

3. 更新配置文件
   - 打开 `wxt.config.ts` 文件
   - 修改图标配置：
     ```typescript
     export default defineConfig({
       manifest: {
         icons: {
           16: 'icons/icon-16.png',
           32: 'icons/icon-32.png',
           48: 'icons/icon-48.png',
           128: 'icons/icon-128.png'
         }
       }
     })
     ```

4. 重新构建扩展
   ```bash
   npm run build
   ```

#### 开发建议
- 遵循 TypeScript 类型定义
- 使用 React Hooks 进行状态管理
- 保持组件的单一职责
- 编写单元测试用例
- 使用 ESLint 和 Prettier 保持代码风格

## 编译和发布

### 开发版本

```bash
# 构建开发版本
npm run build:dev
```

### 生产版本

```bash
# 构建生产版本
npm run build
```

### Edge 插件发布步骤

1. 构建生产版本

```bash
npm run build
```

2. 打包扩展
- 生成的文件位于 `dist` 目录
- 将 `dist` 目录压缩为 ZIP 文件

3. 发布到 Edge 商店
- 访问 [Edge 开发者中心](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
- 登录开发者账号
- 点击"提交新扩展"
- 上传 ZIP 文件
- 填写扩展信息
- 提交审核

## 调试指南

### 常见问题
1. 扩展无法加载
   - 检查 manifest.json 文件格式
   - 确保权限配置正确
   - 查看浏览器控制台错误信息

2. 样式未生效
   - 检查 URL 匹配规则
   - 确认样式表是否启用
   - 查看 CSS 语法错误

3. 函数注入失败
   - 检查 JavaScript 语法
   - 确认注入时机是否正确
   - 查看控制台错误日志

### 开发工具
- Chrome DevTools
- React Developer Tools
- WXT 调试工具

## 许可证

[MIT License](LICENSE)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。在提交之前，请：

1. 查看现有的 Issue 和 PR
2. 遵循项目的代码规范
3. 编写清晰的提交信息
4. 更新相关文档
