import { pascalCase } from 'change-case';
import { IFrontendEnvironment, IBasePipelineProps } from '../interfaces';
import { Construct } from '@aws-cdk/core';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { BasePipeline } from './base-pipeline';
import { S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { WebDistribution } from './web-distribution';

interface IFrontendCDNPipelineProps
  extends IBasePipelineProps<IFrontendEnvironment> {
  certificate: DnsValidatedCertificate;
  hostedZone: IHostedZone;
}

export class FrontendCDNPipeline extends BasePipeline {
  constructor(scope: Construct, id: string, props: IFrontendCDNPipelineProps) {
    super(scope, id, {
      artifactSourceKey: props.artifactsSourceKey,
      notificationsType: props.notificationsType,
    });
    const { environments, certificate, hostedZone } = props;

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

      actions.push(
        new S3DeployAction({
          bucket: distribution.s3BucketSource,
          input: this.checkoutSource,
          actionName: 'Deploy',
          extract: true,
          objectKey: name,
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
