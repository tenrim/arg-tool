---
capabilityId: op:Parse%20UNIX%20file%20permissions
title: 解析 UNIX 文件权限
topicGroup: files
summary: 将八进制模式和 rwx 文本转成所有者、组及其他用户的权限位。
aliases:
  - chmod
  - rwx
  - 权限
sources:
  - id: posix
    title: POSIX chmod
    publisher: The Open Group
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/chmod.html
    language: en
    kind: standard
    locator: 文件的权限类、八进制目标模式与特别位
  - id: stat
    title: POSIX sys/stat.h
    publisher: The Open Group
    url: https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/sys_stat.h.html
    language: en
    kind: standard
    locator: 文件类型模式与权限常量
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入输出与模式
---

## 介绍
<!-- sources: posix, stat -->

传统 UNIX 文件模式为所有者、组和其他用户分别记录读、写、执行位。相关记录可以写成三位八进制，也可以写成带文件类型的符号串。

## 三个权限组的权重
<!-- sources: posix, chef -->

单组内 r=4、w=2、x=1，三位可以相加。八进制数字从左到右对应所有者、组、其他用户。读写和执行各自独立。

:::example 所有者和组的不同权限
[输入]
640
[结果]
-rw-r-----；八进制 0640
[说明]
所有者 4+2，组只有 4，其他用户是 0。
:::

## 文件类型与目录权限
<!-- sources: stat, posix, chef -->

符号串第一位可指示类型，d 表目录，短横线表常规文件。对于目录，x 许可搜索或通过目录，r 通常允许读取目录项名称。

:::example 解析目录模式
[输入]
drwxr-xr-x
[结果]
文件类型为目录，权限位写作 0755
[说明]
d 不属于三组 rwx 的数值。
:::

## 高位标记
<!-- sources: posix, chef -->

第四个八进制数字表示特殊模式位，如 setuid、setgid 和 sticky。符号表示会与普通执行位共用格子并采用不同大小写。其含义需结合操作系统和对象类别。

:::example 读 setuid 位
[输入]
4755
[结果]
-rwsr-xr-x；setuid 位已设置
[说明]
首位 4 对应 setuid，所有者本来同时有执行位，所以显示小写 s。
:::

## 模式位与实际访问
<!-- sources: posix, stat -->

访问控制还可能受父目录、ACL、用户身份、挂载选项及系统策略影响。查看一个符号串只解释该串涉及的模式位，不会直接检查当前机器上的实际访问。

## 常见误区

- 符号串开头的 d 是目录指示，不能当作第四种权限。
- 大写 S 或 T 可表示特殊位开启但对应执行位关闭。
- 模式值是八进制，不能按十进制拆解。

