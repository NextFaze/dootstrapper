import { pascalCase } from 'change-case';
import { IFrontendPipelineConfig } from '../interfaces';
import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  CloudFrontWebDistribution,
  ViewerCertificate,
  SecurityPolicyProtocol,
  SSLMethod,
} from '@aws-cdk/aws-cloudfront';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';

interface IFrontendCDNPipelineProps extends IFrontendPipelineConfig {
  certificate: DnsValidatedCertificate;
}

export class FrontendCDNPipeline extends Construct {
  constructor(scope: Construct, id: string, props: IFrontendCDNPipelineProps) {
    super(scope, id);
    const { environments, certificate } = props;

    // create distribution for each environment
    environments.forEach(env => {
      const { cdnConfig } = env;
      const s3BucketSource = new Bucket(
        this,
        pascalCase(cdnConfig.domainName + 'OriginBucket')
      );
      const distribution = new CloudFrontWebDistribution(
        this,
        pascalCase(`${cdnConfig.domainName}WebDistribution`),
        {
          originConfigs: [
            {
              s3OriginSource: { s3BucketSource },
              behaviors: [{ isDefaultBehavior: true }],
            },
          ],
          viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
            securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2018,
            sslMethod: SSLMethod.SNI,
            aliases: cdnConfig.aliases,
          }),
        }
      );
    });
  }
}
