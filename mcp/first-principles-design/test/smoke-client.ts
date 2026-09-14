import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/index.js']
});

const client = new Client({
  name: 'first-principles-design-smoke-test',
  version: '0.1.0'
});

async function main() {
  await client.connect(transport);

  const tools = await client.listTools();
  const reviewTool = tools.tools.find((tool) => tool.name === 'review_design');
  if (!reviewTool) {
    throw new Error('review_design tool was not discovered');
  }

  const result = await client.callTool({
    name: 'review_design',
    arguments: {
      design_description: 'A mobile landing page hero uses a rounded container, which contains another rounded feature card. Two CTAs have equal visual weight and icons repeat adjacent labels.',
      goal: 'Help first-time visitors understand the service and start a trial quickly.',
      audience: 'First-time mobile visitors',
      context: 'Mobile web landing page',
      constraints: ['Keep accessibility and clear affordances']
    }
  });

  const first = result.content?.[0];
  if (!first || first.type !== 'text' || !first.text.includes('first principles')) {
    throw new Error('review_design returned an unexpected response');
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
