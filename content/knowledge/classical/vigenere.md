---
capabilityId: pair:Vigen%C3%A8re%20Encode
title: "维吉尼亚"
topicGroup: "classical"
summary: "维吉尼亚多表替换密码的历史来源、方阵与模 26 规则、完整加解密实例及破译思路。"
aliases:
  - "Vigenère Encode"
  - "Vigenère Decode"
  - "维吉尼亚密码"
  - "多表替换密码"
  - "按循环密钥逐字母相加"
sources:
  - id: "pku"
    title: "密码学课件：置换密码与维吉尼亚密码"
    publisher: "北京大学信息科学技术学院"
    url: "https://www.icst.pku.edu.cn/zlian/docs/20181023161806486415.pdf"
    language: "zh-CN"
    kind: "official-doc"
    locator: "第 2–6 页：维吉尼亚密码定义、加密表与周期分析"
  - id: "cryptomuseum"
    title: "Vigenère cipher"
    publisher: "Crypto Museum（密码设备与历史研究）"
    url: "https://www.cryptomuseum.com/crypto/vigenere.htm"
    language: "en"
    kind: "author-spec"
    locator: "Bellaso 1553 起源、Blaise de Vigenère 命名沿革与多表替换结构"
  - id: "mtu-base"
    title: "The Vigenère Cipher"
    publisher: "密歇根理工大学计算机科学系（C.-K. Shene，NSF 密码可视化教程）"
    url: "https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-Base.html"
    language: "en"
    kind: "official-doc"
    locator: "Vigenère Tableau（方阵）与模 26 加解密代数公式"
  - id: "mtu-kasiski"
    title: "Kasiski's Method"
    publisher: "密歇根理工大学计算机科学系（C.-K. Shene，NSF 密码可视化教程）"
    url: "https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-Kasiski.html"
    language: "en"
    kind: "official-doc"
    locator: "重复密文段间距与最大公因数估计密钥长度"
  - id: "mtu-ioc"
    title: "Index of Coincidence"
    publisher: "密歇根理工大学计算机科学系（C.-K. Shene，NSF 密码可视化教程）"
    url: "https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-IOC.html"
    language: "en"
    kind: "official-doc"
    locator: "Friedman 重合指数定义、英文约 0.065 与均匀分布约 0.038 判别"
  - id: "engine"
    title: "本站固定版本的 Vigenère 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Vigenère Encode / Vigenère Decode：Key 参数定义"
  - id: "source"
    title: "CyberChef 11.5.0 固定源码 — VigenereEncode.mjs"
    publisher: "GCHQ CyberChef"
    url: "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/VigenereEncode.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：纯字母密钥校验、大小写保持与非字母跳过逻辑"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: pku, cryptomuseum -->

维吉尼亚密码（Vigenère Cipher）是古典密码学中最具代表性的多表替换密码。它使用一个重复循环的字母关键词，为明文不同位置上的字母分别施加不同的凯撒移位。同一个明文字母在不同位置往往会变成不同的密文字母，因此能打散单一字母频率特征。

该密码虽以十六世纪法国外交官布莱斯·德·维吉尼亚（Blaise de Vigenère）命名，但使用循环关键词配合多表替换的方案最早由意大利学者乔万·巴蒂斯塔·贝拉索（Giovan Battista Bellaso）于 1553 年发表；维吉尼亚本人在 1586 年提出的是更强的自密钥方案，后世长期将二者混淆并沿用至今。

由于能够抵御传统的单字母频率统计，维吉尼亚密码在长达约三百年间被称为“不可破译的密码”。直到十九世纪中后期卡西斯基试验与二十世纪初重合指数法相继建立，周期性循环密钥的弱点才被系统化攻破。

## 核心原理与模 26 规则
<!-- sources: pku, mtu-base -->

维吉尼亚密码将 26 个拉丁字母按顺序编号为 A=0、B=1、……、Z=25。设明文字母序列对应的编号为 p₀, p₁, p₂, …，长度为 m 的关键词字母编号为 k₀, k₁, …, kₘ₋₁。加密时，将关键词循环铺排到与明文字母等长，逐位执行模 26 加法：cᵢ = (pᵢ + k_(i mod m)) mod 26。

解密时沿用相同的关键词循环序列，逐位执行模 26 减法：pᵢ = (cᵢ − k_(i mod m) + 26) mod 26。在手工计算或纸笔演示中，这一过程等价于查阅 26×26 的维吉尼亚方阵（Tabula Recta）：以密钥字母为行、明文字母为列，行列交叉处即为密文字母；解密时则在对应密钥行中找到密文字母，再向上读出列首的明文字母。

从结构上看，关键词的每一个字母都等价于一次独立的凯撒移位：A 表示移位 0（保持不变），B 表示移位 1，依此类推至 Z 表示移位 25。当关键词长度为 1 时，维吉尼亚密码退化为普通凯撒移位；当关键词为真正随机且与明文等长、绝不重复使用时，它演化为理论上具备完善保密性的一次性密码本。

:::example 字母编号与位移对照
[输入]
A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12
N=13, O=14, P=15, Q=16, R=17, S=18, T=19, U=20, V=21, W=22, X=23, Y=24, Z=25
[结果]
加密：c = (p + k) mod 26
解密：p = (c − k + 26) mod 26
[说明]
减法得到负数时须加上 26 折回 0–25 区间。例如密文 F(5) 减去密钥 M(12) 得 −7，加 26 后为 19，对应明文字母 T。
:::

## 加密示例
<!-- sources: mtu-base, source -->

