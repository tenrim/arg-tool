// Diagnostic presentation only. CyberChef remains the decoder and validates
// custom alphabets, padding and strict mode. Never repair or reject input here.
export function inputWarnings(op, input, args, source = 'text') {
  if (
    op !== 'From Base64' ||
    !['text', 'shared'].includes(source) ||
    typeof input !== 'string' ||
    !args[1]
  )
    return [];
  const alphabet = args[0];
  if (!['A-Za-z0-9+/=', 'A-Za-z0-9-_=', 'A-Za-z0-9-_'].includes(alphabet)) return [];
  const invalid =
    alphabet === 'A-Za-z0-9+/='
      ? /[^A-Za-z0-9+/=\s]/gu
      : alphabet.endsWith('=')
        ? /[^A-Za-z0-9_\-=\s]/gu
        : /[^A-Za-z0-9_\-\s]/gu;
  const count = [...input.matchAll(invalid)].length;
  return count
    ? [
        `当前宽容选项忽略了 ${count} 个非字符表字符（不含空白）。能输出字节不代表输入是有效 Base64；请核对原文，或在高级参数中关闭忽略字符并开启严格模式`,
      ]
    : [];
}
export function errorGuidance(op, message) {
  if (!/^AES (?:Encrypt|Decrypt)$/.test(op)) return null;
  if (/Invalid key length/i.test(message))
    return {
      field: 'Key',
      text: '密钥长度不符合 AES 要求。请检查“密钥”和所选格式：需要 16、24 或 32 字节；Hex 应填写 32、48 或 64 个十六进制字符，UTF-8 按字节计数。',
    };
  if (/initiali[sz]ation vector|Invalid IV|IV.{0,40}(?:length|byte)/i.test(message))
    return {
      field: 'IV',
      text: '初始化向量（IV）不符合当前模式要求。请核对模式、IV 内容及格式，使用加密时的原始 IV。具体长度要求见引擎原始错误。',
    };
  if (/padding|decrypt|authenticate|authentication/i.test(message))
    return {
      field: 'Key',
      text: '无法按当前设置解密。请核对密钥、模式、IV 和密文输入格式；认证模式还需核对认证标签。此错误不能单独证明密码错误。',
    };
  return null;
}
