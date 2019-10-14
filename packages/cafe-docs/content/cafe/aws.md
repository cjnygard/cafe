---
title: "AWS"
metaTitle: "CAFe AWS API Gateway"
metaDescription: "AWS API Gateway implementation via CloudFormation"
---

# AWS API Gateway

A complete example implementation of the API Gateway in AWS CloudFormation exists in the ./packages/cloudformation directory.

The implementation accepts input via the API Endpoints, and uses AWS Firehose to save the data into an S3 bucket.

## CloudFormation Config

The following parameters can be configured in the CloudFormation setup.

###  stageName

Name of the stage being deployed.

### apiLogLevel:

Level of CloudWatch logging for API calls (OFF INFO ERROR)

### bucketName:

Name of the bucket to store the event files

### logBucketName:

Name of the bucket to store the event files

### firehoseBufferSize:

Size (in MB) of firehose internal cache before writing to S3

### firehoseBufferTimeout:

Time (in sec) before firehose internal cache is written to S3

## CloudFormation Outputs

### cafeUrl:

URL of the CAFe API Gateway.

### cafeApiKeyId:

Id of the API Key for accessing API Gateway.
You must use the AWS console to discover the actual API Gateway key.  


## Demo Operation

Configure the CAFe API Gateway URL in the DEFAULT_ENVIRONMENT_DATA located in `./packages/cafe-environment/cafe-environment.service.ts`

Configure the CAFe API Gateway key in the `./packages/demo/src/app/app.module.ts` file as the `errorLoggingApiApiKey`


