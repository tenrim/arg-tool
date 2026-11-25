---
capabilityId: native:forensics-file
title: 文件类型与 MIME 识别
topicGroup: files
summary: 文件识别可结合格式特征和文本测试。面向读者的类型描述和用于协议交换的媒体类型有不同的用途。
aliases:
  - libmagic
  - MIME 识别
  - file 文件类型
  - 文件媒体类型
sources:
  - id: file
    title: file(1) — determine file type
    publisher: file 维护者
    url: https://man7.org/linux/man-pages/man1/file.1.html
    language: en
    kind: official-doc
    locator: 格式规则、文本测试、-b 及 MIME 输出模式
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 5 节，PNG 签名、数据块和结构
  - id: mime
    title: RFC 6838 — Media Type Specifications and Registration Procedures
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc6838.html
    language: en
    kind: standard
    locator: 第 2 节，媒体类型登记及类型与子类型
  - id: iana
    title: Media Type image/png
    publisher: IANA
    url: https://www.iana.org/assignments/media-types/image/png
    language: en
    kind: standard
    locator: PNG 媒体类型登记
  - id: upstream
    title: Aperi’Solve 原分析器
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/file.py
    language: en
    kind: implementation
    locator: FileAnalyzer 使用 file -b 返回内容描述
---

## 介绍
<!-- sources: file, mime, upstream -->
文件识别可以查看已知位置的字节、数据布局和文本特征。file 与 libmagic 规则库用这些条件给出文件描述。媒体类型采用 type/subtype 形式，例如 image/png，便于协议明确传递内容类别。

## 文件名与内容证据
<!-- sources: file, png, iana -->
文件头、结构和名称可相互印证。名字末尾只提供提示，内容规则通常更能说明文件的实际格式。PNG 除八字节签名外，还需要满足图像格式规定的数据块结构。

:::example 图片改成文本文件名
[输入]
有效的 1×1 PNG 数据，文件名改为 notice.txt
[结果]
应按 PNG 内容解释，对应媒体类型为 image/png。
[说明]
更名未改变图像签名、尺寸和后续数据块。使用规范解析器仍可读取一个像素。
:::

## 内容描述与 MIME 名称
<!-- sources: file, mime, upstream -->
file 可输出面向读者的描述，例如图像格式和尺寸。单独的 MIME 输出模式用于取得协议名。短描述有时包含细节，不能把第一段描述直接抄写成一个有效的媒体类型名称。

:::example 描述和登记名称呈现不同信息
[输入]
标准签名及 IHDR 指定宽 1、高 1 的完整 PNG
[结果]
可描述为 1×1 的 PNG 图像。媒体类型为 image/png。
[说明]
尺寸来自 PNG 的 IHDR 字段。MIME 名称只说明类型，无需出现尺寸。
:::

## 文本判断与字符集合
<!-- sources: file -->
除固定魔数外，工具还会判断可打印字符和特定控制字符的分布。ASCII 文字即使工作文件使用图片后缀，只要没有相应图片内容，也不应按图片打开。

:::example 图片扩展名下的纯文本
[输入]
hello.png，内容为 68 65 6C 6C 6F 0A
[结果]
这组字节表示 ASCII 文本 hello 加换行。
[说明]
开头不是 PNG 签名，前五个字节均为可打印 ASCII 字符，末尾 0A 是换行。
:::

## 规则库版本与进一步核验
<!-- sources: file, png, mime -->
识别结果受规则库版本、文件长度和输入内容影响。遇到多个有效特征或损坏样本，可检查内部尺寸、校验值及结构一致性。识别输出用于描述内容，不负责证明它满足所有格式约束。

## 常见误区
- 文件名扩展名和实际媒体类型可能不一致。
- 类型描述可以包含尺寸、编码或文字特征，MIME 名称遵循另一个定义。
- 一个判断只能说明匹配到相应条件，完整文件仍可再做格式校验。