以密码学教材中的经典明文 ATTACKATDAWN 与关键词 LEMON 为例。关键词长度为 5，循环展开后与 12 个明文字母对齐为 LEMONLEMONLE。逐位将明文编号与密钥编号相加并对 26 取余，即可得到完整密文 LXFOPVEFRNHR。

注意明文中第 2 位和第 3 位都是 T，但对应密钥分别为 E(4) 与 M(12)，加密后分别得到 X 与 F；而第 3 位 T+M 与第 8 位 T+M 在不同位置恰好都得到 F。这直观体现了多表替换“同明文可映不同密文、同密文也可来自不同明文”的特征。

:::example 纯字母逐位加密手算
[输入]
明文：ATTACKATDAWN
关键词：LEMON（展开：L E M O N L E M O N L E）
[结果]
A(0)+L(11)=11→L，T(19)+E(4)=23→X，T(19)+M(12)=31≡5→F，A(0)+O(14)=14→O
C(2)+N(13)=15→P，K(10)+L(11)=21→V，A(0)+E(4)=4→E，T(19)+M(12)=31≡5→F
D(3)+O(14)=17→R，A(0)+N(13)=13→N，W(22)+L(11)=33≡7→H，N(13)+E(4)=17→R
最终密文：LXFOPVEFRNHR
[说明]
每个括号内为 0–25 编号；相加达到或超过 26 时减去 26。
:::

:::example 含空格、大小写与数字的实测
[输入]
明文：Meet at 09:00!
关键词：KEY
[结果]
Wicd er 09:00!
[说明]
M+K→W、e+E→i、e+Y→c、t+K→d；遇到空格时原样保留且密钥停留在 E；随后 a+E→e、t+Y→r；末尾的空格、09:00! 均原样输出，字母大小写保持不变。
:::

## 解密与还原步骤
<!-- sources: mtu-base, engine, source -->

已知关键词时，解密将操作方向切换为 Vigenère Decode，并填入与加密完全一致的 Key。对于密文 LXFOPVEFRNHR 与关键词 LEMON，逐位用密文编号减去展开后的密钥编号，遇负数加 26 即可还原明文 ATTACKATDAWN。

若错把密文再次送入编码方向，相当于又加了一次密钥移位，无法得到原文。含非字母字符的密文（如 Wicd er 09:00!）在解码时同样会跳过空格、数字和标点而不推进密钥，因此只要不擅自删改原始格式，就能精确还原。

:::example 带负余数折回的解码核对
[输入]
密文：LXFOPVEFRNHR
关键词：LEMON
[结果]
L(11)−L(11)=0→A，X(23)−E(4)=19→T，F(5)−M(12)=−7+26=19→T，O(14)−O(14)=0→A
P(15)−N(13)=2→C，V(21)−L(11)=10→K，E(4)−E(4)=0→A，F(5)−M(12)=−7+26=19→T
R(17)−O(14)=3→D，N(13)−N(13)=0→A，H(7)−L(11)=−4+26=22→W，R(17)−E(4)=13→N
还原明文：ATTACKATDAWN
[说明]
编码与解码不是自反关系（除非密钥全为 A 或 N），方向必须与任务一致。
:::

## 无密钥分析思路
<!-- sources: pku, mtu-kasiski, mtu-ioc -->

在没有直接给出关键词时，破译标准维吉尼亚密文通常分两步：先确定关键词长度（周期 m），再把密文按模 m 分成 m 列，每一列本质上都是单一偏移量的凯撒密码，可分别用英文频率分布或卡方统计恢复对应密钥字母。

卡西斯基试验（Kasiski Examination，1863 年发表）通过寻找密文中重复出现的三字母及以上片段来估计周期：若相同明文片段恰巧落在相同的密钥相位上，就会生成相同的密文片段，因此多组重复片段之间的间距往往拥有共同因数，该公因数即是候选密钥长度。

弗里德曼重合指数法（Index of Coincidence，IC）通过统计文本中任取两字母相同的概率来量化分布陡峭程度：标准英文文本的 IC 约为 0.065，而均匀随机字母流约为 0.038。逐一测试候选周期 m，将密文按列拆分并计算各列平均 IC，当各列平均 IC 显著回升到接近 0.065 时，该 m 极可能是真实密钥长度。

## 解谜应用
<!-- sources: pku, mtu-ioc, engine, source -->

在 ARG 与解谜题中，维吉尼亚密文通常表现为一段看似无规律、但字频较平滑的纯拉丁字母串，且题面、图片文件名、网页注释、剧情人名或上一关答案里常暗藏一个单词作为密钥。与凯撒移位不同，对维吉尼亚密文做 26 次整体穷举不会出现可读英文。

保留空格的密文需要区分两种计位规则。一种从遇到的字母依次取密钥，另一种按原文本位置取密钥。在第一个空格之前，两种规则可能得到同样的结果。

若题面完全未给密钥且密文足够长（通常数十至上百字母以上），可结合字频分析与重合指数工具先定周期再逐列还原；若解密后仍不通顺，还需排查是否属于变体——如博福特密码（Beaufort，采用 k−p 减法）、自密钥密码（Autokey，用明文自身续接密钥）或改用自定义字母表顺序的变体。

## 常见误区

- 维吉尼亚加密与解密不是同一个操作；拿密文再执行一次编码不会还原明文，必须切换到解码方向。
- 有些变体按原文位置推进密钥，即使本位是空白。跳过非字母的算法遇到这类密文时，后续字母可能发生错位。
- 单看密文中两个相同字母不能断定明文相同，反之明文相同也不一定对应相同密文，因为移位取决于当前所处的密钥周期位置。
- 当密钥长度过短或密文较长时，维吉尼亚密码并不安全；卡西斯基试验与重合指数法可以不靠暴力枚举直接推出密钥周期。
