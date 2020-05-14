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
      channels: {
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
      channels: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-you' }],
        }),
      },
    } as any);

    const response = await slackSubHandler.run({ Records: [{}] } as any);
    expect(response).toEqual({ success: false });
  });

  it('should make multiple requests when channel could not be found in first request', async () => {
    let count = 0;
    const listSubSpy = jasmine.createSpy().and.callFake(() => {
      count++;
      if (count === 1) {
        return {
          ok: true,
          channels: [{ id: '123', name: 'notify-you' }],
          response_metadata: {
            next_cursor: 'some_key',
          },
        };
      }
      if (count === 2) {
        return {
          ok: true,
          channels: [{ id: '123', name: 'notify-me' }],
        };
      }
      return;
    });

    slackSubHandler = new SlackSubscriptionHandler({
      channels: {
        list: listSubSpy,
      },
      chat: {
        postMessage: jasmine.createSpy().and.returnValue({ success: true }),
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
    expect(listSubSpy).toHaveBeenCalledTimes(2);
    expect(response).toEqual({ success: false });
  });

  it('should bail out if no channels found for given name', async () => {
    slackSubHandler = new SlackSubscriptionHandler({
      channels: {
        list: jasmine.createSpy().and.returnValue({
          ok: true,
          channels: [{ id: '123', name: 'notify-you' }],
        }),
      },
    } as any);

    const response = await slackSubHandler.run({ Records: [{}] } as any);
    expect(response).toEqual({ success: false });
  });

  it('should post approval message', async () => {
    const postMessageSpy = jasmine.createSpy().and.returnValue({ ok: true });
    slackSubHandler = new SlackSubscriptionHandler({
      channels: {
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
              region: 'ap-southeast-2',
              consoleLink:
                'https://console.aws.amazon.com/codesuite/codepipeline/pipelines/test-pipeline/view?region=ap-southeast-2',
              approval: {
                pipelineName: 'test-pipeline',
                stageName: 'ProdDeploy',
                actionName: 'prod-approve',
                token: '000000-0000',
                expires: '2020-05-07T09:41Z',
                externalEntityLink: null,
                approvalReviewLink:
                  'https://console.aws.amazon.com/codesuite/codepipeline/pipelines/test-pipeline/view?region=ap-southeast-2#/ProdDeploy/prod-approve/approve/000000-0000',
                customData: null,
              },
            }),
          },
        },
      ],
    } as any);

    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        channel: '123',
        text: 'Approval required',
      })
    );
    expect(response).toEqual({ success: true });
  });

  it('should post status update message', async () => {
    const date = new Date();
    jasmine.clock().mockDate(date);
    const postMessageSpy = jasmine.createSpy().and.returnValue({ ok: true });
    slackSubHandler = new SlackSubscriptionHandler({
      channels: {
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
    expect(postMessageSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        channel: '123',
        text: 'Deployment state updated',
      })
    );
    expect(response).toEqual({ success: true });
  });

  it('should post message as simple string when message could not be formatted', async () => {
    const postMessageSpy = jasmine.createSpy().and.returnValue({ ok: true });
    slackSubHandler = new SlackSubscriptionHandler({
      channels: {
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
