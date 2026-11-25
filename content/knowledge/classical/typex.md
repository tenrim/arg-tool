---
capabilityId: op:Typex
title: Typex 密码机
topicGroup: classical
summary: 三只移动轮、两只静止轮和反射器共同形成可往返的字母映射。
aliases:
  - Typex
  - 带静止轮的五转子机器
  - 反射器
sources:
  - id: artifact
    title: Typex
    publisher: Crypto Museum
    url: https://www.cryptomuseum.com/crypto/uk/typex/
    language: en
    kind: author-spec
    locator: 原机照片、轮与反射器
  - id: museum
    title: Menus and Cribs
    publisher: 英国国家计算博物馆
    url: https://www.tnmoc.org/bh-16-menus-and-cribs
    language: en
    kind: official-doc
    locator: 作为核验机器的改装 Typex
  - id: guide
    title: Enigma, the Bombe, and Typex
    publisher: GCHQ CyberChef
    url: https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7
    language: en
    kind: official-doc
    locator: Typex 和接线历史
  - id: engine
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Typex
  - id: source
    title: CyberChef 11.5.0 固定源码
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Typex.mjs
    language: en
    kind: implementation
    locator: 操作的消息通路与轮配置
---

## 介绍
<!-- sources: artifact, museum -->

Typex 是英国采用的机电转子密码机系列。其可辨认的共同设计是五只接线转子和反射器，历史上也有为核验恩尼格玛候选而专门改装的设备。

## 静止轮与步进轮
<!-- sources: artifact, guide -->

两只静止轮处于信号路径中，保持其旋转位置。其余三只轮随输入改变位置，轮的缺口参与推进判断。静止和运动描述的是状态变化。

## 反射与信号返回
<!-- sources: artifact, source -->

信号经轮组的当前映射到达反射器，再沿轮组的逆接线返回。若正向轮组映射为 F、反射映射为 R，同一瞬间整体为 F⁻¹RF；R 自反时整体也自反。

:::example 固定一刻的简化轮
[输入]
F(A)=B，F(C)=D；反射器配对 B↔D
[结果]
A↔C
[说明]
信号从 A 到 B，经反射到 D，再逆查 C。
:::

## 轮方向、环位与窗口
<!-- sources: artifact, guide, source -->

轮方向改变接线路径；环设定改变环标记与转子芯的相对关系；起始窗口决定开始时的位置。不同机型的轮、反射器和插接结构有差别，观察到相同窗位不足以确认机器状态。

## 从同一初始状态复算
<!-- sources: engine, source -->

以下为 Example 1 至 5、初始位置和环位均为 A、示例反射器、无插线及 Keyboard Emulation 为 None 的小样本。每例重新从初值开始。

:::example 往返复算
[输入]
HELLO
[结果]
PDEBF；重新从初值输入 PDEBF 得 HELLO
[说明]
反射结构在相同步进状态下给出逆作用。
:::

:::example 连续重复
[输入]
AAAAA
[结果]
TNTOW
[说明]
首尾位置各自使用当前轮映射。
:::

:::example 同一前缀
[输入]
AB 和 ABC
[结果]
TT 和 TTV
[说明]
两条消息重置后共享前两个轮状态。
:::

## 五字组和历史机型
<!-- sources: artifact, engine, source, museum -->

密文五字分组便于抄录，补入的空格不应盲目当成额外一个密码字母。来自展品或记录的轮型号、印记和插接图更能区分真正的机械设定。

## 常见误区

- 保持静止的轮仍改变所有经过它的接线。
- 使用改装 Typex 验证 Enigma 候选不等于两类机器日常配置互通。
- 接收方必须复现消息起始位置和步进。
- 五字组的视觉间距应与实际字符位置分别追踪。

