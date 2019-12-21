// import { expect as expectCDK, haveResource, MatchStyle } from '@aws-cdk/assert';
// import { App, Stack } from '@aws-cdk/core';
// import { DoostrapperDelivery } from './doostrapper-delivery';
// import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './enums';
// const assert1 = require('./test/assert1.json');

// xdescribe('Doostrapper', () => {
//   let stack: Stack;

//   describe('Stack with default config', () => {
//     beforeEach(() => {
//       const app = new App();
//       stack = new DoostrapperDelivery(app, 'TestStack', {
//         stackName: 'test-stack',
//         pipelineConfig: {
//           artifactsSourceKey: 'path/to/resource.zip',
//           environments: [
//             {
//               approvalRequired: false,
//               adminPermissions: true,
//               region: 'ap-southeast-1',
//               buildSpec: {},
//               name: 'test',
//               runtimeVariables: {},
//             },
//           ],
//         },
//         notificationsConfig: {
//           notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
//           notificationsTargetConfig: {
//             targetType: NOTIFICATIONS_TARGET.EMAIL,
//             emailAddress: 'example@example.com',
//             emailSubject: 'Deploy Notifications',
//           },
//         },
//       });
//     });
//     it('should create with minimum config', () => {
//       expect(stack).toBeTruthy();
//       expectCDK(stack).toMatch(assert1, MatchStyle.EXACT);
//     });

//     it('should create sns topic to send notifications to', () => {
//       expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
//     });

//     it('should create sns subscription to email', () => {
//       expectCDK(stack).to(
//         haveResource('AWS::SNS::Subscription', {
//           Protocol: 'email',
//           TopicArn: {
//             Ref: 'PipelineNotificationsTopic827A419F',
//           },
//           Endpoint: 'example@example.com',
//         })
//       );
//     });

//     it('should create cloudwatch event rule to listen to pipeline execution status change', () => {
//       expectCDK(stack).to(
//         haveResource('AWS::Events::Rule', {
//           Description: 'Doostrapper Pipeline notifications Cloudwatch Rule',
//           EventPattern: {
//             source: ['aws.codepipeline'],
//             'detail-type': ['CodePipeline Pipeline Execution State Change'],
//             resources: [
//               {
//                 'Fn::Join': [
//                   '',
//                   [
//                     'arn:',
//                     {
//                       Ref: 'AWS::Partition',
//                     },
//                     ':codepipeline:',
//                     {
//                       Ref: 'AWS::Region',
//                     },
//                     ':',
//                     {
//                       Ref: 'AWS::AccountId',
//                     },
//                     ':',
//                     {
//                       Ref: 'MultiEnvPipeline44057249',
//                     },
//                   ],
//                 ],
//               },
//             ],
//           },
//           State: 'ENABLED',
//           Targets: [
//             {
//               Arn: {
//                 Ref: 'PipelineNotificationsTopic827A419F',
//               },
//               Id: 'Target0',
//             },
//           ],
//         })
//       );
//     });
//   });

//   describe('stack with stage execution status config', () => {
//     beforeEach(() => {
//       const app = new App();
//       stack = new DoostrapperDelivery(app, 'TestStack', {
//         stackName: 'test-stack',
//         pipelineConfig: {
//           artifactsSourceKey: 'path/to/resource.zip',
//           environments: [
//             {
//               approvalRequired: false,
//               adminPermissions: true,
//               region: 'ap-southeast-1',
//               buildSpec: {},
//               name: 'test',
//               runtimeVariables: {},
//             },
//           ],
//         },
//         notificationsConfig: {
//           notificationsType: NOTIFICATIONS_TYPE.STAGE_EXECUTION,
//           notificationsTargetConfig: {
//             targetType: NOTIFICATIONS_TARGET.EMAIL,
//             emailAddress: 'example@example.com',
//             emailSubject: 'Deploy Notifications',
//           },
//         },
//       });
//     });

//     it('should create event rule to listen to pipeline stage execution config', () => {
//       expectCDK(stack).to(
//         haveResource('AWS::Events::Rule', {
//           Description: 'Doostrapper Pipeline notifications Cloudwatch Rule',
//           EventPattern: {
//             source: ['aws.codepipeline'],
//             'detail-type': ['CodePipeline Stage Execution State Change'],
//             resources: [
//               {
//                 'Fn::Join': [
//                   '',
//                   [
//                     'arn:',
//                     {
//                       Ref: 'AWS::Partition',
//                     },
//                     ':codepipeline:',
//                     {
//                       Ref: 'AWS::Region',
//                     },
//                     ':',
//                     {
//                       Ref: 'AWS::AccountId',
//                     },
//                     ':',
//                     {
//                       Ref: 'MultiEnvPipeline44057249',
//                     },
//                   ],
//                 ],
//               },
//             ],
//           },
//           State: 'ENABLED',
//           Targets: [
//             {
//               Arn: {
//                 Ref: 'PipelineNotificationsTopic827A419F',
//               },
//               Id: 'Target0',
//             },
//           ],
//         })
//       );
//     });
//   });

//   describe('stack with actions execution status config', () => {
//     beforeEach(() => {
//       const app = new App();
//       stack = new DoostrapperDelivery(app, 'TestStack', {
//         stackName: 'test-stack',
//         pipelineConfig: {
//           artifactsSourceKey: 'path/to/resource.zip',
//           environments: [
//             {
//               approvalRequired: false,
//               adminPermissions: true,
//               region: 'ap-southeast-1',
//               buildSpec: {},
//               name: 'test',
//               runtimeVariables: {},
//             },
//           ],
//         },
//         notificationsConfig: {
//           notificationsType: NOTIFICATIONS_TYPE.ACTION_EXECUTION,
//           notificationsTargetConfig: {
//             targetType: NOTIFICATIONS_TARGET.EMAIL,
//             emailAddress: 'example@example.com',
//             emailSubject: 'Deploy Notifications',
//           },
//         },
//       });
//     });

//     it('should create event rule to listen to pipeline stage execution config', () => {
//       expectCDK(stack).to(
//         haveResource('AWS::Events::Rule', {
//           Description: 'Doostrapper Pipeline notifications Cloudwatch Rule',
//           EventPattern: {
//             source: ['aws.codepipeline'],
//             'detail-type': ['CodePipeline Action Execution State Change'],
//             resources: [
//               {
//                 'Fn::Join': [
//                   '',
//                   [
//                     'arn:',
//                     {
//                       Ref: 'AWS::Partition',
//                     },
//                     ':codepipeline:',
//                     {
//                       Ref: 'AWS::Region',
//                     },
//                     ':',
//                     {
//                       Ref: 'AWS::AccountId',
//                     },
//                     ':',
//                     {
//                       Ref: 'MultiEnvPipeline44057249',
//                     },
//                   ],
//                 ],
//               },
//             ],
//           },
//           State: 'ENABLED',
//           Targets: [
//             {
//               Arn: {
//                 Ref: 'PipelineNotificationsTopic827A419F',
//               },
//               Id: 'Target0',
//             },
//           ],
//         })
//       );
//     });
//   });
// });
