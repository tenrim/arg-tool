---
capabilityId: op:Convert%20co-ordinate%20format
title: 坐标格式转换
topicGroup: coordinates-time
summary: 在角度记法、投影网格与位置编码之间转换，并识别舍入和区域中心的差别。
aliases:
  - Convert co-ordinate format
  - 度分秒
  - 十进制度
  - Geohash
  - MGRS
  - UTM
sources:
  - id: angle
    title: 经纬度上的度分秒
    publisher: USGS
    url: https://www.usgs.gov/faqs/how-much-distance-does-a-degree-minute-and-second-cover-your-maps
    language: en
    kind: official-doc
    locator: 度、分、秒及两轴
  - id: grid
    title: NGA Geomatics Coordinate Systems
    publisher: NGA
    url: https://earth-info.nga.mil/?action=coordsys&dir=coordsys
    language: en
    kind: official-doc
    locator: UTM 分区和东向北向坐标、MGRS 分区和方格
  - id: os
    title: Coordinate transformations
    publisher: Ordnance Survey
    url: https://www.ordnancesurvey.co.uk/geodesy-positioning/coordinate-transformations
    language: en
    kind: official-doc
    locator: 坐标变换和英国国家格网
  - id: hash
    title: Geohash encoding and decoding
    publisher: Chris Veness
    url: https://www.movable-type.co.uk/scripts/geohash.html
    language: en
    kind: author-spec
    locator: 参考实现及按字符细分格子
  - id: engine
    title: CyberChef 11.5.0 坐标模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: Convert co-ordinate format 的格式和精度
---

## 介绍
<!-- sources: angle, grid, engine -->
地理位置可用纬度和经度的角度给出，也可用投影后的平面网格或按区域编码。度分秒、度和十进制分、十进制度是同一角度的三种记法。改写前应知道轴顺序、正负方向和原有坐标系统。

## 从度分秒到小数
<!-- sources: angle, engine -->
角度的绝对值为度数＋分数/60＋秒数/3600。南纬和西经取负，北纬和东经取正。要反向转换，可先取绝对值的整数为度，余下乘 60 得到分，再把分钟小数部分乘 60 得到秒。舍入会影响末位。

## 投影网格和位置编码
<!-- sources: grid, os, hash, engine -->
UTM 以分区和米制东向、北向值表述位置。MGRS 还包含区号与方格标识，数字位数限定方格尺度。英国的国家网格采用自己的投影及坐标参考系统；Geohash 使用字符逐步细分经纬度区域。将一个区域编码解回坐标时，得到的中心只代表该格。

## 角度、网格和编码实例
<!-- sources: angle, grid, hash, engine -->
以下以纬度在前、经度在后，结果只列坐标本身，分隔符可另行指定。

:::example 南纬与东经度分秒
[输入]
12° 30' 30" S, 34° 30' 0" E
[结果]
−12.508333°，34.5°
[说明]
30/60＋30/3600≈0.508333，纬度带 S 因而取负。
:::

:::example UTM 中央经线
[输入]
纬度 0°，经度 3°，转 UTM
[结果]
31 N 500000.000 0.000
[说明]
3°E 位于 31 区中央经线。该线的假东距是 500000 米，此例在赤道，北距为 0 米。
:::

:::example 有限长度的 Geohash
[输入]
纬度 48.858370°，经度 2.294481°，输出 6 字符的 Geohash
[结果]
u09tun；解回格中心约为 48.858948°，2.290649°
[说明]
原点位于该格内，区域编码不能保留格中的精确位置。
:::

## 复核转换结果
<!-- sources: angle, grid, os, engine -->
十进制度的 −12.508333° 换成度分秒时秒数可显示为 29.999 而非整 30，因为源小数在前一步已经舍入。地图之间还可能有参考系统差异。使用结果前应保留原格式、使用的参考系统、方向和保留位数。

## 常见误区
- 度、分、秒之间按 60 进制换算。
- 末尾增加小数位不会增加原测量精度。
- Geohash 和有位数限制的网格代码表示区域，不能凭代码还原原来的唯一点。
