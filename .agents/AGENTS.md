# Project Agent Rules (Harness Engineering)

## Documentation Sync Rule
- **개발 시작 전 (Pre-task)**: 개발 작업 시작 시 반드시 `c:\NCMS\docs` 및 하위 폴더의 모든 `.md` 문서(기능 명세, 아키텍처, API, DB 설계 등)를 먼저 스캔하고 기존 설계 및 맥락을 파악한 후 진행한다.
- **개발 완료 후 (Post-task)**: 개발 작업 완료 시, 코드 변경사항이나 사양 변경/신규 기능에 따라 문서 내용의 갱신이 필요한 경우 `c:\NCMS\docs` 하위의 해당 `.md` 문서를 반드시 업데이트한다.
