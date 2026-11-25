---
capabilityId: op:Atbash%20Cipher
title: "埃特巴什密码"
topicGroup: "classical"
summary: "埃特巴什密码的希伯来历史渊源、拉丁字母首尾镜像对照、数学等价形式、完整实例与解谜识别方法。"
aliases:
  - "Atbash Cipher"
  - "阿特巴什密码"
  - "字母表镜像替换"
  - "把字母表首尾配对"
sources:
  - id: "jewish-enc"
    title: "Atbash (אאתב\"ש)"
    publisher: "Jewish Encyclopedia（1906 年版文献辞典）"
    url: "https://www.jewishencyclopedia.com/articles/2059-atbash"
    language: "en"
    kind: "official-doc"
    locator: "希伯来字母 Aleph–Tav / Bet–Shin 命名来源与《耶利米书》用例"
  - id: "britannica"
    title: "Substitution cipher"
    publisher: "Encyclopædia Britannica（大英百科全书）"
    url: "https://www.britannica.com/topic/substitution-cipher"
    language: "en"
    kind: "official-doc"
    locator: "单表替换密码定义与字符频率保持特征"
  - id: "atbash"
    title: "Atbash 中文算法说明"
    publisher: "DenCode（该转换器作者文档）"
    url: "https://dencode.com/zh-cn/cipher/atbash"
    language: "zh-CN"
    kind: "author-spec"
    locator: "关于该算法：拉丁字母首尾反向对照与对合特性"
  - id: "practical"
    title: "Atbash Cipher"
    publisher: "Practical Cryptography（古典密码参考手册）"
    url: "https://practicalcryptography.com/ciphers/classical-era/atbash-cipher/"
    language: "en"
    kind: "author-spec"
    locator: "拉丁字母映射表、与仿射密码的关系及安全性分析"
  - id: "engine"
    title: "本站固定版本的 Atbash Cipher 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Atbash Cipher：无额外参数，面向拉丁字母表"
  - id: "source"
    title: "CyberChef 11.5.0 固定源码 — AtbashCipher.mjs"
    publisher: "GCHQ CyberChef"
    url: "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/AtbashCipher.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：直接调用仿射变换参数 a=25, b=25 的大小写与非字母处理"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: jewish-enc, practical -->

埃特巴什密码（Atbash Cipher，也译作阿特巴什密码）是一种历史极其悠久的固定单表替换密码。其基本思想是将有序字母表首尾对折：第一个字母与最后一个字母互换，第二个字母与倒数第二个字母互换，其余位置依次对称配对。

该密码最初用于 22 个字母的希伯来字母表。其名称“Atbash”正是由前两组配对字母的发音拼合而成：希伯来字母表的首字母 Aleph（א）对应末字母 Tav（ת），次字母 Bet（ב）对应倒数第二字母 Shin（ש），合称 At-Bash。

文献考据显示，《希伯来圣经·耶利米书》中已出现埃特巴什替换的著名用例：例如《耶利米书》25:26 与 51:41 中的“示沙克”（Sheshach，ששך）经希伯来埃特巴什还原即对应“巴比伦”（Babel，בבל）；51:1 中的“立加米”（Leb Kamai，לב קמי）则对应“迦勒底”（Kasdim，כשדים）。后来这一规则被推广到 26 个拉丁字母，成为解谜与密码教学中的基础入门密码。

## 核心原理与镜像对照
<!-- sources: atbash, practical, source -->

应用于标准 26 个拉丁字母时，将 A–Z 依次编号为 0–25，埃特巴什密码把编号为 x 的字母替换为编号 25 − x 的字母。26 个字母以中点（M 与 N 之间）为轴，恰好配成 13 对互逆组合：A↔Z、B↔Y、C↔X、D↔W、E↔V、F↔U、G↔T、H↔S、I↔R、J↔Q、K↔P、L↔O、M↔N。

这一变换具有严格的自反性（对合性）：因为 25 − (25 − x) = x，每个字母经过一次埃特巴什映射后再执行一次完全相同的映射，必然回到原字母。因此，埃特巴什密码不需要区分“加密”和“解密”两个不同按钮，也没有任何秘密密钥。

从代数角度看，埃特巴什密码是仿射密码 E(x) = (ax + b) mod 26 在 a = 25、b = 25 时的特例。由于 25 ≡ −1（mod 26），因此 (25x + 25) mod 26 等价于 (−x − 1) mod 26，即 25 − x。

