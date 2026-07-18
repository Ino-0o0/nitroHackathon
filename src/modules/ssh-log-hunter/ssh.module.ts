import { Module } from '@nitrostack/core';
import { SSHTools } from './ssh.tools.js';
import { SSHResources } from './ssh.resources.js';
import { SSHPrompts } from './ssh.prompts.js';

@Module({
  name: 'ssh-log-hunter',
  description: 'Analyzes SSH logs for suspicious activity and security threats',
  controllers: [
    SSHTools,
    SSHResources,
    SSHPrompts
  ]
})
export class SSHModule {}