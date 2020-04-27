# <div align="center"> Development Bootstrapper Project</div>

[![Build Status](https://img.shields.io/github/workflow/status/nextfaze/dootstrapper/ci?style=for-the-badge)](https://github.com/NextFaze/dootstrapper) [![NPM Release](https://img.shields.io/npm/v/@nf-tools/dootstrapper?style=for-the-badge)](https://www.npmjs.com/package/@nf-tools/dootstrapper) [![Package Size](https://img.shields.io/bundlephobia/min/@nf-tools/dootstrapper?style=for-the-badge)](https://www.npmjs.com/package/@nf-tools/dootstrapper) [![Github Issues](https://img.shields.io/github/issues-raw/nextfaze/dootstrapper?style=for-the-badge)](https://github.com/NextFaze/dootstrapper) [![AWS CDK](https://img.shields.io/npm/dependency-version/@nf-tools/dootstrapper/peer/@aws-cdk/core?style=for-the-badge)](https://github.com/aws/aws-cdk) [![Dootstrapper stars](https://img.shields.io/github/stars/nextfaze/dootstrapper?color=orange&style=for-the-badge)](https://github.com/NextFaze/dootstrapper/stargazers)

Creates a CD (Continuous delivery/deployment) pipeline to declaratively deploy to multiple environments.

## Getting Started [Internal Use Only]

This getting started section contains information on how to get started for developing dootstrapper

### Prerequisites

- node (>=10.15 <12.14>)

### Environment

Before any npm commands can be executed NPM_TOKEN env must be available to the bash environment, to do this run
`export NPM_TOKEN=` or add `export NPM_TOKEN=` to .bashrc

### Installing

`npm install`

### Installing all packages

`npm run install:all`

### Building

`npm run build`

### Testing

`npm run test`

### Adding New Dependency

#### Adding Runtime Dependency

Run time dependencies must be added to root `package.json` as well in `package.json` for given package

#### Adding Dev Dependency

All Dev Deps must only be added to root `package.json`, and internal BUILD targets to use it by referencing it via `@npm//`
