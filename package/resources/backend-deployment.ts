import { Rule } from '@aws-cdk/aws-events';
import { SnsTopic } from '@aws-cdk/aws-events-targets';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants/constants';
import { MultiEnvPipeline } from './constructs/multi-env-pipeline';
import {
  NOTIFICATIONS_DETAILS_TYPE,
  NOTIFICATIONS_TYPE,
} from './constants/enums';
import { IBackendDeploymentProps } from './interfaces';
export class BackendDeployment extends Stack {
  public readonly notificationsRule: Rule;
  constructor(scope: App, id: string, private props: IBackendDeploymentProps) {
    super(scope, id, props);

    const {
      pipelineConfig: { artifactsSourceKey, environments },
    } = props;

    const pipelineConstruct = new MultiEnvPipeline(this, 'MultiEnvPipeline', {
      artifactsSourceKey,
      environments,
    });

    this.notificationsRule = this._createNotificationsRule(
      pipelineConstruct.notificationTopic,
      pipelineConstruct.pipeline.pipelineArn
    );
    pipelineConstruct.notificationTopic.addSubscription(
      this._createSnsSubscription()
    );
  }

  private _createNotificationsRule(
    notificationsTopic: Topic,
    pipelineArn: string
  ) {
    const {
      notificationsConfig: { cloudwatchRuleName, notificationsType },
    } = this.props;
    const snsTopic = new SnsTopic(notificationsTopic);

    let detailType: string;
    switch (notificationsType) {
      case NOTIFICATIONS_TYPE.STAGE_EXECUTION: {
        detailType = NOTIFICATIONS_DETAILS_TYPE.STAGE;
        break;
      }
      case NOTIFICATIONS_TYPE.ACTION_EXECUTION: {
        detailType = NOTIFICATIONS_DETAILS_TYPE.ACTION;
        break;
      }
      default: {
        detailType = NOTIFICATIONS_DETAILS_TYPE.PIPELINE;
      }
    }
    return new Rule(this, 'PipelineNotificationsRule', {
      targets: [snsTopic],
      enabled: true,
      description: 'Dootstrapper Pipeline notifications Cloudwatch Rule',
      ruleName: cloudwatchRuleName,
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: [detailType],
        resources: [pipelineArn],
      },
    });
  }

  private _createSnsSubscription() {
    const {
      notificationsConfig: {
        notificationsTargetConfig: { emailAddress },
      },
    } = this.props;
    if (!EMAIL_VALIDATOR.test(String(emailAddress).toLocaleLowerCase())) {
      throw new Error('Invalid Email Address.');
    }
    return new EmailSubscription(emailAddress);
  }
}
