---
title: "CAFe"
metaTitle: "CAFe Usage"
metaDescription: "Details and examples of CAFe usage"
---

# How To

This section details how to use the cafe-client-eventing library and associated endpoints.

NOTE: The contract is the API, not this client, you can use this client, make your own copy etc.
It is provided as is, and should be considered nothing more than an example, and if you do use it, you are responsible to address issues that you run into.
The API is the contract and expectation, NOT this client.

###  TODO

Show where the open-source packages are published.

For further information https://docs.npmjs.com/misc/registry

## Purpose

The client eventing system is designed to produce a web client clickstream.
It should be agnostic to what platform or source technology (e.g. React or Angular / Typescript) is used, though it has a number of dependencies.

## Installation

The library is distributed as an ESM5/ESM2015 bundle in the NPM package '@cafe/cafe-client' on the repository _FIXME Nexus URL_.

Assuming you are working with a node / NPM project, you should do:

``` bash
# install library and dependencies
npm install --save @cafe/cafe-client moment bowser fingerprintjs2@2.0.3 rxjs@6.3.3 lodash uuid
```

## Simple Usage

You must initialize the library somewhere near where you are initializing the rest of your application, with code similar to:

```javascript
import {CafeClientEventing, DefaultEventingConfiguration} from '@cafe/cafe-client'

const environment = 'staging';

someGlobalObject.cafeClientEventing = new CafeClientEventing(new DefaultEventingConfiguration({
  productEnvironment: environment,
  productPlatform: 'your-app-name',
  apiKey: environment === 'production' ? 'assigned-production-api-key' : 'assigned-nonprod-api-key',
  eventingEndpoint: environment === 'production'
    ? 'https://assigned-production-endpoint.example.com'
    : 'https://assigned-nonprod-endpoint.example.com',
}));
```

There are a variety of other options that can be provided, detailed below.

When you want to record an event, do something like:

```javascript
someGlobalObject.cafeClientEventing.recordActivity({eventCategory: 'SOME_CATEGORY', eventAction: 'SOME_ACTION'});
```

And that's it.
You should be able to see events going out periodically in the developer tools of your web browser.

## Configuration Options

|Parameter Name|Data Type|Required?|Default Value|Description
| --- | --- | --- | --- | --- |
|productEnvironment|string|Required| |What environment are you in (e.g. production or staging or performance)
|productPlatform|string|Required| |What application is reporting (e.g. engagement-report)
|eventingEndpoint|string|Required| |Assigned eventing endpoint for the environment.
|loggingApiKey|string|Required| |Assigned API key for the specified endpoint.
|hostEnvironment|string|Optional| |If the application is hosted (e.g. in an iFrame), what is the host environment?
|hostPlatform|string|Optional| |If the application is hosted (e.g. in an iFrame), what is the host platform?
|userEnvironment|string|Optional| |What environment is the user from?
|userPlatform|string|Optional| |What platform is the user from?
|bufferInterval|number|Optional|60000|How often are events reported, in ms. Note that unless you specify installOnUnloadHandler=true, closing the window will dump existing events.
|maxBufferSize|number|Optional|100|The maximum buffer size of outgoing events, how many to buffer before sending them.
|profileSubmissionDelay|number|Optional|5000|How long after the client is initialized should it wait before doing browser detection and sending the results.This prevents us from doing any high-cost work right as the app loads.
|useNativeResolution|boolean|Optional|false|Report the native resolution of the device instead of the effective resolution.
|useBrowserGeoLocation|boolean|Optional|false|Report latitude / longitude of the user if available.Will force the browser to prompt for location access, which is why this is turned off by default.You would have to evaluate if you want this prompt to appear to the user.
|fetchIpAddress|boolean|Optional|false|Fetch the IP address of the user for profile reporting; this requires an additional round-trip to the API.
|recordViewingTime|boolean|Optional|false|Periodically record that the user is on the app.
|recordViewingTimeWhenWindowNotVisible|boolean|Optional|false|Don't record viewing time if the window is marked not visible (covered by another browser tab).
|recordViewingTimeByUrl|boolean|Optional|false|For each increment of viewingTimeCheckInterval, record the browser URL and report time spent at each URL, subject to the resolution of viewingTimeCheckInterval.
|recordViewingTimeContiguously|boolean|Optional|false|Will record two events if there appears to be a gap in window visibility between recorded events on a particular URL.
|viewingTimeCheckInterval|number|Optional|5000|How often to poll focused and visible states and URL, in MS
|viewingTimeRecordInterval|number|Optional|60000|After how long do we gather up intervals and report them as events, in MS.
|viewingTimeRecordCategory|string|Optional|VIEWING_TIME|What category to report for viewing time recording.
|attemptCompletionOnClose|boolean|Optional|true|Should the client try and send all information when the window is closed? You would have to enable installOnUnloadHandler, or call the client's flush() method yourself on window unload to make this work.
|installOnUnloadHandler|boolean|Optional|false|Install an event listener for the window's 'onbeforeunload' event so that data can be sent on window close.
|installOnErrorHandler|boolean|Optional|false|Override the window's onerror handler so to log errors to the API.  Requires logErrorsToService to be enabled to make this work.
|logErrorsToService|boolean|Optional|false|Log errors to the API when the API's logError method is called.
|urlScrubber|(string) => string|Optional|CafeClientEventing.defaultUrlScrubber|Scrubs outgoing URLs. The default implementation redacts the query params '.*token' and 'jwt' in an attempt to make sure that users' identification tokens do not get recorded.

## Setting the GlobalContext

Although it's not required, it is sometimes useful to set some global context to make calling `recordActivity` easier.
This can be done by calling the client's `setGlobalContext` method.

It accepts a `GlobalContext` object, which can include a `userId` value and an array of tags, both of which apply to all subsequent calls to `recordActivity`.
This allows you to set the user's GUID when the user logs in, for instance, or add a set of tags that record the course URI that's being used, for instance.

### Calling recordActivity

The `recordActivity` method is the primary way events are recorded.

It accepts the following parameters:

| Parameter Name| Data Type| Required?| Default Value| Description
| --- | --- | --- | --- | --- |
| eventCategory| string| Required| |The category of the event, e.g. ROUTER_NAVIGATION or SELECTED_TAB
| eventAction| string| Required| |The action of the event, e.g. `clicked`
| userId| string| Optional| undefined| The logged-in user's SSO GUID. Will be set by global context if present.
| eventDuration| number| Optional| undefined| How long the event took, if known
| url| string| Optional| window.location.href| The URL of the event.
| tags| ClientEventing.ActivityTag[]| Optional| []| Any tags for the event, like courseUri, activityId, etc. Will be appended to tags specified in the global context.
| eventDate| Date| Optional| new Date()| The date of the event.
