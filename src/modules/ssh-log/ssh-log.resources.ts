import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import * as fs from 'fs';

export class SshLogResources {
  @Resource({
    uri: 'ssh-log://safe-ips',
    name: 'Safe IP List',
    description: 'Known safe/employee IP addresses that should never be flagged as attackers',
    mimeType: 'application/json',
    examples: {
      response: {
        employees: ['10.0.0.5', '10.0.0.6', '10.0.0.7', '10.0.0.8']
      }
    }
  })
  async getSafeIps(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching safe IP list');

    const data = fs.readFileSync('data/safe-ips.json', 'utf-8');

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: data
      }]
    };
  }
}