---
capabilityId: native:file-batch
title: 多文件批量处理
topicGroup: files
summary: 对文件队列逐一应用同一变换，保留各项状态与可下载的单独结果。
aliases:
  - 批量转换
  - 批量图片
sources:
  - id: core
    title: 文件工作区的配对及批处理
    publisher: 迷雾工具箱
    url: /file-workbench/model.js
    language: zh-CN
    kind: implementation
    locator: compareSets、readSet、transformFile
  - id: sha
    title: FIPS 180-4：Secure Hash Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
    language: en
    kind: standard
    locator: SHA-256 及摘要长度
  - id: rfc
    title: RFC 4648：Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 3、4 节，Base64 字母表与规范填充
  - id: enc
    title: Encoding Standard
    publisher: WHATWG
    url: https://encoding.spec.whatwg.org/
    language: en
    kind: standard
    locator: TextDecoder 对非法 UTF-8 和 BOM 的处理
  - id: canvas
    title: HTML OffscreenCanvas
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/canvas.html#the-offscreencanvas-interface
    language: en
    kind: standard
    locator: convertToBlob、图像序列化和质量参数
---

## 介绍
<!-- sources: core -->

批量处理把同一操作施于一组文件。每个文件独立读取、转换并记录结果。对同批格式不匹配的文件可以出现个别失败，成功的其它文件仍可单独查看。

## 二进制与 Base64
<!-- sources: rfc, core -->

Base64 将任意字节映射为可打印字符串。解码要按选定字母表和填充规则进行，禁止把不完整语法勉强当作原数据。

:::example 可回转的二进制
[输入]
00 FF 01 02 03
[结果]
Base64：AP8BAgM=；解回 00 FF 01 02 03
[说明]
二进制包括 00 和 FF，解码输出不是一段强制解释的 UTF-8。
:::

## 换行规则和 BOM
<!-- sources: enc, core -->

换行统一要求输入为可正确解码的 UTF-8。CRLF 与裸 CR 都可变成 LF。若输入用 UTF-8 BOM 标记，实测转换保留它。

:::example 只变更换行字节
[输入]
EF BB BF 41 0D 0A 42 0D 43
[结果]
EF BB BF 41 0A 42 0A 43
[说明]
BOM 和 A、B、C 不变。
:::

## 图片转换中的缩放
<!-- sources: canvas, core -->

图像转换从画布重新编码，为适应最长边可等比缩小。动画的额外帧和文件元数据不属于这类静态图像编码流程，透明图转 JPEG 要合成背景。

:::example 只缩小不改变长宽比例
[输入]
4000×2000 的静态图片，最长边限制为 1000
[结果]
输出 1000×500
[说明]
两轴乘 1000/4000，尺寸按像素取整。
:::

## 摘要与部分结果
<!-- sources: sha, core -->

SHA-256 对每一项的字节分别计算摘要。停止时可获得已完成项目，失败或尚未执行的项应看具体原因。打包保存仍需保留目录并区分哪些文件实际已产生。

## 常见误区

- SHA-256 摘要不可解码为原文件。
- 文本换行处理不能盲目用于任意二进制。
- 打包内存在部分结果不代表整批已全部完成。

