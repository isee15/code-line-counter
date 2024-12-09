//map may be updated according to user options
export const TEXT_CODING_MAP = {
  //name --> [language, code] map
  default: ["Use_page_default"],

  "utf-8": ["Unicode", "UTF-8"],
  "utf-16le": ["Unicode", "UTF-16LE"],

  "windows-1256": ["Arabic", "Windows-1256"],
  "iso-8859-6": ["Arabic", "ISO-8859-6"],

  "iso-8859-4": ["Baltic", "ISO-8859-4"],
  "iso-8859-13": ["Baltic", "ISO-8859-13"],
  "windows-1257": ["Baltic", "Windows-1257"],

  "iso-8859-14": ["Celtic", "ISO-8859-14"],
  "iso-8859-2": ["Central_European", "ISO-8859-2"],
  "windows-1250": ["Central_European", "windows-1250"],

  gbk: ["Chinese_Simplified", "GBK"],
  gb18030: ["Chinese_Simplified", "GB18030"],
  big5: ["Chinese_Traditional", "Big5"],

  "iso-8859-5": ["Cyrillic", "ISO-8859-5"],
  "windows-1251": ["Cyrillic", "Windows-1251"],
  "KOI8-R": ["Cyrillic", "KOI8-R"],
  "KOI8-U": ["Cyrillic", "KOI8-U"],
  IBM866: ["Cyrillic", "IBM866"],

  "iso-8859-7": ["Greek", "ISO-8859-7"],
  "windows-1253": ["Greek", "Windows-1253"],

  "windows-1255": ["Hebrew", "Windows-1255"],
  "iso-8859-8-I": ["Hebrew", "ISO-8859-8-I"],
  "iso-8859-8": ["Hebrew", "ISO-8859-8"],

  shift_jis: ["Japanese", "Shift JIS"],
  "euc-jp": ["Japanese", "EUC-JP"],
  "iso-2022-jp": ["Japanese", "ISO-2022-JP"],

  "ks_c_5601-1987": ["Korean", "KS C 5601"],
  "euc-kr": ["Korean", "EUC-KR"], //specially added

  "iso-8859-10": ["Nordic", "ISO-8859-10"],
  //Romanian?

  "iso-8859-3": ["South_European", "ISO-8859-3"],

  "windows-874": ["Thai", "Windows-874"],

  "iso-8859-9": ["Turkish", "ISO-8859-9"],
  "windows-1254": ["Turkish", "Windows-1254"], //specially added

  "windows-1258": ["Vietnamese", "Windows-1258"],

  "iso-8859-15": ["Western", "ISO-8859-15"],
  macintosh: ["Western", "Macintosh"],
  "windows-1252": ["Western", "Windows-1252"], //specially added
};
