---
capabilityId: op:Ascon%20Hash
title: Ascon 哈希
topicGroup: file-compression
summary: 解释 Ascon-Hash256 的轻量海绵、64 位吸收与 256 位结果，区分标准与早期版本。
aliases:
  - Ascon-Hash256
  - Ascon Hash
  - SP 800-232
sources:
  - id: nist
    title: NIST SP 800-232
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-232.pdf
    language: en
    kind: standard
    locator: 第 3、5.1、5.2 节，算法 5 和附录 A
  - id: design
    title: Ascon Specification
    publisher: Ascon 设计团队
    url: https://ascon.isec.tugraz.at/specification.html
    language: en
    kind: author-spec
    locator: Ascon 置换、标准化变化和海绵构造
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Ascon Hash
---

## 介绍
<!-- sources: nist, design -->

Ascon-Hash256 使用轻量置换处理消息并产生 256 位摘要。NIST 将它与 Ascon 的认证加密和可扩展输出函数一起纳入 SP 800-232，面向计算资源有限的设备。它有自己的初始化向量和消息吸收规则。

## 五个状态字
<!-- sources: nist, design -->

内部状态由五个 64 位字组成，速率 64 位，容量 256 位。算法用固定初值与四个零字建立状态，执行一次 12 轮置换。每轮向一个字加入常量，跨五个字应用并行五位替换，再对每个字做线性扩散。

:::example 空消息摘要
[输入]
零字节。
[结果]
0b3be5850f2f6b98caf29f8fdea89b64a1fa70aa249b8f839bd53baa304d92b2
[说明]
空消息也会形成一个带结束补位的块，随后按规范挤出摘要。
:::

## 吸收与补齐
<!-- sources: nist, design -->

消息按八字节吸收，把当前完整数据块异或到状态的第一个字。最后附加一个 1 位，剩余补零。按标准的小端字节表示，对齐的字节消息在最后数据字节后接入 01。恰好整块的消息也有一个补齐块。

:::example 区分零字节和空消息
[输入]
一个原始字节 00。
[结果]
0728621035af3ed2bca03bf6fde900f9456f5330e4b5ee23e7f6a1e70291bc80
[说明]
首个吸收块从 00 01 开始，空消息形成的补齐块从 01 开始。
:::

## 挤出四段摘要
<!-- sources: nist, engine -->

完成吸收后取第一个状态字，每次再做一次 12 轮置换，继续取出下一段。依次拼接四段 64 位块得到 32 字节，每段使用规范的小端顺序。

:::example 两字节输入
[输入]
原始字节 00 01。
[结果]
6115e7c9c4081c2797fc8fe1bc57a836afa1c5381e556dd583860ca2dfb48dd2
[说明]
此时补齐块开头是 00 01 01。中间的 01 来自消息，后一个来自补齐。
:::

## 版本和算法族
<!-- sources: nist, design, engine -->

早期设计与标准版的初值和位序存在差异，复算时应看文件标注的版本。标准 Ascon-XOF128 使用另一个初值，输出长度可变。选择其 256 位输出与执行 Ascon-Hash256 得到不同结果。

## 常见误区

- 320 位是内部状态宽度，摘要宽度是 256 位。
- 原始字节 00 与 ASCII 字符串 00 的内容不同。
- 家族中认证加密、XOF 和固定长度哈希拥有各自的调用约定。
