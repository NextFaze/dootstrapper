import { SlackSubscriptionHandler } from './slack-subscription-handler';
import { SSM } from 'aws-sdk';

describe('SlackSubscriptionHandler', () => {
  let slackSubHandler: SlackSubscriptionHandler;

  beforeEach(() => {
    process.env.AUTH_TOKEN_PARAM = 'SOME_TOKEN';
    process.env.CHANNEL_NAME = 'notify-me';

    spyOn(Object.getPrototypeOf(new SSM()), 'getParameter').and.returnValue({
      promise: jasmine.createSpy().and.returnValue(
        new Promise((resolve, reject) => {
          return resolve({
            Parameter: {
              Value: '123',
            },
          });
        })
      ),
    });
  });

  afterEach(() => {
    delete process.env.AUTH_TOKEN_PARAM;
    delete process.env.CHANNEL_NAME;
  });

  it('should bail out if there was an error retrieving channels', async () => {
    slackSubHandler = new SlackSubscriptionHandler({
      conversations: {
        list: jasmine
          .createSpy()
          .and.returnValue({ ok: false, error: 'no such channel' }),
      },
    } as any);

    const response = await slackSubHandler.run({ Records: [{}] } as any);
    expect(response).toEqual({ success: false, error: 'no such channel' });
  });

  it('should bail out if no channels found for given name', async () => {
    slackSubHandler = new SlackSubscriptionHandler({
      conversations: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-you' }],
        }),
      },
    } as any);

    const response = await slackSubHandler.run({ Records: [{}] } as any);
    expect(response).toEqual({ success: false });
  });

  it('should bail out if no channels found for given name', async () => {
    slackSubHandler = new SlackSubscriptionHandler({
      conversations: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-you' }],
        }),
      },
    } as any);

    const response = await slackSubHandler.run({ Records: [{}] } as any);
    expect(response).toEqual({ success: false });
  });

  it('should post message in blocks structure', async () => {
    const postMessageSpy = jasmine.createSpy().and.returnValue({ ok: true });
    slackSubHandler = new SlackSubscriptionHandler({
      conversations: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-me' }],
        }),
      },
      chat: {
        postMessage: postMessageSpy,
      },
    } as any);

    const response = await slackSubHandler.run({
      Records: [
        {
          Sns: {
            Message: JSON.stringify({
              version: '0',
              id: '123-123-123-123',
              'detail-type': 'CodePipeline Pipeline Execution State Change',
              source: 'aws.codepipeline',
              account: '0000000012',
              time: '2020-04-28T02:36:06Z',
              region: 'ap-southeast-1',
              detail: {
                pipeline: 'Notification-test-pipeline',
                state: 'FAILED',
                version: 1.0,
              },
            }),
          },
        },
      ],
    } as any);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledWith({
      channel: '123',
      text: 'Anything Really',
      blocks: [
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
      ],
    });
    expect(response).toEqual({ success: true });
  });

  it('should post message as simple string when message could not be formatted', async () => {
    const postMessageSpy = jasmine.createSpy().and.returnValue({ ok: true });
    slackSubHandler = new SlackSubscriptionHandler({
      conversations: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-me' }],
        }),
      },
      chat: {
        postMessage: postMessageSpy,
      },
    } as any);

    const response = await slackSubHandler.run({
      Records: [
        {
          Sns: {
            Message: 'Hi There!',
          },
        },
      ],
    } as any);
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledWith({
      channel: '123',
      text: 'Hi There!',
    });
    expect(response).toEqual({ success: true });
  });
});
