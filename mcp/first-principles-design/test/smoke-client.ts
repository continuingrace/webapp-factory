import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/index.js']
});

const client = new Client({
  name: 'first-principles-design-smoke-test',
  version: '0.3.0'
});

async function main() {
  await client.connect(transport);

  const tools = await client.listTools();
  const reviewTool = tools.tools.find((tool) => tool.name === 'review_design_source');
  if (!reviewTool) {
    throw new Error('review_design_source tool was not discovered');
  }

  const prompts = await client.listPrompts();
  const figmaPrompt = prompts.prompts.find((prompt) => prompt.name === 'review_figma_frame');
  if (!figmaPrompt) {
    throw new Error('review_figma_frame prompt was not discovered');
  }
  const safePrompt = prompts.prompts.find((prompt) => prompt.name === 'plan_safe_revision');
  if (!safePrompt) {
    throw new Error('plan_safe_revision prompt was not discovered');
  }

  const sourceReference = 'https://www.figma.com/design/example?node-id=123-456';
  const result = await client.callTool({
    name: 'review_design_source',
    arguments: {
      source_type: 'figma',
      source_reference: sourceReference,
      design_snapshot: 'A mobile landing page hero contains a rounded outer container, a second rounded feature card, two equally strong CTAs, and icons that repeat adjacent text labels.',
      goal: 'Help first-time visitors understand the service and start a trial quickly.',
      audience: 'First-time mobile visitors',
      context: 'Mobile web landing page',
      constraints: ['Keep accessibility and clear affordances']
    }
  });

  const first = result.content?.[0];
  if (!first || first.type !== 'text') {
    throw new Error('review_design_source returned no text response');
  }

  const parsed = JSON.parse(first.text);
  if (parsed?.task?.source_reference !== sourceReference) {
    throw new Error('source_reference was not preserved in the MCP response');
  }
  if (!Array.isArray(parsed?.framework?.review_order) || parsed.framework.review_order.length === 0) {
    throw new Error('review framework was missing');
  }
  if (parsed?.safe_revision_policy?.mode !== 'proposal_only_until_explicit_approval') {
    throw new Error('safe revision policy was missing');
  }

  const safeResult = await client.getPrompt({
    name: 'plan_safe_revision',
    arguments: {
      source_reference: sourceReference,
      recommendation: 'Merge the nested cards and reduce the secondary CTA emphasis.'
    }
  });
  const safeText = safeResult.messages?.[0]?.content;
  if (!safeText || safeText.type !== 'text' || !safeText.text.includes('DO NOT change anything yet') || !safeText.text.includes('Wait for my separate explicit approval')) {
    throw new Error('plan_safe_revision did not preserve the non-destructive approval gate');
  }

  console.log('MCP protocol smoke test passed');
  await client.close();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await client.close();
  } catch {}
  process.exit(1);
});
