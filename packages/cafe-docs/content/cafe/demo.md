---
title: "Demo"
metaTitle: "Demo WebApp"
metaDescription: "Demo web application showing how CAFe is used"
---

# Demo

The `./packages/demo` project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.1.
It currently depends on version 8.2.8.

## Demo Operation

Configure the CAFe API Gateway URL in the DEFAULT_ENVIRONMENT_DATA located in `./packages/cafe-environment/cafe-environment.service.ts`

Configure the CAFe API Gateway key in the `./packages/demo/src/app/app.module.ts` file as the `errorLoggingApiApiKey`

See the Section describing the AWS API Gateway for more information.

## Development server

Run `ng serve` for a dev server.

Navigate to `http://localhost:4200/`.

The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component.

You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project.

The build artifacts will be stored in the `dist/` directory.

Use the `--prod` flag for a production build.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

