---
capabilityId: native:forensics-image-survey
title: 图片隐写综合分析
topicGroup: image-stego
summary: 按图片格式安排互补检查，分辨元数据、像素、附加字节和候选线索。
aliases:
  - image-survey
  - AperiSolve
  - Aperi’Solve
  - Aperi'Solve
  - 图片自动分析
  - 图片线索分析
  - 图片隐写一键分析
sources:
  - id: adapter
    title: AperiSolve 分析器源码：registry
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/registry.py
    language: en
    kind: implementation
    locator: 分析器注册、适用输入与分派
  - id: plan
    title: 图片综合分析的步骤与格式选择
    publisher: 迷雾工具箱
    url: /forensics/image-plan.js
    language: zh-CN
    kind: implementation
    locator: surveyPlan、surveyOptions、各检查项的格式限制
  - id: png
    title: Portable Network Graphics (PNG) Specification
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG 签名、颜色类型、位深、IHDR 与 IEND
---

## 介绍
<!-- sources: adapter, plan -->

图片隐写综合分析把同一份原图交给多种互补的读取方式。总体报告常同时包含文件头、元数据、字节片段、位平面以及针对具体格式的隐写候选。不同结果需要按原始证据分别解释。

## 文件头决定适用检查
<!-- sources: plan, png -->

先从文件头判断实际格式，再选合适的分析器。改名不改变文件头。一般 PNG 与 JPEG 的编码结构不同，依赖原像素位或依赖原 JPEG 系数的检查不能混跑。

:::example 选择 PNG 的常规检查
[输入]
原始 64×32 RGB PNG，选择常规
[结果]
计划含 PNG 完整性与 zsteg；不含 JPEG 系数提取
[说明]
这是对同一文件按格式排出的检查项。
:::

## 不同报告看到的数据层
<!-- sources: adapter, plan, png -->

元数据读取解析标签和容器字段，字符串扫描遍历原字节，可能同时看到同一条标签。位平面则观察像素通道的一位，它不能替代压缩流或文档元数据的检查。

## 按格式扩展的深入检查
<!-- sources: plan, adapter -->

深入检查可增加文件雕刻、尾随分析、图像增强和适用的专用还原。进度中的未提取、失败和跳过有不同含义。目录生成的步骤和实际得到的结果需要分别判断。

:::example 比较 JPEG 的两种计划
[输入]
一张原 JPEG，依次选择常规和深入
[结果]
两种都可安排 JSteg；深入再加入 OutGuess、图像增强等项
[说明]
JPEG 不进入 zsteg 或 PNG 完整性步骤。
:::

## 按检查项复核结果
<!-- sources: plan, png -->

可在对应工具中带同一原文件查看完整参数或导出原字节。优先记录偏移、结构字段和能再次复现的候选。压缩流的偶然字符与完整提取物提供的证据强度不同。

:::example 文件扩展名不决定输入类型
[输入]
把 PDF 文件名改成 sample.png
[结果]
仍不进入图片分析计划
[说明]
图片入口检查格式签名，PDF 需要使用文档分析入口。
:::

## 常见误区

- 多工具同时看到同一个文本不代表存在多份独立线索。
- 格式跳过不同于检查完成且无命中。
- 检测出现候选后仍须从原始文件独立复核。

