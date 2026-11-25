---
capabilityId: op:P-list%20Viewer
title: XML 属性列表
topicGroup: formats
summary: Apple 的 XML 属性列表用字典、数组和带类型的标记保存配置。查看表示可突出键与值，但仍须区分原文、衍生排版及二进制表示。
aliases:
  - P-list Viewer
  - plist
  - Apple 属性列表
  - XML plist
sources:
  - id: apple
    title: Property List Programming Guide
    publisher: Apple
    url: https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/Introduction/Introduction.html
    language: en
    kind: official-doc
    locator: 属性列表的对象模型和多种表示
  - id: quick
    title: Quick Start for Property Lists
    publisher: Apple
    url: https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/QuickStartPlist/QuickStartPlist.html
    language: en
    kind: official-doc
    locator: 使用字典、数组、基本值和属性列表保存方法
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: P-list Viewer，根元素识别、逐行替换和显示缩进
---

## 介绍
<!-- sources: apple, quick -->
属性列表用带类型的值表示配置或其他层级数据。Apple 平台常用字典为值命名，也用数组保存按顺序排列的项目。XML 属性列表把这些结构写成标签，通常由 plist 根元素包住一个顶层值。

## 字典键与后续值
<!-- sources: apple, quick, fixed -->
在 XML 的字典中，key 标记提供名称，其后的元素定义值及类型。阅读时需把每个键和它紧随的值配对，也要留意其中可能还有嵌套字典或数组。

:::example 字典中的一个字符串
[输入]
\<plist version="1.0">
\<dict>
\<key>clue\</key>
\<string>KEY\</string>
\</dict>
\</plist>
[结果]
plist => {
	clue => "KEY"
}
/plist
[说明]
clue 是字典键，KEY 是字符串值。箭头和缩进属于可读表示。
:::

## 数字、布尔和二进制值
<!-- sources: apple, quick, fixed -->
integer 元素可表示整数，true 或 false 空元素表示布尔值。data 元素保存数据的 Base64 文本，需要按 Base64 还原才能得到原始字节。仅将 XML 标签改成可读排版时，数据内容仍可能保持 Base64 写法。

:::example 整数和布尔值同时出现
[输入]
\<plist version="1.0">
\<dict>
\<key>Count\</key>
\<integer>7\</integer>
\<key>Ready\</key>
\<true/>
\</dict>
\</plist>
[结果]
plist => {
	Count => 7
	Ready => true
}
/plist
[说明]
Count 与 Ready 各有一个值。数字 7 与布尔真属于不同类型。
:::

## 数组按位置保存项目
<!-- sources: apple, quick, fixed -->
数组的子项按出现先后读取。它可以用数字位置标明每一项，各项不需有名称。数组内也可再放一个属性列表允许的容器值。

:::example 显示两个数组项目
[输入]
\<plist version="1.0">
\<array>
\<string>A\</string>
\<string>B\</string>
\</array>
\</plist>
[结果]
plist => [
	0 => "A"
	1 => "B"
]
/plist
[说明]
A 在前，B 在后。数字来自数据项的相对位置。
:::

## XML 与二进制表示
<!-- sources: apple, quick, fixed -->
属性列表文件可以是 XML，也可使用二进制表示。用标签识别与分行替换形成的查看文本，需要已是 XML 且具有可识别的根和行边界。遇到二进制 plist 时，应根据其实际格式解析，保留原始字节以便核对。

## 常见误区
- 相同的文件后缀不表示内部一定是 XML。
- 查看器中的键值箭头属于排版，不能直接当作 JSON 或原 plist。
- data 标签里的 Base64 文本需要另行解码才能得到二进制字段。
