# Design Logic MCP — 한국어 사용법

Design Logic은 **웹페이지, Figma 프레임, 스크린샷, 수동 설명을 실제로 확인한 뒤 디자인 구조와 판단의 타당성을 검토하는 MCP**입니다.

단순히 “예쁘다 / 별로다”를 평가하지 않습니다. 각 요소가 어떤 역할을 하는지, 꼭 필요한지, 더 단순한 구조로 같은 목적을 달성할 수 있는지를 검토합니다.

또한 분석 후 바로 원본을 수정하지 않고, **수정 가능성·영향 범위·테스트 방법을 먼저 검토한 뒤 사용자가 명시적으로 승인해야 적용하도록 설계**되어 있습니다.

## 무엇을 검토하나요?

Design Logic은 다음과 같은 질문을 다룹니다.

- 이 카드, 컨테이너, 라벨, 아이콘, CTA가 실제로 필요한가?
- 정보 위계가 명확한가?
- 여러 요소가 동시에 너무 강하게 강조되고 있지 않은가?
- 익숙한 UI 패턴을 필요해서 쓰는가, 습관적으로 반복하고 있는가?
- 같은 의미를 더 단순한 구조로 전달할 수 있는가?
- 무엇을 KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST 해야 하는가?
- 제안된 수정안을 원본을 건드리지 않고 안전하게 검토할 수 있는가?

평가는 취향이 아니라 **커뮤니케이션, 사용성, 정보 위계, 인지 부담, 접근성, 유지보수성, 사용 맥락**을 기준으로 합니다.

## 지원 입력

`review_design_source`는 다음 네 가지 source type을 지원합니다.

- `web` — 웹페이지 URL
- `figma` — 정확한 Figma 파일/프레임/node URL
- `screenshot` — 호스트가 읽을 수 있는 스크린샷 또는 이미지
- `manual` — 사용자가 직접 설명한 디자인

웹, Figma, 스크린샷은 **실제 소스를 먼저 읽은 뒤** 분석해야 합니다. 소스를 읽지 못하면 추측해서 리뷰하지 않도록 설계되어 있습니다.

## 기본 사용 흐름

1. 검토할 정확한 페이지, 프레임 또는 이미지를 지정합니다.
2. AI 호스트가 실제 소스를 먼저 확인합니다.
3. 실제로 관찰된 구조만 요약합니다.
4. `review_design_source`를 호출합니다.
5. 각 디자인 요소의 목적과 필요성을 검토합니다.
6. KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST 형태로 방향을 제안합니다.
7. 마지막에 `Safe next-step prompt`를 생성합니다.
8. 사용자가 별도로 승인하기 전까지 원본은 수정하지 않습니다.

## 예시 1 — 웹페이지 리뷰

MCP를 사용할 수 있는 AI 호스트에서 다음처럼 요청합니다.

```text
이 웹페이지를 실제로 먼저 열어봐.
https://example.com

그 다음 Design Logic MCP로 검토해줘.
실제로 관찰한 내용만 요약한 뒤
review_design_source를 source_type='web'으로 호출해줘.

정보 위계, 컨테이너 중첩, CTA 강조 수준, 반복되는 아이콘/텍스트,
불필요한 장식, 구조적 복잡성을 중심으로 봐줘.

페이지를 읽을 수 없다면 추측하지 말고 중단해줘.
```

## 예시 2 — Figma 리뷰

```text
아래 Figma 프레임을 먼저 실제로 읽어줘.
https://www.figma.com/design/...

읽은 뒤 Design Logic MCP로 검토해줘.
URL만 보고 구조를 추측하지 마.
```

호스트가 MCP prompt를 지원한다면 `review_figma_frame`도 사용할 수 있습니다.

## 예시 3 — 안전한 수정 계획

리뷰 결과 중 하나를 실제 수정 후보로 검토하고 싶다면 `plan_safe_revision`을 사용하거나 다음처럼 요청합니다.

```text
이 수정안을 바로 적용하지 말고 먼저 안전하게 구현 가능한지만 검토해줘.

관련 코드와 구조를 먼저 확인하고,
어떤 파일/컴포넌트/스타일이 영향을 받는지 알려줘.
반응형, 접근성, 상태 저장, 회귀 오류, 배포 위험도 확인해줘.

가장 작은 범위의 되돌릴 수 있는 변경안을 제안하고,
미리보기 또는 diff 방식과 테스트/롤백 방법을 알려줘.

이 단계에서는 원본 수정, 삭제, 이름 변경, 덮어쓰기,
commit, push, deploy를 하지 마.
내가 별도로 승인할 때까지 실제 변경은 하지 마.
```

## MCP 기능

### Tool

`review_design_source`

정확히 지정된 디자인 소스를 검토하고 디자인 판단 프레임워크와 안전한 후속 작업 규칙을 반환합니다.

### Prompts

- `review_explicit_design_source` — 이미 확인한 소스를 Design Logic 기준으로 리뷰
- `review_figma_frame` — Figma 프레임/node를 먼저 읽은 뒤 리뷰
- `plan_safe_revision` — 리뷰 제안을 실제 수정 전 안전한 구현 계획으로 변환

## 로컬 설치

필요 환경:

- Node.js 24 권장
- npm
- Codex 등 MCP를 지원하는 호스트

이 폴더에서 실행합니다.

```bash
npm install
npm run build
npm run test:mcp
```

정상이라면 다음 문구가 표시됩니다.

```text
Design Logic MCP protocol smoke test passed
```

### Codex 등록 예시 — Windows

```powershell
codex mcp add design-logic -- node "C:\path\to\webapp-factory\mcp\design-logic\dist\index.js"
```

등록 확인:

```powershell
codex mcp list
```

## 업데이트

이미 로컬에 설치했다면:

```powershell
git pull
cd .\mcp\design-logic
npm install
npm run build
npm run test:mcp
```

## 핵심 원칙

1. 익숙한 패턴이라는 이유만으로 필요하다고 판단하지 않습니다.
2. 주요 요소에는 분명한 역할이 있어야 합니다.
3. 삭제하거나 합치는 것도 유효한 디자인 결정입니다.
4. 의미와 사용성을 유지하면서 가장 단순한 구조를 우선합니다.
5. 접근성과 이해 가능성은 선택 사항이 아니라 제약조건입니다.
6. 무엇이 더 보기 좋은지보다 왜 필요한지를 설명합니다.
7. 리뷰와 실제 수정은 분리하며, 사용자의 명시적 승인 전에는 원본을 변경하지 않습니다.

현재 버전: `0.3.0`
