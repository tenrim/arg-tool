> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 科普搜索默认范围

设置中沿用“使用习惯 → 搜索中显示科普”，默认关闭，保留用户显式保存的选择。

共享搜索模型默认关闭科普：工具索引在建立精确与 Fuse 模糊搜索数据前排除科普，按需缓存含科普的独立索引；开关切换不混用两种范围。空查询浏览不建立搜索索引、不减少目录条目；显式科普分类及科普目录继续提供文章查找。

参考检索：本项目 `public/capabilities/search.js` 的 `rankCapabilities`。IT-Tools 固定提交 `d505845f918e946ec300af7b36efc107e2f66e9e`，`src/composable/fuzzySearch.ts:16-26`，确认传入数据决定 Fuse 的索引范围。本轮只调整本站的数据范围与缓存，无上游代码复制、无依赖升级。

验证：`tests/search.test.mjs`、`tests/preferences.test.mjs`；`scripts/browser-search-knowledge.mjs` 检查新浏览器默认关闭、实际设置开关、顶部与侧栏结果，以及刷新后的偏好保存。不涉及部署。
