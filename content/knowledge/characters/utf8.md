---
capabilityId: native:utf8
title: UTF-8
topicGroup: characters
summary: 介绍 UTF-8 的变长模板、字节合法性、字节序标记与错误处理。
aliases:
  - UTF8
  - UTF-8 字节转换
sources:
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3、4、6 节
  - id: unicode
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.6、3.8、3.9 节
  - id: web
    title: Encoding Standard
    publisher: WHATWG
    url: https://encoding.spec.whatwg.org/
    language: en
    kind: standard
    locator: 名称、UTF-8 解码和错误处理
  - id: tool
    title: 字符编码转换规则
    publisher: 迷雾工具箱
    url: /basics/foundation.js
    language: zh-CN
    kind: implementation
    locator: foundationRecipe 和 validateCodes
---

## 介绍
<!-- sources: utf, unicode -->

UTF-8 把 Unicode 标量值编码成一至四个字节。U+0000 至 U+007F 直接写成一个相同数值的字节，再大的标量值按范围使用更长的模板。这样可以在共享的单字节范围里兼容 ASCII。

## 首字节与继续字节
<!-- sources: utf, unicode -->

一字节以 0 开头，二、三、四字节序列的首字节分别以 110、1110、11110 开头。后续字节都以 10 开头。编码将码点的有效位从高到低填进模板余下的位置。

:::example 欧元符号的三字节表示
[输入]
€（U+20AC）
[结果]
E2 82 AC
[说明]
把码点写成 16 位并切成 0010、000010、101100，再填入 1110xxxx、10xxxxxx、10xxxxxx 三个模板。
:::

## 补充平面的四字节
<!-- sources: utf, unicode, tool -->

U+10000 至 U+10FFFF 的标量值需要四个字节。UTF-16 在同一范围采用两个代理代码单元，UTF-8 编码直接使用组合后的标量值。

:::example 同一码点的两种存储形式
[输入]
😀（U+1F600）
[结果]
UTF-8 字节：F0 9F 98 80
UTF-16 码元：D83D DE00
[说明]
两种表示还原的是同一码点。UTF-16 的两个码元需按所选字节序写入文件。
:::

## 非法序列与替换
<!-- sources: utf, unicode, web -->

即使首字节和继续字节外形匹配，也必须检查数值范围。超长写法、孤立继续字节、代理区数值和大于 U+10FFFF 的标量值都无效。遇错时，严格模式可以拒绝输入，替换模式会在文本里写入 U+FFFD。

:::example 一个非法和一个合法的零值
[输入]
C0 80 与 00，各自独立解码
[结果]
C0 80：非法
00：U+0000
[说明]
把零塞入两字节模板属于超长编码。UTF-8 规定 U+0000 应使用最短的一字节形式。
:::

## 文件开头的标记
<!-- sources: utf, unicode, web -->

UTF-8 的各字节顺序由模板确定，无需用额外标记决定大端或小端。文件开头的 EF BB BF 可被某些协议识别为 UTF-8 签名，是否保留或剥离要按调用接口与文件规范判断。相同字节若出现在正文中，需要依据其位置区分普通字符与协议标记。

## 常见误区

- UTF-8 的长度是字节数，不能用字符串界面显示的字数估计。
- 出现替换字符 U+FFFD 时，应回到原始字节核查。替换后的字符串可能已经丢失信息。
- 多字节序列不能按任意下标切开后分别作为独立 UTF-8 文本解码。
