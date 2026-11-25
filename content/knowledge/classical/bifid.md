---
capabilityId: pair:Bifid%20Cipher%20Encode
title: "双分密码"
topicGroup: "classical"
summary: "双分密码的波利比奥斯方阵构造、坐标拆分与重组机制、完整加解密实例及与分周期变体的区别。"
aliases:
  - "Bifid Cipher Encode"
  - "Bifid Cipher Decode"
  - "二分密码"
  - "波利比奥斯方阵坐标重排"
  - "按波利比奥斯坐标分合"
sources:
  - id: "cryptomuseum"
    title: "Bifid cipher"
    publisher: "Crypto Museum（密码设备与历史研究）"
    url: "https://www.cryptomuseum.com/crypto/bifid"
    language: "en"
    kind: "author-spec"
    locator: "Félix Delastelle 1901 发明背景与双分加密结构"
  - id: "practical"
    title: "Bifid Cipher"
    publisher: "Practical Cryptography（古典密码参考手册）"
    url: "https://practicalcryptography.com/ciphers/classical-era/bifid/"
    language: "en"
    kind: "author-spec"
    locator: "5×5 Polybius 方阵、坐标拆分重组、周期与破译思路"
  - id: "britannica"
    title: "Cryptology — Classical Fractionation and Polybius Square"
    publisher: "Encyclopædia Britannica（大英百科全书）"
    url: "https://www.britannica.com/topic/cryptology"
    language: "en"
    kind: "official-doc"
    locator: "波利比奥斯方阵与分数化替换扩散原理"
  - id: "engine"
    title: "本站固定版本的 Bifid Cipher 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Bifid Cipher Encode / Bifid Cipher Decode：Keyword 参数定义"
  - id: "source"
    title: "CyberChef 11.5.0 站内镜像源码 — BifidCipherEncode.mjs"
    publisher: "GCHQ CyberChef / Matt C"
    url: "/vendor/knowledge/cyberchef/src/core/operations/BifidCipherEncode.mjs"
    upstreamUrl: "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/BifidCipherEncode.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：5×5 方阵生成、整段拼接 yCo+xCo、大小写保留与 J 处理细节"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: cryptomuseum, practical, britannica -->

双分密码（Bifid Cipher，也译作二分密码）由法国密码学者费利克斯·德拉斯特尔（Félix Delastelle）于 1901 年左右发明，是一种将“替换”与“换位”结合在一起的经典分数化（Fractionating）密码。

它的核心思想是先把每个字母拆解成 5×5 波利比奥斯方阵（Polybius Square）中的行号和列号两个数字坐标，再把所有字母的行号排成一排、列号排成一排并首尾连接，最后重新两两配对查回方阵变成新字母。

由于每个密文字母通常由原明文中两个不同字母的坐标片段拼合而成，修改一个明文字母会影响多个密文字母，单字母频率特征因此被显著打散。这种“先拆碎再重组”的扩散思路，超越了普通单表替换密码的局限。

## 核心原理与坐标分合步骤
<!-- sources: practical, source -->

第一步是构造 5×5 波利比奥斯方阵。为了将 26 个英文字母装入 25 个格子，标准双分密码将 I 与 J 合并在同一个位置（通常写作 I）。若提供关键词（Keyword），先将关键词转为大写、替换 J 为 I 并去掉重复字母，依次填入方阵前排，再把剩余未出现的字母按 A–Z 顺序补齐 25 格；若关键词留空，则直接使用标准字母顺序表。

第二步是坐标拆分（加密）：依次查出明文中每个字母在方阵中的行号（0–4，或纸笔习用的 1–5）与列号，将全部行号按顺序记录为第一段数字流 yCo，将全部列号按顺序记录为第二段数字流 xCo，再把两段首尾拼成长为 2N 的单一数字串 yCo + xCo。

第三步是坐标重组：从左到右把这条长为 2N 的数字串每两位切成一对 (行, 列)，逐对查回同一个 5×5 方阵，读出的 N 个字母即为密文。

:::example 标准空密钥方阵与 FLEEATONCE 加密手算
[输入]
明文：FLEEATONCE（10 字母）
关键词：留空（标准 5×5 方阵，行/列均按 0–4 编号）
方阵：
第 0 行：A B C D E
第 1 行：F G H I K
第 2 行：L M N O P
第 3 行：Q R S T U
第 4 行：V W X Y Z
[结果]
逐字查坐标 (行, 列)：
F(1,0) L(2,0) E(0,4) E(0,4) A(0,0) T(3,3) O(2,3) N(2,2) C(0,2) E(0,4)
拼接行流与列流：
行流 yCo = 1 2 0 0 0 3 2 2 0 0
列流 xCo = 0 0 4 4 0 3 3 2 2 4
合并两两分组：(1,2) (0,0) (0,3) (2,2) (0,0) (0,0) (4,4) (0,3) (3,2) (2,4)
查方阵得密文：H A D N A A Z D S P → HADNAAZDSP
[说明]
前五个密文字母完全由原明文的行号两两配对生成，后五个完全由原明文的列号两两配对生成；因此双分密码中相邻坐标跨字母重新组合。
:::

