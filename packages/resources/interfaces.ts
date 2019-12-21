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

export interface DoostrapperDeliveryProps extends StackProps {
  artifactsBucketConfig?: ArtifactsBucketProps;
  pipelineConfig: PipelineProps;
  notificationsConfig: NotificationsConfig;
}

/**
 * @param bucketName artifacts bucket name
 * It is recommended not to have user defined bucket name
 * Bucket name needs to be unique across all accounts.
 * @param versioned this bucket should have versioning turned on or not.
 */
interface ArtifactsBucketProps {
  /**
   * @default - Cloudformation generated bucket name
   */
  bucketName?: string;
}

interface Environment {
  name: string;
  /**
   * @default create user with admin permission and use it's credentials in codebuild container
   */
  adminPermissions: boolean;
  approvalRequired: boolean;
  runtimeVariables: { [key: string]: string };
  region: string;
  buildSpec: any;
}

/**
 * @param pipelineName name of deploy pipeline
 * @param artifactsSourceKey s3 path where artifacts will be uploaded to, including suffix
 */
interface PipelineProps {
  /**
   * @default - AWS CloudFormation generates an ID and uses that for the pipeline name
   */
  artifactsSourceKey: string;
  environments: Array<Environment>;
}

/**
 * @param topicName Name of SNS Topic resource
 * @param notificationsType Type of notifications to receive
 * @param notificationsTargetConfig  Notifications Target Configurations
 * @param cloudwatchRuleName Cloudwatch events rule name
 */
interface NotificationsConfig {
  /**
   * @default - Cloudformation generates unique resource Id and uses that as a name
   */
  topicName?: string;
  /**
   * @default - Pipeline Execution events
   */
  notificationsType: NOTIFICATIONS_TYPE;
  notificationsTargetConfig: NotificationsEmailTargetConfig;
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
interface NotificationsEmailTargetConfig {
  targetType: NOTIFICATIONS_TARGET.EMAIL;
  emailAddress: string;
  emailSubject: string;
}
