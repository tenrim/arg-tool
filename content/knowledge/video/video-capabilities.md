---
capabilityId: native:video-capabilities
title: FFmpeg 核心能力与帮助
topicGroup: video
summary: 按固定二进制的实际帮助确认封装、解码、编码与滤镜能力。
aliases:
  - FFmpeg 帮助
  - 编解码器列表
  - WASM 能力清单
sources:
  - id: ff
    title: ffmpeg Documentation
    publisher: FFmpeg
    url: https://ffmpeg.org/ffmpeg.html
    language: en
    kind: official-doc
    locator: Generic options 的 -version、-h、-formats、-codecs、-filters、-protocols
  - id: local
    title: 浏览器媒体运行模块
    publisher: 迷雾工具箱
    url: /video/runtime.js
    language: zh-CN
    kind: implementation
    locator: capabilities 的八组实际输出
  - id: wasm
    title: ffmpeg.wasm Overview
    publisher: ffmpeg.wasm
    url: https://ffmpegwasm.netlify.app/docs/overview/
    language: en
    kind: official-doc
    locator: 核心编译与浏览器运行架构
---

## 介绍
<!-- sources: ff, wasm -->

FFmpeg 的可用能力与二进制编译配置有关。桌面程序可用的编码器或协议，浏览器中的 WebAssembly 构建未必具备。帮助清单由实际运行的核心打印，包含判断当前工具能否执行某类处理所需的分类。

## 封装、解码与编码
<!-- sources: ff, local -->

格式清单描述容器的读写支持，编解码器清单则描述轨道与裸样本间的转换。能解析容器不必然意味着能解码其中每种轨道。能解码某个编码也不必然具备对它重新编码的能力。

:::example 分别查读写能力
[输入]
计划读取一种编码，并重编码为另一种格式。
[结果]
需同时核对输入封装和解码器、目标编码器和目标封装。
[说明]
解码和编码分属两个清单，目标扩展名本身不能证明两者存在。
:::

## 过滤器参与的环节
<!-- sources: ff, wasm -->

滤镜在解码后改变画面或音频样本。纯流复制不走这一环节。希望使用某一滤镜时可先确认编译核心列出该名称，再查具体选项和适用类型。

:::example 保持编码与缩放
[输入]
对一条视频要求同时流复制和缩放画面。
[结果]
缩放要求取得并修改解码后的像素，输出视频需重新编码。
[说明]
流复制的输入为编码包，像素滤镜的输入为解码帧。
:::

## 版本和完整帮助
<!-- sources: ff, local -->

报告由固定核心依次查询版本、格式、编解码器、编码器、解码器、滤镜、协议和完整帮助。版本字段有助于解释不同构建的差异。帮助模式无需附带媒体。

:::example 导出运行版能力
[输入]
在本地浏览器运行环境请求完整能力报告。
[结果]
得到 ffmpeg-capabilities.txt，其中含 Encoders: 标题。
[说明]
编码器清单来自运行中的 WASM 核心。
:::

## 编译能力与任务限制
<!-- sources: ff, local, wasm -->

核心编译时列出的访问协议和容器种类是一层约束，具体任务对输入的范围是另一层约束。即使报告列出了某协议，也要看此任务的文件来源和运行环境是否允许使用它。FFmpeg 的帮助可用于复核命令所属阶段。

## 常见误区

- 桌面 FFmpeg 网页列表不必和浏览器执行版相同。
- 编解码器出现不意味着同名编码和解码都可执行。
- 能力清单说明构建内容，某份媒体是否成功还需检查流与参数。
