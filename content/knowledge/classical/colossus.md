---
capabilityId: op:Colossus
title: 巨人密码破译机
topicGroup: classical
summary: 对五通道电传码及轮序列施加布尔条件，用计数筛选候选起点。
aliases:
  - Colossus
  - 对电传密文作差分与计数
  - 图尼
  - Tunny
  - 统计破译
sources:
  - id: museum
    title: Colossus
    publisher: 英国国家计算博物馆
    url: https://www.tnmoc.org/colossus
    language: en
    kind: official-doc
    locator: 复原装置与 Tunny 历史
  - id: lorenz
    title: Lorenz SZ-40/42
    publisher: Crypto Museum
    url: https://www.cryptomuseum.com/crypto/lorenz/sz40/
    language: en
    kind: author-spec
    locator: 轮组、传输与型号
  - id: tutte
    title: Bill Tutte’s 1+2=. Break In
    publisher: Virtual Colossus
    url: https://virtualcolossus.co.uk/pdf/Tutorial.pdf
    language: en
    kind: author-spec
    locator: 1+2 测试、χ 轮位置与计数
  - id: engine
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Colossus
  - id: source
    title: CyberChef 11.5.0 固定源码
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Colossus.mjs
    language: en
    kind: implementation
    locator: 操作的消息通路与轮配置
---

## 介绍
<!-- sources: museum, lorenz -->

Colossus 是二战英国用于分析洛伦兹电传密码的电子设备。光电读取纸带上的五个数据通道，机内生成候选密码轮序列。操作人员设定逻辑条件，再查看不同候选起点的计数。

## 相邻差分
<!-- sources: tutte -->

对第 t 个电传字符 Zₜ，差分定义为 ΔZₜ=Zₜ⊕Zₜ₋₁。两个相邻位置若共享同一段轮位输出，异或会抵消相同分量。五个数据位各有自己的差分。

:::example 五通道异或
[输入]
00101 → 00111 → 00011
[结果]
有效差分依序为 00010、00100
[说明]
只计算有前驱的两对位置。
:::

## 两路和测试
<!-- sources: tutte -->

Tutte 的 1+2 测试在每个位置取 ΔZ₁⊕ΔZ₂⊕Δχ₁⊕Δχ₂，累计结果等于零的位置。这里的 1、2 是通道编号。有效设置更可能暴露原电传消息与不规则轮组留下的微弱偏差。

:::example 四个位的计分
[输入]
ΔZ₁=1，ΔZ₂=1，Δχ₁=1，Δχ₂=1
[结果]
0；命中一次
[说明]
四个 1 异或得 0。
:::

## 计数与样本长度
<!-- sources: tutte, museum -->

比较计数时需要一致的测试区间。对独立公平位的教学模型，N 次判断约有 N/2 次为零，标准差是 √N/2。真实电传数据存在依赖关系，排序与进一步复算比照搬阈值更重要。

:::example 公平位基线
[输入]
对 400 个独立公平结果统计零位
[结果]
期望 200；标准差 10
[说明]
方差为 400×0.5×0.5=100。
:::

## 轮起点与搜索空间
<!-- sources: tutte, lorenz -->

χ₁ 有 41 个位置，χ₂ 有 31 个。逐对生成轮输出，再比较相同布尔条件的计数。得到突出点可以约束这两个轮，让后续测试在较小条件集合里进行。

:::example 两轮位置
[输入]
χ₁ 有 41 个候选，χ₂ 有 31 个候选
[结果]
1271 对
[说明]
乘积只涉及这两个轮。
:::

## 计数读数与复核
<!-- sources: engine, source, museum -->

教学模拟中的字符计数展示了最基本的计数路径。实际密码分析要进一步确认其他轮和换档状态，才能用匹配的电传解密器还原消息。

:::example 字符计数的独立输入
[输入]
Letter Count；输入 ABCABC；其余使用内置初值
[结果]
第一计数器为 6
[说明]
固定引擎收到完整参数表时返回该计数。
:::

## 常见误区

- 字符计数与条件计数对应不同问题。
- Colossus 的历史用途是分析洛伦兹密码，Enigma 分析有自己的设备和约束。
- 短样本中领先一分可能只是波动。
- 确定几只轮的起点后，仍须求出剩余轮和字符状态。

