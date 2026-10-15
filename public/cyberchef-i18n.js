// Presentation-only Chinese localization. Recipes always retain upstream op/arg values.
const pairs = source => Object.fromEntries(source.trim().split('\n').map(line => { const i=line.indexOf('|');return [line.slice(0,i),line.slice(i+1)]; }));
const operationNames = pairs(`
ADD|逐字节加法
AND|按位与
NOT|按位取反
OR|按位或
XOR|按位异或
MOD|取模
SUB|逐字节减法
Add line numbers|添加行号
Add Text To Image|添加图片文字
Alternating Caps|交替大小写
Analyse hash|分析哈希类型
Analyse UUID|分析 UUID
Argon2 compare|校验 Argon2 哈希
Ascon Hash|Ascon 哈希
Ascon MAC|Ascon 消息认证码
Atbash Cipher|埃特巴什密码
Automated Validation Test Op|参数验证测试
BSON deserialise|BSON 反序列化
BSON serialise|BSON 序列化
Bcrypt compare|校验 Bcrypt 哈希
Bcrypt parse|解析 Bcrypt 哈希
Bit shift left|位左移
Bit shift right|位右移
Blur Image|图片模糊
Bombe|恩尼格玛破译机
CMAC|分组密码消息认证码
CSS Beautify|格式化 CSS
CSS Minify|压缩 CSS
CSS selector|CSS 选择器
CTPH|上下文触发分段哈希
Caesar Box Cipher|凯撒方阵密码
Caret/M-decode|脱字符与 M 编码解码
Cartesian Product|笛卡尔积
Change IP format|转换 IP 地址格式
Chi Square|卡方检验
Colossus|巨人密码破译机
Comment|注释
Compare CTPH hashes|比较 CTPH 哈希
Compare SSDEEP hashes|比较 SSDEEP 哈希
Conditional Jump|条件跳转
Contain Image|缩放图片以完整容纳
Convert area|面积单位换算
Convert co-ordinate format|坐标格式转换
Convert data units|数据单位换算
Convert distance|距离单位换算
Convert Image Format|转换图片格式
Convert Leet Speak|转换 Leet 替代字母
Convert mass|质量单位换算
Convert speed|速度单位换算
Convert to NATO alphabet|转换为北约拼读字母
Count occurrences|统计出现次数
Cover Image|缩放图片以填满画布
Crop Image|裁剪图片
DNS over HTTPS|通过 HTTPS 查询 DNS
DateTime Delta|日期时间加减
Dechunk HTTP response|解码 HTTP 分块响应
Decode NetBIOS Name|解码 NetBIOS 名称
Decode text|文本解码
Defang IP Addresses|解除 IP 地址可点击性
Defang URL|解除网址可点击性
Derive EVP key|派生 EVP 密钥
Derive HKDF key|派生 HKDF 密钥
Derive PBKDF2 key|派生 PBKDF2 密钥
Detect File Type|识别文件类型
Diff|比较差异
Disassemble ARM|ARM 反汇编
Disassemble x86|x86 反汇编
Dither Image|图片抖动处理
Divide|除法
Drop bytes|丢弃字节
Drop nth bytes|间隔丢弃字节
ECDSA Signature Conversion|转换 ECDSA 签名格式
ELF Info|ELF 文件信息
Encode NetBIOS Name|编码 NetBIOS 名称
Encode text|文本编码
Enigma|恩尼格玛密码机
Entropy|信息熵
Escape Smart Characters|转义智能标点
Escape string|字符串转义
Escape Unicode Characters|转义 Unicode 字符
Expand alphabet range|展开字符范围
Extended GCD|扩展欧几里得算法
Extract Audio Metadata|提取音频元数据
Extract dates|提取日期
Extract domains|提取域名
Extract EXIF|提取 EXIF 元数据
Extract email addresses|提取邮箱地址
Extract file paths|提取文件路径
Extract Files|提取文件
Extract hashes|提取哈希
Extract ID3|提取 ID3 标签
Extract IP addresses|提取 IP 地址
Extract LSB|提取最低有效位
Extract MAC addresses|提取 MAC 地址
Extract RGBA|提取 RGBA 像素
Extract URLs|提取网址
Fang URL|恢复网址可点击性
File Tree|文件树
Filter|筛选
Find / Replace|查找与替换
Flask Session Decode|解码 Flask 会话
Flask Session Sign|签署 Flask 会话
Flask Session Verify|验证 Flask 会话
Flip Image|翻转图片
Fork|分支处理
Format MAC addresses|格式化 MAC 地址
Frequency distribution|字符频率分布
From Case Insensitive Regex|解析不区分大小写的正则表达式
Fuzzy Match|模糊匹配
Generate all checksums|生成全部校验和
Generate all hashes|生成全部哈希
Generate De Bruijn Sequence|生成德布鲁因序列
Generate ECDSA Key Pair|生成 ECDSA 密钥对
Generate HOTP|生成 HOTP 动态密码
Generate Image|生成图片
Generate Lorem Ipsum|生成占位文本
Generate PGP Key Pair|生成 PGP 密钥对
Pseudo-Random Prime Generator|生成伪随机素数
Generate QR Code|生成二维码
Generate RSA Key Pair|生成 RSA 密钥对
Generate TOTP|生成 TOTP 动态密码
Generate UUID|生成 UUID
Generic Code Beautify|通用代码格式化
Get All Casings|生成全部大小写组合
Get Time|获取时间
Group IP addresses|归并 IP 地址
Gunzip|Gzip 解压
Gzip|Gzip 压缩
GOST Hash|GOST 哈希
HASSH Client Fingerprint|HASSH 客户端指纹
HASSH Server Fingerprint|HASSH 服务端指纹
HMAC|哈希消息认证码
HTML To Text|HTML 输出转源码文本
HTTP request|HTTP 请求
Hamming Distance|汉明距离
Haversine distance|球面距离
Head|保留开头
Heatmap chart|热力图
Hex Density chart|六边形分箱密度图
Hex to Object Identifier|十六进制转对象标识符
Hex to PEM|十六进制转 PEM
IPv6 Transition Addresses|解析 IPv6 过渡地址
Image Brightness / Contrast|图片亮度与对比度
Image Filter|图片滤镜
Image Hue/Saturation/Lightness|图片色相、饱和度与明度
Image Opacity|图片不透明度
Index of Coincidence|重合指数
Invert Image|图片反色
JA3 Fingerprint|JA3 指纹
JA3S Fingerprint|JA3S 指纹
JA4 Fingerprint|JA4 指纹
JA4Server Fingerprint|JA4 服务端指纹
JPath expression|JPath 表达式
JSON Beautify|格式化 JSON
JSON Minify|压缩 JSON
JWK to PEM|JWK 转 PEM
JWT Decode|解码 JWT
JWT Sign|签署 JWT
JWT Verify|验证 JWT
JavaScript Beautify|格式化 JavaScript
JavaScript Minify|压缩 JavaScript
JavaScript Parser|解析 JavaScript
Jq|Jq 查询
Jsonata Query|JSONata 查询
Jump|跳转
LM Hash|LM 哈希
Label|标签
Levenshtein Distance|编辑距离
Lorenz|洛伦兹密码机
Luhn Checksum|卢恩校验和
MIME Decoding|MIME 解码
Magic|自动识别与解码
Mean|平均值
Median|中位数
Merge|合并分支
Microsoft Script Decoder|微软脚本解码
Modular Exponentiation|模幂运算
Modular Inverse|模逆元
Multiple Bombe|多机恩尼格玛破译
Multiply|乘法
NT Hash|NT 哈希
Normalise Image|图片归一化
Normalise Unicode|Unicode 规范化
Numberwang|Numberwang 随机数
Object Identifier to Hex|对象标识符转十六进制
Offset checker|检查偏移量
Optical Character Recognition|光学文字识别
PEM to Hex|PEM 转十六进制
PEM to JWK|PEM 转 JWK
PGP Decrypt and Verify|PGP 解密并验签
PGP Encrypt and Sign|PGP 加密并签名
PHP Deserialize|PHP 反序列化
PHP Serialize|PHP 序列化
P-list Viewer|XML 属性列表格式查看
Pad lines|填充文本行
Parity Bit|奇偶校验位
Parse ASN.1 hex string|解析 ASN.1 十六进制
Parse CSR|解析证书签名请求
Parse colour code|解析颜色代码
Parse DateTime|解析日期时间
Parse Ethernet frame|解析以太网帧
Parse IP range|解析 IP 地址范围
Parse IPv4 header|解析 IPv4 头部
Parse IPv6 address|解析 IPv6 地址
Parse ObjectID timestamp|解析 ObjectID 时间戳
Parse PGP Key|解析 PGP 密钥
Parse QR Code|识别二维码
Parse SSH Host Key|解析 SSH 主机密钥
Parse TCP|解析 TCP
Parse TLS record|解析 TLS 记录
Parse TLV|解析 TLV
Parse UDP|解析 UDP
Parse UNIX file permissions|解析 UNIX 文件权限
Parse URI|解析 URI
Parse User Agent|解析用户代理
Parse X.509 CRL|解析 X.509 证书吊销列表
Parse X.509 certificate|解析 X.509 证书
Play Media|播放媒体
Power Set|幂集
Pseudo-Random Integer Generator|生成伪随机整数
Pseudo-Random Number Generator|生成伪随机数
Public Key from Certificate|从证书提取公钥
Public Key from Private Key|从私钥提取公钥
RAKE|RAKE 关键词提取
RC4 Drop|RC4 丢弃初始密钥流
ROR13|右循环移位 13 位
ROT13|凯撒移位（ROT13）
ROT13 Brute Force|穷举凯撒移位
ROT47|可打印字符移位（ROT47）
ROT47 Brute Force|穷举 ROT47
ROT8000|Unicode 移位（ROT8000）
Randomize Colour Palette|随机重映射调色板
Raw Deflate|原始 Deflate 压缩
Raw Inflate|原始 Deflate 解压
Register|寄存器
Regular expression|正则表达式
Remove ANSI Escape Codes|移除 ANSI 转义序列
Remove Diacritics|移除变音符号
Remove EXIF|移除 EXIF 元数据
Remove line numbers|移除行号
Remove null bytes|移除空字节
Remove whitespace|移除空白字符
Render Image|显示图片
Render Markdown|渲染 Markdown
Render PDF|显示 PDF
Resize Image|调整图片尺寸
Return|返回
Reverse|反转
Rotate Image|旋转图片
Rotate left|循环左移
Rotate right|循环右移
SIGABA|SIGABA 密码机
SQL Beautify|格式化 SQL
SQL Minify|压缩 SQL
SSDEEP|SSDEEP 模糊哈希
Scan for Embedded Files|扫描内嵌文件
Scatter chart|散点图
Series chart|序列图
Set Difference|集合差集
Set Intersection|集合交集
Set Union|集合并集
Sharpen Image|图片锐化
Show Base64 offsets|显示 Base64 偏移量
Show on map|在地图上显示
Shuffle|随机打乱
Sleep|等待
Sort|排序
Split|分割
Split Colour Channels|分离颜色通道
Standard Deviation|标准差
Strings|提取可打印字符串
Strip HTML tags|移除 HTML 标签
Strip HTTP headers|移除 HTTP 头部
Strip IPv4 header|移除 IPv4 头部
Strip TCP header|移除 TCP 头部
Strip UDP header|移除 UDP 头部
Subsection|截取片段
Substitute|字符替换
Subtract|减法
Sum|求和
Swap case|交换大小写
Swap endianness|交换字节序
Symmetric Difference|集合对称差
Syntax highlighter|语法高亮
TCP/IP Checksum|TCP/IP 校验和
Tail|保留结尾
Take bytes|提取字节
Take nth bytes|间隔提取字节
Tar|Tar 打包
Template|模板
Text Encoding Brute Force|穷举文本编码
Text-Integer Conversion|文本与整数互转
To Camel case|转驼峰命名
To Case Insensitive Regex|生成不区分大小写的正则表达式
To Kebab case|转短横线命名
To Lower case|转小写
To Snake case|转下划线命名
To Table|转表格
To Upper case|转大写
Translate DateTime Format|转换日期时间格式
Typex|Typex 密码机
UNIX Timestamp to Windows Filetime|UNIX 时间戳转 Windows 文件时间
Unescape string|还原字符串转义
Unescape Unicode Characters|还原 Unicode 转义
Unicode Text Format|Unicode 文本样式
Unique|去重
Untar|解包 Tar
Unzip|解压 ZIP
View Bit Plane|查看位平面
Windows Filetime to UNIX Timestamp|Windows 文件时间转 UNIX 时间戳
Wrap|文本换行
XKCD Random Number|XKCD 随机数
XML Beautify|格式化 XML
XML Minify|压缩 XML
XOR Brute Force|穷举异或密钥
XOR Checksum|异或校验和
XPath expression|XPath 表达式
YARA Rules|YARA 规则扫描
Zip|ZIP 压缩
Zlib Deflate|Zlib 压缩
Zlib Inflate|Zlib 解压
URL Decode|URL 解码
URL Encode|URL 编码
`);
const terms = pairs(`
A1Z26 Cipher|A1Z26 字母数字密码
Affine Cipher|仿射密码
Bacon Cipher|培根密码
Bifid Cipher|双分密码
Cetacean Cipher|鲸鱼密码
Rail Fence Cipher|栅栏密码
Vigenère|维吉尼亚
Braille|盲文
Morse Code|摩斯密码
Binary|二进制
Octal|八进制
Decimal|十进制
Hex|十六进制
Hex Content|十六进制内容
Hexdump|十六进制转储
Charcode|字符码
Float|浮点数
HTML Entity|HTML 实体
UNIX Timestamp|UNIX 时间戳
Quoted Printable|可打印编码
Base|任意进制
`);
export function operationName(name) {
  if(operationNames[name])return operationNames[name];
  let m;
  if((m=name.match(/^(From|To) (.+)$/)))return `${terms[m[2]]||m[2]}${m[1]==='From'?'解码':'编码'}`;
  if((m=name.match(/^(.+) (Decode|Encode|Decrypt|Encrypt|Sign|Verify|Key Unwrap|Key Wrap|Compress|Decompress|Checksum)$/)))return `${terms[m[1]]||m[1]}${{Decode:'解码',Encode:'编码',Decrypt:'解密',Encrypt:'加密',Sign:'签名',Verify:'验签','Key Unwrap':'密钥解封装','Key Wrap':'密钥封装',Compress:'压缩',Decompress:'解压',Checksum:'校验和'}[m[2]]}`;
  if((m=name.match(/^(.+) to (.+)$/)))return `${m[1]} 转 ${m[2]}`;
  return ['ChaCha','RC4','Salsa20','XSalsa20','Rabbit'].includes(name)?`${name} 流加密`:`${name} 哈希`;
}
export const categories = pairs(`
Favourites|常用操作
Data format|编码与数据格式
Encryption / Encoding|加密与古典密码
Public Key|公钥与签名
Arithmetic / Logic|算术与逻辑
Networking|网络协议
Language|语言与文本
Utils|实用工具
Date / Time|日期与时间
Extractors|信息提取
Compression|压缩与解压
Hashing|哈希与校验
Code tidy|代码整理
Forensics|数据取证
Multimedia|多媒体
Other|其他
Flow control|流程控制
`);
const labels = pairs(`
Key|密钥
IV|初始向量
IV Length|初始向量长度
Mode|模式
Input|输入格式
Output|输出格式
GCM Tag|GCM 认证标签
Additional Authenticated Data|附加认证数据
IV from input|从输入读取初始向量
Include IV in output|在输出中包含初始向量
Key (KEK)|密钥加密密钥（KEK）
Font face|字体
a|参数 a
b|参数 b
Include Metadata|包含元数据
Associated Data|关联数据
Integer Number|整数
Real Number|实数
Non Empty String|非空字符串
Empty Allowed String|可为空的字符串
Non Empty Toggle String|非空可切换格式字符串
Option Ingredient|选项参数
Arg Selector Ingredient|联动参数
Force Valid JSON|强制有效 JSON
Alphabet|字符表
Invert Translation|反转替换表
Keep extra characters|保留额外字符
Crib|已知明文
Use checking machine|使用校验机
Block size (100s of kb)|块大小（100 KB 的倍数）
Work factor|工作因子
Use low-memory, slower decompression algorithm|使用低内存、较慢的解压算法
Reflect input|反射输入位序
Reflect output|反射输出位序
Xor Output|输出异或值
Indent string|缩进字符串
Box Height|方阵高度
QBusZ|Z 总线
QBusΧ|Χ 总线
QBusΨ|Ψ 总线
K Rack Option|K 架选项
K Rack: Conditional|K 架：条件
K Rack: Addition|K 架：加法
Negate All|全部取反
Add Negate All|加法全部取反
Total Motor|总电机
Master Control Panel|主控制面板
Set Total|设置总计
Fast Step|快速步进
Slow Step|慢速步进
Match (regex)|匹配表达式
Maximum jumps (if jumping backwards)|最大向后跳转次数
Opaque background|不透明背景
Include Compass Directions|包含方位
PNG Filter Type|PNG 滤波类型
PNG Deflate Level|PNG 压缩级别
Search string|搜索字符串
Autocrop|自动裁剪
Autocrop tolerance (%)|自动裁剪容差（%）
Only autocrop frames|仅自动裁剪边框
Symmetric autocrop|对称自动裁剪
Autocrop keep border (px)|自动裁剪保留边框（像素）
Resolver|DNS 解析器
Answer Data Only|仅返回应答数据
Disable DNSSEC validation|关闭 DNSSEC 校验
Built in formats|内置格式
Time Operation|时间运算
Escape dots|转义句点
Escape http|转义 http
Escape ://|转义 ://
Info|补充信息
L (number of output octets)|输出字节数 L
Show subtraction|显示删除内容
Endianness|字节序
Starting address (hex)|起始地址（十六进制）
Show instruction hex|显示指令十六进制
Show instruction position|显示指令位置
Bit mode|位模式
Code Segment (CS)|代码段（CS）
Offset (IP)|指令偏移（IP）
Apply to each line|应用于每一行
Drop every|每隔多少字节丢弃
Starting at|起始位置
Plugboard|接线板
Unmappable characters|无法映射的字符
Escape quote|引号转义
JSON compatible|兼容 JSON
ES6 compatible|兼容 ES6
Value a|数值 a
Value b|数值 b
Filename (optional)|文件名（可选）
Max embedded text bytes (iXML/axml/etc)|最大内嵌文本字节数（iXML / axml 等）
Underscore (DMARC, DKIM, etc)|允许下划线（DMARC、DKIM 等）
Ignore failed extractions|忽略提取失败
Minimum File Size|最小文件大小
Hash character length|哈希字符长度
Colour Pattern #1|颜色模式 1
Colour Pattern #2|颜色模式 2
Colour Pattern #3|颜色模式 3
Colour Pattern #4|颜色模式 4
Restore [.]|还原 [.]
Restore hxxp|还原 hxxp
Restore ://|还原 ://
Regex|正则表达式
Global match|全局匹配
Case insensitive|不区分大小写
Multiline matching|多行匹配
Dot matches all|句点匹配全部字符
View TimeStamp|显示时间戳
No delimiter|无分隔符
Dash delimiter|短横线分隔
Colon delimiter|冒号分隔
Cisco style|Cisco 格式
IPv6 interface ID|IPv6 接口标识符
Show 0%s|显示零频率项
Packed|紧凑格式
Signed|有符号数
Radix|基数
Remove non-alphabet chars|移除字符表以外的字符
Strict mode|严格模式
All-zero group char|全零分组字符
Support signed values|支持有符号数
Internationalised domain name|国际化域名
Sequential bonus|连续匹配加分
Separator bonus|分隔符匹配加分
Camel bonus|驼峰匹配加分
First letter bonus|首字母匹配加分
Leading letter penalty|前导字符扣分
Max leading letter penalty|前导字符最大扣分
Unmatched letter penalty|未匹配字符扣分
sBox|替换盒
Key meshing mode|密钥混合模式
User Key Material|用户密钥材料
Key wrapping|密钥封装
Include names|包含名称
Alphabet size (k)|字符表大小 k
Key length (n)|序列长度 n
Length in|长度单位
Crypto grade|密码学强度
Module size (px)|模块大小（像素）
Margin (num modules)|边距（模块数）
Error correction|纠错级别
Epoch offset (T0)|起始时间偏移 T0
Interval (T1)|时间间隔 T1
Subnet (CIDR)|子网（CIDR）
Only show the subnets|仅显示子网
Include file checksum|包含文件校验和
Show response metadata|显示响应元数据
Use column headers as labels|使用列标题作为标签
Draw bin edges|显示分箱边界
Pack radius|分箱半径
Draw radius|绘制半径
Draw hexagon edges|显示六边形边界
Draw empty hexagons within data boundaries|显示数据范围内的空六边形
Ignore ranges|忽略范围
Sort Object Keys|排序对象键
Private/Secret Key|私钥或共享密钥
Public/Secret Key|公钥或共享密钥
Semicolons before closing braces|右花括号前加分号
Include tokens array|包含词元数组
Include comments array|包含注释数组
Report errors and try to continue|报告错误并尝试继续
KT-Schalter|KT 开关
ITA2 Format|ITA2 格式
Crib (known plaintext string or regex)|已知明文（文本或正则）
Merge All|合并全部
Value (a)|数值 a
Modulus (m)|模数 m
Standard Enigmas|标准恩尼格玛配置
4th rotor|第四转子
Convert to Signed|转换为有符号数
Normal Form|规范化形式
OCR Engine Mode|OCR 引擎模式
Set key ID (kid) to RFC 7638 thumbprint|按 RFC 7638 指纹设置密钥标识 kid
Output valid JSON|输出有效 JSON
Postion|位置
Encode or Decode|编码或解码
Truncate octet strings longer than|截断超过此长度的字节串
Type/Key size|类型与密钥长度
Use BER|使用 BER
Schema (.proto text)|结构定义（.proto 文本）
Number of Integers|整数数量
Output as|输出形式
Stop Words|停用词
Number of dwords to drop|丢弃的双字数量
Rotate lower case chars|移动小写字母
Rotate upper case chars|移动大写字母
Rotate numbers|移动数字
Print amount|输出数量
Crib (known plaintext string)|已知明文字符串
Initial output buffer size|初始输出缓冲区大小
Buffer expansion type|缓冲区扩展方式
Resize buffer after decompression|解压后调整缓冲区大小
Built in regexes|内置正则表达式
^ and $ match at newlines|^ 和 $ 匹配行边界
Astral support|支持扩展 Unicode 字符
Spaces|空格
Carriage returns (\\r)|回车符（\\r）
Line feeds (\\n)|换行符（\\n）
Tabs|制表符
Form feeds (\\f)|换页符（\\f）
Full stops|句点
Autoconvert URLs to links|自动把网址转为链接
Enable syntax highlighting|启用语法高亮
Open links in new tab.|在新标签页打开链接
Maintain aspect ratio|保持宽高比
By|按
Rotation amount (degrees)|旋转角度
Carry through|保留移出的位
Use colour from third column|使用第三列颜色
Iterations (N)|迭代次数 N
Memory factor (r)|内存因子 r
Parallelization factor (p)|并行因子 p
Show variable chars and padding|显示可变字符及填充
Time (ms)|等待时间（毫秒）
Word Delimiter (Regex)|单词分隔符（正则）
Sentence Delimiter (Regex)|句子分隔符（正则）
Pad incomplete words|填充不完整字组
Take every|每隔多少字节提取
Template definition (.handlebars)|模板定义（Handlebars）
Human-Readable Part (HRP)|可读前缀（HRP）
Witness Version|见证版本
Attempt to be context aware|尝试感知上下文
Bytes per line|每行字节数
Print spaces between bytes|字节之间打印空格
UNIX format|UNIX 格式
Make first row header|首行作为表头
Treat as UTC|按 UTC 处理
Show parsed datetime|显示解析后的日期时间
Typex keyboard emulation|模拟 Typex 键盘
Treat "+" as space|将 + 视为空格
Encode all special chars|编码全部特殊字符
Null preserving|保留空字节
Output as hex|输出十六进制
`);
const words = pairs(`
horizontal|水平
vertical|垂直
align|对齐
position|位置
size|大小
text|文本
font|字体
face|名称
red|红色
green|绿色
blue|蓝色
alpha|透明度
salt|盐值
iterations|迭代次数
memory|内存
parallelism|并行度
parallelization|并行
hash|哈希
hashing|哈希
length|长度
bytes|字节
byte|字节
bits|位
bit|位
type|类型
format|格式
encoding|编码
encoded|已编码
digest|摘要
nonce|随机数
algorithm|算法
translation|替换表
rounds|轮数
keyword|关键词
amount|数量
model|型号
left-most|最左侧
left-hand|左侧
right-hand|右侧
middle|中间
rotor|转子
rotors|转子
reflector|反射器
reflectors|反射器
crib|已知明文
offset|偏移量
block|分组
width|宽度
polynomial|多项式
initialization|初始值
preserve|保留
comments|注释
comment|注释
cell|单元格
row|行
record|记录
field|字段
delimiters|分隔符
delimiter|分隔符
sample|样本
item|元素
counter|计数器
input|输入
output|输出
pattern|模式
limitation|限制
program|程序
run|运行
negate|取反
add|加法
start|起点
height|高度
resizing|尺寸调整
units|单位
unit|单位
precision|精度
quality|质量
direction|方向
request|请求
string|字符串
days|天
hours|小时
minutes|分钟
seconds|秒
process|处理方式
passphrase|口令
extract|提取
extraction|提取
mode|模式
images|图片
image|图片
video|视频
audio|音频
documents|文档
applications|应用
archives|压缩包
miscellaneous|其他
diff|比较
by|按
show|显示
added|新增
removed|删除
ignore|忽略
whitespace|空白字符
architecture|架构
compatibility|兼容模式
apply|应用
private|私有
public|公有
secret|共享
key|密钥
message|消息
ring|环
setting|设置
initial|初始
value|数值
strict|严格
visualisation|可视化
escape|转义
level|级别
uppercase|大写
upper|大写
case|大小写
prefix|前缀
encode|编码
all|全部
chars|字符
characters|字符
padding|填充
filename|文件名
optional|可选
display|显示
total|总数
sort|排序
unique|去重
remove|移除
local|本地
addresses|地址
path|路径
file|文件
invert|反转
condition|条件
find|查找
replace|替换
errors|错误
axis|方向
split|分割
merge|合并
signed|有符号
base|进制
letter|字母
word|字词
search|搜索
separator|分隔符
length|长度
wrapping|封装
elliptic|椭圆
curve|曲线
name|名称
code|代码
pixel|像素
pixels|像素
scale|缩放
factor|因子
per|每
password|密码
email|邮箱
version|版本
namespace|命名空间
granularity|粒度
compression|压缩
method|方式
headers|头部
header|头部
number|数量
of|的
bins|分箱
label|标签
min|最小
max|最大
colour|颜色
brightness|亮度
contrast|对比度
filter|滤镜
hue|色相
saturation|饱和度
lightness|明度
opacity|不透明度
query|查询
result|结果
formatted|格式化
signing|签名
quotes|引号
include|包含
location|位置
info|信息
range|范围
raw|原始
signature|签名
insertion|插入
deletion|删除
substitution|替换
cost|代价
wheel|轮
levels|层数
modulus|模数
depth|深度
intensive|深入
extensive|广泛
language|语言
support|支持
exponent|指数
main|主
seed|种子
confidence|置信度
recipient|接收者
signer|签名者
index|索引
timezone|时区
return|返回
network|网络
enumerate|列举
allow|允许
large|大型
queries|查询
normalise|归一化
schema|结构定义
unknown|未知
fields|字段
types|类型
integers|整数
minimum|最小
maximum|最大
stop|停止
words|字词
size|大小
sample|样本
print|输出
encryption|加密
scheme|方案
verify|验证
extractor|提取方式
newlines|换行
unicode|Unicode
spaces|空格
rotation|旋转
degrees|度
reversed|反向
radius|半径
point|点
series|序列
colours|颜色
capacity|容量
threshold|阈值
zoom|缩放
time|时间
reverse|反向
order|顺序
join|连接
match|匹配
indentation|缩进
excess|多余
line|行
breaks|换行
section|部分
sensitive|敏感
global|全局
matching|匹配
plaintext|明文
ciphertext|密文
data|数据
convert|转换
final|最终
options|选项
scope|范围
underline|下划线
strikethrough|删除线
count|数量
variant|变体
blocksize|分组大小
decompressed|解压后
rules|规则
strings|字符串
metadata|元数据
counts|数量
rule|规则
warnings|警告
console|控制台
module|模块
messages|消息
operating|操作
system|系统
lengths|长度
counter1|计数器 1
start|起点
lugs|凸耳
ends|结尾
cipher|密码
control|控制
1st|第一
2nd|第二
3rd|第三
4th|第四
5th|第五
left|左
right|右
static|固定
fast|快速
slow|慢速
le|小端
be|大端
`);
export function parameterName(name) {
  if(Object.hasOwn(labels,name))return labels[name];
  if(!name)return '文本';
  if(/^R[123]-Q[1-5]$/.test(name))return '条件 '+name;
  if(/^Add-Q[1-5]$/.test(name))return '加法条件 '+name.slice(4);
  return name.replace(/[A-Za-z]+(?:-[A-Za-z]+)*/g,token=>words[token.toLowerCase()]||token).replace(/ +/g,' ').trim();
}
const optionNames = pairs(`
Space|空格
Comma|逗号
Semi-colon|分号
Colon|冒号
Line feed|换行符
Line Feed|换行符
CRLF|回车换行
Hex|十六进制
Raw|原始内容
RAW|原始内容
Off|关闭
From start|从开头
From end|从结尾
Prepend|前置
Append|追加
None|无
Left|左侧
Center|居中
Centre|居中
Right|右侧
Top|顶部
Middle|中间
Bottom|底部
Encoded hash|编码后的哈希
Hex hash|十六进制哈希
Raw hash|原始哈希字节
Standard (I=J and U=V)|标准（I 与 J、U 与 V 合并）
Complete|完整
Case|大小写
A-M/N-Z first letter|按首字母 A–M / N–Z 分组
Logical shift|逻辑移位
Arithmetic shift|算术移位
Fast|快速
Gaussian|高斯
3-rotor|三转子
4-rotor|四转子
B Thin|窄 B 型
C Thin|窄 C 型
Custom|自定义
True|真
False|假
Array of dictionaries|对象数组
Array of arrays|数组的数组
Dotted Decimal|点分十进制
Decimal|十进制
Octal|八进制
KH Pattern|KH 模式
ZMUG Pattern|ZMUG 模式
BREAM Pattern|BREAM 模式
Select Program|选择程序
Top Section - Conditional|上部：条件
Bottom Section - Addition|下部：加法
Advanced|高级
Letter Count|字母计数
Up (.)|向上（.）
Down (x)|向下（x）
Nearest Neighbour|最近邻
Bilinear|双线性
Bicubic|双三次
Hermite|埃尔米特
Bezier|贝塞尔
Auto|自动
Automatic|自动
Auto-detect|自动检测
auto detect|自动检测
Degrees Minutes Seconds|度分秒
Degrees Decimal Minutes|度与十进制分
Decimal Degrees|十进制度
Military Grid Reference System|军事网格参考系统
Ordnance Survey National Grid|英国国家网格
Universal Transverse Mercator|通用横轴墨卡托坐标
Direction Preceding|方位在前
Direction Following|方位在后
Before|之前
After|之后
Bits (b)|位（b）
Bits|位
Bit|位
Byte|字节
Bytes|字节
Bytes (B)|字节（B）
Nibbles|半字节
Octets|八位字节
Sub|差分
Up|向上
Average|平均值
To Leet Speak|转 Leet 替代字母
From Leet Speak|还原 Leet 替代字母
Standard date and time|标准日期时间
American-style date and time|美式日期时间
International date and time|国际日期时间
Verbose date and time|完整日期时间
UNIX timestamp (seconds)|UNIX 时间戳（秒）
UNIX timestamp offset (milliseconds)|UNIX 时间戳（毫秒）
Add|加
Subtract|减
Valid domains and full URLs|有效域名与完整网址
Only full URLs|仅完整网址
Everything|全部
with salt|包含盐值
no salt|无盐值
skip|跳过
Character|字符
Word|单词
Line|行
Sentence|句子
Little Endian|小端字节序
Big Endian|大端字节序
Full x86 architecture|完整 x86 架构
Raw JSON|原始 JSON
Shannon scale|香农熵
Histogram (Bar)|柱状直方图
Histogram (Line)|折线直方图
Curve|曲线
Image|图片
Include|保留
Remove|移除
Replace with '.'|替换为句点
Special chars|特殊字符
Minimal|最少转义
Single|单引号
Double|双引号
Backtick|反引号
Row|按行
Column|按列
Nothing (separate chars)|无（分离字符）
Nothing (join chars)|无（连接字符）
Horizontal|水平
Vertical|垂直
Both|两者
Upper only|仅大写
Lower only|仅小写
Standard|标准
Hex Extended|扩展十六进制
IPv6|IPv6 地址
HRP: Hex|可读前缀：十六进制
Float (4 bytes)|单精度浮点（4 字节）
Double (8 bytes)|双精度浮点（8 字节）
Percent|百分比
0x with comma|0x 前缀并用逗号分隔
Forward slash|正斜杠
Backslash|反斜杠
Seconds (s)|秒（s）
Milliseconds (ms)|毫秒（ms）
Microseconds (μs)|微秒（μs）
Nanoseconds (ns)|纳秒（ns）
NO|不启用
ZERO|零填充
RANDOM|随机填充
BIT|位填充
All|全部
Greyscale|灰度
Paragraphs|段落
Sentences|句子
Words|单词
Hexadecimal|十六进制
Low|低
Medium|中
Quartile|四分位
High|高
Dynamic Huffman Coding|动态哈夫曼编码
Fixed Huffman Coding|固定哈夫曼编码
None (Store)|不压缩（存储）
Hash digest|哈希摘要
HASSH algorithms string|HASSH 算法字符串
Full details|完整详情
Cross-Origin Resource Sharing|跨域资源共享
No CORS (limited to HEAD, GET or POST)|不使用跨域共享（仅 HEAD、GET、POST）
Raw string|原始字符串
Tab|制表符
Sepia|棕褐色
JA3 string|JA3 字符串
JA3S string|JA3S 字符串
JA4 Original Rendering|JA4 原始显示格式
JA4 Raw|JA4 原始数据
JA4 Raw Original Rendering|JA4 原始数据的原始显示格式
JA4S Raw|JA4S 原始数据
default|默认
No Pattern|无模式
Send|发送
Receive|接收
Plaintext|明文
German Service Enigma (First - 3 rotor)|德国军用恩尼格玛（一型，三转子）
German Service Enigma (Second - 3 rotor)|德国军用恩尼格玛（二型，三转子）
German Service Enigma (Third - 4 rotor)|德国军用恩尼格玛（三型，四转子）
German Service Enigma (Fourth - 4 rotor)|德国军用恩尼格玛（四型，四转子）
User defined|自定义
Tesseract only|仅 Tesseract 引擎
LSTM only|仅 LSTM 引擎
Tesseract/LSTM Combined|Tesseract 与 LSTM 混合
Start|开头
End|结尾
Even Parity|偶校验
Odd Parity|奇校验
Encode|编码
Decode|解码
Text output|文本输出
Packet data|数据包内容
Packet data (hex)|数据包内容（十六进制）
Table|表格
Data (hex)|数据（十六进制）
Data (raw)|原始数据
DER Hex|DER 十六进制
Integer|整数
Byte array|字节数组
Big|大端
Little|小端
Adaptive|自适应
Block|分块
IPv4 address|IPv4 地址
IPv6 address|IPv6 地址
Email address|邮箱地址
Domain|域名
Windows file path|Windows 文件路径
UNIX file path|UNIX 文件路径
MAC address|MAC 地址
Strings|字符串
Highlight matches|高亮匹配结果
List matches|列出匹配结果
List capture groups|列出捕获组
List matches with capture groups|列出匹配结果及捕获组
Pixels|像素
Decode Object|解码对象
Decode Array|解码数组
Encode Object|编码对象
Encode Array|编码数组
Encode URI|编码 URI
Encrypt|加密
Decrypt|解密
Alphabetical (case sensitive)|按字母排序（区分大小写）
Alphabetical (case insensitive)|按字母排序（不区分大小写）
IP address|IP 地址
Numeric|按数值
Numeric (hexadecimal)|按十六进制数值
Length|按长度
Single byte|单字节
16-bit littleendian|16 位小端
16-bit bigendian|16 位大端
Alphanumeric + punctuation (A)|字母数字及标点（ASCII）
All printable chars (A)|全部可打印字符（ASCII）
Null-terminated strings (A)|空字节结尾字符串（ASCII）
Alphanumeric + punctuation (U)|字母数字及标点（Unicode）
All printable chars (U)|全部可打印字符（Unicode）
Null-terminated strings (U)|空字节结尾字符串（Unicode）
String|字符串
Raw bytes|原始字节
Generic|通用
Named entities|命名实体
Numeric entities|十进制实体
Hex entities|十六进制实体
Only special chars|仅特殊字符
Only special chars including spaces|仅特殊字符与空格
All chars|全部字符
Dash/Dot|横线 / 点
DASH/DOT|横线 / 点（大写）
dash/dot|横线 / 点（小写）
Paragraph|段落
Example|示例
Hex (big endian)|十六进制（大端）
Hex (little endian)|十六进制（小端）
Red|红色
Green|绿色
Blue|蓝色
Alpha|透明度
Input differential|输入差分
Output differential|输出差分
Cascade|级联
`);
Object.assign(labels,pairs(`
CSS selector|CSS 选择器
Windows|Windows 文件路径
UNIX|UNIX 文件路径
IPv4|IPv4 地址
IPv6|IPv6 地址
MAC|消息认证码（MAC）
URL|网址
Character|字符
Decode Option|解码方式
Encode Option|编码方式
XPath|XPath 表达式
Starting index|起始索引
Hashing function|哈希函数
All hashes|全部哈希
Section (regex)|选取范围（正则）
Add-Equals|加法等于条件
Add-Counter1|加法计数器 1
`));
Object.assign(words,pairs(`
selector|选择器
function|函数
hashes|哈希
starting|起始
character|字符
decode|解码
option|选项
metric|公制
imperial|英制
comparisons|对比单位
astronomical|天文单位
scientific|科学参考
archaic|历史单位
maritime|航海单位
square|平方
metre|米
metres|米
kilometre|千米
kilometres|千米
kilometers|千米
inch|英寸
inches|英寸
foot|英尺
feet|英尺
yard|码
yards|码
mile|英里
miles|英里
acre|英亩
international|国际
survey|测量
us|美国
customary|惯用
nuclear|核
physics|物理
planck|普朗克
area|面积
cables|链
nautical|海里
cars|汽车
buses|公交车
football|足球
pitches|场
american|美式
fields|场
avoirdupois|常衡制
troy|金衡制
dram|打兰
ounce|盎司
pound|磅
ton|吨
tonnes|吨
mass|质量
lunar|月球
earth|地球
jupiter|木星
solar|太阳
growth|生长
rate|速度
escape|逃逸
velocity|速度
second|秒
hour|小时
per|每
knots|节
light-years|光年
parsecs|秒差距
fathoms|英寻
thou|密耳
chains|链
furlongs|弗隆
leagues|里格
centiare|平方厘米
are|公亩
deciare|十分之一公亩
decare|十公亩
hectare|公顷
perch|平方杆
rood|四分之一英亩
barn|靶恩
outhouse|外屋单位
shed|棚屋单位
gram|克
tonne|吨
grain|格令
stone|英石
nail|奈尔
quarter|夸特
tod|托德
mark|马克
wey|韦伊
load|载量
last|拉斯特
picul|担
wool|羊毛
coal|煤炭
sack|袋
flax|亚麻
feather|羽毛
gunpowder|火药
rice|稻米
rice|稻米
pennyweight|本尼威特
north|北部
south|南部
western|西欧
central|中欧
european|欧洲
latin|拉丁
cyrillic|西里尔
multilingual|多语言
modern|现代
greek|希腊文
french|法文
turkish|土耳其文
lao|老挝文
euro|欧元
symbol|符号
germany|德国
denmark-norway|丹麦与挪威
finland-sweden|芬兰与瑞典
italy|意大利
latin america-spain|拉美与西班牙
kingdom|王国
united|联合
france|法国
icelandic|冰岛文
japanese|日文
katakana|片假名
extended|扩展
arabic|阿拉伯文
hebrew|希伯来文
korean|韩文
thai|泰文
russian|俄文
serbian-bulgarian|塞尔维亚与保加利亚文
states|美国
formerly|原
baltic|波罗的海
primarily|主要
portuguese|葡萄牙文
canadian|加拿大
nordic|北欧
vietnam|越南文
celtic|凯尔特文
halfwidth|半角
simplified|简体
chinese|中文
traditional|繁体
non-spacing|不占位
accent|重音
with|含
no|无
devanagari|天城文
bengali|孟加拉文
tamil|泰米尔文
telugu|泰卢固文
assamese|阿萨姆文
oriya|奥里亚文
kannada|卡纳达文
malayalam|马拉雅拉姆文
gujarati|古吉拉特文
punjabi|旁遮普文
ukrainian|乌克兰文
transparent|透明
roman|罗马
romanian|罗马尼亚文
croatian|克罗地亚文
taiwan|台湾
swedish|瑞典文
norwegian|挪威文
german|德文
safe|安全
filename|文件名
zero|零
cuba|古巴
egypt|埃及
eire|爱尔兰
greenwich|格林尼治
hongkong|香港
iceland|冰岛
iran|伊朗
israel|以色列
jamaica|牙买加
japan|日本
kwajalein|夸贾林
libya|利比亚
navajo|纳瓦霍
poland|波兰
portugal|葡萄牙
singapore|新加坡
turkey|土耳其
universal|通用
zulu|祖鲁
`));
Object.assign(optionNames,pairs(`
1+2=. (1+2 Break In, Find X1,X2)|1+2=.（破解并查找 X1、X2）
4=5=/1=2 (Given X1,X2 find X4,X5)|4=5=/1=2（由 X1、X2 查找 X4、X5）
/,5,U (Count chars to find X3)|/,5,U（计数字符以查找 X3）
US survey township|美国测量乡镇
Washington D.C.|华盛顿特区
Isle of Wight|怀特岛
Wales|威尔士
Texas|得克萨斯州
Earth-to-Moons|地月距离
Earth's equators|地球赤道周长
Astronomical units (au)|天文单位（au）
US hundredweight (cwt)|美制英担（cwt）
Imperial hundredweight (cwt)|英制英担（cwt）
Suffolk wey|萨福克韦伊
Big Ben (14 tonnes)|大本钟（14 吨）
Blue whale (180 tonnes)|蓝鲸（180 吨）
International Space Station (417 tonnes)|国际空间站（417 吨）
Space Shuttle (2,041 tonnes)|航天飞机（2,041 吨）
RMS Titanic (52,000 tonnes)|泰坦尼克号（52,000 吨）
Great Pyramid of Giza (6,000,000 tonnes)|吉萨大金字塔（6,000,000 吨）
Earth's oceans (1.4 yottagrams)|地球海洋（1.4 尧克）
A teaspoon of neutron star (5,500 million tonnes)|一茶匙中子星物质（55 亿吨）
Sagittarius A* (7.5 x 10^36 kgs-ish)|人马座 A*（约 7.5×10³⁶ 千克）
Milky Way galaxy (1.2 x 10^42 kgs)|银河系（1.2×10⁴² 千克）
The observable universe (1.45 x 10^53 kgs)|可观测宇宙（1.45×10⁵³ 千克）
Human hair growth rate|人类头发生长速度
Bamboo growth rate|竹子生长速度
World's fastest snail|最快蜗牛的速度
Usain Bolt's top speed|博尔特最高速度
Jet airliner cruising speed|喷气客机巡航速度
Concorde|协和式客机
SR-71 Blackbird|SR-71 黑鸟侦察机
Space Shuttle|航天飞机
International Space Station|国际空间站
Sound in standard atmosphere|标准大气中的声速
Sound in water|水中声速
Earth's solar orbit|地球公转速度
Solar system's Milky Way orbit|太阳系绕银河公转速度
Milky Way relative to the cosmic microwave background|银河系相对宇宙微波背景的速度
Light in a diamond (0.4136c)|钻石中的光速（0.4136c）
Signal in an optical fibre (0.667c)|光纤中的信号速度（0.667c）
Light (c)|真空光速（c）
Roboto Black|Roboto 黑体
Roboto Mono|Roboto 等宽体
Roboto Slab|Roboto 衬线体
Thumb|Thumb 指令集
Knights Corner|Knights Corner 架构
Larrabee|Larrabee 架构
Bitcoin scriptPubKey|比特币公钥脚本
Bitcoin SegWit|比特币隔离见证
Triple DES|三重 DES
`));
// SI prefixes also apply to less frequently used unit choices.
const prefixes={yocto:'幺',zepto:'仄',atto:'阿',femto:'飞',pico:'皮',nano:'纳',micro:'微',milli:'毫',centi:'厘',deci:'分',deca:'十',hecto:'百',kilo:'千',mega:'兆',giga:'吉',tera:'太',peta:'拍',exa:'艾',zetta:'泽',yotta:'尧',kibi:'二进制千',mebi:'二进制兆',gibi:'二进制吉',tebi:'二进制太',pebi:'二进制拍',exbi:'二进制艾',zebi:'二进制泽',yobi:'二进制尧'};
for(const [prefix,zh]of Object.entries(prefixes))for(const [suffix,unit]of Object.entries({gram:'克',barn:'靶恩',bits:'位',bytes:'字节',metres:'米'}))words[prefix+suffix]=zh+unit;
const optionCache = new Map();
export function optionName(value) {
  const name=String(value);
  if(Object.hasOwn(optionNames,name))return optionNames[name];
  if(optionCache.has(name))return optionCache.get(name);
  let translated=name;
  if(/^(?:CBC|ECB)\/NoPadding$/.test(name))translated=name.replace('/NoPadding',' / 无填充');
  else if(/^Example \d+$/.test(name))translated=name.replace('Example','示例');
  else if(/^Date \(/.test(name))translated=name.replace('Date','日期');
  else if(name.includes('/')&&/^(Africa|America|Antarctica|Arctic|Asia|Atlantic|Australia|Brazil|Canada|Chile|Etc|Europe|Indian|Mexico|Pacific|US)\//.test(name)) {
    try {translated=new Intl.DateTimeFormat('zh-CN',{timeZone:name,timeZoneName:'long'}).formatToParts(new Date('2026-01-01')).find(p=>p.type==='timeZoneName').value+`（${name}）`;}catch{translated='时区：'+name;}
  } else translated=parameterName(name);
  optionCache.set(name,translated);return translated;
}
const types={string:'文本',byteArray:'字节数组',ArrayBuffer:'原始字节',number:'数值',BigNumber:'大整数',HTML:'HTML 内容',File:'文件',FileList:'文件列表',JSON:'JSON 数据',html:'HTML 内容'};
const descriptions = pairs(`
Remove EXIF|无损移除 JPEG 的 EXIF 元数据；没有 EXIF 时原样返回。不重新编码图像，也不会清除 XMP、IPTC 等其他元数据。
From Base64|将 Base64 字符串解码为原始字节；可选择字符表，并控制是否忽略无效字符。
To Base64|将输入字节编码为 Base64 字符串，适合以文本形式传输二进制数据。
From Hex|将十六进制文本还原为字节。自动模式可识别常见分隔符。
To Hex|将输入字节表示为十六进制文本，可设置分隔符与每行字节数。
ROT13|按指定数量循环移动字母或数字。默认移位 13，用相同参数再次执行可还原英文字母。
Vigenère Decode|使用重复的关键词解密维吉尼亚密码。在密钥中填写加密时使用的字母关键词。
Vigenère Encode|使用重复的关键词对英文字母进行维吉尼亚加密。
AES Decrypt|使用指定密钥、初始向量和分组模式进行 AES 解密。密钥长度 16、24、32 字节分别对应 AES-128、AES-192、AES-256。输入格式与加密结果须一致。
AES Encrypt|使用指定密钥、初始向量和分组模式进行 AES 加密。CBC、ECB 默认使用 PKCS#7 填充；无填充模式要求输入长度符合分组要求。
SHA2|计算 SHA-2 哈希摘要。选择 224、256、384 或 512 等位数；同一输入和参数总会生成同一摘要。
XOR|将输入字节与密钥逐字节进行异或运算。密钥可按十六进制、UTF-8 等格式填写；通常用相同密钥再执行一次即可还原。
Regular expression|用正则表达式查找文本。可选择高亮、列出匹配项或提取捕获组，并设置多行、大小写与 Unicode 行为。
Find / Replace|查找文本或正则表达式并替换。全局匹配启用时会替换全部匹配项。
HTTP request|按网址、请求方式和头部发送网络请求，返回响应内容。此操作需要联网；输入作为请求数据发送时会离开本机。
DNS over HTTPS|通过指定的 HTTPS DNS 解析器查询域名记录，此操作需要联网。
Gzip|使用 Deflate 算法和 Gzip 头部压缩输入，可附加文件名、注释和校验和。
Gunzip|解压 Gzip 格式数据，输入应为原始压缩字节。
Magic|尝试识别输入的编码与格式，并给出解码候选；识别结果需结合原始线索判断。
Entropy|统计输入数据的信息熵，用于观察字节分布。熵值不能单独证明数据已经加密。
Fork|按分隔符把输入分成多个部分，分别执行后续操作；可与合并操作组合使用。
Merge|合并分支处理的结果，作为一个整体交给后续操作。
Sleep|等待指定毫秒数后继续处理链。可用停止按钮中断执行。
`);
export function operationDescription(name, definition) {
  if(descriptions[name])return descriptions[name];
  return `${operationName(name)}。输入：${types[definition.inputType]||definition.inputType}；输出：${types[definition.outputType]||definition.outputType}。${definition.args.some(a=>a.type!=='label')?'按下方参数设置后执行。':'无需设置参数。'}${definition.flowControl?'此操作会控制后续处理链的执行顺序。':''}`;
}
export function localizedError(message) {
  const raw=String(message);
  const replacements=[[/Could not remove EXIF data from image:/gi,'无法移除图片的 EXIF：'],[/Given data (?:is not|isn’t|isn't) jpeg\./gi,'输入不是 JPEG 图片。'],[/Wrong JPEG data\./gi,'JPEG 数据已损坏。'],[/Invalid recipe/gi,'无效配方'],[/Invalid input/gi,'无效输入'],[/Invalid (.+?) length/gi,'$1 长度无效'],[/Invalid (.+)/gi,'$1 无效'],[/not a valid/gi,'不是有效的'],[/must be/gi,'必须为'],[/cannot be/gi,'不能为'],[/should be/gi,'应为'],[/not found/gi,'未找到'],[/is required/gi,'不能为空'],[/Error:/g,'错误：']];
  let text=raw;for(const [regex,value]of replacements)text=text.replace(regex,value);return /[\u3400-\u9fff]/.test(text)?text:`操作执行失败：${raw}`;
}
