import { PromptDecorator as Prompt } from '@nitrostack/core';

export class SSHPrompts {

  @Prompt({
    name: 'analyze_ssh_threats',
    description: 'Analyze SSH scan results and generate incident response recommendations'
  })
  generateReport() {
    return {
      messages: [
        {
          role: 'system',
          content: `You are an expert Cybersecurity Incident Responder.
Analyze the SSH scan results and provide clear, actionable recommendations.
Focus on severity, recommended actions, and whether immediate blocking is needed.`
        }
      ]
    };
  }
}