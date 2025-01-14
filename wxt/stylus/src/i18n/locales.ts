interface Translation {
  [key: string]: string | Translation;
}

interface Translations {
  [locale: string]: Translation;
}

export const translations: Translations = {
  'zh-CN': {
    common: {
      save: '保存',
      delete: '删除',
      create: '新建',
      enabled: '启用',
      disabled: '禁用',
      name: '名称',
      url: 'URL',
      type: '类型',
      content: '内容',
      description: '描述',
      function: '函数',
    },
    app: {
      title: 'Stylus',
      styleManager: '样式管理',
      resourceManager: '函数管理',
      switchLanguage: '切换语言',
    },
    style: {
      newStyleSheet: '新建样式表',
      saveStyle: '保存样式',
      styleSaved: '样式已保存并应用',
      saveFailed: '保存失败',
      enterStyleName: '输入样式表名称',
    },
    rule: {
      newRule: '新建规则',
      urlPattern: 'URL 匹配模式（正则表达式）',
      urlPatternPlaceholder: '例如：.*\\.js$',
      contentType: '内容类型',
      ruleType: '规则类型',
      blockResource: '阻止加载',
      modifyContent: '修改内容',
      injectFunction: '注入函数',
      replacementContent: '替换内容',
      replacementContentHint: '将匹配到的资源内容替换为以下内容',
      injectionFunction: '注入函数',
      injectionFunctionHint: '在页面上下文中执行的函数代码',
      enterContent: '输入要替换的内容',
      enterFunction: '输入要注入的函数代码',
      examples: {
        title: '示例：',
        replaceJS: '替换JS',
        replaceCSS: '替换CSS',
        replaceHTML: '替换HTML',
        replaceJSON: '替换JSON',
        modifyElements: '修改页面元素',
        injectScript: '注入自定义脚本',
        listenEvents: '监听页面事件',
      },
      vConsoleDescription: '这是一个内置规则，用于在网页中注入调试面板。启用此规则后，将在所有网页中显示调试面板。',
      unnamed: '未命名规则',
    },
    contentTypes: {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      text: '文本',
      image: '图片',
      xml: 'XML',
      formData: '表单数据',
      all: '所有类型',
    },
    header: {
      title: 'Header 管理',
      request: '请求 Header',
      response: '响应 Header',
      newRule: '新建规则',
      ruleName: '规则名称',
      urlPattern: 'URL 匹配模式',
      urlPatternPlaceholder: '例如: .*\\.example\\.com.*',
      headers: 'Headers',
      addHeader: '添加 Header',
      headerName: 'Header 名称',
      headerValue: 'Header 值',
    }
  },
  'zh-TW': {
    common: {
      save: '儲存',
      delete: '刪除',
      create: '新建',
      enabled: '啟用',
      disabled: '停用',
      name: '名稱',
      url: 'URL',
      type: '類型',
      content: '內容',
      description: '描述',
      function: '函數',
    },
    app: {
      title: 'Stylus',
      styleManager: '樣式管理',
      resourceManager: '函數管理',
      switchLanguage: '切換語言',
    },
    style: {
      newStyleSheet: '新建樣式表',
      saveStyle: '儲存樣式',
      styleSaved: '樣式已儲存並套用',
      saveFailed: '儲存失敗',
      enterStyleName: '輸入樣式表名稱',
    },
    rule: {
      newRule: '新建規則',
      urlPattern: 'URL 匹配模式（正則表達式）',
      urlPatternPlaceholder: '例如：.*\\.js$',
      contentType: '內容類型',
      ruleType: '規則類型',
      blockResource: '阻止載入',
      modifyContent: '修改內容',
      injectFunction: '注入函數',
      replacementContent: '替換內容',
      replacementContentHint: '將匹配到的資源內容替換為以下內容',
      injectionFunction: '注入函數',
      injectionFunctionHint: '在頁面上下文中執行的函數程式碼',
      enterContent: '輸入要替換的內容',
      enterFunction: '輸入要注入的函數程式碼',
      examples: {
        title: '範例：',
        replaceJS: '替換JS',
        replaceCSS: '替換CSS',
        replaceHTML: '替換HTML',
        replaceJSON: '替換JSON',
        modifyElements: '修改頁面元素',
        injectScript: '注入自訂指令碼',
        listenEvents: '監聽頁面事件',
      },
      vConsoleDescription: '這是一個內建規則，用於在網頁中注入偵錯面板。啟用此規則後，將在所有網頁中顯示偵錯面板。',
      unnamed: '未命名規則',
    },
    contentTypes: {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      text: '文字',
      image: '圖片',
      xml: 'XML',
      formData: '表單資料',
      all: '所有類型',
    },
    header: {
      title: 'Header 管理',
      request: '請求 Header',
      response: '響應 Header',
      newRule: '新建規則',
      ruleName: '規則名稱',
      urlPattern: 'URL 匹配模式',
      urlPatternPlaceholder: '例如: .*\\.example\\.com.*',
      headers: 'Headers',
      addHeader: '新增 Header',
      headerName: 'Header 名稱',
      headerValue: 'Header 值',
    }
  },
  'ja': {
    common: {
      save: '保存',
      delete: '削除',
      create: '新規作成',
      enabled: '有効',
      disabled: '無効',
      name: '名前',
      url: 'URL',
      type: 'タイプ',
      content: 'コンテンツ',
      description: '説明',
      function: '関数',
    },
    app: {
      title: 'Stylus',
      styleManager: 'スタイル管理',
      resourceManager: '関数管理',
      switchLanguage: '言語を切り替える',
    },
    style: {
      newStyleSheet: '新規スタイルシート',
      saveStyle: 'スタイルを保存',
      styleSaved: 'スタイルが保存され適用されました',
      saveFailed: '保存に失敗しました',
      enterStyleName: 'スタイルシート名を入力',
    },
    rule: {
      newRule: '新規ルール',
      urlPattern: 'URLパターン（正規表現）',
      urlPatternPlaceholder: '例：.*\\.js$',
      contentType: 'コンテンツタイプ',
      ruleType: 'ルールタイプ',
      blockResource: '読み込みをブロック',
      modifyContent: 'コンテンツを変更',
      injectFunction: '関数を注入',
      replacementContent: '置換コンテンツ',
      replacementContentHint: 'マッチしたリソースのコンテンツを以下に置換',
      injectionFunction: '注入関数',
      injectionFunctionHint: 'ページコンテキストで実行する関数コード',
      enterContent: '置換するコンテンツを入力',
      enterFunction: '注入する関数コードを入力',
      examples: {
        title: '例：',
        replaceJS: 'JSを置換',
        replaceCSS: 'CSSを置換',
        replaceHTML: 'HTMLを置換',
        replaceJSON: 'JSONを置換',
        modifyElements: 'ページ要素を変更',
        injectScript: 'カスタムスクリプトを注入',
        listenEvents: 'ページイベントを監視',
      },
      vConsoleDescription: 'これは、Webページにデバッグパネルを注入する組み込みルールです。このルールを有効にすると、すべてのWebページにデバッグパネルが表示されます。',
      unnamed: '名称未設定のルール',
    },
    contentTypes: {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      text: 'テキスト',
      image: '画像',
      xml: 'XML',
      formData: 'フォームデータ',
      all: 'すべてのタイプ',
    },
    header: {
      title: 'Header 管理',
      request: 'リクエスト Header',
      response: 'レスポンス Header',
      newRule: '新規ルール',
      ruleName: 'ルール名',
      urlPattern: 'URL パターン',
      urlPatternPlaceholder: '例: .*\\.example\\.com.*',
      headers: 'Headers',
      addHeader: 'Header を追加',
      headerName: 'Header 名',
      headerValue: 'Header 値',
    }
  },
  'ko': {
    common: {
      save: '저장',
      delete: '삭제',
      create: '새로 만들기',
      enabled: '활성화',
      disabled: '비활성화',
      name: '이름',
      url: 'URL',
      type: '유형',
      content: '내용',
      description: '설명',
      function: '함수',
    },
    app: {
      title: 'Stylus',
      styleManager: '스타일 관리',
      resourceManager: '함수 관리',
      switchLanguage: '언어 전환',
    },
    style: {
      newStyleSheet: '새 스타일시트',
      saveStyle: '스타일 저장',
      styleSaved: '스타일이 저장되고 적용되었습니다',
      saveFailed: '저장 실패',
      enterStyleName: '스타일시트 이름 입력',
    },
    rule: {
      newRule: '새 규칙',
      urlPattern: 'URL 패턴 (정규식)',
      urlPatternPlaceholder: '예: .*\\.js$',
      contentType: '콘텐츠 유형',
      ruleType: '규칙 유형',
      blockResource: '로딩 차단',
      modifyContent: '내용 수정',
      injectFunction: '함수 주입',
      replacementContent: '대체 내용',
      replacementContentHint: '일치하는 리소스 내용을 다음으로 대체',
      injectionFunction: '주입 함수',
      injectionFunctionHint: '페이지 컨텍스트에서 실행할 함수 코드',
      enterContent: '대체할 내용 입력',
      enterFunction: '주입할 함수 코드 입력',
      examples: {
        title: '예시:',
        replaceJS: 'JS 대체',
        replaceCSS: 'CSS 대체',
        replaceHTML: 'HTML 대체',
        replaceJSON: 'JSON 대체',
        modifyElements: '페이지 요소 수정',
        injectScript: '사용자 정의 스크립트 주입',
        listenEvents: '페이지 이벤트 감시',
      },
      vConsoleDescription: '이것은 웹 페이지에 디버그 패널을 주입하는 내장 규칙입니다. 이 규칙을 활성화하면 모든 웹 페이지에 디버그 패널이 표시됩니다.',
      unnamed: '이름 없는 규칙',
    },
    contentTypes: {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      text: '텍스트',
      image: '이미지',
      xml: 'XML',
      formData: '폼 데이터',
      all: '모든 유형',
    },
    header: {
      title: 'Header 관리',
      request: '요청 Header',
      response: '응답 Header',
      newRule: '새 규칙',
      ruleName: '규칙 이름',
      urlPattern: 'URL 패턴',
      urlPatternPlaceholder: '예: .*\\.example\\.com.*',
      headers: 'Headers',
      addHeader: 'Header 추가',
      headerName: 'Header 이름',
      headerValue: 'Header 값',
    }
  },
  'en-US': {
    common: {
      save: 'Save',
      delete: 'Delete',
      create: 'Create',
      enabled: 'Enabled',
      disabled: 'Disabled',
      name: 'Name',
      url: 'URL',
      type: 'Type',
      content: 'Content',
      description: 'Description',
      function: 'Function',
    },
    app: {
      title: 'Stylus',
      styleManager: 'Style Manager',
      resourceManager: 'Function Manager',
      switchLanguage: 'Switch Language',
    },
    style: {
      newStyleSheet: 'New Stylesheet',
      saveStyle: 'Save Style',
      styleSaved: 'Style saved and applied',
      saveFailed: 'Save failed',
      enterStyleName: 'Enter stylesheet name',
    },
    rule: {
      newRule: 'New Rule',
      urlPattern: 'URL Pattern (RegExp)',
      urlPatternPlaceholder: 'e.g., .*\\.js$',
      contentType: 'Content Type',
      ruleType: 'Rule Type',
      blockResource: 'Block Loading',
      modifyContent: 'Modify Content',
      injectFunction: 'Inject Function',
      replacementContent: 'Replacement Content',
      replacementContentHint: 'Replace matched resource content with the following',
      injectionFunction: 'Injection Function',
      injectionFunctionHint: 'Function code to execute in page context',
      enterContent: 'Enter the content to replace',
      enterFunction: 'Enter the function code to inject',
      examples: {
        title: 'Examples:',
        replaceJS: 'Replace JS',
        replaceCSS: 'Replace CSS',
        replaceHTML: 'Replace HTML',
        replaceJSON: 'Replace JSON',
        modifyElements: 'Modify Page Elements',
        injectScript: 'Inject Custom Script',
        listenEvents: 'Listen to Page Events',
      },
      vConsoleDescription: 'This is a built-in rule that injects a debug panel into web pages. When enabled, the debug panel will be displayed on all web pages.',
      unnamed: 'Unnamed Rule',
    },
    contentTypes: {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      text: 'Text',
      image: 'Image',
      xml: 'XML',
      formData: 'Form Data',
      all: 'All Types',
    },
    header: {
      title: 'Header Manager',
      request: 'Request Headers',
      response: 'Response Headers',
      newRule: 'New Rule',
      ruleName: 'Rule Name',
      urlPattern: 'URL Pattern',
      urlPatternPlaceholder: 'e.g., .*\\.example\\.com.*',
      headers: 'Headers',
      addHeader: 'Add Header',
      headerName: 'Header Name',
      headerValue: 'Header Value',
    }
  },
};

