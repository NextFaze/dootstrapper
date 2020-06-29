import { pascalCase } from 'change-case';
import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  OriginAccessIdentity,
  CloudFrontWebDistribution,
  PriceClass,
  ViewerProtocolPolicy,
  ViewerCertificate,
  SecurityPolicyProtocol,
  SSLMethod,
  CloudFrontAllowedMethods,
} from '@aws-cdk/aws-cloudfront';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { DOMAIN_NAME_REGISTRAR } from '../enums';
import { CnameRecord, IHostedZone } from '@aws-cdk/aws-route53';

interface IAssetsDistribution {
  aliases: string[];
  certificate: ICertificate;
  hostedZone: IHostedZone;
  cloudfrontPriceClass?: PriceClass;
  domainNameRegistrar?: DOMAIN_NAME_REGISTRAR;
}

/**
 * @hidden
 */
export class AssetsDistribution extends Construct {
  readonly assetStorage: Bucket;
  constructor(
    scope: Construct,
    id: string,
    {
      aliases,
      cloudfrontPriceClass,
      certificate,
      domainNameRegistrar,
      hostedZone,
    }: IAssetsDistribution
  ) {
    super(scope, id);

    this.assetStorage = new Bucket(this, 'Bucket', {
      versioned: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
      {
        comment: `Origin Access Identity for ${aliases[0]}`,
      }
    );

    const distribution = new CloudFrontWebDistribution(
      this,
      'CloudFrontResource',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.assetStorage,
              originAccessIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              },
            ],
          },
        ],
        comment: `Cloudfront Distribution for ${aliases[0]}`,
        priceClass: cloudfrontPriceClass,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
          securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2018,
          sslMethod: SSLMethod.SNI,
          aliases: aliases,
        }),
      }
    );

    // register record in route53
    if (domainNameRegistrar === DOMAIN_NAME_REGISTRAR.AWS) {
      aliases.forEach((alias) => {
        new CnameRecord(this, pascalCase(`${alias}CnameRecord`), {
          zone: hostedZone,
          recordName: alias,
          domainName: distribution.domainName,
        });
      });
    }
  }
}
