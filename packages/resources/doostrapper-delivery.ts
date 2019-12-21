import { ReadWriteType, Trail } from '@aws-cdk/aws-cloudtrail';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { Rule } from '@aws-cdk/aws-events';
import { SnsTopic } from '@aws-cdk/aws-events-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants';
import { MultiEnvPipeline } from './constructs/multi-env-pipeline';
import { NOTIFICATIONS_DETAILS_TYPE, NOTIFICATIONS_TYPE } from './enums';
import { DoostrapperDeliveryProps, IDoostrapperDelivery } from './interfaces';
export class DoostrapperDelivery extends Stack implements IDoostrapperDelivery {
  readonly artifactsBucket: Bucket;
  readonly deployPipeline: Pipeline;
  readonly notificationsTopic: Topic;
  readonly notificationsRule: Rule;
  constructor(scope: App, id: string, private props: DoostrapperDeliveryProps) {
    super(scope, id, props);

    const {
      artifactsBucketConfig,
      pipelineConfig: { artifactsSourceKey, environments },
    } = props;

    this.artifactsBucket = new Bucket(this, 'ArtifactsBucket', {
      bucketName: artifactsBucketConfig?.bucketName,
      versioned: true,
    });
    this.notificationsTopic = this._createPipelineNotificationsTopic();

    const multiEnvConstruct = new MultiEnvPipeline(this, 'MultiEnvPipeline', {
      artifactsBucket: this.artifactsBucket,
      notificationTopic: this.notificationsTopic,
      artifactsSourceKey: artifactsSourceKey,
      environments,
    });

    this.deployPipeline = multiEnvConstruct.pipeline;
    this.notificationsRule = this._createNotificationsRule(
      this.notificationsTopic,
      this.deployPipeline.pipelineArn
    );
    this._createArtifactsEventsTrail();
    this.notificationsTopic.addSubscription(this._createSnsSubscription());
  }

  private _createPipelineNotificationsTopic() {
    const {
      notificationsConfig: { topicName },
    } = this.props;
    return new Topic(this, 'PipelineNotificationsTopic', {
      topicName,
    });
  }

  private _createArtifactsEventsTrail() {
    const {
      pipelineConfig: { artifactsSourceKey },
    } = this.props;

    const trail = new Trail(this, 'S3SourceTrail', {
      sendToCloudWatchLogs: true,
    });
    trail.addS3EventSelector(
      [this.artifactsBucket.arnForObjects(artifactsSourceKey)],
      { readWriteType: ReadWriteType.WRITE_ONLY }
    );
    return trail;
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
      description: 'Doostrapper Pipeline notifications Cloudwatch Rule',
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
