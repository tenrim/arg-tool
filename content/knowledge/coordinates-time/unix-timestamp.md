---
capabilityId: pair:To%20UNIX%20Timestamp
title: UNIX 时间戳 编码与解码
topicGroup: coordinates-time
summary: 在带时区的日期时间与 UNIX 纪元计数之间换算，核对秒、毫秒及负值。
aliases:
  - To UNIX Timestamp
  - From UNIX Timestamp
  - Unix epoch
  - POSIX 时间戳
sources:
  - id: unix
    title: Linux time(2)
    publisher: Linux man-pages
    url: https://man7.org/linux/man-pages/man2/time.2.html
    language: en
    kind: official-doc
    locator: Epoch、POSIX 秒数与 32 位范围限制
  - id: rfc
    title: RFC 3339 Date and Time on the Internet
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3339
    language: en
    kind: standard
    locator: 第 4、5 节，UTC 偏移、日期、闰年与时刻表示
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: To UNIX Timestamp、From UNIX Timestamp 与单位分支
---

## 介绍
<!-- sources: unix, rfc -->
UNIX 时间戳以 1970 年 1 月 1 日 00:00:00 UTC 为纪元，按约定从这个时刻累计时间。同一时刻用不同时区写出，显示时间可能不同，对应的时间戳相同。

## 单位的差别
<!-- sources: unix, engine -->
秒、毫秒、微秒、纳秒分别用每秒 1、1000、10⁶、10⁹ 个单位计数。解析一个数字前，需要根据来源字段知道单位。固定的显示位数不能保证采集精度，当前解码路径将微秒和纳秒换算为毫秒再显示。

## 时区与时间线
<!-- sources: unix, rfc -->
带 Z 的日期时间以 UTC 表示；显式偏移 +08:00 表示当地钟面比 UTC 提前八小时。换算到 UTC 后可以参照纪元计数。POSIX 计时把每个日历日用于计数的秒数视作 86400，闰秒不单独占一个连续的时间戳。

## 纪元附近的例子
<!-- sources: unix, rfc, engine -->
以下保留明确的时间偏移，避免把当地表盘和 UTC 当作同一个表示。

:::example 纪元前一秒
[输入]
1969-12-31T23:59:59Z，按秒编码
[结果]
−1
[说明]
这个时刻比 1970 年的 UTC 纪元早整一秒。
:::

:::example 带偏移的纪元后一秒
[输入]
1970-01-01T08:00:01+08:00，按毫秒编码
[结果]
1000
[说明]
当地钟面减去八小时为 00:00:01 UTC，乘 1000 后是 1000 毫秒。
:::

:::example 毫秒回读
[输入]
1500，按毫秒解码
[结果]
1970-01-01 00:00:01.500 UTC
[说明]
1500 毫秒为 1 秒加 500 毫秒。
:::

## 超出存储范围时
<!-- sources: unix, engine -->
有符号的 32 位秒计数达到 2147483647 后再加 1 就会越界，这是特定存储或接口的边界。UNIX 时间戳的概念允许使用更宽的表示。遇到大整数纳秒值时还应关注解析器是否使用浮点数，以及输出能表示到哪一位。

## 常见误区
- 时间戳代表事件在时间线上的位置，时区影响书写而不改变既定时刻。
- 10 位或 13 位常用于辨认来源，但不能代替单位声明。
- 从纳秒计数显示到毫秒时，亚毫秒差异可能消失。
