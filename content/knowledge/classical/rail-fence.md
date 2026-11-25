---
capabilityId: pair:Rail%20Fence%20Cipher%20Encode
title: "栅栏密码"
topicGroup: "classical"
summary: "栅栏换位密码的 W 型往返轨迹、栏数与偏移量规则、完整加解密实例及与等宽分栏变体的区别。"
aliases:
  - "Rail Fence Cipher Encode"
  - "Rail Fence Cipher Decode"
  - "W 型栅栏密码"
  - "之字形换位"
  - "沿之字轨迹重排位置"
sources:
  - id: "britannica"
    title: "Transposition cipher"
    publisher: "Encyclopædia Britannica（大英百科全书）"
    url: "https://www.britannica.com/topic/transposition-cipher"
    language: "en"
    kind: "official-doc"
    locator: "换位密码定义、字符集合守恒与几何重排结构"
  - id: "lmu"
    title: "Ciphers — Rail Fence Cipher"
    publisher: "洛约拉马利蒙特大学计算机科学系（Ray Toal 课程讲义）"
    url: "https://cs.lmu.edu/~ray/notes/ciphers/"
    language: "en"
    kind: "official-doc"
    locator: "Rail Fence 之字形写入轨迹、逐行读取与穷举分析"
  - id: "rail-fence"
    title: "Rail Fence 中文算法说明"
    publisher: "DenCode（该转换器作者文档）"
    url: "https://dencode.com/zh-cn/cipher/rail-fence"
    language: "zh-CN"
    kind: "author-spec"
    locator: "关于该算法：栏数、偏移量与往返周期规则"
  - id: "practical"
    title: "Rail-fence Cipher"
    publisher: "Practical Cryptography（古典密码参考手册）"
    url: "https://practicalcryptography.com/ciphers/classical-era/rail-fence/"
    language: "en"
    kind: "author-spec"
    locator: "Encryption / Decryption / Cryptanalysis"
  - id: "engine"
    title: "本站固定版本的 Rail Fence 操作说明与参数"
    publisher: "GCHQ CyberChef（Apache-2.0）"
    url: "/vendor/cyberchef/catalogue.json"
    language: "en"
    kind: "implementation"
    locator: "Rail Fence Cipher Encode / Rail Fence Cipher Decode：Key、Offset 参数"
  - id: "source"
    title: "CyberChef 11.5.0 固定源码 — RailFenceCipherEncode.mjs"
    publisher: "GCHQ CyberChef"
    url: "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/RailFenceCipherEncode.mjs"
    language: "en"
    kind: "implementation"
    locator: "run()：往返周期 2(Key−1)、偏移公式与参数边界检查"
    license: "Apache-2.0"
    licenseUrl: "/vendor/cyberchef/LICENSE.txt"
---

## 介绍
<!-- sources: britannica, lmu, practical -->

栅栏密码（Rail Fence Cipher，又称之字形密码或 W 型栅栏）是一种经典的几何换位密码。与凯撒或维吉尼亚等“把字母换成别的字母”的替换密码不同，栅栏密码不改变原文中的任何字符本身，只按照斜向往返的折线轨迹重新排列字符的前后顺序。

加密时，明文字符沿多条假想的水平“栅栏”（行）从上到下斜向依次写入，抵达最底栏后再斜向折返向上，触顶后再次向下，形成类似木栅栏或连续字母 W 的波浪轨迹；全部写完后，再逐行从左到右把每一栏上的字符连接起来，即得到密文。

因为字符种类与各自出现次数完全不变，仅靠栏数与偏移量决定排列方式，栅栏密码本身密钥空间极小，无法提供现代意义上的保密性，但在解谜游戏、CTF 与古典密码组合中极为常见。

## 核心原理与往返周期
<!-- sources: lmu, rail-fence, source -->

