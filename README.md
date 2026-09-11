# RE Webapp Factory

리베의 반복적인 웹앱 제작·검수 규칙을 재사용하기 위한 **GitHub-first / Mobile-first Webapp Factory**입니다.

현재 버전: **v0.3.0**

## 기본 흐름

```text
휴대폰 ChatGPT / Codex
        ↓
RE Factory workflow 실행
        ↓
새 GitHub 저장소 자동 생성
        ↓
Mobile GitHub-first template 자동 적용
        ↓
GitHub Actions 자동 QA
        ↓
Playwright iPhone / Android / Desktop 검사
        ↓
GitHub Pages 자동 배포
        ↓
휴대폰에서 실제 URL 확인
```

로컬 MCP는 삭제하지 않고 **선택형 고급 기능**으로 유지합니다. PC에서 로컬 파일을 직접 만들거나 점검할 때만 필요합니다.

## v0.3.0 핵심 기능

- GitHub Actions에서 새 웹앱 repository 자동 생성
- 새 repository에 Mobile GitHub-first template 자동 복제
- 앱 이름/표시 제목 자동 치환
- Pretendard + Mobile First + visible version
- LocalStorage autosave baseline
- PWA manifest + service worker baseline
- Playwright 기반 자동 QA
- iPhone / Android / Desktop viewport 테스트
- 모바일 가로 overflow 검사
- LocalStorage 새로고침 복구 검사
- console error / page error 검사
- 실패 시 screenshot / video / trace 보존
- GitHub Pages workflow 자동 포함
- Pages를 Actions 방식으로 활성화 시도
- 기존 RE Webapp Standard 유지

## 새 앱을 휴대폰에서 만드는 방법

GitHub에서 `continuingrace/webapp-factory` → **Actions** → **RE Factory - Create Webapp** → **Run workflow**를 누릅니다.

입력값:

- `app_name` — 저장소/앱 slug. 예: `paperdrop`
- `app_title` — 화면 표시 이름. 예: `Paperdrop`
- `description` — 선택
- `visibility` — public / private

완료되면 새 저장소가 생성되고 기본 앱, QA workflow, Pages workflow가 함께 push됩니다.

## 최초 1회 필요한 GitHub 인증 설정

GitHub Actions의 기본 `GITHUB_TOKEN`만으로는 다른 새 저장소를 자유롭게 생성하고 초기 push까지 하는 흐름에 제약이 있으므로, Factory에는 별도 secret `RE_FACTORY_GH_TOKEN`을 사용합니다.

GitHub 공식 문서에 따르면 **fine-grained personal access token**으로 사용자 저장소 생성 endpoint를 사용할 수 있고, 이때 `Administration: write` 권한이 필요합니다.

권장 설정:

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Resource owner: `continuingrace`
3. Repository access: 새 저장소 생성/관리 흐름에 맞게 설정
4. Repository permissions:
   - Administration: Read and write
   - Contents: Read and write
   - Workflows: Read and write
   - Pages: Read and write (가능한 경우)
5. 토큰 생성
6. `webapp-factory` → Settings → Secrets and variables → Actions
7. New repository secret
8. 이름: `RE_FACTORY_GH_TOKEN`
9. 값: 생성한 토큰

토큰은 코드나 README에 직접 적지 않습니다.

## Mobile GitHub-first Template

`templates/mobile-github-first/`에 새 웹앱 기준 파일이 있습니다.

```text
index.html
src/style.css
src/app.js
manifest.webmanifest
sw.js
package.json
playwright.config.ts
tests/mobile.spec.ts
.github/workflows/qa.yml
.github/workflows/pages.yml
```

## 자동 QA

Playwright는 기본적으로 다음 환경을 검사합니다.

- iPhone 13 profile
- Pixel 7 profile
- Desktop Chrome

기본 검사:

1. 페이지 정상 렌더링
2. 모바일 가로 overflow 없음
3. 입력 필드가 있으면 LocalStorage 상태가 새로고침 후 복구
4. console error / uncaught page error 없음

영상 export, 파일 업로드, canvas, drag/drop 같은 앱별 핵심 기능은 각 프로젝트 테스트에 추가합니다.

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

## 로컬 MCP

PC에서 필요할 때만 설치합니다.

```powershell
cd $HOME\Documents\AI-Workspace
git clone https://github.com/continuingrace/webapp-factory.git
cd webapp-factory
npm install
npm run build
```

Codex 등록 예시:

```powershell
codex mcp add re-webapp-factory --env RE_WEBAPP_ROOT="$HOME\Documents\AI-Workspace" -- node "$HOME\Documents\AI-Workspace\webapp-factory\dist\server.js"
```

## 다음 확장

- ChatGPT/Codex에서 자연어 한 줄로 Factory workflow 실행
- Actions 결과 자동 요약
- 실패 screenshot/video를 보고 자동 수정 루프
- GitHub Pages URL 자동 확인
- PWA icon pipeline
- 영상/canvas 웹앱 특화 QA
- 모바일 Safari 회귀 테스트
