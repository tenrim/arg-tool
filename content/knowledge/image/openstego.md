---
capabilityId: native:forensics-openstego
title: OpenStego 隐写提取
topicGroup: image-stego
summary: 用 RandomLSB 解析图片中的隐藏文件，并识别两种兼容的 AES 方案。
aliases:
  - openstego
  - AperiSolve
  - Aperi’Solve
sources:
  - id: manual
    title: Using OpenStego from Command-line
    publisher: OpenStego 项目
    url: https://www.openstego.com/cmdline.html
    language: en
    kind: author-spec
    locator: extract、RandomLSB 及 AES 算法选择
  - id: adapter
    title: AperiSolve 分析器源码：openstego
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/openstego.py
    language: en
    kind: implementation
    locator: RandomLSB 提取、AES128 与 AES256 尝试顺序
  - id: code
    title: OpenStego v0.8.6
    publisher: Sumeet Vaidya／OpenStego
    url: https://github.com/syvaidya/openstego/tree/openstego-0.8.6
    language: en
    kind: implementation
    locator: 提取接口和 RandomLSB 插件
---

## 介绍
<!-- sources: manual, code -->

OpenStego 有数据隐藏和水印两类能力。RandomLSB 的提取用于恢复嵌入的数据文件。它要先解释图像中的插件格式，再依据其中的声明恢复原始内容。

## 插件格式与数据包装
<!-- sources: manual, adapter -->

随机位置的低位数据属于插件约定，提取并不是逐像素随意串成字节。容器内的组织还可能包括文件名、压缩和加密设置。工具适配的资料来源应与插件名称匹配。

## 两种密钥长度情形
<!-- sources: manual, adapter -->

启用加密时可选择 AES128 或 AES256。适配器按这两种算法尝试同一个恢复流程。选项不同和是否真的启用加密是两个问题，验证文档应区分。

:::example 首个验证样件
[输入]
固定样例 openstego-AES128.png，提供 test
[结果]
payload.bin，24 字节
[说明]
样件按 AES128 选项生成；这一结果只证明该记录成功恢复。
:::

:::example 另一份选项样件
[输入]
固定样例 openstego-AES256.png，提供 test
[结果]
payload.bin，24 字节
[说明]
样件按 AES256 选项生成，仍用原插件解析。
:::

## 文件可以包含任意字节
<!-- sources: manual, adapter -->

恢复后的文件可能由压缩流解出或从原记录直接读取。结果要检查完整二进制，不依赖扩展名或可读摘要。

:::example 比对两份样例的恢复结果
[输入]
分别下载两组样例中的 payload.bin
[结果]
6D 69 73 74 2D 66 6F 72 65 6E 73 69 63 73 2D 70 72 6F 6F 66 00 FF 80 0A
[说明]
两份样件使用相同的 24 字节试验载荷。
:::

## 提取识别与水印
<!-- sources: manual, code -->

识别到图像中存在某种水印，并不说明有可独立恢复的文件。查看工具输出应保留所选 RandomLSB 操作、原文件和诊断。原图一旦重采样或强压缩，部分低位数据可能不可恢复。

## 常见误区

- OpenStego 的数据隐藏与水印是不同用途。
- 发现以 PNG 保存的文件不能确定它使用了 RandomLSB。
- 尝试多个算法不代表提取覆盖所有该软件插件。

