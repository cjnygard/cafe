---
title: "Endpoints"
metaTitle: "CAFe API Endpoints"
metaDescription: "Details and examples of using CAFe API endpoints"
---

# Product Platform Access Keys

To call the backend analytic endpoints, an API key must be supplied via an "x-api-key" header.

Each platform integrating against these endpoints will need to obtain API Keys for accessing the backend API.

# POST /activity

## Schema JSON

```json
{
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "records": {
            "type": "array",
            "minItems": 1,
            "maxItems": 500,
            "items": {
                "$ref": "https://cafe.example.com/v1/schema/activity"
            }
        }
    },
    "required": [
        "records"
    ],
    "additionalProperties": false
}
```

## Sample Request

```json
{
   "records": [
      {
         "messageFormatVersion": 1,
         "messageType": "ClientEventingActivity",
         "eventTime": "2019-01-21T13:09:07.049+05:30",
         "productEnvironment": "monitoring",
         "productPlatform": "analytics-portal",
         "sessionId": "5f064ec0-c58c-4165-98f2-0e0a08a13bd1",
         "eventId": "f3ee29e2-3490-4941-b8e6-50f44ea8261f",
         "eventCategory": "GET_REPORT",
         "eventAction": "GET_REPORT",
         "userSSOGUID": "af93d8a7e39f4680:-289a30c1:166e535a6fc:-10c2",
         "eventUri": "https://analytics-portal.example.com/",
         "tags":[
            {
               "key": "reportType",
               "value": "reportType:risk-assessment:ui:v1"
            },
            {
               "key": "reportUri",
               "value": "report:risk-assessment:all"
            }
         ]
      }
   ]
}
```

## Sample CURL

```bash
curl -X POST "https://cafe.example.com/v1/activity" \
    -H  "accept: application/json" \
    -H  "x-api-key: VTwgEDNQDHnM8XFYx2eJckeou49MYfyZkc9mTDgW" \
    -H  "Content-Type: application/json" \
    -d '{"records":[{"messageFormatVersion":1,"messageType":"ClientEventingActivity","eventTime":"2019-01-21T13:09:07.049+05:30","productEnvironment":"monitoring","productPlatform":"analytics-portal","sessionId":"5f064ec0-c58c-4165-98f2-0e0a08a13bd1","eventId":"f3ee29e2-3490-4941-b8e6-50f44ea8261f","eventCategory":"GET_REPORT","eventAction":"GET_REPORT","userSSOGUID":"af93d8a7e39f4680:-289a30c1:166e535a6fc:-10c2","eventUri":"https://analytics-portal.example.com/","tags":[{"key":"reportType","value":"reportType:risk-assessment:ui:v1"},{"key":"reportUri","value":"report:risk-assessment:all"}]}]}'
``` 

# GET /ip

## Result Schema JSON

```json
{
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "ip": {
            "anyOf": [
                {
                    "format": "ipv4",
                    "type": "string"
                },
                {
                    "format": "ipv6",
                    "type": "string"
                }
            ]
        }
    },
    "required": [
        "ip"
    ],
    "additionalProperties": false
}
```

## Sample CURL

```bash
curl 'https://cafe.example.com/v1/ip' \
    -H 'Accept: application/json, text/plain, */*' \
    -H 'x-api-key: VTwgEDNQDHnM8XFYx2eJckeou49MYfyZkc9mTDgW'
```

# POST /log

## Schema JSON

```json
{
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "records": {
            "type": "array",
            "minItems": 1,
            "maxItems": 500,
            "items": {
                "$ref": "https://cafe.example.com/v1/schema/log"
            }
        }
    },
    "required": [
        "records"
    ],
    "additionalProperties": false
}
```

## Sample Request

```javascript
{
   "records": [
      {
         "messageFormatVersion": 1,
         "messageType": "ClientEventingLog",
         "logTime": "2019-01-21T13:09:07.049+05:30",
         "productEnvironment": "monitoring",
         "productPlatform": "analytics-portal",
         "sessionId": "5f064ec0-c58c-4165-98f2-0e0a08a13bd1",
         "logLevel": "Debug",
         "logMessage": "THIS IS A DEBUG MESSAGE",
         "eventUri": "https://analytics-portal.example.com/"
      }
   ]
}
```

## Sample CURL

```bash
curl 'https://cafe.example.com/v1/log'  \
    -H 'Accept: application/json'  \
    -H 'x-api-key: VTwgEDNQDHnM8XFYx2eJckeou49MYfyZkc9mTDgW'  \
    -H 'Content-Type: application/json'  \
    --data '{"records":[{"messageFormatVersion":1,"messageType":"ClientEventingLog","logTime":"2019-01-21T13:09:07.049+05:30","productEnvironment":"monitoring","productPlatform":"analytics-portal","sessionId":"5f064ec0-c58c-4165-98f2-0e0a08a13bd1","logLevel":"Debug","logMessage":"THIS IS A DEBUG MESSAGE","eventUri":"https://analytics-portal.example.com/"}]}'
```

# POST /profile

## Schema JSON

```json
{
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "records": {
            "type": "array",
            "minItems": 1,
            "maxItems": 500,
            "items": {
                "$ref": "https://cafe.example.com/v1/schema/profile"
            }
        }
    },
    "required": [
        "records"
    ],
    "additionalProperties": false
}
```


## Sample Request

```json
{
   "records": [
      {
         "messageFormatVersion": 1,
         "messageType": "ClientEventingProfile",
         "productEnvironment": "monitoring",
         "productPlatform": "analytics-portal",
         "sessionId": "853c6b4e-382d-470d-b3aa-3552907d2c59",
         "eventTime": "2019-01-21T11: 54: 37.805-08: 00",
         "platform": {
            "userAgentString": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv: 64.0) Gecko/20100101 Firefox/64.0",
            "browserFingerprint": "d83849b0aac5eb545cb4c304493b8740",
            "browserName": "Firefox",
            "browserVersion": "64.0",
            "osName": "macOS",
            "osVersion": "10.13",
            "engineName": "Gecko",
            "platformType": "desktop",
            "platformVendor": "Apple",
            "language": "en-US",
            "screenResolution": {
               "width": 3008,
               "height": 1692
            }
         },
         "location": {
            "timeZone": "America/Los_Angeles",
            "ipAddress": "204.98.74.133"
         }
      }
   ]
}
```

## Sample CURL

```bash
curl 'https://cafe.example.com/v1/profile'  \
    -H 'Accept: application/json'  \
    -H 'x-api-key: VTwgEDNQDHnM8XFYx2eJckeou49MYfyZkc9mTDgW'  \
    -H 'Content-Type: application/json'  \
    --data '{"records":[{"messageFormatVersion":1,"messageType":"ClientEventingProfile","productEnvironment":"monitoring","productPlatform":"analytics-portal","sessionId":"853c6b4e-382d-470d-b3aa-3552907d2c59","eventTime":"2019-01-21T11:54:37.805-08:00","platform":{"userAgentString":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:64.0) Gecko/20100101 Firefox/64.0","browserFingerprint":"d83849b0aac5eb545cb4c304493b8740","browserName":"Firefox","browserVersion":"64.0","osName":"macOS","osVersion":"10.13","engineName":"Gecko","platformType":"desktop","platformVendor":"Apple","language":"en-US","screenResolution":{"width":3008,"height":1692}},"location":{"timeZone":"America/Los_Angeles","ipAddress":"204.98.74.133"}}]}'
```
