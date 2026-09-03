---
title: "Dump Chrome LocalDB contents with python"
date: 2024-04-09
migration_status: review_required
original_url: https://frontjang1.tistory.com/1224
tistory_category: {"id": 1176543, "label": "Script"}
---

<!-- Review category, canonical metadata, and media before moving this draft into _posts/. -->

Script
import json
import pathlib
import ccl_chromium_localstorage
level_db_in_dir = pathlib.Path(R"C:\Users\user\AppData\Local\Microsoft\Edge\User Data\Default\Local Extension Settings\fcmfnpggmnlmfebfghbfnillijihnkoh")
with ccl_chromium_localstorage.LocalStoreDb(level_db_in_dir) as local_storage:
for record in local_storage._ldb.iterate_records_raw():
j=json.loads(record.value.decode('utf8'))
if 'value' in j:
print(j['value'])
else:
exit()
