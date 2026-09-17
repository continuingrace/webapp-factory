import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({
  name: 'language-qa',
  version: '0.2.0'
});

const LanguageMode = z.enum(['auto', 'ko', 'en', 'mixed']);
const Tone = z.enum(['preserve', 'natural', 'concise', 'formal', 'warm', 'professional', 'casual']);

const ReviewInput = z.object({
  text: z.string().min(1).describe('Text to review.'),
  language: LanguageMode.default('auto').describe('Language mode: auto, Korean, English, or mixed.'),
  tone: Tone.default('preserve').describe('Desired tone. Preserve keeps the original tone unless clarity requires change.'),
  context: z.string().optional().describe('Optional context such as email, UI copy, caption, report, presentation, chat, or marketing copy.'),
  audience: z.string().optional().describe('Optional intended audience.'),
  explain_changes: z.boolean().default(true).describe('Whether to explain important corrections and alternatives.')
});

const koreanEditorialStandard = {
  authority_basis: [
    '국립국어원 한국어 어문 규범: 한글 맞춤법, 표준어 규정, 문장 부호, 외래어 표기 원칙',
    '국립국어원 표준국어대사전 및 공식 용례를 우선 참고하는 편집 원칙',
    '공공언어의 명료성·간결성·정확성 원칙에 맞춘 문장 다듬기'
  ],
  editorial_goal: '맞춤법 교정을 넘어, 문장 구조가 정확하고 읽기 쉬우며 과장·군더더기·AI식 장문을 줄인 전문 윤문',
  sentence_rules: [
    '한 문장에 핵심 판단이나 핵심 정보가 지나치게 많이 겹치지 않게 한다.',
    '주어와 서술어의 호응을 확인하고, 생략된 주어가 모호하면 복원하거나 문장을 나눈다.',
    '목적어·부사어·관형어가 어느 서술어를 수식하는지 명확하게 한다.',
    '수식어가 여러 겹 중첩되면 핵심 명사와 서술어를 먼저 살리고 수식어를 줄이거나 분리한다.',
    '긴 문장은 무조건 짧게 자르는 것이 아니라 의미 단위와 호흡을 기준으로 나눈다.',
    '같은 뜻의 명사화 표현, 추상명사, 접속 표현, 강조어를 반복하지 않는다.',
    '“~에 대한”, “~을 통해”, “~에 있어서”, “~부분”, “~것”, “~관련” 같은 상투적 연결이 연쇄되면 더 직접적인 동사 중심 문장으로 바꾼다.',
    '번역투와 피동·사동의 불필요한 중첩을 줄이고 자연스러운 한국어 어순을 우선한다.',
    '문단마다 중심 문장을 분명히 하고, 문장 사이의 논리 관계가 접속어 없이도 드러나게 정리한다.',
    '정보 전달 글에서는 멋을 내기 위한 수사보다 정확성·명료성·간결성을 우선한다.'
  ],
  ai_writing_anti_patterns: [
    '한 문장 안에 “~하며, ~하고, ~하면서, ~하는 동시에”가 연속되는 장문',
    '의미가 비슷한 형용사·부사를 2~3개 이상 겹치는 과잉 수식',
    '핵심 없이 “중요합니다 / 필요합니다 / 효과적입니다 / 의미가 있습니다”로 끝나는 추상적 결론',
    '문단마다 비슷한 도입부와 접속어를 반복하는 기계적 리듬',
    '원문보다 길어지는 윤문',
    '독자가 이미 아는 내용을 다시 풀어 쓰는 과잉 설명',
    '주어가 바뀌었는데 같은 문장 안에서 서술어가 계속 이어지는 호응 불량',
    '명사형 표현을 과도하게 쌓아 동작 주체와 책임이 흐려지는 문장'
  ],
  editing_priority: [
    '1. 의미와 사실 보존',
    '2. 맞춤법·띄어쓰기·문법 오류 교정',
    '3. 주어-서술어와 문장 성분의 호응 정리',
    '4. 장문 분리와 수식어 정리',
    '5. 번역투·AI식 상투 표현 제거',
    '6. 문단 흐름과 리듬 개선',
    '7. 문체는 가능한 한 원문을 보존'
  ]
};

