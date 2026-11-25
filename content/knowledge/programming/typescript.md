---
capabilityId: native:code-typescript
title: TypeScript
topicGroup: programming
summary: 区分类型检查和运行时值，理解联合类型缩窄、类型断言与输出。
aliases:
  - TypeScript
  - 联合类型
  - 静态类型检查
sources:
  - id: types
    title: TypeScript Everyday Types
    publisher: Microsoft
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
    language: en
    kind: official-doc
    locator: 联合类型、缺省字段、类型断言
  - id: narrow
    title: TypeScript Narrowing
    publisher: Microsoft
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
    language: en
    kind: official-doc
    locator: typeof 类型保护和控制流缩窄
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: TypeScript 严格检查与 Node.js 执行
---

## 介绍
<!-- sources: types, local -->

TypeScript 为 JavaScript 源码添加类型检查。类型注解可以帮助编译器验证代码，常见注解在生成 JavaScript 时会消失。运行时的对象仍遵循 JavaScript 的数据与控制流规则。

## 联合类型和缩窄
<!-- sources: types, narrow -->

当参数声明为 string 或 number 时，尚未检查前不能假定只有一类值。typeof 判断提供程序运行时可观察的证据，类型检查器据此在对应分支缩窄类型。

:::example 按真实类型选择操作
[输入]
对 x: string | number 定义结果为 typeof x === "string" ? x.length : x * 2。分别输入 "ARG"、3。
[结果]
3、6。
[说明]
文本走长度分支，数值走乘法分支。
:::

## 类型断言不会变换数据
<!-- sources: types -->

as 断言用于告诉编译器代码作者预期的类型。它不会在输出的 JavaScript 中自动调用构造函数。真正把文字变成数字需要用 Number 等表达式，能够处理转换失败条件。

:::example 检查断言后的真实值
[输入]
const x = "42" as unknown as number; console.log(typeof x);
[结果]
string
[说明]
双重断言改变静态判断，未改变程序运行时的文本值。
:::

## 缺省值和空值
<!-- sources: types, narrow, local -->

可选字段有可能为 undefined。应该根据程序语义设定备用值。空值合并运算符 ?? 只在左值为 null 或 undefined 时选用右值，左值为 0 或空串时仍保留。

:::example 有效零值仍存在
[输入]
const count: number | undefined = 0; console.log(count ?? 10);
[结果]
0。
[说明]
0 是合法数字，不会使用备用值 10。
:::

## 编译成功后的宿主能力
<!-- sources: types, local -->

类型检查使用所配置的标准库类型和声明。发射的 JavaScript 还要在真实运行环境中执行。声明一个函数名称只提供静态签名，不能自动安装相应宿主函数或浏览器对象。

## 常见误区

- TypeScript 类型断言不是数据转换。
- 联合类型需要根据真实条件缩窄才能安全使用专属操作。
- 通过类型检查不等于输入已经在运行时完成验证。
