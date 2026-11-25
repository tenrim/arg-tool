---
capabilityId: native:code-cpp
title: C++
topicGroup: programming
summary: 以 C++20 控制台程序为例解释 string、vector、引用和输入流。
aliases:
  - C++20
  - std::vector
  - std::getline
sources:
  - id: draft
    title: C++ Working Draft
    publisher: ISO WG21 文稿的 HTML 版
    url: https://eel.is/c++draft/
    language: en
    kind: official-doc
    locator: vector.modifiers、dcl.ref、string.io 与输入流规则
  - id: gcc
    title: Options Controlling C++ Dialect
    publisher: GCC
    url: https://gcc.gnu.org/onlinedocs/gcc/C_002b_002b-Dialect-Options.html
    language: en
    kind: official-doc
    locator: C++20 模式
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: C++20 的标准库与 main
---

## 介绍
<!-- sources: draft, gcc, local -->

C++ 控制台程序使用 main 作为入口，可借助标准库表示文本和容器。静态类型与对象生命周期在编译时或运行时影响操作。读取一行、改变容器元素和用引用修改变量是三个独立过程。

## 按词与按行读取
<!-- sources: draft -->

对 std::string 使用输入流提取运算符通常跳过前导空白，再读到下一个分隔空白。std::getline 则读取至行终止符并消耗该分隔符。需要保留一行中的空格时，两个入口会产生不同结果。

:::example 保留行内空格
[输入]
用 std::getline(std::cin, s) 读取 red blue 后的换行。
[结果]
s 内容为 red blue。
[说明]
字符串含中间空格，不含已消费的行尾分隔符。
:::

## 动态序列
<!-- sources: draft -->

std::vector 维护一段可变大小的连续元素序列。push_back 把新元素加到末尾。size 表示实际元素数量，capacity 表示当前可能容纳的元素数量，两者可不同。

:::example 末尾插入
[输入]
vector 中先有 2、4，再 push_back(6)。
[结果]
顺序为 2、4、6，size 为 3。
[说明]
新元素占据索引 2，旧元素的相对顺序保持不变。
:::

## 引用与副本
<!-- sources: draft -->

绑定到已有对象的普通左值引用可作为该对象的别名。通过引用赋值会修改被绑定对象。按值初始化一个普通变量则复制了值，之后两者可分别变化。

:::example 修改原变量
[输入]
int n = 3; int& ref = n; ref += 4;
[结果]
n 的值为 7。
[说明]
ref 绑定的对象就是 n。
:::

## 容器增长与可用引用
<!-- sources: draft, local -->

容器扩充容量可能搬移元素，使先前指向这些元素的引用、指针或迭代器失效。需要持续保存一个位置时，可核对具体容器操作的失效规则。运行标准库程序不需要依赖其他编译环境中的第三方组件。

## 常见误区

- getline 会读到指定分隔符，普通字符串提取按空白分词。
- capacity 不能代表已经填入多少元素。
- 引用绑定到对象，但对象移动或被销毁后引用不当然有效。
