---
capabilityId: op:SIGABA
title: SIGABA 密码机
topicGroup: classical
summary: 用两组独立的控制轮网络决定主密码轮的步进。
aliases:
  - SIGABA
  - 三组轮控制不规则步进
  - ECM II
  - M-134-C
sources:
  - id: artifact
    title: SIGABA / ECM II
    publisher: Crypto Museum
    url: https://www.cryptomuseum.com/crypto/usa/sigaba/
    language: en
    kind: author-spec
    locator: 机械结构与三组转子
  - id: manual
    title: History of Converter M‑134‑C, Volume I
    publisher: 美国国家安全局解密档案
    url: https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/friedman-documents/patent-equipment/FOLDER_123/41768449080756.pdf
    language: en
    kind: official-doc
    locator: 控制转子、索引转子、主密码转子
  - id: nsa
    title: SIGABA / ECM
    publisher: 美国国家密码博物馆
    url: https://www.nsa.gov/History/National-Cryptologic-Museum/Exhibits-Artifacts/Exhibit-View/Article/2719165/sigabaecm/
    language: en
    kind: official-doc
    locator: 实体展品与使用历史
  - id: engine
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: SIGABA
  - id: source
    title: CyberChef 11.5.0 固定源码
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/SIGABA.mjs
    language: en
    kind: implementation
    locator: 操作的消息通路与轮配置
---

## 介绍
<!-- sources: nsa, manual -->

SIGABA 是二战时期美国使用的机电密码机，海军称 ECM。可拆换转子以内部接线实现字母变换。为改变相邻位置的映射，机器用独立装置控制转子的推进。

## 三组转子与两条通路
<!-- sources: manual, artifact -->

密码轮、控制轮、索引轮各五只。消息字母经过密码轮组。控制轮输出经归并连线送入十触点索引轮，把信号分配给对应的密码轮步进回路。

:::example 清点三个银行
[输入]
密码轮组、控制轮组、索引轮组均为 5 只
[结果]
总数 15；消息变换只经第一组 5 只
[说明]
后两组的作用会通过下一状态影响后续字母。
:::

## 不规则步进
<!-- sources: manual, artifact -->

控制轮的两个外侧转子在处理消息时保持静止，中间轮按机械规则变化。索引轮在每条消息内保持设定，路由这一组控制信号。哪些密码轮被推动由信号抵达的线路决定。

## 加密与解密方向
<!-- sources: manual, source -->

每个位置的字母替换是可逆的接线路径。接收侧在相同初值下使用反向字母变换，并复现相同的步进序列。多收到或少收到字符可能导致之后失去同步。

## 短样例和重复输入
<!-- sources: engine, source -->

以下演示使用内置的重复轮接线和大写起点 A，索引轮起点 0，全部使用预置方向。这是一套可复算的模拟配置。

:::example 正向和反向
[输入]
以演示配置加密 HELLO
[结果]
HIPGI；重置后解密为 HELLO
[说明]
再运行前恢复起始状态。
:::

:::example 重复字母
[输入]
以演示配置加密 AAAAA
[结果]
EAIJJ；重置后解密为 AAAAA
[说明]
不同位置的轮状态允许不同结果，也允许偶合。
:::

## 转子表的核对
<!-- sources: manual, artifact, engine -->

还原历史样例时，记录要区分轮组、轮序、插入方向和初始位置。只掌握一张密码轮接线表仍无法重现整个步进控制；适合先比对少量字母，再验证全段。

## 常见误区

- 十五只轮各有电气作用，只有密码轮直接变换消息字母。
- 十触点索引轮的端子编号不等于消息字母表。
- 控制轮与索引轮均影响步进，初值不能只记录密码轮。
- 选择加密和解密方向时仍须恢复同一消息初值。

