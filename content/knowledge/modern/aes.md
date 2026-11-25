---
capabilityId: pair:AES%20Encrypt
title: AES
topicGroup: modern
summary: 以固定 128 位分组和 128、192 或 256 位密钥进行可逆变换。
aliases:
  - AES Encrypt
  - AES Decrypt
  - 128 位分组与轮变换
sources:
  - id: fips
    title: FIPS 197 更新版：Advanced Encryption Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf
    language: en
    kind: standard
    locator: 第 3–6 节，状态矩阵、轮及密钥扩展
  - id: modes
    title: NIST SP 800-38A 分组密码工作模式
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 第 5、6 节及附录 A
  - id: gcm
    title: NIST SP 800-38D：GCM and GMAC
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
    language: en
    kind: standard
    locator: 第 5、7、8 节，认证输出和 IV 唯一性
  - id: vectors
    title: AES Core：Examples with Intermediate Values
    publisher: NIST
    url: https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/example-values
    language: en
    kind: official-doc
    locator: AES-128/192/256 底层分组与工作模式测试
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相应操作的模式、字节表示与功能描述
---

## 介绍
<!-- sources: fips -->

AES 是对称分组密码。AES-128、AES-192 和 AES-256 分别使用三种长度的密钥，三种的输入块均为 16 字节。它们的完整轮数分别是 10、12 和 14。

## 状态矩阵与轮变换
<!-- sources: fips, vectors -->

16 个输入字节沿列填入 4×4 阵列。首轮前与第一个轮密钥异或，其后依次做字节替换、行移位、列混合和轮密钥加。最后一轮省去列混合。

:::example 128 位密钥
[输入]
明文 00112233445566778899AABBCCDDEEFF
密钥 000102030405060708090A0B0C0D0E0F（单块 ECB，无填充）
[结果]
69C4E0D86A7B0430D8CDB78070B4C55A
[说明]
初始轮密钥与主密钥相同，随后执行 10 轮。
:::

## 密钥扩展与逆向变换
<!-- sources: fips, vectors -->

密钥扩展通过旋转、字节替换、轮常量和异或得到各轮密钥。解密按逆序使用轮密钥并应用逆变换，分组的边界保持不变。

:::example 192 位密钥
[输入]
明文 00112233445566778899AABBCCDDEEFF
密钥 000102030405060708090A0B0C0D0E0F1011121314151617（单块 ECB，无填充）
[结果]
DDA97CA4864CDFE06EAF70A0EC0D7191
[说明]
密钥长度增加到 24 字节，块长仍为 16 字节。
:::

## 模式与填充
<!-- sources: modes, gcm, chef -->

ECB 独立处理分组，适合核对单块向量。CBC 把上一密文块带入下一次块变换。CTR 由计数器生成掩码。GCM 在加密之外还验证认证标签和关联数据，要求同一密钥下的 IV 符合唯一性要求。

## 密文材料的核对
<!-- sources: modes, vectors, chef -->

复核两份 AES 数据时需先区分字节和十六进制文本，再对齐模式、IV 与填充。若数据带认证标签，要确认它在容器里的位置和长度。有些容器还保存 salt，用于密钥派生。

:::example 256 位密钥
[输入]
明文 00112233445566778899AABBCCDDEEFF
密钥 000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F（单块 ECB，无填充）
[结果]
8EA2B7CA516745BFEAFC49904B496089
[说明]
选取 32 字节密钥，输出仍是一个分组。
:::

## 常见误区

- AES-256 的 256 指密钥位数，分组仍为 128 位。
- 十六进制密钥的打印长度是字节数的两倍。
- 只有保密性的模式不提供完整性认证。

