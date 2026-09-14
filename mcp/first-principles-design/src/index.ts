import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({
  name: 'first-principles-design',
  version: '0.2.0'
});

const SourceType = z.enum(['figma', 'web', 'screenshot', 'manual']);

const ReviewInput = z.object({
  source_type: SourceType.describe('Where the design comes from.'),
  source_reference: z.string().min(1).describe('Exact Figma URL/node, web URL, screenshot identifier, or manual reference.'),
  design_snapshot: z.string().min(1).describe('A concise extraction of the actual design to review. For Figma/web/screenshot, the host should inspect that exact source first and pass the observed structure here.'),
  goal: z.string().min(1).describe('Primary communication or user goal.'),
  audience: z.string().optional().describe('Primary audience or user type.'),
  context: z.string().optional().describe('Channel or environment: web, app, social, presentation, print, etc.'),
  constraints: z.array(z.string()).optional().describe('Non-negotiable constraints such as brand, accessibility, platform, or development limits.'),
  suspicious_patterns: z.array(z.string()).optional().describe('Patterns already suspected to be habitual or unnecessary.')
});

server.registerTool(
  'review_design_source',
  {
    description: 'Review one explicitly identified design source from first principles. Requires an exact source reference plus an observed design snapshot; do not critique an unspecified page.',
    inputSchema: ReviewInput
  },
  async ({ source_type, source_reference, design_snapshot, goal, audience, context, constraints = [], suspicious_patterns = [] }) => {
    const framework = {
      principle: 'Do not defend a pattern because it is common. Defend it only if it serves the stated goal under the stated constraints.',
      source_rule: 'The critique applies only to the exact source_reference supplied. If the host has not inspected that source, it should inspect it first instead of guessing.',
      review_order: [
        'Clarify the real job of the design',
        'Identify the major elements or patterns and state their job',
        'Ask what breaks if each element disappears',
        'Detect duplicated grouping, hierarchy, decoration, explanation, or interaction',
        'Separate user need from convention or fashion',
        'Choose the lowest-complexity structure that preserves meaning and usability',
        'Protect accessibility and necessary affordances',
        'Recommend an action: KEEP, REMOVE, MERGE, REPLACE, EMPHASIZE, or TEST'
      ],
      mandatory_questions: [
        'What specific job is this element doing?',
        'Could typography, spacing, alignment, sequence, or wording do that job without another container or control?',
        'If this element vanished, what user understanding or action would actually be lost?',
        'Is this solving a real problem or repeating a familiar design pattern?',
        'Is the visual emphasis proportional to the importance of the information or action?',
        'Does this choice still make sense outside the current trend?',
        'What is the simplest alternative that preserves the goal?'
      ],
      anti_patterns_to_probe: [
        'card inside card',
        'unnecessary rounded containers',
        'multiple equally strong CTAs',
        'decorative icons that repeat nearby text',
        'headings whose hierarchy depends only on size',
        'excessive badges or chips',
        'section boxes used where spacing would be enough',
        'generic gradients, glass effects, or shadows without a functional role',
        'redundant labels and helper text',
        'controls copied from convention without a clear user need'
      ]
    };

    const task = {
      source_type,
      source_reference,
      design_snapshot,
      goal,
      audience: audience ?? 'Not specified',
      context: context ?? 'Not specified',
      constraints,
      suspicious_patterns
    };

    const responseInstructions = [
      'Begin by naming the exact source_reference being reviewed so the user can verify the target.',
      'Return a concise but rigorous critique.',
      'Start with the underlying design job in one sentence.',
      'Review the most consequential elements first, not every tiny detail.',
      'For each issue use: Element / Current job / First-principles question / Judgment / Action / Better alternative.',
      'Do not remove conventions that are necessary for accessibility, comprehension, safety, or platform expectations.',
      'Avoid taste-only claims. Tie every judgment to communication, usability, hierarchy, cognition, accessibility, maintainability, or context.',
      'End with the three highest-impact changes and one thing that should stay unchanged.'
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ task, framework, response_instructions: responseInstructions }, null, 2)
        }
      ]
    };
  }
);

server.registerPrompt(
  'review_explicit_design_source',
  {
    description: 'Review one exact Figma frame, webpage, screenshot, or manually described design. The host must inspect the named source before calling the MCP.',
    argsSchema: z.object({
      source_type: SourceType,
      source_reference: z.string(),
      design_snapshot: z.string(),
      goal: z.string(),
      audience: z.string().optional(),
      context: z.string().optional()
    })
  },
  async ({ source_type, source_reference, design_snapshot, goal, audience, context }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Review this exact design source from first principles.\n\nSource type: ${source_type}\nSource: ${source_reference}\nObserved design: ${design_snapshot}\nGoal: ${goal}\nAudience: ${audience ?? 'Not specified'}\nContext: ${context ?? 'Not specified'}\n\nDo not guess about any page other than the named source. Challenge habitual patterns only when the observed design supports the critique. Recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST while protecting accessibility and required affordances.`
        }
      }
    ]
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('first-principles-design MCP failed:', error);
  process.exit(1);
});
