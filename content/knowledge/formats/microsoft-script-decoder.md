---
capabilityId: op:Microsoft%20Script%20Decoder
title: 微软脚本解码
topicGroup: formats
summary: Microsoft Script Encoder 封装可用固定标记、长度及替换规则识别。解码还原的是脚本源码文本。
aliases:
  - Microsoft Script Decoder
  - Microsoft Script Encoder
  - VBE
  - JSE
  - Encoded Script
sources:
  - id: microsoft
    title: How Can I Encode Scripts Within an HTA?
    publisher: Microsoft Scripting Blog
    url: https://devblogs.microsoft.com/scripting/how-can-i-encode-scripts-within-an-hta/
    language: en
    kind: official-doc
    locator: Script Encoder 及典型编码脚本用途
  - id: decoder
    title: HTMLParser — ScriptDecoder
    publisher: HTMLParser 作者
    url: https://www.cs.cmu.edu/~wit/javadoc/org/htmlparser/scanners/ScriptDecoder.html
    language: en
    kind: author-spec
    locator: 封装边界、长度及校验字、查表与转义
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Microsoft Script Decoder，固定脚本封装识别、内容替换与内附样例
---

## 介绍
<!-- sources: microsoft, decoder -->
Microsoft Script Encoder 曾把 VBScript 和 JScript 源码改写为编码脚本。保存为独立文件时常见 .vbe 或 .jse。一份文档也可能包含编码片段和未编码文字，阅读时可先根据标记划定编码区段。

## 开始、结束和头部
<!-- sources: decoder, fixed -->
编码区段可用 #@~^ 和 ^#~@ 标出边界。中间包含表示长度的头部、编码载荷及尾部校验数据。Base64 形式只用于其中部分字段，载荷的还原还需要脚本编码格式的查表和转义规则。

:::example 读取开始标记后的长度字段
[输入]
#@~^RQAAAA==
[结果]
识别到开始标记，长度字段解码为 45 00 00 00（十六进制），小端整数为 69。
[说明]
RQAAAA== 只编码头部的数值。这段材料没有提供完整封装，因此不能还原脚本。
:::

## 替换、位置和特殊字符
<!-- sources: decoder, fixed -->
解码器根据载荷位置选用查找表，将对应字符恢复，并处理格式单独规定的转义。长度及尾部信息属于外层格式，解码出的引号、尖括号和源码换行则属于恢复后的文字。

:::example 还原工具随附的无害样例
[输入]
#@~^RQAAAA==-mD~sX|:/TP{~J:+dYbxL~@!F@*@!+@*@!&@*eEI@#@&@#@&.jm.raY 214Wv:zms/obI0xEAAA==^#~@
[结果]
var my_msg = "Testing <1><2><3>!";

VScript.Echo(my_msg);
[说明]
保留解出的文字，其中两行之间有一个空行。该样例的原始换行采用 CRLF。
:::

## 普通源码与编码区段
<!-- sources: microsoft, decoder, fixed -->
普通源码没有编码封装时，可以直接按源码解释。专门查找封装的读取操作依据开始和结束标记提取编码部分。对没有这些标记的文件，是否原样保留外部文字取决于读取用途和具体做法。

:::example 普通源码中没有编码块
[输入]
var x = 1;
[结果]
在查找编码块的解码操作中没有输出。
[说明]
这段文本已经是可读源码；它没有 Microsoft 编码块的开始标记或结束标记。
:::

## 解码结果作为源码档案
<!-- sources: microsoft, decoder -->
恢复后的文本可供查看词法和语句，解码时无须执行脚本。检查档案时可以保留封装与解码结果两份记录，用于确认是否存在片段边界、外层模板或损坏字符。

## 常见误区
- 扩展名只是辅助线索，识别编码块还需读内容。
- 头部可以按 Base64 解读，整个载荷使用自己的替换规则。
- 得到源码可以继续做静态分析，运行环境与程序行为仍需单独判断。
