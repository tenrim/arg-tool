---
capabilityId: op:GOST%20Hash
title: GOST 哈希
topicGroup: file-compression
summary: 区分使用分组密码的 GOST R 34.11-94 与 2012 年的 Streebog，核对旧参数集与结果。
aliases:
  - GOST Hash
  - GOST R 34.11-94
  - CryptoPro
sources:
  - id: rfc
    title: RFC 5831 GOST R 34.11-94 Hash Function Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5831.txt
    language: en
    kind: author-spec
    locator: 第 4 至 6 节压缩和示例
  - id: params
    title: RFC 4357 Additional Cryptographic Algorithms for Use with GOST
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4357.txt
    language: en
    kind: author-spec
    locator: 第 10.4、10.5 节，测试和 CryptoPro 参数集
  - id: new
    title: RFC 6986 GOST R 34.11-2012 Hash Function
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6986.txt
    language: en
    kind: author-spec
    locator: 算法定义与 256、512 位实例
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: GOST Hash 的 1994、2012 分支及旧分支替换表
  - id: vectors
    title: RHash regression vectors
    publisher: RHash
    url: https://raw.githubusercontent.com/rhash/RHash/v1.4.6/librhash/test_lib.c
    language: en
    kind: implementation
    locator: gost94_tests 和 gost94_cryptopro_tests
---

## 介绍
<!-- sources: rfc, new -->

GOST R 34.11-94 和 GOST R 34.11-2012 都是哈希算法规格，后者也称 Streebog。两者的内部压缩结构不同。早期资料有时借用底层分组算法 GOST 28147 的名字描述 1994 版，算法清单应优先写完整规范号。

## 1994 版的压缩
<!-- sources: rfc, vectors -->

消息分成 256 位组，哈希链值也为 256 位。一轮压缩结合消息块和当前链值，生成四段分组密码所需的子密钥。对链值的四个 64 位部分执行分组加密，再通过线性变换与异或混合。

:::example 旧测试表
[输入]
ASCII abc，1994 版，D-TEST。
[结果]
f3134348c44fb1b2a277729e2285ebb5cb5e0f29c975bc753b70497c06a4d51d
[说明]
输出为 32 字节，这里的 D-TEST 指摘要测试参数集。
:::

## 位长与块校验
<!-- sources: rfc, params, vectors -->

完整消息处理后，旧版还将消息位长和分组的模加和分别进入压缩。RFC 4357 把测试与 CryptoPro 作为不同摘要参数集，定义了替换表和初始值的配置方式。两种都输出 256 位。

:::example 改用 CryptoPro
[输入]
ASCII abc，1994 版，D-A。
[结果]
b285056dbf18d7392d7677369524dd14747459ed8143997e163b2986f92fd42c
[说明]
输入字节和输出长度不变，CryptoPro 表选取不同，值也不同。
:::

## 与 2012 年版区分
<!-- sources: new, engine -->

Streebog 的压缩使用 512 位状态、字节替换、位置置换和线性混合，并提供 256 位与 512 位实例。旧替换表名称 D-TEST、D-A 属于旧算法的配置，不能用来定义 Streebog 的实例。

:::example 2012 年的 256 位输出
[输入]
ASCII abc，GOST R 34.11-2012，256 位。
[结果]
4e2919cf137ed41ec4fb6270c61826cc4fffb660341e0af3688cd0626d23b481
[说明]
同一实现用独立的 Streebog 入口也得到此值。
:::

## 资料中的字节表示
<!-- sources: rfc, new, params -->

文献可用数学向量顺序显示位串，软件则按顺序导出摘要字节。复查结果时，要同时确认规范代号、绑定参数与展示顺序。文件只写 GOST 或给出 64 个十六进制字符，仍需从协议或公开向量辨别。

## 常见误区

- GOST 28147 是分组密码，旧哈希使用它只是内部压缩的一部分。
- 1994 版的两个参数集不能由摘要位数区分。
- Streebog-256 与旧 GOST 的 256 位摘要不能互换。
