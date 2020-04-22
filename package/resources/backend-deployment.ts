import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { App, Stack } from '@aws-cdk/core';
import { EMAIL_VALIDATOR } from './constants/constants';
import { CdkAppPipeline } from './constructs/cdk-app-pipeline';

import { IBackendDeploymentProps } from './interfaces';
export class BackendDeployment extends Stack {
  constructor(scope: App, id: string, private props: IBackendDeploymentProps) {
    super(scope, id, props);

    const { pipelineConfig } = props;

    const pipelineConstruct = new CdkAppPipeline(this, 'MultiEnvPipeline', {
      ...pipelineConfig,
    });

    pipelineConstruct.notificationTopic.addSubscription(
      this._createSnsSubscription()
    );
  }

  private _createSnsSubscription() {
    const {
      notificationsConfig: {
        notificationsTargetConfig: { emailAddress },
      },
    } = this.props;
    if (!EMAIL_VALIDATOR.test(String(emailAddress).toLocaleLowerCase())) {
      throw new Error('Invalid Email Address.');
    }
    return new EmailSubscription(emailAddress);
  }
}
