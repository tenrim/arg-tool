---
capabilityId: op:GOST%20Verify
title: GOST 消息认证校验
topicGroup: authentication
summary: 以同一共享密钥与取标签规则重算 MAC，再与收到的标签比较。
aliases:
  - GOST Verify
  - 用同一对称密钥核对 MAC
sources:
  - id: gost
    title: "RFC 5830：GOST 28147-89: Encryption, Decryption, and MAC Algorithms"
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc5830.html
    language: en
    kind: standard
    locator: 第 4–7 节，分组变换与 MAC
  - id: cp
    title: RFC 4357：Additional Cryptographic Algorithms for GOST
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4357.html
    language: en
    kind: standard
    locator: 第 8、11 节，参数集标识及替换表
  - id: verify
    title: GOSTVerify 源代码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/GOSTVerify.mjs
    language: en
    kind: implementation
    locator: run，按给定标签长度比较并返回结果
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: gost, verify -->

验证 GOST 消息认证码需要收到的消息、标签和共享密钥。验证端按原规则从消息重算标签，与接收值比较。返回值说明是否匹配，而不是生成签名者身份。

## 消息、算法和标签的边界
<!-- sources: gost, cp, chef -->

原始消息字节、分组密码变体和 S 盒都需要明确。标签前导零也算字节，不能先当整数删掉。下列例子使用固定演示配置和独立的十六进制标签。

:::example 正确样本
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 43，标签 97 43 95 C2。
[结果]
匹配
[说明]
相同消息和密钥重现原标签。
:::

## 篡改单个字节
<!-- sources: gost, verify -->

输入消息只改变一个字节时，标签仍须重新计算。原标签常常会因改变而无法通过；比较失败不能指出究竟是消息、密钥还是标签发生变化。

:::example 消息被改动
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 44，标签仍为 97 43 95 C2。
[结果]
不匹配
[说明]
新消息算得 4F E5 64 66。
:::

## 标签本身的完整记录
<!-- sources: gost, verify, chef -->

验证程序按接收到的标签宽度进行比较。实践中还需由协议单独要求预期宽度。永远不能因为长标签不同就只比较最前面的几个字节。

:::example 标签被改动
[输入]
GOST 28147-89、E-A，密钥 000102030405060708090A0B0C0D0E0F 重复两次，8 字节全零 IV。
消息 41 42 43，标签改为 97 43 95 C3。
[结果]
不匹配
[说明]
虽然前三字节相同，完整的 32 位值不同。
:::

## 验证结果的解释
<!-- sources: gost, cp -->

通过表示这些字节在给定共享密钥和规则下匹配标签。需要另行考虑消息是不是旧记录重发、发送者是否唯一，以及协议是否还有加密和身份规则。

## 常见误区

- 匹配不能证明消息从未被重放。
- 不同标签长度提供不同程度的保障。
- 消息认证校验无法解密或修改原文。

