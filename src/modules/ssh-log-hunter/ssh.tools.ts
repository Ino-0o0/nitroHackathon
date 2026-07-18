import {
  ToolDecorator as Tool,
  ExecutionContext,
  Widget,
  z
} from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export class SSHTools {

  @Tool({
    name: 'scan_ssh_logs',
    description: 'Scan SSH log file for suspicious login attempts and generate security report',
    inputSchema: z.object({
      logFile: z.string().default('data/access.log'),
      minAttempts: z.number().default(5)
    }),
    metadata: { category: 'security', tags: ['ssh', 'logs'] },
    examples: {
      request: { logFile: 'data/access.log', minAttempts: 5 },
      response: {
        totalFailed: 24,
        totalSuccess: 20,
        suspiciousIPs: [
          { ip: '192.168.1.20', attempts: 7 },
          { ip: '192.168.1.21', attempts: 6 },
          { ip: '192.168.1.22', attempts: 6 },
          { ip: '192.168.1.30', attempts: 5 }
        ],
        summary: '4 suspicious IP(s) detected (min 5 attempts)'
      }
    }
  })
  @Widget('ssh-security-dashboard')
  async scanLogs(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Scanning SSH logs', { input });
    
    const logFile = input?.logFile || 'data/access.log';
    const minAttempts = input?.minAttempts || 5;
    const logPath = path.resolve(process.cwd(), logFile);

    if (!fs.existsSync(logPath)) {
      return { status: "Error", message: `Log file not found: ${logFile}` };
    }

    try {
      const file = fs.readFileSync(logPath, 'utf8');
      const lines = file.split('\n');
      
      let failed = 0, success = 0;
      const ips: Record<string, number> = {};

      for (const line of lines) {
        if (line.includes("Failed password")) {
          failed++;
          const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match) ips[match[0]] = (ips[match[0]] || 0) + 1;
        }
        if (line.includes("Accepted password")) success++;
      }

      const safePath = path.resolve(process.cwd(), 'data/safe-ips.json');
      let safeIPs: string[] = [];
      if (fs.existsSync(safePath)) {
        try {
          safeIPs = JSON.parse(fs.readFileSync(safePath, 'utf8')).safe_ips || [];
        } catch (e) { ctx.logger.warn("Could not parse safe-ips.json"); }
      }

      const suspicious = Object.entries(ips)
        .filter(([ip, count]) => count >= minAttempts && !safeIPs.includes(ip))
        .map(([ip, count]) => ({ ip, attempts: count }))
        .sort((a, b) => b.attempts - a.attempts);

      return {
        totalFailed: failed,
        totalSuccess: success,
        suspiciousIPs: suspicious,
        summary: `${suspicious.length} suspicious IP(s) detected (min ${minAttempts} attempts)`
      };
    } catch (error: any) {
      ctx.logger.error("Error scanning logs", error);
      return { status: "Error", message: error.message };
    }
  }

  @Tool({
    name: 'generate_demo_logs',
    description: 'Generate realistic demo SSH logs for testing and hackathon presentation',
    inputSchema: z.object({
      totalLines: z.number().default(200).describe('Total number of log lines to generate'),
      attackIPs: z.number().default(3).describe('Number of attacking IPs to simulate'),
      safeIP: z.string().default('192.168.1.100').describe('IP to whitelist as safe')
    }),
    metadata: {
      category: 'security',
      tags: ['demo', 'mock-data', 'testing']
    },
    examples: {
      request: { totalLines: 200, attackIPs: 3, safeIP: '192.168.1.100' },
      response: {
        status: 'Success',
        message: 'Generated 200 demo SSH log lines',
        logPath: 'data/access.log',
        attackers: ['192.168.1.20', '192.168.1.21', '192.168.1.22'],
        summary: 'Demo data ready! 3 attacking IPs, 4 safe IPs, 200 total lines.'
      }
    }
  })
  async generateDemoLogs(input: any, ctx: ExecutionContext) {
    const totalLines = input?.totalLines || 200;
    const attackCount = input?.attackIPs || 3;
    const safeIP = input?.safeIP || '192.168.1.100';

    const logPath = path.resolve(process.cwd(), 'data/access.log');
    const safePath = path.resolve(process.cwd(), 'data/safe-ips.json');

    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const users = ['root', 'admin', 'user', 'ubuntu', 'deploy', 'test', 'oracle', 'postgres', 'mysql', 'www-data'];
    const ports = ['22', '2222', '22222'];

    const attackers: string[] = [];
    for (let i = 0; i < attackCount; i++) {
      attackers.push(`192.168.1.${20 + i}`);
    }

    const legitIPs = ['10.0.0.5', '10.0.0.12', '172.16.0.8', safeIP];

    const lines: string[] = [];
    const now = new Date();

    for (let i = 0; i < Math.floor(totalLines * 0.15); i++) {
      const date = new Date(now.getTime() - Math.random() * 86400000);
      const month = months[date.getMonth()];
      const day = date.getDate();
      const time = date.toTimeString().split(' ')[0];
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = legitIPs[Math.floor(Math.random() * legitIPs.length)];
      const port = ports[Math.floor(Math.random() * ports.length)];

      lines.push(`${month}  ${day} ${time} server sshd[${1000 + i}]: Accepted password for ${user} from ${ip} port ${port} ssh2`);
    }

    for (let i = 0; i < Math.floor(totalLines * 0.6); i++) {
      const date = new Date(now.getTime() - Math.random() * 86400000);
      const month = months[date.getMonth()];
      const day = date.getDate();
      const time = date.toTimeString().split(' ')[0];
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = attackers[Math.floor(Math.random() * attackers.length)];
      const port = ports[Math.floor(Math.random() * ports.length)];

      lines.push(`${month}  ${day} ${time} server sshd[${2000 + i}]: Failed password for ${user} from ${ip} port ${port} ssh2`);
      lines.push(`${month}  ${day} ${time} server sshd[${2000 + i}]: Failed password for invalid user ${user} from ${ip} port ${port} ssh2`);
    }

    for (let i = 0; i < Math.floor(totalLines * 0.25); i++) {
      const date = new Date(now.getTime() - Math.random() * 86400000);
      const month = months[date.getMonth()];
      const day = date.getDate();
      const time = date.toTimeString().split(' ')[0];
      lines.push(`${month}  ${day} ${time} server kernel: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=203.0.113.${Math.floor(Math.random() * 255)} DST=192.168.1.1 LEN=40`);
    }

    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }

    fs.writeFileSync(logPath, lines.join('\n'), 'utf8');

    fs.writeFileSync(safePath, JSON.stringify({
      safe_ips: [safeIP],
      description: 'Trusted internal IPs that should never be flagged',
      updated_at: new Date().toISOString()
    }, null, 2), 'utf8');

    ctx.logger.info(`Generated ${lines.length} demo log lines at ${logPath}`);

    return {
      status: 'Success',
      message: `Generated ${lines.length} demo SSH log lines`,
      logPath: 'data/access.log',
      safeIPsPath: 'data/safe-ips.json',
      attackers: attackers,
      summary: `Demo data ready! ${attackers.length} attacking IPs, ${legitIPs.length} safe IPs, ${lines.length} total lines.`
    };
  }

  @Tool({
    name: 'block_suspicious_ips',
    description: 'Generate firewall commands to block detected suspicious IPs (simulation mode)',
    inputSchema: z.object({
      ips: z.array(z.string()).describe('List of IPs to block'),
      duration: z.string().default('24h').describe('Block duration (e.g., 1h, 24h, permanent)')
    }),
    metadata: {
      category: 'security',
      tags: ['firewall', 'blocking', 'response']
    },
    examples: {
      request: { ips: ['192.168.1.20', '192.168.1.21'], duration: '24h' },
      response: {
        status: 'Success',
        blocked: 2,
        duration: '24h',
        commands: [
          { ip: '192.168.1.20', iptables: 'sudo iptables -A INPUT -s 192.168.1.20 -j DROP', ufw: 'sudo ufw deny from 192.168.1.20' },
          { ip: '192.168.1.21', iptables: 'sudo iptables -A INPUT -s 192.168.1.21 -j DROP', ufw: 'sudo ufw deny from 192.168.1.21' }
        ]
      }
    }
  })
  async blockIPs(input: any, ctx: ExecutionContext) {
    const ips = input?.ips || [];
    const duration = input?.duration || '24h';

    if (ips.length === 0) {
      return {
        status: 'Warning',
        message: 'No IPs provided to block'
      };
    }

    const commands = ips.map((ip: string) => ({
      ip,
      iptables: `sudo iptables -A INPUT -s ${ip} -j DROP`,
      ufw: `sudo ufw deny from ${ip}`,
      nftables: `nft add rule inet filter input ip saddr ${ip} drop`,
      duration
    }));

    return {
      status: 'Success',
      blocked: ips.length,
      duration,
      commands
    };
  }
}