import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({
  name: 'design-logic',
  version: '0.3.0'
});

const SourceType = z.enum(['figma', 'web', 'screenshot', 'manual']);

const ReviewInput = z.object({
  source_type: SourceType.describe('Where the design comes from.'),
  source_reference: z.string().min(1).describe('Exact Figma URL/node, web URL, screenshot identifier, or manual reference.'),
  design_snapshot: z.string().min(1).describe('A concise extraction of the actual design to review. For Figma/web/screenshot, inspect that exact source first and pass only observed structure here.'),
  goal: z.string().min(1).describe('Primary communication or user goal.'),
  audience: z.string().optional().describe('Primary audience or user type.'),
  context: z.string().optional().describe('Channel or environment: web, app, social, presentation, print, etc.'),
  constraints: z.array(z.string()).optional().describe('Non-negotiable constraints such as brand, accessibility, platform, or development limits.'),
  suspicious_patterns: z.array(z.string()).optional().describe('Patterns already suspected to be habitual or unnecessary.')
});

server.registerTool(
  'review_design_source',
  {
    description: 'Review an explicitly identified design source by testing the rationale for its structure, hierarchy, emphasis, and interaction patterns. Inspect the source first, avoid taste-only critique, and include a non-destructive next-step prompt for safe revision planning.',
    inputSchema: ReviewInput
  },
  async ({ source_type, source_reference, design_snapshot, goal, audience, context, constraints = [], suspicious_patterns = [] }) => {
    const framework = {
      principle: 'A design decision should be defended by the job it performs, not by convention alone.',
      source_rule: 'The critique applies only to the exact source_reference supplied. If the source has not been inspected, inspect it first instead of guessing.',
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

    const safeRevisionPolicy = {
      mode: 'proposal_only_until_explicit_approval',
      rules: [
        'Do not edit, delete, rename, overwrite, commit, push, deploy, or mutate the original source during planning.',
        'Inspect the relevant implementation first and state whether the proposed change is technically feasible and what it could affect.',
        'Prefer the smallest reversible change that addresses the design issue.',
        'Identify files, components, selectors, tokens, or frames that would be touched before any modification.',
        'Call out regression, responsive, accessibility, persistence/data, and deployment risks when relevant.',
        'Describe how to preview or test the change separately from the original when possible.',
        'Show the proposed change as a plan or diff preview, not as an applied edit.',
        'Wait for explicit user approval before making any change.'
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
      'For each issue use: Element / Current job / Logic check / Judgment / Action / Better alternative.',
      'Do not remove conventions necessary for accessibility, comprehension, safety, or platform expectations.',
      'Avoid taste-only claims. Tie every judgment to communication, usability, hierarchy, cognition, accessibility, maintainability, or context.',
      'End with the three highest-impact changes and one thing that should stay unchanged.',
      'Then add a section named Safe next-step prompt.',
      'Provide one copyable prompt for an implementation agent. It must ask the agent to inspect the relevant code/design first, assess feasibility and side effects, propose the smallest reversible change, state exactly what would be touched, and show a preview/test plan.',
      'The prompt must explicitly forbid editing, deleting, committing, pushing, deploying, or otherwise changing the original until the user gives separate explicit approval.',
      'If the requested revision cannot be isolated safely, the implementation agent should stop and report why.'
    ];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ task, framework, safe_revision_policy: safeRevisionPolicy, response_instructions: responseInstructions }, null, 2)
      }]
    };
  }
);

server.registerPrompt(
  'review_explicit_design_source',
  {
    description: 'Review one exact Figma frame, webpage, screenshot, or manually described design after the source has been inspected.',
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
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Review this exact design source using Design Logic.\n\nSource type: ${source_type}\nSource: ${source_reference}\nObserved design: ${design_snapshot}\nGoal: ${goal}\nAudience: ${audience ?? 'Not specified'}\nContext: ${context ?? 'Not specified'}\n\nDo not guess about any page other than the named source. Test whether each major design decision has a clear job, challenge habitual patterns only when the observed design supports the critique, and recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST. Protect accessibility and required affordances. End with a Safe next-step prompt that is planning-only and must not change the original until I explicitly approve in a later message.`
      }
    }]
  })
);

server.registerPrompt(
  'review_figma_frame',
  {
    description: 'Inspect an exact Figma frame/node with the host Figma integration, summarize observed design facts, then run a Design Logic review.',
    argsSchema: z.object({
      figma_url: z.string().min(1),
      goal: z.string().min(1),
      audience: z.string().optional(),
      constraints: z.string().optional()
    })
  },
  async ({ figma_url, goal, audience, constraints }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Inspect this exact Figma frame/node first using the available Figma MCP/integration: ${figma_url}\n\nDo not infer the layout from the URL or prior memory. Extract the actual visible hierarchy, containers, typography roles, spacing/grouping, CTAs, controls, repeated labels/icons, and other consequential patterns. Then call review_design_source with source_type='figma', source_reference='${figma_url}', and a concise design_snapshot containing only what you actually observed.\n\nGoal: ${goal}\nAudience: ${audience ?? 'Not specified'}\nConstraints: ${constraints ?? 'Not specified'}\n\nIf the Figma source cannot be read, stop rather than fabricate a critique.`
      }
    }]
  })
);

server.registerPrompt(
  'plan_safe_revision',
  {
    description: 'Turn a design recommendation into a non-destructive implementation planning prompt. This prompt must not apply changes.',
    argsSchema: z.object({
      source_reference: z.string().min(1),
      recommendation: z.string().min(1),
      implementation_context: z.string().optional()
    })
  },
  async ({ source_reference, recommendation, implementation_context }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Plan a safe implementation for this design recommendation, but DO NOT change anything yet.\n\nOriginal source: ${source_reference}\nRecommendation: ${recommendation}\nImplementation context: ${implementation_context ?? 'Inspect the relevant project/code first.'}\n\nBefore proposing edits, inspect the relevant implementation. Tell me whether the change can be isolated safely, exactly which files/components/selectors/tokens/frames would be affected, and any responsive, accessibility, state/persistence, regression, or deployment risks. Prefer the smallest reversible change. Show a proposed diff/preview strategy and a test/rollback plan. Do not edit, delete, rename, overwrite, commit, push, deploy, or mutate the original source in this step. If a safe isolated change is not possible, stop and explain why. Wait for my separate explicit approval before applying anything.`
      }
    }]
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Design Logic MCP failed:', error);
  process.exit(1);
});