server.registerTool(
  'review_language',
  {
    description: 'Review Korean, English, or mixed Korean-English text. Korean review includes expert-level proofreading and editorial polishing: spelling, spacing, grammar, subject-predicate agreement, modifier attachment, sentence length, redundancy, translationese, AI-style overexplaining, paragraph flow, and concise natural phrasing. English review covers grammar, idiomatic naturalness, tone, collocation, and Konglish. Preserve meaning and avoid unnecessary rewriting.',
    inputSchema: ReviewInput
  },
  async ({ text, language, tone, context, audience, explain_changes }) => {
    const framework = {
      language,
      tone,
      context: context ?? 'Not specified',
      audience: audience ?? 'Not specified',
      principles: [
        'Preserve the writer’s intended meaning before optimizing style.',
        'Do not rewrite more than necessary.',
        'Separate objective errors from stylistic preferences.',
        'For Korean, perform both normative proofreading and professional editorial polishing.',
        'For Korean, actively prevent AI-like long sentences, excessive modifiers, abstract filler, and subject-predicate mismatch.',
        'For English, distinguish grammar errors from grammatical-but-unnatural phrasing.',
        'For Konglish, explain whether the expression is understandable, nonstandard, misleading, or natural only in Korean usage.'
      ],
      korean_editorial_standard: koreanEditorialStandard,
      korean_checks: [
        '맞춤법', '띄어쓰기', '조사와 어미', '주어-서술어 호응', '문장 성분 호응', '문장부호', '수식어 중첩', '장문 분리', '중복 표현', '번역투', 'AI식 상투 표현', '명사화 남용', '자연스러운 어순', '문단 흐름', '맥락에 맞는 어휘'
      ],
      english_checks: [
        'grammar', 'articles and prepositions', 'tense and agreement', 'collocation', 'idiomatic naturalness', 'register and tone', 'word choice', 'Korean-to-English translationese', 'Konglish'
      ],
      response_format: [
        '1. 최종 윤문본 / Final polished version',
        '2. 필수 교정 — 객관적 오류만',
        '3. 윤문 포인트 — 장문, 호응, 수식어, 번역투, AI식 표현 중 실제로 손본 핵심만',
        '4. 대안 표현 — 의미 차이가 있는 좋은 대안이 있을 때만'
      ]
    };

    const responseInstructions = [
      'Do not mark a stylistic preference as a grammar or spelling error.',
      'If the original is already correct and natural, say so and avoid unnecessary rewriting.',
      'For Korean, the polished version should usually be no longer than the original unless missing context must be restored.',
      'Prefer direct verbs and concrete nouns over chains of abstract nouns and nominalizations.',
      'Check every long Korean sentence for subject-predicate agreement and modifier attachment before polishing style.',
      'Do not mechanically shorten all sentences; preserve intentional literary rhythm when context is literary or reflective.',
      'For English, explicitly identify phrases that are grammatically possible but unnatural to a fluent speaker.',
      'For Konglish, give the natural English expression and briefly explain the usage difference.',
      explain_changes ? 'Explain only consequential changes.' : 'Return the polished version with minimal explanation.'
    ];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ input: { text, language, tone, context, audience }, framework, response_instructions: responseInstructions }, null, 2)
      }]
    };
  }
);

server.registerPrompt(
  'korean_editorial_polish',
  {
    description: 'Expert Korean proofreading and editorial polishing focused on correct sentence structure, concise natural prose, and removal of AI-like verbosity while preserving meaning and voice.',
    argsSchema: z.object({
      text: z.string().min(1),
      context: z.string().optional(),
      tone: Tone.optional(),
      audience: z.string().optional()
    })
  },
  async ({ text, context, tone, audience }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `다음 한국어 글을 전문 윤문해 주세요. 국립국어원의 한국어 어문 규범과 표준적인 국어 용례를 기준으로 맞춤법·띄어쓰기·문법을 먼저 바로잡고, 그다음 문장 구조와 문체를 다듬어 주세요. 특히 주어와 서술어의 호응, 수식어가 걸리는 대상, 문장 성분 간 관계를 확인하세요. 한 문장이 지나치게 길거나 여러 판단을 동시에 담고 있으면 의미 단위로 나누되, 무조건 짧게 쪼개지는 마세요. 과도한 수식어, 추상명사, 명사화, 번역투, 반복되는 접속어, “~에 대한/~을 통해/~부분/~것/~관련” 같은 상투적 연결, AI가 생성한 글에서 흔한 장황함과 과잉 설명을 줄여 주세요. 원문의 의미와 필자의 목소리는 보존하고, 윤문본이 특별한 이유 없이 원문보다 길어지지 않게 하세요. 문학적·에세이적 문맥에서는 의도된 리듬과 여운을 보존하세요. 결과는 ① 최종 윤문본 ② 필수 교정 ③ 핵심 윤문 포인트 순으로 간결하게 제시하세요.\n\n원문: ${text}\n문맥: ${context ?? '지정 없음'}\n톤: ${tone ?? 'preserve'}\n독자: ${audience ?? '지정 없음'}`
      }
    }]
  })
);

server.registerPrompt(
  'korean_proofread',
  {
    description: 'Check Korean spelling, spacing, grammar, sentence agreement, and natural phrasing while preserving the original tone.',
    argsSchema: z.object({ text: z.string().min(1), context: z.string().optional(), tone: Tone.optional() })
  },
  async ({ text, context, tone }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: `Review this Korean text. Correct objective spelling, spacing, grammar, particles, endings, subject-predicate agreement, and punctuation first. Then improve readability only where needed. Avoid AI-style verbosity, excessive modifiers, and unnecessary expansion. Preserve meaning and voice.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}\nTone: ${tone ?? 'preserve'}` } }]
  })
);

server.registerPrompt(
  'natural_english',
  {
    description: 'Check English grammar and propose natural, context-appropriate phrasing, including detection of Korean translation patterns and Konglish.',
    argsSchema: z.object({ text: z.string().min(1), context: z.string().optional(), tone: Tone.optional(), audience: z.string().optional() })
  },
  async ({ text, context, tone, audience }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: `Review this English text for correctness and naturalness. Separate grammar errors from grammatical but awkward phrasing, flag Konglish or Korean-influenced English when relevant, and use the smallest necessary rewrite.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}\nTone: ${tone ?? 'preserve'}\nAudience: ${audience ?? 'Not specified'}` } }]
  })
);

server.registerPrompt(
  'konglish_check',
  {
    description: 'Check Korean-English mixed copy for Konglish, awkward borrowed English, and expressions whose Korean usage differs from natural English.',
    argsSchema: z.object({ text: z.string().min(1), context: z.string().optional() })
  },
  async ({ text, context }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: `Check this text specifically for Konglish and Korean-influenced English. Classify flagged expressions as natural international English / understandable but nonstandard / misleading in English / Korean-only usage, and suggest a natural alternative when needed.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}` } }]
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('language-qa MCP failed:', error);
  process.exit(1);
});
