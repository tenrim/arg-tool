---
capabilityId: native:file-image
title: 文件的 RGB 图片封装
topicGroup: files
summary: 在 RGB 样本中装入四字节长度和文件，按声明长度精确恢复。
aliases:
  - HideInfo
  - 化物为图
  - 字节封装
  - 大端长度
sources:
  - id: hide
    title: guofei9987/HideInfo
    publisher: guofei9987
    url: https://github.com/guofei9987/HideInfo
    language: en
    kind: author-spec
    locator: hide_info/hide_as_img.py 和封装格式
  - id: engine
    title: fun-tools/image-engine.js
    publisher: 迷雾工具箱
    url: /fun-tools/image-engine.js
    language: zh-CN
    kind: implementation
    locator: fileToPixels、pixelsToFile
  - id: png
    title: PNG 规范
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 像素表示与可逆压缩
---

## 介绍
<!-- sources: hide, engine -->

RGB 图片可当成每像素三个数据字节的存储介质。HideInfo 先写长度，再写原始字节。像素的颜色是字节表示的副产品。

## 四字节头
<!-- sources: hide, engine -->

将文件长度 L 写成四字节无符号大端整数，紧接实际载荷。空余 RGB 槽补零。

:::example 保留文件末尾的零
[输入]
文件 41 00
[结果]
先写 00 00 00 02，接着 41 00；解封装仍为 41 00
[说明]
长度 2 决定第二个字节属于载荷。
:::

## 尺寸和容量
<!-- sources: engine, png -->

若采用最小方形图，边长 S=ceil(√((L+4)/3))。图像总槽位 3S²，解码前至少需要完整长度字段。

:::example 百字节文件
[输入]
L=100
[结果]
S=6；108 个槽，4 字节填充
[说明]
头加内容占 104 字节。
:::

:::example 空文件
[输入]
L=0
[结果]
S=2；头部为四个 00；恢复零字节
[说明]
1×1 只提供 3 个 RGB 槽，装不下长度头。
:::

## 反向读出和完整性
<!-- sources: hide, engine -->

依行读取 RGB 后，先检查字节数是否容许声明长度，再切出有效区间。文件名、媒体类型和零以外的校验信息不在这种头中。

## 适合保存的图片
<!-- sources: png, engine -->

输出使用不透明像素。需要保持全部 RGB 数值；调色、截图、JPEG 重压缩和缩放会改变样本。恢复后可另用文件格式和已知摘要比对。

## 常见误区

- 合法长度并不检查某一载荷位是否改动。
- 图片能正常打开不意味着载荷仍完整。
- 封装只是换一种表示方式，没有为内容加密。

