---
capabilityId: op:Parse%20User%20Agent
title: 解析用户代理
topicGroup: network
summary: 按 User-Agent 字段的产品与版本模式识别浏览器、引擎、系统及设备声明。
aliases:
  - Parse User Agent
  - User-Agent
  - 浏览器识别
sources:
  - id: semantics
    title: "RFC 9110: HTTP Semantics"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    language: en
    kind: standard
    locator: 第 5、8、10、11、15 节
  - id: chef
    title: CyberChef · Parse User Agent
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 固定操作定义
  - id: source
    title: ParseUserAgent.mjs
    publisher: GCHQ / CyberChef
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/ParseUserAgent.mjs
    language: en
    kind: implementation
    locator: 第 39–55 行 UAParser 调用及字段回退
---

## 介绍
<!-- sources: semantics, source -->
User-Agent 是客户端随 HTTP 请求声明的软件标识。它常包含产品名称、版本和兼容性注释。解析器将声明中的已知模式对应到浏览器、渲染引擎、操作系统、设备及 CPU 架构字段。

## 产品名称与注释
<!-- sources: semantics -->
产品可由名称与斜线后的版本组成，括号常包含补充说明。实际浏览器字符串可能放入多个产品名。有些来自兼容旧站点的习惯，一个字符串开头的 Mozilla/5.0 因而不足以确定实际产品。

## 浏览器与引擎的识别
<!-- sources: chef, source -->
实际解析逐项尝试模式，浏览器名称、浏览器版本、引擎和系统可来自同一输入的不同片段。操作调用 UAParser，并将未识别栏位写成 unknown。

:::example Chrome 声明含 Safari 字样
[输入]
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
[结果]
Chrome 120.0.0.0，Blink 120.0.0.0，Windows 10，amd64
[说明]
完整模式表明 Chrome，末尾的 Safari 字样是兼容声明的一部分。
:::

## 部分字段已知的情形
<!-- sources: chef, source -->
解析结果可以只识别部分字段。知道操作系统名称仍可能不知道系统版本，识别 CPU 架构也不意味着可以识别设备型号。

:::example Linux 上的 Firefox 声明
[输入]
Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0
[结果]
Firefox 130.0，Gecko 130.0，Linux（系统版本 unknown），amd64
[说明]
字符串提供了 Firefox 版本和 Linux 架构，没有可供识别的 Linux 版本。
:::

## 声明与身份证据
<!-- sources: semantics, chef, source -->
客户端可减少或改写这段声明。解析是读取文本模式，不能直接测量真实设备，也不能有效区分发出相同声明的多位使用者。

:::example 没有可识别模式
[输入]
read-me
[结果]
所列浏览器、设备、引擎、系统及 CPU 各栏为 unknown
[说明]
未命中已知模式时，结果保留未知状态。
:::

## 常见误区

- Mozilla、AppleWebKit、Safari 等兼容项不宜各自作为产品判据。
- unknown 意味着未识别，对实际设备状况没有进一步结论。
- 浏览器版本、引擎版本和系统版本应分别读取。
- User-Agent 可被修改，也可以被多设备共享。
