import { Stack } from '@aws-cdk/core';
import { FrontendCDNPipeline } from './frontend-cdn-pipeline';
import {
  expect as expectCDK,
  countResources,
  SynthUtils,
} from '@aws-cdk/assert';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import { NOTIFICATIONS_TYPE } from '../constants/enums';

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
      expect(stage1Actions.length).toEqual(1);
      expect(stage1Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'S3',
            Version: '1',
          },
          Name: 'Deploy',
        })
      );

      const stage2Actions = pipeline.Properties.Stages[2].Actions;
      // prod env should only have deploy action
      expect(stage2Actions.length).toEqual(1);
      expect(stage2Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Deploy',
            Owner: 'AWS',
            Provider: 'S3',
            Version: '1',
          },
          Name: 'Deploy',
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

    it('should not create approval stage', () => {
      const pipeline = SynthUtils.synthesize(stack).template.Resources
        .FrontendCDNPipelineA052AB79;
      expect(pipeline.Properties.Stages.length).toEqual(3);
      // test env should only have deploy action
      const stage1Actions = pipeline.Properties.Stages[1].Actions;
      expect(stage1Actions.length).toEqual(1);

      const stage2Actions = pipeline.Properties.Stages[2].Actions;
      // prod env should only have deploy action
      expect(stage2Actions.length).toEqual(2);
      expect(stage2Actions[0]).toEqual(
        jasmine.objectContaining({
          ActionTypeId: {
            Category: 'Approval',
            Owner: 'AWS',
            Provider: 'Manual',
            Version: '1',
          },
          Name: 'Approve',
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
        })
      );
    });
  });
});
