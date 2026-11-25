---
capabilityId: native:ascii
title: ASCII
topicGroup: characters
summary: 说明七位字符表的编号读法、控制字符和兼容编码边界。
aliases:
  - ASCII 字符编码
  - 七位字符表
sources:
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2 节，字符表
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3、4、6 节
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
<!-- sources: ascii, utf -->

ASCII 以七位整数标识 128 个位置，覆盖拉丁基本字母、数字、标点、空格和控制码。在八位字节中储存 ASCII 时最高位为零。ASCII 的字符和编号同时成为 UTF-8 的单字节范围。

## 字符表的行与列
<!-- sources: ascii, tool -->

七位表可用高三位选择列、低四位选择行。同一数值可写成十进制、十六进制或二进制，比较时须知道原记法。

:::example 从表坐标读出字母
[输入]
ASCII 表第 4 列、第 1 行
[结果]
A，十进制 65，十六进制 41，七位 1000001
[说明]
4×16+1 得到编号 65。转换数制只改变编号的写法。
:::

## 数字字符与数字值
<!-- sources: ascii -->

字符 0 至 9 位于编号 48 至 57。这段连续编号便于将字符换成数值，也避免了数字字符与控制码的混淆。

:::example 文本 07 的两个字节
[输入]
07
[结果]
30 37
[说明]
30 和 37 是十六进制。两个字节分别表示字符 0、7。如果直接写整数 7 的单字节值，会得到 07，对应控制码 BEL。
:::

## 控制字符
<!-- sources: ascii, utf -->

控制码可以参与字符流却没有独立可见字形。换行、回车和删除各有编号。解释这些编号的实际行为还需要知道使用它们的协议或文本格式。

:::example 回车与换行
[输入]
十六进制 41 0D 0A 42
[结果]
A、CR、LF、B
[说明]
0D 表示回车，0A 表示换行。接受 CRLF 作为行结束符的格式会把首尾字母显示成两行。
:::

## 与其他编码的兼容
<!-- sources: ascii, utf, web -->

ASCII 字节的取值上限是 7F。0x80 以上的字节需要由其他编码解释。不同旧式八位编码可以共享前半张表而对高位字符给出不同结果。Web 平台的字符编码标签还可能规范化到约定的解码器，因此检查文件格式时应考虑具体环境。

## 常见误区

- ASCII 表中含有控制码。有编号并不保证屏幕上出现一个图形。
- 单字节编码的 128 至 255 区间取决于扩展编码，不能用一张通用的 ASCII 表解释。
- 看到 41 这两个字符时，必须先知道它是十六进制表示，才能将其读为 A。
