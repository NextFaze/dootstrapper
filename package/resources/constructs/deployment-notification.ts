import { INotificationsConfig } from './../interfaces';
import { Construct } from '@aws-cdk/core';

interface IDeploymentNotificationProps extends INotificationsConfig {}

export class DeploymentNotification extends Construct {
  constructor(scope: Construct, id: string, props: DeploymentNotification) {
    super(scope, id);
  }
}
