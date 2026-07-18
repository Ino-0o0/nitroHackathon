import { Module } from '@nitrostack/core';
import { SshLogTools } from './ssh-log.tools.js';
import { SshLogResources } from './ssh-log.resources.js';
import { SshLogPrompts } from './ssh-log.prompts.js';

@Module({
  name: 'ssh-log',
  description: 'Analyze and check SSH logs for suspicious activity',
  controllers: [SshLogTools, SshLogResources, SshLogPrompts]
})
export class SshLogModule {}