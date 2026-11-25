---
capabilityId: native:code-sql
title: SQL / SQLite
topicGroup: programming
summary: 用 SQLite 的表、分组、类型与空值规则解释浏览器执行结果。
aliases:
  - SQLite
  - SQL 查询
  - SQL.js
  - 数据库分组
sources:
  - id: select
    title: SQLite SELECT
    publisher: SQLite
    url: https://www.sqlite.org/lang_select.html
    language: en
    kind: official-doc
    locator: 分组、聚合、排序和结果行
  - id: types
    title: Datatypes In SQLite
    publisher: SQLite
    url: https://www.sqlite.org/datatype3.html
    language: en
    kind: official-doc
    locator: 存储类型、亲和性和比较
  - id: expr
    title: SQL Language Expressions
    publisher: SQLite
    url: https://www.sqlite.org/lang_expr.html
    language: en
    kind: official-doc
    locator: 运算符与 NULL 处理
  - id: local
    title: 代码执行 Worker
    publisher: 迷雾工具箱
    url: /coderunner/worker.js
    language: zh-CN
    kind: implementation
    locator: executeSQL 逐条执行、结果表和数据库导出
---

## 介绍
<!-- sources: select, local -->

SQL 用语句描述需要从表中读取或修改的内容。SQLite 是数据库引擎，它可以建表、执行查询并导出数据库。SELECT 产生记录集，而建表与修改语句的作用体现于数据库状态。

## 分组与排序
<!-- sources: select -->

GROUP BY 将同键行归入一组，COUNT(*) 给出一组的行数。ORDER BY 指明结果排列。没有排序子句的查询即使刚好按预期顺序显示，也没有排序承诺。

:::example 生成有序统计
[输入]
CREATE TABLE clue(x); INSERT INTO clue VALUES (2),(1),(2); SELECT x, COUNT(*) FROM clue GROUP BY x ORDER BY x;
[结果]
[1,1]
[2,2]
[说明]
x 为 1 的记录出现一次，为 2 的出现两次，按 x 升序排列。
:::

## 字面值与存储类型
<!-- sources: types -->

SQLite 的值可存储为 NULL、INTEGER、REAL、TEXT 或 BLOB。声明列类型会影响亲和性，但表达式里的引号也有语义。直接写数字和写数字外观的字符串，可通过 typeof 分辨。

:::example 相同外观的不同类型
[输入]
SELECT typeof(2), typeof('2');
[结果]
["integer","text"]
[说明]
第一个是整数字面值，第二个是被引号包围的文本。
:::

## 空值比较
<!-- sources: expr, local -->

NULL 表示未知或缺失。用等号比较 NULL 通常得到 NULL，判断某值是否确实为空用 IS NULL。查询结果的数值 1 在 SQLite 中可表示真，空值仍保持空。

:::example NULL 与自身的两种比较
[输入]
SELECT NULL = NULL, NULL IS NULL;
[结果]
[null,1]
[说明]
前一项是未知比较，后一项为空值判断。
:::

## 导入状态与导出快照
<!-- sources: select, local -->

执行多条语句时，后面的查询可以读取同一次执行中刚插入的数据。在独立执行中重新加载原数据库，得到的是原文件已有状态。若要保留一次运行产生的数据库修改，需要保存运行后的快照。

## 常见误区

- 无 ORDER BY 时不能根据历史显示推断下一次的顺序。
- NULL 不等于空字符串，也不能用等号测试为空。
- 查询行打印与数据库文件保存是两件独立的事。
