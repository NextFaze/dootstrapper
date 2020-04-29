import { BaseHandler } from './base-handler';
import { SNSEvent } from 'aws-lambda';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
import { SSM } from 'aws-sdk';
import { getDeploymentStatusBlocks } from './blocks';

export class SlackSubscriptionHandler extends BaseHandler {
  constructor() {
    super();
  }
  protected async runExec(event: SNSEvent): Promise<any> {
    const paramName = process.env.AUTH_TOKEN_PARAM;
    const channelName = process.env.CHANNEL_NAME;
    const channelTypes = process.env.CHANNEL_TYPES;

    if (!paramName || !channelName) {
      console.error('One ore more required parameter is missing.');
      return this.bail();
    }

    // This wil almost never happen, mainly because aws guarantees that sns will always have single message instance
    if (event.Records.length > 1) {
      console.error(
        'Something went wrong, there should not be more than one message in an event.'
      );
      return this.bail();
    }

    const ssm = new SSM();
    const response = await ssm
      .getParameter({
        Name: paramName,
        WithDecryption: true,
      })
      .promise();

    const webClient = new WebClient(response.Parameter?.Value);

    const channelsResponse = await webClient.conversations.list({
      types: channelTypes,
    });
    if (!channelsResponse.ok) {
      console.error(
        `Could not retrieve channel id.`,
        'Please request permissions for scope "channels:read:bot", and try again '
      );
      return this.bail(channelsResponse.error);
    }
    const channels = channelsResponse.channels as {
      id: string;
      name: string;
      [key: string]: any;
    }[];

    const channelId = channels?.find(channel => channel.name === channelName)
      ?.id;
    if (!channelId) {
      console.error('No channel with given name exists');
      return this.bail();
    }

    const message = event.Records.pop()?.Sns.Message;

    if (!message) {
      console.error('Empty Message received!');
      return this.bail(message);
    }

    const postMessageResponse = await webClient.chat.postMessage({
      channel: channelId,
      ...this.getPostMessageBody(message),
    });

    if (!postMessageResponse.ok) {
      console.error(
        'Could Not post notification to slack',
        'Please request permissions for scope "chat:write:bot", and make sure bot is in the channel.'
      );
      return this.bail(postMessageResponse.error);
    }
    return { success: true };
  }

  private getPostMessageBody(message: string) {
    let parsedMessageBody: { text: string; blocks?: any };

    try {
      const parsedMessage = JSON.parse(message);

      const { region, account, detail, id, time } = parsedMessage;

      parsedMessageBody = {
        text: 'Anything Really', // this will get ignored
        blocks: getDeploymentStatusBlocks({
          body: {
            title: detail?.pipeline,
            fields: [
              `*Id:* ${id}`,
              `*Region:* ${region}`,
              `*Account:* ${account}`,
              `*State:* ${detail?.state}`,
            ],
          },
          actions: [
            {
              text: 'View',
              url: `https://console.aws.amazon.com/codepipeline/home?region=${region}#/view/${detail?.pipeline}`,
            },
          ],
          footer: `Last Updated at ${new Date(time).toString()}`,
        }),
      };
    } catch (err) {
      parsedMessageBody = {
        text: message,
      };
    }
    return parsedMessageBody;
  }
}
