---
capabilityId: op:XOR%20Brute%20Force
title: 穷举异或密钥
topicGroup: modern
summary: 对一个或两个字节的重复掩码枚举候选，用样例文本检查结果。
aliases:
  - XOR Brute Force
  - 单字节 XOR
  - 周期掩码
  - 已知明文片段
sources:
  - id: logic
    title: Dictionary of Algorithms and Data Structures — xor
    publisher: NIST
    url: https://xlinux.nist.gov/dads/HTML/xor.html
    language: en
    kind: official-doc
    locator: 异或真值表
  - id: bits
    title: CyberChef 11.5.0 — BitwiseOp
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs
    language: en
    kind: implementation
    locator: bitOp 与 xor，循环和差分更新顺序
  - id: engine
    title: CyberChef 11.5.0 — XOR Brute Force
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/XORBruteForce.mjs
    language: en
    kind: implementation
    locator: run()，样本、密钥范围和明文匹配
---

## 介绍
<!-- sources: logic, engine -->

短异或谜题常用一个字节或两个重复字节变换文字。穷举方法在有限的掩码集合内试算每个候选。给出预计出现的字词后，可以先保留包含它的样本结果，再用更多原文确认。

## 候选空间与已知片段
<!-- sources: logic, engine -->

一个字节含 8 位，理论上有 2⁸ = 256 种，两个字节含 16 位，共 2¹⁶ = 65536 种。固定实现从数值 1 开始枚举，实际分别检查 255 与 65535 个候选，省略全零掩码。可选的已知片段与转换出的文字使用小写形式比较，因此符合条件的结果可能不止一条。

## 采样偏移与密钥相位
<!-- sources: bits, engine -->

工具先取样本，再从样本的首字节开始使用密钥槽 0。若原数据的重复掩码长为 2，而样本从原数据偏移 1 开始，则样本所见的第一、第二个槽与原起点相比互换。候选密钥要对齐到原数据的起点，才能重算完整材料。

## 三种自制文字例题
<!-- sources: logic, bits, engine -->

以下均为自己构造的短谜题，采用普通重复异或。样本长度足以覆盖输入时，可以逐位核对打印的原文和掩码。缩短或移动样本会改变可以检查的证据。

:::example 固定的单字节掩码
[输入]
密文 68 65 6C 6C 6F，选单字节，已知片段 HELLO。
[结果]
密钥 20，文字 HELLO。
[说明]
第一个对应字节 68 ⊕ 48 = 20，其余四个位置均能用同一个掩码复原。
:::

:::example 二字节多候选
[输入]
密文 4D 40 47 46，选双字节，已知片段 LBF，从偏移 0 检查。
[结果]
0102 对应 LBFD，0122 对应 LbFd，2102 对应 lBfD，2122 对应 lbfd。
[说明]
大小写不敏感的筛选使这四条都符合样本，原题若要求精确保留大小写还需额外证据。
:::

:::example 移动同一例题的样本开始处
[输入]
使用 4D 40 47 46 双字节例，将样本起点改为 1、长度改为 3，已知片段 BFD。
[结果]
0201 对应 BFD，并有 0221、2201 和 2221 对应的不同大小写候选。
[说明]
样本实际读到 40 47 46。对这一段，原密钥 0102 的使用顺序是 02 01 02。
:::

## 候选的判读
<!-- sources: logic, engine -->

只有短片段的材料容易产生多解。其他行长、文字格式、已知文件头和谜题另给的约束可以共同判定。若全零掩码或更长周期也可能成立，需要单独考虑，因为它们不属于上述固定搜索范围。

## 常见误区

- 候选包含一个已知词不代表其他位置也正确。
- 样本开头出现的双字节顺序，需要按原位置对齐后才能用于整段数据。
- 空结果只说明该样本和约定中未找到符合筛选的候选。

