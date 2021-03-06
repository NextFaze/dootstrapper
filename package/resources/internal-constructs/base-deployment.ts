import { StackProps, Construct } from '@aws-cdk/core';
import {
  INotificationConfigProps,
  IBasePipelineProps,
  INotificationsSlackTargetConfig,
  INotificationsEmailTargetConfig,
} from '../interfaces';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { EMAIL_VALIDATOR } from '../constants';
import { SlackSubscription } from './slack-subscription';
import { NOTIFICATIONS_TARGET } from '../enums';
import { BasePipeline } from './base-pipeline';

/**
 * @param - __pipelineConfig__: Deploy pipeline configurations
 * @param - __notificationConfig__: Deployment notifications configuration
 * @typeParam T value for this type will be either {@link IFrontendEnvironment} or {@link IBackendEnvironment}
 * @noInheritDoc
 */
export interface IBaseDeploymentProps<T> {
  notificationConfig: INotificationConfigProps;
  pipelineConfig: IBasePipelineProps<T>;
}

/**
 * @noInheritDoc
 */
export class BaseDeployment extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  protected createNotificationSubscription(
    pipeline: BasePipeline,
    notificationsTargetConfig:
      | INotificationsEmailTargetConfig
      | INotificationsSlackTargetConfig
  ) {
    switch (notificationsTargetConfig.targetType) {
      case NOTIFICATIONS_TARGET.EMAIL: {
        const { emailAddress } = notificationsTargetConfig;
        pipeline.notificationTopic.addSubscription(
          this.createEmailSubscription(emailAddress)
        );
        break;
      }
      case NOTIFICATIONS_TARGET.SLACK: {
        const {
          channelName,
          channelTypes,
          channelId,
        } = notificationsTargetConfig;
        pipeline.notificationTopic.addSubscription(
          this.createSlackSubscription({
            channel: channelName,
            types: channelTypes,
            channelId,
          })
        );
        break;
      }
      default: {
        throw new Error('Not a valid Notification target type.');
      }
    }
  }

  private createEmailSubscription(emailAddress: string) {
    if (!EMAIL_VALIDATOR.test(String(emailAddress).toLocaleLowerCase())) {
      throw new Error('Invalid Email Address.');
    }
    return new EmailSubscription(emailAddress);
  }

  private createSlackSubscription({
    channel,
    types,
    channelId,
  }: {
    channel: string;
    types?: string;
    channelId?: string;
  }) {
    const lambdaSub = new SlackSubscription(this, 'SlackSubscription', {
      channel,
      types,
      channelId,
    });
    return lambdaSub.subscription;
  }
}
