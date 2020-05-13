import { createDeploymentStatusBlocks } from './create-deployment-status-blocks';

describe('createDeploymentStatusBlocks', () => {
  it('should create', () => {
    const blocks = createDeploymentStatusBlocks({
      message: 'Test Message',
      body: {
        title: 'Notification-test-pipeline',
        fields: [
          `*Id:* 123-123-123-123`,
          `*Region:* ap-southeast-1`,
          `*Account:* 0000000012`,
          `*State:* FAILED`,
        ],
      },
      actions: [
        {
          text: 'View',
          // tslint:disable-next-line: max-line-length
          url: `https://console.aws.amazon.com/codepipeline/home?region=ap-southeast-1#/view/Notification-test-pipeline`,
        },
      ],
      footer: `Last Updated at Tue Apr 28 2020 02:36:06 GMT+0000 (Coordinated Universal Time)`,
    });

    expect(blocks).toEqual([
      {
        type: 'section',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'Test Message',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Notification-test-pipeline*' },
        fields: [
          { type: 'mrkdwn', text: '*Id:* 123-123-123-123' },
          { type: 'mrkdwn', text: '*Region:* ap-southeast-1' },
          { type: 'mrkdwn', text: '*Account:* 0000000012' },
          { type: 'mrkdwn', text: '*State:* FAILED' },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View' },
            url:
              'https://console.aws.amazon.com/codepipeline/home?region=ap-southeast-1#/view/Notification-test-pipeline',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text:
              'Last Updated at Tue Apr 28 2020 02:36:06 GMT+0000 (Coordinated Universal Time)',
          },
        ],
      },
    ]);
  });
});
