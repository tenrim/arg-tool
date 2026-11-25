---
capabilityId: op:SQL%20Beautify
title: 格式化 SQL
topicGroup: formats
summary: 将 SQL 子句和嵌套查询重新缩进，使结构便于阅读。
aliases:
  - SQL 美化
sources:
  - id: pg
    title: PostgreSQL SELECT
    publisher: PostgreSQL 项目
    url: https://www.postgresql.org/docs/current/sql-select.html
    language: en
    kind: official-doc
    locator: SELECT、FROM、WHERE 与子查询
  - id: lex
    title: PostgreSQL SQL Syntax：Lexical Structure
    publisher: PostgreSQL 项目
    url: https://www.postgresql.org/docs/current/sql-syntax-lexical.html
    language: en
    kind: official-doc
    locator: 引号、关键字、标识符和注释
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
---

## 介绍
<!-- sources: pg, chef -->

SQL 格式化识别常见关键字、表达式和括号，为已有的查询增加排版。它可帮助分清来源、过滤和多层选择，但执行语义仍由对应数据库决定。

## 主要子句边界
<!-- sources: pg, chef -->

SELECT 提供输出列或表达式，FROM 指定表或其它数据源，WHERE 给出过滤条件。格式化通常在子句处换行，用缩进展示随后的东西。

:::example 按两格缩进
[输入]
select a,b from t where id=1
[结果]
select
  a,
  b
from
  t
where
  id = 1
[说明]
把选择列和筛选条件分别展示，未运行任何查询。
:::

## 关键词和引号内部
<!-- sources: lex, chef -->

处在单引号中的文字可以包含 SQL 关键字形状，而整项仍是普通字符串。标识符的引号和不同 SQL 方言的字符串写法也须区分。

:::example 在选择项里读取 from 字符串
[输入]
select 'from' as x
[结果]
select
  'from' as x
[说明]
from 在引号内，未另起 FROM 子句。
:::

## 嵌套查询层次
<!-- sources: pg, chef -->

括号中的子查询常按更深的层次显示。缩进便于看出内层使用哪一个来源，不会自行改变表、字段或过滤条件。

:::example 观察 IN 子查询
[输入]
select a from t where id in(select id from u)
[结果]
select
  a
from
  t
where
  id in (
    select
      id
    from
      u
  )
[说明]
子查询里的来源 u 与外层 t 分开。
:::

## 方言和结果的边界
<!-- sources: pg, lex, chef -->

数据库可加入各自的运算符、值引用及注释扩展。排版可以明确原文本结构，不能检验引用的表是否存在，也不会给出实际读取行数。

## 常见误区

- 格式化不是执行或查询计划分析。
- 引号内的词不能拆作实际子句。
- 语法是否有效仍要对应数据库方言判断。

