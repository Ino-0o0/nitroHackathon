import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { SystemHealthCheck } from './health/system.health';
import { SSHModule } from './modules/ssh-log-hunter/ssh.module.js';

@McpApp({
  module: AppModule,
  server: { name: 'ssh-log-hunter-server', version: '1.0.0' },
  logging: { level: 'info' }
})
@Module({
  name: 'app',
  imports: [ ConfigModule.forRoot(), CalculatorModule, SSHModule ],
  providers: [ SystemHealthCheck ]
})
export class AppModule {}