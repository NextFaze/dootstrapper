import { App, Stack } from '@aws-cdk/core';
import {
  BackendDeployment,
  NOTIFICATIONS_TARGET,
  NOTIFICATIONS_TYPE,
} from '@nf-tools/dootstrapper';
import { FrontendDeployment } from '@nf-tools/dootstrapper';
import { DOMAIN_NAME_REGISTRAR } from '@nf-tools/dootstrapper';

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

const deploymentStack = new Stack(app, 'DeploymentTools', {
  stackName: 'deployment-tools',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new FrontendDeployment(deploymentStack, 'FrontendDeployment', {
  pipelineConfig: {
    artifactsSourceKey: 'artifacts/app.zip',
    environments: [
      {
        aliases: ['app-test.example.com'],
        name: 'test',
        domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
      },
    ],
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
  },
  baseDomainName: 'example.com',
  notificationConfig: {
    notificationsTargetConfig: {
      emailAddress: 'deployments@example.com',
      targetType: NOTIFICATIONS_TARGET.EMAIL,
    },
  },
});

new FrontendDeployment(deploymentStack, 'FrontendDeploymentWithRuntimeConfig', {
  pipelineConfig: {
    artifactsSourceKey: 'artifacts/app.zip',
    environments: [
      {
        aliases: ['app-test.example.com'],
        name: 'test',
        domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
      },
      {
        aliases: ['app.example.com'],
        name: 'prod',
        domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
      },
    ],
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
  },
  baseDomainName: 'example.com',
  runtimeEnvironmentConfig: {
    directory: 'assets/config',
    fileName: 'config',
  },
  certificateArn:
    'arn:aws:acm:us-east-1:897837517276:certificate/feabc843-5cd4-403f-ba3f-dda542e28659',
  notificationConfig: {
    notificationsTargetConfig: {
      emailAddress: 'rpatel@nextfaze.com',
      targetType: NOTIFICATIONS_TARGET.EMAIL,
    },
  },
});

new BackendDeployment(deploymentStack, 'BackendDeployment', {
  pipelineConfig: {
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
    artifactsSourceKey: 'artifacts/example.zip',
    environments: [
      {
        name: 'dev',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'Development',
        },
        buildSpec,
      },
      {
        name: 'uat',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'User Acceptance Testing',
        },
        buildSpec,
      },
      {
        name: 'prod',
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
  notificationConfig: {
    notificationsTargetConfig: {
      emailAddress: 'rpatel@nextfaze.com',
      targetType: NOTIFICATIONS_TARGET.EMAIL,
    },
  },
});

new BackendDeployment(deploymentStack, 'BackendDeploymentWithSlack', {
  pipelineConfig: {
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
    artifactsSourceKey: 'artifacts/example.zip',
    environments: [
      {
        name: 'dev',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'Development',
        },
        buildSpec,
      },
      {
        name: 'uat',
        privilegedMode: true,
        adminPermissions: true,
        runtimeVariables: {
          currEnv: 'User Acceptance Testing',
        },
        buildSpec,
      },
      {
        name: 'prod',
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
  notificationConfig: {
    notificationsTargetConfig: {
      targetType: NOTIFICATIONS_TARGET.SLACK,
      channelName: 'notify-caromel',
    },
  },
});
