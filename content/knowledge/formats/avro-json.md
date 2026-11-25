---
capabilityId: op:Avro%20to%20JSON
title: Avro 转 JSON
topicGroup: formats
summary: Avro 二进制数据按照写入模式解释。对象容器文件在头部携带模式和压缩信息，转换后可用 JSON 读取记录。
aliases:
  - Avro to JSON
  - Apache Avro
  - Avro 对象容器文件
  - Avro OCF
sources:
  - id: spec
    title: Apache Avro 1.11.2 Specification
    publisher: Apache Software Foundation
    url: https://avro.apache.org/docs/1.11.2/specification/
    language: en
    kind: standard
    locator: Binary Encoding、Object Container Files、Schema Resolution
  - id: started
    title: Apache Avro 1.11.2 Getting Started (Python)
    publisher: Apache Software Foundation
    url: https://avro.apache.org/docs/1.11.2/getting-started-python/
    language: en
    kind: official-doc
    locator: 序列化数据、模式与容器读写
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Avro to JSON，读取容器和列出记录
---

## 介绍
<!-- sources: spec, started -->
Apache Avro 用模式描述字段类型和顺序，再根据模式将值编码为二进制。对象容器文件（OCF）携带写入模式、压缩方式及同步标记。读取端可沿文件头和块结构还原记录，并将其整理为 JSON。

## 模式与字段顺序
<!-- sources: spec -->
二进制记录先写模式中的第一字段，再写第二字段，以此类推。每条记录的内容一般不重复存储字段名。若模式规定整数后接字符串，先读变长整数，然后读字符串长度及其 UTF-8 字节。

:::example 两条定序记录的块载荷
[输入]
模式字段 x 为 int，label 为 string。
未压缩块的两条记录载荷为 01 02 41 AC 02 04 C3 A9。
[结果]
[{"x":-1,"label":"A"},{"x":150,"label":"é"}]
[说明]
前一条为整数 −1 和一字节字符串 A，后一条为整数 150 和两字节字符串 é。字段名由配套模式提供。
:::

## ZigZag 与 UTF-8 字节数
<!-- sources: spec -->
int 和 long 用 ZigZag 转换后以低七位组在先的变长格式写入。字符串的字节数作为非负 long 写入，再接 UTF-8 内容。例如长度 2 的 ZigZag 值为 4，首字节便为 04。

:::example 不含字段名的四条整数
[输入]
模式为 long，四条记录载荷为 00 01 02 AC 02。
[结果]
[0,-1,1,150]
[说明]
00、01、02 分别是 0、−1、1 的编码。AC 02 组成无符号值 300，再由 ZigZag 还原为 150。
:::

## 文件头和数据块
<!-- sources: spec, started, fixed -->
OCF 的开头字节是 4F 62 6A 01。头部的元数据保存 avro.schema，并可声明 avro.codec。16 字节同步标记在文件头及每个块之后出现。每个数据块先写记录数和块数据的字节数，再写块载荷及同一个同步标记。

:::example 以块数值读出一个布尔和一个整数
[输入]
记录字段 on 为 boolean，count 为 int。
压缩方式为 null，记录数是 1，块载荷是 01 0A。
[结果]
{"on":true,"count":5}
[说明]
块开头会写 02 04 来表示一条记录和两字节载荷。载荷的 01 是 true，0A 是整数 5 的 ZigZag 编码。
:::

## 读写模式与转出 JSON
<!-- sources: spec, started, fixed -->
读取时使用写入模式还原二进制，还可依规范将数据映射到另一个兼容的读取模式。字节串和联合类型在转出 JSON 时可能有额外表示。块载荷例子用于复算，独立文件还需要相应头部、元数据和同步标记。

## 常见误区
- OCF 的文件标识、同步标记和数据块字段各有作用。
- 单有记录字节而无模式，不能据此恢复完整的字段名称和类型。
- int、long 和字符串长度用各自规定的编码，文本字节数也不能用字符数代替。
