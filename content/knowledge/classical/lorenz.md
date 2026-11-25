---
capabilityId: op:Lorenz
title: 洛伦兹密码机
topicGroup: classical
summary: 用规则步进的 χ 轮和不规则步进的 ψ 轮改变五位电传码。
aliases:
  - Lorenz
  - 五位电传码与两组轮流异或
  - 洛伦兹 SZ40
  - Tunny
sources:
  - id: lorenz
    title: Lorenz SZ-40/42
    publisher: Crypto Museum
    url: https://www.cryptomuseum.com/crypto/lorenz/sz40/
    language: en
    kind: author-spec
    locator: 轮组、传输与型号
  - id: museum
    title: Colossus
    publisher: 英国国家计算博物馆
    url: https://www.tnmoc.org/colossus
    language: en
    kind: official-doc
    locator: 复原装置与 Tunny 历史
  - id: guide
    title: Lorenz SZ
    publisher: GCHQ CyberChef
    url: https://github.com/gchq/CyberChef/wiki/Lorenz-SZ
    language: en
    kind: official-doc
    locator: ITA2、轮组与收发方向
  - id: engine
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Lorenz
  - id: source
    title: CyberChef 11.5.0 固定源码
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Lorenz.mjs
    language: en
    kind: implementation
    locator: 操作的消息通路与轮配置
---

## 介绍
<!-- sources: lorenz, museum -->

洛伦兹 SZ-40/42 是加装在电传机上的密码装置。电传文本先编码为五位符号，硬件在每个位置把这五位与轮组生成的五位掩码结合。英国方面以 Tunny 称呼这类通信。

## 五位码和换档
<!-- sources: guide, lorenz -->

五位共有 32 种码字。字母档和数字档共享部分码字，换档符决定如何解释后续序列。符号计数应按编码后的电传流计算。

:::example 带数字的电传样例
[输入]
SZ40、KH 图样、轮起点均为 1；发送 MEET AT 7
[结果]
PIXRN4ALP4F
[说明]
编码包含换档，字符数可增长。
:::

## 十个掩码轮与两个控制轮
<!-- sources: lorenz, guide -->

五只 χ 轮每个字符向前一步。五只 ψ 轮受两个控制轮支配，可以在相邻位置保持不动。控制轮中的 61 位轮规则运动，再控制 37 位轮的步进。轮表与当前轮位共同决定输出。

## 逐位异或与接收
<!-- sources: lorenz, guide, source -->

令 P 为明文码，χ、ψ 为本位置两个轮组的五位输出，电传密文为 Z=P⊕χ⊕ψ。接收端用同一轮状态、同一顺序再异或这两组输出，得到 P。

:::example 五位往返
[输入]
00101⊕10110=10011
[结果]
10011⊕10110=00101
[说明]
相同的掩码用两次会抵消。
:::

:::example 短消息往返
[输入]
SZ40、KH 图样、轮起点均为 1；发送 HELLO
[结果]
VIC3T；相同设置接收回到 HELLO
[说明]
密文中的 3 属于电传符号的可见写法。
:::

## 相同输入与重复掩码
<!-- sources: lorenz, engine, source -->

每个字符后所用轮位可能变化，因此相同明文字母一般没有一张固定的密文表。如果两条消息从相同轮位起跑且实际掩码流一致，密文的异或会消去掩码，留下两段明文码之间的关系。

:::example 同字母连续输入
[输入]
同一示例设置；发送 AAAAA
[结果]
D98BJ
[说明]
变化来自轮步进。
:::

## 型号与流的复算
<!-- sources: museum, lorenz, guide -->

SZ40 与后来的 SZ42 变体之间存在限制和步进差异。复算历史材料要识别机型、每只轮的图样和初始位置，再比对完整电传流；一个看似可读的字母片段不能独立确认对应密钥。

## 常见误区

- 字符表的可见符号与五位原始码应当区分。
- 两个控制轮调节 ψ 的运动，不额外作为两条消息通道。
- 同样的轮窗口位置搭配不同图样会生成不同密钥流。
- 历史消息重用轮起点会产生关系，也仍需材料和进一步分析。

