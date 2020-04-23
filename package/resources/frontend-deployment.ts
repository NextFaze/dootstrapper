import { Stack, App } from '@aws-cdk/core';
import { IFrontendDeploymentProps } from './interfaces';
import { HostedZone } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { FrontendCDNPipeline } from './constructs/frontend-cdn-pipeline';
import { EMAIL_VALIDATOR } from './constants/constants';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';

export class FrontendDeployment extends Stack {
  constructor(scope: App, id: string, props: IFrontendDeploymentProps) {
    super(scope, id);
    const {
      pipelineConfig,
      baseDomainName,
      notificationConfig: {
        notificationsTargetConfig: { emailAddress },
      },
    } = props;

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: baseDomainName,
      privateZone: false,
    });
    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: baseDomainName,
      hostedZone,
      subjectAlternativeNames: [`*.${baseDomainName}`],
    });
    const pipelineConstruct = new FrontendCDNPipeline(
      this,
      'FrontendCDNPipeline',
      {
        ...pipelineConfig,
        certificate,
        hostedZone,
      }
    );

    pipelineConstruct.notificationTopic.addSubscription(
      this._createSnsSubscription(emailAddress)
    );
  }

  private _createSnsSubscription(emailAddress: string) {
    if (!EMAIL_VALIDATOR.test(String(emailAddress).toLocaleLowerCase())) {
      throw new Error('Invalid Email Address.');
    }
    return new EmailSubscription(emailAddress);
  }
}
