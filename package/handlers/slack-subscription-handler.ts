import { BaseHandler } from './base-handler';
import { SNSEvent } from 'aws-lambda';
import { WebClient } from '@slack/web-api';
import { SSM } from 'aws-sdk';
import { getDeploymentStatusBlocks } from './blocks';

export class SlackSubscriptionHandler extends BaseHandler {
  constructor() {
    super();
  }
  async runExec(event: SNSEvent): Promise<any> {
    const paramName = process.env.AUTH_TOKEN_PARAM;
    const channelName = process.env.CHANNEL_NAME;
    const channelTypes = process.env.CHANNEL_TYPES;

    if (!paramName || !channelName) {
      console.error('One ore more required parameter is missing.');
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

    const postMessageResponse = await webClient.chat.postMessage({
      channel: channelId,
      text: 'Anything really', // this will get ignored
      blocks: getDeploymentStatusBlocks({
        body: {
          title: 'Title',
          fields: [
            `*Stage:* stage`,
            `*State:* stage`,
            `*Execution Id:* stage`,
            `*Region:* stage`,
          ],
          imgUrl: 'https://via.placeholder.com/150',
        },
        actions: [
          {
            text: 'View',
            url: `https://console.aws.amazon.com/codepipeline/home?region=ap-southeast-1#/view/twohands-cdk-tally-app-deploy-pipeline`,
          },
        ],
        footer: `Last Updated at ${new Date().toString()}`,
      }),
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
}
