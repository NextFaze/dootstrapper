# Development Bootstrapper Project

![Build Status](https://github.com/nextfaze/dootstrapper/workflows/ci/badge.svg)

Creates a Development Tools, used for software delivery process

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
