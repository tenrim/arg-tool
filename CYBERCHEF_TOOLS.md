# CyberChef 功能分布记录

固定版本 11.5.0，逐项对应全部 505 个上游操作。此表记录入口归属；实测范围见 VERIFICATION.md，不表示 505 项均已逐一验证。

| 分类 | 操作数 | 页面 |
| --- | ---: | --- |
| 古典密码 | 22 | #crypto/classical |
| 机械密码机 | 7 | #crypto/machines |
| 现代对称加密 | 43 | #crypto/symmetric |
| 公钥加密 | 10 | #crypto/publickey |
| 数字签名与认证 | 13 | #crypto/signatures |
| 令牌与动态口令 | 10 | #crypto/credentials |
| 密钥派生与密码校验 | 9 | #crypto/derivation |
| Base 系列编码 | 15 | #encoding/base |
| 进制与数字表示 | 19 | #encoding/radix |
| 字符集与 Unicode | 8 | #encoding/charset |
| 网页与邮件编码 | 9 | #encoding/webencoding |
| 摩斯、盲文与符号编码 | 6 | #encoding/symbolic |
| 二进制封装编码 | 13 | #encoding/binaryencoding |
| 语言与文字变体 | 5 | #language/language |
| 清理与排版 | 26 | #textlab/clean |
| 查找与提取 | 11 | #textlab/extract |
| 文本比较 | 4 | #textlab/compare |
| 格式互转 | 22 | #datalab/format |
| 代码整理 | 26 | #datalab/code |
| 数据图表 | 4 | #datalab/charts |
| 尺寸与方向 | 6 | #image/imageEdit |
| 色彩与滤镜 | 11 | #image/imageColour |
| 图像数据 | 7 | #image/imageInspect |
| 生成与转换 | 5 | #image/imageMake |
| 哈希与校验 | 41 | #file/hashes |
| 压缩与解压 | 21 | #file/compression |
| 文件与字节 | 17 | #file/inspect |
| 识别与统计 | 5 | #analysis/statistics |
| 音频元数据 | 2 | #audio/audio |
| 媒体解码预览 | 1 | #video/media |
| 时间与坐标格式 | 11 | #coordinates/time |
| 网络数据 | 29 | #networklab/network |
| 证书与密钥格式 | 14 | #crypto/certificates |
| 数值与集合 | 26 | #mathlab/maths |
| 单位与生成器 | 12 | #mathlab/units |
| 处理链控制 | 15 | #cyberchef |

## 各操作归属

