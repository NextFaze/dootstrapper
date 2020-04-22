import { Stack, App } from '@aws-cdk/core';
import { IFrontendDeploymentProps } from './interfaces';
import { HostedZone } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { FrontendCDNPipeline } from './constructs/frontend-cdn-pipeline';

export class FrontendDeployment extends Stack {
  constructor(scope: App, id: string, private props: IFrontendDeploymentProps) {
    super(scope, id);
    const { pipelineConfig, baseDomainName } = props;

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
      }
    );
  }
}
