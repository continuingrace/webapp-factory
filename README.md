# RE Webapp Factory MCP

리베의 반복적인 웹앱 제작 규칙을 Codex에서 재사용하기 위한 로컬 MCP 서버입니다.

현재 버전: **v0.1.0**

## v0.1.0 도구

- `create_webapp` — RE 기본 규칙이 적용된 새 Vanilla 웹앱 생성
- `apply_re_standard` — 기존 프로젝트에 `RE-STANDARD.md` 추가/갱신
- `inspect_project` — 버전, PWA, LocalStorage, Git 상태 등을 읽기 전용 점검
- `bump_version` — `package.json`의 semver 버전 증가
- `test_webapp` — 기존 `npm test` 실행
- `git_commit` — 로컬 커밋 생성. **push는 절대 하지 않음**

## 기본 RE Webapp Standard

- Pretendard
- Mobile First + Desktop responsive
- Minimal / Simple / Modern UI
- 화면에서 버전 확인 가능
- LocalStorage 기반 자동 저장 기본값
- PWA manifest + service worker baseline
- 사용자 데이터는 기본적으로 local-first
- 요청과 무관한 정상 기능 보존
- 대규모 리팩터링보다 최소 수정 우선
- 테스트/상태 확인 후 커밋
- 사용자가 명시적으로 요청하지 않는 한 push 금지

## 요구 사항

- Node.js 20 이상
- npm
- Git (git 도구를 사용할 경우)
- Codex CLI

이 서버는 공식 MCP TypeScript SDK v2의 `@modelcontextprotocol/server`와 stdio transport를 사용합니다.

## Windows 설치

PowerShell에서 원하는 작업 폴더로 이동한 뒤:

```powershell
cd $HOME\Documents\AI-Workspace
git clone https://github.com/continuingrace/webapp-factory.git
cd webapp-factory
npm install
npm run build
```

빌드가 성공하면 `dist/server.js`가 생성됩니다.

## Codex MCP 등록

기본적으로 Factory가 접근할 수 있는 웹앱 루트를 `RE_WEBAPP_ROOT`로 제한하는 것을 권장합니다.

예시:

```powershell
codex mcp add re-webapp-factory --env RE_WEBAPP_ROOT="$HOME\Documents\AI-Workspace" -- node "$HOME\Documents\AI-Workspace\webapp-factory\dist\server.js"
```

등록 확인:

```powershell
codex mcp list
```

Codex를 다시 시작한 뒤 `re-webapp-factory`가 enabled인지 확인하세요.

## 첫 테스트

Codex에서:

```text
RE Webapp Factory의 create_webapp 도구를 사용해서
이름이 factory-test인 새 웹앱을 만들어줘.
```

정상 생성 후:

```text
RE Webapp Factory로 factory-test를 inspect 해줘.
```

생성되는 앱에는 Pretendard, 반응형 기본 UI, `v0.1.0`, LocalStorage 자동저장 예제, manifest, service worker, `RE-STANDARD.md`가 포함됩니다.

## 안전 설계

`RE_WEBAPP_ROOT` 바깥 경로에는 접근하지 않습니다. `create_webapp`은 기존의 **비어 있지 않은 폴더를 덮어쓰지 않습니다.** `git_commit`은 push하지 않습니다. `apply_re_standard`는 애플리케이션 코드를 수정하지 않고 표준 문서만 작성합니다.

## 다음 버전 후보

v0.2에서는 브라우저 QA를 추가할 예정입니다.

- 로컬 앱 실행
- 모바일 viewport 점검
- 버튼/입력 동작 테스트
- 새로고침 후 LocalStorage 복구 확인
- console error 검사
- QA 결과 보고

그 이후에는 기존 프로젝트별 템플릿, GitHub repository 연결, PWA icon generation pipeline 등을 단계적으로 추가할 수 있습니다.
