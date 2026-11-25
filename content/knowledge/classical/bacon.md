---
capabilityId: pair:Bacon%20Cipher%20Encode
title: "培根密码"
topicGroup: "classical"
summary: "培根双字母隐写密码的 1605 年起源、24 字母与 26 字母两套五位编码表、载体提取模式、完整实例及解谜识别方法。"
aliases:
  - "Bacon Cipher Encode"
  - "Bacon Cipher Decode"
  - "培根隐写"
  - "双字母密码"
  - "两种外观承载五位编码"
sources:
  - id: "britannica"
    title: "Baconian cipher"
    publisher: "Encyclopædia Britannica（大英百科全书）"
    url: "https://www.britannica.com/topic/Baconian-cipher"
    language: "en"
    kind: "official-doc"
    locator: "Francis Bacon 1605 发明背景、双字体隐写原理与五位编码结构"
  - id: "practical"
    title: "Baconian Cipher"
    publisher: "Practical Cryptography（古典密码参考手册）"
    url: "https://practicalcryptography.com/ciphers/classical-era/baconian/"
    language: "en"
    kind: "author-spec"
    locator: "24 字母原始表（I=J, U=V）与 26 字母完整表对照及隐写用法"
  - id: "nku"
    title: "Stream Ciphers — Historical Binary-like Encodings"
    publisher: "北肯塔基大学数学与统计系（Chris Christensen 密码学讲义）"
    url: "https://www.nku.edu/~christensen/stream%20ciphers.pdf"
    language: "en"
    kind: "official-doc"
    locator: "Francis Bacon 五位二元编码与早期二进制思想"
  - id: "engine"
    title: "本站固定版本的 Bacon Cipher 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Bacon Cipher Encode / Decode：Alphabet、Translation、Keep extra characters、Invert Translation"
  - id: "source"
    title: "CyberChef 11.5.0 站内镜像源码 — BaconCipherEncode.mjs"
    publisher: "GCHQ CyberChef / Karsten Silkenbäumer"
    url: "/vendor/knowledge/cyberchef/src/core/operations/BaconCipherEncode.mjs"
    upstreamUrl: "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/BaconCipherEncode.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：两套字母表编号、五位二进制补零与翻转/保留开关"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: britannica, nku -->

培根密码（Baconian Cipher，又称培根双字母密码）由英国哲学家与政治家弗朗西斯·培根（Francis Bacon）于 1605 年在《学术的进展》中提出，并在 1623 年的拉丁文扩充版《论学术的尊严与增进》中进一步阐述。

与普通密码不同，培根密码的设计初衷更接近“隐写术”（Steganography）：它用两种可区分的符号或外观（传统记作 A 与 B，等价于二进制 0 与 1），将每一个秘密字母编码为 5 位序列，再把这些 0/1 序列隐藏在一段看似完全正常的载体文字之中——例如用正体与斜体、普通与加粗、小写与大写，甚至两种不同颜色来分别表示 A 和 B。

因为每个隐藏字母都需要 5 个载体字符来承载，培根密码把明文长度放大了 5 倍，却能让不知情的旁观者只看到一段毫无异样的表层文章。它在密码史上也常被视为用五位二元序列编码字母的早期先驱。

## 两套编码表：24 字母标准表与 26 字母完整表
<!-- sources: britannica, practical, source -->

五位二元组合共有 2⁵ = 32 种（从 AAAAA=00000 到 BBBBB=11111），足以覆盖全部拉丁字母。但培根密码在历史上与现代存在两套最常用的映射表，二者在字母 I 之后的所有编码都会错开，解码时必须明确区分：

第一套是培根原始的 24 字母标准表（Standard，I=J 且 U=V）：由于十七世纪拉丁字母表中 I 与 J、U 与 V 尚未完全分化，该表将 I 与 J 共用同一个编码 ABAAA（01000，编号 8），将 U 与 V 共用同一个编码 BAABB（10011，编号 19），Z 的编号为 23（BABBB，10111）。

第二套是现代常见的 26 字母完整表（Complete）：A 到 Z 各自拥有独立的 0–25 二进制编号，I=ABAAA（8）、J=ABAAB（9）、U=BABAA（20）、V=BABAB（21）、Z=BBAAB（25）。由于编号从 J 开始整体顺移 1 位、从 V 开始整体顺移 2 位，混用两套表会导致后半段字母全部译错。

