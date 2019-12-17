import {
  BuildEnvironmentVariable,
  BuildEnvironmentVariableType,
  BuildSpec,
  ComputeType,
  LinuxBuildImage,
  PipelineProject,
} from '@aws-cdk/aws-codebuild';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import {
  CodeBuildAction,
  ManualApprovalAction,
  S3SourceAction,
  S3Trigger,
} from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { Construct } from '@aws-cdk/core';
import { paramCase, pascalCase } from 'change-case';

interface Environment {
  name: string;
  approvalRequired: boolean;
  runtimeVariables: { [key: string]: string };
  buildSpec: any;
}
interface MultiEnvPipelineProps {
  artifactsBucket: Bucket;
  artifactsSourceKey: string;
  notificationTopic: Topic;
  environments: Array<Environment>;
}

export class MultiEnvPipeline extends Construct {
  readonly pipeline: Pipeline;
  constructor(
    scope: Construct,
    id: string,
    private props: MultiEnvPipelineProps
  ) {
    super(scope, id);
    this.pipeline = this._createPipeline();
  }

  /**
   * Creates deploy Pipeline resource
   */
  private _createPipeline() {
    const { artifactsBucket, environments, notificationTopic } = this.props;
    const pipeline = new Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket,
    });
    const s3Source = new Artifact('S3Source');

    // Checkout stage
    pipeline.addStage({
      stageName: 'Checkout',
      actions: [this._createS3CheckoutAction(s3Source)],
    });

    environments.forEach(environment => {
      const output = new Artifact(pascalCase(`${environment.name}Source`));
      const stageName = pascalCase(`${environment.name}Deploy`);

      if (environment.approvalRequired) {
        this._createManualApprovalAction(
          paramCase(`${environment.name}Approve`),
          notificationTopic
        );
      }

      const { runtimeVariables, buildSpec } = environment;
      // Limiting support of runtime variables to string
      const runTimeEnvironments = Object.keys(runtimeVariables).reduce(
        (acc, key) => {
          if (runtimeVariables.hasOwnProperty(key)) {
            acc[key] = {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: runtimeVariables[key],
            };
          }
          return acc;
        },
        <any>{}
      );

      // add multiple stages per environment
      const stage = pipeline.addStage({
        stageName,
        actions: [
          this._createCodebuildAction(
            pascalCase(`${environment.name}PipelineProject`),
            stageName,
            environment.approvalRequired ? 2 : 1, // change run order based on approval
            runTimeEnvironments,
            buildSpec,
            s3Source,
            output
          ),
        ],
      });
    });
    return pipeline;
  }

  /**
   * Creates s3 checkout action
   * @param sourceOutput Checkout output artifact
   */
  private _createS3CheckoutAction(sourceOutput: Artifact) {
    const { artifactsSourceKey, artifactsBucket } = this.props;

    return new S3SourceAction({
      actionName: 'S3Source',
      bucket: artifactsBucket,
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
  private _createCodebuildAction(
    id: string,
    stage: string,
    runOrder: number,
    runtimeVariables: { [name: string]: BuildEnvironmentVariable },
    buildSpec: any,
    inputSource: Artifact,
    outputSource: Artifact
  ) {
    const deployProject = new PipelineProject(this, id, {
      projectName: paramCase(id),
      buildSpec: BuildSpec.fromObject(buildSpec),
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        environmentVariables: runtimeVariables,
        computeType: ComputeType.SMALL,
      },
      description: `Doostrapper Codepipeline Deploy Project for stage ${stage}`,
    });
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
  private _createManualApprovalAction(
    actionName: string,
    notificationTopic: Topic
  ) {
    return new ManualApprovalAction({
      actionName,
      runOrder: 1,
      notificationTopic,
    });
  }
}
