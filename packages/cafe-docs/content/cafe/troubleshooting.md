# Troubleshooting

## Overview

When integrating with the CAFe endpoints, there are two approaches that teams performing the integration can use to validate the events.

* Review browser network requests
* Search the S3 bucket for the data in question

Each of these methods will be documented below.

In addition, CAFe endpoints emit logging messages when errors are encountered.
It is beyond the scope of this project to implement centralized logging for the API Gateway components.

## Browser Network Requests

For events captured client-side, a first level of validation can be done by monitoring the network request to the endpoint via the browser's developer tools.

Attention should be paid to the following:

* Was the request made when expected (ie, upon the defined trigger)?
* What was the request response?
  * A 200 response indicates a successful post
  * A 400 response indicates a problem with the request body (including event schema validation failures)
  * A 403 response indicates a problem with the request authentication (AWS 'x-api-key' is missing/incorrect)
  * (Other responses may be applicable)
* Does the request body match the requirements?
  * Validate that the event category and action match the specification
  * Validate that all the required contextual data for the given event category/action are present
* Validate that the Client-Side Eventing Guidelines are adhered to

## Search S3 Bucket

There are various tools available to scan through S3 contents.

TODO: Document S3 searching
