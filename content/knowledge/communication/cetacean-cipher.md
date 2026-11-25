---
capabilityId: pair:Cetacean%20Cipher%20Encode
title: 鲸鱼密码
topicGroup: communication
summary: 以 E 与 e 分别表示 0 与 1，每个 UTF-16 码元使用固定的 16 位表示。
aliases:
  - Cetacean cipher
  - 鲸鱼密码
  - E/e
sources:
  - id: unicode
    title: Unicode 17 第 3 章
    publisher: Unicode 联盟
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 3.9 与 3.10，编码形式、代理对和字节序
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
  - id: cetacean
    title: CetaceanCipherEncode 源码
    publisher: GCHQ
    url: /vendor/knowledge/cyberchef/src/core/operations/CetaceanCipherEncode.mjs
    upstreamUrl: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CetaceanCipherEncode.mjs
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
    language: en
    kind: implementation
    locator: run，16 位码元和空格
  - id: decode
    title: CetaceanCipherDecode 源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CetaceanCipherDecode.mjs
    language: en
    kind: implementation
    locator: run，大小写位值与逆向处理
---

## 介绍
<!-- sources: cetacean, chef -->

鲸鱼密码把文字表示成大写 E、小写 e 和空格。它用两种外观看似相同的字母表现二进制，每组固定长度，因此知道规则便可恢复内容。

## 固定宽度与字母大小写
<!-- sources: cetacean -->

先把 UTF-16 码元写成高位在前的十六个二进制位。大写 E 对应 0，小写 e 对应 1，开头的零同样保留。全转成大写或小写会抹去位值。

:::example 展开一个码元
[输入]
A
[结果]
EEEEEEEEEeEEEEEe
[说明]
0041 的位串是 0000000001000001，第 10 和第 16 位取小写 e。
:::

## 空格与分组
<!-- sources: cetacean, decode -->

普通空格保留为分隔。一个词内可以出现连续的多组 E/e，组内没有专门标记，解读时可从词段开头每数十六位取一组。

:::example 保留原空格
[输入]
A B
[结果]
EEEEEEEEEeEEEEEe EEEEEEEEEeEEEEeE
[说明]
左右分别是 0041 与 0042，中间的一个空格保留。
:::

## 补充平面字符
<!-- sources: unicode, cetacean -->

UTF-16 用一对代理码元表达补充平面字符，所以这类字符有两组 E/e。分成四组八位会误把码元表示当成四个独立字节，进一步按 UTF-8 解释也会得到不同结果。

:::example 两组还原一个符号
[输入]
😀
[结果]
eeEeeEEEEEeeeeEeeeEeeeeEEEEEEEEE
[说明]
先写 D83D，再写 DE00，两个码元各占 16 位。
:::

## 反向识别
<!-- sources: decode, unicode -->

反查时将 E/e 变回 0/1，恢复码元和空格。缺少一个字符会让从该处开始的分组偏移。单一序列含有大量大写 E，常见原因是前部零位较多，需要结合分组长度辨认。

## 常见误区

- 转换大小写会直接破坏内容。
- 位组长度是 16，不能按 UTF-8 的字节分组。
- 固定映射公开可逆，不依赖秘密密钥。
