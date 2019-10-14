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

import {Inject, Injectable, InjectionToken, OnDestroy, Type} from '@angular/core';
import {CafeEnvironmentService} from '@cafe/cafe-environment';
import {combineLatest, forkJoin, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {v4 as uuidv4} from 'uuid';
import * as ld from 'lodash';
import {ActivatedRoute, Data, NavigationEnd, ParamMap, PRIMARY_OUTLET, Router} from '@angular/router';
import {map, take} from 'rxjs/operators';
import {CafeClient, EventingConfiguration, EventingOptions, RequiredEventingOptions} from '@cafe/cafe-client';
import {ClientEventing} from '@cafe/cafe-model';

const _ = ld;

export const CAFE_EVENTING_CONFIGURATION = new InjectionToken('CAFE_EVENTING_CONFIGURATION');
export const CAFE_EVENTING_CATEGORY_NAME = 'eventingCategoryName';
export const CAFE_EVENTING_ACTION_NAME = 'eventingActionName';
export const CAFE_EVENTING_TAGS = 'eventingTags';
export const CAFE_EVENTING_TAG_PARAMETERS = 'eventingTagParameters';

export const CAFE_ERROR_LOGGING_API_KEY = 'errorLoggingApiKey';
export const CAFE_EVENTING_ENDPOINT = 'eventingEndpoint';

export enum UrlSource {
  // noinspection JSUnusedGlobalSymbols
  WINDOW_LOCATION,
  // noinspection JSUnusedGlobalSymbols
  ROUTER_URL
}

export interface AngularEventingOptions extends EventingOptions {
  urlSource?: UrlSource;
  routeMapper?: (Router, string) => Promise<RouterEventInformation>;
  recordRoutingNavigation?: boolean;
}

export interface AngularRequiredEventingOptions extends AngularEventingOptions {
  urlSource: UrlSource;
  routeMapper: (Router, string) => Promise<RouterEventInformation>;
  recordRoutingNavigation: boolean;
}

export class AngularDefaultEventingOptions implements AngularRequiredEventingOptions, RequiredEventingOptions {

  productEnvironment: ClientEventing.Environment;
  productPlatform: ClientEventing.ProductPlatform;
  hostPlatform: ClientEventing.ProductPlatform;
  hostEnvironment: ClientEventing.Environment;
  userPlatform: ClientEventing.UserPlatform;
  userEnvironment: ClientEventing.Environment;
  eventingEndpoint: string;
  apiKey: string;
  bufferInterval: number;
  maxBufferSize: number;
  profileSubmissionDelay: number;
  useNativeResolution: boolean;
  useBrowserGeoLocation: boolean;
  fetchIpAddress: boolean;
  recordViewingTime: boolean;
  recordViewingTimeWhenWindowNotVisible: boolean;
  recordViewingTimeByUrl: boolean;
  recordViewingTimeContiguously: boolean;
  viewingTimeCheckInterval: number;
  viewingTimeRecordInterval: number;
  viewingTimeRecordCategory: string;
  attemptCompletionOnClose: boolean;
  installOnUnloadHandler: boolean;
  installOnErrorHandler: boolean;
  logErrorsToService: boolean;
  urlScrubber?: (string) => string;
  urlSource: UrlSource;
  routeMapper: (Router, string) => Promise<RouterEventInformation>;
  recordRoutingNavigation: boolean;

  constructor(
    {
      productPlatform,
      productEnvironment = null,
      eventingEndpoint = null,
      apiKey = null,
      hostPlatform,
      hostEnvironment,
      userPlatform,
      userEnvironment,
      bufferInterval = 60000,
      maxBufferSize = 100,
      profileSubmissionDelay = 5000,
      useNativeResolution = false,
      useBrowserGeoLocation = false,
      fetchIpAddress = false,
      recordViewingTime = false,
      recordViewingTimeWhenWindowNotVisible = false,
      recordViewingTimeByUrl = false,
      recordViewingTimeContiguously = false,
      viewingTimeCheckInterval = 5000,
      viewingTimeRecordInterval = 60000,
      viewingTimeRecordCategory = 'VIEWING_TIME',
      attemptCompletionOnClose = true,
      installOnUnloadHandler = false,
      installOnErrorHandler = false,
      logErrorsToService = false,
      urlScrubber = CafeClient.defaultUrlScrubber,
      urlSource = UrlSource.WINDOW_LOCATION,
      routeMapper = CafeAngularClientService.defaultRouteMapper,
      recordRoutingNavigation = true,
    }: AngularEventingOptions
  ) {
    this.productPlatform = productPlatform;
    this.productEnvironment = productEnvironment;
    this.eventingEndpoint = eventingEndpoint;
    this.hostEnvironment = hostEnvironment;
    this.hostPlatform = hostPlatform;
    this.userEnvironment = userEnvironment;
    this.userPlatform = userPlatform;
    this.apiKey = apiKey;
    this.bufferInterval = bufferInterval;
    this.maxBufferSize = maxBufferSize;
    this.profileSubmissionDelay = profileSubmissionDelay;
    this.useNativeResolution = useNativeResolution;
    this.useBrowserGeoLocation = useBrowserGeoLocation;
    this.fetchIpAddress = fetchIpAddress;
    this.recordViewingTime = recordViewingTime;
    this.recordViewingTimeWhenWindowNotVisible = recordViewingTimeWhenWindowNotVisible;
    this.viewingTimeCheckInterval = viewingTimeCheckInterval;
    this.viewingTimeRecordInterval = viewingTimeRecordInterval;
    this.viewingTimeRecordCategory = viewingTimeRecordCategory;
    this.recordViewingTimeByUrl = recordViewingTimeByUrl;
    this.recordViewingTimeContiguously = recordViewingTimeContiguously;
    this.attemptCompletionOnClose = attemptCompletionOnClose;
    this.installOnUnloadHandler = installOnUnloadHandler;
    this.installOnErrorHandler = installOnErrorHandler;
    this.logErrorsToService = logErrorsToService;
    this.urlSource = urlSource;
    this.routeMapper = routeMapper;
    this.recordRoutingNavigation = recordRoutingNavigation;
    this.urlScrubber = urlScrubber;
  }

}

export class AngularDefaultEventingConfiguration implements EventingConfiguration {

  constructor(
    private options: AngularEventingOptions,
    private httpClient: HttpClient,
    private router: Router,
    private environmentService: CafeEnvironmentService,
  ) {
  }

  get productEnvironment(): ClientEventing.Environment {
    return this.options.productEnvironment || <ClientEventing.Environment>this.environmentService.environmentName;
  }

  get productPlatform(): ClientEventing.ProductPlatform {
    return this.options.productPlatform;
  }

  get eventingEndpoint(): string {
    return this.options.eventingEndpoint || this.environmentService.getEnvironmentSetting(CAFE_EVENTING_ENDPOINT);
  }

  get apiKey(): string {
    return this.options.apiKey || this.environmentService.getEnvironmentSetting(CAFE_ERROR_LOGGING_API_KEY);
  }

  get bufferInterval(): number {
    return this.options.bufferInterval;
  }

  get maxBufferSize(): number {
    return this.options.maxBufferSize;
  }

  get profileSubmissionDelay(): number {
    return this.options.profileSubmissionDelay;
  }

  get useNativeResolution(): boolean {
    return this.options.useNativeResolution;
  }

  get useBrowserGeoLocation(): boolean {
    return this.options.useBrowserGeoLocation;
  }

  get fetchIpAddress(): boolean {
    return this.options.fetchIpAddress;
  }

  get recordViewingTime(): boolean {
    return this.options.recordViewingTime;
  }

  get recordViewingTimeWhenWindowNotVisible(): boolean {
    return this.options.recordViewingTimeWhenWindowNotVisible;
  }

  get recordViewingTimeByUrl(): boolean {
    return this.options.recordViewingTimeByUrl;
  }

  get recordViewingTimeContiguously(): boolean {
    return this.options.recordViewingTimeContiguously;
  }

  get viewingTimeCheckInterval(): number {
    return this.options.viewingTimeCheckInterval;
  }

  get viewingTimeRecordInterval(): number {
    return this.options.viewingTimeRecordInterval;
  }

  get viewingTimeRecordCategory(): string {
    return this.options.viewingTimeRecordCategory;
  }

  get attemptCompletionOnClose(): boolean {
    return this.options.attemptCompletionOnClose;
  }

  get installOnUnloadHandler(): boolean {
    return this.options.installOnUnloadHandler;
  }

  get installOnErrorHandler(): boolean {
    return this.options.installOnErrorHandler;
  }

  get logErrorsToService(): boolean {
    return this.options.logErrorsToService;
  }

  get urlScrubber(): (string) => string {
    return this.options.urlScrubber;
  }

  get hostPlatform(): ClientEventing.ProductPlatform {
    return this.options.hostPlatform;
  }

  get hostEnvironment(): ClientEventing.Environment {
    return this.options.hostEnvironment;
  }

  get userPlatform(): ClientEventing.UserPlatform {
    return this.options.userPlatform;
  }

  get userEnvironment(): ClientEventing.Environment {
    return this.options.userEnvironment;
  }

  getIpAddress(endpoint: string): Observable<ClientEventing.Ip> {
    return this.httpClient.get<ClientEventing.Ip>(`${this.eventingEndpoint}/ip`, {headers: {'x-api-key': this.apiKey}});
  }

  sendLogRecords(endpoint: string, logRecords: ClientEventing.LogRecords): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, logRecords, {'x-api-key': this.apiKey});
  }

  sendProfileRecords(endpoint: string, profileRecords: ClientEventing.ProfileRecords): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, profileRecords, {'x-api-key': this.apiKey});
  }

  sendActivityRecords(endpoint: string, activityRecords: ClientEventing.ActivityRecords): Observable<ClientEventing.SubmissionResponse> {
    return this.post(endpoint, activityRecords, {'x-api-key': this.apiKey});
  }

  currentUrl(): string {
    if (this.options.urlSource === UrlSource.ROUTER_URL) {
      return this.router.url;
    }
    return window.location.href;
  }

  // noinspection JSMethodCanBeStatic
  uuid(): string {
    return uuidv4();
  }

  private post<T>(endpoint: string, body: any, headers: { [s: string]: string } = {}): Observable<T> {
    return this.httpClient.post<T>(
      endpoint,
      body,
      {
        headers: headers
      }
    );
  }

}

