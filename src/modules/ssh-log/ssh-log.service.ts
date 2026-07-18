import * as fs from 'fs';
import * as path from 'path';

export interface IpVerdict {
  ip: string;
  failedAttempts: number;
  action: 'warn' | 'block';
  message: string;
}

const FAILURE_THRESHOLD = 5;

export class SshLogService {
  private loadSafeIps(safeIpsPath: string): Set<string> {
    const raw = fs.readFileSync(safeIpsPath, 'utf-8');
    const parsed = JSON.parse(raw) as { safe_ips: string[] };
    return new Set(parsed.safe_ips);
  }

  private parseLogFile(logPath: string): Map<string, number> {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');

    const failCounts = new Map<string, number>();
    const failedRegex = /Failed password from (\S+)/;

    for (const line of lines) {
      const match = line.match(failedRegex);
      if (match) {
        const ip = match[1];
        failCounts.set(ip, (failCounts.get(ip) ?? 0) + 1);
      }
    }

    return failCounts;
  }

  analyzeLogFile(logPath: string, safeIpsPath: string): IpVerdict[] {
    const failCounts = this.parseLogFile(logPath);
    const safeIps = this.loadSafeIps(safeIpsPath);

    const verdicts: IpVerdict[] = [];

    for (const [ip, failedAttempts] of failCounts.entries()) {
      if (failedAttempts > FAILURE_THRESHOLD) {
        if (safeIps.has(ip)) {
          verdicts.push({
            ip,
            failedAttempts,
            action: 'warn',
            message: `${ip} is on the safe list but had ${failedAttempts} failed SSH login attempts.`,
          });
        } else {
          verdicts.push({
            ip,
            failedAttempts,
            action: 'block',
            message: `${ip} exceeded the failure threshold with ${failedAttempts} failed attempts and is not on the safe list. Recommend blocking.`,
          });
        }
      }
    }

    return verdicts;
  }
}