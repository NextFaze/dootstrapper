import { ReadWriteType, Trail } from '@aws-cdk/aws-cloudtrail';
import {
  ComputeType,
  LinuxBuildImage,
  PipelineProject,
} from '@aws-cdk/aws-codebuild';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import {
  CodeBuildAction,
  S3SourceAction,
  S3Trigger,
} from '@aws-cdk/aws-codepipeline-actions';
import { Rule } from '@aws-cdk/aws-events';
import { SnsTopic } from '@aws-cdk/aws-events-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants';
import { NOTIFICATIONS_DETAILS_TYPE, NOTIFICATIONS_TYPE } from './enums';
import { DoostrapperProps, IDoostrapper } from './interfaces';
export class Doostrapper extends Stack implements IDoostrapper {
  readonly artifactsBucket: Bucket;
  readonly deployPipeline: Pipeline;
  readonly notificationsTopic: Topic;
  readonly notificationsRule: Rule;
  constructor(scope: App, id: string, private props: DoostrapperProps) {
    super(scope, id, props);

    const { artifactsBucketConfig } = props;
    this.artifactsBucket = new Bucket(this, 'ArtifactsBucket', {
      bucketName: artifactsBucketConfig?.bucketName,
      versioned: true,
    });
    this.deployPipeline = this._createPipeline();
    this.notificationsTopic = this._createPipelineNotificationsTopic();
    this.notificationsRule = this._createNotificationsRule(
      this.notificationsTopic,
      this.deployPipeline.pipelineArn
    );
    this._createSnsSubscription();
  }

  /**
   * Creates deploy Pipeline resource
   */
  private _createPipeline() {
    const {
      pipelineConfig: { pipelineName },
    } = this.props;
    const pipeline = new Pipeline(this, 'Pipeline', {
      artifactBucket: this.artifactsBucket,
      pipelineName,
    });
    const s3Source = new Artifact('S3Source');
    const codebuildSource = new Artifact('CodebuildSource');

    // Checkout stage
    pipeline.addStage({
      stageName: 'Checkout',
      actions: [this._createS3CheckoutAction(s3Source)],
    });
    // Deploy stage
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [this._createCDKDeployAction(s3Source, codebuildSource)],
    });
    return pipeline;
  }

  /**
   * Creates s3 checkout action
   * @param sourceOutput Checkout output artifact
   */
  private _createS3CheckoutAction(sourceOutput: Artifact) {
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
    return new S3SourceAction({
      actionName: 'S3Source',
      bucket: this.artifactsBucket,
      bucketKey: artifactsSourceKey,
      output: sourceOutput,
      trigger: S3Trigger.EVENTS,
    });
  }

  /**
   * Creates CDK deploy codebuild action
   * @param deployProject Codebuild deploy project
   * @param inputSource Codebuild input artifact
   * @param outputSource Codebuild output artifact
   */
  private _createCDKDeployAction(
    inputSource: Artifact,
    outputSource: Artifact
  ) {
    const { codeDeployConfig } = this.props;
    const deployProject = new PipelineProject(this, 'DeployProject', {
      projectName: codeDeployConfig?.projectName,
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        computeType: ComputeType.SMALL,
      },
      description: 'Doostrapper Codepipeline Deploy Project',
    });
    return new CodeBuildAction({
      actionName: 'CDKDeploy',
      input: inputSource,
      outputs: [outputSource],
      project: deployProject,
    });
  }

  private _createPipelineNotificationsTopic() {
    const {
      notificationsConfig: { topicName },
    } = this.props;
    return new Topic(this, 'PipelineNotificationsTopic', {
      topicName,
    });
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
