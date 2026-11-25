---
capabilityId: op:Rabbit
title: Rabbit
topicGroup: modern
summary: 用 128 位密钥和可选 64 位 IV 初始化状态，每轮产生 16 字节密钥流。
aliases:
  - Rabbit
  - 八组状态与计数器生成密钥流
sources:
  - id: rabbit
    title: RFC 4503：A Description of the Rabbit Stream Cipher Algorithm
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4503.html
    language: en
    kind: standard
    locator: 第 2 节，附录 A 的大端向量
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相应操作的模式、字节表示与功能描述
---

## 介绍
<!-- sources: rabbit -->

Rabbit 是对称流密码。密钥先分配到八个状态变量及八个计数器。若有 IV，密钥准备后的状态还会接收一轮独立的 IV 设置流程。

## 计数器进位与状态更新
<!-- sources: rabbit -->

各计数器依次加常量和上一项的进位。每个状态与对应计数器相加后取平方，高低 32 位互相异或得到中间值。再经旋转和加法让邻近状态互相影响。

## 密钥流输出字序
<!-- sources: rabbit, chef -->

输出函数从状态字的高低部分选取位并异或组合。比较向量前需要确认字节的记录顺序。以下都采用大端展示。

:::example 无 IV 测试
[输入]
128 位全零密钥，无 IV，16 字节全零输入
[结果]
B15754F036A5D6ECF56B45261C4AF702
[说明]
附录 A.1 的第一组，零明文直接展示首个密钥流块。
:::

## 显式 IV 改变状态
<!-- sources: rabbit, chef -->

省略 IV 与提供全零 IV 是两种不同情形。后者调用 IV 设置并执行额外状态迭代，因而会得到新的密钥流。

:::example 显式给出 64 位零 IV
[输入]
128 位全零密钥，64 位全零 IV，16 字节全零输入
[结果]
C6A7275EF85495D87CCD5D376705B7ED
[说明]
附录 A.2 的第一组，输出与省略 IV 不同。
:::

## 加密、解密与认证
<!-- sources: rabbit, chef -->

密钥流按输入长度截取并异或。解密重复同一计算。Rabbit 本身没有认证标签，容器若声明完整性检查，需要另读其认证规则。

:::example 逆向还原短消息
[输入]
沿用显式零 IV 的配置，对同一对 2 字节数据应用两次 Rabbit
[结果]
01 FF → B6 12 → 01 FF
[说明]
两次都从同一个状态开始，异或掩码被抵消。短输入按应用的字节表示记录。
:::

## 常见误区

- 零 IV 与没有 IV 的状态不同。
- Rabbit 用 128 位密钥，不表示消息必须填充至 16 字节。
- 底层流密码不会验证消息是否被改动。

