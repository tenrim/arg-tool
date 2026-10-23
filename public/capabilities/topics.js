// Public discovery metadata only. A topic groups one concrete job or artifact;
// it does not declare inverse operations, shared argument semantics or engines.
// Keep official operation IDs and existing native task IDs intact. The registry
// owns active-scope filtering, aliases, routing and unique source coverage.
const chef = (id, title, group, operations) => Object.freeze({
  id, title, group, operations: Object.freeze(operations), nativeIds: Object.freeze([])
});
const native = (id, title, group, nativeIds) => Object.freeze({
  id, title, group, operations: Object.freeze([]), nativeIds: Object.freeze(nativeIds)
});

export const CAPABILITY_TOPICS = Object.freeze([
  chef('base-family', 'Base 家族编解码', 'encoding', [
    ...['Base32','Base45','Base58','Base62','Base64','Base85','Base92'].flatMap(name=>['To '+name,'From '+name]),
    'Show Base64 offsets'
  ]),
  chef('byte-numerals', '数字与字节编解码', 'characters', [
    ...['Binary','Octal','Decimal','Hex','Hex Content','Hexdump','Float','BCD','Base'].flatMap(name=>['To '+name,'From '+name]),
    'Text-Integer Conversion'
  ]),
  Object.freeze({id:'qr',title:'二维码与条形码工具',group:'image',
    nativeIds:Object.freeze(['native:image-barcode','native:image-qr','native:barcode-generate']),
    operations:Object.freeze(['Generate QR Code','Parse QR Code'])}),
  native('braille','盲文工具','communication',['native:braille','native:braille-languages','native:gs8']),
  native('marine','海事信号工具','characters-reference',['native:marine','native:marine-signals']),
  native('semaphore','旗语工具','communication',['native:semaphore','native:semaphore-batch']),
  Object.freeze({id:'radiotelephony',title:'无线电拼读字母',group:'communication',nativeIds:Object.freeze(['native:nato']),operations:Object.freeze(['Convert to NATO alphabet'])}),
  native('character-codes', '字符编码与码点', 'characters', ['native:ascii','native:utf8','native:codepoint']),
  native('text-escapes', '文字转义与还原', 'encoding', ['native:escape-hex','native:escape-unicode','native:escape-html','native:escape-url']),
  // All extract from the same supplied text; select the actual target/pattern.
  chef('extract-patterns', '信息提取', 'text-language', [
    'Extract dates', 'Extract URLs', 'Extract domains', 'Extract email addresses',
    'Extract IP addresses', 'Extract MAC addresses', 'Extract file paths',
    'Extract hashes', 'Strings', 'RAKE', 'Regular expression'
  ]),
  // One key/message ecosystem, including actual generation and inspection.
  chef('pgp', 'PGP 工具', 'modern', [
    'Parse PGP Key', 'PGP Decrypt', 'PGP Encrypt', 'PGP Encrypt and Sign',
    'PGP Decrypt and Verify', 'PGP Sign', 'PGP Verify', 'Generate PGP Key Pair'
  ]),
  chef('rsa', 'RSA 工具', 'modern', [
    'RSA Encrypt', 'RSA Decrypt', 'RSA Sign', 'RSA Verify', 'Generate RSA Key Pair'
  ]),
  chef('ecdsa', 'ECDSA 签名工具', 'authentication', [
    'ECDSA Sign', 'ECDSA Verify', 'ECDSA Signature Conversion', 'Generate ECDSA Key Pair'
  ]),
  chef('jwt', 'JWT 令牌工具', 'authentication', ['JWT Decode', 'JWT Sign', 'JWT Verify']),
  chef('flask-session', 'Flask 会话工具', 'authentication', [
    'Flask Session Decode', 'Flask Session Sign', 'Flask Session Verify'
  ]),
  chef('one-time-password', '动态口令', 'authentication', ['Generate TOTP', 'Generate HOTP']),
  chef('bcrypt', 'Bcrypt 密码校验', 'authentication', ['Bcrypt', 'Bcrypt compare', 'Bcrypt parse']),
  chef('argon2', 'Argon2 密码校验', 'authentication', ['Argon2', 'Argon2 compare']),
  chef('key-derivation', '密钥派生', 'authentication', [
    'Derive PBKDF2 key', 'Derive HKDF key', 'Derive EVP key', 'Scrypt'
  ]),
  chef('message-authentication', '消息认证码', 'authentication', ['HMAC', 'CMAC', 'Ascon MAC']),
  chef('certificate-inspection', '证书与请求解析', 'authentication', [
    'Parse X.509 certificate', 'Parse X.509 CRL', 'Parse CSR', 'Public Key from Certificate'
  ]),
  // Format conversions are one key-artifact job, not an invented inverse pair.
  chef('key-format', '密钥格式转换', 'authentication', [
    'PEM to JWK', 'JWK to PEM', 'PEM to Hex', 'Hex to PEM',
    'Public Key from Private Key', 'Parse SSH Host Key'
  ]),
  chef('asn1', 'ASN.1 与对象标识符', 'authentication', [
    'Parse ASN.1 hex string', 'Hex to Object Identifier', 'Object Identifier to Hex'
  ]),
  // Different algorithms are choices for the same digest task; identification
  // and batch calculation remain available alongside individual algorithms.
  chef('hash-digests', '哈希计算与识别', 'files', [
    'SHA2', 'SHA3', 'SHA1', 'MD5', 'SM3', 'BLAKE2b', 'BLAKE2s', 'BLAKE3',
    'Keccak', 'Shake', 'RIPEMD', 'Whirlpool', 'Ascon Hash', 'GOST Hash', 'Streebog',
    'HAS-160', 'MD2', 'MD4', 'MD6', 'SHA0', 'Snefru', 'MurmurHash3',
    'LM Hash', 'NT Hash', 'Analyse hash', 'Generate all hashes'
  ]),
  chef('checksums', '校验和计算', 'files', [
    'CRC Checksum', 'Adler-32 Checksum', 'Fletcher-8 Checksum',
    'Fletcher-16 Checksum', 'Fletcher-32 Checksum', 'Fletcher-64 Checksum',
    'Luhn Checksum', 'Parity Bit', 'TCP/IP Checksum', 'XOR Checksum', 'Generate all checksums'
  ]),
  chef('fuzzy-hashes', '文件相似哈希', 'files', [
    'SSDEEP', 'Compare SSDEEP hashes', 'CTPH', 'Compare CTPH hashes'
  ]),
  // ZIP extraction retains its own directory/entry model (the Unzip task).
  // Other codecs share the byte input/result contract and stay lossless where
  // the actual upstream algorithm supports that, without a blanket promise.
  chef('compression', '压缩与解压', 'files', [
    'Gzip', 'Gunzip', 'Bzip2 Compress', 'Bzip2 Decompress',
    'LZMA Compress', 'LZMA Decompress', 'LZ4 Compress', 'LZ4 Decompress',
    'LZString Compress', 'LZString Decompress', 'Raw Deflate', 'Raw Inflate',
    'Zlib Deflate', 'Zlib Inflate', 'Tar', 'Untar', 'Zip',
    'LZNT1 Decompress', 'XPRESS Decompress', 'XPRESS LZ77+Huffman Decompress'
  ]),
  chef('embedded-files', '嵌入文件检查与提取', 'files', ['Scan for Embedded Files', 'Extract Files']),
  chef('disassembly', '机器码反汇编', 'files', ['Disassemble x86', 'Disassemble ARM']),
  chef('byte-slicing', '字节截取与排列', 'files', [
    'Take bytes', 'Drop bytes', 'Take nth bytes', 'Drop nth bytes',
    'Swap endianness', 'Remove null bytes', 'Offset checker'
  ]),
  // Formatting and querying stay grouped by the actual document syntax. This
  // avoids mixing markup selectors, SQL formatting and binary serializers.
  chef('json', 'JSON 整理与查询', 'formats', [
    'JSON Beautify', 'JSON Minify', 'JPath expression', 'Jsonata Query', 'Jq'
  ]),
  chef('xml', 'XML 整理与查询', 'formats', ['XML Beautify', 'XML Minify', 'XPath expression']),
  chef('css', 'CSS 整理与查询', 'formats', ['CSS Beautify', 'CSS Minify', 'CSS selector']),
  chef('javascript-source', 'JavaScript 源码整理', 'formats', [
    'JavaScript Beautify', 'JavaScript Minify', 'JavaScript Parser', 'Microsoft Script Decoder'
  ]),
  chef('sql-formatting', 'SQL 排版', 'formats', ['SQL Beautify', 'SQL Minify']),
  chef('html-text', 'HTML 文字提取', 'formats', ['HTML To Text', 'Strip HTML tags']),
  chef('table-data', '表格与文本数据转换', 'formats', [
    'CSV to JSON', 'JSON to CSV', 'JSON to YAML', 'YAML to JSON', 'To Table'
  ]),
  chef('structured-binary', '结构化数据编解码', 'formats', [
    'To MessagePack', 'From MessagePack', 'CBOR Encode', 'CBOR Decode',
    'BSON serialise', 'BSON deserialise', 'Protobuf Encode', 'Protobuf Decode',
    'AMF Encode', 'AMF Decode', 'Avro to JSON', 'Parse TLV', 'P-list Viewer'
  ]),
  chef('php-serialization', 'PHP 序列化', 'formats', ['PHP Serialize', 'PHP Deserialize']),
  chef('rison', 'Rison 编解码', 'formats', ['Rison Encode', 'Rison Decode']),
  chef('charts', '数据图表', 'formats', ['Series chart', 'Scatter chart', 'Heatmap chart', 'Hex Density chart']),
  chef('case-conversion', '文字大小写转换', 'text-language', [
    'To Upper case', 'To Lower case', 'Swap case', 'Alternating Caps', 'Get All Casings'
  ]),
  chef('identifier-case', '命名格式转换', 'formats', ['To Camel case', 'To Snake case', 'To Kebab case']),
  chef('line-processing', '文本行整理', 'text-language', [
    'Sort', 'Unique', 'Shuffle', 'Split', 'Wrap', 'Pad lines', 'Head', 'Tail',
    'Add line numbers', 'Remove line numbers', 'Filter'
  ]),
  chef('text-replacement', '文字查找与替换', 'text-language', ['Find / Replace', 'Count occurrences']),
  chef('text-cleaning', '空白与控制符清理', 'text-language', ['Remove whitespace', 'Remove ANSI Escape Codes']),
  chef('unicode-normalization', 'Unicode 文字规范化', 'text-language', [
    'Normalise Unicode', 'Unicode Text Format', 'Remove Diacritics', 'Escape Smart Characters'
  ]),
  chef('text-comparison', '文本比较', 'text-language', ['Diff', 'Fuzzy Match', 'Hamming Distance', 'Levenshtein Distance']),
  chef('text-statistics', '字频与密文统计', 'cipher-analysis', [
    'Frequency distribution', 'Index of Coincidence', 'Entropy', 'Chi Square'
  ]),
  // ROT and XOR are concrete cipher families. Do not group all classical or
  // modern encryption algorithms into one unspecified chooser.
  chef('rot', 'ROT 字符移位', 'classical', ['ROT13', 'ROT13 Brute Force', 'ROT47', 'ROT47 Brute Force', 'ROT8000']),
  chef('xor', 'XOR 异或密码', 'modern', ['XOR', 'XOR Brute Force']),
  chef('rc4', 'RC4 流密码', 'modern', ['RC4', 'RC4 Drop']),
  chef('salsa20', 'Salsa20 流密码', 'modern', ['Salsa20', 'XSalsa20']),
  chef('enigma-search', 'Bombe 转子搜索', 'classical', ['Bombe', 'Multiple Bombe']),
  chef('image-geometry', '图片尺寸与方向', 'image', [
    'Resize Image', 'Rotate Image', 'Crop Image', 'Flip Image', 'Contain Image', 'Cover Image'
  ]),
  chef('image-filters', '图片色彩与滤镜', 'image', [
    'Image Brightness / Contrast', 'Image Hue/Saturation/Lightness', 'Invert Image',
    'Image Opacity', 'Image Filter', 'Normalise Image', 'Sharpen Image', 'Blur Image',
    'Dither Image', 'Randomize Colour Palette'
  ]),
  chef('image-pixels', '图片通道与位平面', 'image', [
    'Split Colour Channels', 'View Bit Plane', 'Extract RGBA', 'Extract LSB'
  ]),
  chef('image-metadata', '图片元数据', 'image', ['Extract EXIF', 'Remove EXIF']),
  chef('image-creation', '图片生成与格式', 'image', [
    'Generate Image', 'Render Image', 'Convert Image Format', 'Add Text To Image'
  ]),
  chef('audio-metadata', '音频标签与元数据', 'audio', ['Extract Audio Metadata', 'Extract ID3']),
  chef('datetime', '日期与时间转换', 'coordinates-time', [
    'Parse DateTime', 'Translate DateTime Format', 'DateTime Delta', 'Get Time',
    'To UNIX Timestamp', 'From UNIX Timestamp', 'UNIX Timestamp to Windows Filetime',
    'Windows Filetime to UNIX Timestamp', 'Parse ObjectID timestamp'
  ]),
  chef('coordinate-format', '坐标格式与距离', 'coordinates-time', ['Convert co-ordinate format', 'Haversine distance']),
  chef('random-numbers', '随机数生成', 'maths', [
    'Pseudo-Random Integer Generator', 'Pseudo-Random Number Generator', 'Pseudo-Random Prime Generator'
  ]),
  chef('uuid', 'UUID 生成与解析', 'maths', ['Generate UUID', 'Analyse UUID']),
  chef('url-inspection', '网址解析与还原', 'network', ['Parse URI', 'Defang URL', 'Fang URL']),
  chef('ip-addresses', 'IP 地址处理', 'network', [
    'Change IP format', 'Parse IP range', 'Parse IPv6 address',
    'IPv6 Transition Addresses', 'Group IP addresses', 'Defang IP Addresses'
  ]),
  chef('network-packets', '网络数据包解析', 'network', [
    'Parse Ethernet frame', 'Parse IPv4 header', 'Parse TCP', 'Parse UDP',
    'Parse TLS record', 'Strip IPv4 header', 'Strip TCP header', 'Strip UDP header'
  ]),
  chef('http-response', 'HTTP 响应整理', 'network', ['Dechunk HTTP response', 'Strip HTTP headers']),
  chef('network-fingerprints', '网络握手指纹', 'network', [
    'JA3 Fingerprint', 'JA3S Fingerprint', 'JA4 Fingerprint', 'JA4Server Fingerprint',
    'HASSH Client Fingerprint', 'HASSH Server Fingerprint'
  ]),
  // Native topics reuse one original controller and its real mode controls.
  // Source models, input nodes, history, bytes and cancellation stay there.
  native('hanzi-properties', '汉字属性与读音', 'text-language', ['native:hanzi', 'native:hanzi-pinyin']),
  native('hanzi-lookup', '汉字编码与反查', 'text-language', [
    'native:hanzi-code', 'native:hanzi-sound', 'native:hanzi-stroke',
    'native:hanzi-component', 'native:hanzi-cangjie', 'native:hanzi-wubi'
  ]),
  native('hanzi-variants', '汉字简繁转换', 'text-language', ['native:hanzi-simplified', 'native:hanzi-traditional']),
  native('chinese-phrases', '成语与歇后语查询', 'text-language', ['native:hanzi-idiom', 'native:hanzi-xhy']),
  native('answer-extraction', '答案提取与行列整理', 'text-language', [
    'native:extract-position', 'native:extract-first', 'native:extract-last',
    'native:extract-indices', 'native:extract-transpose'
  ]),
  native('english-words', '英文查词与字母重排', 'text-language', [
    'native:words', 'native:words-wildcard', 'native:words-letters',
    'native:words-regex', 'native:words-fuzzy', 'native:words-contains', 'native:words-code'
  ]),
  native('word-grids', '网格搜词', 'text-language', ['native:word-grid', 'native:word-boggle']),
  native('invisible-characters', '隐藏字符检查与清理', 'characters', ['native:invisible', 'native:invisible-clean']),
  native('element-spelling', '元素符号拼词', 'matter', ['native:element-spelling', 'native:element-words']),
  native('video', '视频处理', 'video', [
    'native:video', 'native:video-animation', 'native:video-frames', 'native:video-audio', 'native:video-reverse', 'native:video-gif', 'native:video-native'
  ]),
  native('code-runner', '代码运行', 'programming', [
    'native:code', 'native:code-ook', 'native:code-befunge', 'native:code-deadfish',
    'native:code-whitespace', 'native:code-malbolge', 'native:code-python',
    'native:code-javascript', 'native:code-lua', 'native:code-sql'
  ]),
  native('paper-puzzles', '纸笔解题', 'logic', [
    'native:paper', 'native:paper-slitherlink', 'native:paper-nurikabe', 'native:paper-akari'
  ]),
  native('rule-constraints', '中文规则约束求解', 'logic', [
    'native:hunt-constraints-custom', 'native:hunt-constraints-sudoku',
    'native:hunt-constraints-magicSquare', 'native:hunt-constraints-mine',
    'native:hunt-constraints-nonogram', 'native:hunt-constraints-drop'
  ])
]);
