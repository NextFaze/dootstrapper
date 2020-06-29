# <div align="center">Dootstrapper</div>

[![NPM Release](https://img.shields.io/npm/v/@nf-tools/dootstrapper?style=for-the-badge)](https://www.npmjs.com/package/@nf-tools/dootstrapper) [![Package Size](https://img.shields.io/bundlephobia/min/@nf-tools/dootstrapper?style=for-the-badge)](https://www.npmjs.com/package/@nf-tools/dootstrapper) [![Github Issues](https://img.shields.io/github/issues-raw/nextfaze/dootstrapper?style=for-the-badge)](https://github.com/NextFaze/dootstrapper) [![AWS CDK](https://img.shields.io/npm/dependency-version/@nf-tools/dootstrapper/peer/@aws-cdk/core?style=for-the-badge)](https://github.com/aws/aws-cdk) [![Dootstrapper stars](https://img.shields.io/github/stars/nextfaze/dootstrapper?color=orange&style=for-the-badge)](https://github.com/NextFaze/dootstrapper/stargazers)

Dootstrapper is a library for bootstrapping deployment resources. It creates a continuous delivery | continuous deployment pipeline to deploy modern web and serverless (AWS) apps. It uses highly declarative buildspec syntax to configure deployment steps, generating highly customizable multiple environment pipeline. Additionally, it also configures notification channels to publish deployment notifications to.

Dootstrapper uses modern JavaScript, is built with [Typescript](https://www.typescriptlang.org/) (Provides optional types for JavaScript). At it's core, there is a [AWS Cloud Development Kit](https://docs.aws.amazon.com/cdk/) which makes all magic possible.

Here is a small list of features it offers:

✔️ Ease of use

✔️ Minimum Effort to go from development to production

✔️ Automated deployment notifications

✔️ Support for deploying SPA apps

✔️ Support for deploying serverless apps without pain

✔️ Out of the box support for continuous delivery and continuous deployment on both platforms

✔️ Rich typing and documentation

✔️ Built with modern tools like bazel🍃️

## Getting Started

### Prerequisite

`aws-cli`: installed and configured [Install it from here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

`aws-cdk`: installed globally [Install is from here](https://www.npmjs.com/package/aws-cdk)

### Scaffolding project

We will need CDK environment setup to be able to run cdk deploy commands
Initialize environment with

```sh
cdk init --language typescript
```

### Install it with

```sh
npm i @nf-tools/dootstrapper
```

#### Installing dependencies

Since, Dootstrapper doesn't ship with existing aws-cdk modules, these all needs to be manually installed

Install cdk packages with

```sh
npm i @aws-cdk/aws-sns-subscriptions @aws-cdk/aws-sns @aws-cdk/aws-s3 @aws-cdk/aws-iam @aws-cdk/aws-events-targets @aws-cdk/aws-events @aws-cdk/aws-codepipeline-actions @aws-cdk/aws-codepipeline @aws-cdk/aws-codebuild @aws-cdk/aws-cloudtrail @aws-cdk/aws-ssm @aws-cdk/aws-route53 @aws-cdk/aws-cloudfront @aws-cdk/aws-certificatemanager
```

### Creating your first pipeline project

Now inside `{project-dir}/bin` locate line with `const app = new cdk.App()`. Just below, add

```typescript
const app = new App();

const deploymentStack = new Stack(app, 'DeploymentToolsStack', {
  stackName: 'Frontend and Backend Deployment Tools',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new FrontendDeployment(deploymentStack, 'FrontendDeployment', {
  pipelineConfig: // pipeline config option,
  baseDomainName: // base domain name,
  notificationConfig: // notification config option
});
```

(Optional) Remove any other auto generated stack configs from `{project-dir}/lib`

### Deploying

Run `cdk deploy` and all the required resources will be created in region specified in `~/.aws/config`

**Note**: _This entire process of building and deploying is likely to get much simple when dootstrapper cli comes out_

### More examples

Checkout more detailed examples in dootstrapper repository [here](https://github.com/NextFaze/dootstrapper/blob/develop/example/index.ts)

## Motivation

To be able to create awesome softwares, we need a solid version control system and development styles, that has been Git and GitFlow traditionally. GitFlow has very effective development model but it is not efficient especially when we need frequent releases. With git flow each changes needs to go through entire merge life cycle: `feature -> develop -> master -> release`, also it takes a lot of good practice to get good at GitFlow, and mostly with small/medium projects it is really not required. Thus, use `Trunk Based Development`.

Wait but now with `TBD` (sort for `Trunk Based Development`), there is going to be a lot of configuration required to release an application into multiple environment since it does not have that different branch for different environment niceness. To address this problem, Introducing Dootstrapper.

With Dootstrapper, it is easy to setup multiple environment based release cycle. It also takes care of sending notifications to teams, when human involvement is required. Under the hood it creates all key resources required (on aws cloud) for you.
