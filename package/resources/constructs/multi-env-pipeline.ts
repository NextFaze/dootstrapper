import {
  BuildEnvironmentVariable,
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
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Construct } from '@aws-cdk/core';
import { paramCase, pascalCase } from 'change-case';
import { createBuildSpecWithCredentials } from '../helpers/create-buildspec-with-credentials';
import { resolveRuntimeEnvironments } from '../helpers/resolve-runtime-environments';
import { Core } from './core';
import { IEnvironment } from '../interfaces';

interface IMultiEnvPipelineProps {
  artifactsBucket: Bucket;
  artifactsSourceKey: string;
  notificationTopic: Topic;
  environments: IEnvironment[];
}

export class MultiEnvPipeline extends Construct {
  public readonly pipeline: Pipeline;
  constructor(
    scope: Construct,
    id: string,
    private props: IMultiEnvPipelineProps
  ) {
    super(scope, id);

    const { artifactsBucket, environments, notificationTopic } = this.props;
    this.pipeline = new Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket,
    });
    const s3Source = new Artifact('S3Source');

    // Checkout stage
    this.pipeline.addStage({
      actions: [this._createS3CheckoutAction(s3Source)],
      stageName: 'Checkout',
    });

    // Deploy stages
    environments.forEach(environment => {
      const { adminPermissions = false, privilegedMode } = environment;
      const { accessKeyId, secretAccessKey } = new Core(
        this,
        `${environment.name}DootstrapperCore`,
        {
          adminPermissions,
          environmentName: environment.name,
        }
      );

      const output = new Artifact(pascalCase(`${environment.name}Source`));
      const stageName = pascalCase(`${environment.name}Deploy`);
      const { runtimeVariables = {}, buildSpec } = environment;
      const runTimeEnvironments = resolveRuntimeEnvironments(runtimeVariables);
      const actions = [];

      if (environment.approvalRequired) {
        actions.push(
          this._createManualApprovalAction({
            actionName: paramCase(`${environment.name}Approve`),
            notificationTopic,
          })
        );
      }

      actions.push(
        this._createCodebuildAction({
          privilegedMode: privilegedMode,
          id: pascalCase(`${environment.name}PipelineProject`),
          stage: stageName,
          runOrder: environment.approvalRequired ? 2 : 1,
          runtimeVariables: runTimeEnvironments,
          // always create new object instance of build for new environment
          buildSpec: { ...buildSpec },
          inputSource: s3Source,
          outputSource: output,
          accessKeyId,
          secretAccessKey,
        })
      );
      // add multiple stages per environment
      this.pipeline.addStage({
        actions,
        stageName,
      });
    });
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
  private _createCodebuildAction({
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
  private _createManualApprovalAction({
    actionName,
    notificationTopic,
  }: {
    actionName: string;
    notificationTopic: Topic;
  }) {
    return new ManualApprovalAction({
      actionName,
      runOrder: 1,
      notificationTopic,
    });
  }
}
