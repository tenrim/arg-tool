---
capabilityId: pair:Ascon%20Encrypt
title: Ascon
topicGroup: modern
summary: Ascon-AEAD128 将明文加密，并为消息和关联数据生成认证标签。
aliases:
  - Ascon Encrypt
  - Ascon Decrypt
  - 海绵状态与认证标签
sources:
  - id: nist
    title: NIST SP 800-232：Ascon 轻量密码标准
    publisher: NIST
    url: https://csrc.nist.gov/pubs/sp/800/232/final
    language: en
    kind: standard
    locator: Ascon-AEAD128 初始化、关联数据、明文处理和最终认证
  - id: kat
    title: Ascon-AEAD128 已知答案文件
    publisher: Ascon 项目
    url: https://github.com/ascon/ascon-c/blob/main/crypto_aead/asconaead128/LWC_AEAD_KAT_128_128.txt
    language: en
    kind: implementation
    locator: Count 1、2；16 字节密钥、nonce 与认证输出
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相应操作的模式、字节表示与功能描述
---

## 介绍
<!-- sources: nist -->

Ascon 是一族面向资源受限设备的密码算法。Ascon-AEAD128 接受密钥、nonce、明文和可选的关联数据，并返回密文与认证标签。Ascon 的哈希和可扩展输出函数另有目标与接口。

## 内部状态与数据分段
<!-- sources: nist, chef -->

五个 64 位字组成 320 位状态。置换包含轮常量注入、非线性替换和各字的线性扩散。初始化和收尾使用较长置换，区块之间继续用置换更新状态。空明文也会走认证收尾。

:::example 空消息的标签
[输入]
密钥 000102030405060708090A0B0C0D0E0F
nonce 101112131415161718191A1B1C1D1E1F，无明文及关联数据
[结果]
4F9C278211BEC9316BF68F46EE8B2EC6
[说明]
密文长度为零，输出全是 16 字节认证标签。
:::

## 关联数据
<!-- sources: nist, kat -->

关联数据经过吸收与认证，保持原样在别处传输。例如版本号和封包头需要读取，同时也需要防止被替换。其值或长度改变时，认证结果也随之改变。

:::example 只有关联数据
[输入]
沿用前例密钥与 nonce，无明文，关联数据 30
[结果]
CCCB674FE18A09A285D6AB11B35675C0
[说明]
参考向量 Count 2，验证关联数据即使不加密也影响收尾。
:::

## 输出边界与认证失败
<!-- sources: nist, chef -->

Ascon-AEAD128 的输出由与明文等长的密文和其后的 16 字节标签组成。解密需要关联数据一致。标签验证失败时，结果不能作为明文，即使有的界面只显示空白。

:::example 拆分加密结果
[输入]
密钥与 nonce 均为 000102030405060708090A0B0C0D0E0F
明文 00010203，无关联数据
[结果]
密文 E770D289
标签 723DBD7401E58C36EB488D1520305D0F
[说明]
合并两段验证可恢复 00010203。末字节从 0F 改为 0E 时验证失败。
:::

## 版本与材料解读
<!-- sources: nist, kat -->

比对旧材料时应确认具体 Ascon 实例和标准版本。已标准化的 Ascon-AEAD128 与早期竞赛方案的序列化规则和初始常量存在差异。使用公开向量可先确认实现匹配，再解释真实数据。

## 常见误区

- 空明文仍会产生认证标签。
- 关联数据可公开读取，其完整性依赖标签验证。
- 同一密钥下不能因为明文不同就重复使用 nonce。

