import { SNSEvent } from 'aws-lambda';
import { SlackSubscriptionHandler } from './slack-subscription-handler';
const slackSubscriptionHandler = new SlackSubscriptionHandler();

export const handler = slackSubscriptionHandler.run.bind(
  slackSubscriptionHandler
);
