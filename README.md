
# CDK Deployment Boostrapper project

![Build Status](https://github.com/nextfaze/doostrapper/workflows/ci/badge.svg)

Creates a CD (Continuous delivery/deployment) pipeline to declaratively deploy to multiple environments.

## Getting Started [Internal Use Only]

This getting started section contains information on how to get started for developing doostrapper

### Prerequisites

- node (>=10.15 <12.14>)

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
