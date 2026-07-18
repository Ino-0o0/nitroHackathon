import { ToolDecorator as Tool, z, ExecutionContext } from '@nitrostack/core';
import { SshLogService } from './ssh-log.service';

export class SshLogTools {
  private sshLogService = new SshLogService();

  @Tool({
    name: 'check_ssh_log',
    description:
      'Reads an SSH access log and a safe-IP list, counts failed login attempts per IP, ' +
      'and flags any IP with more than 5 failures. Safe-listed IPs get a warning, others get blocked.',
    inputSchema: z.object({
      logPath: z.string().describe('Path to the access.log file'),
      safeIpsPath: z.string().describe('Path to the safe-ips.json file'),
    }),
  })
  async checkSshLog(input: { logPath: string; safeIpsPath: string }, ctx: ExecutionContext) {
    ctx.logger.info('Analyzing SSH log', { logPath: input.logPath });

    const verdicts = this.sshLogService.analyzeLogFile(input.logPath, input.safeIpsPath);

    if (verdicts.length === 0) {
      return { summary: 'No IPs exceeded the failure threshold.', verdicts: [] };
    }

    return {
      summary: `${verdicts.length} IP(s) flagged for brute-force activity.`,
      verdicts,
    };
  }
}