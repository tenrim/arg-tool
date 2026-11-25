---
capabilityId: native:number-integer
title: 大整数分解与数论
topicGroup: maths
summary: 用多精度运算求值与分解，理解试除、ECM 和平方筛的适用情形。
aliases:
  - ECM
  - SIQS
  - 整数因数分解
  - 正因数
  - 最大公因数
sources:
  - id: alpertron
    title: Integer factorization calculator
    publisher: Dario Alpern
    url: https://www.alpertron.com.ar/ECM.HTM
    language: en
    kind: author-spec
    locator: 整数表达式、ECM 与 SIQS
  - id: lenstra
    title: Factoring Integers with Elliptic Curves
    publisher: Hendrik W. Lenstra Jr.／Annals of Mathematics
    url: https://annals.math.princeton.edu/1987/126-3/p09
    language: en
    kind: author-spec
    locator: 椭圆曲线分解的原论文
  - id: qs
    title: A Pipeline Architecture for Factoring Large Integers with the Quadratic Sieve Algorithm
    publisher: Pomerance、Smith、Tuler
    url: https://math.dartmouth.edu/~carlp/pipeline.pdf
    language: en
    kind: author-spec
    locator: 平方同余与关系收集
  - id: catalog
    title: expansion/alpertron-catalog.js
    publisher: 迷雾工具箱
    url: /expansion/alpertron-catalog.js
    language: zh-CN
    kind: implementation
    locator: 整数求值、素性检验与分解入口
---

## 介绍
<!-- sources: alpertron, catalog -->

分解正整数是寻找相乘恰等于它的素数幂。计算器可精确求整数表达式，也可运行分解或独立的素性检验。

## 素数幂和因数个数
<!-- sources: alpertron -->

若 n=∏pᵢᵉⁱ，正因数对每个素数 pᵢ 都可独立取 0 至 eᵢ 次幂，所以数量为 ∏(eᵢ+1)。

:::example 分解并交叉核算
[输入]
360
[结果]
2³×3²×5；正因数数目 24
[说明]
乘回为 360，选择数为 4×3×2。
:::

## ECM 与较小素因数
<!-- sources: lenstra, alpertron -->

椭圆曲线法在模合数的运算中寻找可由最大公因数识别的非平凡因子。所需工作对待找因子自身的大小敏感。

:::example 固定引擎的 ECM 输出
[输入]
982451659877161571
[结果]
982451653 × 1000000007；正因数数目 4
[说明]
两个因子不同且均为素数。
:::

## 平方筛关系
<!-- sources: qs, alpertron -->

平方筛收集能分解为小素数幂的若干关系，通过组合使指数为偶数，得到 x²≡y² mod n。一旦两边给出可分解的差，用 gcd(x−y,n) 提取因子。

:::example 手算平方同余
[输入]
n=77，x=9，y=2
[结果]
81−4=77；gcd(7,77)=7
[说明]
另一因子为 77/7=11。
:::

## 表达式和检验
<!-- sources: alpertron, catalog -->

批量表达式可逐行求值。素性检验和因数分解是独立运行，超时或中途停止只保留已完成的证据。

:::example 整数表达式
[输入]
ModPow(3,4,7) 与 GCD(84,30)
[结果]
4 与 6
[说明]
81 模 7 得 4；84 与 30 的最大公因数是 6。
:::

## 常见误区

- 因数列表完成时可直接乘回验证。
- 未找到非平凡因子不能证明输入是素数。
- 整数表达式的除法是整数运算，不能当作一般小数计算器。

