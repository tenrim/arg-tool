import { AnalysisError } from './data.js';

// Only known parser rejection messages are reclassified. Unexpected exceptions,
// network/module failures and worker timeouts remain genuine failures.
const rejected =
  /(?:末尾码字缺少 11 结束标记|每个数字需要完整 4 位|^缺少编码。$|培根密码需要五位|输入包含字母表之外的字符|Playfair 密文(?:需要偶数|中不能有相同字符)|CBOR Decode - Extra data in input|Could not decode MessagePack to JSON: Error: -?\d+ trailing bytes|^Error: Unknown type 0x[0-9a-f]+$|Base32 (?:尾部补零无效|长度无效|字母表之外)|basE91 (?:尾部或长度不规范|中含字母表以外)|Unrecognised Base65536 character|Crockford 校验符不符|输入含映射表以外的字符|映射中没有：|Triplet too large:|Decode text - Unrecognized code:|A1Z26 的数字必须为|码位格式示例：|末尾码字不完整|Delta 长度超出输入|只允许二进制位|缺少中间跳变|结果不是完整 \d+ 位数据|Bubble Babble (?:缺少边界|音节无效)|校验音节不符|编码校验失败|一元编码(?:必须成对|分组无效)|每字节需要两个 7 位码字|线路编码须为完整电平对|每字节需三个十进制数字的余 3 码|无效余 3 码|结果超出一个字节|需要完整 begin／end 包装|编码行长度不符|缺少零长度结束行)/;
export function parserError(error, operation) {
  if (error?.code && error.code !== 'EXECUTION_FAILED') return error;
  const message = String(error?.message || '');
  if (operation === 'PHP Deserialize') {
    if (/^Unknown type: [oc]$/i.test(message))
      return new AnalysisError('UNSUPPORTED', '固定版本的 PHP 解析器不支持对象记录。');
    if (
      /^(?:Unexpected input found|End of input reached before end of script|Unknown type: .)$/.test(
        message,
      )
    )
      return new AnalysisError('INPUT_INVALID', message);
  }
  if (
    (operation === 'Avro to JSON' && message === 'Error parsing Avro file.') ||
    (operation === 'BSON deserialise' &&
      /^BSONError: (?:Bad BSON Document: illegal CString|corrupt object bson|Detected unknown BSON type [\da-f]+ for fieldname "[^\r\n]*"|bson size must be >= 5, is -?\d+|One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00)$/.test(
        message,
      ))
  )
    return new AnalysisError('INPUT_INVALID', message);
  if (
    /^(?:CBOR Decode - Unexpected end of stream reading \d+ bytes, got \d+|Could not decode MessagePack to JSON: Error: Invalid byte [0-9a-f]{1,2})$/i.test(
      message,
    )
  )
    return new AnalysisError('INPUT_INVALID', message);
  if (
    /^(?:From Punycode - (?:Invalid input|Overflow|Illegal input)|未登记的电报码：|姿态写为 a1a6b2c3|同一侧的活动臂只能选一个方向|代用旗须指向此前同类旗)/.test(
      message,
    )
  )
    return new AnalysisError('INPUT_INVALID', message);
  if (/^【spellInfo】错误的拼音: [^\r\n]+, 请检查字符是否正确$/.test(message))
    return new AnalysisError('INPUT_INVALID', message);
  if (/^Decode text - Unrecognized CP: \d+$/.test(message))
    return new AnalysisError(
      'UNSUPPORTED',
      '当前固定引擎不支持这个字符编码：' + message.split(':').at(-1).trim(),
    );
  if (rejected.test(message)) return new AnalysisError('INPUT_INVALID', message);
  return error;
}
