---
capabilityId: op:Index%20of%20Coincidence
title: 重合指数
topicGroup: cipher-analysis
summary: 计算无放回取两个字母相同的概率，并区分原始、归一口径与样本边界。
aliases:
  - Index of Coincidence
  - IC
  - 字母重合指数
sources:
  - id: friedman
    title: The Index of Coincidence（解密档案）
    publisher: 美国国家安全局档案，经 Crypto Museum 保管
    url: https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf
    language: en
    kind: author-spec
    locator: 索引的定义与用于密码分析的概率
  - id: mtu
    title: Index of Coincidence
    publisher: Michigan Technological University / Ching-Kuang Shene
    url: https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-IOC.html
    language: en
    kind: official-doc
    locator: IC 公式与均匀分布基准
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Index of Coincidence 的计数与归一输出
---

## 介绍
<!-- sources: friedman, mtu -->

重合指数以样本为基础，估计选出两个不同位置时两处符号相同的概率。频率集中于少数符号时，抽中相同符号更容易。它适合描述重复程度，不能直接判断一段文字所属语言或经过何种变换。

## 无放回计数
<!-- sources: mtu, friedman -->

设样本长度为 n，第 i 种符号出现 fᵢ 次。分子为各类 fᵢ(fᵢ−1) 的和，分母为 n(n−1)。两个因子来自选取两个不同位置。若使用无序组合，分子分母同时除以二，结果相同。

:::example 两个字母各出现两次
[输入]
AABB
[结果]
IC = (2×1 + 2×1) ÷ (4×3) = 1/3
[说明]
12 个有序位置对中，AA、BB 各贡献两个同类位置对。
:::

## 字母样本的预处理
<!-- sources: worker, mtu -->

采用 26 个基本拉丁字母的公式时，需要先确定哪些位置计入样本。一个常见口径合并大小写，跳过数字、空白与标点。若另一套统计把非字母也计入，分母会改变，结果不宜直接比较。

:::example 大小写合并后再计数
[输入]
A-a A!
[结果]
保留的三个字母均为 a，IC = 1。
[说明]
连接号、空格和感叹号都不进入这个 26 字母口径。
:::

## 原始比例与归一化值
<!-- sources: mtu, worker -->

在 26 个符号各自独立均匀的总体假设下，匹配概率为 1/26，约为 0.03846。显示为 26 倍原始值时，该均匀基准变成 1。比较记录时要先分清数值来自原始比例还是缩放后的口径。

:::example 短样本的极端比较
[输入]
AAAA 与 ABCD，分别统计
[结果]
原始 IC：1 与 0。按 26 倍缩放后为 26 与 0。
[说明]
前者所有位置对都相同，后者没有相同的位置对。四个字母全不重复只说明本样本的分子为零。
:::

## 使用的边界
<!-- sources: friedman, mtu, worker -->

样本少于两个有效字母时，没有可抽的不同位置对，概率不可由该公式估计。界面若以 0 作为空结果或短样本占位，应将它与长度足够、实测无重复的 0 区分。分析较长文本时，可比较多个候选分组，而不凭单次接近某个经验值就判定算法。

## 常见误区

- 分母为 n(n−1)，不能用允许两次抽到同一位置的 n²。
- 原始 IC 与乘以字母表大小的归一化值是两种尺度。
- 没有重复的极短样本可以得 0。这个数值单凭自己不能证明加密、压缩或随机。
