---
capabilityId: native:ports
title: 港口与运输地点代码
topicGroup: world
summary: 按 UN/LOCODE 的五字符组合、处理状态与运输功能字段读位置。
aliases:
  - UN/LOCODE
  - CNSHA
  - 港口
  - 运输代码
sources:
  - id: unece
    title: Recommendation No. 16：UN/LOCODE
    publisher: UNECE
    url: https://unlocode.unece.org/recommendation16/
    language: en
    kind: standard
    locator: 结构和用途，国家／地区与地点码
  - id: attrs
    title: UN/LOCODE Data Attributes
    publisher: UNECE
    url: https://unlocode.unece.org/docs/data-attributes/
    language: en
    kind: standard
    locator: 地点功能、状态、坐标及日期
  - id: lookup
    title: 地区和运输参考表读取
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: queryRecords、国家标识与运输字段
  - id: data
    title: UN/LOCODE 离线记录
    publisher: 迷雾工具箱
    url: /vendor/reference/ports.json
    language: zh-CN
    kind: implementation
    locator: CNSGH、JPTYO、USNYC 的功能和坐标
---

## 介绍
<!-- sources: unece -->

UN/LOCODE 用于国际贸易和运输地点。它把国家或地区代码和本地唯一的地点码拼在一起，识别对象可以是城市、港口、机场和其他运输地点。

## 前缀与地点码
<!-- sources: unece, attrs -->

前两字母来自 ISO 3166-1，后三字符为地点码。书写时前后部分有时以空格分隔，电子数据常将五个字符紧写。只剩后三字符时可能跨国重复。

:::example 拆分一个完整代码
[输入]
JP TYO
[结果]
日本；地点代码 TYO；记录 JPTYO 对应 Tokyo
[说明]
运输功能列可同时列出港口、铁路、公路、机场等。
:::

## 多功能与状态列
<!-- sources: unece, attrs, data -->

功能字段可以标记一个地点具有多种运输用途。单独的状态列描述代码记录的批准或来源状态，并不表示某港口当天开放。资料缺少某个功能时，仍可按其它已记载功能检索。

:::example 从上海地区记录识别功能
[输入]
CNSGH
[结果]
Shanghai；港口、铁路、公路、机场、邮政交换
[说明]
同一个代码可表示有多种运输功能的地点。
:::

## 度分坐标转十进制
<!-- sources: attrs, lookup -->

坐标常写成紧凑的度数和分数，再跟 N/S 或 E/W 标记方向。十进制度值为度数加分数除以 60。南纬与西经取负。

:::example 纽约记录的坐标
[输入]
USNYC；4042N 07400W
[结果]
纬度 40.7°，经度 −74°
[说明]
40°42′ 等于 40.7°，074°00′W 是负 74°。
:::

## 与其他地点码交叉核对
<!-- sources: attrs, unece, data -->

后三字符外形可能和机场三字码相似，仍须按完整 UN/LOCODE 和地点功能核对。记录日期、状态、行政区和坐标帮助判断是在读当前地点还是历史编码。

## 常见误区

- 五字符代码的末三位不是独立的全球机场标识。
- 港口标记不排除同条记录还包含铁路或机场。
- 坐标的度和分数不能直接拼成十进制小数。