:::example 拉丁字母完整 13 对镜像表
[输入]
前半表：A B C D E F G H I J K L M
[结果]
后半表：Z Y X W V U T S R Q P O N
[说明]
上下同一列的两个字母相互替换，且没有字母会映射到自身。原文本中字符的先后顺序保持不变。
:::

## 加解密与实测示例
<!-- sources: atbash, source -->

因为埃特巴什只替换字母身份而不改动单词长度、空格与标点位置，手工核对非常直观。以 HELLO WORLD 为例，逐字母查镜像表：H→S、E→V、L→O、L→O、O→L，空格保持不变，W→D、O→L、R→I、L→O、D→W，合为 SVOOL DLIOW。再把 SVOOL DLIOW 输入同一工具，即可原样还原为 HELLO WORLD。

遇到混合大小写、连字符和数字的字符串时，只有英文字母会被镜像替换，其余符号原封不动。同时也可以用仿射公式 (25x + 25) mod 26 核对镜像映射。

:::example 基础短语往返核对
[输入]
HELLO WORLD
[结果]
SVOOL DLIOW（再次执行 → HELLO WORLD）
[说明]
注意原词中双写字母 LL 映射后仍是双写字母 OO；单表替换完整保留重复字母结构与词长。
:::

:::example 混合大小写、数字与符号
[输入]
Mist-ARG 2026!
[结果]
Nrhg-ZIT 2026!
[说明]
M→N、i→r、s→h、t→g，A→Z、R→I、G→T；大小写各自对应保留，连字符、空格、2026 与感叹号均不变化。
:::

:::example 与仿射参数（a=25, b=25）的数值验证
[输入]
ARG（编号：A=0, R=17, G=6）
[结果]
A：(25×0 + 25) mod 26 = 25 → Z
R：(25×17 + 25) mod 26 = 450 mod 26 = 8 → I
G：(25×6 + 25) mod 26 = 175 mod 26 = 19 → T
结果：ZIT
[说明]
结果与 25−x（25、8、19）完全一致，体现了仿射写法与镜像定义的等价性。
:::

## 安全性与特征分析
<!-- sources: britannica, practical -->

埃特巴什密码没有任何可变密钥：只要算法被识别出来，任何人都能瞬间解密，因此它完全不具备实际通信保密能力，现代主要用作教学示例、文本遮蔽或解谜环节中的轻量编码。

从统计学特征看，标准英文中高频字母 E、T、A、O、I、N、S 在埃特巴什密文中会集中转化为高尾段字母 V、G、Z、L、R、M、H。因此英文埃特巴什密文往往呈现一个极具辨识度的外观特征：平时在正常英语中极少出现的 Z、V、X、W、G、L、O 异常密集，尤其是单词里频繁出现 V（对应 E）和 Z（对应 A）。

## 解谜应用
<!-- sources: jewish-enc, britannica, atbash, engine -->

在 ARG、影视彩蛋（如动画或悬疑作品中的片尾暗号）与基础解谜题中，埃特巴什密码经常与凯撒移位、A1Z26（字母序数）并列作为第一批排查对象。当看到一段保留了正常英文词长、标点、双写字母结构，但密文中充斥大量 Z、V、G、L、R、M，且整体凯撒移位 26 次都无法读通时，应立即送入埃特巴什密码一试。

如果题面出现“镜像”“倒影”“首尾颠倒”“从头到尾反转字母表”“圣经暗号”或希伯来相关隐喻，也往往直接指向埃特巴什密码。此外，在复合加密题中，出题人常把埃特巴什与凯撒移位串联（例如先 Atbash 再 ROT13），两者复合在数学上依然是一个仿射替换，逐层试探即可拆解。

若经过埃特巴什处理后得到的是倒着写的英文单词（如 DLROW OLLEH），说明原文同时还经过了整串字符倒序（Reverse），只需再执行一次文本反转即可读出明文。

## 常见误区

- 埃特巴什密码是“把字母表首尾互换”，不是把整段句子的字符顺序倒过来写（HELLO 变成 SVOOL，而不是 OLLEH）。
- 埃特巴什密码不属于凯撒移位：凯撒移位把所有字母沿同一方向平移固定步数，而埃特巴什每个字母的移动距离各不相同（A 移 25 位，M 只移 1 位）。
- 镜像关系必须先确定字母表。英文字母的 A↔Z 与希伯来文的 Aleph↔Tav 属于不同字母表，数字也不在上述两张表中。
- 由于算法本身没有密钥，埃特巴什无法提供保密性；若题目要求使用自定义密钥的镜像表，则属于通用单表替换。
- 埃特巴什具备自反性，加密与解密执行同一操作即可，不需要寻找单独的“埃特巴什解码”工具。
