---
capabilityId: pair:Affine%20Cipher%20Encode
title: "仿射密码"
topicGroup: "classical"
summary: "仿射单表替换密码的模 26 线性变换、互素条件与模逆元表、完整加解密实例及破译思路。"
aliases:
  - "Affine Cipher Encode"
  - "Affine Cipher Decode"
  - "仿射加密"
  - "线性同余替换"
  - "线性同余映射字母表"
sources:
  - id: "nku"
    title: "Section 7: Affine Ciphers"
    publisher: "北肯塔基大学数学与统计系（Chris Christensen 密码学讲义）"
    url: "https://www.nku.edu/~christensen/section%207%20affine%20ciphers.pdf"
    language: "en"
    kind: "official-doc"
    locator: "仿射变换定义、互素条件、312 密钥空间与两点方程破译"
  - id: "britannica"
    title: "Substitution cipher"
    publisher: "Encyclopædia Britannica（大英百科全书）"
    url: "https://www.britannica.com/topic/substitution-cipher"
    language: "en"
    kind: "official-doc"
    locator: "单表替换密码定义与字母频率特征"
  - id: "affine"
    title: "Affine 中文算法说明"
    publisher: "DenCode（该转换器作者文档）"
    url: "https://dencode.com/zh-cn/cipher/affine"
    language: "zh-CN"
    kind: "author-spec"
    locator: "关于该算法：加密与解密公式及参数说明"
  - id: "practical"
    title: "Affine Cipher"
    publisher: "Practical Cryptography（古典密码参考手册）"
    url: "https://practicalcryptography.com/ciphers/classical-era/affine/"
    language: "en"
    kind: "author-spec"
    locator: "Encryption / Decryption / Cryptanalysis"
  - id: "engine"
    title: "本站固定版本的 Affine Cipher 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Affine Cipher Encode / Affine Cipher Decode：a、b 参数定义"
  - id: "source"
    title: "CyberChef 11.5.0 固定源码 — AffineCipherEncode.mjs"
    publisher: "GCHQ CyberChef"
    url: "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/AffineCipherEncode.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：非负整数校验、gcd(a, 26)=1 校验与大小写保持逻辑"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: nku, britannica -->

仿射密码（Affine Cipher）是一类基于模算术线性函数的单表替换密码。它将字母表中的每个字母转换为数字序号后，先乘以密钥参数 a，再加上偏移量 b，最后对字母表长度取模，从而得到密文字母。

从结构上看，仿射密码把“乘法密码”与“凯撒移位密码”合并为同一种数学模型：当乘数 a = 1 时，仿射密码退化为偏移量为 b 的凯撒移位；当 a = 25 且 b = 25 时，它恰好等价于首尾镜像互换的埃特巴什密码（Atbash）。

虽然仿射密码比单纯的凯撒移位多了一个乘法参数，但它仍然属于单表替换密码——明文中相同的字母始终映射到相同的密文字母，因此完整保留了原文的字母频率分布与词长结构，在现代不具备实际保密强度。

## 核心原理与可逆条件
<!-- sources: nku, practical -->

针对 26 个标准拉丁字母，先将 A–Z 依次编号为 0–25。给定乘数 a 与偏移量 b，加密函数为 E(x) = (ax + b) mod 26。解密需要撤销加法与乘法两步操作，公式为 D(y) = a⁻¹(y − b) mod 26，其中 a⁻¹ 是 a 在模 26 下的乘法逆元，满足 (a × a⁻¹) mod 26 = 1。

要保证每个密文字母都能唯一还原为原来的明文字母，映射必须是一一对应的双射。数论结论表明，这要求乘数 a 必须与模数 26 互素，即最大公约数 gcd(a, 26) = 1。由于 26 = 2 × 13，因此 a 不能是偶数，也不能是 13 的倍数。

在 0 到 25 范围内，与 26 互素的乘数恰好只有 12 个；偏移量 b 可取 0 到 25 中的任意 26 个值。两者相乘，标准拉丁字母仿射密码的有效密钥空间总计 12 × 26 = 312 种（若排除恒等映射 a = 1、b = 0，则为 311 种有效密钥）。

:::example 模 26 下全部 12 组有效乘数与模逆元对照
[输入]
有效乘数 a（满足 gcd(a, 26) = 1，共 12 个）
[结果]
1 ↔ 1，3 ↔ 9，5 ↔ 21，7 ↔ 15，9 ↔ 3，11 ↔ 19
15 ↔ 7，17 ↔ 23，19 ↔ 11，21 ↔ 5，23 ↔ 17，25 ↔ 25
[说明]
每对数字互为模 26 乘法逆元，例如 5 × 21 = 105 = 4×26 + 1 ≡ 1 (mod 26)。若误选 a = 2 或 a = 13，不同明文字母会撞到同一个密文字母（如 a = 2 时 A(0) 与 N(13) 都映到 b），信息不可逆丢失。
:::

