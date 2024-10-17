import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import glob from "glob";

const globAsync = promisify(glob);

// 定义语言和文件扩展名的映射
const defaultLanguageExtensions: { [key: string]: string[] } = {
  // JavaScript: [".js", ".jsx"],
  ABAP: [".abap"],
  ActionScript: [".as"],
  Ada: [".ada", ".adb", ".ads", ".pad"],
  "ADSO/IDSM": [".adso"],
  Agda: [".agda", ".lagda"],
  AMPLE: [".ample", ".dofile", ".startup"],
  AnsProlog: [".lp"],
  Ant: [".build.xml"],
  "ANTLR Grammar": [".g", ".g4"],
  "Apex Class": [".cls"],
  "Apex Trigger": [".trigger"],
  APL: [
    ".apl",
    ".apla",
    ".aplc",
    ".aplf",
    ".apli",
    ".apln",
    ".aplo",
    ".dyalog",
    ".dyapp",
    ".mipage",
  ],
  AppleScript: [".applescript"],
  "Arduino Sketch": [".ino"],
  ArkTs: [".ets"],
  Arturo: [".art"],
  AsciiDoc: [".adoc", ".asciidoc"],
  ASP: [".asa", ".ashx", ".asp", ".axd"],
  "ASP.NET": [
    ".asax",
    ".ascx",
    ".asmx",
    ".aspx",
    ".master",
    ".sitemap",
    ".webinfo",
  ],
  AspectJ: [".aj"],
  Assembly: [".a51", ".asm", ".nasm", ".S", ".s"],
  Astro: [".astro"],
  Asymptote: [".asy"],
  AutoHotkey: [".ahk", ".ahkl"],
  awk: [".auk", ".awk", ".gawk", ".mawk", ".nawk"],
  Bazel: [".BUILD"],
  "BizTalk Orchestration": [".odx"],
  "BizTalk Pipeline": [".btp"],
  Blade: [".blade", ".blade.php"],
  "Bourne Again Shell": [".bash"],
  "Bourne Shell": [".sh"],
  BrightScript: [".brs"],
  builder: [".xml.builder"],
  C: [".c", ".cats", ".ec", ".idc", ".pgc"],
  "C Shell": [".csh", ".tcsh"],
  "C#": [".cs"],
  "C# Designer": [".designer.cs"],
  "C++": [
    ".C",
    ".c++",
    ".c++m",
    ".cc",
    ".ccm",
    ".CPP",
    ".cpp",
    ".cppm",
    ".cxx",
    ".cxxm",
    ".h++",
    ".inl",
    ".ipp",
    ".ixx",
    ".pcc",
    ".tcc",
    ".tpp",
  ],
  "C/C++ Header": [".H", ".h", ".hh", ".hpp", ".hxx"],
  Cairo: [".cairo"],
  "Cake Build Script": [".cake"],
  Carbon: [".carbon"],
  CCS: [".ccs"],
  Chapel: [".chpl"],
  Circom: [".circom"],
  Clean: [".dcl", ".icl"],
  Clojure: [
    ".boot",
    ".cl2",
    ".clj",
    ".cljs.hl",
    ".cljscm",
    ".cljx",
    ".hic",
    ".riemann.config",
  ],
  ClojureC: [".cljc"],
  ClojureScript: [".cljs"],
  CMake: [".cmake", ".cmake.in", ".CMakeLists.txt"],
  COBOL: [".CBL", ".cbl", ".ccp", ".COB", ".cob", ".cobol", ".cpy"],
  "CoCoA 5": [".c5", ".cocoa5", ".cocoa5server", ".cpkg5"],
  CoffeeScript: [".coffee", ".cakefile", ".cjsx", ".iced"],
  ColdFusion: [".cfm", ".cfml"],
  "ColdFusion CFScript": [".cfc"],
  "Constraint Grammar": [".cg3", ".rlx"],
  Containerfile: [".Containerfile"],
  Coq: [".v"],
  Crystal: [".cr"],
  CSON: [".cson"],
  CSS: [".css"],
  CSV: [".csv"],
  Cucumber: [".feature"],
  CUDA: [".cu", ".cuh"],
  Cython: [".pxd", ".pxi", ".pyx"],
  D: [".d"],
  Dafny: [".dfy"],
  DAL: [".da"],
  Dart: [".dart"],
  "Delphi Form": [".dfm"],
  DenizenScript: [".dsc"],
  Derw: [".derw"],
  dhall: [".dhall"],
  DIET: [".dt"],
  diff: [".diff", ".patch"],
  DITA: [".dita"],
  Dockerfile: [".Dockerfile", ".dockerfile"],
  "DOORS Extension Language": [".dxl"],
  "DOS Batch": [".BAT", ".bat", ".BTM", ".btm", ".CMD", ".cmd"],
  Drools: [".drl"],
  DTD: [".dtd"],
  dtrace: [".d"],
  ECPP: [".ecpp"],
  EEx: [".eex"],
  EJS: [".ejs"],
  Elixir: [".ex", ".exs"],
  Elm: [".elm"],
  "Embedded Crystal": [".ecr"],
  ERB: [".ERB", ".erb"],
  Erlang: [
    ".app.src",
    ".emakefile",
    ".erl",
    ".hrl",
    ".rebar.config",
    ".rebar.config.lock",
    ".rebar.lock",
    ".xrl",
    ".yrl",
  ],
  Expect: [".exp"],
  "F#": [".fsi", ".fs", ".fs"],
  "F# Script": [".fsx"],
  Fennel: [".fnl"],
  "Finite State Language": [".fsl", ".jssm"],
  "Fish Shell": [".fish"],
  Flatbuffers: [".fbs"],
  Focus: [".focexec"],
  Forth: [
    ".4th",
    ".e4",
    ".f83",
    ".fb",
    ".forth",
    ".fpm",
    ".fr",
    ".frt",
    ".ft",
    ".fth",
    ".rx",
    ".fs",
    ".f",
    ".for",
  ],
  "Fortran 77": [
    ".F",
    ".F77",
    ".f77",
    ".FOR",
    ".FTN",
    ".ftn",
    ".pfo",
    ".f",
    ".for",
  ],
  "Fortran 90": [".F90", ".f90"],
  "Fortran 95": [".F95", ".f95"],
  "Freemarker Template": [".ftl"],
  Futhark: [".fut"],
  FXML: [".fxml"],
  GDScript: [".gd"],
  "Gencat NLS": [".msg"],
  Glade: [".glade", ".ui"],
  Gleam: [".gleam"],
  "Glimmer JavaScript": [".gjs"],
  "Glimmer TypeScript": [".gts"],
  GLSL: [
    ".comp",
    ".fp",
    ".frag",
    ".frg",
    ".fsh",
    ".fshader",
    ".geo",
    ".geom",
    ".glsl",
    ".glslv",
    ".gshader",
    ".tesc",
    ".tese",
    ".vert",
    ".vrx",
    ".vsh",
    ".vshader",
  ],
  Go: [".go", ".ʕ◔ϖ◔ʔ"],
  "Godot Resource": [".tres"],
  "Godot Scene": [".tscn"],
  "Godot Shaders": [".gdshader"],
  Gradle: [".gradle", ".gradle.kts"],
  Grails: [".gsp"],
  GraphQL: [".gql", ".graphql", ".graphqls"],
  Groovy: [".gant", ".groovy", ".grt", ".gtpl", ".gvy", ".jenkinsfile"],
  Haml: [".haml", ".haml.deface"],
  Handlebars: [".handlebars", ".hbs"],
  Harbour: [".hb"],
  Hare: [".ha"],
  Haskell: [".hs", ".hsc", ".lhs"],
  Haxe: [".hx", ".hxsl"],
  HCL: [".hcl", ".nomad", ".tf", ".tfvars"],
  HLSL: [".cg", ".cginc", ".fxh", ".hlsl", ".hlsli", ".shader"],
  HolyC: [".HC"],
  Hoon: [".hoon"],
  HTML: [".htm", ".html", ".html.hl", ".xht"],
  "HTML EEx": [".heex"],
  IDL: [".dlm", ".idl", ".pro"],
  Idris: [".idr"],
  "Igor Pro": [".ipf"],
  Imba: [".imba"],
  INI: [".buildozer.spec", ".editorconfig", ".ini", ".lektorproject", ".prefs"],
  InstallShield: [".ism"],
  IPL: [".ipl"],
  Jai: [".jai"],
  Janet: [".janet"],
  Java: [".java"],
  JavaScript: [".js", ".jsx"],
  "JavaServer Faces": [".jsf"],
  JCL: [".jcl"],
  "Jinja Template": [".j2", ".jinja", ".jinja2"],
  JSON: [
    ".arcconfig",
    ".avsc",
    ".composer.lock",
    ".geojson",
    ".gltf",
    ".har",
    ".htmlhintrc",
    ".json",
    ".json-tmlanguage",
    ".jsonl",
    ".mcmeta",
    ".mcmod.info",
    ".tern-config",
    ".tern-project",
    ".tfstate",
    ".tfstate.backup",
    ".topojson",
    ".watchmanconfig",
    ".webapp",
    ".webmanifest",
    ".yyp",
  ],
  JSON5: [".json5"],
  JSP: [".jsp", ".jspf"],
  JSX: [".jsx"],
  Julia: [".jl"],
  "Juniper Junos": [".junos"],
  "Jupyter Notebook": [".ipynb"],
  Kermit: [".ksc"],
  "Korn Shell": [".ksh"],
  Kotlin: [".kt", ".kts"],
  "Kotlin Script": [".kts"],
  "Ladder Logic": [".lad", ".ladder"],
  Lasso: [".las"],
  LCL: [".lcl"],
  Lemon: [".y"],
  LFE: [".lfe"],
  LilyPond: [".ly"],
  Liquid: [".liquid"],
  Lisp: [".lisp", ".lsp", ".cl"],
  LiveCode: [".livecode"],
  Logtalk: [".lgt"],
  LotusScript: [".lotusscript"],
  Lua: [".lua"],
  M4: [".m4"],
  Makefile: [".makefile", ".mk", ".Makefile"],
  Malbolge: [".malbolge"],
  Markdown: [".markdown", ".md", ".mkd"],
  MATLAB: [".m"],
  MaxScript: [".ms"],
  "Maya Embedded Language": [".mel"],
  Mercury: [".m"],
  Miranda: [".mira"],
  Mojolicious: [".pl", ".pm"],
  Monkey: [".monkey"],
  Moonscript: [".moon"],
  MQL4: [".mq4"],
  MQL5: [".mq5"],
  MSBuild: [".msbuild"],
  MUMPS: [".mumps", ".m"],
  NATURAL: [".ntr"],
  Nim: [".nim"],
  Ninja: [".ninja"],
  Nix: [".nix"],
  Nmap: [".nmap"],
  OCaml: [".ml", ".mli"],
  "OpenEdge ABL": [".p"],
  OpenSCAD: [".scad"],
  OpenType: [".otf"],
  "Oracle PL/SQL": [".plsql", ".plb"],
  Oz: [".oz"],
  P: [".p"],
  P4: [".p4"],
  PASCAL: [".p", ".pas"],
  "Pascal Script": [".pascal"],
  "PascalABC.NET": [".pas"],
  Perl: [".pl", ".pm"],
  PGP: [".gpg"],
  PHP: [".php", ".php3", ".php4", ".php5", ".phtml"],
  Pike: [".pike"],
  "PL/I": [".pli"],
  "PL/SQL": [".plsql"],
  PostScript: [".ps"],
  PowerBuilder: [".pb"],
  PowerShell: [".ps1", ".psd1", ".psm1"],
  Processing: [".pde"],
  Prolog: [".pl", ".pro"],
  PromQL: [".promql"],
  "Protocol Buffers": [".proto"],
  PureScript: [".purs"],
  Python: [".py", ".pyc", ".pyd", ".pyo"],
  QML: [".qml"],
  R: [".r", ".R"],
  Raku: [".raku"],
  Razor: [".razor"],
  Reason: [".re"],
  Rebol: [".r"],
  Red: [".red"],
  "Reinforcement Learning": [".rl"],
  Remedy: [".remedy"],
  RPG: [".rpg"],
  Ruby: [".rb"],
  Rust: [".rs"],
  S: [".S", ".s"],
  "S-Plus": [".s"],
  SAS: [".sas"],
  Sass: [".sass"],
  Scala: [".scala"],
  Scheme: [".scm", ".ss", ".sls"],
  Scilab: [".sce"],
  Scratch: [".sb", ".sb2", ".sb3"],
  Sed: [".sed"],
  Schematic: [".sch"],
  Shell: [".sh"],
  Shiny: [".R"],
  Shor: [".shor"],
  Simulink: [".slx"],
  SML: [".sml"],
  Solidity: [".sol"],
  SourcePawn: [".sp", ".inc"],
  SPICE: [".sp"],
  SPSS: [".sav"],
  SQL: [".sql"],
  Squirrel: [".nut"],
  SRecode: [".srecode"],
  Stata: [".do", ".dta"],
  Swift: [".swift"],
  Tcl: [".tcl"],
  Tidy: [".tidy"],
  TypeScript: [".ts", ".tsx"],
  VBScript: [".vbs"],
  Verilog: [".v", ".sv"],
  VHDL: [".vhd", ".vhdl"],
  "Visual FoxPro": [".prg"],
  "Visual Basic": [".bas", ".frm", ".cls"],
  "Vue.js": [".vue"],
  WebAssembly: [".wasm"],
  Wolfram: [".w"],
  "Wolfram Language": [".wl"],
  "Wolfram Markup Language": [".wml"],
  X11: [".x11"],
  XQuery: [".xqy", ".xql"],
  YAML: [".yaml", ".yml"],
  Zig: [".zig"],
  ZSH: [".zsh"],
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

  const countCodeLinesDisposable = vscode.commands.registerCommand(
    "codeLineCounter.countCodeLines",
    () => countCodeLines()
  );

  const countCodeLinesInFolderDisposable = vscode.commands.registerCommand(
    "codeLineCounter.countCodeLinesInFolder",
    (folderUri: vscode.Uri) => countCodeLines([folderUri.fsPath])
  );

  context.subscriptions.push(
    countCodeLinesDisposable,
    countCodeLinesInFolderDisposable
  );
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
  const defaultSrcPath = path.join(rootPath, "src");

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
    includeDirs = includeInput.split(",").map((dir) => dir.trim());
  }

  if (excludeInput !== undefined) {
    excludePatterns = excludeInput.split(",").map((pattern) => pattern.trim());
  }

  // 更新配置
  await config.update(
    "includeDirs",
    includeDirs,
    vscode.ConfigurationTarget.Workspace
  );
  await config.update(
    "excludePatterns",
    excludePatterns,
    vscode.ConfigurationTarget.Workspace
  );

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

function displayResults(
  stats: LanguageStats,
  includeDirs: string[],
  excludePatterns: string[]
): void {
  let message = "代码行统计结果:\n\n";

  // 显示包含的文件夹
  message += "包含的文件夹:\n";
  includeDirs.forEach((dir) => {
    message += `  - ${dir}\n`;
  });
  message += "\n";

  // 显示排除的模式
  message += "排除的模式:\n";
  excludePatterns.forEach((pattern) => {
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
