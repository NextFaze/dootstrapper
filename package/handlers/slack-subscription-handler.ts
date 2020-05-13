import { BaseHandler } from './helpers/base-handler';
import { SNSEvent } from 'aws-lambda';
import { WebClient } from '@slack/web-api';
import { createDeploymentStatusBlocks } from './helpers/create-deployment-status-blocks';

export class SlackSubscriptionHandler extends BaseHandler {
  constructor(private webClient: WebClient) {
    super();
  }
  protected async runExec(event: SNSEvent): Promise<any> {
    const channelName = process.env.CHANNEL_NAME as string;
    const channelTypes = process.env.CHANNEL_TYPES as string;

    const channelResponse = await this.getChannelIdByName(
      channelName,
      channelTypes
    );
    const { id, success, error } = channelResponse;

    if (!success) {
      return this.bail(error);
    }

    if (!id) {
      console.error('No channel with given name exists');
      return this.bail();
    }

    const message = event.Records.pop()?.Sns.Message;

    if (!message) {
      console.error('Empty Message received!');
      return this.bail(message);
    }

    const postMessageResponse = await this.webClient.chat.postMessage({
      channel: id,
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

  private async getChannelIdByName(
    channelName: string,
    channelTypes: string,
    cursor = ''
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const channelsResponse = await this.webClient.channels.list({
      types: channelTypes,
      limit: 200,
      cursor,
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

    const channelFound = channels?.find(
      channel => channel.name === channelName
    );

    const next_cursor = channelsResponse.response_metadata?.next_cursor;

    // if there are more items, do another scan
    if (!channelFound && next_cursor) {
      return this.getChannelIdByName(
        channelName,
        channelTypes,
        channelsResponse.response_metadata?.next_cursor
      );
    }
    return {
      success: true,
      id: channelFound?.id,
    };
  }

  private getPostMessageBody(message: string) {
    let messageBody: { text: string; blocks?: any };

    try {
      // tslint:disable-next-line: no-console
      console.log('New Message Received:', message);

      const parsedMessage = JSON.parse(message);

      if (parsedMessage.approval) {
        // when notification is of type approval
        messageBody = this.getApprovalMessageBody(parsedMessage);
      } else if (parsedMessage.detail) {
        // when notification is of type details (status update)
        messageBody = this.getStatusUpdateMessageBody(parsedMessage);
      } else {
        // when no matching template found
        messageBody = {
          text: message,
        };
      }
    } catch (err) {
      messageBody = {
        text: message,
      };
    }
    return messageBody;
  }

  private getApprovalMessageBody(message: {
    [key: string]: string;
    approval: any;
  }) {
    const { approval, region, consoleLink } = message;
    return {
      text: 'Approval required',
      blocks: createDeploymentStatusBlocks({
        message: 'Deployment status updated',
        body: {
          title: approval.pipelineName,
          fields: [
            `*Stage:* ${approval.stageName}`,
            `*Action:* ${approval.actionName}`,
            `*Region:* ${region}`,
          ],
        },
        actions: [
          {
            text: 'View',
            url: consoleLink,
          },
        ],
        footer: `Last Updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      }),
    };
  }

  private getStatusUpdateMessageBody(message: any) {
    const { region, account, detail, id, time } = message;

    return {
      text: 'Deployment state updated',
      blocks: createDeploymentStatusBlocks({
        message: 'Deployment state updated',
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
            url: `https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${detail?.pipeline}/view?region=${region}`,
          },
        ],
        footer: `Last Updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      }),
    };
  }
}
