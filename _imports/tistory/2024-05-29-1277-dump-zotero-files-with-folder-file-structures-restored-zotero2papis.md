---
title: "Dump Zotero files with folder/file structures restored (zotero2papis)"
date: 2024-05-29
migration_status: review_required
original_url: https://frontjang1.tistory.com/1277
tistory_category: {"id": 1176543, "label": "Script"}
---

<!-- Review category, canonical metadata, and media before moving this draft into _posts/. -->

Script
The difference between "storage" (Zotero original) and "output" (result of zotero2papis) is because each zotero folders contains additional 'cache' and 'info' files.
Instead of papis-zotero importer, zotero2papis works better when dumping Zotero files with folder/file structures restored
* papis/papis-zotero: Zotero compatibility layer for papis (github.com)
> papis zotero import --from-sql-folder "C:/Users/user/Zotero"
* nicolasshu/zotero2papis (github.com)
> zotero2papis -z "C:/Users/user/Zotero" -o "~/Documents/output"
* Updated parts of zotero2papis.py (from original zotero2papis)
1. Cover the exceptional case that an item does not have "date" key (utilized SimpleNamespace for dot representations)
if "date" in self.item:
try:
# Try to guess any date config (e.g. YYYYMMDD, DD-MM-YYYY)
date = dateutil.parser.parse(self.item["date"])
except:
try:
date = dateutil.parser.parse(self.item["date"][:-3])
except:
from types import SimpleNamespace
dateDict = {"year":2024}
date = SimpleNamespace(**dateDict)
dirname = os.path.join(f"{date.year}_{self.item['title']}")
else:
dirname = self.item['title']
2. Correction on directory names by removing special characters and limiting the length + trimming
dirname = re.sub(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", "-", dirname)[:100].strip()
3. Comment out print() functions which cause the encoding errors (if a folder contains non-ASCII characters)
#print(f" The file in the path below does not exist\n {path}")
#print(f" File has been copied to {dest}")
4. Exception handling for path ('None' case)
try:
if path[:8] != "storage:": continue
except:
print(path) #mostly "none"
continue
