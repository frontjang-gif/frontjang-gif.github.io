---
title: "Visualize 3gpp yang model with pyang+iplantuml on python jupyter notebook"
date: 2024-05-27
migration_status: review_required
original_url: https://frontjang1.tistory.com/1276
tistory_category: {"id": 1176543, "label": "Script"}
---

<!-- Review category, canonical metadata, and media before moving this draft into _posts/. -->

Script
1. Fetch the latest yang model from 3gpp (Management and Orchestration APIs repository)
SA5 – Management & Orchestration and Charging / Management and Orchestration APIs · GitLab (3gpp.org)
Model file is located at: e.g., https://forge.3gpp.org/rep/sa5/MnS/-/tree/Rel-18/yang-models
2. install prerequisites
$ pip install pyang iplantuml
download plantuml ( https://github.com/plantuml/plantuml/releases/download/v1.2024.5/plantuml-1.2024.5.jar )
3. Open a jupyter notebook and transform yang model to plantuml (e.g., RRMPolicy from 3gpp TS 28.541)
%env YANG_MODPATH C:/temp/MnS-Rel-18-yang-models/yang-models
!pyang -f uml "C:\temp\MnS-Rel-18-yang-models\yang-models\_3gpp-nr-nrm-rrmpolicy.yang" > "c:/temp/test.puml"
4. Run jupyter magic command
%%plantuml -p plantuml-1.2024.5.jar
@startuml
!include c:/temp/test.puml
@enduml
