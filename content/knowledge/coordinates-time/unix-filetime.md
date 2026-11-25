---
capabilityId: pair:UNIX%20Timestamp%20to%20Windows%20Filetime
title: UNIX / Windows 时间戳
topicGroup: coordinates-time
summary: 在 UNIX 纪元时间与 Windows FILETIME 的百纳秒计数间换算，核对整数刻度与端序。
aliases:
  - UNIX Timestamp to Windows Filetime
  - Windows Filetime to UNIX Timestamp
  - FILETIME
  - 100 ns
sources:
  - id: unix
    title: Linux time(2)
    publisher: Linux man-pages
    url: https://man7.org/linux/man-pages/man2/time.2.html
    language: en
    kind: official-doc
    locator: Epoch、POSIX 秒数与 32 位范围限制
  - id: ms
    title: FILETIME structure
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/windows/win32/api/minwinbase/ns-minwinbase-filetime
    language: en
    kind: official-doc
    locator: 64 位无符号结构、1601 UTC 与 100 ns 单位
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: UNIX Timestamp to Windows Filetime 与 Windows Filetime to UNIX Timestamp
---

## 介绍
<!-- sources: unix, ms -->
Windows FILETIME 是从 1601 年 1 月 1 日 00:00:00 UTC 起计的 100 纳秒单位数，用 64 位整数存储。UNIX 时间的纪元是 1970 年 1 月 1 日 00:00:00 UTC。两种表示必须同时换算起点和单位。

## 纪元差和刻度
<!-- sources: unix, ms, engine -->
从 1601 年纪元到 1970 年纪元隔 134774 日。每个日历日按 86400 秒换算，得到 11644473600 秒。若 UNIX 时间以秒为 t，FILETIME 计数为 (t＋11644473600)×10000000；反向换算先按每秒 10000000 个单位求秒，再减纪元差。

## 字节顺序与小数
<!-- sources: ms, engine -->
十六进制大端从最高有效字节写起，小端从最低有效字节写起；交换时以两位十六进制为单位。规范 FILETIME 是整数。若用户输入的纳秒并非 100 的整数倍，公式可算出小数刻度，当前十进制输出也可能写出小数，这种值还需要按具体协议处理才可存为 FILETIME。

## 精确值和字节示例
<!-- sources: unix, ms, engine -->
以下示例按大整数计算。十六进制值可加前导零补齐八字节。

:::example UNIX 纪元
[输入]
UNIX 时间戳 0 秒，输出十进制 FILETIME
[结果]
116444736000000000
[说明]
此时经过的时间就是两纪元之差，乘每秒 10000000 个单位。
:::

:::example 同一数值的两种端序
[输入]
UNIX 时间戳 1 秒，分别输出大端和小端十六进制
[结果]
大端 01 9D B1 DE D5 D7 16 80
小端 80 16 D7 D5 DE B1 9D 01
[说明]
数值增加了 10000000 个单位，排列顺序以字节为单位反转。
:::

:::example 纪元后一个 FILETIME 单位
[输入]
十进制 FILETIME 116444736000000001，输出 UNIX 纳秒
[结果]
100
[说明]
减去 UNIX 纪元对应的计数后剩 1，乘 100 得 100 纳秒。
:::

## 文件时间与业务含义
<!-- sources: ms, unix -->
以 FILETIME 表示的字段可用于不同时间属性，具体含义由文件系统或记录格式决定。100 纳秒是表示单位，即便存储为细粒度刻度，实际时钟或文件系统的测量精度仍可能较粗。

## 常见误区
- FILETIME 的 0 与 UNIX 的 0 不是同一时刻。
- 存储单位 100 纳秒不能证明实际时钟具备同样精度。
- 小端写法反转字节排列，不能逐个反转十六进制字符。
