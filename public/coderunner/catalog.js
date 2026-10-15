// Shared descriptive metadata; models and discovery consume the same definitions.
export const LANGUAGES={
 brainfuck:{name:'Brainfuck',group:'偏门语言',ext:'bf',step:true,note:'8 位单元（0–255 循环）；指针不能越过左边界；输入结束返回 0。',hint:'输入 + - < > [ ] . , 组成的程序。',keys:['+','-','<','>','[',']','.',',']},
 ook:{name:'Ook!',group:'偏门语言',ext:'ook',step:true,note:'每两个 Ook. / Ook? / Ook! 构成一条指令，使用与 Brainfuck 相同的内存规则。',hint:'输入成对的 Ook.、Ook?、Ook! 指令。',keys:['Ook. ','Ook? ','Ook! ']},
 befunge:{name:'Befunge-93',group:'偏门语言',ext:'b93',step:true,note:'二维代码最多 80 列 × 25 行；保留空格和换行。除以零、越界 g / p 会报错。',hint:'粘贴二维程序，保留原有排列。',keys:['>','<','^','v','"',':','\\','@','#','_','|']},
 deadfish:{name:'Deadfish',group:'偏门语言',ext:'df',step:true,note:'i 加一、d 减一、s 平方、o 输出十进制数字；不是直接输出 ASCII 字符。',hint:'输入由 i d s o 组成的程序。',keys:['i','d','s','o']},
 whitespace:{name:'Whitespace',group:'偏门语言',ext:'ws',step:true,note:'只把空格、Tab 和换行视为指令。当前引擎采用 32 位整数；可展开空白显形检查原文。',hint:'粘贴原始空白代码，或直接打开 .ws 文件。',keys:[' ','\t','\n']},
 malbolge:{name:'Malbolge',group:'偏门语言',ext:'mb',step:true,note:'执行标准 Malbolge，输入结束值为 59048；不自动将规范化代码当作原始代码执行。',hint:'粘贴标准 Malbolge 程序。',keys:['(',')','<','>','[',']','"',"'"]},
 python:{name:'Python 3.13',group:'常用语言',ext:'py',note:'Pyodide 本地运行 Python 标准库，input() 读取下方程序输入。首次加载约 12 MB；不提供 pip、联网、桌面窗口或子进程。',hint:'输入 Python 代码，使用 print() 输出结果。',keys:['\t',':','(',')','[',']','"',"'"]},
 javascript:{name:'JavaScript',group:'常用语言',ext:'js',note:'QuickJS 独立引擎。console.log() / print() 输出，readline() 按行读取输入，stdin 保存完整输入。没有 DOM、网络和 Node.js API。',hint:'输入 JavaScript，使用 console.log() 输出结果。',keys:['\t','{','}','(',')','[',']',';','`']},
 lua:{name:'Lua 5.4',group:'常用语言',ext:'lua',note:'print() / io.write() 输出，io.read() 从程序输入读取。文件仅存在于本次运行的虚拟环境，不提供系统命令或网络。',hint:'输入 Lua 代码，使用 print() 输出结果。',keys:['\t','(',')','[',']','{','}','"']},
 sql:{name:'SQL · SQLite',group:'常用语言',ext:'sql',note:'可直接建表并查询，或打开最多 16 MB 的 SQLite 文件。每次运行从原文件重新开始；结果最多 10,000 行，可下载修改后的数据库。',hint:'输入 SQLite SQL；多条语句用分号分隔。',keys:['(',')','*',',',';','=',"'"]}
};
