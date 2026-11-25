---
capabilityId: op:Extract%20domains
title: 提取域名
topicGroup: text-language
summary: 识别文字中的点分域名和可选的服务标签，同时保留原拼写。
aliases:
  - Extract domains
  - 域名提取
  - DNS 标签
  - 域名候选
sources:
  - id: dns
    title: RFC 1034 — Domain Names — Concepts and Facilities
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1034.html
    language: en
    kind: official-doc
    locator: §3.1–3.5，DNS 名字空间和标签
  - id: idna
    title: RFC 5890 — Internationalized Domain Names for Applications
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5890.html
    language: en
    kind: official-doc
    locator: §2.3.2，A-label 与 U-label
  - id: scope
    title: RFC 8552 — DNS Underscored Attribute Leaves
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8552.html
    language: en
    kind: official-doc
    locator: §1.1，下划线名字的作用域
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract domains，普通与下划线标签
---

## 介绍
<!-- sources: dns, engine -->

域名提取从网址、邮箱和其他文本中查找层次化的名字。域名在打印时用点分隔各级标签。提取结果常用于建立文件或日志涉及的域名清单，并能保留子域层次供进一步阅读。

## 标签、根和主机
<!-- sources: dns, idna -->

在 `mirror.example.org` 中，最右侧的 org、example 和 mirror 可按层次理解。完全限定域名的末尾可以用一个点明确表示根，通常的展示会省略这一点。国际化域名还可有 `xn--` 开头的 ASCII A-label，与符合规则的 Unicode 标签对应。

## 服务相关的下划线标签
<!-- sources: scope, engine -->

普通主机名的习惯规则与 DNS 中能够出现的所有名字不完全相同。带下划线的标签常给某项服务的资源记录单独划定解释范围。例如 `_dmarc.example.org` 表明记录名有一个特定子级。是否将下划线一起提取，会改变结果的范围和含义。

## 文本提取样例
<!-- sources: dns, idna, scope, engine -->

这些样例使用专门保留给文档的域名后缀。结果仅根据文本产生，不涉及查询。比较带端口、末尾点和服务标签的片段，可以定位匹配器实际取了哪几个标签。

:::example 网址和邮件共有的成分
[输入]
https://sub.example.org:8080/a user@example.org
[结果]
sub.example.org
example.org
[说明]
第一项不含方案、端口或路径。第二项不含本地部分 user，子域仍保留在第一项里。
:::

:::example 尾点、大小写和数字地址
[输入]
Example.ORG example.org. 192.0.2.7 localhost
[结果]
Example.ORG
example.org
[说明]
大小写未改，末尾点不在结果中。此规则未把 IPv4 数字地址和 localhost 当作点分域名提取。
:::

:::example 服务标签与 A-label
[输入]
_dmarc.example.org xn--bcher-kva.example.org
[结果]
普通提取返回 example.org 与 xn--bcher-kva.example.org。允许下划线的模式识别 _dmarc.example.org 这个完整候选。
[说明]
第一个标签涉及资源记录的作用域。第二个中的 xn--bcher-kva 是 bücher 的 A-label。
:::

## 归并域名与理解上下级
<!-- sources: dns, idna, scope, engine -->

将结果归并为清单时，可以将 DNS 名字大小写差异和是否标出根的写法统一考虑。子域、服务节点和注册域是不同层次。若需要确定注册域边界或域名是否指向某个服务，应引入对应的公开后缀规则或 DNS 记录。

## 常见误区

- 提取域名不会连带保留网址的方案、查询或文件路径。
- 两个域名同属一个后缀，并不表示它们由同一个组织控制。
- 名字中有 xn-- 只是外形特征，是否为有效 A-label 仍应按 IDNA 检查。

