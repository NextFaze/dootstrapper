import { BaseHandler } from './helpers/base-handler';
import { SNSEvent } from 'aws-lambda';
import { WebClient } from '@slack/web-api';
import { createDeploymentStatusBlocks } from './helpers/create-deployment-status-blocks';

export class SlackSubscriptionHandler extends BaseHandler {
  constructor(private webClient: WebClient) {
    super();
  }
  protected async runExec(event: SNSEvent): Promise<any> {
    const channelTypes = process.env.CHANNEL_TYPES;
    const channelName = process.env.CHANNEL_NAME;

    const channelsResponse = await this.webClient.conversations.list({
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

    const postMessageResponse = await this.webClient.chat.postMessage({
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
        blocks: createDeploymentStatusBlocks({
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
