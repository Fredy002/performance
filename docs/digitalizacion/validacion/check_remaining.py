from pathlib import Path
import json,re
import sys
all_data=json.loads(Path(sys.argv[1]).read_text())
text_dir=Path(sys.argv[2])
get=lambda n:next(t for t in all_data if t['source']['figure']==f'FIGURE {n}')
def tables(bs):
 for b in bs:
  if b['type']=='table': yield b
  elif b['type']=='columns':
   for c in b['columns']:yield from tables(c)
report=[]
# V-speeds are compared across all published weight/flap bands, excluding blank cells.
local=[]
for s in get(55)['sheets']:
 for tb in tables(s['blocks']):
  for row in tb['rows']:
   if isinstance(row,list) and len(row)==8 and row[0]['t'] in ['1','5','15','25']:
    weights=row[1]['t'].splitlines();cols=[c['t'].split('\n') for c in row[2:]]
    for i,w in enumerate(weights):local.append([w]+[v for c in cols for v in c[i].split()])
lines=(text_dir / 'page136.txt').read_text().splitlines()
official=[]
for index,line in enumerate(lines):
 segment=line[70:]
 if re.match(r'\s{0,4}(120|110|100|90|80|70)\s+\d{3}\s+\d{3}\s+\d{3}',segment):
  values=re.findall(r'\d+',segment)
  # PDF text extraction puts one triplet on the preceding line; retain its published column.
  previous=lines[index-1][70:]
  if re.fullmatch(r'\s+121 122 128',previous):values[4:4]=re.findall(r'\d+',previous)
  official.append(values)
diff=[{'weight':actual[0],'local':actual,'official':expected} for actual,expected in zip(local,official) if actual!=expected]
assert len(local)==len(official)==20,(len(local),len(official))
report.append({'figure':55,'officialPdfPage':136,'weightBandsCompared':20,'speedsCompared':sum(len(row)-1 for row in local),'differences':diff})
# Published cruise planning rows.
official=[]
for line in (text_dir / 'related-142.txt').read_text().splitlines():
 if re.match(r'\s*\d+\s+\d+-\d+\s+\d+\s+\d+\s+\d+\s*$',line):official.append(list(map(int,re.findall(r'\d+',line))))
local=[[r['distanceNm'],*r['recAltFt'],r['tasKt'],r['airTimeMin'],r['fuelLb']] for r in get(67)['rows']]
assert len(local)==len(official)==25
report.append({'figure':67,'officialPdfPage':142,'rowsCompared':25,'differences':[{'local':a,'official':b} for a,b in zip(local,official) if a!=b]})
# Holding: explicitly report, rather than overwrite, changes between editions.
lines=(text_dir / 'related-143.txt').read_text().splitlines();start=next(i for i,l in enumerate(lines) if '2.13' in l);official=[]
for line in lines[start:]:
 values=re.findall(r'\d+\.\d+|\d+',line)
 if len(values)==12:values=values[1:]
 if len(values)==11:official.append(list(map(float,values)))
assert len(official)==24,len(official)
diff=[]
for index,row in enumerate(get(69)['rows']):
 for propIndex,prop in enumerate(['epr','iasKt','ffPerEngineLbHr']):
  for col,cell in enumerate(row['cells']):
   published=official[3*index+propIndex][col]
   if cell[prop]!=published:diff.append({'flightLevel':row['flightLevel'],'weightKlb':get(69)['weightsKlb'][col],'property':prop,'edition2005':cell[prop],'edition2019':published})
report.append({'figure':69,'officialPdfPage':143,'valuesCompared':264,'editionDifferences':diff})
print(json.dumps(report,indent=2))

assert not report[0]["differences"] and not report[1]["differences"], "Unexpected source differences"
assert report[2]["editionDifferences"] == [{"flightLevel": 150, "weightKlb": 110, "property": "ffPerEngineLbHr", "edition2005": 2680, "edition2019": 2668}], "Unexpected holding revision"
