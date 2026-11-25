---
capabilityId: op:Play%20Media
title: 播放媒体
topicGroup: video
summary: 区分文件识别、容器中流的编码和浏览器对该编码的解码。
aliases:
  - Play Media
  - 媒体容器
  - 编码
  - 媒体播放
sources:
  - id: html
    title: HTML Living Standard — Media elements
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/media.html
    language: en
    kind: standard
    locator: 媒体加载、canPlayType 和错误状态
  - id: r6381
    title: RFC 6381 — codecs and profiles parameters
    publisher: IETF／RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6381.html
    language: en
    kind: standard
    locator: 容器 MIME 与 codec 识别
  - id: view
    title: chef-tools/result-view.js
    publisher: 迷雾工具箱
    url: /chef-tools/result-view.js
    language: zh-CN
    kind: implementation
    locator: 媒体 Blob 与浏览器预览
  - id: engine
    title: vendor/cyberchef/catalogue.json
    publisher: 迷雾工具箱
    url: /vendor/cyberchef/catalogue.json
    language: zh-CN
    kind: implementation
    locator: Play Media
---

## 介绍
<!-- sources: html, engine, view -->

媒体预览把解出的原始字节交给浏览器的媒体元素。需要先识别文件属于音频或视频，再确认内部编码可以解码。播放器显示时间轴、图像与声音。

## 容器与编码
<!-- sources: r6381, html -->

容器负责组织一条或多条流，编码决定压缩后如何复现音频和画面。MIME 类型可以另带 codecs 信息来说明内部格式。

:::example 相同容器下的不同轨道
[输入]
video/mp4；一个含 AVC 与 AAC，另一个含其他编码
[结果]
扩展名相同，解码能力仍应结合各轨道
[说明]
RFC 6381 的 codec 参数可作明确描述。
:::

## 文件与文字输入
<!-- sources: engine, view -->

以文件导入可保留原字节。从 Base64 或十六进制文本提交时，须先把文本解到同一组字节。播放端读取的是这些字节，并按媒体类型预览。

:::example 两种写法的文件标识
[输入]
ASCII RIFF；十六进制 52 49 46 46
[结果]
两者可还原相同四字节
[说明]
单凭这四字节还不能确定内部是 WAV。
:::

## 确认解码发生
<!-- sources: html, view -->

媒体元素要先取得可读元数据，之后才能确定时长、轨道和是否能开始播放。文件名和可显示播放器不代表解码已经成功。

:::example 验证一个 PCM WAV
[输入]
8000 Hz、单声道、800 个采样点的 PCM WAV
[结果]
理论音频长 0.1 秒；媒体结果可创建预览元素
[说明]
800/8000=0.1，时长取决于真实 PCM 数据。
:::

## 播放与结构阅读
<!-- sources: html, r6381, view -->

预览输出解码后的播放内容。检查特定轨道、帧、附件或保存的元数据时，需按原容器结构单独读取。若浏览器报不支持，可保留原始结果。

## 常见误区

- 仅改文件名不会重新编码音视频。
- 能判断容器并不表示其中所有流都能播放。
- 直接预览过一遍不能替代对不可见轨道和文件数据的检查。

