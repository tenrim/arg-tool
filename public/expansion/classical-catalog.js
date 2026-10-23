// Static task descriptions only. Algorithms and user data never enter discovery.
const directions = [{value: 'encrypt', label: '加密'}, {value: 'decrypt', label: '解密'}];
const field = (id, label, type, value, options) => ({id, label, type, default: value, ...(options ? {options} : {})});
const unknown = () => field('unknown', '非字母表字符', 'select', 'reject', [
  {value: 'reject', label: '空白忽略，其他未知字符报错'},
  {value: 'remove', label: '移除字母表之外的字符'},
]);
const square = (alphabet) => [field('squareKey', '方阵关键词（可留空）', 'text', ''), field('alphabet', '基础字母表／完整方阵排列', 'text', alphabet)];
const key = () => field('key', '密钥', 'text', '');
const definitions = [
  {id: 'playfair', label: 'Playfair 密码', fields: [...square('ABCDEFGHIKLMNOPQRSTUVWXYZ'), field('filler', '重复／末尾填充字符', 'text', 'X'), field('alternateFiller', '填充字符相同时的备用字符', 'text', 'Q'), unknown()], source: 'Playfair.pdf', limitation: '默认 J 合并到 I，移除空白；重复字母和奇数末尾需要填充。解密保留填充字符，无法自动恢复原始分词和 J。'},
  {id: 'adfgx', label: 'ADFGX 密码', fields: [...square('ABCDEFGHIKLMNOPQRSTUVWXYZ'), key(), unknown()], source: 'ADFGVX', limitation: '5×5 方阵，J 合并到 I；ADFGX 坐标替换后按密钥稳定列排序换位，不补齐最后一行。'},
  {id: 'adfgvx', label: 'ADFGVX 密码', fields: [...square('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), key(), unknown()], source: 'ADFGVX', limitation: '6×6 方阵含 A–Z 与 0–9；坐标替换后按密钥稳定列排序换位，不补齐最后一行。'},
  {id: 'trifid', label: 'Trifid 密码', fields: [...square('ABCDEFGHIJKLMNOPQRSTUVWXYZ#'), field('period', '分组周期', 'number', 5), unknown()], source: 'Trifid.pdf', limitation: '27 字符三层方阵。每个周期分别混排三个坐标；最后不足周期的一组按实际长度计算，不填充。'},
  {id: 'autokey', label: 'Autokey 自密钥密码', fields: [key(), field('alphabet', '字母表', 'text', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), field('stream', '追加到密钥流的内容', 'select', 'plaintext', [{value: 'plaintext', label: '明文自密钥'}, {value: 'ciphertext', label: '密文自密钥'}]), field('variant', '运算规则', 'select', 'vigenere', [{value: 'vigenere', label: 'Vigenère（明文 + 密钥）'}, {value: 'beaufort', label: 'Beaufort（密钥 − 明文）'}, {value: 'variant', label: 'Variant Beaufort（明文 − 密钥）'}]), unknown()], source: 'Autokey.pdf', limitation: '只用已处理字母推进密钥；密钥用尽后追加明文或密文。解密时使用实际还原字母推进，不把密文误当明文密钥。'},
  {id: 'beaufort', label: 'Beaufort 密码', fields: [key(), field('alphabet', '字母表', 'text', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), field('variant', '运算规则', 'select', 'beaufort', [{value: 'beaufort', label: 'Beaufort（密钥 − 明文，自反）'}, {value: 'variant', label: 'Variant Beaufort（明文 − 密钥）'}]), unknown()], source: 'Beaufort.pdf', limitation: '标准 Beaufort 的加解密运算相同；Variant Beaufort 解密使用不同符号。两者不能混同。'},
  {id: 'columnar', label: '列移位置换', fields: [key(), field('keyType', '密钥形式', 'select', 'keyword', [{value: 'keyword', label: '关键词（重复字符从左到右排序）'}, {value: 'numeric', label: '每列排名（如 3 1 2）'}]), field('padding', '补齐矩形', 'select', 'none', [{value: 'none', label: '不填充（不完整列换位）'}, {value: 'fill', label: '填充到完整矩形'}]), field('filler', '填充字符', 'text', 'X')], source: 'IncompleteColTransposition.pdf', limitation: '输入按 Unicode 字符逐行放入，含空格和标点。按密钥列序读出；解密保留填充，不能自动判断哪些末尾字符是原文。'},
  {id: 'nihilist', label: 'Nihilist 数字替换密码', fields: [...square('ABCDEFGHIKLMNOPQRSTUVWXYZ'), key(), field('modulo100', '数字输出约定', 'select', 'yes', [{value: 'yes', label: 'ACA 两位数（100–110 写为 00–10）'}, {value: 'no', label: '保留完整和（22–110）'}]), unknown()], source: 'NihilistSubstitution.pdf', limitation: 'Polybius 两位坐标与重复密钥坐标相加；密文必须用空白或逗号分隔数字。默认采用 ACA 模 100 约定。'},
];
export const CLASSICAL_CIPHERS = Object.freeze(definitions.map(item => Object.freeze({...item, directions: Object.freeze(directions.map(d => Object.freeze({...d}))), fields: Object.freeze(item.fields.map(f => Object.freeze({...f, ...(f.options ? {options: Object.freeze(f.options.map(o => Object.freeze(o)))} : {})})))})));
