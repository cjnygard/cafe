// Copyright 2019 Cengage Learning, Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// End license text.

import { EventingConfiguration, EventingOptions, RequiredEventingOptions } from './cafe-interfaces';
import {ClientEventing} from '@cafe/cafe-model';
import { from, Observable } from 'rxjs';
import * as uuid from 'uuid';
import * as ld from 'lodash';
import {CafeDefaultProviders} from './cafe-default-providers';

const _ = ld;

const OneMinute = 60000;
const DefaultMaxBufferSize = 100;
const FiveSeconds = 5000;
const SuccessfulStatus = 200;

// noinspection JSUnusedGlobalSymbols
export class DefaultEventingConfiguration implements EventingConfiguration, RequiredEventingOptions {
  readonly productPlatform: ClientEventing.ProductPlatform;
  readonly productEnvironment: ClientEventing.Environment;
  readonly hostPlatform?: ClientEventing.ProductPlatform;
  readonly hostEnvironment?: ClientEventing.Environment;
  readonly userPlatform?: ClientEventing.UserPlatform;
  readonly userEnvironment?: ClientEventing.Environment;
  readonly eventingEndpoint: string;
  readonly apiKey: string;
  readonly bufferInterval: number;
  readonly maxBufferSize: number;
  readonly profileSubmissionDelay: number;
  readonly useNativeResolution: boolean;
  readonly useBrowserGeoLocation: boolean;
  readonly fetchIpAddress: boolean;
  readonly recordViewingTime: boolean;
  readonly recordViewingTimeWhenWindowNotVisible: boolean;
  readonly recordViewingTimeByUrl: boolean;
  readonly recordViewingTimeContiguously: boolean;
  readonly viewingTimeCheckInterval: number;
  readonly viewingTimeRecordInterval: number;
  readonly viewingTimeRecordCategory: string;
  readonly attemptCompletionOnClose: boolean;
  readonly installOnUnloadHandler: boolean;
  readonly installOnErrorHandler: boolean;
  readonly logErrorsToService: boolean;
  readonly urlScrubber: (url: string) => string;
  readonly urlProvider: () => string;

  // noinspection JSUnusedGlobalSymbols
  constructor({
    productEnvironment,
    productPlatform,
    hostPlatform,
    hostEnvironment,
    userPlatform,
    userEnvironment,
    apiKey,
    eventingEndpoint,
    bufferInterval = OneMinute,
    maxBufferSize = DefaultMaxBufferSize,
    profileSubmissionDelay = FiveSeconds,
    useNativeResolution = false,
    useBrowserGeoLocation = false,
    fetchIpAddress = false,
    recordViewingTime = false,
    recordViewingTimeWhenWindowNotVisible = false,
    recordViewingTimeByUrl = false,
    recordViewingTimeContiguously = false,
    viewingTimeCheckInterval = FiveSeconds,
    viewingTimeRecordInterval = OneMinute,
    viewingTimeRecordCategory = 'VIEWING_TIME',
    attemptCompletionOnClose = true,
    installOnUnloadHandler = false,
    installOnErrorHandler = false,
    logErrorsToService = false,
    urlScrubber = CafeDefaultProviders.defaultUrlScrubber,
    urlProvider = CafeDefaultProviders.defaultUrlProvider,
  }: EventingOptions) {
    if (!productEnvironment) {
      throw new Error('productEnvironment must be specified');
    }
    if (!productPlatform) {
      throw new Error('productPlatform must be specified');
    }
    if (!eventingEndpoint) {
      throw new Error('eventingEndpoint must be specified');
    }
    if (!apiKey) {
      throw new Error('apiKey must be specified');
    }
    this.productEnvironment = productEnvironment;
    this.productPlatform = productPlatform;
    this.hostEnvironment = hostEnvironment;
    this.hostPlatform = hostPlatform;
    this.userEnvironment = userEnvironment;
    this.userPlatform = userPlatform;
    this.eventingEndpoint = eventingEndpoint;
    this.apiKey = apiKey;
    this.bufferInterval = bufferInterval;
    this.maxBufferSize = maxBufferSize;
    this.profileSubmissionDelay = profileSubmissionDelay;
    this.useNativeResolution = useNativeResolution;
    this.useBrowserGeoLocation = useBrowserGeoLocation;
    this.fetchIpAddress = fetchIpAddress;
    this.recordViewingTime = recordViewingTime;
    this.recordViewingTimeWhenWindowNotVisible = recordViewingTimeWhenWindowNotVisible;
    this.recordViewingTimeByUrl = recordViewingTimeByUrl;
    this.recordViewingTimeContiguously = recordViewingTimeContiguously;
    this.viewingTimeCheckInterval = viewingTimeCheckInterval;
    this.viewingTimeRecordInterval = viewingTimeRecordInterval;
    this.viewingTimeRecordCategory = viewingTimeRecordCategory;
    this.attemptCompletionOnClose = attemptCompletionOnClose;
    this.installOnUnloadHandler = installOnUnloadHandler;
    this.installOnErrorHandler = installOnErrorHandler;
    this.logErrorsToService = logErrorsToService;
    this.urlScrubber = urlScrubber;
    this.urlProvider = urlProvider;
  }

  getIpAddress(endpoint: string): Observable<ClientEventing.Ip> {
    return from(
      new Promise<ClientEventing.Ip>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === SuccessfulStatus) {
              resolve(JSON.parse(xhr.response as string) as ClientEventing.Ip);
            } else {
              reject(xhr.response);
            }
          }
        };
        xhr.open('GET', endpoint, true);
        xhr.setRequestHeader('x-api-key', this.apiKey);
        xhr.send();
      })
    );
  }

  sendLogRecords(
    endpoint: string,
    logRecords: ClientEventing.LogRecords
  ): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, logRecords, { 'x-api-key': this.apiKey });
  }

  sendProfileRecords(
    endpoint: string,
    profileRecords: ClientEventing.ProfileRecords
  ): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, profileRecords, { 'x-api-key': this.apiKey });
  }

  sendActivityRecords(
    endpoint: string,
    activityRecords: ClientEventing.ActivityRecords
  ): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, activityRecords, { 'x-api-key': this.apiKey });
  }

  currentUrl(): string {
    return this.urlProvider();
  }

  uuid(): string {
    return uuid.v4();
  }

  private post<T>(endpoint: string, body: {}, headers: { [s: string]: string } = {}): Observable<T> {
    return from(
      new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === SuccessfulStatus) {
              resolve(JSON.parse(xhr.response as string) as T);
            } else {
              reject(xhr.response);
            }
          }
        };
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        _.forEach(headers, (v, k) => xhr.setRequestHeader(k, v));
        xhr.send(JSON.stringify(body));
      })
    );
  }
}
