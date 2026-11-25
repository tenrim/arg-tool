---
capabilityId: native:forensics-outguess
title: OutGuess 隐写提取
topicGroup: image-stego
summary: 用 OutGuess 约定与配套密钥识别 JPEG 中的原始隐藏数据。
aliases:
  - outguess
  - AperiSolve
  - Aperi’Solve
sources:
  - id: up
    title: OutGuess 原始代码
    publisher: Niels Provos／OutGuess 维护项目
    url: https://github.com/resurrecting-open-source-projects/outguess
    language: en
    kind: author-spec
    locator: README、outguess.c，识别与读取
  - id: adapter
    title: AperiSolve 分析器源码：outguess
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/outguess.py
    language: en
    kind: implementation
    locator: 密钥参数与非空文件成功判据
  - id: jpeg
    title: ITU-T T.81：Digital Compression and Coding of Continuous-tone Still Images
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-T.81
    language: en
    kind: standard
    locator: DCT 变换、量化、熵编码和 JPEG 文件结构
---

## 介绍
<!-- sources: up, jpeg -->

OutGuess 是按载体处理可用位的历史隐写工具。JPEG 记录 DCT 的量化系数，读取以实际压缩结构为基础。OutGuess 的取位顺序、头信息和数据恢复属于自身约定。

## 密钥参与重建读取顺序
<!-- sources: up, adapter -->

提取方用相同密钥重现数据读取路径。格式合适而密钥不匹配时，程序也可能报告长度异常或没有输出。错误提示有助于缩小原因，不能单凭提示确认载体来源。

:::example 提取已知 JPEG
[输入]
outguess.jpg；公开验证密钥 test
[结果]
outguess.data，24 字节
[说明]
这是已知由 OutGuess 写入的人工样本。
:::

## 独立核对输出的字节
<!-- sources: adapter, up -->

抽到的文件可能不带原始扩展名，也可能包含零值和高位字节。可在字节查看器中核对完整文件的长度和字节，按格式分析内容。

:::example 检查 24 字节的原始内容
[输入]
样本 outguess.data
[结果]
6D 69 73 74 2D 66 6F 72 65 6E 73 69 63 73 2D 70 72 6F 6F 66 00 FF 80 0A
[说明]
开头可读文本转成字节后，末尾四字节仍随原样保存。
:::

## 空文件与日志
<!-- sources: adapter -->

有的失败会创建零长目标文件，也会打印诊断。封装将零长目标从提取物中清理，依实际是否有非空输出判断该次恢复，再保留标准错误日志。

:::example 判断一条失败报告
[输入]
诊断发生且输出文件长度为 0
[结果]
无可用提取物
[说明]
空文件不能证明从 JPEG 中恢复了数据。
:::

## 保持原始压缩对象
<!-- sources: jpeg, up -->

另存、传输平台重压缩或改变质量通常会重新计算 JPEG 系数。看起来相同的图片字节并不相同，应从未重编码的原始 JPEG 复核。

## 常见误区

- OutGuess 的密钥不能替代 Steghide 或 JPHide 的配置。
- 日志有输出不代表已经恢复有效文件。
- JPEG 可见颜色相同不能证明原系数得以保留。

