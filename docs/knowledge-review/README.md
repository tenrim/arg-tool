# 逐功能资料和独立复核记录

这些记录用于说明内容的依据与实际检查范围，不是“每个外链全文已读”或“中国各运营商实测”的保证。来源全部是公开标准、机构文档、作者资料或本站已随附的固定实现，不含用户输入、上传文件或账号凭据。

六份 `learn-*-evidence.json` 记录各功能的来源、支持规则、真实获取限制和已核算的例子。三份 `knowledge-*-independent-review.json` 是第二次独立只读检查，保留发现当时的文件摘要和问题；它们不等于最终源码快照。根审查随后按具体问题修正文章、旁注与公共操作适配。

内容结构、逐功能覆盖、安全资料链接与文章工具关联由测试持续检查；站内源码镜像由 `public/vendor/knowledge/UPSTREAM.json` 的固定摘要校验。语义检查范围和实际运算范围分别记录，HTTP 返回成功不替代资料内容核对。部分正式页面抓取超时或仅得到官方索引，未虚构全文阅读成功。

两份 `knowledge-final-*-review.json` 记录最终集成和公共 Worker 的独立复核；`operation-corrections-evidence.json` 记录 795 个真实 Worker 案例。镜像维护脚本的版本来源缓存回归纳入普通单元测试，不会进行网络下载或改写资料。

`knowledge-name-only-final-review.json` 记录最新基本名称与删除旧科普的只读验收。`motion-route-review.json` 记录实际原生动画的观测竞争修正，`search-order-review.json` 保留精确名称被搜索上限淹没的根因发现。标题简化与旧入口删除是先前复核快照之后的用户新要求；快照中的旧别名通过结论仅表示当时兼容行为，不是当前保留契约。最终版本已删除这 40 个旧入口，规则与来源正文保持不变。

`capability-resilience-review.json` 记录独立 SM4 科普的搜索类别断言、实际标准向量和原故障恢复专项。

最终运行的完整检查和问题处理记录在根目录 `VERIFICATION.md` 与 `CODE_REVIEW.md`；普通科普入口仍在本站同页阅读。
