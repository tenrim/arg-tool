> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 日常计算模块（2026-10-28）

本轮新增八项：海拔气压、水的沸点、露点与结露、冷热水混合、加热时间、耗电与电费、电池续航、溶液稀释。均在“其他工具 / 数学计算”登记，并拥有独立工具、搜索别名、使用说明与科普文章。每项工具的工作表单后常驻显示实际公式、单位、假设与原始文献链接；保存结果同时保留条件、公式和引用。

## 公式依据

| 工具 | 原始资料与位置 | 实际使用 |
| --- | --- | --- |
| 海拔气压 | [NOAA/NWS Pressure Altitude](https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf)，第 1 页 | 原式的英尺转米，以及该式的代数反解；固定标准海平面压力。NWS 系数为近似模型，不冒称精确 ISA。高度限制 −500～11000 m。 |
| 水的沸点 | [IAPWS SR1-86(1992)](https://iapws.org/technical-guidance/release/Supp-sat)，第 3 页常数与式 (1)，第 7 页 Table 1 | 原六项系数、临界常数，273.16～647.096 K 区间单调二分反求。三个表格点用于独立数值核对。海拔模式调用同一个海拔气压模型。 |
| 露点与结露 | [NWS Vapor Pressure](https://www.weather.gov/media/epz/wxcalc/vaporPressure.pdf) 的 RH 定义；[NWS RH and Dewpoint](https://www.weather.gov/media/epz/wxcalc/rhTdFromWetBulb.pdf) 的 es 和 Td 公式 | 从 RH 与 es 求实际水汽压再反求露点；没有模拟湿球。仅液态水基准，零下结果不冒称霜点。输入限制是本站界限，不宣称该区间有统一精度保证。 |
| 冷热水混合 | [OpenStax College Physics 2e §14.2](https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity)，Q=mcΔT、量热法及式 14.15 | 同种水且 c 相同的绝热守恒式，以及目标温度的代数反解。按质量，不假定任意温度的水体积精确相加。 |
| 加热时间 | 同上表 14.1 的水比热 4186 J/(kg·K)；[§7.7](https://openstax.org/books/college-physics-2e/pages/7-7-power) 的 P=W/t | Q=mcΔT；η 表示进入水中的输入能量比例，因此输入能量 Q/η、时间 Q/(ηP)。没有相变、容器吸热或可变功率模型。 |
| 耗电与电费 | [EIA Measuring electricity](https://www.eia.gov/energyexplained/electricity/measuring-electricity.php)；[Hawaiian Electric Operating Costs](https://www.hawaiianelectric.com/products-and-services/save-energy-and-money/calculate-energy-use/calculate-appliance-operating-costs) | 功率×时间换算 kWh，累计电量×用户电价。默认值是可编辑算例，不是现行电价。 |
| 电池续航 | [Victron Energy Unlimited，Revision 9 / June 2011](https://www.victronenergy.com/upload/documents/Book-Energy-Unlimited-EN.pdf)，§6.2 及 §2.5、§3；EIA 单位说明 | Wh=Ah×V，乘可用比例与转换效率，再除以负载功率。Victron 原文另有 kWh 换算的排印错误，本工具依 EIA 的 1 kWh=1000 Wh 换算，不复用该错误。未引入 Peukert 模拟或任何固定的经验效率。 |
| 溶液稀释 | [OpenStax Chemistry 2e §3.3](https://openstax.org/books/chemistry-2e/pages/3-3-molarity)，Dilution of Solutions 与 Example 3.19 | C₁V₁=C₂V₂，提供三个明确求解目标。限同一溶质的 mol/L，最终体积采用定容语义，不将体积差当成精确溶剂用量。 |

IAPWS 原始 PDF 下载入口为 `https://iapws.org/technical-guidance/release/Supp-sat.download`，2026-10-28 核对的原字节 SHA-256：`a10d38d73339b0713c86cfac88f9adcba137202167ccdfa1cd58238c438361d7`。读取扫描件第 3 页实际公式与第 7 页表格，不依据搜索摘要补写系数。研究原件在忽略的 `outputs/everyday-research/`，不作为新增运行资源分发。

## 参考编码与所有者

先以 XERJ `SearchProject workspace practical geometry` 定位 `public/practical/form.js`、`geometry-view.js`、`catalog.js`，继续沿用现有表单、取消、同步失效和笔记结果租约；没有第二套计算器壳或数据存储。

- Qalculate/libqalculate，固定 `132d7b2f150de1ace81c02a93701a012e10fb97c`。按 `pressure altitude boiling`、`Specific Heat Capacity` 检索后，没有命中适用的八项专用公式；直接检查 `data/units.xml.in:3650–3670` 的压力维度。该文件是单位定义，不把它作为气象或沸点公式依据，也不复制单位库代码。现有内核及版本保持不变。
- iib0011/omni-tools，固定 `60bc64f5a6974f3c802c5ec06cb3cf7f824485e1`。`src/pages/tools/number/generic-calc/data/ohmsLaw.ts:3–48` 明确区分公式、变量名、单位及默认值；本站仅参考这种字段组织，不复用求解器或源码，也不把其欧姆定律当作本轮八项公式的依据。

实际算法为本站原创实现的固定物理关系；没有接入 PsychroLib、CoolProp 或新的第三方运行包、文本数据集。文献通过同一个 ReferenceList 在工具下方展示，软件依赖声明由已有 `PRACTICAL_TASKS → TASK_PROJECT_SOURCES` 逐项生成八个空数组。引用文献与实际代码依赖分别处理，不虚构关于页的项目许可证记录。

`everyday-data.js` 只持有静态、逐项编写的公式、说明与引用；`everyday-model.js` 拥有校验及计算；`everyday-view.js` 拥有实际输入；`practical/form.js` 继续拥有结果生命周期。新增静态数据边与视图组合边已在架构策略精确登记，没有导入豁免或绕开 UI 组件。

## 验证与交付边界

- `tests/everyday-calculators.test.mjs`：十项针对性检查，含独立文献算例、单位等价、逆算、临界点、无效输入、溢出和逐项登记／科普／来源契约。
- `scripts/browser-everyday-calculators.mjs`：真实 Chrome，1440 / 768 / 320 px，八项实际运行、清空输入、错误、参数切换、键盘计算、来源常驻、笔记租约失效、离页失效及禁止外发请求；桌面正常动态、手机减少动态。
- 修改模块的 UI 所有权和导入边定向检查；不执行整站浏览器套件或全量构建。

本轮仅本地实现和预览，不提交、推送、部署，也不改变 V1.6 的版本元数据。
