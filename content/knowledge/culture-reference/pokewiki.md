---
capabilityId: native:pokewiki
title: 神奇宝贝百科查询
topicGroup: language-reference
summary: 查阅 52poke 条目原文与固定版本，区分作品世代、来源和媒体许可。
aliases:
  - 52poke
  - 神奇宝贝百科
  - 宝可梦
  - 皮卡丘
sources:
  - id: api
    title: 52poke Action API — search
    publisher: 神奇宝贝百科
    url: https://wiki.52poke.com/api.php?action=help&modules=query%2Bsearch
    language: zh-CN
    kind: official-doc
    locator: 搜索命名空间、标题及连续查询
  - id: rev
    title: "MediaWiki API: Revisions"
    publisher: MediaWiki
    url: https://www.mediawiki.org/wiki/API:Revisions
    language: en
    kind: official-doc
    locator: 返回 revisions 的内容、用户、修订序号及时间
  - id: rights
    title: 神奇宝贝百科版权声明
    publisher: 神奇宝贝百科及贡献者
    url: https://wiki.52poke.com/wiki/神奇宝贝百科:版权声明
    language: zh-CN
    kind: official-doc
    locator: 文字 CC BY-NC-SA 3.0 及媒体单独权利
  - id: robots
    title: 52poke robots.txt
    publisher: 神奇宝贝百科
    url: https://wiki.52poke.com/robots.txt
    language: en
    kind: official-doc
    locator: Crawl-delay 500 与所列路径
---

## 介绍
<!-- sources: api, rev -->

52poke 是由贡献者协作编辑的百科。结果以文章和版本为单位，每页的模板、说明、图鉴栏和作品条目可以有不同结构。读取时首先确认讨论的是哪个世代、作品或对象。

## 检索页与固定标题
<!-- sources: api, rev -->

关键词或名称搜索用来定位候选。明确标题后，可读取版本正文和元数据。名称可能因地区或语言变化，也可能出现重定向和消歧义，应按返回标题而不是自己推测目标。

:::example 检索宝可梦名称
[输入]
皮卡丘
[结果]
定位标题为“皮卡丘”的候选，记录其页面标识
[说明]
从真实候选取题名，后续比较时需要再确认具体作品和章节。
:::

## 引用实际读取的版本
<!-- sources: rev, rights -->

页面可能在保存笔记之后继续更新。版本 ID 与时间标识当时所读内容，历史入口则便于查看贡献者。引用文字应保存来源和所用词条版本。

:::example 演算固定版本地址
[输入]
修订返回 revid=2627141
[结果]
固定版本链接的查询字段为 oldid=2627141
[说明]
这组数字用于说明参数关系，不表示当前或最新版本。
:::

## 原始模板与媒体引用
<!-- sources: rev, rights -->

查询得到的 Wiki 文本可能含模板调用、分类、表格和媒体引用。它们保持原格式以供检查。媒体权利未必和正文相同，预览也不能擅自猜出模板生成的结构。

:::example 分辨正文和图像引用
[输入]
返回原文出现 [[File:Example.png]]
[结果]
保存这段媒体标记，可回原站核对所引用文件
[说明]
这是记录一条引用，并不表示本次已经读取图片文件。
:::

## 许可和访问节奏
<!-- sources: rights, robots, api -->

正文许可为 CC BY-NC-SA 3.0，保留署名、非商业和相同方式共享要求。工具通过明确的在线提交检索，以原站公布的访问节奏为依据。上游请求未成功不能写成“没有这个条目”。

## 常见误区

- 当前页面链接会更新，和固定修订链接用途不同。
- 同一角色的数据可能随作品、世代或形态变化。
- 百科文字许可不能替代图片、声音等素材的授权。

