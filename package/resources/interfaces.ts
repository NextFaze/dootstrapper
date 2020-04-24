import { StackProps } from '@aws-cdk/core';
import {
  NOTIFICATIONS_TARGET,
  NOTIFICATIONS_TYPE,
  DOMAIN_NAME_REGISTRAR,
} from './constants/enums';
import { PriceClass } from '@aws-cdk/aws-cloudfront';

/**
 * @description Create an automated CD pipeline to deploy apps using simple easy to use `buildspec` for
 * all specified environments
 */
export interface IBackendDeploymentProps
  extends IBaseDeploymentProps<IBackendEnvironment> {}

/**
 * @description Sets up a CDN (Content Delivery Network) with automated CD pipeline for all specified environments
 * @param baseDomainName Registered domain name to use
 * (i.e To host application on `app.example.com` this value needs to be `example.com` )
 * @requires hostedZone - Requires an hosted zone to be created before deploying Frontend Deployment app
 * @param hostedZoneName Hosted zone to add records to
 * @param certificateArn: - Amazon Resource Name of already available domain
 * When this value is truthy, application _DOES NOT_ request andy certificate for given domain
 */
export interface IFrontendDeploymentProps
  extends IBaseDeploymentProps<IFrontendEnvironment> {
  baseDomainName: string;
  /**
   * @default baseDomainName When hostedZoneName is not defined, baseDomainName is used instead
   */
  hostedZoneName?: string;
  /**
   * @default none a certificate is requested and validated using route53
   */
  certificateArn?: string;
}

/**
 * @param pipelineConfig Deploy pipeline config
 * @param notificationConfig Deployment notifications config
 */
interface IBaseDeploymentProps<T> extends StackProps {
  notificationConfig: INotificationConfigProps;
  pipelineConfig: IBasePipelineProps<T>;
}

/**
 * @param artifactsSourceKey Fully qualified s3 path to target artifact (i.e path/to/some/file.zip)
 * @param environments Environment config
 */
export interface IBasePipelineProps<T> {
  artifactsSourceKey: string;
  environments: T[];
  /**
   * @default - Pipeline Execution events
   */
  notificationsType?: NOTIFICATIONS_TYPE;
}

/**
 * @param notificationsTargetConfig  Notifications Target config
 */
export interface INotificationConfigProps {
  notificationsTargetConfig: INotificationsEmailTargetConfig;
}

/**
 * @param targetType Type of notification target
 * @param emailAddress Email to send notifications
 */
export interface INotificationsEmailTargetConfig {
  targetType: NOTIFICATIONS_TARGET.EMAIL;
  emailAddress: string;
}

/**
 * @param adminPermissions Should admin permission be created with accessKey and Secret injected into deploy container
 * @param privilegedMode Enable this flag if you want to build Docker images or
 * want your builds to get elevated privileges
 * @param runtimeVariables Runtime variables to inject into container
 * @param buildSpec BuildSpec file to execute on codebuild
 */
export interface IBackendEnvironment extends IBaseEnvironment {
  /**
   * @default - No admin access is created, developer must provide accessKeyId and secretAccessKey in SSM
   */
  adminPermissions?: boolean;
  /**
   * @default false
   */
  privilegedMode?: boolean;
  /**
   * @default - No environment variables are passed to pipeline
   */
  runtimeVariables?: { [key: string]: string };
  buildSpec: any;
}

/**
 * @param aliases List of aliases to register as an alternate names for cloudfront distribution
 * @param cloudfrontPriceClass Cloudfront pricing plan
 * @param defaultRootObject Default object to return when app is visited without any paths
 * @param errorRootObject Default object to return when unknown path is requested
 *
 */
export interface IFrontendEnvironment extends IBaseEnvironment {
  aliases: string[];
  /**
   * @default PRICE_CLASS_100 - Cheapest plan is selected
   */
  cloudfrontPriceClass?: PriceClass;
  /**
   * @default index.html
   */
  defaultRootObject?: string;
  /**
   * @default index.html
   */
  errorRootObject?: string;
  /**
   * @default none
   */
  domainNameRegistrar?: DOMAIN_NAME_REGISTRAR;
}

/**
 * @param name Environment name
 * @param approvalRequired Manual approval to add before deploy action
 */
interface IBaseEnvironment {
  name: string;
  /**
   * @default - No approval action is added
   */
  approvalRequired?: boolean;
}