## 加密示例
<!-- sources: affine, practical, source -->

以经典教学明文 AFFINE CIPHER 为例，取参数 a = 5、b = 8。逐字母代入 E(x) = (5x + 8) mod 26，空格原样保留，即可得到密文 IHHWVC SWFRCP。

当输入包含混合大小写、标点与数字时（如 Hello, Mist-2026!），只有英文字母参与线性替换并各自保持原大小写，其余字符不受影响。

:::example 逐字母加密手算（a=5，b=8）
[输入]
明文：AFFINE CIPHER
参数：a = 5，b = 8
[结果]
A(0)：(5×0 + 8) = 8 → I
F(5)：(5×5 + 8) = 33 ≡ 7 → H（两个 F 均映射为 H）
I(8)：(5×8 + 8) = 48 ≡ 22 → W
N(13)：(5×13 + 8) = 73 ≡ 21 → V
E(4)：(5×4 + 8) = 28 ≡ 2 → C
空格保留，同理 CIPHER → SWFRCP
最终密文：IHHWVC SWFRCP
[说明]
注意两个连续的 F 映射后仍是两个连续的 H，体现了单表替换保留重复字母结构的特征。
:::

:::example 混合大小写、数字与标点实测（a=7，b=3）
[输入]
明文：Hello, Mist-2026!
参数：a = 7，b = 3
[结果]
Afccx, Jhzg-2026!
[说明]
H(7)→(49+3)=52≡0→A，e(4)→(28+3)=31≡5→f；大小写各自保留，逗号、空格、连字符、2026 与感叹号均原样输出。
:::

## 解密与还原步骤
<!-- sources: nku, affine, source -->

手工解密时，先查表求出 a 的模 26 逆元 a⁻¹，再对每个密文字母序号 y 计算 D(y) = a⁻¹(y − b) mod 26。遇到 (y − b) 为负数时，可先加上 26 变为非负数再乘以 a⁻¹，或将最终负余数不断加 26 折回 0–25 区间。

:::example 手工解密 IHHWVC（a=5，b=8，模逆元 a⁻¹=21）
[输入]
密文：IHHWVC
参数：a = 5（逆元 21），b = 8
[结果]
I(8)：21×(8 − 8) = 0 → A
H(7)：21×(7 − 8) = −21 ≡ 5 → F
W(22)：21×(22 − 8) = 294 ≡ 8 → I
V(21)：21×(21 − 8) = 273 ≡ 13 → N
C(2)：21×(2 − 8) = −126 ≡ 4 → E
还原明文：AFFINE
[说明]
−21 + 26 = 5 对应 F；−126 + 5×26 = 4 对应 E。
:::

## 破译思路与解谜应用
<!-- sources: nku, britannica, practical, engine -->

26 字母表上共有 12 个与 26 互素的乘数和 26 个偏移，所以至多有 312 种不同的仿射置换。可以逐一生成候选，再按字频或语言特征比较。文本很短时可能出现多个合理结果，字频排序只提供筛选依据。

在纸笔推演或已知部分明文（如题面给出某个固定前缀、格式头或高频字母对应关系）时，只需知道两组明密文对应关系 (x₁, y₁) 与 (x₂, y₂)，即可联立模 26 同余方程组：ax₁ + b ≡ y₁、ax₂ + b ≡ y₂。两式相减消去 b 得 a(x₁ − x₂) ≡ y₁ − y₂ (mod 26)，解出 a 后回代即得 b。

仿射替换保留双写字母的位置与各词的长度，这些特征也可出现在其他单表替换中。如果题面同时给出斜率、截距或线性式 y = ax + b，可检验能否用同一对乘数与偏移解释多个已知字母对。

## 常见误区

- 乘数 a 不能随便取任意整数，必须与 26 互素（只能取 1、3、5、7、9、11、15、17、19、21、23、25 及其加 26 的倍数），否则映射不可逆。
- 负偏移 −3 与正偏移 23 相差一个完整的字母表周期，在模 26 下效果相同。
- 凯撒移位（a = 1）与埃特巴什密码（a = 25、b = 25）都只是仿射密码的特例，因此仿射密码同样保留字频特征，无法抵御频率分析或 312 次穷举。
- 仿射密码只转换 26 个英文字母，不会对数字、空格或汉字做线性运算。
