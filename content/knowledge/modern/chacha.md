---
capabilityId: op:ChaCha
title: ChaCha
topicGroup: modern
summary: 通过模加、异或和旋转生成密钥流，按字节与消息异或。
aliases:
  - ChaCha
  - 加法、异或和循环移位生成密钥流
sources:
  - id: rfc
    title: RFC 8439：ChaCha20 and Poly1305 for IETF Protocols
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8439.html
    language: en
    kind: standard
    locator: 2.1–2.4 节及附录 A.1
  - id: author
    title: ChaCha, a variant of Salsa20
    publisher: Daniel J. Bernstein
    url: https://cr.yp.to/chacha/chacha-20080128.pdf
    language: en
    kind: author-spec
    locator: 第 2 节，四分之一轮与变体
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相应操作的模式、字节表示与功能描述
---

## 介绍
<!-- sources: rfc, author -->

ChaCha 是流密码。它生成连续的伪随机字节并逐字节与明文异或，解密时以相同条件生成同样字节再异或。ChaCha20 的 20 指轮数。

## 四分之一轮
<!-- sources: rfc, author -->

状态含十六个 32 位字。四分之一轮对四个字依次做 32 位加法、异或与左旋，四次旋转量为 16、12、8、7。列轮和对角轮交替，使各处输入进入彼此的计算。

## 初态与计数器
<!-- sources: rfc, chef -->

IETF ChaCha20 的状态包括常量、32 字节密钥、32 位计数器和 12 字节 nonce。完成轮变换后，加回原状态并以小端字节排列输出。消息跨过 64 字节块时使用后续计数器。

:::example RFC 8439 分组起始字节
[输入]
密钥 000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F
nonce 000000090000004A00000000，计数器 1，ChaCha20，16 字节全零输入
[结果]
10 F1 E7 E4 D1 3B 59 15 50 0F DD 1F A3 20 71 C4
[说明]
零字节异或不改变流，结果可与第 2.3.2 节向量的前 16 字节比较。
:::

## 可逆异或
<!-- sources: rfc, chef -->

当密钥、nonce、计数器和轮数匹配时，变换两次抵消。示例中的全零配置只用于公开验证。

:::example 读取公开测试流
[输入]
32 字节全零密钥、12 字节全零 nonce、计数器 0、ChaCha20，输入 00 00
[结果]
76 B8
[说明]
输出就是测试密钥流起点。
:::

:::example 异或非零字节
[输入]
沿用前例配置，输入 01 FF
[结果]
77 47
[说明]
01 ⊕ 76 = 77，FF ⊕ B8 = 47。
:::

## 认证与记录格式
<!-- sources: rfc, chef -->

RFC 8439 同时定义 ChaCha20-Poly1305 认证加密。单独执行 ChaCha 时只生成异或结果，单独一段密文不会附带这套协议的认证标签。解析已归档材料时，还应核实 nonce 的长度与计数器字段的位置。

## 常见误区

- ChaCha20 的 20 属于轮数，密钥不是 20 字节。
- 重新使用密钥流会让两份密文之间暴露对应关系。
- 同名配方可能有不同 nonce 和计数器布局，需要对齐算法实例。

