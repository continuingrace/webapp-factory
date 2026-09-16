# Language QA MCP — 한국어 사용법

한국어 맞춤법·띄어쓰기와 영어 문법·자연스러운 표현·콩글리시를 함께 점검하는 MCP입니다.

## 무엇을 하나요?

### 한국어
- 맞춤법
- 띄어쓰기
- 조사·어미
- 문장 호응
- 문장부호
- 중복 표현
- 어색한 어순
- 번역투
- 맥락에 맞는 표현

### 영어
- 문법
- 관사·전치사
- 시제·수 일치
- 어색한 직역 표현
- 자연스러운 어휘·연어(collocation)
- 문맥과 톤에 맞는 표현
- 문법적으로 맞지만 원어민에게 어색한 문장

### 콩글리시
한국에서 흔히 쓰이지만 영어권에서는 뜻이 다르거나 자연스럽지 않은 표현을 구분합니다.

분류 예시:
- 자연스러운 국제 영어
- 이해는 되지만 비표준적 표현
- 영어에서는 오해될 수 있는 표현
- 한국에서만 주로 쓰이는 표현

## 핵심 원칙

Language QA는 모든 문장을 과하게 다시 쓰지 않습니다.

1. 원래 뜻을 먼저 보존합니다.
2. 실제 오류와 취향 차이를 구분합니다.
3. 꼭 필요한 수정과 선택 가능한 표현 개선을 나눕니다.
4. 이미 자연스러운 문장은 억지로 고치지 않습니다.
5. 영어는 `문법 오류`와 `문법적으로 가능하지만 어색한 표현`을 구분합니다.

## 기본 사용

MCP를 사용할 수 있는 AI에서 다음처럼 요청합니다.

```text
Language QA MCP로 아래 문장을 검토해줘.
맞춤법/문법 오류와 자연스러운 표현 제안을 구분해서 알려줘.

문장:
[검토할 문장]
```

## 한국어 맞춤법·띄어쓰기

```text
Language QA MCP의 korean_proofread로 아래 문장을 봐줘.
맞춤법, 띄어쓰기, 조사, 어미, 문장 호응을 먼저 확인하고
필수 수정과 선택적인 문체 개선을 구분해줘.

문장:
오늘 회의에서 이야기 했던 내용 정리해서 공유 드립니다.
```

## 영어 문법 + 자연스러운 표현

```text
Language QA MCP의 natural_english로 아래 영어를 검토해줘.
문법 오류와 문법상 가능하지만 어색한 표현을 구분하고,
30~40대 성인이 자연스럽게 쓰는 영어로 대안을 제안해줘.

Text:
Happy thankful today.
Context: Instagram caption
```

## 콩글리시 체크

```text
Language QA MCP의 konglish_check로 아래 표현을 확인해줘.
국제 영어에서 자연스러운지, 한국식 영어인지 구분하고
필요하면 자연스러운 대안을 제안해줘.

Text:
Let's do skinship after meeting at the pension.
```

## 한글+영어가 섞인 문장

```text
Language QA MCP로 아래 카피를 mixed 모드로 검토해줘.
한국어 띄어쓰기와 영어 표현을 함께 보고,
브랜드명이나 고유명사는 함부로 바꾸지 마.

Text:
이번 Leadership Workshop에서 우리 팀의 Action Plan을 같이 만들어봐요.
```

## 사용 가능한 기능

### Tool
`review_language`

입력:
- `text` — 검토할 문장
- `language` — `auto` / `ko` / `en` / `mixed`
- `tone` — `preserve` / `natural` / `concise` / `formal` / `warm` / `professional` / `casual`
- `context` — 이메일, UI 문구, 인스타 캡션, 보고서 등
- `audience` — 대상 독자
- `explain_changes` — 수정 이유 설명 여부

### Prompts
- `korean_proofread` — 한국어 맞춤법·띄어쓰기·문장 자연스러움
- `natural_english` — 영어 문법 + 자연스러운 표현
- `konglish_check` — 콩글리시 및 한국식 영어 점검

## 로컬 설치

필요 환경:
- Node.js 24 권장
- npm
- MCP를 지원하는 호스트(Codex 등)

```bash
npm install
npm run build
npm run test:mcp
```

정상 테스트 결과:

```text
Language QA MCP protocol smoke test passed
```

Codex 등록 예시:

```powershell
codex mcp add language-qa -- node "C:\path\to\webapp-factory\mcp\language-qa\dist\index.js"
```

등록 확인:

```powershell
codex mcp list
```

## 권장 출력 방식

Language QA는 다음 순서로 결과를 정리하도록 설계돼 있습니다.

1. **교정본** — 오류만 최소한으로 수정
2. **자연스러운 버전** — 필요할 때만 제안
3. **핵심 수정 이유** — Error / Naturalness / Konglish / Tone으로 구분
4. **대안 표현** — 실제로 의미 있는 선택지가 있을 때만 제공

현재 버전: `0.1.0`
