import { SNSEvent } from 'aws-lambda';
import { SlackSubscriptionHandler } from './slack-subscription-handler';
import { SSM } from 'aws-sdk';
import { WebClient } from '@slack/web-api';

export const handler = async (event: SNSEvent, ctx?: any) => {
  // This wil almost never happen, mainly because aws guarantees that sns will always have single message instance
  if (event.Records.length > 1) {
    console.error(
      'Something went wrong, there should not be more than one message in an event.'
    );
    return { success: false };
  }
  const paramName = process.env.AUTH_TOKEN_PARAM;
  const channelName = process.env.CHANNEL_NAME;

  if (!paramName || !channelName) {
    console.error('One ore more required parameter is missing.');
    return { success: false };
  }

  const ssm = new SSM();
  const response = await ssm
    .getParameter({
      Name: paramName,
      WithDecryption: true,
    })
    .promise();

  const webClient = new WebClient(response.Parameter?.Value);

  const slackSubscriptionHandler = new SlackSubscriptionHandler(webClient);
  return slackSubscriptionHandler.run(event, ctx);
};
