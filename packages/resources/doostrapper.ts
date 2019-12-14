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
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack } from '@aws-cdk/core';
import { DoostrapperProps, IDoostrapper } from './interfaces';
export class Doostrapper extends Stack implements IDoostrapper {
  readonly artifactsBucket: Bucket;
  readonly deployPipeline: Pipeline;
  constructor(scope: App, id: string, private props: DoostrapperProps) {
    super(scope, id, props);

    const {
      artifactsBucketConfig: { bucketName },
    } = props;
    this.artifactsBucket = new Bucket(this, 'ArtifactsBucket', {
      bucketName,
      versioned: true,
    });

    const {
      codeDeployConfig: { projectName },
    } = this.props;
    const project = new PipelineProject(this, 'DeployProject', {
      projectName,
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        computeType: ComputeType.SMALL,
      },
      badge: true,
      description: 'Doostrapper Codepipeline Deploy Project',
    });
    this.deployPipeline = this._createPipeline(project);
  }

  /**
   * Creates deploy Pipeline resource
   */
  private _createPipeline(deployProject: PipelineProject) {
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
      actions: [
        this._createCDKDeployAction(deployProject, s3Source, codebuildSource),
      ],
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
    deployProject: PipelineProject,
    inputSource: Artifact,
    outputSource: Artifact
  ) {
    return new CodeBuildAction({
      actionName: 'CDKDeploy',
      input: inputSource,
      outputs: [outputSource],
      project: deployProject,
    });
  }
}
