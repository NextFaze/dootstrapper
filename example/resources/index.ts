import { App } from '@aws-cdk/core';
import {
  DoostrapperDelivery,
  NOTIFICATIONS_TARGET,
  NOTIFICATIONS_TYPE,
} from 'doostrapper';
const buildSpec = {
  phases: {
    install: {
      'runtime-versions': {
        docker: 18,
      },
    },
    build: {
      commands: ['echo Hello from $currEnv', 'docker version'],
    },
  },
};

const app = new App();
new DoostrapperDelivery(app, 'Doostrapper', {
  pipelineConfig: {
    artifactsSourceKey: 'artifacts/example.zip',
    environments: [
      {
        name: 'dev',
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'Development',
        },
        buildSpec,
      },
      {
        name: 'uat',
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'User Acceptance Testing',
        },
        buildSpec,
      },
      {
        name: 'prod',
        adminPermissions: true,
        approvalRequired: true,
        runtimeVariables: {
          currEnv: 'production',
        },
        buildSpec,
      },
    ],
  },
  notificationsConfig: {
    notificationsTargetConfig: {
      emailAddress: 'rpatel@nextfaze.com',
      emailSubject: 'Deployment Notifications',
      targetType: NOTIFICATIONS_TARGET.EMAIL,
    },
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
  },
  artifactsBucketConfig: {
    bucketName: 'example-doostrapper-artifacts-bucket',
  },
});
