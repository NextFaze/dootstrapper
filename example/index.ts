import { App } from '@aws-cdk/core';
import {
  BackendDeployment,
  NOTIFICATIONS_TARGET,
  NOTIFICATIONS_TYPE,
} from '@dootstrapper/dootstrapper';

const buildSpec = {
  version: 0.2,
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

new BackendDeployment(app, 'Dootstrapper', {
  pipelineConfig: {
    artifactsSourceKey: 'artifacts/example.zip',
    environments: [
      {
        name: 'Dev',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'Development',
        },
        buildSpec,
      },
      {
        name: 'Uat',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'User Acceptance Testing',
        },
        buildSpec,
      },
      {
        name: 'Prod',
        privilegedMode: true,
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
    bucketName: 'example-dootstrapper-artifacts-bucket',
  },
});
