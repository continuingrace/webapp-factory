# RE Webapp Factory

리베의 반복적인 웹앱 제작·검수 규칙을 재사용하기 위한 **GitHub-first / Mobile-first Webapp Factory**입니다.

현재 버전: **v0.2.0**

## 방향

v0.2.0부터는 **휴대폰에서도 웹앱을 만들고 검수할 수 있는 원격형 구조**를 기본으로 합니다.

기본 흐름:

```text
휴대폰 ChatGPT / Codex
        ↓
GitHub 저장소 생성·수정
        ↓
GitHub Actions 자동 실행
        ↓
Playwright 모바일/데스크톱 QA
        ↓
GitHub Pages 배포
        ↓
휴대폰에서 실제 URL 확인
```

로컬 MCP는 삭제하지 않고 **선택형 고급 기능**으로 유지합니다. PC에서 로컬 파일을 직접 만들거나 점검할 때 사용할 수 있습니다.

## v0.2.0 핵심 기능

- GitHub-first 작업 구조
- Mobile-first 웹앱 템플릿
- Playwright 기반 자동 QA
- iPhone / Android / Desktop viewport 테스트
- 가로 스크롤 여부 점검
- LocalStorage 새로고침 복구 테스트
- console error / page error 검사
- 실패 시 screenshot / video / trace 보존
- GitHub Actions에서 자동 QA
- GitHub Pages 자동 배포 workflow
- 기존 RE Webapp Standard 유지

## Mobile GitHub-first Template

`templates/mobile-github-first/`에 새 웹앱용 기준 파일이 있습니다.

포함 파일:

```text
package.json
playwright.config.ts
tests/mobile.spec.ts
.github/workflows/qa.yml
.github/workflows/pages.yml
```

### QA 프로젝트

Playwright는 다음 3개 환경을 기본 확인합니다.

- `mobile-safari` — iPhone 13 profile
- `mobile-chrome` — Pixel 7 profile
- `desktop-chrome` — Desktop Chrome profile

### 기본 검사

1. 페이지가 정상 렌더링되는지
2. 모바일에서 가로 overflow가 생기지 않는지
3. 일반적인 입력 필드가 있을 경우 LocalStorage 상태가 새로고침 후 복구되는지
4. console error / uncaught page error가 발생하지 않는지

앱마다 핵심 버튼, 파일 업로드, 영상 export 등 도메인별 기능은 각 프로젝트의 Playwright 테스트에 추가합니다.

## GitHub Actions

### `RE Mobile QA`

`main` push, pull request, 수동 실행 시 자동 QA를 실행합니다.

실패 여부와 관계없이 `playwright-report` artifact를 남기도록 구성되어 있습니다.

### `Deploy to GitHub Pages`

`main` push 시 GitHub Pages 배포 workflow를 실행합니다.

> 새 저장소에서는 GitHub → Settings → Pages에서 Source를 **GitHub Actions**로 한 번 지정해야 할 수 있습니다.

## RE Webapp Standard

- Pretendard
- Mobile First + Desktop responsive
- Minimal / Simple / Modern UI
- 명확한 폰트 위계
- 자간 / 행간 / margin / padding 관리
- 화면에서 버전 확인 가능
- LocalStorage 기반 자동 저장 기본값
- PWA baseline
- 사용자 데이터는 기본적으로 local-first
- 요청과 무관한 정상 기능 보존
- 대규모 리팩터링보다 최소 수정 우선
- QA 후 commit
- 명시적 요청 전까지 자동 push 금지

## 로컬 MCP v0.1 호환 기능

기존 로컬 MCP 도구도 그대로 유지됩니다.

- `create_webapp`
- `apply_re_standard`
- `inspect_project`
- `bump_version`
- `test_webapp`
- `git_commit`

PC에서 필요할 때만 설치하면 됩니다. 모바일 중심 사용자는 로컬 설치를 먼저 할 필요가 없습니다.

## 로컬 설치가 필요한 경우

```powershell
cd $HOME\Documents\AI-Workspace
git clone https://github.com/continuingrace/webapp-factory.git
cd webapp-factory
npm install
npm run build
```

Codex MCP 등록 예시:

```powershell
codex mcp add re-webapp-factory --env RE_WEBAPP_ROOT="$HOME\Documents\AI-Workspace" -- node "$HOME\Documents\AI-Workspace\webapp-factory\dist\server.js"
```

## 앞으로의 확장

- Factory가 새 repository에 Mobile GitHub-first template 자동 적용
- 앱별 Playwright test 자동 생성
- GitHub Actions 결과 자동 요약
- 실패 screenshot/video 기반 자동 수정 루프
- GitHub Pages URL 자동 확인
- PWA icon pipeline
- 영상/캔버스 기반 웹앱 전용 QA
- 모바일 Safari 특화 회귀 테스트
