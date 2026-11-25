---
capabilityId: op:Generate%20RSA%20Key%20Pair
title: 生成 RSA 密钥对
topicGroup: modern
summary: 按模数、公开指数和私有指数理解 RSA 密钥对及其表示。
aliases:
  - Generate RSA Key Pair
  - RSA 密钥生成
  - 模数 n
  - PKCS #1 私钥
sources:
  - id: rsa
    title: RFC 8017 — PKCS #1 RSA Cryptography Specifications
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8017.html
    language: en
    kind: official-doc
    locator: §§3–5、7–9 与附录 A，密钥、原语、加密、签名和结构
  - id: fips
    title: FIPS 186-5 — Digital Signature Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
    language: en
    kind: standard
    locator: §5 RSA 与附录 A.1 IFC 密钥生成
  - id: pem
    title: RFC 7468 — Textual Encodings of PKIX, PKCS, and CMS Structures
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7468.html
    language: en
    kind: official-doc
    locator: §§10、13，私钥及公钥文本封装
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: Generate RSA Key Pair，PEM、内部 JSON 和 PKCS #1 DER 输出
---

## 介绍
<!-- sources: rsa, fips -->

RSA 密钥对含可公开的加密或验签信息，以及必须保护的私有材料。常见的两素数 RSA 中，公钥由模数 n 和指数 e 表示，私钥另外带有可用于解密或签名的指数及分解参数。

## 数学关系
<!-- sources: rsa, fips -->

设 p、q 为两个不同的素数。n = p × q，λ(n) 是 p−1 与 q−1 的最小公倍数。公开指数 e 应与 λ(n) 互素，再求私有指数 d，使 e × d ≡ 1 mod λ(n)。根据同一个 n、e 可以匹配公钥与私钥，私有字段还可包含 p、q 和用于加速运算的系数。

## 位数与编码
<!-- sources: rsa, fips, pem, engine -->

通常说的 RSA 密钥位数是模数的位长。PEM 是带边界行的文本表示，可封装结构化二进制对象。固定工具的 JSON 导出包含引擎用的大整数结构，和标准 JWK 整数的 Base64URL 字段不同。它的 DER 选项则输出 PKCS #1 私钥的二进制，公钥可从其中的 n、e 派生。

## 用三个例子检查结构
<!-- sources: rsa, fips, pem, engine -->

以下例子不依赖公开生产密钥。随机生成的内容每次会变化，验证目标是模数、公开指数、格式和公私钥对应关系。

:::example 两个小素数的教学钥对
[输入]
p = 61，q = 53，e = 17。
[结果]
n = 3233，λ(n) = 780。可取 d = 2753，有 17 × 2753 ≡ 1 mod 780。
[说明]
17 × 2753 = 46801，即 780 × 60 + 1。样例用于理解同余关系。
:::

:::example 2048 位 PEM 输出
[输入]
生成一对 2048 位 RSA 测试密钥，导出 PEM。
[结果]
文本含 PUBLIC KEY 和 RSA PRIVATE KEY 两个块。按标准读入，公钥及由私钥导出的公钥具有相同 n 和 e。
[说明]
读入后的模数位长为 2048，格式外层的标签不同恰好提示封装不同。
:::

:::example JSON 与 DER 观察
[输入]
仅为识别旧格式，新生成 1024 位测试对象分别观察 JSON 和 DER 输出。
[结果]
JSON 有 publicKey 和 privateKey。DER 可以按 PKCS #1 解析成私钥并重新导出公钥。
[说明]
输出结构可由独立密码库检查。1024 位参数在这里用于兼容检验，不作为当代数据保护示例。
:::

## 征集材料与密钥有效性
<!-- sources: rsa, fips -->

课程题目可以公开完整私钥以便计算。实际使用中的私钥、素数和 CRT 参数属于敏感材料。导入密钥后可以检查公开字段匹配性、密钥大小和预期算法，这些检查与评估密钥随机性或信任归属是不同步骤。

## 常见误区

- 保存生成结果时，公开部分和包含素数的私有部分有不同保密要求。
- 用文本比较 PEM 与 DER 往往看不出相同密钥，应先解出结构再比较公开字段。
- 私钥的向量和示范小整数用于理解算法，不能替代真正的密钥生成。

