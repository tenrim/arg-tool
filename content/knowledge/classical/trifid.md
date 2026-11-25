---
capabilityId: native:classical-trifid
title: Trifid 密码
topicGroup: classical
summary: 用三维坐标拆分并重新组合各组字符的分式替换。
aliases:
  - Trifid
  - 三分密码
  - 立方体密码
sources:
  - id: aca
    title: Trifid
    publisher: American Cryptogram Association
    url: https://www.cryptogram.org/downloads/aca.info/ciphers/Trifid.pdf
    language: en
    kind: author-spec
    locator: 27 字符表、按周期重组及校对向量
  - id: original
    title: Traité élémentaire de cryptographie
    publisher: Félix-Marie Delastelle
    url: https://archive.org/details/8VSUP3207b
    language: fr
    kind: author-spec
    locator: 三坐标分式变换的原始著作
  - id: military
    title: Military Cryptanalysis Part IV
    publisher: William F. Friedman / U.S. War Department
    url: https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_452/41749819078904.pdf
    language: en
    kind: official-doc
    locator: Transposition and Fractionating Systems
  - id: asu
    title: Trifid Ciphers
    publisher: Arizona State University
    url: https://math.asu.edu/sites/g/files/litvpz216/files/trifid.pdf
    language: en
    kind: official-doc
    locator: 三行坐标、周期与反演
  - id: code
    title: 原生古典密码实现
    publisher: 迷雾工具箱
    url: /expansion/classical-core.js
    language: zh-CN
    kind: implementation
    locator: trifidResult 的按组取坐标与反排
---

## 介绍
<!-- sources: original, military, aca -->
Trifid 是 Delastelle 的三维分式替换密码。它把每个字元分解为层、行、列三个坐标，再将同组字元的坐标按分量重新排布并映射回字元表。

## 三层方阵和二十七个位置
<!-- sources: aca, asu, code -->
三层各有 3×3 方阵，共 27 个位置。坐标的三个分量分别取 1 至 3。在常用的表中，26 个拉丁字母后接一个附加符号 #。关键词参与生成表时先去重再补齐未出现的符号。附加符号是可变换的字元。

## 按组横接三个坐标分量
<!-- sources: aca, asu, code -->
将每组字元的坐标竖写为三行，再按整行从上向下拼接。把拼接结果顺序切为三位码，从同一坐标表查回密文字元。每组分别处理，最后一组的长度可以短于指定周期。

:::example 默认表的两字符推导
[输入]
明文 AD，周期 2
[结果]
AJ
[说明]
A 为 111，D 为 121。逐行写为 11 / 12 / 11，拼接后切成 111 与 211，得到 A 和 J。
:::

## 解密从连续坐标流恢复行
<!-- sources: aca, asu, code -->
对一组密文先按每个字元读三个分量，即按密文字元的坐标顺序连成一条长串。将长串分成三个等长片段，再按列分别取一个层、行、列恢复原字元。

:::example 解开不整齐的末组
[输入]
密文 ABG#ZYZ，默认表，周期 2
[结果]
ABC#XYZ
[说明]
按 AB / G# / ZY / Z 分成四组，末组只剩单字符 Z，三坐标重排后仍是 Z。
:::

## 公开样例和周期退化
<!-- sources: aca, original, code -->
每组需要固定方阵、实际组长和一致的坐标次序。周期为 1 时，一组只有一列，按行拼接仍得到原来的三个坐标，所以不会改变文字。

:::example 公开方阵的整组往返
[输入]
关键词 EXTRAORDINARY，周期 10，明文 TRIFIDSAREFRACTIONATEDCIPHERS
[结果]
EYMXVUCRYYYYEAYVYOVVXITDPATHE
[说明]
按三行坐标处理前两个十字符组与其后的短组，按相同周期逆向可恢复原文。
:::

## 常见误区

- # 在默认表中有对应坐标，不是每组都需要插入的填充。
- 最后一组不宜按仍有完整周期长度逆排。
- 周期 1 不产生真正的分式重排。
- 换成另一套方阵或另一种坐标分量顺序会改变输出。
