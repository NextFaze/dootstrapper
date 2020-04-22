import { StackProps } from '@aws-cdk/core';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './constants/enums';
import { PriceClass } from '@aws-cdk/aws-cloudfront';

/**
 * @param artifactsBucketConfig Artifacts bucket related config
 * @param pipelineConfig Deploy pipeline related config
 * @param notificationsConfig Deployment notifications related config
 */
export interface IBackendDeploymentProps extends StackProps {
  /**
   * @default - Dootstrapper specific config is applied
   */
  artifactsBucketConfig?: IBackendArtifactsBucketProps;
  pipelineConfig: IBackendPipelineProps;
  notificationsConfig: INotificationsConfig;
}

/**
 * @param bucketName Artifacts bucket name
 * It is recommended not to have user defined bucket name
 * Bucket name needs to be unique across all accounts.
 * @param versioned this bucket should have versioning turned on or not.
 */
interface IBackendArtifactsBucketProps {
  /**
   * @default - Cloudformation generated bucket name
   */
  bucketName?: string;
}

/**
 * @param artifactsSourceKey s3 path where artifacts will be uploaded to, including suffix
 * @param environments environment related config
 */
interface IBackendPipelineProps {
  /**
   * @default - AWS CloudFormation generates an ID and uses that for the pipeline name
   */
  artifactsSourceKey: string;
  environments: IBackendEnvironment[];
}

/**
 * @param name Environment name
 * @param adminPermissions Should admin permission be created with accessKey and Secret injected into container
 * @param privilegedMode Enable this flag if you want to build Docker images or
 * want your builds to get elevated privileges
 * @param approvalRequired Manual approval to add before deploy action
 * @param runtimeVariables Runtime variables to inject into container
 * @param buildSpec BuildSpec file to execute on codebuild
 */
export interface IBackendEnvironment {
  name: string;
  /**
   * @default - No admin access is created, developer must provide accessKeyId and secretAccessKey in SSM
   */
  adminPermissions?: boolean;
  /**
   * @default false
   */
  privilegedMode?: boolean;
  /**
   * @default - No approval action is added
   */
  approvalRequired?: boolean;
  /**
   * @default - No environment variables are passed to pipeline
   */
  runtimeVariables?: { [key: string]: string };
  buildSpec: any;
}

/**
 * @param topicName Name of SNS Topic resource
 * @param notificationsType Type of notifications to receive
 * @param notificationsTargetConfig  Notifications Target Configurations
 * @param cloudwatchRuleName Cloudwatch events rule name
 */
interface INotificationsConfig {
  /**
   * @default - Cloudformation generates unique resource Id and uses that as a name
   */
  topicName?: string;
  /**
   * @default - Pipeline Execution events
   */
  notificationsType: NOTIFICATIONS_TYPE;
  notificationsTargetConfig: INotificationsEmailTargetConfig;
  /**
   * @default - Cloudformation generates unique resource Id and uses that as a name
   */
  cloudwatchRuleName?: string;
}

/**
 * @param targetType Type of target
 * @param emailAddress Email to send notifications to
 * @param emailSubject Email subject to be used when sending emails
 */
interface INotificationsEmailTargetConfig {
  targetType: NOTIFICATIONS_TARGET.EMAIL;
  emailAddress: string;
  emailSubject: string;
}

export interface IFrontendDeploymentProps {
  baseDomainName: string;
  pipelineConfig: IFrontendPipelineConfig;
  notificationConfig: INotificationsConfig;
}

export interface IFrontendPipelineConfig {
  artifactsSourceKey: string;
  environments: IFrontendEnvironment[];
}

interface IFrontendEnvironment {
  name: string;
  aliases: string[];
  cloudfrontPriceClass?: PriceClass;
  approvalRequired?: boolean;
  defaultRootObject?: string;
  errorRootObject?: string;
}
