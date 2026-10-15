const source = (name, repo, role) => [name, 'https://github.com/' + repo, role];
export const DISCOVERY_REFERENCES = [
 {id:'currencies',title:'货币代码资料',placeholder:'CNY、156、人民币、China 或国家名称',sources:[source('Currency Codes','datasets/currency-codes','现行与历史 ISO 4217 货币代码资料'),source('Countries','annexare/Countries','按货币代码关联国家地区'),source('flag-icons','lipis/flag-icons','关联国家的本地旗帜')]},
 {id:'marine',title:'海事信号旗',placeholder:'字母、数字、识别读音或单旗含义',sources:[source('Marine Signal Flags','dzangolab/marine-signal-flags','36 张本地字母旗与数字旗 SVG')]},
 {id:'sky',title:'恒星与深空天体目录',placeholder:'天狼星、Sirius、HIP 32349、M31 或 NGC224',sources:[source('HYG Star Database','astronexus/HYG-Database','HYG 4.1 明亮／命名恒星精选，J2000 坐标'),source('OpenNGC','mattiaverga/OpenNGC','NGC／IC 与补充目录的固定天体数据')]}
];
