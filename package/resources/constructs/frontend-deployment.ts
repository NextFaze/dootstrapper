import { App, Construct } from '@aws-cdk/core';
import { IFrontendEnvironment } from '../interfaces';
import { HostedZone, IHostedZone } from '@aws-cdk/aws-route53';
import {
  DnsValidatedCertificate,
  Certificate,
  ICertificate,
} from '@aws-cdk/aws-certificatemanager';
import { FrontendCDNPipeline } from '../internal-constructs/frontend-cdn-pipeline';
import {
  IBaseDeploymentProps,
  BaseDeployment,
} from '../internal-constructs/base-deployment';
import { Bucket } from '@aws-cdk/aws-s3';

/**
 * @param - __baseDomainName__: Base Domain name to serve application on. <br />
 * i.e For application `app.example.com` this value will be `example.com`.
 * @param - __hostedZoneId__: Hosted zone id to register dns records
 * @param - __hostedZoneName__: Hosted Zone name to lookup for when `baseDomainName` is different
 *  than the hostedZoneName
 * @param - __certificateArn__: Certificate to use when delivering content over cdn
 * @inheritdoc {@link IBaseDeploymentProps}
 * <br /><br />
 * __Notes__: If _certificateArn_ value is provided, Cloudfront will be configured to use that as a
 * viewer certificate.<br />
 * Requires an hosted zone to be created before deploying Frontend Deployment app
 */
export interface IFrontendDeploymentProps
  extends IBaseDeploymentProps<IFrontendEnvironment> {
  baseDomainName: string;
  /**
   * @default baseDomainName When hostedZoneName is not defined, baseDomainName is used instead
   */
  hostedZoneId: string;
  hostedZone?: IHostedZone;
  hostedZoneName?: string;
  /**
   * @default none A certificate is requested and validated using route53
   */
  certificateArn?: string;
  /**
   * @default none A deployment pipeline is created with compile time environment configuration
   */
  runtimeEnvironmentConfig?: IRuntimeEnvironmentProps;
}

/**
 * @param - __directory__: Directory where configs for all environment live
 * i.e this can be `assets/config`
 * @param - __fileName__: Original config file name without
 * i.e config.json (so the config location as per earlier directory be, assets/config/config.json )
 * @param - __separator__: Key used to differentiate configs among environments
 * i.e for file config.dev.json, this value will be "."
 * @param - __fileExtension__: Config file's extension
 */
export interface IRuntimeEnvironmentProps {
  directory: string;
  fileName: string;
  /**
   * @default . "dot" is used by default
   */
  separator?: string;
  /**
   * @default json config files are expected to have "json" extension
   */
  fileExtension?: string;
}

/** Create all required resources on AWS cloud to enable continuous delivery/deployment for modern web apps.<br />
 *  Additionally, it also configures notification channels to report deployment notifications to your developers.
 *
 */
export class FrontendDeployment extends BaseDeployment {
  readonly assetStorages: { [key: string]: Bucket };
  constructor(scope: Construct, id: string, props: IFrontendDeploymentProps) {
    super(scope, id);
    let {
      pipelineConfig,
      hostedZoneName,
      certificateArn,
      runtimeEnvironmentConfig,
      baseDomainName,
      hostedZoneId,
      hostedZone,
      notificationConfig: { notificationsTargetConfig },
    } = props;

    if (!hostedZone) {
      hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        zoneName: hostedZoneName || baseDomainName,
        hostedZoneId,
      });
    }

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
        runtimeEnvironmentConfig,
        certificate,
        hostedZone,
      }
    );

    this.assetStorages = pipelineConstruct.assetStorages;

    this.createNotificationSubscription(
      pipelineConstruct,
      notificationsTargetConfig
    );
  }
}