| 中文功能 | 上游操作名 | 分类 | 接入方式 / 边界 |
| --- | --- | --- | --- |
| A1Z26 字母数字密码解码 | A1Z26 Cipher Decode | 古典密码 | 独立任务表单 |
| A1Z26 字母数字密码编码 | A1Z26 Cipher Encode | 古典密码 | 独立任务表单 |
| 逐字节加法 | ADD | 数值与集合 | 独立任务表单 |
| AES解密 | AES Decrypt | 现代对称加密 | 独立任务表单 |
| AES加密 | AES Encrypt | 现代对称加密 | 独立任务表单 |
| AES密钥解封装 | AES Key Unwrap | 现代对称加密 | 独立任务表单 |
| AES密钥封装 | AES Key Wrap | 现代对称加密 | 独立任务表单 |
| AMF解码 | AMF Decode | 格式互转 | 独立任务表单 |
| AMF编码 | AMF Encode | 格式互转 | 独立任务表单 |
| 按位与 | AND | 数值与集合 | 独立任务表单 |
| 添加行号 | Add line numbers | 清理与排版 | 独立任务表单 |
| 添加图片文字 | Add Text To Image | 生成与转换 | 独立任务表单 |
| Adler-32校验和 | Adler-32 Checksum | 哈希与校验 | 独立任务表单 |
| 仿射密码解码 | Affine Cipher Decode | 古典密码 | 独立任务表单 |
| 仿射密码编码 | Affine Cipher Encode | 古典密码 | 独立任务表单 |
| 交替大小写 | Alternating Caps | 清理与排版 | 独立任务表单 |
| 分析哈希类型 | Analyse hash | 哈希与校验 | 独立任务表单 |
| 分析 UUID | Analyse UUID | 单位与生成器 | 独立任务表单 |
| Argon2 哈希 | Argon2 | 密钥派生与密码校验 | 独立任务表单 |
| 校验 Argon2 哈希 | Argon2 compare | 密钥派生与密码校验 | 独立任务表单 |
| Ascon解密 | Ascon Decrypt | 现代对称加密 | 独立任务表单 |
| Ascon加密 | Ascon Encrypt | 现代对称加密 | 独立任务表单 |
| Ascon 哈希 | Ascon Hash | 哈希与校验 | 独立任务表单 |
| Ascon 消息认证码 | Ascon MAC | 数字签名与认证 | 独立任务表单 |
| 埃特巴什密码 | Atbash Cipher | 古典密码 | 独立任务表单 |
| 参数验证测试 | Automated Validation Test Op | 处理链控制 | 上游内部参数测试，不作为工具入口。 |
| Avro 转 JSON | Avro to JSON | 格式互转 | 独立任务表单 |
| BLAKE2b 哈希 | BLAKE2b | 哈希与校验 | 独立任务表单 |
| BLAKE2s 哈希 | BLAKE2s | 哈希与校验 | 独立任务表单 |
| BLAKE3 哈希 | BLAKE3 | 哈希与校验 | 独立任务表单 |
| BSON 反序列化 | BSON deserialise | 格式互转 | 独立任务表单 |
| BSON 序列化 | BSON serialise | 格式互转 | 独立任务表单 |
| 培根密码解码 | Bacon Cipher Decode | 古典密码 | 独立任务表单 |
| 培根密码编码 | Bacon Cipher Encode | 古典密码 | 独立任务表单 |
| Bcrypt 哈希 | Bcrypt | 密钥派生与密码校验 | 独立任务表单 |
| 校验 Bcrypt 哈希 | Bcrypt compare | 密钥派生与密码校验 | 独立任务表单 |
| 解析 Bcrypt 哈希 | Bcrypt parse | 密钥派生与密码校验 | 独立任务表单 |
| 双分密码解码 | Bifid Cipher Decode | 古典密码 | 独立任务表单 |
| 双分密码编码 | Bifid Cipher Encode | 古典密码 | 独立任务表单 |
| 位左移 | Bit shift left | 数值与集合 | 独立任务表单 |
| 位右移 | Bit shift right | 数值与集合 | 独立任务表单 |
| Blowfish解密 | Blowfish Decrypt | 现代对称加密 | 独立任务表单 |
| Blowfish加密 | Blowfish Encrypt | 现代对称加密 | 独立任务表单 |
| 图片模糊 | Blur Image | 色彩与滤镜 | 独立任务表单 |
| 恩尼格玛破译机 | Bombe | 机械密码机 | 独立任务表单 |
| Bzip2压缩 | Bzip2 Compress | 压缩与解压 | 独立任务表单 |
| Bzip2解压 | Bzip2 Decompress | 压缩与解压 | 独立任务表单 |
| CBOR解码 | CBOR Decode | 格式互转 | 独立任务表单 |
| CBOR编码 | CBOR Encode | 格式互转 | 独立任务表单 |
| 分组密码消息认证码 | CMAC | 数字签名与认证 | 独立任务表单 |
| CRC校验和 | CRC Checksum | 哈希与校验 | 独立任务表单 |
| 格式化 CSS | CSS Beautify | 代码整理 | 独立任务表单 |
| 压缩 CSS | CSS Minify | 代码整理 | 独立任务表单 |
| CSS 选择器 | CSS selector | 代码整理 | 独立任务表单 |
| CSV 转 JSON | CSV to JSON | 格式互转 | 独立任务表单 |
| 上下文触发分段哈希 | CTPH | 哈希与校验 | 独立任务表单 |
| 凯撒方阵密码 | Caesar Box Cipher | 古典密码 | 独立任务表单 |
| 脱字符与 M 编码解码 | Caret/M-decode | 二进制封装编码 | 独立任务表单 |
| 笛卡尔积 | Cartesian Product | 数值与集合 | 独立任务表单 |
| 鲸鱼密码解码 | Cetacean Cipher Decode | 摩斯、盲文与符号编码 | 独立任务表单 |
| 鲸鱼密码编码 | Cetacean Cipher Encode | 摩斯、盲文与符号编码 | 独立任务表单 |
| ChaCha 流加密 | ChaCha | 现代对称加密 | 独立任务表单 |
| 转换 IP 地址格式 | Change IP format | 网络数据 | 独立任务表单 |
| 卡方检验 | Chi Square | 识别与统计 | 独立任务表单 |
| CipherSaber2解密 | CipherSaber2 Decrypt | 现代对称加密 | 独立任务表单 |
| CipherSaber2加密 | CipherSaber2 Encrypt | 现代对称加密 | 独立任务表单 |
| Citrix CTX1解码 | Citrix CTX1 Decode | 二进制封装编码 | 独立任务表单 |
| Citrix CTX1编码 | Citrix CTX1 Encode | 二进制封装编码 | 独立任务表单 |
| 巨人密码破译机 | Colossus | 机械密码机 | 独立任务表单 |
| 注释 | Comment | 处理链控制 | 完整处理链 |
| 比较 CTPH 哈希 | Compare CTPH hashes | 哈希与校验 | 独立任务表单 |
| 比较 SSDEEP 哈希 | Compare SSDEEP hashes | 哈希与校验 | 独立任务表单 |
| 条件跳转 | Conditional Jump | 处理链控制 | 完整处理链 |
| 缩放图片以完整容纳 | Contain Image | 尺寸与方向 | 独立任务表单 |
| 面积单位换算 | Convert area | 单位与生成器 | 独立任务表单 |
| 坐标格式转换 | Convert co-ordinate format | 时间与坐标格式 | 独立任务表单 |
| 数据单位换算 | Convert data units | 单位与生成器 | 独立任务表单 |
| 距离单位换算 | Convert distance | 单位与生成器 | 独立任务表单 |
| 转换图片格式 | Convert Image Format | 生成与转换 | 独立任务表单 |
| 转换 Leet 替代字母 | Convert Leet Speak | 语言与文字变体 | 独立任务表单 |
| 质量单位换算 | Convert mass | 单位与生成器 | 独立任务表单 |
| 速度单位换算 | Convert speed | 单位与生成器 | 独立任务表单 |
| 转换为北约拼读字母 | Convert to NATO alphabet | 语言与文字变体 | 独立任务表单 |
| 统计出现次数 | Count occurrences | 清理与排版 | 独立任务表单 |
| 缩放图片以填满画布 | Cover Image | 尺寸与方向 | 独立任务表单 |
| 裁剪图片 | Crop Image | 尺寸与方向 | 独立任务表单 |
| DES解密 | DES Decrypt | 现代对称加密 | 独立任务表单 |
| DES加密 | DES Encrypt | 现代对称加密 | 独立任务表单 |
| 通过 HTTPS 查询 DNS | DNS over HTTPS | 网络数据 | 独立任务表单 |
| 日期时间加减 | DateTime Delta | 时间与坐标格式 | 独立任务表单 |
| 解码 HTTP 分块响应 | Dechunk HTTP response | 网络数据 | 独立任务表单 |
| 解码 NetBIOS 名称 | Decode NetBIOS Name | 二进制封装编码 | 独立任务表单 |
| 文本解码 | Decode text | 字符集与 Unicode | 独立任务表单 |
| 解除 IP 地址可点击性 | Defang IP Addresses | 网络数据 | 独立任务表单 |
| 解除网址可点击性 | Defang URL | 网络数据 | 独立任务表单 |
| 派生 EVP 密钥 | Derive EVP key | 密钥派生与密码校验 | 独立任务表单 |
| 派生 HKDF 密钥 | Derive HKDF key | 密钥派生与密码校验 | 独立任务表单 |
| 派生 PBKDF2 密钥 | Derive PBKDF2 key | 密钥派生与密码校验 | 独立任务表单 |
| 识别文件类型 | Detect File Type | 文件与字节 | 独立任务表单 |
| 比较差异 | Diff | 文本比较 | 独立任务表单 |
| ARM 反汇编 | Disassemble ARM | 文件与字节 | 独立任务表单 |
| x86 反汇编 | Disassemble x86 | 文件与字节 | 独立任务表单 |
| 图片抖动处理 | Dither Image | 色彩与滤镜 | 独立任务表单 |
| 除法 | Divide | 数值与集合 | 独立任务表单 |
| 丢弃字节 | Drop bytes | 文件与字节 | 独立任务表单 |
| 间隔丢弃字节 | Drop nth bytes | 文件与字节 | 独立任务表单 |
| ECDSA签名 | ECDSA Sign | 数字签名与认证 | 独立任务表单 |
| 转换 ECDSA 签名格式 | ECDSA Signature Conversion | 数字签名与认证 | 独立任务表单 |
| ECDSA验签 | ECDSA Verify | 数字签名与认证 | 独立任务表单 |
| ELF 文件信息 | ELF Info | 文件与字节 | 独立任务表单 |
| 编码 NetBIOS 名称 | Encode NetBIOS Name | 二进制封装编码 | 独立任务表单 |
| 文本编码 | Encode text | 字符集与 Unicode | 独立任务表单 |
| 恩尼格玛密码机 | Enigma | 机械密码机 | 独立任务表单 |
| 信息熵 | Entropy | 识别与统计 | 独立任务表单 |
| 转义智能标点 | Escape Smart Characters | 字符集与 Unicode | 独立任务表单 |
| 字符串转义 | Escape string | 清理与排版 | 独立任务表单 |
| 转义 Unicode 字符 | Escape Unicode Characters | 字符集与 Unicode | 独立任务表单 |
| 展开字符范围 | Expand alphabet range | 清理与排版 | 独立任务表单 |
| 扩展欧几里得算法 | Extended GCD | 数值与集合 | 独立任务表单 |
| 提取音频元数据 | Extract Audio Metadata | 音频元数据 | 独立任务表单 |
| 提取日期 | Extract dates | 查找与提取 | 独立任务表单 |
| 提取域名 | Extract domains | 查找与提取 | 独立任务表单 |
| 提取 EXIF 元数据 | Extract EXIF | 图像数据 | 独立任务表单 |
| 提取邮箱地址 | Extract email addresses | 查找与提取 | 独立任务表单 |
| 提取文件路径 | Extract file paths | 查找与提取 | 独立任务表单 |
| 提取文件 | Extract Files | 文件与字节 | 独立任务表单 |
| 提取哈希 | Extract hashes | 查找与提取 | 独立任务表单 |
| 提取 ID3 标签 | Extract ID3 | 音频元数据 | 独立任务表单 |
| 提取 IP 地址 | Extract IP addresses | 查找与提取 | 独立任务表单 |
| 提取最低有效位 | Extract LSB | 图像数据 | 独立任务表单 |
| 提取 MAC 地址 | Extract MAC addresses | 查找与提取 | 独立任务表单 |
| 提取 RGBA 像素 | Extract RGBA | 图像数据 | 独立任务表单 |
| 提取网址 | Extract URLs | 查找与提取 | 独立任务表单 |
| 恢复网址可点击性 | Fang URL | 网络数据 | 独立任务表单 |
| Fernet解密 | Fernet Decrypt | 令牌与动态口令 | 独立任务表单 |
| Fernet加密 | Fernet Encrypt | 令牌与动态口令 | 独立任务表单 |
| 文件树 | File Tree | 文件与字节 | 独立任务表单 |
| 筛选 | Filter | 清理与排版 | 独立任务表单 |
| 查找与替换 | Find / Replace | 清理与排版 | 独立任务表单 |
| 解码 Flask 会话 | Flask Session Decode | 令牌与动态口令 | 独立任务表单 |
| 签署 Flask 会话 | Flask Session Sign | 令牌与动态口令 | 独立任务表单 |
| 验证 Flask 会话 | Flask Session Verify | 令牌与动态口令 | 独立任务表单 |
| Fletcher-16校验和 | Fletcher-16 Checksum | 哈希与校验 | 独立任务表单 |
| Fletcher-32校验和 | Fletcher-32 Checksum | 哈希与校验 | 独立任务表单 |
| Fletcher-64校验和 | Fletcher-64 Checksum | 哈希与校验 | 独立任务表单 |
| Fletcher-8校验和 | Fletcher-8 Checksum | 哈希与校验 | 独立任务表单 |
| 翻转图片 | Flip Image | 尺寸与方向 | 独立任务表单 |
| 分支处理 | Fork | 处理链控制 | 完整处理链 |
| 格式化 MAC 地址 | Format MAC addresses | 网络数据 | 独立任务表单 |
| 字符频率分布 | Frequency distribution | 识别与统计 | 独立任务表单 |
| BCD解码 | From BCD | 进制与数字表示 | 独立任务表单 |
| 任意进制解码 | From Base | 进制与数字表示 | 独立任务表单 |
| Base32解码 | From Base32 | Base 系列编码 | 独立任务表单 |
| Base45解码 | From Base45 | Base 系列编码 | 独立任务表单 |
| Base58解码 | From Base58 | Base 系列编码 | 独立任务表单 |
| Base62解码 | From Base62 | Base 系列编码 | 独立任务表单 |
| Base64解码 | From Base64 | Base 系列编码 | 独立任务表单 |
| Base85解码 | From Base85 | Base 系列编码 | 独立任务表单 |
| Base92解码 | From Base92 | Base 系列编码 | 独立任务表单 |
| Bech32解码 | From Bech32 | 二进制封装编码 | 独立任务表单 |
| 二进制解码 | From Binary | 进制与数字表示 | 独立任务表单 |
| 盲文解码 | From Braille | 摩斯、盲文与符号编码 | 独立任务表单 |
| COBS解码 | From COBS | 二进制封装编码 | 独立任务表单 |
| 解析不区分大小写的正则表达式 | From Case Insensitive Regex | 清理与排版 | 独立任务表单 |
| 字符码解码 | From Charcode | 字符集与 Unicode | 独立任务表单 |
| 十进制解码 | From Decimal | 进制与数字表示 | 独立任务表单 |
| 浮点数解码 | From Float | 进制与数字表示 | 独立任务表单 |
| HTML 实体解码 | From HTML Entity | 网页与邮件编码 | 独立任务表单 |
| 十六进制解码 | From Hex | 进制与数字表示 | 独立任务表单 |
| 十六进制内容解码 | From Hex Content | 进制与数字表示 | 独立任务表单 |
| 十六进制转储解码 | From Hexdump | 进制与数字表示 | 独立任务表单 |
| MessagePack解码 | From MessagePack | 格式互转 | 独立任务表单 |
| Modhex解码 | From Modhex | 二进制封装编码 | 独立任务表单 |
| 摩斯密码解码 | From Morse Code | 摩斯、盲文与符号编码 | 独立任务表单 |
| 八进制解码 | From Octal | 进制与数字表示 | 独立任务表单 |
| Punycode解码 | From Punycode | 网页与邮件编码 | 独立任务表单 |
| 可打印编码解码 | From Quoted Printable | 网页与邮件编码 | 独立任务表单 |
| UNIX 时间戳解码 | From UNIX Timestamp | 时间与坐标格式 | 独立任务表单 |
| 模糊匹配 | Fuzzy Match | 文本比较 | 独立任务表单 |
| GOST解密 | GOST Decrypt | 现代对称加密 | 独立任务表单 |
| GOST加密 | GOST Encrypt | 现代对称加密 | 独立任务表单 |
| GOST 哈希 | GOST Hash | 哈希与校验 | 独立任务表单 |
| GOST密钥解封装 | GOST Key Unwrap | 现代对称加密 | 独立任务表单 |
| GOST密钥封装 | GOST Key Wrap | 现代对称加密 | 独立任务表单 |
| GOST签名 | GOST Sign | 数字签名与认证 | 独立任务表单 |
| GOST验签 | GOST Verify | 数字签名与认证 | 独立任务表单 |
| 生成全部校验和 | Generate all checksums | 哈希与校验 | 独立任务表单 |
| 生成全部哈希 | Generate all hashes | 哈希与校验 | 独立任务表单 |
| 生成德布鲁因序列 | Generate De Bruijn Sequence | 单位与生成器 | 独立任务表单 |
| 生成 ECDSA 密钥对 | Generate ECDSA Key Pair | 数字签名与认证 | 独立任务表单 |
| 生成 HOTP 动态密码 | Generate HOTP | 令牌与动态口令 | 独立任务表单 |
| 生成图片 | Generate Image | 生成与转换 | 独立任务表单 |
| 生成占位文本 | Generate Lorem Ipsum | 单位与生成器 | 独立任务表单 |
| 生成 PGP 密钥对 | Generate PGP Key Pair | 公钥加密 | 独立任务表单 |
| 生成伪随机素数 | Pseudo-Random Prime Generator | 单位与生成器 | 独立任务表单 |
| 生成二维码 | Generate QR Code | 生成与转换 | 独立任务表单 |
| 生成 RSA 密钥对 | Generate RSA Key Pair | 公钥加密 | 独立任务表单 |
| 生成 TOTP 动态密码 | Generate TOTP | 令牌与动态口令 | 独立任务表单 |
| 生成 UUID | Generate UUID | 单位与生成器 | 独立任务表单 |
| 通用代码格式化 | Generic Code Beautify | 代码整理 | 独立任务表单 |
| 生成全部大小写组合 | Get All Casings | 清理与排版 | 独立任务表单 |
| 获取时间 | Get Time | 时间与坐标格式 | 独立任务表单 |
| 归并 IP 地址 | Group IP addresses | 网络数据 | 独立任务表单 |
| Gzip 解压 | Gunzip | 压缩与解压 | 独立任务表单 |
| Gzip 压缩 | Gzip | 压缩与解压 | 独立任务表单 |
| HAS-160 哈希 | HAS-160 | 哈希与校验 | 独立任务表单 |
| HASSH 客户端指纹 | HASSH Client Fingerprint | 网络数据 | 独立任务表单 |
| HASSH 服务端指纹 | HASSH Server Fingerprint | 网络数据 | 独立任务表单 |
| 哈希消息认证码 | HMAC | 数字签名与认证 | 独立任务表单 |
| HTML 转文本 | HTML To Text | 代码整理 | 独立任务表单 |
| HTTP 请求 | HTTP request | 网络数据 | 独立任务表单 |
| 汉明距离 | Hamming Distance | 文本比较 | 独立任务表单 |
| 球面距离 | Haversine distance | 时间与坐标格式 | 独立任务表单 |
| 保留开头 | Head | 清理与排版 | 独立任务表单 |
| 热力图 | Heatmap chart | 数据图表 | 独立任务表单 |
| 十六进制密度图 | Hex Density chart | 数据图表 | 独立任务表单 |
| 十六进制转对象标识符 | Hex to Object Identifier | 证书与密钥格式 | 独立任务表单 |
| 十六进制转 PEM | Hex to PEM | 证书与密钥格式 | 独立任务表单 |
| 解析 IPv6 过渡地址 | IPv6 Transition Addresses | 网络数据 | 独立任务表单 |
| 图片亮度与对比度 | Image Brightness / Contrast | 色彩与滤镜 | 独立任务表单 |
| 图片滤镜 | Image Filter | 色彩与滤镜 | 独立任务表单 |
| 图片色相、饱和度与明度 | Image Hue/Saturation/Lightness | 色彩与滤镜 | 独立任务表单 |
| 图片不透明度 | Image Opacity | 色彩与滤镜 | 独立任务表单 |
| 重合指数 | Index of Coincidence | 识别与统计 | 独立任务表单 |
| 图片反色 | Invert Image | 色彩与滤镜 | 独立任务表单 |
| JA3 指纹 | JA3 Fingerprint | 网络数据 | 独立任务表单 |
| JA3S 指纹 | JA3S Fingerprint | 网络数据 | 独立任务表单 |
| JA4 指纹 | JA4 Fingerprint | 网络数据 | 独立任务表单 |
| JA4 服务端指纹 | JA4Server Fingerprint | 网络数据 | 独立任务表单 |
| JPath 表达式 | JPath expression | 代码整理 | 独立任务表单 |
| 格式化 JSON | JSON Beautify | 代码整理 | 独立任务表单 |
| 压缩 JSON | JSON Minify | 代码整理 | 独立任务表单 |
| JSON 转 CSV | JSON to CSV | 格式互转 | 独立任务表单 |
| JSON 转 YAML | JSON to YAML | 格式互转 | 独立任务表单 |
| JWK 转 PEM | JWK to PEM | 证书与密钥格式 | 独立任务表单 |
| 解码 JWT | JWT Decode | 令牌与动态口令 | 独立任务表单 |
| 签署 JWT | JWT Sign | 令牌与动态口令 | 独立任务表单 |
| 验证 JWT | JWT Verify | 令牌与动态口令 | 独立任务表单 |
| 格式化 JavaScript | JavaScript Beautify | 代码整理 | 独立任务表单 |
| 压缩 JavaScript | JavaScript Minify | 代码整理 | 独立任务表单 |
| 解析 JavaScript | JavaScript Parser | 代码整理 | 独立任务表单 |
| Jq 查询 | Jq | 代码整理 | 独立任务表单 |
| JSONata 查询 | Jsonata Query | 代码整理 | 独立任务表单 |
| 跳转 | Jump | 处理链控制 | 完整处理链 |
| Keccak 哈希 | Keccak | 哈希与校验 | 独立任务表单 |
| LM 哈希 | LM Hash | 哈希与校验 | 独立任务表单 |
| LS47解密 | LS47 Decrypt | 古典密码 | 独立任务表单 |
| LS47加密 | LS47 Encrypt | 古典密码 | 独立任务表单 |
| LZ4压缩 | LZ4 Compress | 压缩与解压 | 独立任务表单 |
| LZ4解压 | LZ4 Decompress | 压缩与解压 | 独立任务表单 |
| LZMA压缩 | LZMA Compress | 压缩与解压 | 独立任务表单 |
| LZMA解压 | LZMA Decompress | 压缩与解压 | 独立任务表单 |
| LZNT1解压 | LZNT1 Decompress | 压缩与解压 | 独立任务表单 |
| LZString压缩 | LZString Compress | 压缩与解压 | 独立任务表单 |
| LZString解压 | LZString Decompress | 压缩与解压 | 独立任务表单 |
| 标签 | Label | 处理链控制 | 完整处理链 |
| 编辑距离 | Levenshtein Distance | 文本比较 | 独立任务表单 |
| 洛伦兹密码机 | Lorenz | 机械密码机 | 独立任务表单 |
| 卢恩校验和 | Luhn Checksum | 哈希与校验 | 独立任务表单 |
| MD2 哈希 | MD2 | 哈希与校验 | 独立任务表单 |
| MD4 哈希 | MD4 | 哈希与校验 | 独立任务表单 |
| MD5 哈希 | MD5 | 哈希与校验 | 独立任务表单 |
| MD6 哈希 | MD6 | 哈希与校验 | 独立任务表单 |
| MIME 解码 | MIME Decoding | 网页与邮件编码 | 独立任务表单 |
| 取模 | MOD | 数值与集合 | 独立任务表单 |
| 自动识别与解码 | Magic | 识别与统计 | 独立任务表单 |
| 平均值 | Mean | 数值与集合 | 独立任务表单 |
| 中位数 | Median | 数值与集合 | 独立任务表单 |
| 合并分支 | Merge | 处理链控制 | 完整处理链 |
| 微软脚本解码 | Microsoft Script Decoder | 代码整理 | 独立任务表单 |
| 模幂运算 | Modular Exponentiation | 数值与集合 | 独立任务表单 |
| 模逆元 | Modular Inverse | 数值与集合 | 独立任务表单 |
| 多机恩尼格玛破译 | Multiple Bombe | 机械密码机 | 独立任务表单 |
| 乘法 | Multiply | 数值与集合 | 独立任务表单 |
| MurmurHash3 哈希 | MurmurHash3 | 哈希与校验 | 独立任务表单 |
| 按位取反 | NOT | 数值与集合 | 独立任务表单 |
| NT 哈希 | NT Hash | 哈希与校验 | 独立任务表单 |
| 图片归一化 | Normalise Image | 色彩与滤镜 | 独立任务表单 |
| Unicode 规范化 | Normalise Unicode | 语言与文字变体 | 独立任务表单 |
| Numberwang 随机数 | Numberwang | 处理链控制 | 上游娱乐操作，保留在完整处理链中。 |
| 按位或 | OR | 数值与集合 | 独立任务表单 |
| 对象标识符转十六进制 | Object Identifier to Hex | 证书与密钥格式 | 独立任务表单 |
| 检查偏移量 | Offset checker | 文件与字节 | 独立任务表单 |
| 光学文字识别 | Optical Character Recognition | 处理链控制 | 按此前要求，不提供图片 OCR 入口。 |
| PEM 转十六进制 | PEM to Hex | 证书与密钥格式 | 独立任务表单 |
| PEM 转 JWK | PEM to JWK | 证书与密钥格式 | 独立任务表单 |
| PGP解密 | PGP Decrypt | 公钥加密 | 独立任务表单 |
| PGP 解密并验签 | PGP Decrypt and Verify | 公钥加密 | 独立任务表单 |
| PGP加密 | PGP Encrypt | 公钥加密 | 独立任务表单 |
| PGP 加密并签名 | PGP Encrypt and Sign | 公钥加密 | 独立任务表单 |
| PGP签名 | PGP Sign | 数字签名与认证 | 独立任务表单 |
| PGP验签 | PGP Verify | 数字签名与认证 | 独立任务表单 |
| PHP 反序列化 | PHP Deserialize | 格式互转 | 独立任务表单 |
| PHP 序列化 | PHP Serialize | 格式互转 | 独立任务表单 |
| 查看属性列表 | P-list Viewer | 格式互转 | 独立任务表单 |
| PRESENT解密 | PRESENT Decrypt | 现代对称加密 | 独立任务表单 |
| PRESENT加密 | PRESENT Encrypt | 现代对称加密 | 独立任务表单 |
| 填充文本行 | Pad lines | 清理与排版 | 独立任务表单 |
| 奇偶校验位 | Parity Bit | 哈希与校验 | 独立任务表单 |
| 解析 ASN.1 十六进制 | Parse ASN.1 hex string | 证书与密钥格式 | 独立任务表单 |
| 解析证书签名请求 | Parse CSR | 证书与密钥格式 | 独立任务表单 |
| 解析颜色代码 | Parse colour code | 色彩与滤镜 | 独立任务表单 |
| 解析日期时间 | Parse DateTime | 时间与坐标格式 | 独立任务表单 |
| 解析以太网帧 | Parse Ethernet frame | 网络数据 | 独立任务表单 |
| 解析 IP 地址范围 | Parse IP range | 网络数据 | 独立任务表单 |
| 解析 IPv4 头部 | Parse IPv4 header | 网络数据 | 独立任务表单 |
| 解析 IPv6 地址 | Parse IPv6 address | 网络数据 | 独立任务表单 |
| 解析 ObjectID 时间戳 | Parse ObjectID timestamp | 时间与坐标格式 | 独立任务表单 |
| 解析 PGP 密钥 | Parse PGP Key | 证书与密钥格式 | 独立任务表单 |
| 识别二维码 | Parse QR Code | 图像数据 | 独立任务表单 |
| 解析 SSH 主机密钥 | Parse SSH Host Key | 证书与密钥格式 | 独立任务表单 |
| 解析 TCP | Parse TCP | 网络数据 | 独立任务表单 |
| 解析 TLS 记录 | Parse TLS record | 网络数据 | 独立任务表单 |
| 解析 TLV | Parse TLV | 格式互转 | 独立任务表单 |
| 解析 UDP | Parse UDP | 网络数据 | 独立任务表单 |
| 解析 UNIX 文件权限 | Parse UNIX file permissions | 文件与字节 | 独立任务表单 |
| 解析 URI | Parse URI | 网络数据 | 独立任务表单 |
| 解析用户代理 | Parse User Agent | 网络数据 | 独立任务表单 |
| 解析 X.509 证书吊销列表 | Parse X.509 CRL | 证书与密钥格式 | 独立任务表单 |
| 解析 X.509 证书 | Parse X.509 certificate | 证书与密钥格式 | 独立任务表单 |
| 播放媒体 | Play Media | 媒体解码预览 | 独立任务表单 |
| 幂集 | Power Set | 数值与集合 | 独立任务表单 |
| Protobuf解码 | Protobuf Decode | 格式互转 | 独立任务表单 |
| Protobuf编码 | Protobuf Encode | 格式互转 | 独立任务表单 |
| 生成伪随机整数 | Pseudo-Random Integer Generator | 单位与生成器 | 独立任务表单 |
| 生成伪随机数 | Pseudo-Random Number Generator | 单位与生成器 | 独立任务表单 |
| 从证书提取公钥 | Public Key from Certificate | 证书与密钥格式 | 独立任务表单 |
| 从私钥提取公钥 | Public Key from Private Key | 证书与密钥格式 | 独立任务表单 |
| RAKE 关键词提取 | RAKE | 查找与提取 | 独立任务表单 |
| RC2解密 | RC2 Decrypt | 现代对称加密 | 独立任务表单 |
| RC2加密 | RC2 Encrypt | 现代对称加密 | 独立任务表单 |
| RC4 流加密 | RC4 | 现代对称加密 | 独立任务表单 |
| RC4 丢弃初始密钥流 | RC4 Drop | 现代对称加密 | 独立任务表单 |
| RC6解密 | RC6 Decrypt | 现代对称加密 | 独立任务表单 |
| RC6加密 | RC6 Encrypt | 现代对称加密 | 独立任务表单 |
| RIPEMD 哈希 | RIPEMD | 哈希与校验 | 独立任务表单 |
| 右循环移位 13 位 | ROR13 | 现代对称加密 | 独立任务表单 |
| 凯撒移位（ROT13） | ROT13 | 古典密码 | 独立任务表单 |
| 穷举凯撒移位 | ROT13 Brute Force | 古典密码 | 独立任务表单 |
| 可打印字符移位（ROT47） | ROT47 | 古典密码 | 独立任务表单 |
| 穷举 ROT47 | ROT47 Brute Force | 古典密码 | 独立任务表单 |
| Unicode 移位（ROT8000） | ROT8000 | 古典密码 | 独立任务表单 |
| RSA解密 | RSA Decrypt | 公钥加密 | 独立任务表单 |
| RSA加密 | RSA Encrypt | 公钥加密 | 独立任务表单 |
| RSA签名 | RSA Sign | 数字签名与认证 | 独立任务表单 |
| RSA验签 | RSA Verify | 数字签名与认证 | 独立任务表单 |
| Rabbit 流加密 | Rabbit | 现代对称加密 | 独立任务表单 |
| 栅栏密码解码 | Rail Fence Cipher Decode | 古典密码 | 独立任务表单 |
| 栅栏密码编码 | Rail Fence Cipher Encode | 古典密码 | 独立任务表单 |
| 随机重映射调色板 | Randomize Colour Palette | 色彩与滤镜 | 独立任务表单 |
| 原始 Deflate 压缩 | Raw Deflate | 压缩与解压 | 独立任务表单 |
| 原始 Deflate 解压 | Raw Inflate | 压缩与解压 | 独立任务表单 |
| 寄存器 | Register | 处理链控制 | 完整处理链 |
| 正则表达式 | Regular expression | 查找与提取 | 独立任务表单 |
| 移除 ANSI 转义序列 | Remove ANSI Escape Codes | 清理与排版 | 独立任务表单 |
| 移除变音符号 | Remove Diacritics | 语言与文字变体 | 独立任务表单 |
| 移除 EXIF 元数据 | Remove EXIF | 图像数据 | 独立任务表单 |
| 移除行号 | Remove line numbers | 清理与排版 | 独立任务表单 |
| 移除空字节 | Remove null bytes | 文件与字节 | 独立任务表单 |
| 移除空白字符 | Remove whitespace | 清理与排版 | 独立任务表单 |
| 显示图片 | Render Image | 生成与转换 | 独立任务表单 |
| 渲染 Markdown | Render Markdown | 代码整理 | 独立任务表单 |
| 显示 PDF | Render PDF | 文件与字节 | 独立任务表单 |
| 调整图片尺寸 | Resize Image | 尺寸与方向 | 独立任务表单 |
| 返回 | Return | 处理链控制 | 完整处理链 |
| 反转 | Reverse | 清理与排版 | 独立任务表单 |
| Rison解码 | Rison Decode | 格式互转 | 独立任务表单 |
| Rison编码 | Rison Encode | 格式互转 | 独立任务表单 |
| 旋转图片 | Rotate Image | 尺寸与方向 | 独立任务表单 |
| 循环左移 | Rotate left | 数值与集合 | 独立任务表单 |
| 循环右移 | Rotate right | 数值与集合 | 独立任务表单 |
| SHA0 哈希 | SHA0 | 哈希与校验 | 独立任务表单 |
| SHA1 哈希 | SHA1 | 哈希与校验 | 独立任务表单 |
| SHA2 哈希 | SHA2 | 哈希与校验 | 独立任务表单 |
| SHA3 哈希 | SHA3 | 哈希与校验 | 独立任务表单 |
| SIGABA 密码机 | SIGABA | 机械密码机 | 独立任务表单 |
| SM2解密 | SM2 Decrypt | 公钥加密 | 独立任务表单 |
| SM2加密 | SM2 Encrypt | 公钥加密 | 独立任务表单 |
| SM3 哈希 | SM3 | 哈希与校验 | 独立任务表单 |
| SM4解密 | SM4 Decrypt | 现代对称加密 | 独立任务表单 |
| SM4加密 | SM4 Encrypt | 现代对称加密 | 独立任务表单 |
| 格式化 SQL | SQL Beautify | 代码整理 | 独立任务表单 |
| 压缩 SQL | SQL Minify | 代码整理 | 独立任务表单 |
| SSDEEP 模糊哈希 | SSDEEP | 哈希与校验 | 独立任务表单 |
| 逐字节减法 | SUB | 数值与集合 | 独立任务表单 |
| Salsa20 流加密 | Salsa20 | 现代对称加密 | 独立任务表单 |
| 扫描内嵌文件 | Scan for Embedded Files | 文件与字节 | 独立任务表单 |
| 散点图 | Scatter chart | 数据图表 | 独立任务表单 |
| Scrypt 哈希 | Scrypt | 密钥派生与密码校验 | 独立任务表单 |
| 序列图 | Series chart | 数据图表 | 独立任务表单 |
| 集合差集 | Set Difference | 数值与集合 | 独立任务表单 |
| 集合交集 | Set Intersection | 数值与集合 | 独立任务表单 |
| 集合并集 | Set Union | 数值与集合 | 独立任务表单 |
| Shake 哈希 | Shake | 哈希与校验 | 独立任务表单 |
| 图片锐化 | Sharpen Image | 色彩与滤镜 | 独立任务表单 |
| 显示 Base64 偏移量 | Show Base64 offsets | Base 系列编码 | 独立任务表单 |
| 在地图上显示 | Show on map | 处理链控制 | 依赖外部地图界面；坐标工具已有本地换算。 |
| 随机打乱 | Shuffle | 清理与排版 | 独立任务表单 |
| 等待 | Sleep | 处理链控制 | 完整处理链 |
| Snefru 哈希 | Snefru | 哈希与校验 | 独立任务表单 |
| 排序 | Sort | 清理与排版 | 独立任务表单 |
| 分割 | Split | 清理与排版 | 独立任务表单 |
| 分离颜色通道 | Split Colour Channels | 图像数据 | 独立任务表单 |
| 标准差 | Standard Deviation | 数值与集合 | 独立任务表单 |
| Streebog 哈希 | Streebog | 哈希与校验 | 独立任务表单 |
| 提取可打印字符串 | Strings | 查找与提取 | 独立任务表单 |
| 移除 HTML 标签 | Strip HTML tags | 代码整理 | 独立任务表单 |
| 移除 HTTP 头部 | Strip HTTP headers | 网络数据 | 独立任务表单 |
| 移除 IPv4 头部 | Strip IPv4 header | 网络数据 | 独立任务表单 |
| 移除 TCP 头部 | Strip TCP header | 网络数据 | 独立任务表单 |
| 移除 UDP 头部 | Strip UDP header | 网络数据 | 独立任务表单 |
| 截取片段 | Subsection | 处理链控制 | 完整处理链 |
| 字符替换 | Substitute | 古典密码 | 独立任务表单 |
| 减法 | Subtract | 数值与集合 | 独立任务表单 |
| 求和 | Sum | 数值与集合 | 独立任务表单 |
| 交换大小写 | Swap case | 清理与排版 | 独立任务表单 |
| 交换字节序 | Swap endianness | 文件与字节 | 独立任务表单 |
| 集合对称差 | Symmetric Difference | 数值与集合 | 独立任务表单 |
| 语法高亮 | Syntax highlighter | 代码整理 | 独立任务表单 |
| TCP/IP 校验和 | TCP/IP Checksum | 哈希与校验 | 独立任务表单 |
| TEA解密 | TEA Decrypt | 现代对称加密 | 独立任务表单 |
| TEA加密 | TEA Encrypt | 现代对称加密 | 独立任务表单 |
| 保留结尾 | Tail | 清理与排版 | 独立任务表单 |
| 提取字节 | Take bytes | 文件与字节 | 独立任务表单 |
| 间隔提取字节 | Take nth bytes | 文件与字节 | 独立任务表单 |
| Tar 打包 | Tar | 压缩与解压 | 独立任务表单 |
| 模板 | Template | 代码整理 | 独立任务表单 |
| 穷举文本编码 | Text Encoding Brute Force | 字符集与 Unicode | 独立任务表单 |
| 文本与整数互转 | Text-Integer Conversion | 进制与数字表示 | 独立任务表单 |
| BCD编码 | To BCD | 进制与数字表示 | 独立任务表单 |
| 任意进制编码 | To Base | 进制与数字表示 | 独立任务表单 |
| Base32编码 | To Base32 | Base 系列编码 | 独立任务表单 |
| Base45编码 | To Base45 | Base 系列编码 | 独立任务表单 |
| Base58编码 | To Base58 | Base 系列编码 | 独立任务表单 |
| Base62编码 | To Base62 | Base 系列编码 | 独立任务表单 |
| Base64编码 | To Base64 | Base 系列编码 | 独立任务表单 |
| Base85编码 | To Base85 | Base 系列编码 | 独立任务表单 |
| Base92编码 | To Base92 | Base 系列编码 | 独立任务表单 |
| Bech32编码 | To Bech32 | 二进制封装编码 | 独立任务表单 |
| 二进制编码 | To Binary | 进制与数字表示 | 独立任务表单 |
| 盲文编码 | To Braille | 摩斯、盲文与符号编码 | 独立任务表单 |
| COBS编码 | To COBS | 二进制封装编码 | 独立任务表单 |
| 转驼峰命名 | To Camel case | 代码整理 | 独立任务表单 |
| 生成不区分大小写的正则表达式 | To Case Insensitive Regex | 清理与排版 | 独立任务表单 |
| 字符码编码 | To Charcode | 字符集与 Unicode | 独立任务表单 |
| 十进制编码 | To Decimal | 进制与数字表示 | 独立任务表单 |
| 浮点数编码 | To Float | 进制与数字表示 | 独立任务表单 |
| HTML 实体编码 | To HTML Entity | 网页与邮件编码 | 独立任务表单 |
| 十六进制编码 | To Hex | 进制与数字表示 | 独立任务表单 |
| 十六进制内容编码 | To Hex Content | 进制与数字表示 | 独立任务表单 |
| 十六进制转储编码 | To Hexdump | 进制与数字表示 | 独立任务表单 |
| 转短横线命名 | To Kebab case | 代码整理 | 独立任务表单 |
| 转小写 | To Lower case | 清理与排版 | 独立任务表单 |
| MessagePack编码 | To MessagePack | 格式互转 | 独立任务表单 |
| Modhex编码 | To Modhex | 二进制封装编码 | 独立任务表单 |
| 摩斯密码编码 | To Morse Code | 摩斯、盲文与符号编码 | 独立任务表单 |
| 八进制编码 | To Octal | 进制与数字表示 | 独立任务表单 |
| Punycode编码 | To Punycode | 网页与邮件编码 | 独立任务表单 |
| 可打印编码编码 | To Quoted Printable | 网页与邮件编码 | 独立任务表单 |
| 转下划线命名 | To Snake case | 代码整理 | 独立任务表单 |
| 转表格 | To Table | 格式互转 | 独立任务表单 |
| UNIX 时间戳编码 | To UNIX Timestamp | 时间与坐标格式 | 独立任务表单 |
| 转大写 | To Upper case | 清理与排版 | 独立任务表单 |
| 转换日期时间格式 | Translate DateTime Format | 时间与坐标格式 | 独立任务表单 |
| Triple DES解密 | Triple DES Decrypt | 现代对称加密 | 独立任务表单 |
| Triple DES加密 | Triple DES Encrypt | 现代对称加密 | 独立任务表单 |
| Twofish解密 | Twofish Decrypt | 现代对称加密 | 独立任务表单 |
| Twofish加密 | Twofish Encrypt | 现代对称加密 | 独立任务表单 |
| Typex 密码机 | Typex | 机械密码机 | 独立任务表单 |
| UNIX 时间戳转 Windows 文件时间 | UNIX Timestamp to Windows Filetime | 时间与坐标格式 | 独立任务表单 |
| URL 解码 | URL Decode | 网页与邮件编码 | 独立任务表单 |
| URL 编码 | URL Encode | 网页与邮件编码 | 独立任务表单 |
| 还原字符串转义 | Unescape string | 清理与排版 | 独立任务表单 |
| 还原 Unicode 转义 | Unescape Unicode Characters | 字符集与 Unicode | 独立任务表单 |
| Unicode 文本样式 | Unicode Text Format | 语言与文字变体 | 独立任务表单 |
| 去重 | Unique | 清理与排版 | 独立任务表单 |
| 解包 Tar | Untar | 压缩与解压 | 独立任务表单 |
| 解压 ZIP | Unzip | 压缩与解压 | 沿用现有工具 |
| VarInt解码 | VarInt Decode | 二进制封装编码 | 独立任务表单 |
| VarInt编码 | VarInt Encode | 二进制封装编码 | 独立任务表单 |
| 查看位平面 | View Bit Plane | 图像数据 | 独立任务表单 |
| 维吉尼亚解码 | Vigenère Decode | 古典密码 | 独立任务表单 |
| 维吉尼亚编码 | Vigenère Encode | 古典密码 | 独立任务表单 |
| Whirlpool 哈希 | Whirlpool | 哈希与校验 | 独立任务表单 |
| Windows 文件时间转 UNIX 时间戳 | Windows Filetime to UNIX Timestamp | 时间与坐标格式 | 独立任务表单 |
| 文本换行 | Wrap | 清理与排版 | 独立任务表单 |
| XKCD 随机数 | XKCD Random Number | 处理链控制 | 固定笑话数字，保留在完整处理链中。 |
| 格式化 XML | XML Beautify | 代码整理 | 独立任务表单 |
| 压缩 XML | XML Minify | 代码整理 | 独立任务表单 |
| 按位异或 | XOR | 现代对称加密 | 独立任务表单 |
| 穷举异或密钥 | XOR Brute Force | 现代对称加密 | 独立任务表单 |
| 异或校验和 | XOR Checksum | 哈希与校验 | 独立任务表单 |
| XPRESS解压 | XPRESS Decompress | 压缩与解压 | 独立任务表单 |
| XPRESS LZ77+Huffman解压 | XPRESS LZ77+Huffman Decompress | 压缩与解压 | 独立任务表单 |
| XPath 表达式 | XPath expression | 代码整理 | 独立任务表单 |
| XSalsa20 流加密 | XSalsa20 | 现代对称加密 | 独立任务表单 |
| XTEA解密 | XTEA Decrypt | 现代对称加密 | 独立任务表单 |
| XTEA加密 | XTEA Encrypt | 现代对称加密 | 独立任务表单 |
| XXTEA解密 | XXTEA Decrypt | 现代对称加密 | 独立任务表单 |
| XXTEA加密 | XXTEA Encrypt | 现代对称加密 | 独立任务表单 |
| YAML 转 JSON | YAML to JSON | 格式互转 | 独立任务表单 |
| YARA 规则扫描 | YARA Rules | 文件与字节 | 独立任务表单 |
| ZIP 压缩 | Zip | 压缩与解压 | 独立任务表单 |
| Zlib 压缩 | Zlib Deflate | 压缩与解压 | 独立任务表单 |
| Zlib 解压 | Zlib Inflate | 压缩与解压 | 独立任务表单 |
