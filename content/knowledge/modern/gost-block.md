---
capabilityId: pair:GOST%20Encrypt
title: GOST
topicGroup: modern
summary: 区分 GOST 28147-89、Magma 与 Kuznyechik 的分组长度和轮规则。
aliases:
  - GOST Encrypt
  - GOST Decrypt
  - 区分 1989、Magma 与 Kuznyechik
sources:
  - id: gost
    title: "RFC 5830：GOST 28147-89: Encryption, Decryption, and MAC Algorithms"
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5830.html
    language: en
    kind: standard
    locator: 第 4–7 节，分组变换与 MAC
  - id: cp
    title: RFC 4357：Additional Cryptographic Algorithms for GOST
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4357.html
    language: en
    kind: standard
    locator: 第 8、11 节，参数集标识及替换表
  - id: magma
    title: RFC 8891：Block Cipher Magma
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8891.html
    language: en
    kind: standard
    locator: 第 4、5 节与附录 A，64 位分组向量
  - id: kuz
    title: RFC 7801：Block Cipher Kuznyechik
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7801.html
    language: en
    kind: standard
    locator: 第 4、5 节，128 位分组向量
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: gost, magma, kuz -->

GOST 是一组标准的名称。GOST 28147-89 和后续 Magma 处理 64 位分组，Kuznyechik 处理 128 位分组。三者都使用 256 位密钥，轮变换和数据格式有各自规范。

## GOST 28147-89 的参数集
<!-- sources: gost, cp, chef -->

早期算法以两个 32 位字作为状态，轮函数包含 32 位加法、八个四位替换与轮转。不同 S 盒表会改变结果，文档须明确参数集。

:::example 旧算法与测试 S 盒
[输入]
GOST 28147-89，E-TEST，32 字节全零密钥和 8 字节全零明文，ECB，无填充
[结果]
08D8EA028CDEFECA
[说明]
此例仅针对所列 E-TEST 映射。
:::

## Magma 的固定替换
<!-- sources: magma -->

Magma 对早期 64 位结构作了进一步定义，固定 S 盒和字节表示。公开向量可检验轮密钥读入顺序与分组端序。

:::example RFC 8891 单块
[输入]
密钥 FFEEDDCCBBAA99887766554433221100F0F1F2F3F4F5F6F7F8F9FAFBFCFDFEFF
明文 FEDCBA9876543210，ECB，无填充
[结果]
4EE901E5C2D8CA3D
[说明]
与附录 A.4 的加密结果相同。
:::

## Kuznyechik 的 128 位结构
<!-- sources: kuz -->

Kuznyechik 的轮将密钥异或、字节替换和线性变换结合，最后再异或轮密钥。状态包含 16 个字节，区别于 Magma 的两个 32 位半块。

:::example RFC 7801 单块
[输入]
密钥 8899AABBCCDDEEFF0011223344556677FEDCBA98765432100123456789ABCDEF
明文 1122334455667700FFEEDDCCBBAA9988，ECB，无填充
[结果]
7F679D90BEBC24305A468D42B9D4EDCD
[说明]
与第 5.5 节的加密结果一致。
:::

## 文件中的算法识别
<!-- sources: gost, cp, magma, kuz, chef -->

算法完整名、封装参数和分组长度需要一起判断。同为 8 字节的结果未必能区分旧 GOST 和 Magma。多块文本还需核对模式和填充。消息认证码与密钥封装应按其单独协议处理。

## 常见误区

- GOST 并不是一种固定的分组变换。
- 密钥长度相同不意味着密文可互解。
- 旧版本的 S 盒参数不应直接套用到 Kuznyechik。