## 带关键词加密与解密还原
<!-- sources: practical, source -->

使用关键词 CIPHER 时，方阵第一行以 C、I、P、H、E 开头，随后按字母表顺排其余未出现字母。以混合大小写与标点的 Meet at Dawn! 为例，10 个有效字母进入坐标重组，空格与感叹号保留原位，输出 Ghda xu Ydqf!。

解密是加密的精确逆过程：先用同一个 5×5 方阵将 N 个密文字母还原成长为 2N 的坐标数字流（每个密文字母贡献 2 位数字），将这条数字流从正中间平均切分为前 N 位（原行流 yCo）与后 N 位（原列流 xCo），再把第 k 个行号与第 k 个列号重新配对查方阵，即可恢复第 k 个明文字母。

:::example 关键词 CIPHER 加密与混合格式实测
[输入]
明文：Meet at Dawn!（有效字母 10 个）
关键词：CIPHER
方阵：
第 0 行：C I P H E
第 1 行：R A B D F
第 2 行：G K L M N
第 3 行：O Q S T U
第 4 行：V W X Y Z
[结果]
行流 yCo：2 0 0 3 1 3 1 1 4 2（对应 M e e t a t D a w n）
列流 xCo：3 4 4 3 1 3 3 1 1 4
合并两两查表：(2,0)=G, (0,3)=H, (1,3)=D, (1,1)=A, (4,2)=X, (3,4)=U, (4,3)=Y, (1,3)=D, (3,1)=Q, (1,4)=F
恢复原大小写与空格标点：Ghda xu Ydqf!
[说明]
将 Ghda xu Ydqf! 送入 Bifid Cipher Decode 并填入相同关键词 CIPHER，即可还原 Meet at Dawn!。
:::

:::example 解密还原 HADNAAZDSP（空密钥）
[输入]
密文：HADNAAZDSP（长度 10），关键词留空
[结果]
查方阵还原 20 位坐标流：12 00 03 22 00 00 44 03 32 24
从正中对半拆分：
前 10 位（行流）：1 2 0 0 0 3 2 2 0 0
后 10 位（列流）：0 0 4 4 0 3 3 2 2 4
逐位纵配 (行, 列)：(1,0)F (2,0)L (0,4)E (0,4)E (0,0)A (3,3)T (2,3)O (2,2)N (0,2)C (0,4)E
还原明文：FLEEATONCE
[说明]
注意即使只有一个字符在密文中丢失或多余，对半切分的中点就会整体偏移，导致后半段乃至全篇解码错乱。
:::

## 与分周期变体及 Trifid 的区别
<!-- sources: cryptomuseum, practical, engine -->

德拉斯特尔原著中为便于手工计算并限制传输错误扩散，常把长消息按固定周期（例如每 5 个或每 7 个字母一组）分段执行双分变换，最后一组不足周期按实际长度处理。分段后，坐标重组只在各段内部发生，因此同一明文与同一方阵在“周期 5”与“整段不设周期”下产生的密文完全不同。

此外，德拉斯特尔还提出了使用 3×3×3 立方体（三坐标）的三分密码（Trifid Cipher），其原理与双分一脉相承，但每个字母拆成三项坐标并允许自定义周期。

## 解谜应用
<!-- sources: practical, engine, source -->

在 ARG 与古典密码题中，双分密码的密文通常呈现以下外观：仅由英文字母构成且几乎不会出现字母 J（标准 5×5 方阵将 I/J 合并）；字频比单表替换更平缓，凯撒、仿射与维吉尼亚常规测试均无可读结果；题面或附件常给出一个单词关键词，或暗示“5×5 方阵”“波利比奥斯”“行与列拆分重组”“Delastelle”等线索。

方阵、归并规则与周期共同决定结果。采用按段处理的约定时，密文按相同周期分段，各段分别拆分、配对与查表。不足一个周期的尾段按实际长度还原。

## 常见误区

- 双分密码不是单表替换密码，同一个明文字母在不同位置往往会加密成不同密文字母，不能直接套用单表字频表逐字代换。
- 编码与解码不是自反操作，必须明确切换方向；且密文缺漏哪怕一个字母，都会导致坐标流对半切分错位而全篇乱码。
- 整段处理和按固定周期处理的坐标序列不同。将分周期产生的密文整段解码，通常无法复原明文。
- 标准 5×5 方阵将 I 与 J 合并，解密结果只会输出 I 而不会自动恢复原明文中的 J（如 JAZZ 编码再解码会得到 IAZZ），需结合词义人工辨识。
- I 和 J 共用一个格子时，密文无法区分两者。解出的 I 是否应读作 J，要由原词或题面确定。
