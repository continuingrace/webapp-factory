import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({ command: 'node', args: ['dist/index.js'] });
const client = new Client({ name: 'language-qa-smoke-test', version: '0.1.0' });

async function main() {
  await client.connect(transport);

  const tools = await client.listTools();
  if (!tools.tools.find((tool) => tool.name === 'review_language')) {
    throw new Error('review_language tool was not discovered');
  }

  const prompts = await client.listPrompts();
  for (const name of ['korean_proofread', 'natural_english', 'konglish_check']) {
    if (!prompts.prompts.find((prompt) => prompt.name === name)) {
      throw new Error(`${name} prompt was not discovered`);
    }
  }

  const result = await client.callTool({
    name: 'review_language',
    arguments: {
      text: 'happy Thankful today',
      language: 'en',
      tone: 'natural',
      context: 'short social caption'
    }
  });

  const first = result.content?.[0];
  if (!first || first.type !== 'text') throw new Error('review_language returned no text');
  const parsed = JSON.parse(first.text);
  if (!Array.isArray(parsed?.framework?.english_checks)) throw new Error('English review framework missing');

  console.log('Language QA MCP protocol smoke test passed');
  await client.close();
}

main().catch(async (error) => {
  console.error(error);
  try { await client.close(); } catch {}
  process.exit(1);
});
