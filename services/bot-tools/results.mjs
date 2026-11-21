// Serialized into the isolated browser by Playwright. All inputs are engine results,
// never caller-supplied JavaScript. No result is attached to the live document.
export function resultFormatter() {
  return (output, limits, operation) => {
    const fail = (code, message) => ({ error: { code, message } });
    if (output.files || [7, 8].includes(output.dish.type))
      return fail('UNSUPPORTED_RESULT', '不开放文件结果，请使用工具网页。');
    const bytes = output.bytes;
    if (bytes.length > limits.outputBytes)
      return fail('OUTPUT_TOO_LARGE', '计算结果超过 64 KiB，请缩小输入。');
    const { type, value } = output.dish;
    let result;
    if (type === 6) {
      let text = JSON.stringify(value, null, 2);
      if (operation === 'Magic' && Array.isArray(value))
        text = value.length
          ? value
              .map((candidate, i) =>
                [
                  `候选 ${i + 1}（自动推测，并非确定结论）`,
                  `处理链：${candidate.recipe?.map((step) => step.op).join(' → ') || '原文'}`,
                  `结果：${candidate.data ?? ''}`,
                  `熵：${candidate.entropy ?? '未知'}`,
                  `可能语言：${
                    candidate.languageScores
                      ?.filter((v) => v.probability > 0)
                      .map((v) => v.lang)
                      .join('、') || '未知'
                  }`,
                ].join('\n'),
              )
              .join('\n\n')
          : '没有找到候选解码结果。';
      result = { type: 'json', data: value, text };
    } else if (type === 3) {
      // Inert HTML-to-text formatting only; this is not scraping a tool UI.
      const template = document.createElement('template');
      template.innerHTML = String(value);
      template.content
        .querySelectorAll('script,style,iframe,object,embed,canvas')
        .forEach((e) => e.remove());
      template.content.querySelectorAll('br').forEach((e) => e.replaceWith('\n'));
      template.content.querySelectorAll('td,th').forEach((e) => e.append('\t'));
      template.content.querySelectorAll('tr,p,div,li,h1,h2,h3,pre').forEach((e) => e.append('\n'));
      result = { type: 'text', text: template.content.textContent.trim(), sourceType: 'html' };
    } else if ([1, 2, 5].includes(type)) {
      result = { type: 'text', text: type === 1 ? String(value) : new TextDecoder().decode(bytes) };
    } else {
      return {
        result: {
          type: 'binary',
          byteLength: bytes.length,
          hexPreview: Array.from(bytes.slice(0, limits.previewBytes), (v) =>
            v.toString(16).padStart(2, '0'),
          ).join(''),
          truncated: bytes.length > limits.previewBytes,
        },
      };
    }
    if (new TextEncoder().encode(JSON.stringify(result)).length > limits.outputBytes)
      return fail('OUTPUT_TOO_LARGE', '计算结果超过 64 KiB，请缩小输入。');
    if (result.type === 'text') result.byteLength = new TextEncoder().encode(result.text).length;
    return { result };
  };
}
