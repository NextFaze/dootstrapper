import { StackProps } from '@aws-cdk/core';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './constants/enums';
import { PriceClass } from '@aws-cdk/aws-cloudfront';

/**
 * @param pipelineConfig Deploy pipeline related config
 * @param notificationConfig Deployment notifications related config
 */
export interface IBackendDeploymentProps extends StackProps {
  pipelineConfig: IBackendPipelineProps;
  notificationConfig: INotificationConfigProps;
}

/**
 * @param artifactsSourceKey s3 path where artifacts will be uploaded to, including suffix
 * @param environments environment related config
 */
export interface IBackendPipelineProps {
  artifactsSourceKey: string;
  environments: IBackendEnvironment[];
  /**
   * @default - Pipeline Execution events
   */
  notificationsType?: NOTIFICATIONS_TYPE;
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
 * @param notificationsTargetConfig  Notifications Target Configurations
 */
export interface INotificationConfigProps {
  notificationsTargetConfig: INotificationsEmailTargetConfig;
}

/**
 * @param targetType Type of target
 * @param emailAddress Email to send notifications to
 */
interface INotificationsEmailTargetConfig {
  targetType: NOTIFICATIONS_TARGET.EMAIL;
  emailAddress: string;
}

export interface IFrontendDeploymentProps extends StackProps {
  baseDomainName: string;
  pipelineConfig: IFrontendPipelineProps;
  notificationConfig: INotificationConfigProps;
}

export interface IFrontendPipelineProps {
  artifactsSourceKey: string;
  environments: IFrontendEnvironment[];
  /**
   * @default - Pipeline Execution events
   */
  notificationsType?: NOTIFICATIONS_TYPE;
}

interface IFrontendEnvironment {
  name: string;
  aliases: string[];
  cloudfrontPriceClass?: PriceClass;
  approvalRequired?: boolean;
  defaultRootObject?: string;
  errorRootObject?: string;
}
