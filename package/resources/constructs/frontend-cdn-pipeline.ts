import { pascalCase } from 'change-case';
import { IFrontendEnvironment, IBasePipelineProps } from '../interfaces';
import { Construct } from '@aws-cdk/core';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { BasePipeline } from './base-pipeline';
import {
  S3DeployAction,
  CodeBuildAction,
} from '@aws-cdk/aws-codepipeline-actions';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { WebDistribution } from './web-distribution';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import {
  PipelineProject,
  BuildSpec,
  LinuxBuildImage,
  ComputeType,
  BuildEnvironmentVariableType,
} from '@aws-cdk/aws-codebuild';
import { IRuntimeEnvironmentProps } from '../frontend-deployment';

interface IFrontendCDNPipelineProps
  extends IBasePipelineProps<IFrontendEnvironment> {
  certificate: ICertificate;
  hostedZone: IHostedZone;
  runtimeEnvironmentConfig?: IRuntimeEnvironmentProps;
}

/**
 * @hidden
 */
export class FrontendCDNPipeline extends BasePipeline {
  constructor(scope: Construct, id: string, props: IFrontendCDNPipelineProps) {
    super(scope, id, {
      artifactSourceKey: props.artifactsSourceKey,
      notificationsType: props.notificationsType,
    });
    const {
      environments,
      certificate,
      hostedZone,
      runtimeEnvironmentConfig,
    } = props;

    // this will extract only required files for current deployment
    const prepareDeployProject = new PipelineProject(this, 'PipelineProject', {
      projectName: 'Prepare',
      buildSpec: runtimeEnvironmentConfig
        ? this.getBuildSpecForRuntimeConfig(runtimeEnvironmentConfig)
        : this.getBuildSpecForCompiledConfig(),
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
        computeType: ComputeType.SMALL,
      },
      description: 'Dootstrapper Pipeline Deploy Prepare Project',
    });

    // create distribution for each environment
    environments.forEach(environment => {
      const {
        name,
        approvalRequired,
        aliases,
        cloudfrontPriceClass,
        defaultRootObject,
        domainNameRegistrar,
        errorRootObject,
      } = environment;
      const distribution = new WebDistribution(
        this,
        pascalCase(`${name}WebDistribution`),
        {
          aliases,
          cloudfrontPriceClass,
          defaultRootObject,
          domainNameRegistrar,
          errorRootObject,
          certificate,
          hostedZone,
        }
      );
      // create deploy actions
      const actions = [];
      let runOrder = 0;
      if (approvalRequired) {
        actions.push(
          this.createManualApprovalAction({
            actionName: 'Approve',
            runOrder: ++runOrder,
          })
        );
      }
      // prepare artifact for deployments
      const preparedDeployment = new Artifact(
        pascalCase(`${name}PrepareSource`)
      );
      actions.push(
        new CodeBuildAction({
          actionName: 'Prepare',
          input: this.checkoutSource,
          runOrder: ++runOrder,
          environmentVariables: {
            environment: {
              value: name,
              type: BuildEnvironmentVariableType.PLAINTEXT,
            },
          },
          outputs: [preparedDeployment],
          project: prepareDeployProject,
        })
      );

      actions.push(
        new S3DeployAction({
          bucket: distribution.s3BucketSource,
          input: preparedDeployment,
          actionName: 'Deploy',
          extract: true,
          runOrder: ++runOrder,
        })
      );

      this.pipeline.addStage({
        actions,
        stageName: pascalCase(`${name}Deploy`),
      });
    });
  }

  private getBuildSpecForCompiledConfig() {
    return BuildSpec.fromObject({
      version: 0.2,
      phases: {
        build: {
          commands: 'echo Preparing artifacts for deployment to: $environment',
        },
      },
      artifacts: {
        files: ['**/*'],
        'base-directory': '$environment',
      },
    });
  }

  /**
   * This will replace environment specific file with default environment file
   * i.e when running in environment with name `dev`, config file named
   * configs/config.dev.json will replace configs/config.json
   */
  private getBuildSpecForRuntimeConfig(config: IRuntimeEnvironmentProps) {
    const {
      fileName,
      directory,
      separator = '.',
      fileExtension = 'json',
    } = config;

    const environmentConfigFile = `${directory}/${fileName +
      separator}$environment.${fileExtension}`;
    const mainConfigFile = `${directory}/${fileName}.${fileExtension}`;

    return BuildSpec.fromObject({
      version: 0.2,
      phases: {
        pre_build: {
          commands: 'echo Preparing artifacts with runtime config',
        },
        build: {
          commands: [`cp -f ${environmentConfigFile} ${mainConfigFile}`],
        },
      },
      artifacts: {
        files: ['**/*'],
      },
    });
  }
}
