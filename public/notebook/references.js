// Rewrite attachment destinations, never arbitrary occurrences in puzzle text.
// The same exact URL mapping is used when opening, saving and exporting Markdown.
export function mapAttachmentURLs(markdown, mapping){
 const destination='(?:notebook-asset:[a-z0-9-]+|blob:[^\\s<>()\"\']+)';
 const tokens=new RegExp('`+|(?:\\]\\([ \\t]*<?|^ {0,3}\\[[^\\]\\n]+\\]:[ \\t]*<?)('+destination+')(?=>?(?:\\s|\\)|$))','gim');
 function inline(text){
  const matches=Array.from(text.matchAll(tokens)),next=new Map(),closing=new Map();
  for(let i=matches.length-1;i>=0;i--){const m=matches[i];if(m[0][0]==='`'){closing.set(i,next.get(m[0].length));next.set(m[0].length,i);}}
  let end=0,result='';
  for(let i=0;i<matches.length;i++){
   const match=matches[i];
   if(match[0][0]==='`'){if(closing.get(i)!==undefined)i=closing.get(i);continue;}
   const url=match[1],replacement=mapping.get(url);if(replacement===undefined)continue;
   const at=match.index+match[0].length-url.length;
   result+=text.slice(end,at)+replacement;end=at+url.length;
  }
  return result+text.slice(end);
 }
 let fence=null,buffer='',output='';
 for(const line of markdown.split(/(?<=\n)/)){
  const content=line.replace(/^(?: {0,3}> ?)+/,'').replace(/\r?\n$/,''),marker=content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if(fence){output+=line;if(marker&&marker[1][0]===fence[0]&&marker[1].length>=fence.length&&!marker[2].trim())fence=null;continue;}
  if(marker||/^(?: {4}|\t)/.test(content)){output+=inline(buffer)+line;buffer='';if(marker)fence=marker[1];continue;}
  buffer+=line;
 }
 return output+inline(buffer);
}
