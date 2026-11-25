---
capabilityId: native:image-qr
title: 二维码识别与修复
topicGroup: image
summary: 把破损的 QR 图像校准成模块矩阵，分层恢复格式位与数据码字。
aliases:
  - 二维码修复
  - 二维码纠错
  - QRazyBox
sources:
  - id: version
    title: Information Capacity and Versions of QR Code
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/about/version.html
    language: en
    kind: author-spec
    locator: 版本 1～40、矩阵宽度和各类型数据容量
  - id: correction
    title: Error Correction Feature
    publisher: DENSO WAVE
    url: https://www.qrcode.com/en/about/error_correction.html
    language: en
    kind: author-spec
    locator: 纠错等级与代码字恢复率
  - id: qrazy
    title: QRazyBox Analysis and Recovery Toolkit
    publisher: Merricx
    url: https://github.com/Merricx/qrazybox
    language: en
    kind: official-doc
    locator: 从手工模块到 QR Codeword 和 Reed–Solomon 工具
  - id: worker
    title: 格式和码字恢复
    publisher: 迷雾工具箱
    url: /completion/qr-worker.js
    language: zh-CN
    kind: implementation
    locator: checkedFormat、recover 与分块交错顺序
  - id: decode
    title: 矩阵试读
    publisher: 迷雾工具箱
    url: /round1/qr-worker.js
    language: zh-CN
    kind: implementation
    locator: 默认格式与 32 种格式枚举、未知模块的默认颜色
---

## 介绍
<!-- sources: version, qrazy -->
二维码修复以黑、白、未知三种状态记录模块。21×21 的模块格是版本 1。版本每增加 1，边长增加 4，版本 40 的边长为 177。图像上的多个像素可以共同表示一个模块。应先确认格网，再在位置正确的矩阵上修复。

## 格式信息与掩码
<!-- sources: correction, worker, decode -->
格式信息包含纠错等级和掩码，码上有两份 15 位的副本。当前恢复枚举 32 种格式信息，按一处已知错位计 2、一处未知位计 1 评分；至少一个副本得分小于 7，且只有一种候选满足时才选定。这一步判定怎样去掩码和怎样分块。

## 码字与分块擦除
<!-- sources: correction, qrazy, worker -->
去掩码后，按数据顺序读出每组 8 位作为一个码字。码字中有未知模块时，可将整个码字标作擦除，再按 Reed–Solomon 分块恢复。块内有 r 个纠错码字时，一般唯一解码界为 2e＋s≤r，其中 e 是位置未知的错误数，s 是位置已知的擦除数。相同的损伤集中到同一块时更难恢复。

## 修复样本
<!-- sources: worker, decode -->
以载荷 BCH、版本 1、纠错级 H 的一个矩阵为例，单个纠错块含 9 个数据码字和 17 个纠错码字。

:::example 一个数据码字不明
[输入]
将矩阵数据读取顺序的前八位都记为未知，再执行纠错与擦除恢复
[结果]
恢复完整模块矩阵，试读得到 BCH
[说明]
前八位恰是同一组码字，共标记一个擦除位置。
:::

:::example 一处格式不明和一处格式错色
[输入]
再将零起始坐标第 0 行第 8 列置为未知，第 1 行第 8 列翻色
[结果]
仍恢复出原版矩阵
[说明]
另一份格式副本仍可约束掩码，两个被改的格式位置均被重建。
:::

:::example 两份格式都不明
[输入]
将第 8 行及第 8 列标成未知，包括两份格式信息
[结果]
提示先明确纠错等级和掩码
[说明]
此时可尝试逐一指定格式假设，但没有唯一的 BCH 结果可以自动采用。
:::

## 从试读结果回到原材料
<!-- sources: worker, decode -->
图像直接识别、把未知模块分别猜成黑与白、根据纠错码字恢复矩阵，是三个不同层次的操作。试读发现可解码载荷时，可核对它是否符合原图中仍完整的模块。若多个候选出现，格式位置和已知模块能帮助评估各个结果。

## 常见误区
- 纠错百分比以码字为计量对象，损伤像素比例不能直接换算为成功率。
- 不知道模块颜色时标未知，比悄悄指定为黑或白更能保留原始证据。
- 掩码属于二维码编码结构，候选掩码可能影响所有数据位的解释。