export interface RouterEventInformation {
  category: string;
  action: string;
  tags: ClientEventing.ActivityTag[];
}

@Injectable({
  providedIn: 'root'
})
export class CafeAngularClientService extends CafeClient implements OnDestroy {

  private readonly localEnvironmentOptions: AngularRequiredEventingOptions;

  constructor(
    private environmentService: CafeEnvironmentService,
    @Inject(CAFE_EVENTING_CONFIGURATION) environmentOptions: AngularEventingOptions,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    super(new AngularDefaultEventingConfiguration(
      new AngularDefaultEventingOptions(environmentOptions),
      httpClient,
      router,
      environmentService
    ));
    this.localEnvironmentOptions = new AngularDefaultEventingOptions(environmentOptions);
    if (this.localEnvironmentOptions.recordRoutingNavigation) {
      this.subscriptions.push(router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.localEnvironmentOptions.routeMapper(router, event.urlAfterRedirects)
            .then(
              routeInfo => {
                this.recordActivity({
                  eventCategory: routeInfo.category || 'ROUTER_NAVIGATION',
                  eventAction: routeInfo.action || 'UNKNOWN',
                  tags: routeInfo.tags || []
                });
              },
              error => {
                console.error(error);
              }
            );
        }
      }));
    }
  }

  static defaultRouteMapper(router: Router, ignoredUrl: string): Promise<RouterEventInformation> {
    let primaryOutlet: string;
    if (router && router.routerState && router.routerState.root) {
      const ar = CafeAngularClientService.findPrimaryOutlet(router.routerState.root);
      if (ar) {
        if (ar.component) {
          if (ar.component instanceof Type) {
            primaryOutlet = (
              ar.component as Type<any>
            ).name;
          } else {
            primaryOutlet = `${ar.component}`;
          }
        }
        return combineLatest(
          forkJoin(ar.pathFromRoot.map(a => a.data.pipe(take(1)))),
          forkJoin(ar.pathFromRoot.map(a => a.paramMap.pipe(take(1))))
        ).pipe(
          map(
            (input: [Data[], ParamMap[]]) => {
              let category = 'ROUTER_NAVIGATION';
              let action = primaryOutlet;
              const tags: ClientEventing.ActivityTag[] = [];
              const tagParameters: string[] = [];
              input[0]
                .forEach(
                  data => {
                    if (data[CAFE_EVENTING_CATEGORY_NAME]) {
                      category = data[CAFE_EVENTING_CATEGORY_NAME];
                    }
                    if (data[CAFE_EVENTING_ACTION_NAME]) {
                      action = data[CAFE_EVENTING_ACTION_NAME];
                    }
                    if (data[CAFE_EVENTING_TAGS]) {
                      tags.push.apply(tags, data[CAFE_EVENTING_TAGS]);
                    }
                    if (data[CAFE_EVENTING_TAG_PARAMETERS]) {
                      tagParameters.push.apply(tagParameters, data[CAFE_EVENTING_TAG_PARAMETERS]);
                    }
                  }
                );
              const concatenatedTags: { [s: string]: ClientEventing.ActivityTag } = {};
              tags
                .forEach(
                  tag => {
                    concatenatedTags[tag.key] = tag;
                  }
                );
              if (input[1] && input[1].length > 0) {
                input[1]
                  .forEach(
                    paramMap => {
                      paramMap.keys
                        .filter(key => {
                          return tagParameters.indexOf(key) >= 0;
                        })
                        .forEach(
                          key => {
                            if (paramMap.has(key)) {
                              concatenatedTags[key] = {key: key, value: paramMap.get(key)};
                            }
                          }
                        );
                    }
                  );
              }
              return {
                category: category,
                action: action,
                tags: _.values(concatenatedTags)
              };
            }
          )
        )
          .toPromise();
      }
    }
    return of({category: 'ROUTER_NAVIGATION', action: primaryOutlet, tags: []}).toPromise();
  }

  static findPrimaryOutlet(ar: ActivatedRoute): ActivatedRoute {
    if (ar) {
      if (ar.children && ar.children.length > 0) {
        const foundArc = ar.children.find(arc => !!this.findPrimaryOutlet(arc));
        if (foundArc) {
          return this.findPrimaryOutlet(foundArc);
        }
      } else if (ar.outlet && ar.outlet === PRIMARY_OUTLET && ar.component) {
        return ar;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    super.cleanup();
  }

}