export type LocaleKey = keyof typeof translations;
export type SupportedLanguages = 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'en-US';

// 获取浏览器默认语言
function getBrowserLanguage(): LocaleKey {
  const browserLang = navigator.language;
  // 支持的语言列表
  const supportedLocales: SupportedLanguages[] = ['zh-CN', 'zh-TW', 'ja', 'ko', 'en-US'];
  
  // 首先尝试完全匹配
  if (supportedLocales.includes(browserLang as SupportedLanguages)) {
    return browserLang as LocaleKey;
  }
  
  // 然后尝试匹配语言代码（不包含地区）
  const langCode = browserLang.split('-')[0];
  const match = supportedLocales.find(locale => {
    if (locale === 'zh-CN' || locale === 'zh-TW') {
      return langCode === 'zh';
    }
    return locale.startsWith(langCode);
  });
  
  if (match) {
    return match;
  }
  
  // 默认返回英文
  return 'en-US';
}

let currentLocale: LocaleKey = getBrowserLanguage();

export function setLocale(locale: LocaleKey) {
  currentLocale = locale;
  // 可以选择将语言偏好保存到 storage
  chrome.storage.local.set({ 'preferred-locale': locale });
}

export function getLocale(): LocaleKey {
  return currentLocale;
}

// 初始化语言设置
export async function initLocale(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('preferred-locale');
    const savedLocale = result['preferred-locale'];
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      currentLocale = savedLocale as LocaleKey;
    } else {
      currentLocale = getBrowserLanguage();
    }
  } catch (error) {
    console.error('Failed to load language preference:', error);
    currentLocale = getBrowserLanguage();
  }
}

type TranslationValue = string | Translation;

export function t(key: string): string {
  const keys = key.split('.');
  let value: TranslationValue = translations[currentLocale];
  
  for (const k of keys) {
    if (!value || typeof value !== 'object') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    value = value[k];
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  return value;
} 