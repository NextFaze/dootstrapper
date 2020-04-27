import { Stack } from '@aws-cdk/core';
import { FrontendCDNPipeline } from './frontend-cdn-pipeline';
import {
  expect as expectCDK,
  countResources,
  SynthUtils,
} from '@aws-cdk/assert';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import { NOTIFICATIONS_TYPE } from '../enums';

describe('FrontendCDNPipeline', () => {
  let stack: Stack;

  describe('with minimum config', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new FrontendCDNPipeline(stack, 'FrontendCDNPipeline', {
        hostedZone,
        artifactsSourceKey: '/path/t0/artifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
        environments: [
          {
            aliases: ['app.example.com'],
            name: 'prod',
          },
        ],
      });
    });

    it('should create', () => {
      expectCDK(stack).to(countResources('AWS::CodePipeline::Pipeline', 1));
    });
  });

  describe('with no approval config', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new FrontendCDNPipeline(stack, 'FrontendCDNPipeline', {
        hostedZone,
        artifactsSourceKey: '/path/t0/artifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
        environments: [
          {
            aliases: ['test-app.example.com'],
            name: 'test',
          },
          {
            aliases: ['app.example.com'],
            name: 'prod',
          },
        ],
      });
    });

    it('should not create approval stage', () => {
      const pipeline = SynthUtils.synthesize(stack).template.Resources
        .FrontendCDNPipelineA052AB79;
      expect(pipeline.Properties.Stages.length).toEqual(3);
      // test env should only have deploy action
      const stage1Actions = pipeline.Properties.Stages[1].Actions;
      expect(stage1Actions.length).toEqual(2);
      expect(stage1Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Build',
            Owner: 'AWS',
            Provider: 'CodeBuild',
            Version: '1',
          },
          Name: 'Prepare',
          RunOrder: 1,
        })
      );
      expect(stage1Actions[1]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'S3',
            Version: '1',
          },
          Name: 'Deploy',
          RunOrder: 2,
        })
      );

      const stage2Actions = pipeline.Properties.Stages[2].Actions;
      // prod env should only have deploy action
      expect(stage2Actions.length).toEqual(2);
      expect(stage2Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Build',
            Owner: 'AWS',
            Provider: 'CodeBuild',
            Version: '1',
          },
          Name: 'Prepare',
          RunOrder: 1,
        })
      );
      expect(stage2Actions[1]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'S3',
            Version: '1',
          },
          Name: 'Deploy',
          RunOrder: 2,
        })
      );
    });
  });

  describe('with approval config', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new FrontendCDNPipeline(stack, 'FrontendCDNPipeline', {
        hostedZone,
        artifactsSourceKey: '/path/t0/artifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
        environments: [
          {
            aliases: ['test-app.example.com'],
            name: 'test',
          },
          {
            approvalRequired: true,
            aliases: ['app.example.com'],
            name: 'prod',
          },
        ],
      });
    });

    it('should create approval stage', () => {
      const pipeline = SynthUtils.synthesize(stack).template.Resources
        .FrontendCDNPipelineA052AB79;
      expect(pipeline.Properties.Stages.length).toEqual(3);
      // test env should only have deploy action
      const stage1Actions = pipeline.Properties.Stages[1].Actions;
      expect(stage1Actions.length).toEqual(2);

      const stage2Actions = pipeline.Properties.Stages[2].Actions;
      // prod env should only have deploy action
      expect(stage2Actions.length).toEqual(3);
      expect(stage2Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Approval',
            Owner: 'AWS',
            Provider: 'Manual',
            Version: '1',
          },
          Name: 'Approve',
          RunOrder: 1,
        })
      );
      expect(stage2Actions[1]).toEqual(
        jasmine.objectContaining({
          Name: 'Prepare',
          RunOrder: 2,
        })
      );
      expect(stage2Actions[2]).toEqual(
        jasmine.objectContaining({
          Name: 'Deploy',
          RunOrder: 3,
        })
      );
    });
  });
});
