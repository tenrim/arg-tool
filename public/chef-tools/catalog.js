import {OPERATION_KEYWORDS,searchText,matchesSearch} from '../tool-search.js';
// A complete, deterministic routing of the pinned catalogue; operations retain upstream IDs.
export const GROUPS={
 classical:{title:'古典密码',panel:'crypto',hint:'字母移位、替换和换位：凯撒、维吉尼亚、培根、栅栏等'},
 machines:{title:'机械密码机',panel:'crypto',hint:'模拟恩尼格玛等转子机器，需按题目设置转子与接线'},
 symmetric:{title:'现代对称加密',panel:'crypto',hint:'AES、DES、ChaCha 等；加密与解密使用同一密钥'},
 publickey:{title:'公钥加密',panel:'crypto',hint:'RSA、PGP、SM2；使用公钥加密、私钥解密'},
 signatures:{title:'数字签名与认证',panel:'crypto',hint:'签名、验签、HMAC 与 CMAC；用于验证内容和来源'},
 credentials:{title:'令牌与动态口令',panel:'crypto',hint:'JWT、Fernet、Flask 会话及一次性口令的生成与验证'},
 derivation:{title:'密钥派生与密码校验',panel:'crypto',hint:'PBKDF2、HKDF、Scrypt、Bcrypt、Argon2；密码哈希不能直接解密'},
 base:{title:'Base 系列编码',panel:'encoding',hint:'Base64、Base32、Base58 等；编码可还原，无需密钥'},
 radix:{title:'进制与数字表示',panel:'encoding',hint:'二进制、八进制、十进制、十六进制及浮点数表示'},
 charset:{title:'字符集与 Unicode',panel:'encoding',hint:'UTF-8、GBK 等字符集互转，字符码与 Unicode 转义'},
 webencoding:{title:'网页与邮件编码',panel:'encoding',hint:'URL 百分号、HTML 实体、Punycode 与邮件编码'},
 symbolic:{title:'摩斯、盲文与符号编码',panel:'encoding',hint:'点划、盲文、字母序号和特殊符号与文字互转'},
 binaryencoding:{title:'二进制封装编码',panel:'encoding',hint:'COBS、Bech32、Modhex、VarInt 与特殊传输格式'},
 language:{title:'语言与文字变体',panel:'language',hint:'读音字母表、Leet、变音符号与 Unicode 字形规范化'},
 clean:{title:'清理与排版',panel:'textlab',hint:'去空白、排序、去重、分行、大小写、查找替换'},
 extract:{title:'查找与提取',panel:'textlab',hint:'正则、邮箱、网址、日期、关键词与字符串提取'},
 compare:{title:'文本比较',panel:'textlab',hint:'比较两份文字的差异、编辑距离和相似度'},
 format:{title:'格式互转',panel:'datalab',hint:'JSON、CSV、YAML、XML、二进制序列化'},
 code:{title:'代码整理',panel:'datalab',hint:'格式化、压缩、查询、HTML 与 Markdown'},
 charts:{title:'数据图表',panel:'datalab',hint:'散点、序列、热力和密度图'},
 imageEdit:{title:'尺寸与方向',panel:'image',hint:'缩放、旋转、裁剪、镜像、画布填充'},
 imageColour:{title:'色彩与滤镜',panel:'image',hint:'亮度、对比度、色相、透明度、锐化与模糊'},
 imageInspect:{title:'图像数据',panel:'image',hint:'通道分离、位平面、RGBA、EXIF、低位提取'},
 imageMake:{title:'生成与转换',panel:'image',hint:'二维码、字节成图、格式转换、图片文字'},
 hashes:{title:'哈希与校验',panel:'file',hint:'MD5、SHA、CRC、HMAC、模糊哈希与校验和'},
 compression:{title:'压缩与解压',panel:'file',hint:'Gzip、Bzip2、LZMA、LZ4、ZIP 与 TAR'},
 inspect:{title:'文件与字节',panel:'file',hint:'文件类型、嵌入文件、字节截取、反汇编'},
 statistics:{title:'识别与统计',panel:'analysis',hint:'自动识别编码、字频、重合指数、熵与卡方检验'},
 audio:{title:'音频元数据',panel:'audio',hint:'ID3、WAV、FLAC 等音频标签与内嵌文字'},
 media:{title:'媒体解码预览',panel:'video',hint:'从原始文件、Base64 或十六进制预览媒体'},
 time:{title:'时间与坐标格式',panel:'coordinates',hint:'日期解析、时差、Windows 时间、坐标文本'},
 network:{title:'网络数据',panel:'networklab',hint:'网址、IP、数据包、协议和网络指纹'},
 certificates:{title:'证书与密钥格式',panel:'crypto',hint:'查看证书，转换 PEM、JWK、SSH 等密钥格式'},
 maths:{title:'数值与集合',panel:'mathlab',hint:'统计量、集合运算、模逆、进制逻辑'},
 units:{title:'单位与生成器',panel:'mathlab',hint:'距离、面积、质量、数据单位、随机数'},
 advanced:{title:'处理链控制',panel:'cyberchef',hint:'分支、循环、寄存器和高级操作'}
};
const names=s=>s.split('|');
export function classifyCatalogue(catalogue){
 const assigned=new Map(),assign=(group,ops)=>ops.forEach(op=>{if(catalogue.operations[op])assigned.set(op,group);});
 const category=(label,group)=>assign(group,catalogue.categories.find(c=>c.name===label)?.ops||[]);
 // No catch-all destination: a newly imported operation must be classified explicitly.
 category('Utils','clean');category('Language','compare');category('Extractors','extract');category('Code tidy','code');category('Networking','network');category('Public Key','certificates');category('Arithmetic / Logic','maths');category('Hashing','hashes');category('Compression','compression');category('Date / Time','time');category('Forensics','inspect');category('Encryption / Encoding','crypto');category('Flow control','advanced');
 assign('format',names('AMF Encode|AMF Decode|To MessagePack|From MessagePack|Parse TLV|CSV to JSON|JSON to CSV|Avro to JSON|CBOR Encode|CBOR Decode|YAML to JSON|JSON to YAML|Rison Encode|Rison Decode|BSON serialise|BSON deserialise|PHP Deserialize|PHP Serialize|Protobuf Decode|Protobuf Encode|P-list Viewer|MIME Decoding|To Table'));
 assign('code',names('XPath expression|JPath expression|Jsonata Query|Jq|CSS selector|HTML To Text|Render Markdown|Template'));
 assign('compare',names('Diff|Hamming Distance|Levenshtein Distance|Fuzzy Match|Unicode Text Format|Normalise Unicode|Remove Diacritics|Convert to NATO alphabet|Convert Leet Speak'));
 assign('extract',names('Regular expression|Extract dates|RAKE|Strings'));
 assign('units',names('Convert distance|Convert area|Convert mass|Convert speed|Convert data units|Pseudo-Random Number Generator|Pseudo-Random Integer Generator|Pseudo-Random Prime Generator|Generate De Bruijn Sequence|Generate UUID|Analyse UUID|Generate Lorem Ipsum'));
 assign('time',names('Convert co-ordinate format|Haversine distance|Parse ObjectID timestamp'));
 assign('inspect',names('Drop bytes|Take bytes|Swap endianness|Take nth bytes|Drop nth bytes|Offset checker|Remove null bytes|Disassemble x86|Disassemble ARM|Parse UNIX file permissions|File Tree|Render PDF'));
 assign('statistics',names('Entropy|Frequency distribution|Index of Coincidence|Chi Square'));
 assign('hashes',names('Bcrypt|Scrypt|HMAC|CMAC'));
 assign('imageEdit',names('Resize Image|Rotate Image|Crop Image|Flip Image|Contain Image|Cover Image'));
 assign('imageColour',names('Blur Image|Dither Image|Invert Image|Image Brightness / Contrast|Image Opacity|Image Filter|Image Hue/Saturation/Lightness|Sharpen Image|Normalise Image|Randomize Colour Palette|Parse colour code'));
 assign('imageInspect',names('Remove EXIF|Extract EXIF|Split Colour Channels|Extract RGBA|View Bit Plane|Extract LSB|Parse QR Code'));
 assign('imageMake',names('Render Image|Generate Image|Convert Image Format|Add Text To Image|Generate QR Code'));
 assign('charts',names('Hex Density chart|Scatter chart|Series chart|Heatmap chart'));
 assign('audio',names('Extract Audio Metadata|Extract ID3'));assign('media',['Play Media']);
 assign('advanced',names('Sleep|Show on map|Numberwang|XKCD Random Number|Automated Validation Test Op|Optical Character Recognition'));

 assign('classical',names('A1Z26 Cipher Decode|A1Z26 Cipher Encode|Affine Cipher Decode|Affine Cipher Encode|Atbash Cipher|Bacon Cipher Decode|Bacon Cipher Encode|Bifid Cipher Decode|Bifid Cipher Encode|Caesar Box Cipher|LS47 Decrypt|LS47 Encrypt|ROT13|ROT13 Brute Force|ROT47|ROT47 Brute Force|ROT8000|Rail Fence Cipher Decode|Rail Fence Cipher Encode|Substitute|Vigenère Decode|Vigenère Encode'));
 assign('machines',names('Bombe|Colossus|Enigma|Lorenz|Multiple Bombe|SIGABA|Typex'));
 assign('symmetric',names('AES Decrypt|AES Encrypt|AES Key Unwrap|AES Key Wrap|Ascon Decrypt|Ascon Encrypt|Blowfish Decrypt|Blowfish Encrypt|ChaCha|CipherSaber2 Decrypt|CipherSaber2 Encrypt|DES Decrypt|DES Encrypt|GOST Decrypt|GOST Encrypt|GOST Key Unwrap|GOST Key Wrap|PRESENT Decrypt|PRESENT Encrypt|RC2 Decrypt|RC2 Encrypt|RC4|RC4 Drop|RC6 Decrypt|RC6 Encrypt|ROR13|Rabbit|SM4 Decrypt|SM4 Encrypt|Salsa20|TEA Decrypt|TEA Encrypt|Triple DES Decrypt|Triple DES Encrypt|Twofish Decrypt|Twofish Encrypt|XOR|XOR Brute Force|XSalsa20|XTEA Decrypt|XTEA Encrypt|XXTEA Decrypt|XXTEA Encrypt'));
 assign('publickey',names('Generate PGP Key Pair|Generate RSA Key Pair|PGP Decrypt|PGP Decrypt and Verify|PGP Encrypt|PGP Encrypt and Sign|RSA Decrypt|RSA Encrypt|SM2 Decrypt|SM2 Encrypt'));
 assign('signatures',names('ECDSA Sign|ECDSA Signature Conversion|ECDSA Verify|Generate ECDSA Key Pair|GOST Sign|GOST Verify|PGP Sign|PGP Verify|RSA Sign|RSA Verify|Ascon MAC|HMAC|CMAC'));
 assign('credentials',names('Fernet Decrypt|Fernet Encrypt|Flask Session Decode|Flask Session Sign|Flask Session Verify|Generate HOTP|Generate TOTP|JWT Decode|JWT Sign|JWT Verify'));
 assign('derivation',names('Derive EVP key|Derive HKDF key|Derive PBKDF2 key|Argon2|Argon2 compare|Bcrypt|Bcrypt compare|Bcrypt parse|Scrypt'));
 assign('base',names('From Base32|From Base45|From Base58|From Base62|From Base64|From Base85|From Base92|To Base32|To Base45|To Base58|To Base62|To Base64|To Base85|To Base92|Show Base64 offsets'));
 assign('radix',names('From BCD|From Base|From Binary|From Decimal|From Float|From Hex|From Hex Content|From Hexdump|From Octal|To BCD|To Base|To Binary|To Decimal|To Float|To Hex|To Hex Content|To Hexdump|To Octal|Text-Integer Conversion'));
 assign('charset',names('Decode text|Encode text|Escape Smart Characters|Escape Unicode Characters|Unescape Unicode Characters|From Charcode|To Charcode|Text Encoding Brute Force'));
 assign('webencoding',names('URL Decode|URL Encode|From HTML Entity|To HTML Entity|From Punycode|To Punycode|From Quoted Printable|To Quoted Printable|MIME Decoding'));
 assign('symbolic',names('From Braille|To Braille|From Morse Code|To Morse Code|Cetacean Cipher Decode|Cetacean Cipher Encode'));
 assign('binaryencoding',names('Caret/M-decode|Citrix CTX1 Decode|Citrix CTX1 Encode|From COBS|To COBS|From Bech32|To Bech32|From Modhex|To Modhex|VarInt Decode|VarInt Encode|Decode NetBIOS Name|Encode NetBIOS Name'));
 assign('language',names('Unicode Text Format|Normalise Unicode|Remove Diacritics|Convert to NATO alphabet|Convert Leet Speak'));
 assign('statistics',['Magic']);
 for(const op of Object.keys(catalogue.operations))if(!GROUPS[assigned.get(op)])throw Error('尚未分类的 CyberChef 操作：'+op);
 const excluded={'Optical Character Recognition':'按此前要求，不提供图片 OCR 入口。','Automated Validation Test Op':'上游内部参数测试，不作为工具入口。','Numberwang':'上游娱乐操作，保留在完整处理链中。','XKCD Random Number':'固定笑话数字，保留在完整处理链中。','Show on map':'依赖外部地图界面；坐标工具已有本地换算。'};
 return Object.keys(catalogue.operations).map(op=>({op,group:assigned.get(op),panel:GROUPS[assigned.get(op)].panel,reason:excluded[op]||'',mode:excluded[op]?'retained':op==='Unzip'?'existing':GROUPS[assigned.get(op)].panel==='cyberchef'?'chain':'task'}));
}
let pending;
export function getCatalogue(){return pending??=fetch(new URL('../vendor/cyberchef/catalogue.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('功能目录加载失败，请重试。');return r.json();}).catch(e=>{pending=null;throw e;});}
export const NETWORK_OPS=new Set(['HTTP request','DNS over HTTPS','Show on map']);
export const IMAGE_INPUT=new Set(names('Render Image|Resize Image|Rotate Image|Crop Image|Flip Image|Contain Image|Cover Image|Blur Image|Dither Image|Invert Image|Image Brightness / Contrast|Image Opacity|Image Filter|Image Hue/Saturation/Lightness|Sharpen Image|Normalise Image|Randomize Colour Palette|Remove EXIF|Extract EXIF|Split Colour Channels|Extract RGBA|View Bit Plane|Extract LSB|Parse QR Code|Convert Image Format|Add Text To Image'));
const aliases={'Resize Image':'图片缩放 缩小 放大 调整分辨率','Crop Image':'图片裁剪 裁边 截图','Rotate Image':'图片旋转 转向','Flip Image':'图片镜像 翻转 倒写','Image Brightness / Contrast':'图片变亮 变暗 调整对比度','Generate QR Code':'生成二维码 制作二维码','Convert Image Format':'图片转格式 转PNG 转JPG 转JPEG','Unique':'去重 删除重复 重复行','Find / Replace':'替换文字 批量替换','Remove whitespace':'删除空格 去空白','Sort':'文本排序 排序行','CSV to JSON':'表格转换 CSV转JSON','JSON Beautify':'格式化JSON JSON排版','Extract Audio Metadata':'音乐信息 音频标签 歌名 作者'};
export function searchScore(entry,term,label){const q=searchText(term);if(!q)return 1;if(searchText(entry.op)===q||searchText(label)===q)return 4;if(matchesSearch(`${entry.op} ${label} ${aliases[entry.op]||''} ${OPERATION_KEYWORDS[entry.op]||''}`,term))return 3;if(matchesSearch(`${GROUPS[entry.group].title} ${GROUPS[entry.group].hint}`,term))return 1;return 0;}
