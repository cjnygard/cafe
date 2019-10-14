---
title: "Events"
metaTitle: "Event Models"
metaDescription: "Guidelines and standards for event data"
---

# Event Models

CAFe supports gathering client-side events, providing similar functionality as Google Tag Manager.

Regardless of which solution is utilized for your project, there are some standard requirements and best practices that we recommend in order to make that event data easily consumable in a downstream analytics system.

In the following sections, we discuss guidelines and implementation suggestions in the context of both CAFe and GTM.
This illustrates the architecture and features of CAFe in terms of the relatively well-known GTM system.

## Event Definition Standards

All client-side events should adhere to the following standard requirements and best practices.

### Event Category/Action

Every event must have a well-defined event category and action:

|Type|Description
| --- | --- |
|Event Category [1]|The event category should identify the context and/or type of event (examples would include an identifier for the specific app/component where the event occurred such as "login", "user-profile" or "navbar").
|Event Action [1]|The event action should identify the interaction that triggers the event (examples would include "update", "view", "watch", or "click").

* In GTM, these values should be captured in the eventCategory and eventAction data layer variables respectively and added to corresponding Event field names when published to Universal Analytics.
* In CAFe, these values should be captured in the eventCategory and eventAction fields on the activity schema.

[^1] _Event category and action values must be identifier-like, alphanumeric (plus hyphens)._
_camelCase is preferred._
_No whitespace._

## Event Timestamp

Every event must be accompanied by an event timestamp that reflects the local time on the user's machine, including timezone.

For interoperability, this timestamp should adhere to the ISO 8601 Internet Date/Time Format (https://tools.ietf.org/html/rfc3339#section-5.6).

Specifically timestamps look like this `2018-01-21T23:39:43.123-08:00`

See `Client-Side Eventing Timestamp Requirements` for further details and for sample Javascript code that can be used to generate the timestamp in the required format.

## Event Session Identifier

Every event must include a session identifier [2].

* In GTM, the visitId field added by Universal Analytics is acceptable although a platform-specific session identifier can also be captured/provided if applicable.
* In CAFe, a session identifier applicable to the implementation must be provided in a sessionId field on the activity schema.

[^2] _The session identifier should be a unique value generated whenever the client-side application code is initialized in the browser._
_If a user refreshes the application or opens it in a new tab, a new session identifier should be generated and provided on subsequent events within that browser window._
 
This client-side "session" identifier is utilized for a couple of purposes:

* In the scenario that the implementation also captures and publishes profile data (device and geolocation data) to the CAFe "profile" endpoint, that profile data should be associated with the same client-side session identifier, thereby enabling the two datasets to be joined together.
* It also provides insights into how the application is accessed and, in particular, can be used to understand whether users are interacting with the application concurrently in multiple locations (separate browsers, separate tabs).

See `Client-Side Eventing UUID Generation` for further details and sample Javascript code to generate a reasonably unique session identifier.

## Event Identifier

Every event must include a unique event identifier.

* In GTM, the combination of visitId plus hits.hitNumber fields added by Universal Analytics is acceptable
* In CAFe, an event identifier should be generated and supplied in the provided eventId field on the activity schema

See `Client-Side Eventing UUID Generation` for further details and sample Javascript code to generate a reasonably unique event identifier.

## Platform & Environment 

Every event must be accompanied by an identifier for the platform generating the event and its environment.

In some cases, it may also be applicable to capture the same details for platform that hosts the app/component generating the event, as well as for the identity and access management system for the user.

|Type|Description|Required|
| --- | --- | --- |
|productPlatform|The platform/app that is generating the event (`dashboard`, `user-profile`, `admin`, etc)|Always
|productEnvironment|The environment of the platform/app generating the event (`dev`, `int`, `qa`, `stage`, etc)|Always
|hostPlatform|The platform/app that hosts the app/component generating the event|When applicable
|hostEnvironment|The environment of the platform/app that hosts the app/component generating the event (`dev`, `int`, `qa`, `stage`, etc)|When applicable
|userPlatform|The identity and access management system in which the user can be resolved.|When applicable
|userEnvironment|The environment of identity and access management system in which the user can be resolved (`dev`, `int`, `qa`, `stage`, etc)|When applicable

* In GTM, data layer variables should be created and populated for each of the applicable values above.
* In CAFe, predefined fields are provided for each of the above on the activity schema

## User Identifier

In general, a user identifier should be provided for all user interaction events.

_The supplied user identifier must not be something that can be construed as personally identifiable information (PII)._

* In GTM, the user identifier should be supplied in a data layer variable appropriately named (ie, userSSOGUID)
* In CAFe, the user identifier should be supplied in the provided userId field on the activity schema 

## Additional Contextual Data

In addition to category and action, as well as the standard contextual data points outlined above, there may be cases were additional contextual data is needed/useful.
This can vary depending on the application or industry, and must be defined on a case-by-case basis.

Common examples from the education industry might include:

|Name|Description|
| --- | --- |
|eISBN|For events that take place within the context of a specific product, the "eISBN" or component ISBN of the product
|coreTextISBN|For events that take place within the context of a specific product, the core text or "title" ISBN of the product
|contextId|For events that take place in the context of a course section, the contextId (typically, the course key)
|activityId|For events that take place in the context of an activity, an identifier for the activity (for example, an activity identifier)
|activityNodeId|For events that take place in the context of an activity, an identifier for the activity node (for example, a sub-activity or question identifier)


