import { Stack, App } from '@aws-cdk/core';
import { IFrontendDeploymentProps } from './interfaces';
import { HostedZone } from '@aws-cdk/aws-route53';
import {
  DnsValidatedCertificate,
  Certificate,
  ICertificate,
} from '@aws-cdk/aws-certificatemanager';
import { FrontendCDNPipeline } from './constructs/frontend-cdn-pipeline';
import { EMAIL_VALIDATOR } from './constants';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';

/**
 * @category frontend
 * @noInheritDoc
 */
export class FrontendDeployment extends Stack {
  constructor(scope: App, id: string, props: IFrontendDeploymentProps) {
    super(scope, id, props);
    const {
      pipelineConfig,
      hostedZoneName,
      certificateArn,
      baseDomainName,
      notificationConfig: {
        notificationsTargetConfig: { emailAddress },
      },
    } = props;

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: hostedZoneName || baseDomainName,
      privateZone: false,
    });

    if (!HostedZone.isConstruct(hostedZone)) {
      throw new Error('No Hosted Zone found for given domain name!');
    }

    let certificate: ICertificate;
    if (certificateArn) {
      certificate = Certificate.fromCertificateArn(
        this,
        'Certificate',
        certificateArn
      );
    } else {
      certificate = new DnsValidatedCertificate(this, 'Certificate', {
        domainName: baseDomainName,
        hostedZone,
        // When using ACM certificate with cloudfront, it must be requested in US East (N. Virginia) region
        // Ref: https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html
        region: 'us-east-1',
        subjectAlternativeNames: [`*.${baseDomainName}`],
      });
    }

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
