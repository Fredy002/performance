from pathlib import Path
import json,re
import sys
all_data=json.loads(Path(sys.argv[1]).read_text())
text_dir=Path(sys.argv[2])
def tables(blocks):
 for b in blocks:
  if b['type']=='table':yield b
  elif b['type']=='columns':
   for col in b['columns']:yield from tables(col)
report=[]
for figure,page in [(57,137),(58,138)]:
 data=next(t for t in all_data if t['source']['figure']==f'FIGURE {figure}')
 local={}
 for sheet in data['sheets']:
  for table in tables(sheet['blocks']):
   for row in table['rows']:
    if isinstance(row,list) and len(row)==13 and re.fullmatch(r'\d{4,5}',row[0]['t']):local[int(row[0]['t'])]=[c['t'] for c in row[2:]]
 lines=(text_dir / f'page{page}.txt').read_text().splitlines();matches=0;diff=[]
 for index,line in enumerate(lines):
  m=re.match(r'\s*(\d{4,5})\s+TIME/FUEL\s+(.*)',line)
  if not m:continue
  altitude=int(m[1]);pairs=re.findall(r'\d+/\d+',m[2]);dist=re.findall(r'\d+/\d+',lines[index+1]) if 'DIST./TAS' in lines[index+1] else []
  pairs=['']*(11-len(pairs))+pairs
  dist=['']*(11-len(dist))+dist
  for column in range(11):
   official=pairs[column]+ ('\n'+dist[column] if dist[column] else '')
   actual=local[altitude][column]
   if actual!=official:diff.append({'altitudeFt':altitude,'column':column,'local':actual,'official':official})
   matches+=1
 report.append({'figure':figure,'officialPdfPage':page,'cellsCompared':matches,'differences':diff})
print(json.dumps(report,indent=2))

assert all(not entry["differences"] for entry in report), "Unexpected climb differences"
