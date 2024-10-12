import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import glob from "glob";

const globAsync = promisify(glob);

// 定义语言和文件扩展名的映射
const defaultLanguageExtensions: { [key: string]: string[] } = {
  JavaScript: [".js", ".jsx"],
  TypeScript: [".ts", ".tsx"],
  Python: [".py"],
  Java: [".java"],
  "C++": [".cpp", ".hpp", ".h"],
  // 可以根据需要添加更多语言
};

interface CodeStats {
  totalLines: number;
  codeLines: number;
  blankLines: number;
}

interface LanguageStats {
  [language: string]: CodeStats;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Code Line Counter 扩展已激活");

  let countCodeLinesDisposable = vscode.commands.registerCommand(
    "codeLineCounter.countCodeLines",
    () => countCodeLines()
  );

  let countCodeLinesInFolderDisposable = vscode.commands.registerCommand(
    "codeLineCounter.countCodeLinesInFolder",
    (folderUri: vscode.Uri) => countCodeLines([folderUri.fsPath])
  );

  context.subscriptions.push(countCodeLinesDisposable, countCodeLinesInFolderDisposable);
  console.log("countCodeLines 命令已注册");
}

async function countCodeLines(initialIncludeDirs: string[] = []) {
  console.log("countCodeLines 命令已执行");
  
  // 获取当前工作区
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("没有打开的工作区。");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const defaultSrcPath = path.join(rootPath, 'src');

  // 获取当前配置
  const config = vscode.workspace.getConfiguration("codeLineCounter");
  let includeDirs = config.get<string[]>("includeDirs") || [];
  let excludePatterns = config.get<string[]>("excludePatterns") || [];

  // 如果有初始包含目录，添加到 includeDirs
  includeDirs = [...new Set([...initialIncludeDirs, ...includeDirs])];

  // 如果 includeDirs 为空，默认添加 src 目录
  if (includeDirs.length === 0 && fs.existsSync(defaultSrcPath)) {
    includeDirs = [defaultSrcPath];
  }

  // 弹出配置窗口
  const includeInput = await vscode.window.showInputBox({
    prompt: "请输入要包含的目录（用逗号分隔）",
    value: includeDirs.join(", "),
  });

  const excludeInput = await vscode.window.showInputBox({
    prompt: "请输入要排除的模式（用逗号分隔）",
    value: excludePatterns.join(", "),
  });

  if (includeInput !== undefined) {
    includeDirs = includeInput.split(",").map(dir => dir.trim());
  }

  if (excludeInput !== undefined) {
    excludePatterns = excludeInput.split(",").map(pattern => pattern.trim());
  }

  // 更新配置
  await config.update("includeDirs", includeDirs, vscode.ConfigurationTarget.Workspace);
  await config.update("excludePatterns", excludePatterns, vscode.ConfigurationTarget.Workspace);

  const userDefinedLanguages =
    config.get<{ [key: string]: string[] }>("languageExtensions") || {};
  const languageExtensions = {
    ...defaultLanguageExtensions,
    ...userDefinedLanguages,
  };

  if (includeDirs.length === 0) {
    vscode.window.showErrorMessage("请指定要统计的目录。");
    return;
  }

  const stats: LanguageStats = {};

  for (const dir of includeDirs) {
    await countLinesInDirectory(
      dir,
      excludePatterns,
      stats,
      languageExtensions
    );
  }

  displayResults(stats, includeDirs, excludePatterns);
}

async function countLinesInDirectory(
  dir: string,
  excludePatterns: string[],
  stats: LanguageStats,
  languageExtensions: { [key: string]: string[] }
): Promise<void> {
  const files = await globAsync("**/*", {
    cwd: dir,
    ignore: excludePatterns,
    nodir: true,
  });

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const fileStat = await fs.promises.stat(fullPath);
      if (!fileStat.isFile()) continue;

      const ext = path.extname(file).toLowerCase();
      const language = getLanguageFromExtension(ext, languageExtensions);

      if (language) {
        const content = await fs.promises.readFile(fullPath, "utf-8");
        const lines = content.split("\n");
        const codeLines = lines.filter((line) => line.trim() !== "").length;
        const blankLines = lines.length - codeLines;

        if (!stats[language]) {
          stats[language] = { totalLines: 0, codeLines: 0, blankLines: 0 };
        }
        stats[language].totalLines += lines.length;
        stats[language].codeLines += codeLines;
        stats[language].blankLines += blankLines;
      }
    } catch (error) {
      console.error(`读取文件 ${fullPath} 时发生错误:`, error);
    }
  }
}

function getLanguageFromExtension(
  ext: string,
  languageExtensions: { [key: string]: string[] }
): string | null {
  for (const [language, extensions] of Object.entries(languageExtensions)) {
    if (extensions.includes(ext)) {
      return language;
    }
  }
  return null;
}

function displayResults(stats: LanguageStats, includeDirs: string[], excludePatterns: string[]): void {
  let message = "代码行统计结果:\n\n";
  
  // 显示包含的文件夹
  message += "包含的文件夹:\n";
  includeDirs.forEach(dir => {
    message += `  - ${dir}\n`;
  });
  message += "\n";

  // 显示排除的模式
  message += "排除的模式:\n";
  excludePatterns.forEach(pattern => {
    message += `  - ${pattern}\n`;
  });
  message += "\n";

  let totalLines = 0;
  let totalCodeLines = 0;
  let totalBlankLines = 0;

  for (const [
    language,
    { totalLines: lines, codeLines, blankLines },
  ] of Object.entries(stats)) {
    message += `${language}:\n`;
    message += `  总行数: ${lines}\n`;
    message += `  代码行: ${codeLines}\n`;
    message += `  空行: ${blankLines}\n\n`;

    totalLines += lines;
    totalCodeLines += codeLines;
    totalBlankLines += blankLines;
  }

  message += "总计:\n";
  message += `  总行数: ${totalLines}\n`;
  message += `  代码行: ${totalCodeLines}\n`;
  message += `  空行: ${totalBlankLines}\n`;

  vscode.window.showInformationMessage(message, { modal: true });
}

export function deactivate() {}
