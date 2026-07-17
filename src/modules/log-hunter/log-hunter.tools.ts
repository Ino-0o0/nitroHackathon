import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import fs from 'fs';

export class LogHunterTools {
  @Tool({
    name: 'read_log_entries',
    description: 'Reads an SSH log file and extracts the IP address and success/failure status from each line',
    inputSchema: z.object({
      file_path: z.string().describe('Path to the log file, e.g. data/access.log')
    }),
    examples: {
      request: {
        file_path: 'data/access.log'
      },
      response: {
        entries: [
          { ip: '45.33.12.5', success: false },
          { ip: '10.0.0.4', success: true }
        ]
      }
    }
  })
  async readLogEntries(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Reading log file', { file_path: input.file_path });

    const fileContent = fs.readFileSync(input.file_path, 'utf-8');
    const lines = fileContent.split('\n');
    const entries: { ip: string; success: boolean }[] = [];

    for (const line of lines) {
      if (line.trim() === '') continue;

      const ipMatch = line.match(/from (\d+\.\d+\.\d+\.\d+)/);
      if (!ipMatch) continue;

      const ip = ipMatch[1];
      const success = line.includes('Accepted password');

      entries.push({ ip, success });
    }

    return {
      entries: entries,
      total_lines_processed: entries.length
    };
  }
}