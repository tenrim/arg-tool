---
capabilityId: op:Text%20Encoding%20Brute%20Force
title: 穷举文本编码
topicGroup: characters
summary: 并排比较同一输入在多个字符集中的显示结果，用原始字节和上下文筛选候选。
aliases:
  - 乱码候选
  - 编码穷举
  - charset
sources:
  - id: whatwg
    title: Encoding Standard
    publisher: WHATWG
    url: https://encoding.spec.whatwg.org/
    language: en
    kind: standard
    locator: 第 4、5、8、9 节
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
  - id: worker
    title: TextEncodingBruteForce 源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/TextEncodingBruteForce.mjs
    language: en
    kind: implementation
    locator: run 与 present，逐字符集转换与候选表
---

## 介绍
<!-- sources: whatwg, worker -->

文件留下的是字节序列，而编码规则决定字节如何对应字符。格式声明缺失时，逐一试用几个编码能把差异摆在一起。枚举本身无法证明哪一种解释来自原作者。

## 单字节映射的分歧
<!-- sources: whatwg, worker -->

Windows-1251 和 Windows-1252 对高位字节使用不同的索引。较短的片段可能在两张表里都有效，区别要靠后续字符、文件语境或格式声明判断。

:::example 一个字节的两个解释
[输入]
80（十六进制单字节，解码）
[结果]
Windows-1252：€
Windows-1251：Ђ
[说明]
同一索引在两张表中指向不同字符，单看字节不足以确定原文字。
:::

## 双字节字序
<!-- sources: whatwg, worker -->

UTF-16LE 的低位字节在前，UTF-16BE 的高位字节在前。如果每隔一个字节有零，按单字节编码显示时往往夹入控制字符，按正确字序合并时则可能得到连续文字。

:::example 零字节的规律
[输入]
41 00 42 00（十六进制字节，解码）
[结果]
UTF-16LE：AB
UTF-16BE：䄀䈀
[说明]
小端形成 0041、0042，大端形成 4100、4200。
:::

## 共同区间与候选验证
<!-- sources: whatwg, worker -->

多种兼容 ASCII 的编码共享低位字符。较好的证据是查看更长的片段，比较标点、分隔符与格式头，再用选定字符集独立解码和重新编码，确认原字节能否复原。可往返说明一种解释自洽，仍需格式或语境来区分同时成立的解释。

:::example 共享的字符区间
[输入]
41 42（十六进制字节，解码）
[结果]
UTF-8、Windows-1251 和 Windows-1252 均显示 AB
[说明]
没有出现高位字节，三个候选无法仅靠这段数据区分。
:::

## 字符串接口与原始字节
<!-- sources: worker, chef -->

此批量操作以字符串作输入，按目录里的字符集逐项调用转换库，再把结果放在同一张候选表。直接粘贴的是浏览器已经解释过的文字，从二进制转入字符串的过程也可能改变高位字节。遇到候选与单项解码不符时，应保留原始字节并以明确指定字符集的单项解码交叉核对。

## 常见误区

- 能显示可读字符不能确认原字符集。
- 多个候选相同不意味着其中每个字符集的完整映射相同。
- 编码枚举得到的是多个候选，无法恢复先前已经被替换掉的原始字节。

