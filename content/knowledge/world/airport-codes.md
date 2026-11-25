---
capabilityId: native:airports
title: 机场代码
topicGroup: world
summary: 识别 IATA 位置代码、ICAO 机场标识和数据中的本地编号。
aliases:
  - IATA
  - ICAO
  - PEK
  - ZBAA
  - 机场三字码
sources:
  - id: iata
    title: Airline and Airport Codes Search
    publisher: IATA
    url: https://www.iata.org/codes/
    language: en
    kind: official-doc
    locator: IATA 航空公司和机场代码检索
  - id: facts
    title: IATA Location Codes
    publisher: IATA
    url: https://www.iata.org/en/iata-repository/pressroom/fact-sheets/fact-sheet-iata-location-codes/
    language: en
    kind: official-doc
    locator: 三字母位置代码用于机场、城市或联运点
  - id: our
    title: OurAirports Data Dictionary
    publisher: OurAirports
    url: https://ourairports.com/help/data-dictionary.html
    language: en
    kind: official-doc
    locator: airports.csv 的 ident、icao_code、iata_code 和经纬度
  - id: lookup
    title: 地区和运输参考表读取
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: queryRecords、国家标识与运输字段
---

## 介绍
<!-- sources: iata, facts, our -->

客运票据常用 IATA 三字母位置代码标记目的地，飞行计划等运行资料常见 ICAO 标识。一个机场可以在多个体系中被指向，同义指向依赖代码表。

## 三字母位置码
<!-- sources: iata, facts -->

IATA 位置码可以指定机场，也可能指服务城市或联运场站。看到三个字母后应查位置类别，机场名和服务城市不总相同。

:::example 北京首都机场
[输入]
PEK
[结果]
北京首都国际机场；ICAO 标识 ZBAA
[说明]
PEK 与 ZBAA 指同一记录，分别适用于不同字段。
:::

## 四字母和地方标识
<!-- sources: our, lookup -->

数据中的主键可能存 ICAO 标识、本地标识或数据项目生成的键。长度相近不是判断依据，必须看字段类型。小型机场即使没有 IATA 代码，也可能出现在资料中。

:::example 东京羽田记录
[输入]
HND
[结果]
Tokyo Haneda International Airport；RJTT；JP
[说明]
对照 IATA、ICAO 和所属地区三列。
:::

## 经纬度和海拔
<!-- sources: our, lookup -->

机场资料的纬度北正南负，经度东正西负，两个数的储存顺序可以因格式不同而换位。海拔字段有独立单位，再用于计算前先读单位。

:::example 纽约肯尼迪机场
[输入]
JFK
[结果]
KJFK；纬度约 40.6394°，经度约 −73.7793°
[说明]
负经度表示西经，坐标落在美国纽约近郊。
:::

## 代码使用范围
<!-- sources: facts, our, lookup -->

数据库包含不同类别的地点和机场。用国家、服务城市和机场名交叉确认，可以减少文本匹配造成的误选。第三方参考仍需和近期出票或运行资料对照。

## 常见误区

- 城市代码和具体机场代码可能不同。
- 不应把找到的任意长四字符字段都当成 ICAO 标识。
- 历史或小型机场记录存在，不代表当前有定期航班。

