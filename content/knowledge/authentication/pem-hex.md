---
capabilityId: pair:Hex%20to%20PEM
title: PEM / 十六进制
topicGroup: authentication
summary: 在同一组二进制字节的十六进制和带标签文本封装之间转换。
aliases:
  - Hex to PEM
  - PEM to Hex
  - PEM 文本封装
  - DER hex
sources:
  - id: pem
    title: RFC 7468 Textual Encodings of PKIX, PKCS, and CMS Structures
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7468
    language: en
    kind: standard
    locator: 第 2、5、6、7、13 节，文本封装标签
  - id: base
    title: RFC 4648 Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648
    language: en
    kind: standard
    locator: 第 4 节，Base64 字母表与填充
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: Hex to PEM：从 Hex 创建指定标签的 Base64 文本
  - id: worker
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: PEM to Hex：匹配成对边界并逐块输出
---

## 介绍
<!-- sources: pem, base -->
PEM 式文本封装用 BEGIN 和 END 边界包住 Base64 数据，常用于证书和密钥。十六进制则用两位字符表示一个字节。两种表示可互换，内部数据的类型继续由其真实字节决定。

## 边界、换行和标签
<!-- sources: pem, engine, worker -->
上下边界须使用同一标签，例如标准的 CERTIFICATE 或 PUBLIC KEY。生成工具可接受文字标签，回读器按固定模式查找有效的边界。传输样例中的空行和换行与数据字段之间的界线需要清晰。

## 从字符回到字节
<!-- sources: base, engine, worker -->
Base64 用四个文本字符表示最多三个字节，末组不足时使用等号填充。反向解开 Base64 再按字节写出十六进制，不会把标签或回车转为 DER 内容。有多个合法区块时，各区块的十六进制按行给出。

## 字节往返
<!-- sources: pem, base, engine, worker -->
以下使用自定义演示标签 ASN SAMPLE，方便表明它包的是简单 ASN.1 样本。实际证书应保留所属格式规定的标签。

:::example 把 ASN.1 序列包装成文本
[输入]
30 06 02 01 01 02 01 02，标签 ASN SAMPLE
[结果]
-----BEGIN ASN SAMPLE-----
MAYCAQECAQI=
-----END ASN SAMPLE-----
[说明]
中间是这 8 个字节的 Base64 表示。
:::

:::example 从封装读回原始字节
[输入]
上面的 ASN SAMPLE 文本
[结果]
3006020101020102
[说明]
PEM 边界只用于标记位置，不进入返回字节。
:::

:::example 读取多个区块
[输入]
上面的文本之后再接一个同标签 PEM，第二块的 Base64 是 AgEq
[结果]
3006020101020102
02012a
[说明]
两个区块分别转换，AgEq 解出的字节是 02 01 2A。
:::

## 识别非标准封装
<!-- sources: pem, engine, worker -->
有些输入中的头尾标签合法但内部类型不同，转换器仅处理字节表示。现有 Hex 转 PEM 可写入自定义字符串，反向读取的边界识别更严格，含数字的标签可能不匹配；实际材料应采用对应类型规定的标签。

## 常见误区
- PEM 并不自动加密被包裹的数据。
- 标签写成 CERTIFICATE 后，内部数据仍需有真实证书结构。
- 十六进制与 Base64 字符不能直接按相同文本解释。
