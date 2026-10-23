import {chapters as codes} from './codes.js';
import {chapters as classical} from './classical.js';
import {chapters as modern} from './modern.js';
import {chapters as authentication} from './authentication.js';
import {chapters as language} from './language.js';
import {chapters as formats} from './formats.js';
import {chapters as media} from './media.js';
import {chapters as files} from './files.js';
import {chapters as reference} from './reference.js';
import {chapters as practical} from './practical.js';
import {chapters as systems} from './systems.js';
import {cipherExamples} from '../articles/cipher-examples.js';
import {headings} from './headings.js';

// Handwritten subject matter only. This map is not a discovery catalogue and
// cannot create a capability, change a route, or replace a topic member.
const chapters = [...codes, ...classical, ...modern, ...authentication, ...language,
  ...formats, ...media, ...files, ...reference, ...practical, ...systems];
const byCapability = new Map();
for (const [id, introduction, ...sections] of chapters) {
  if (byCapability.has(id)) throw Error('Duplicate knowledge chapter: ' + id);
  if (!introduction || !sections.length || sections.some(([title, paragraphs]) => !title || !paragraphs?.length)) {
    throw Error('Incomplete knowledge chapter: ' + id);
  }
  byCapability.set(id, {introduction, sections});
}

export function addKnowledgeChapters(articles) {
  const unused = new Set(byCapability.keys());
  const expanded = articles.map(article => {
    const id = article.capabilityIds[0];
    // Enigma is the separately authored, complete sample approved by the user.
    if (id === 'op:Enigma') return article;
    const chapter = byCapability.get(id);
    if (!chapter) throw Error('Missing authored knowledge chapter: ' + id);
    unused.delete(id);
    // The preface explains this exact workspace. Its basis is the existing
    // cited mechanisms of its real members; member sections stay untouched.
    const sourceIds = [...new Set(article.sections.filter(section => section.title !== '加密示例')
      .flatMap(section => section.sourceIds))];
    return {...article, preface: [
      {title: '介绍', paragraphs: [chapter.introduction], sourceIds},
      ...chapter.sections.map(([title, paragraphs]) => ({title, paragraphs, sourceIds})),
    ]};
  });
  if (unused.size) throw Error('Unregistered knowledge chapters: ' + [...unused].join(', '));
  return expanded;
}

const placeholder = '下例用于核对这项规则；参数和输入格式需与示例所述保持一致。';

// Normalize editorial presentation before topic projection so the exact
// member/source ownership contract remains the same at both boundaries.
export function editKnowledgePresentation(articles) {
  const examples = new Map(cipherExamples.map(example => [example.capabilityId, example]));
  return articles.map(originalArticle => {
    let article = originalArticle;
    if (article.capabilityIds[0] === 'op:Enigma') return article;
    const example = examples.get(article.capabilityIds[0]);
    if (example) {
      const sourceIds = example.reference ? [example.reference.id] : article.sections[0].sourceIds;
      const input = ['明文：' + example.plaintext,
        ...example.parameters.map(([label, value]) => label + '：' + value)].join('\n');
      article = {...article,
        sources: example.reference ? [...article.sources, example.reference] : article.sources,
        sections: [...article.sections, {title: '加密示例',
          paragraphs: [example.explanation], sourceIds,
          examples: [{label: '完整输入与密文', input, output: example.ciphertext,
            explanation: '十六进制结果中每两位为一个字节；显示分隔空格不属于密文。参数和明文均按上列格式解释。'}],
        }],
      };
    }
    const sections = [];
    for (const original of article.sections) {
      const section = {...original, title: headings.get(original.title) || original.title,
        paragraphs: original.paragraphs.filter(text => text !== placeholder)};
      if (!section.paragraphs.length && sections.length) {
        const previous = sections[sections.length - 1];
        sections[sections.length - 1] = {...previous,
          examples: [...(previous.examples || []), ...(section.examples || [])],
          sourceIds: [...new Set([...previous.sourceIds, ...section.sourceIds])],
        };
      } else sections.push(section);
    }
    return {...article, sections};
  });
}
