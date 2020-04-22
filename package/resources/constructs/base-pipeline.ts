import { Trail, ReadWriteType } from '@aws-cdk/aws-cloudtrail';
import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline';
import { Construct, Stack } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import {
  S3SourceAction,
  S3Trigger,
  CodeBuildAction,
  ManualApprovalAction,
} from '@aws-cdk/aws-codepipeline-actions';
import {
  PipelineProject,
  BuildSpec,
  LinuxBuildImage,
  ComputeType,
  BuildEnvironmentVariable,
} from '@aws-cdk/aws-codebuild';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { createBuildSpecWithCredentials } from '../helpers/create-buildspec-with-credentials';
import { paramCase } from 'change-case';

interface IBasePipelineProps {
  artifactSourceKey: string;
}

export abstract class BasePipeline extends Construct {
  public readonly pipeline: Pipeline;
  public readonly notificationTopic: Topic;
  public readonly checkoutSource: Artifact;
  constructor(scope: Construct, id: string, props: IBasePipelineProps) {
    super(scope, id);
    const { artifactSourceKey } = props;
    const artifactsBucket = new Bucket(this, 'ArtifactBucket', {
      versioned: true,
    });
    const trail = new Trail(this, 'S3ArtifactTrail', {
      sendToCloudWatchLogs: true,
    });
    trail.addS3EventSelector(
      [artifactsBucket.arnForObjects(artifactSourceKey)],
      { readWriteType: ReadWriteType.WRITE_ONLY }
    );
    this.notificationTopic = new Topic(this, 'NotificationTopic');

    this.pipeline = this.pipeline = new Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket,
    });

    this.checkoutSource = this._createCheckoutStage({
      bucketKey: artifactSourceKey,
      bucket: artifactsBucket,
    }).output;
  }

  private _createCheckoutStage({
    bucket,
    bucketKey,
  }: {
    bucket: Bucket;
    bucketKey: string;
  }) {
    const checkoutSource = new Artifact('S3Source');
    const stage = this.pipeline.addStage({
      actions: [
        new S3SourceAction({
          actionName: 'S3Source',
          bucket,
          bucketKey,
          output: checkoutSource,
          trigger: S3Trigger.EVENTS,
        }),
      ],
      stageName: 'Checkout',
    });

    return {
      output: checkoutSource,
      stage,
    };
  }

  /**
   * Creates CDK deploy codebuild action
   * @param deployProject Codebuild deploy project
   * @param inputSource Codebuild input artifact
   * @param outputSource Codebuild output artifact
   */
  createCodebuildAction({
    id,
    stage,
    runOrder,
    privilegedMode,
    runtimeVariables,
    buildSpec,
    inputSource,
    outputSource,
    accessKeyId,
    secretAccessKey,
  }: {
    id: string;
    stage: string;
    runOrder: number;
    privilegedMode?: boolean;
    runtimeVariables: {
      [name: string]: BuildEnvironmentVariable;
    };
    buildSpec: any;
    inputSource: Artifact;
    outputSource: Artifact;
    accessKeyId: StringParameter;
    secretAccessKey: StringParameter;
  }) {
    const buildSpecRow = createBuildSpecWithCredentials({
      buildSpec,
      accessKeyIdParamName: accessKeyId.parameterName,
      secretAccessKeyParamName: secretAccessKey.parameterName,
    });

    const deployProject = new PipelineProject(this, id, {
      projectName: paramCase(id),
      buildSpec: BuildSpec.fromObject(buildSpecRow),
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        environmentVariables: runtimeVariables,
        computeType: ComputeType.SMALL,
        privileged: privilegedMode,
      },
      description: `Dootstrapper Codepipeline Deploy Project for stage ${stage}`,
    });
    accessKeyId.grantRead(deployProject);
    secretAccessKey.grantRead(deployProject);

    return new CodeBuildAction({
      actionName: 'Deploy',
      input: inputSource,
      runOrder,
      outputs: [outputSource],
      project: deployProject,
    });
  }

  /**
   *
   * @param actionName Manual approval action
   * @param notificationTopic Notification topic to send pipeline approval notifications
   */
  createManualApprovalAction({ actionName }: { actionName: string }) {
    return new ManualApprovalAction({
      actionName,
      runOrder: 1,
      notificationTopic: this.notificationTopic,
    });
  }
}
