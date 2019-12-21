import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { Rule } from '@aws-cdk/aws-events';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { StackProps } from '@aws-cdk/core';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './enums';

export interface IDoostrapperDelivery {
  readonly artifactsBucket: Bucket;
  readonly deployPipeline: Pipeline;
  readonly notificationsTopic: Topic;
  readonly notificationsRule: Rule;
}

/**
 * @param artifactsBucketConfig Artifacts bucket related config
 * @param pipelineConfig Deploy pipeline related config
 * @param notificationsConfig Deployment notifications related config
 */
export interface IDoostrapperDeliveryProps extends StackProps {
  /**
   * @default - Doostrapper specific config is applied
   */
  artifactsBucketConfig?: IArtifactsBucketProps;
  pipelineConfig: IPipelineProps;
  notificationsConfig: INotificationsConfig;
}

/**
 * @param bucketName Artifacts bucket name
 * It is recommended not to have user defined bucket name
 * Bucket name needs to be unique across all accounts.
 * @param versioned this bucket should have versioning turned on or not.
 */
interface IArtifactsBucketProps {
  /**
   * @default - Cloudformation generated bucket name
   */
  bucketName?: string;
}

/**
 * @param artifactsSourceKey s3 path where artifacts will be uploaded to, including suffix
 * @param environments environment related config
 */
interface IPipelineProps {
  /**
   * @default - AWS CloudFormation generates an ID and uses that for the pipeline name
   */
  artifactsSourceKey: string;
  environments: IEnvironment[];
}

/**
 * @param name Environment name
 * @param adminPermissions Should admin permission be created with accessKey and Secret injected into container
 * @param approvalRequired Manual approval to add before deploy action
 * @param runtimeVariables Runtime variables to inject into container
 * @param buildSpec BuildSpec file to execute on codebuild
 */
interface IEnvironment {
  name: string;
  /**
   * @default - No admin access is created, developer must provide accessKeyId and secretAccessKey in SSM
   */
  adminPermissions?: boolean;
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
