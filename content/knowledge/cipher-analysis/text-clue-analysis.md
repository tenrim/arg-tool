---
capabilityId: native:cipher-detect
title: 文本线索分析
topicGroup: cipher-analysis
summary: 尝试与文本特征相符的转换，保留可复跑的路径、候选与未完成原因。
aliases:
  - 密文智能识别
  - 密文识别
  - IC
  - 字频
  - 启发式
  - 跨工具分析
sources:
  - id: magic
    title: Automatic detection of encoded data using CyberChef Magic
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic
    language: en
    kind: author-spec
    locator: 识别模式、候选递归、语言统计与熵
  - id: session
    title: 文本线索的流程与任务图
    publisher: 迷雾工具箱
    url: /clue-analysis/session.js
    language: zh-CN
    kind: implementation
    locator: createAnalysisSession 的层序、去重和停止
  - id: profiles
    title: 跨工具解谜策略
    publisher: 迷雾工具箱
    url: /clue-analysis/puzzle-profiles.js
    language: zh-CN
    kind: implementation
    locator: 字节、整数、键盘、古典密码与手动条件
  - id: adapters
    title: 本地词与符号转换适配
    publisher: 迷雾工具箱
    url: /clue-analysis/local-adapters.js
    language: zh-CN
    kind: implementation
    locator: 统计和确定性转换的输出形态
  - id: stats
    title: 重复图样、重合指数和移位评分
    publisher: 迷雾工具箱
    url: /round1/analysis-engine.js
    language: zh-CN
    kind: implementation
    locator: wordPattern、partialDecode、validateMap、ic、analyze
  - id: ic
    title: The Index of Coincidence
    publisher: National Security Agency／Crypto Museum 档案
    url: https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf
    language: en
    kind: author-spec
    locator: 单样本中重复概率与多个类别的比较
  - id: b64
    title: RFC 4648：Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 4 节 Base64
---

## 介绍
<!-- sources: session, adapters -->

文本线索分析把已有的文字、编码和古典密码转换关联起来。它试做可执行的变换，以新结果继续探索，同时记录每段结果怎样从原文获得。

## 筛选候选与真正执行
<!-- sources: magic, adapters, b64 -->

字符集、长度和分组符合某个表示时，先产生候选解释，再运行读取工具。比如四字符长的字母数字串可以符合 Base64，也仍可能只是普通代号。

:::example 从文本到三字节
[输入]
QUJD
[结果]
按 Base64 可还原为 ABC
[说明]
这个路径成立同时，仍需要题面确认原串确有编码意图。
:::

## 跨工具继续处理
<!-- sources: session, profiles, adapters -->

同一候选节点可以交给别的适用工具。比如无线电拼读词组用拼读表读取；五位报码会检查适用字表与分组；字节结果如不能合法解码，不应被强制显示成替代字符。

:::example 跨两种工具的路径
[输入]
QWxmYSBCcmF2byBDaGFybGll
[结果]
Base64 → Alfa Bravo Charlie → ABC
[说明]
第二步使用拼读字母表，不是再重复 Base64。
:::

## 重合指数与候选排序
<!-- sources: ic, stats -->

重合指数比较从 A–Z 子样本不放回抽两个字符时相同的比例。若某字母频数为 f，长度为 N，其贡献计为 f(f−1)，总数除以 N(N−1)。熵和按英语频率算的评分另有其统计口径。

:::example 手算小样本的 IC
[输入]
AABA
[结果]
IC=0.5
[说明]
A 出现三次、B 一次，分子 3×2+1×0=6，分母 4×3=12。
:::

## 深度、去重与手动条件
<!-- sources: session, profiles, adapters -->

每段结果可由不同路径到达。重复的结果与相同转换以其内容和条件复用，路径证据仍保留。深度规定每条路径可经过的步骤，不等于只尝试相同数目的候选。需要秘密密钥、明确方阵或编码变体的步骤，可以补入已知条件再继续。

## 候选与观察结果
<!-- sources: magic, session, stats -->

报告可包括候选正文、统计或字词报告、已失败的步骤和达到预算的分支。统计提示和候选正文需要分开看。相同预览文字可以来自不同转换，最终以完整结果和路径中的原始输入输出核对。

## 常见误区

- 自动搜索未命中不证明原文本不存在解码。
- 英语字频无法稳定判断任意语言或很短的密文。
- 中间结果含任意二进制时，不应一律当成 UTF-8。

