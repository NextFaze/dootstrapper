import { Stack } from '@aws-cdk/core';
import { HostedZone } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { DOMAIN_NAME_REGISTRAR } from '../enums';
import {
  expect as expectCDK,
  countResources,
  haveResource,
} from '@aws-cdk/assert';
import { AssetsDistribution } from './assets-distribution';

describe('AssetsDistribution', () => {
  let stack: Stack;

  describe('with AWS registrar', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new AssetsDistribution(stack, 'AssetsDistribution', {
        hostedZone,
        domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
        aliases: ['assets.example.com'],
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
      });
    });

    it('should create', () => {
      expectCDK(stack).to(countResources('AWS::S3::Bucket', 1));
      expectCDK(stack).to(countResources('AWS::CloudFront::Distribution', 1));
    });

    it('should create record sets for both aliases', () => {
      expectCDK(stack).to(countResources('AWS::Route53::RecordSet', 1));
      expectCDK(stack).to(
        haveResource('AWS::Route53::RecordSet', {
          Name: 'assets.example.com.',
          Type: 'CNAME',
        })
      );
    });
  });

  describe('with no registrar', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new AssetsDistribution(stack, 'AssetsDistribution', {
        hostedZone,
        aliases: ['assets.example.com'],
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
      });
    });

    it('should not create record sets', () => {
      expectCDK(stack).notTo(haveResource('AWS::Route53::RecordSet'));
    });
  });
});
