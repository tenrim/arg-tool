---
capabilityId: op:Show%20Base64%20offsets
title: Base64 偏移
topicGroup: encoding
summary: 分析已知字节片段处在三种分组起点时的稳定字符和边界变化。
aliases:
  - Show Base64 offsets
  - Base64 分组偏移
sources:
  - id: rfc
    title: RFC 4648 — Base16、Base32 与 Base64 数据编码
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 3–10 节
  - id: engine
    title: CyberChef 随站操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Show Base64 offsets
  - id: module
    title: CyberChef 固定版本的 ChefWorker 运算入口
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Show Base64 offsets 的对齐与稳定区间
---

## 介绍
<!-- sources: rfc, engine -->

Base64 每三个字节重新开始一组。一个目标字节串嵌在较长数据中时，起点可能落在组内第 0、1 或 2 个字节。即使目标内容完全相同，三种起点也会改变它在六位索引中的落点。

## 三种起点
<!-- sources: rfc, module -->

假设目标前有 k 个字节，则偏移为 k mod 3。偏移描述的是编码前的字节对齐，和编码字符串里的字符下标属于不同单位。

:::example 同一目标位于三种位置
[输入]
目标字节 A。完整输入依次为 A、BA、BBA。
[结果]
A → QQ==
BA → QkE=
BBA → QkJB
[说明]
前置 B 用来构造三个真实的完整串。三个结果都含 A 的内容，但 A 在六位分组中的起点不同。
:::

## 稳定索引和边界索引
<!-- sources: rfc, module -->

六位索引若只用到目标片段里的位，其字符不受相邻字节改变。若一个索引同时使用目标片段和未知邻字节的位，该字符就可能变化。只有恰好到达原始输入末尾时，才会产生末组填充。

:::example 增加后继字节
[输入]
同样以 A 开头，分别编码 A 和 AF
[结果]
A → QQ==
AF → QUY=
[说明]
第一个索引完全由 A 的高六位组成，两个结果都以 Q 开头。第二个索引还受后继字节 F 的高位影响，单独编码 A 时的等号也不会在这里复用。
:::

## 对齐示意的读法
<!-- sources: rfc, engine, module -->

对齐分析可用临时添入的零字节展示三种骨架，再把边界依赖和填充标出来。临时零字节只用于构建图示，真正的原文在这些位置可以是任意值。

:::example 零字节辅助对齐
[输入]
目标 ARG。分别在其前面放入零、一个或两个 00 字节。
[结果]
偏移 0：QVJH
偏移 1：AEFSRw==
偏移 2：AABBUkc=
[说明]
偏移 1 的完整串由 00 41 52 47 编成，偏移 2 由 00 00 41 52 47 编成。只用目标字节决定的索引可用于寻找相同片段。
:::

## 搜索线索的证据
<!-- sources: rfc, engine, module -->

在长编码串内查找已知词时，应尝试三个偏移，优先使用只由目标字节决定的连续索引。若片段短到只剩一两个稳定字符，重复命中的概率会上升，仍要解码相应区间核对实际字节。

## 常见误区

- 直接搜索一个词单独编码后的整串，会把它自己的分组起点和末尾等号也当成必然条件。
- 偏移结果中的临时零字节属于演示，无法据此推断真实邻字节。
- 未知上下文只影响跨边界的索引。完全落在已知片段里的索引仍然固定。
