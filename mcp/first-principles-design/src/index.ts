import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({
  name: 'first-principles-design',
  version: '0.1.0'
});

const ReviewInput = z.object({
  design_description: z.string().min(1).describe('Describe the screen, layout, component, or design decision to review.'),
  goal: z.string().min(1).describe('Primary communication or user goal.'),
  audience: z.string().optional().describe('Primary audience or user type.'),
  context: z.string().optional().describe('Channel or environment: web, app, social, presentation, print, etc.'),
  constraints: z.array(z.string()).optional().describe('Non-negotiable constraints such as brand, accessibility, platform, or development limits.'),
  suspicious_patterns: z.array(z.string()).optional().describe('Patterns you already suspect may be habitual or unnecessary.')
});

server.registerTool(
  'review_design',
  {
    description: 'Challenge a design from first principles. Questions the necessity of elements, separates goals from conventions, and proposes keep/remove/merge/replace/emphasize actions.',
    inputSchema: ReviewInput
  },
  async ({ design_description, goal, audience, context, constraints = [], suspicious_patterns = [] }) => {
    const framework = {
      principle: 'Do not defend a pattern because it is common. Defend it only if it serves the stated goal under the stated constraints.',
      review_order: [
        'Clarify the real job of the design',
        'Identify every major element or pattern and state its job',
        'Ask what breaks if that element disappears',
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
      design_description,
      goal,
      audience: audience ?? 'Not specified',
      context: context ?? 'Not specified',
      constraints,
      suspicious_patterns
    };

    const responseInstructions = [
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
  'first_principles_design_review',
  {
    description: 'A reusable prompt for rigorous first-principles design critique.',
    argsSchema: z.object({
      design_description: z.string(),
      goal: z.string(),
      audience: z.string().optional(),
      context: z.string().optional()
    })
  },
  async ({ design_description, goal, audience, context }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Review this design from first principles.\n\nDesign: ${design_description}\nGoal: ${goal}\nAudience: ${audience ?? 'Not specified'}\nContext: ${context ?? 'Not specified'}\n\nDo not assume common UI patterns are necessary. For each major element, identify its real job, ask what is lost if it disappears, detect duplicated grouping or emphasis, and recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST. Protect accessibility and required affordances. Prefer the simplest structure that preserves meaning and usability. Avoid taste-only judgments.`
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
