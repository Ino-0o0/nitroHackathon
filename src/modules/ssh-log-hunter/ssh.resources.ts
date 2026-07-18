import {
    ResourceDecorator as Resource,
    ExecutionContext
} from '@nitrostack/core';

export class SSHResources {

@Resource({
    name: 'SSH Logs',
    uri: 'ssh://logs',
    description: 'Recent SSH login attempts',
    mimeType: 'application/json'
})
async getLogs(uri: string, ctx: ExecutionContext) {

    ctx.logger.info("Returning SSH resources");

    const logs = [
        {
            ip: "192.168.1.20",
            status: "SUCCESS"
        },
        {
            ip: "203.10.22.5",
            status: "FAILED"
        }
    ];

    return {
        contents: [
            {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(logs, null, 2)
            }
        ]
    };

}
}