设栏数为 r（r ≥ 2）。字符从第 0 栏一路向下到达第 r−1 栏需要 r−1 步，再折返回到第 0 栏同样需要 r−1 步，因此整个往返运动构成一个固定周期：T = 2(r − 1)。例如 2 栏时周期为 2（0, 1, 0, 1…），3 栏时周期为 4（0, 1, 2, 1, 0, 1, 2, 1…），4 栏时周期为 6（0, 1, 2, 3, 2, 1…）。

当引入起始偏移量 o（Offset ≥ 0）时，第 i 个字符（i 从 0 起算）在周期中的相位为 p = (i + o) mod T，它所落入的行号（0 表示最顶栏，r−1 表示最底栏）可直接由公式算出：row = (r − 1) − |T/2 − p|。当 o = 0 时，第一个字符落在最顶栏第 0 行并向下行进；当 o > 0 时，相当于先空过轨迹开头的 o 个槽位，再从该位置开始写入明文。

同一周期内，最顶栏与最底栏各只经过 1 次，而中间每一栏在“向下”和“向上”两段都会各经过 1 次，因此中间各栏容纳的字符数大约是顶栏和底栏的两倍。这一分布特征也是手工画轨迹与反向还原的关键。

:::example 三栏（Key=3，Offset=0）W 型轨迹示意
[输入]
明文：WEAREDISCOVEREDFLEEATONCE（25 字符）
参数：Key=3，Offset=0，周期 T = 2×(3−1) = 4
[结果]
第 1 栏：W . . . E . . . C . . . R . . . L . . . T . . . E → WECRLTE
第 2 栏：. E . R . D . S . O . E . E . F . E . A . O . C . → ERDSOEEFEAOC
第 3 栏：. . A . . . I . . . V . . . D . . . E . . . N . . → AIVDEN
拼接密文：WECRLTEERDSOEEFEAOCAIVDEN
[说明]
第 1 栏收集索引 0, 4, 8, 12, 16, 20, 24；第 2 栏收集 1, 3, 5, 7…；第 3 栏收集 2, 6, 10, 14, 18, 22。三栏长度依次为 7、12、6，总长仍为 25。
:::

## 偏移量与含空格实例
<!-- sources: rail-fence, source -->

改变 Offset 会整体平移明文在波浪轨迹上的起点，导致各栏分配到的字符完全不同。以 10 字符文本 ARGTOOLBOX 在 Key=3（周期 T=4）下的加密为例，Offset 分别取 0、1、2 时，第一个字符 A 依次落在第 1 栏、第 2 栏（下行）与第 3 栏，得到的密文截然不同。

当明文包含空格时，空格也会按轨迹落入某一栏并留在密文内部。解密时必须原样保留这些空格，才能保证总长度与槽位对齐。

:::example 同一明文在不同偏移量下的结果
[输入]
明文：ARGTOOLBOX，Key=3（周期 4）
[结果]
Offset=0：各栏 AOO / RTOBX / GL → AOORTOBXGL
Offset=1：各栏 TB / AGOLO / ROX → TBAGOLOROX
Offset=2：各栏 GL / RTOBX / AOO → GLRTOBXAOO
[说明]
Offset=1 时，首字符 A 从周期相位 1（第 2 栏）起步；Offset=2 时从相位 2（第 3 栏）起步。解码时 Offset 必须与加密一致。
:::

:::example 空格参与排列的往返核对
[输入]
明文：HELLO WORLD（共 11 字符，含 1 个空格）
参数：Key=3，Offset=0
[结果]
各栏：HOR / EL OL / LWD
密文：HOREL OLLWD
[说明]
索引 5 的空格落在第 2 栏中段；在解码方向输入 HOREL OLLWD（保留中间空格），Key=3、Offset=0，可精确还原 HELLO WORLD。
:::

## 解密与槽位复原
<!-- sources: practical, source -->

手工或程序解密栅栏密码的核心不是猜测“每栏切几个字”，而是先根据密文总长度 N、栏数 Key 与偏移量 Offset，在空表格上走一遍完整的之字形轨迹，标出每一个字符索引 i 对应落在哪一栏。

