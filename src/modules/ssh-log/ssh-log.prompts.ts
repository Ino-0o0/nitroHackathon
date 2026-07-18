import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class SshLogPrompts {
  @Prompt({
    name: 'review_flagged_ips',
    description: 'Review the flagged IP verdicts from check_ssh_log and generate an incident report with firewall block commands',
    arguments: []
  })
  async reviewFlaggedIps(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating SSH log review prompt');

    return [
      {
        role: 'user' as const,
        content: 'Review the results from the check_ssh_log tool.'
      },
      {
        role: 'assistant' as const,
        content: `I'll go through each flagged IP's verdict. For any IP marked "block" (not on the safe list, exceeded the failure threshold), I'll write a brief incident report and provide the exact firewall command to block it, e.g. \`sudo ufw deny from <ip>\`. For any IP marked "warn" (on the safe list but still had excessive failures), I'll note it as worth investigating rather than blocking, since it may be a legitimate employee having login trouble.`
      }
    ];
  }
}