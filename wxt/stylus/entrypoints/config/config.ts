export interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

export interface ResourceRule {
  id: string;
  enabled: boolean;
  url: string;
  contentType: string;
  type: "block" | "modify" | "inject";
  content?: string;
  function?: string;
  name: string;
  description?: string;
}

export interface HeaderRule {
  id: string;
  enabled: boolean;
  url: string;
  type: "request" | "response";
  headers: {
    [key: string]: string;
  };
  name: string;
}

export const DEFAULT_TEMPLATES: StyleSheet[] = [
  {
    id: "force-select",
    name: "允许选择复制",
    css: `* {
    user-select: unset !important;
  }`,
    enabled: false,
  },
  {
    id: "dark-mode",
    name: "深色模式",
    css: `body {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
  }
  a {
    color: #66b3ff !important;
  }`,
    enabled: false,
  },
  {
    id: "reading-mode",
    name: "阅读模式",
    css: `body {
    max-width: 800px !important;
    margin: 0 auto !important;
    padding: 20px !important;
    font-size: 18px !important;
    line-height: 1.6 !important;
  }`,
    enabled: false,
  },
  {
    id: "eye-protection",
    name: "护眼模式",
    css: `/* 设置背景为护眼色 */
  body {
    background-color: #c7edcc !important;
    color: #333333 !important;
  }
  
  /* 调整文本颜色和背景 */
  p, div, span, li, td, th, caption, label, input, textarea {
    background-color: #c7edcc !important;
    color: #333333 !important;
  }
  
  /* 调整链接颜色 */
  a {
    color: #2b5329 !important;
  }
  
  /* 调整图片亮度 */
  img {
    filter: brightness(0.95) !important;
  }
  
  /* 调整代码块背景 */
  pre, code {
    background-color: #b8e6be !important;
    color: #1a3318 !important;
  }
  
  /* 调整输入框背景 */
  input, textarea, select {
    background-color: #d8f2dc !important;
  }`,
    enabled: false,
  },
  {
    id: "water-mark",
    name: "腾讯文档去水印",
    css: `
  #__clear_watermark_id {
    display: none;
  }`,
    enabled: false,
  },
];

export const DEFAULT_RULES: ResourceRule[] = [
  {
    id: "vconsole",
    enabled: false,
    url: ".*",
    contentType: "text/html",
    type: "inject",
    name: "vConsole调试面板",
    description: "在网页中注入调试工具，用于移动端调试",
  },
  {
    id: "block-analytics",
    enabled: false,
    url: ".*(google-analytics\\.com|googletagmanager\\.com|umeng\\.com|cnzz\\.com|baidu\\.com/hm\\.js).*",
    contentType: "*/*",
    type: "block",
    name: "拦截数据统计",
    description: "阻止常见的网站统计和分析脚本",
  },
  {
    id: "block-ads",
    enabled: false,
    url: ".*(pagead2\\.googlesyndication\\.com|ads\\.google\\.com|adservice\\.google\\.com|doubleclick\\.net).*",
    contentType: "*/*",
    type: "block",
    name: "拦截广告请求",
    description: "阻止常见的广告加载请求",
  },
  {
    id: "dark-mode",
    enabled: false,
    url: ".*",
    contentType: "text/html",
    type: "inject",
    function: `function() {
        document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
        document.querySelectorAll('img, video, canvas').forEach(el => {
          el.style.filter = 'invert(1) hue-rotate(180deg)';
        });
      }`,
    name: "全局深色模式",
    description: "将所有网页转换为深色模式",
  },
  {
    id: "block-social",
    enabled: false,
    url: ".*(facebook\\.com|twitter\\.com|linkedin\\.com|weibo\\.com)/.*\\.(js|html)",
    contentType: "*/*",
    type: "block",
    name: "拦截社交组件",
    description: "阻止社交媒体分享按钮和跟踪组件",
  },
  {
    id: "block-video-ads",
    enabled: false,
    url: ".*(doubleclick\\.net|\\.googlevideo\\.com/videoplayback\\?.*ctier=L|.*\\.com\\.\\w+/videos/other/.*)",
    contentType: "*/*",
    type: "block",
    name: "拦截视频广告",
    description: "阻止视频网站的广告内容",
  },
  {
    id: "reading-mode",
    enabled: false,
    url: ".*",
    contentType: "text/html",
    type: "inject",
    function: `function() {
        const style = document.createElement('style');
        style.textContent = \`
          body {
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 20px !important;
            font-size: 18px !important;
            line-height: 1.6 !important;
            background: #fff !important;
            color: #333 !important;
          }
          img { max-width: 100% !important; height: auto !important; }
        \`;
        document.head.appendChild(style);
      }`,
    name: "阅读模式",
    description: "优化页面布局，提供更好的阅读体验",
  },
  {
    id: "block-cookie-notices",
    enabled: false,
    url: ".*(cookie-notice|cookie-consent|cookie-law|gdpr).*\\.(js|css)",
    contentType: "*/*",
    type: "block",
    name: "拦截Cookie提示",
    description: "阻止烦人的Cookie政策提示框",
  },
  {
    id: "block-chat-widgets",
    enabled: false,
    url: ".*(intercom\\.com|drift\\.com|tawk\\.to|crisp\\.chat|livechat\\.).*",
    contentType: "*/*",
    type: "block",
    name: "拦截聊天组件",
    description: "阻止网页客服聊天窗口",
  }
];

export const DEFAULT_HEADER_RULES: HeaderRule[] = [
  {
    id: "cors-headers",
    enabled: false,
    url: ".*",
    type: "response",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
    name: "CORS Headers",
  },
  {
    id: "iframe-headers",
    enabled: false,
    url: ".*",
    type: "response",
    headers: {
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "frame-ancestors *",
    },
    name: "允许 Iframe 嵌入",
  },
  {
    id: "mobile-user-agent",
    enabled: false,
    url: ".*",
    type: "request",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    },
    name: "移动端 User-Agent",
  },
  {
    id: "pc-user-agent",
    enabled: false,
    url: ".*",
    type: "request",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    name: "PC端 User-Agent",
  },
];
