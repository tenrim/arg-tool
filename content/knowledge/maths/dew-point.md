---
capabilityId: native:dew-point
title: 露点与结露
topicGroup: maths
summary: 由温度和相对湿度恢复水汽压，计算露点并核对表面是否达到凝结温度。
aliases:
  - 露点温度
  - 相对湿度
  - 结露
  - 水汽压
sources:
  - id: humid
    title: Relative Humidity and Dewpoint Temperature
    publisher: U.S. National Weather Service
    url: https://www.weather.gov/media/epz/wxcalc/rhTdFromWetBulb.pdf
    language: en
    kind: official-doc
    locator: 指数型饱和蒸气压、相对湿度比例和露点反解
  - id: model
    title: 日常物理计算公式实现
    publisher: 迷雾工具箱
    url: /practical/everyday-model.js
    language: zh-CN
    kind: implementation
    locator: calculateEveryday 和标准大气及饱和模型
---

## 介绍
<!-- sources: humid -->

在空气水汽量基本不变的情况下，冷却会使水汽更接近饱和。露点是水汽刚达到液态水饱和的温度。空气温度、露点和某个物体表面的温度分别代表不同条件。

## 用相对湿度求实际水汽压
<!-- sources: humid, model -->

以摄氏气温 T 计算饱和水汽压 eₛ=6.112 exp(17.67T/(T+243.5))，单位 hPa。相对湿度 RH 以百分数给出，实际水汽压 e=(RH/100)eₛ。

:::example 从 20 °C 与一半湿度算水汽压
[输入]
气温 20 °C，相对湿度 50%。
[结果]
饱和水汽压约 23.3695 hPa，实际约 11.6847 hPa。
[说明]
实际水汽压取同温度的饱和值的一半。
:::

## 从水汽压求露点
<!-- sources: humid, model -->

令 γ=ln(e/6.112)，则露点 Tᵈ=243.5γ/(17.67−γ)。这里用自然对数，结果为摄氏度。以液态水饱和公式反解得到的零下数值仍是露点，霜点需引用相对冰面的饱和关系。

:::example 零摄氏度的空气未饱和
[输入]
空气 0 °C，相对湿度 50%。
[结果]
实际水汽压 3.056 hPa，露点约 −9.1913 °C。
[说明]
代入 γ=ln(0.5) 即可反求。
:::

## 表面与露点
<!-- sources: humid, model -->

在给定空气状态下，表面温度低于或等于露点时可以达到饱和凝结条件。表面在露点边界时，能否看到水滴还与换热、停留时间及表面状态有关。

:::example 玻璃两种表面温度
[输入]
空气 20 °C、RH 50%，玻璃表面分别为 8 °C 和 12 °C。
[结果]
露点约 9.2701 °C。8 °C 达到凝结温度条件，12 °C 未达到。
[说明]
两个表面各自与同一空气状态的露点相比。
:::

## 饱和状态的校验
<!-- sources: humid, model -->

相对湿度达到 100% 时，实际水汽压等于同温度的饱和值。同一公式反解后应返回空气温度。对公式拟合范围之外的环境，应选择合适的热力学关系而不要外推精度。

## 常见误区

- 相对湿度需要与空气温度一起使用。
- 露点并非当前气温的百分数。
- 表面达到露点只满足温度条件，还不能保证已形成可见液滴。
