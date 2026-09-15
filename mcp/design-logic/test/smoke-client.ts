import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({ command: 'node', args: ['dist/index.js'] });
const client = new Client({ name: 'design-logic-smoke-test', version: '0.3.0' });

async function main() {
  await client.connect(transport);

  const tools = await client.listTools();
  if (!tools.tools.some((tool) => tool.name === 'review_design_source')) {
    throw new Error('review_design_source tool was not discovered');
  }

  const prompts = await client.listPrompts();
  for (const required of ['review_explicit_design_source', 'review_figma_frame', 'plan_safe_revision']) {
    if (!prompts.prompts.some((prompt) => prompt.name === required)) {
      throw new Error(`${required} prompt was not discovered`);
    }
  }

  const sourceReference = 'https://example.com';
  const result = await client.callTool({
    name: 'review_design_source',
    arguments: {
      source_type: 'web',
      source_reference: sourceReference,
      design_snapshot: 'A landing page with nested cards, two equally strong CTAs, and repeated icon-label pairs.',
      goal: 'Help first-time visitors understand the service and choose a next action.'
    }
  });

  const first = result.content?.[0];
  if (!first || first.type !== 'text') throw new Error('No text response returned');
  const parsed = JSON.parse(first.text);
  if (parsed?.task?.source_reference !== sourceReference) throw new Error('Source reference was not preserved');
  if (parsed?.safe_revision_policy?.mode !== 'proposal_only_until_explicit_approval') throw new Error('Safe revision policy missing');

  const safePrompt = await client.getPrompt({
    name: 'plan_safe_revision',
    arguments: {
      source_reference: sourceReference,
      recommendation: 'Merge the nested cards into one clearer content group.'
    }
  });
  const content = safePrompt.messages?.[0]?.content;
  if (!content || content.type !== 'text' || !content.text.includes('DO NOT change anything yet')) {
    throw new Error('Safe revision prompt guardrail missing');
  }

  console.log('Design Logic MCP protocol smoke test passed');
  await client.close();
}

main().catch(async (error) => {
  console.error(error);
  try { await client.close(); } catch {}
  process.exit(1);
});
