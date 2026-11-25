---
capabilityId: op:Generate%20TOTP
title: 生成 TOTP 动态密码
topicGroup: authentication
summary: 把 UNIX 时刻分到固定时间步中，并按 HOTP 截断得到该窗口的口令。
aliases:
  - Generate TOTP
  - 基于时间的一次性密码
  - 30 秒口令
sources:
  - id: totp
    title: "RFC 6238 TOTP: Time-Based One-Time Password Algorithm"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc6238
    language: en
    kind: standard
    locator: 第 4 节时间步与算法、第 5 节验证时间限制、附录 B 向量
  - id: hotp
    title: "RFC 4226 HOTP: An HMAC-Based One-Time Password Algorithm"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4226
    language: en
    kind: standard
    locator: 第 5 节算法、附录 D 测试向量
  - id: base
    title: RFC 4648 Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648
    language: en
    kind: standard
    locator: 第 6 节 Base32 字母表
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Generate TOTP、otpauth TOTP counter：秒数除以 period，构造器未采用传入 epoch
---

## 介绍
<!-- sources: totp, hotp -->
TOTP 将时刻换成整数计数器后使用 HOTP。一个时间窗口内时间会推进，但计数值保持不变，所得口令也相同。进入下一窗口才用另一个计数值计算。

## 时间和计数的关系
<!-- sources: totp, hotp, engine -->
标准写法为 C=⌊(t−T₀)/X⌋，t 是 UNIX 秒数，T₀ 是起点，X 是步长。常用 T₀=0、X=30 秒。随后按 HOTP 的动态截断与补零输出规定长度。当前固定引擎实际用 ⌊t/X⌋；修改页面中的起点偏移不会应用到计数。

## 密钥、摘要和时钟
<!-- sources: totp, base, engine -->
Base32 只是把密钥表示成文字，算法仍以解出的原始字节作为 HMAC 密钥。RFC 测试含 SHA-1、SHA-256、SHA-512；此生成器采用 SHA-1。当地时区的显示名称不进入计算，重要的是两台设备对同一 UNIX 时刻的估计。

## 公开八位测试向量
<!-- sources: totp, base, engine -->
用 RFC 6238 附录 B 的 SHA-1 公开测试密钥 12345678901234567890。该密钥的 Base32 形式是 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ。以下按零起点和 30 秒步长。

:::example 第一窗口之后
[输入]
UNIX 时间 59 秒，公开测试密钥
[结果]
94287082
[说明]
59 除以 30 向下取整为 1。
:::

:::example 保留前导零
[输入]
UNIX 时间 1111111109 秒，公开测试密钥
[结果]
07081804
[说明]
计数为 37037036。左侧的 0 属于规定的八位显示。
:::

:::example 较远的时间点
[输入]
UNIX 时间 2000000000 秒，公开测试密钥
[结果]
69279037
[说明]
计数为 66666666，HOTP 仍接收固定宽度计数值。
:::

## 时间步交界
<!-- sources: totp, hotp, engine -->
在 30 秒步长下，距纪元 59 秒和 60 秒分属相邻窗口。接近交界时，两台时钟的少量偏差可能产生两个不同的验证码。校验系统可以按自身策略容纳有限的邻近窗口，并跟踪已经成功用过的口令。

## 常见误区
- 八位口令有前导零时仍需完整录入。
- 设备显示不同时区，但 UNIX 时间相同时，时区本身不会改变验证码。
- 同一窗口中多次显示同样的口令符合 TOTP 定义。
