---
capabilityId: pair:To%20Morse%20Code
title: 摩斯电码
topicGroup: communication
summary: 按国际摩尔斯字表转换点划，并用不同分隔符保存字符与单词边界。
aliases:
  - Morse code
  - 国际摩斯
  - 摩尔斯
  - 点划转码
sources:
  - id: itu
    title: ITU-R M.1677-1 国际摩尔斯电码
    publisher: 国际电信联盟
    url: https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-C.pdf
    language: zh-CN
    kind: standard
    locator: 附件 1，符号表与信号的时长比例
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入和输出类型及选项
---

## 介绍
<!-- sources: itu, chef -->

国际摩尔斯电码用短信号和长信号表示字母、数字和部分标点。在文本记录中，短信号通常写作点，长信号写作划，另外保留字符之间和单词之间的断点。

## 码组与过渡
<!-- sources: itu -->

按照 ITU-R M.1677-1，一点为一个时间单位，一划为三个。字符内部两次发信间隔一点，字符间隔三点，单词间隔七点。书面文本可以用不同符号分别记录较长的两类断点。

:::example 三个字母的独立码组
[输入]
SOS，字符分隔为空格
[结果]
... --- ...
[说明]
S 是三个点、O 是三个划；这是分开的三组字符。
:::

## 文本中的词边界
<!-- sources: itu, chef -->

当空格用于隔开字符时，斜杠可作为单词分隔记号。原来的空白边界于是有两个不同层级，逆向输入时要采用与原记录一致的分隔方式。

:::example 跨词转换
[输入]
A B，字符分隔为空格，单词分隔为斜杠
[结果]
.-/-...
[说明]
左右分别是 A 和 B；用相同分隔译回，结果为 A B。
:::

## 数字与标点
<!-- sources: itu -->

编号通常要连同原有零和标点逐组记录。国际表中的数字都是五个信号，9 是四划一点，0 是五划。问号是一组独立的六码信号。

:::example 逐组读取数字和问号
[输入]
----. ----- ..--..
[结果]
90?
[说明]
每个空格切出一组，依次查表。
:::

## 手抄与信号还原
<!-- sources: itu, chef -->

手抄点划时应一并标记边界。没有停顿的串可能有多种切分，例如两个点可以是 I，也可以是两个 E。对闪光或声音材料还需比较时长，推断分组之后再用文字表查读。

## 常见误区

- 每个点划组所含的信号数不相等，不能按固定长度切字母。
- 空格和斜杠应按记录约定解释，斜杠可用于表示词边界。
- 长短信号的含义取决于相对时长，不能凭信号响度判定点和划。

