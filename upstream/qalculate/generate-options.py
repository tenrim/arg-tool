import pathlib,re,json
r=pathlib.Path(__file__).parent
h=(r/'libqalculate-5.13.0/libqalculate/includes.h').read_text()
clean=re.sub(r'/\*.*?\*/|//[^\n]*','',h,flags=re.S)
enums={name:re.findall(r'(?:^|,)\s*(\w+)\s*(?:=[^,]+)?\s*(?=,|$)',body) for body,name in re.findall(r'typedef\s+enum\s*\{(.*?)\}\s*(\w+)\s*;',clean,re.S)}
fields=[]
def parse(struct,access,prefix):
 body=re.search(r'struct '+struct+r'\s*\{(.*?)\n\};',h,re.S).group(1)
 desc=[]
 for line in body.splitlines():
  line=line.strip()
  if line.startswith('///'):desc.append(line[3:].strip());continue
  m=re.fullmatch(r'(bool|int|unsigned int|char|std::string|\w+)\s+(\w+);',line)
  if not m:continue
  typ,name=m.groups();info=' '.join(desc);desc=[]
  if typ in ['ParseOptions','SortOptions']:parse(typ,access+'.'+name,prefix+'.'+name);continue
  if typ not in ['bool','int','unsigned int','char','std::string'] and typ not in enums:continue
  fields.append((typ,prefix+'.'+name,access+'.'+name,info))
parse('PrintOptions','printops','print');parse('EvaluationOptions','evalops','evaluate')
out=['// Generated from the complete upstream public option structs.','val options(){val rows=val::array();']
for typ,key,access,desc in fields:
 out+=['{val v=val::object();v.set("name",'+json.dumps(key)+');v.set("title",'+json.dumps(key)+');v.set("category",'+json.dumps(key.split('.')[0])+');v.set("description",'+json.dumps(desc)+');v.set("value",'+(access if typ in ['bool','std::string'] else 'int('+access+')')+');val choices=val::array();']
 for name in enums.get(typ,[]):out+=['{val c=val::object();c.set("name","'+name+'");c.set("value",int('+name+'));choices.call<void>("push",c);}']
 out+=['v.set("choices",choices);rows.call<void>("push",v);}']
out+=['return rows;}','bool set_option(std::string line){auto split=line.find(\' \');if(split==std::string::npos)return false;auto key=line.substr(0,split),value=line.substr(split+1);if(key=="precision"){try{int n=std::stoi(value);if(n<2||n>10000)return false;CALCULATOR->setPrecision(n);return true;}catch(...){return false;}}']
for typ,key,access,desc in fields:
 out+=['if(key=="'+key+'"){']
 if typ=='std::string':out+=[access+'=value;return true;']
 elif typ=='bool':out+=['if(value=="true"||value=="1"||value=="on"){'+access+'=true;return true;}if(value=="false"||value=="0"||value=="off"){'+access+'=false;return true;}return false;']
 elif typ in enums:
  for name in enums[typ]:out+=['if(value=="'+name+'"||value==std::to_string(int('+name+'))){'+access+'='+name+';return true;}']
  out+=['return false;']
 else:out+=['try{size_t n;long x=std::stol(value,&n);if(n!=value.size()||x>1000000||x< -1000000)return false;'+('if(x<0)return false;' if typ=='unsigned int' else '')+access+'=static_cast<'+typ+'>(x);return true;}catch(...){return false;}']
 out+=['}']
out+=['return false;}']
(r/'settings.h').write_text('\n'.join(out),encoding='utf-8')
print(len(fields),'full scalar configuration fields')
