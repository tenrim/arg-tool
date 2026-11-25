---
capabilityId: native:classical-autokey
title: Autokey 自密钥密码
topicGroup: classical
summary: 用起始短钥和已处理明文或密文生成后续密钥流。
aliases:
  - Autokey
  - 自密钥
  - 明文自密钥
  - 密文自密钥
  - 明文自钥
  - 密文自钥
sources:
  - id: aca
    title: Autokey
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Autokey.pdf
    language: en
    kind: author-spec
    locator: 明文反馈、PRIMER 和可选查表规则
  - id: history
    title: Traicté des chiffres (1586)
    publisher: Blaise de Vigenère / Université de Liège
    url: https://donum.uliege.be/handle/2268.1/9711?locale=en
    language: fr
    kind: author-spec
    locator: 1586 年原版《密码论》
  - id: mtu
    title: The Vigenère Cipher Encryption and Decryption
    publisher: C.-K. Shene / Michigan Technological University
    url: https://pages.mtu.edu/~shene/NSF-4/Tutorial/VIG/Vig-Base.html
    language: en
    kind: official-doc
    locator: A=0 位值、模加减与普通循环密钥
  - id: py
    title: pycipher — autokey-cipher
    publisher: James Lyons
    url: https://pycipher.readthedocs.io/en/master/#autokey-cipher
    language: en
    kind: author-spec
    locator: 维吉尼亚查表的自密钥函数
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: keySymbols 与交替回填逻辑
---

## 介绍
<!-- sources: history, aca -->
自密钥用一段先约定的短钥开头，之后由消息本身产生密钥流。历史上的自密钥可追溯到 Vigenère 的著作，不同资料采用明文或密文反馈。替换表的选择和反馈来源是两项独立的规则。

## 起始词与后续反馈
<!-- sources: aca, py, code -->
设起始词长 t。前 t 个位置用起始词，第 i 个后续位置使用第 i−t 个已处理字符。明文自钥追加已加密或已恢复的明文字母，密文自钥追加已生成或已收到的密文字母。

:::example 标准的明文自钥
[输入]
ATTACKATDAWN，起始词 QUEENLY，明文反馈，维吉尼亚变换
[结果]
密钥流 QUEENLYATTAC，密文 QNXEPVYTWTWP
[说明]
前七位用 QUEENLY，后五位依次补入已处理的 ATTAC。A 到 Z 编为 0 到 25，每位做模 26 加法。
:::

## 与循环密钥的区别
<!-- sources: mtu, aca, code -->
常见维吉尼亚密码写不完密钥时重头循环。自密钥改为从前面的原文或密文派生各位，位置 i 和位置 i＋t 并不必然采用相同字母。替换仍可按维吉尼亚、Beaufort 等公式执行。

:::example 同一短钥采用两种反馈
[输入]
ABCD，起始词 B，采用维吉尼亚加法
[结果]
明文反馈：BBDF；密文反馈：BCEH
[说明]
两者第一位均由 A＋B 得 B。明文反馈的下一钥是 A，密文反馈则用第一位密文 B。
:::

## 解密时按顺序重建
<!-- sources: aca, py, code -->
解码与生成密钥流要逐位同步。明文反馈须先恢复某个明文字母，才能在未来位置使用它。不参与编码的符号是否推进位置，要与生成时的规则一致。

:::example 逐位解明文反馈
[输入]
BBDF，起始词 B，明文反馈，维吉尼亚解码
[结果]
ABCD
[说明]
先由 B−B 得 A，第二位用 A 还原 B。再以刚还原的 B、C 分别解出 C、D。
:::

## 线索识别与可推断范围
<!-- sources: aca, mtu, code -->
若有短起始词、明文开头已知等线索，自密钥的递推关系可用来检查候选。错误的种子会影响延伸段，漏字可能破坏后续对齐。缺少反馈约定时，可以先比较前几个越过种子的位置。

## 常见误区

- 起始词用完后不会自动回到首位。
- 明文自钥解密时不能提前填入还没解出的字母。
- 明文反馈、密文反馈与替换公式需分别确认。
- 自密钥借用消息形成密钥流，并不等于独立随机的一次性密钥。