标记完成后，每一栏各自包含的槽位数就已经唯一确定。随后把密文按顺序切分并依次填入第 1 栏、第 2 栏……直至最底栏的所有标记槽位；最后再顺着原索引 i = 0, 1, …, N−1 沿之字形轨迹逐格读出，即可恢复原文。

由于顶栏、中间栏与底栏的容量不同，且末尾常存在未满整周期的截断，简单按总长度均分各栏通常会导致错位，必须按真实轨迹确定每栏槽位。

:::example 按空轨迹解密 HOREL OLLWD
[输入]
密文：HOREL OLLWD（长度 11），Key=3，Offset=0
[结果]
空轨迹槽位计数：第 1 栏 3 格（索引 0,4,8），第 2 栏 5 格（1,3,5,7,9），第 3 栏 3 格（2,6,10）
切分填入：第 1 栏 HOR，第 2 栏 EL OL，第 3 栏 LWD
按索引 0→10 读回：HELLO WORLD
[说明]
第 2 栏的 5 个字符恰好包含第 3 位的空格，对应原索引 5；按索引顺序读取即得完整短语。
:::

## W 型栅栏与等宽分栏的区别
<!-- sources: rail-fence, engine, source -->

中文解谜社区与部分国内在线工具常将一种“按固定每组长度切分后逐列读取”的矩形换位也称为“传统栅栏密码”。在该变体中，字符并不是走 W 型折返，而是从第 1 栏写到第 r 栏后直接跳回第 1 栏重新开始，等价于无折返的循环取模分栏。

当栏数等于 2 时，W 型周期 2(2−1)=2 恰好与 2 栏循环取模一致，两种算法输出完全相同；但只要栏数大于或等于 3，二者的分配规律就会彻底分叉。两种方法的区别在于轨迹是否折返。

:::example 3 栏条件下两种“栅栏”结果对比
[输入]
明文：ABCDEFGHI（9 字符），栏数 3
[结果]
W 型栅栏（3 栏，从顶部开始）：各栏 AEI / BDFH / CG → AEIBDFHCG
等距分栏读列（每组 3 字，无折返）：各栏 ADG / BEH / CFI → ADGBEHCFI
[说明]
仅在 2 栏时两者等价；3 栏及以上必须区分是否走折返轨迹。
:::

## 解谜应用
<!-- sources: britannica, lmu, practical, engine -->

当一段密文的字母频率（如英文中 E、T、A、O、I、N 偏多，元音比例正常）或字符构成与正常文本高度一致，甚至能一眼看出熟悉单词的零散字母、括号或数字，但整体顺序错乱时，应优先怀疑换位密码，而栅栏密码通常是第一批排查目标。

折返轨迹的周期为 2(h−1)，其中 h 是栏数。固定栏数后，所有起始偏移可以按这个周期归约，超出周期的偏移只会重复先前的轨迹。若空格参与换位，删除它会改变后续字符对应的槽位，复原必须按原文采用的空格约定计算。

在复合谜题中，栅栏密码常作为外层或内层与其他编码叠加使用（例如先栅栏换位再 Base64，或先凯撒/维吉尼亚替换再栅栏换位）。如果遍历 W 型栏数均无可读明文，但字符总数恰为合数（如 12、15、16、20 等），应立刻改测等宽矩形读列（凯撒方阵）或带关键词的列移位置换。

## 常见误区

- 栅栏密码属于换位密码而非替换密码，不会把一个字母变成另一个字母，字母频率分布与原文完全相同。
- 从顶部开始且采用两栏时，折返栅栏与无折返分栏的轨迹相同。三栏及以上时，轨迹的区别会影响字符去向。
- 输入文本中的空格、标点和换行符都会参与换位占位；复制密文时多带或漏掉一个空格，都会导致整段解密错位。
- Offset 不是“删掉开头几个字”，而是让写入轨迹从波浪周期的第 Offset 步开始；加密与解密必须使用相同的 Key 与 Offset。
- 栅栏密码不具备自反性，把密文按相同 Key 和 Offset 再编码一次通常不能还原原文（2 栏短串等偶发特例除外），必须切换到解码方向。
