const source = (name, repo, role) => [name, 'https://github.com/' + repo, role];
export const DISCOVERY_REFERENCES = [
 {id:'currencies',title:'货币代码资料',placeholder:'CNY、156、人民币、China 或国家名称',sources:[source('Currency Codes','datasets/currency-codes','现行与历史 ISO 4217 货币代码资料'),source('Countries','annexare/Countries','按货币代码关联国家地区'),source('flag-icons','lipis/flag-icons','关联国家的本地旗帜')]},
 {id:'marine',title:'海事信号旗',placeholder:'字母、数字、识别读音；完整码本可搜 NC、MAA 或英文词',sources:[source('Marine Signal Flags','dzangolab/marine-signal-flags','36 张本地字母旗与数字旗 SVG'),['NGA International Code of Signals','https://msi.nga.mil/Publications/ICOS','2020 修订版完整 159 页原文与 PDF；按全部页全文检索']]},
 {id:'sky',title:'深空天体目录',placeholder:'仙女座星系、M31、NGC224 或 IC434',sources:[source('OpenNGC','mattiaverga/OpenNGC','完整 NGC／IC 与补充目录的固定天体数据')]}
];
