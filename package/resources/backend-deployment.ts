import { IBaseDeploymentProps, IBackendEnvironment } from './interfaces';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants';
import { CdkAppPipeline } from './constructs/cdk-app-pipeline';

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

/**
 * @noInheritDoc
 */
export class BackendDeployment extends Stack {
  constructor(scope: App, id: string, props: IBackendDeploymentProps) {
    super(scope, id, props);

    const {
      pipelineConfig,
      notificationConfig: {
        notificationsTargetConfig: { emailAddress },
      },
    } = props;

    const pipelineConstruct = new CdkAppPipeline(this, 'MultiEnvPipeline', {
      ...pipelineConfig,
    });

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
