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

interface IFrontendCDNPipelineProps
  extends IBasePipelineProps<IFrontendEnvironment> {
  certificate: ICertificate;
  hostedZone: IHostedZone;
}

export class FrontendCDNPipeline extends BasePipeline {
  constructor(scope: Construct, id: string, props: IFrontendCDNPipelineProps) {
    super(scope, id, {
      artifactSourceKey: props.artifactsSourceKey,
      notificationsType: props.notificationsType,
    });
    const { environments, certificate, hostedZone } = props;
    // this will extract only required files for current deployment
    const prepareDeployProject = new PipelineProject(this, 'PipelineProject', {
      projectName: 'Prepare',
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        phases: {
          build: {
            commands: 'echo Preparing artifacts for deployment to: $deployPath',
          },
        },
        artifacts: {
          files: ['**/*'],
          'base-directory': '$deployPath',
        },
      }),
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
            deployPath: {
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
}
