[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Build Status](https://travis-ci.org/rlodge/cafe-eventing.svg?branch=master)](https://travis-ci.org/rlodge/cafe-eventing)
[![NPM version](https://img.shields.io/npm/v/@cafe/cafe-eventing.svg)](https://www.npmjs.com/package/@cafe/cafe-eventing)
![Downloads](https://img.shields.io/npm/dm/@cafe/cafe-eventing.svg)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

# CAFe

## Overview

CAFe supports gathering client-side events, providing similar functionality as Google Tag Manager.

## Why CAFe?

Common Analytics Framework for Eventing (CAFe) provides a pattern for implementing client-side eventing, as well as the back-end analytics infrastructure for reliably capturing and processing the event data.
CAFe is similar in function to Google Tag Manager (GTM), while not suffering from data loss due to common ad-blocker software.

Some general guidelines are included to help you decide which approach is most appropriate for your project.

## Solution Comparison

There are pros and cons, strengths and weaknesses, with each approach that must be considered relative to the requirements of your project.
The table below provides a comparison of the two solutions that should be considered when choosing a solution.

### Accuracy of data capture

#### GTM 

GTM can be blocked via ad-blocking browser plugins and other web security solutions.

For example, our research has suggested that approximately 5% of all traffic in the HigherEd space is not captured due to this limitation (the number may be higher for K12).
If accuracy in the event capture is needed for your project, GTM is not a viable solution.

An example of where this solution would not be appropriate is if there is a requirement to track time in course, or on activity, which will be displayed back to the instructor and/or student.

Another example might be when the data is needed for financial calculations.

#### CAFe 

CAFe is accurate relative to the level of care that has been taken to implement some level of error handling and retries on failures.
When a high-degree of accuracy is required in the resulting event set, CAFe is the recommended solution.

If the data is going to be used for financial calculations, royalty info, etc., then this solution should probably be considered a requirement.

### Data analysis

#### GTM

GTM can publish event data to Google Analytics 360, making it possible to combine that data with the standard session/user/hit data captured via that solution.
This can be useful if you already use Analytics 360 to build custom reports/dashboards.

Once available in Analytics 360, this data can also be sync'd to Google Cloud Platform's BigQuery.
From there it can then be analyzed or ingested into other analytics platforms.

With this approach, the expected delay between when an event occurs and when it will be available for analysis in BigQuery is approximately 24-48 hours (https://support.google.com/analytics/answer/7084038?hl=en).

#### CAFe

CAFe event data is persisted to Amazon S3 from where it may then be processed by AWS Lambda functions.

With this approach, the expected delay between when an event occurs and when it is processed by Lambda is based on the Firehose buffering settings, which may be configured between 90sec and 15 minutes.

### Overall ease of implementation

#### GTM 

GTM, with a browser-based workspace editor, a rich set of prebuilt event triggers, and dataLayer handler, can facilitate the overall ease of the implementation for an experienced user.
There is a fairly significant learning curve for someone who has no experience with the platform due to the complexity of the offering.
(see version control below)

#### CAFe

CAFe does not provide all the whistles and bells that GTM does in terms of prebuilt event triggers and dataLayer management which means that some level of infrastructure has to be developed from scratch to capture and publish events.
However, this can also lend itself to a certain simplicity to the implementation.
(see version control below)

### Capture of page views

#### GTM 

GTM supports a pre-built "Page View" trigger to capture page views

#### CAFe

CAFe requires implementing a "page view" activity event

### Capture of custom events

#### GTM 

GTM supports the capture of custom events via a "Custom Event" event trigger, in combination with a dataLayer handler that allows for the capture and management of contextual data points surrounding the event.

#### CAFe

CAFe supports custom events via the use of the `/activity` endpoint.
Standard contextual data for each event is captured via pre-defined fields in the event schema, and additional data points can be captured as key/value pairs via tags.

### Capture of profile data (device, geolocation)

#### GTM 

GTM captures profile data such as device and geo-location attributes by default on all hits

#### CAFe

CAFe provides an endpoint to which profile data can be published on an as-needed-basis (for example, at the start of a session)

This data may be classified as PII data and separating the data streams allows different data retention policies and compliance policies to be applied.

### Version Control

#### GTM 

GTM has a built in versioning system with rollback capabilities.
It also provides an export/import feature which could be utilized to promote changes from one environment to another.
GTM client behavior is injected into your page at load time and may contain source code that is not part of a git versioned project.

#### CAFe

The CAFe integration and CloudFormation scripts should be included as part of your platform's version control implementation.

## Build Instructions

We use `lerna` for managing a multi-package build environment in a single source tree.
See http://lerna.js.org for more information regarding `lerna`.

To build from scratch with a fresh clone, clear out the package-lock.json files so that lerna can properly link locally built packages.

```bash
npm run maintainer-clean
npm run bootstrap
```


