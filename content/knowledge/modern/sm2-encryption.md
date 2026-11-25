---
capabilityId: pair:SM2%20Encrypt
title: SM2
topicGroup: modern
summary: 用椭圆曲线临时共享点产生掩码，并将临时点、密文和完整性值封装。
aliases:
  - SM2 Encrypt
  - SM2 Decrypt
  - 椭圆曲线临时点与 C1/C2/C3
sources:
  - id: cn
    title: GM/T 0003.4：SM2 公钥加密算法
    publisher: 国家密码管理局
    url: https://www.oscca.gov.cn/sca/xxgk/201705/1012587.shtml
    language: zh-CN
    kind: official-doc
    locator: 算法名称及公钥加密规范入口
  - id: draft
    title: SM2 Digital Signature Algorithm（含公钥加密）
    publisher: Shen、Lee
    url: https://datatracker.ietf.org/doc/html/draft-shen-sm2-ecdsa-02
    language: en
    kind: author-spec
    locator: 第 7 节及附录 C、D，公钥加密和曲线参数
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相关操作的输入、输出和算法选项
---

## 介绍
<!-- sources: cn, draft -->

这里讨论 SM2 椭圆曲线公钥加密。接收者持有私钥 d 和公钥点 dG，发送者使用公开点和本次临时随机数建立共享点。签名和密钥交换是同族的其它算法。

## 三个组成字段
<!-- sources: draft, chef -->

C1 是临时公钥点。发送方用临时标量乘接收公钥，得到共享点 (x₂,y₂)。对坐标做密钥派生后，与明文异或为 C2。C3 是对 x₂、明文、y₂ 依序连结所算的散列完整性值。

## 可复算的解密材料
<!-- sources: draft, chef -->

解密方用私钥乘以 C1，得到同一共享点。以下特意选取公开的演示私钥 d=1，其对应公钥就是规范曲线的基点 G。这组密钥只用于复现。

:::example C1C3C2 排列的三字节记录
[输入]
sm2p256v1，私钥 1（可在左侧补足 64 个十六进制数字）
a416989001986a56753fc10a6b5c81029e0dc8fa0e4ef920227072b3d198600a29996229061f18bf7fad7246b8ffd5b93d513d08002e6ce5d8f8e017d784338ba4d2a0f288500a5728bfe8303e3475e5c3a150b2ce8c439f6d6c407760871247ef3f26
[结果]
41 42 43
[说明]
这份已生成的密文按 64 字节坐标、32 字节散列、3 字节密文排列。
:::

## 另一种字段顺序
<!-- sources: draft, chef -->

文件间可能使用 C1C2C3 或 C1C3C2。两种顺序的总体长度一样，所选解析顺序错误会让相应字段解释错误。以上样例的 C1 保存固定宽度的 X、Y 坐标，其他容器可能给点加编码标记。

:::example C1C2C3 排列的四字节记录
[输入]
sm2p256v1，私钥仍为 1
b2376608ed3324c3b8609c340f2bc28e31155919b968ad25324c0eff4e2b5a4e02cb1267e5b1284ed4d46c504315afb06daa013f3a4fd011b29e41aa51a2b41b108d00adb6df8fa354e99a5cadc7f44154b564f31ae87da9976190be4454af739042685f
[结果]
00 01 02 03
[说明]
该记录按 64 字节坐标、4 字节密文、32 字节散列拆解。
:::

## 完整性与随机性的验证
<!-- sources: draft, chef -->

解密先求出候选明文，再重算散列并比较 C3。失败时不应使用候选字节。加密每次选择新随机数，核对应检查解密或参考向量，无需期待新生成的密文字面一致。

:::example 改变第一组记录的最后一个字节
[输入]
把第一组记录末尾的 26 改为 27，保留其他字段
[结果]
散列不匹配，解密失败
[说明]
改变的是 C2 的尾字节，重算 C3 无法与原记录一致。
:::

## 常见误区

- SM2 加密与 SM2 签名使用不同协议。
- 相同公钥和明文不保证密文字面相同。
- 完整记录要按正确顺序拆出 C1、C2、C3。

