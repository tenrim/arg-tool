// One vocabulary used by home, rail, directory and command palette.
export const TOOL_KEYWORDS = {
  knowledge:'科普 知识 学习 原理 入门 概念 密码 编码 文件格式 音频 图片 分析 为什么 怎么识别',
  file:'文件头 文件分析 十六进制编辑器 字节编辑 hex editor 二进制 ASCII 撤销 字节搜索 偏移',
  'it-reference':'IT 科普 固定资料 端口 协议 HTTP 状态码 请求头 响应头 MIME 文件类型 字符集 charset 域名 后缀 PSL RFC 汇编 指令 寄存器 标志位',
  basics:'ASCII 转换 阿斯克 基础编码 文字转数字 数字转文字 字符码 码位 码点 Unicode UTF8 UTF-8 字节 进制转换 二进制 八进制 十进制 十六进制 字母转数字 数字转字母 A1Z26 转义 HTML实体 百分号编码',
  'basics/ascii':'ASCII 阿斯克 文字转ASCII ASCII转文字 字符码对照表',
  'basics/radix':'进制转换 二进制 八进制 十进制 十六进制 数字换进制',
  'basics/characters':'字符码 码点 码位 Unicode UTF8 UTF-8 字节 文字转数字 数字转文字',
  'basics/escapes':'转义 反转义 HTML实体 URL百分号 编码解码',
  'basics/letters':'字母转数字 数字转字母 A1Z26 字母编号',
  roman:'Roman 罗马数字 阿拉伯数字 罗马数转换',tapcode:'Tap Code 敲击码 波利比奥斯 Polybius 坐标方阵 行列密码 点码',
  invisible:'隐藏字符 不可见 零宽 空白检查 BOM 双向控制符 字符显形',baudot:'Baudot 波多码 博多码 ITA1 ITA2 电传 打孔纸带 穿孔纸带 五位编码',
  encoding:'ASCII 文字转数字 数字转文字 字符码 字节 进制转换 转义 HTML实体 A1Z26 字母转数字 数字转字母',
};
export const OPERATION_KEYWORDS = {
  'Hex Density chart':'六边形分箱 密度图 hexagonal binning 旧译十六进制密度图',
  'HTML To Text':'HTML源码文本 保留标签 输出类型 旧名HTML转文本',
  'P-list Viewer':'XML plist 属性列表格式查看 不解析二进制plist',
  'To Charcode':'ASCII转换 ASCII编码 文字转数字 文字转ASCII 字符码 码点 码位 Unicode',
  'From Charcode':'ASCII转换 ASCII解码 数字转文字 ASCII转文字 字符码 码点 码位 Unicode',
  'From Base':'数字进制转换 进制转换 转十进制', 'To Base':'数字进制转换 进制转换 十进制转换',
  'To Hex':'文字转十六进制 字节 UTF8 UTF-8', 'From Hex':'十六进制转文字 字节 UTF8 UTF-8',
  'To Binary':'文字转二进制 字节 UTF8 UTF-8','From Binary':'二进制转文字 字节 UTF8 UTF-8',
  'To Decimal':'文字转数字 十进制字节 UTF8 UTF-8','From Decimal':'数字转文字 十进制字节 UTF8 UTF-8',
  'To Octal':'文字转八进制 字节','From Octal':'八进制转文字 字节',
  'A1Z26 Cipher Encode':'字母转数字 字母编号 A1Z26','A1Z26 Cipher Decode':'数字转字母 字母编号 A1Z26',
  'Escape string':'转义 反斜杠 十六进制转义','Unescape string':'反转义 反斜杠 十六进制转义',
  'Escape Unicode Characters':'Unicode转义 码点 码位','Unescape Unicode Characters':'Unicode反转义 码点 码位',
  'To HTML Entity':'HTML实体 字符实体','From HTML Entity':'HTML实体 字符实体',
  'URL Encode':'URL编码 百分号编码','URL Decode':'URL解码 百分号解码',
};
export const searchText = text => String(text).normalize('NFKC').toLowerCase().replace(/\s+/g,'');
export function matchesSearch(text,term){const haystack=searchText(text);return String(term).normalize('NFKC').trim().split(/\s+/).every(token=>haystack.includes(searchText(token)));}
export function matchesTool(entry,term){return matchesSearch([entry.title,entry.route,entry.where,entry.group,TOOL_KEYWORDS[entry.route]||TOOL_KEYWORDS[entry.route?.split('/')[0]]||''].join(' '),term);}
