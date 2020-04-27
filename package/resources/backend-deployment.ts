import { IBaseDeploymentProps, IBackendEnvironment } from './interfaces';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants';
import { CdkAppPipeline } from './constructs/cdk-app-pipeline';

/**
 * @inheritdoc {@link IBaseDeploymentProps}
 */
export interface IBackendDeploymentProps
  extends IBaseDeploymentProps<IBackendEnvironment> {}

/**
 * Create an automated continuos delivery/deployment pipeline to deploy serverless apps. <br />
 * It uses declarative buildspec syntax to configure deployment steps, powering you with highly
 * customization multi environment pipeline. <br />
 * Additionally, it also configures notification channels to report deployment notifications to your developers.
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
