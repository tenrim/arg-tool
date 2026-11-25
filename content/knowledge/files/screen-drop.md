---
capabilityId: native:screen-drop
title: 二维码分块传文件
topicGroup: files
summary: 把载荷切成带编号的二维码帧，逐帧验 CRC，合并后验 SHA-256。
aliases:
  - ScreenDrop
  - 多帧二维码
  - 分块
  - 缺帧补传
sources:
  - id: screen
    title: guofei9987/ScreenDrop
    publisher: guofei9987
    url: https://github.com/guofei9987/ScreenDrop
    language: en
    kind: author-spec
    locator: 文件头、帧与接收协议
  - id: impl
    title: fun-tools/screen-model.js
    publisher: 迷雾工具箱
    url: /fun-tools/screen-model.js
    language: zh-CN
    kind: implementation
    locator: prepareTransfer、receiver
  - id: wire
    title: vendor/fun-tools/screendrop.js
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/screendrop.js
    language: zh-CN
    kind: implementation
    locator: 帧 CRC16 及文件头
  - id: sha
    title: Secure Hash Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
    language: en
    kind: standard
    locator: SHA-256
---

## 介绍
<!-- sources: screen, impl -->

单个二维码能携带的字节有限。ScreenDrop 把一份文件切成多个有序数据帧，通过连续展示和扫描重建原文件。

## 从原文件到数据帧
<!-- sources: wire, screen -->

完整数据由 1 字节文件名长度、UTF-8 文件名、4 字节文件大小、32 字节 SHA-256 和文件组成。按固定容量切片，末帧填零。帧头含 GF、零基序号、总帧数和载荷 CRC16。

:::example 计算帧数
[输入]
文件名 x.bin（5 字节），文件 250 字节，每帧载荷容量 128
[结果]
共 3 帧；最后一帧填充 92 字节
[说明]
37+5+250=292；3×128−292=92。
:::

## 乱序、重复与缺帧
<!-- sources: impl, wire -->

接收方按编号收集。内容一致的重复帧不增加数量。编号相同但载荷不同时需要清空或复查。界面显示的帧号通常在零基序号上加一。

:::example 反序扫描
[输入]
共 3 帧，依次收到 3、1、1
[结果]
已收 2/3，缺第 2 帧
[说明]
再次扫第 1 帧不会补上缺口。
:::

## 帧级与文件级校验
<!-- sources: wire, impl, sha -->

CRC16 发现对应分块的传输损坏。重组时按文件头声明长度去掉末尾填充，再比较完整原文件的 SHA-256。不同传输的帧各自可以拥有有效 CRC。

:::example 混进另一份文件的分块
[输入]
保留第一份文件头所在第一帧，后续从具有相同帧数和容量的另一份文件取
[结果]
局部 CRC 可通过，最终 SHA-256 不一致
[说明]
文件头的摘要仍属于第一份文件。
:::

## 补传和文件名编码
<!-- sources: screen, impl -->

指定帧重播可补全小缺口。UTF-8 文件名上限是 255 字节，不能按显示的字符数判断。不同文件不应在同一接收会话里混扫。

:::example 名字超过上限
[输入]
86 个“中”作为文件名（没有扩展名）
[结果]
258 字节，超限
[说明]
每个“中”是三个 UTF-8 字节。
:::

## 常见误区

- CRC 和摘要用于查验数据，旁观者仍能读取二维码。
- 相同总帧数不能标识同一个文件。
- 收到所有编号后还要等待完整文件校验通过。

