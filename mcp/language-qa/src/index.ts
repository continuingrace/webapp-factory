import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({
  name: 'language-qa',
  version: '0.1.0'
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

server.registerTool(
  'review_language',
  {
    description: 'Review Korean, English, or mixed Korean-English text. For Korean, check spelling, spacing, particles, punctuation, sentence flow, awkward phrasing, and translationese. For English, check grammar, idiomatic naturalness, tone, word choice, collocation, and expressions that sound like direct Korean translations. For mixed text, also flag Konglish or English terms whose meaning/use differs from natural international English. Preserve meaning and tone unless a change is needed.',
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
        'For Korean, distinguish spelling/spacing/grammar corrections from optional naturalness edits.',
        'For English, distinguish grammar errors from grammatical-but-unnatural phrasing.',
        'For Konglish, explain whether the expression is understandable, nonstandard, misleading, or natural only in Korean usage.',
        'When several natural alternatives exist, prefer the one that best fits the stated context and tone.'
      ],
      korean_checks: [
        '맞춤법', '띄어쓰기', '조사와 어미', '문장 호응', '문장부호', '중복 표현', '번역투', '자연스러운 어순', '맥락에 맞는 어휘'
      ],
      english_checks: [
        'grammar', 'articles and prepositions', 'tense and agreement', 'collocation', 'idiomatic naturalness', 'register and tone', 'word choice', 'Korean-to-English translationese', 'Konglish'
      ],
      response_format: [
        '1. Corrected version — minimal correction preserving meaning and tone.',
        '2. Natural version — smoother phrasing when useful; omit if the minimal correction is already natural.',
        '3. Key changes — only important changes, classified as Error / Naturalness / Konglish / Tone.',
        '4. Alternatives — include only when there are meaningfully different good options.'
      ]
    };

    const responseInstructions = [
      'Do not mark a stylistic preference as a grammar or spelling error.',
      'If the original is already correct and natural, say so and avoid unnecessary rewriting.',
      'For Korean spacing or spelling, provide the corrected form directly and explain only non-obvious cases.',
      'For English, explicitly identify phrases that are grammatically possible but unnatural to a fluent speaker.',
      'For Konglish, give the natural English expression and briefly explain the usage difference.',
      'Keep explanations concise and practical.',
      explain_changes ? 'Explain important changes.' : 'Return corrected/natural versions with minimal explanation.'
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
  'korean_proofread',
  {
    description: 'Check Korean spelling, spacing, grammar, sentence agreement, and natural phrasing while preserving the original tone.',
    argsSchema: z.object({
      text: z.string().min(1),
      context: z.string().optional(),
      tone: Tone.optional()
    })
  },
  async ({ text, context, tone }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Review this Korean text. Correct objective spelling, spacing, grammar, particles, endings, sentence agreement, and punctuation first. Then suggest a more natural version only if it materially improves readability. Preserve meaning and the writer's tone. Clearly separate required corrections from optional style suggestions.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}\nTone: ${tone ?? 'preserve'}`
      }
    }]
  })
);

server.registerPrompt(
  'natural_english',
  {
    description: 'Check English grammar and propose natural, context-appropriate phrasing, including detection of Korean translation patterns and Konglish.',
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
        text: `Review this English text for both correctness and naturalness. Separate actual grammar errors from expressions that are grammatical but awkward or overly literal from Korean. Flag Konglish or nonstandard usage when relevant and give a natural alternative. Preserve the intended meaning and use the smallest necessary rewrite.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}\nTone: ${tone ?? 'preserve'}\nAudience: ${audience ?? 'Not specified'}`
      }
    }]
  })
);

server.registerPrompt(
  'konglish_check',
  {
    description: 'Check Korean-English mixed copy for Konglish, awkward borrowed English, and expressions whose Korean usage differs from natural English.',
    argsSchema: z.object({
      text: z.string().min(1),
      context: z.string().optional()
    })
  },
  async ({ text, context }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Check this text specifically for Konglish and Korean-influenced English. For each flagged expression, classify it as: natural international English / understandable but nonstandard / misleading in English / Korean-only usage. Suggest a natural English alternative when needed. Do not replace established Korean brand terms unless the context requires English for an international audience.\n\nText: ${text}\nContext: ${context ?? 'Not specified'}`
      }
    }]
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