:::example 两套编码表关键差异对照
[输入]
字母：A、H、I、J、K、T、U、V、W、Z
[结果]
Standard (I=J and U=V)：
A=AAAAA(0), H=AABBB(7), I/J=ABAAA(8), K=ABAAB(9), T=BAABA(18), U/V=BAABB(19), W=BABAA(20), Z=BABBB(23)
Complete（26 字母独立）：
A=AAAAA(0), H=AABBB(7), I=ABAAA(8), J=ABAAB(9), K=ABABA(10), T=BAABB(19), U=BABAA(20), V=BABAB(21), W=BABBA(22), Z=BBAAB(25)
[说明]
A 到 I 共 9 个字母在两套表中编码完全一致；从 J 开始出现差异。遇到 Standard 表解码结果出现 I 或 U 时，需结合英文语境判断原文是 I 还是 J、是 U 还是 V。
:::

## 编码示例
<!-- sources: practical, source -->

以四字母明文 MIST 为例，在 Standard (I=J and U=V) 与 Complete 两套字母表下，仅第一个字母 M 与后两个字母 S、T 的编码就会明显不同。输出格式可在 A/B 与 0/1 之间切换，勾选 Invert Translation 则会整体翻转每一位。

:::example MIST 在两套字母表中的编码结果
[输入]
明文：MIST
[结果]
Standard (I=J and U=V)，A/B：ABABB ABAAA BAAAB BAABA
Complete，A/B：ABBAA ABAAA BAABA BAABB
Standard (I=J and U=V)，0/1：01011 01000 10001 10010
Standard (I=J and U=V)，A/B，勾选 Invert Translation：BABAA BABBB ABBBA ABBAB
[说明]
在 Standard 表中 M=11(01011)、I=8(01000)、S=17(10001)、T=18(10010)；在 Complete 表中 M=12(01100)、I=8(01000)、S=18(10010)、T=19(10011)。勾选 Invert Translation 会将全部 A 与 B 互换。
:::

## 载体隐写与解码提取
<!-- sources: britannica, engine, source -->

大小写可以承载两种状态。按小写为 0、大写为 1 的约定，20 个载体字母可写入 4 组编码。接收者按同一约定还原位串，分组后查表。

:::example 利用大小写载体隐藏并解码 MIST（Case 模式）
[输入]
载体句子：tHe NIgHt wiNds aRE caLm.
使用 24 字母表。小写表示 0，大写表示 1。
[结果]
提取 20 个字母按小写=0、大写=1 转换：
tHeNI → 01011(M)，gHtwi → 01000(I)，NdsaR → 10001(S)，EcaLm → 10010(T)
解码输出：MIST
[说明]
空格与末尾句号在 Case 模式下会被自动忽略。如果出题人约定“大写为 A、小写为 B”，只需勾选 Invert Translation 即可立刻翻转解码。
:::

## 解谜应用
<!-- sources: britannica, practical, engine -->

在 ARG 与解谜题中，培根密码最典型的识别信号有两类：一是直接出现仅由 A/B（或任意两种符号，如 0/1、空格/制表符、两种表情、两种汉字）组成、且总长度恰为 5 的倍数的字符串；二是出现一段语义正常但大小写忽大忽小、字体粗细/斜体混排、字色微差或每词首字母分布异常的英文段落，且其有效字母总数（或单词总数）恰好是 5 的倍数。

排查时按四步核对最高效：第一步确认二类载体是什么（A/B、0/1、大小写、粗斜体还是词首字母范围），若载体是自定义双符号（如 〇/一），先用“字符替换”统一换成 A/B 或 0/1；第二步确认总项数是否能被 5 整除，注意不要把标题、标点或多余空行混入计数；第三步同时测试 Standard 与 Complete 两套字母表；第四步若输出出现大量 ? 或全为后半段无意义字母，立即勾选 Invert Translation 排查“0/1 映射方向相反”的情况。

若解码后的英文单词里个别字母不通顺（例如出现 IUST 或 LOUE），优先检查是否属于 24 字母标准表导致的 I/J 与 U/V 合并（对应 JUST 与 LOVE）。

## 常见误区

- 培根密码有 24 字母标准表（I=J、U=V）和 26 字母完整表两套体系，从字母 J 开始后续编码全部不同，解码乱码时须切换字母表核对。
- 解码结果中出现问号 ? 并不一定代表不是培根密码，常见原因是 0/1（或 A/B、大小写）定义与工具默认相反，勾选 Invert Translation 往往能直接恢复明文。
- 培根密码按每 5 项严格分组，开头多算或漏算哪怕一个字符，都会导致其后全部字母发生错位。
- 以大小写承载信息时，只有约定参与编码的字符占据位序。若把本应跳过的空格或标点计入，后面的五位分组就可能错位。
- 24 字母标准表下 I/J 与 U/V 在编码时已经合并，解码器无法自动判断原文原本是 I 还是 J、是 U 还是 V，必须结合上下文语义人工复原。
