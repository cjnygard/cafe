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


import * as bowser from 'bowser';
import * as Fingerprint2 from 'fingerprintjs2';
import * as ld from 'lodash';
import { interval, merge, Subject, Subscription, timer } from 'rxjs';
import { bufferCount } from 'rxjs/operators';
import {
  ActivityRecordParameters,
  EventingConfiguration,
  GlobalContext,
  RequiredEventingOptions,
  ViewingTime,
} from './cafe-interfaces';
import { ClientEventing } from '@cafe/cafe-model';
import moment from 'moment';

const _ = ld;

const maxIpAddressLength = 64;

// noinspection JSUnusedGlobalSymbols
export class CafeClient {
  protected readonly sessionId: string;
  protected globalContext: GlobalContext = {};
  protected readonly subscriptions: Subscription[] = [];
  protected loggingEnabled = true;
  protected bufferNotifier: Subject<boolean>;

  // accumulated data
  // noinspection JSMismatchedCollectionQueryUpdate
  protected activities: ClientEventing.Activity[] = [];
  // noinspection JSMismatchedCollectionQueryUpdate
  protected viewingTime: ViewingTime[] = [];

  constructor(protected environmentOptions: EventingConfiguration & RequiredEventingOptions) {
    this.sessionId = this.environmentOptions.uuid();
    this.bufferNotifier = new Subject();
    const activityInterval = interval(this.environmentOptions.bufferInterval);
    const activityObservable = merge(
      activityInterval,
      this.bufferNotifier.pipe(bufferCount(this.environmentOptions.maxBufferSize))
    );
    this.subscriptions.push(
      activityObservable.subscribe((ignoredNumber) => {
        const activityRecords = this.drainAccumulatedActivityRecords();
        this.publishActivities(activityRecords);
      })
    );
    const profileTimer = timer(this.environmentOptions.profileSubmissionDelay);
    this.subscriptions.push(profileTimer.subscribe((ignoredNumber) => this.publishProfile(ignoredNumber)));
    if (this.environmentOptions.recordViewingTime) {
      const viewingTimeStream = interval(this.environmentOptions.viewingTimeCheckInterval);
      this.subscriptions.push(
        viewingTimeStream.subscribe((ignoredNumber) => {
          this.viewingTime.push({
            time: this.environmentOptions.viewingTimeCheckInterval,
            timestamp: new Date(),
            url: this.environmentOptions.currentUrl(),
            focused: document.hasFocus(),
            visible: !document.hidden,
          });
        })
      );
      const viewingTimeRecordStream = interval(this.environmentOptions.viewingTimeRecordInterval);
      this.subscriptions.push(
        viewingTimeRecordStream.subscribe((ignoredNumber) => {
          this.recordAccumulatedViewingTime();
        })
      );
    }
    if (this.environmentOptions.installOnUnloadHandler) {
      (window as Window).addEventListener('beforeunload', this.flush);
    }
    if (this.environmentOptions.installOnErrorHandler) {
      const oldHandler = (window as Window).onerror;
      (window as Window).onerror = (msg, url, line, col, error) => {
        this.logError(error || msg);
        if (oldHandler) {
          oldHandler(msg, url, line, col, error);
        }
      };
    }
  }

  flush(): void {
    if (this.environmentOptions.attemptCompletionOnClose) {
      this.recordAccumulatedViewingTime();
      this.recordActivity({
        eventCategory: 'UNLOAD',
        eventAction: 'UNLOAD',
      });
      const activityRecords = this.drainAccumulatedActivityRecords();
      if (activityRecords.records.length > 0) {
        this.sendRecordsOnUnload(activityRecords);
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  setGlobalContext(globalContext: GlobalContext): void {
    this.globalContext = globalContext;
  }

  recordActivity({
    eventCategory,
    eventAction,
    userId,
    eventDuration,
    url = this.currentUrl(),
    tags = [],
    eventDate = new Date(),
  }: ActivityRecordParameters): void {
    const concatenatedTags: { [s: string]: ClientEventing.ActivityTag } = {};
    if (this.globalContext && this.globalContext.tags) {
      this.globalContext.tags.forEach((t) => (concatenatedTags[t.key] = t));
    }
    if (tags) {
      tags.forEach((t) => (concatenatedTags[t.key] = t));
    }
    this.activities.push({
      messageFormatVersion: 1,
      messageType: 'ClientEventingActivity',
      eventTime: this.getDateString(eventDate),
      eventDuration: eventDuration || undefined,
      productEnvironment: this.getProductEnvironment(),
      productPlatform: this.getProductPlatform(),
      hostEnvironment: this.getHostEnvironment(),
      hostPlatform: this.getHostPlatform(),
      userEnvironment: this.getUserEnvironment(),
      userPlatform: this.getUserPlatform(),
      sessionId: this.sessionId,
      eventId: this.environmentOptions.uuid(),
      eventCategory,
      eventAction,
      userId: userId || this.globalContext.userId,
      eventUri: this.environmentOptions.urlScrubber ? this.environmentOptions.urlScrubber(url) : url,
      tags: _.values(concatenatedTags),
    });
    this.bufferNotifier.next(true);
  }

  // noinspection JSUnusedGlobalSymbols
  logError(error: any) {
    if (this.loggingEnabled) {
      let errorMessage = `${error}`;
      if (error.trace) {
        errorMessage = `${errorMessage}\n${error.trace}`;
      } else {
        errorMessage = `${errorMessage}\n${this.getStackTrace()}`;
      }
      const logRecords: ClientEventing.LogRecords = {
        records: [
          {
            messageFormatVersion: 1,
            messageType: 'ClientEventingLog',
            productPlatform: this.getProductPlatform(),
            productEnvironment: this.getProductEnvironment(),
            sessionId: this.sessionId,
            eventUri: this.environmentOptions.urlScrubber
              ? this.environmentOptions.urlScrubber(this.currentUrl())
              : this.currentUrl(),
            logTime: this.getDateString(),
            logLevel: 'Error',
            logMessage: errorMessage,
          },
        ],
      };
      this.environmentOptions.sendLogRecords(this.logEndpoint(), logRecords).subscribe(
        (response: ClientEventing.SubmissionResponse) => {
          if (response.failedRequests > 0) {
            console.error(`Failed to send ${response.failedRequests} events out of ${logRecords.records.length}.`);
            response.individualStatus.filter((rs: any) => rs.errorMessage).forEach((rs: any) => console.error(rs));
          }
        },
        (er: any) => {
          console.error('Failed to send error log data');
          console.error(er);
          this.loggingEnabled = false;
        }
      );
    }
  }

  // noinspection JSUnusedGlobalSymbols
  cleanup(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected sendRecordsOnUnload(activityRecords: ClientEventing.ActivityRecords) {
    const request = new XMLHttpRequest();
    request.open('POST', this.activityEndpoint(), false); // `false` makes the request synchronous
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.setRequestHeader('x-api-key', this.environmentOptions.apiKey);
    request.send(JSON.stringify(activityRecords));
  }

  protected getStackTrace(): any {
    const obj: any = {};
    Error.captureStackTrace(obj, this.getStackTrace);

    return obj.stack;
  }

  protected currentUrl(): string {
    return this.environmentOptions.currentUrl();
  }

  protected drainAccumulatedActivityRecords(): ClientEventing.ActivityRecords {
    const currentActivities = this.activities;
    this.activities = [];

    return { records: currentActivities };
  }

  protected recordAccumulatedViewingTime() {
    const events = this.viewingTime;
    this.viewingTime = [];
    if (this.environmentOptions.recordViewingTime && events.length > 0) {
      const records: ActivityRecordParameters[] = [];
      events.forEach((e) => {
        if (this.environmentOptions.recordViewingTimeWhenWindowNotVisible || e.visible) {
          let appendRecord = records.length !== 0;
          if (appendRecord) {
            const lr = records[records.length - 1];
            // @ts-ignore
            appendRecord = `${e.focused}` === lr.tags[0].value && `${e.visible}` === lr.tags[1].value;
            if (appendRecord) {
              appendRecord = !this.environmentOptions.recordViewingTimeByUrl || lr.url === e.url;
              if (appendRecord) {
                const oneHundredAndNinetyPercent = 1.9;
                appendRecord =
                  !this.environmentOptions.recordViewingTimeContiguously ||
                  // @ts-ignore
                  e.timestamp.getTime() - lr.eventDate.getTime() <
                    oneHundredAndNinetyPercent * this.environmentOptions.viewingTimeCheckInterval;
              }
            }
          }
          if (appendRecord) {
            const lastRecord = records[records.length - 1];
            lastRecord.eventDate = e.timestamp;
            // @ts-ignore
            lastRecord.eventDuration = lastRecord.eventDuration + e.time;
            lastRecord.url = e.url;
          } else {
            records.push({
              eventCategory: this.environmentOptions.viewingTimeRecordCategory,
              eventAction: this.environmentOptions.viewingTimeRecordCategory,
              eventDuration: e.time,
              url: e.url,
              tags: [{ key: 'focused', value: `${e.focused}` }, { key: 'visible', value: `${e.visible}` }],
              eventDate: e.timestamp,
            });
          }
        }
      });
      records.forEach((r) => {
        this.recordActivity(r);
      });
    }
  }

  protected publishActivities(activityRecords: ClientEventing.ActivityRecords): void {
    if (activityRecords && activityRecords.records.length > 0) {
      this.environmentOptions.sendActivityRecords(this.activityEndpoint(), activityRecords).subscribe(
        (response: ClientEventing.SubmissionResponse) => {
          if (response.failedRequests > 0) {
            console.error(`Failed to send ${response.failedRequests} events out of ${activityRecords.records.length}.`);
            response.individualStatus.filter((rs: any) => rs.errorMessage).forEach((rs: any) => console.error(rs));
          }
        },
        (error: any) => {
          console.error('Failed to send event stream data');
          console.error(error);
        }
      );
    }
  }

  protected activityEndpoint() {
    return `${this.getEndpoint()}/activity`;
  }

  protected logEndpoint() {
    return `${this.getEndpoint()}/log`;
  }

  protected getEndpoint() {
    return this.environmentOptions.eventingEndpoint;
  }

  protected publishProfile(ignoredValue: number): void {
    this.geoLocateAndPublishProfileRecord({
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  protected geoLocateAndPublishProfileRecord(geoLocation: ClientEventing.GeoLocation): void {
    if (this.environmentOptions.useBrowserGeoLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: Position) => {
            if (position && position.coords) {
              geoLocation.longitude = position.coords.longitude;
              geoLocation.latitude = position.coords.latitude;
              geoLocation.accuracy = position.coords.accuracy;
            }
            this.fetchIpAddressAndPublishProfileRecord(geoLocation);
          },
          (positionError: PositionError) => {
            switch (positionError.code) {
              case positionError.PERMISSION_DENIED:
                geoLocation.latLongFailure = 'permission_denied';
                break;
              case positionError.POSITION_UNAVAILABLE:
                geoLocation.latLongFailure = 'position_unavailable';
                break;
              case positionError.TIMEOUT:
                geoLocation.latLongFailure = 'timeout';
                break;
              default:
                geoLocation.latLongFailure = 'unknown_error';
            }
            this.fetchIpAddressAndPublishProfileRecord(geoLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        geoLocation.latLongFailure = 'unsupported';
        this.fetchIpAddressAndPublishProfileRecord(geoLocation);
      }
    } else {
      this.fetchIpAddressAndPublishProfileRecord(geoLocation);
    }
  }

  protected fetchIpAddressAndPublishProfileRecord(geoLocation: ClientEventing.GeoLocation): void {
    if (this.environmentOptions.fetchIpAddress) {
      this.environmentOptions.getIpAddress(`${this.getEndpoint()}/ip`).subscribe(
        (ipInfo: ClientEventing.Ip) => {
          geoLocation.ipAddress = ipInfo.ip;
          this.constructAndSubmitProfileRecord(geoLocation);
        },
        (errorResponse: any) => {
          geoLocation.ipAddressFailure = this.sanitize(`${errorResponse.error}`, maxIpAddressLength);
          this.constructAndSubmitProfileRecord(geoLocation);
        }
      );
    } else {
      this.constructAndSubmitProfileRecord(geoLocation);
    }
  }

  // noinspection JSMethodCanBeStatic
  protected sanitize(input: string, length: number): string {
    if (input) {
      return input.substring(0, length).replace(/[^\w:. _-]/g, '_');
    }

    return input;
  }

  protected constructAndSubmitProfileRecord(geoLocation: ClientEventing.GeoLocation): void {
    Fingerprint2.get((components: any[]) => {
      const values = components.map((component) => {
        return component.value ? component.value.toString() : '';
      });
      const fingerprintHashSeed = 31;
      const fingerprintHash: string = Fingerprint2.x64hash128(values.join(''), fingerprintHashSeed);
      const browser = bowser.getParser(window.navigator.userAgent);
      browser.parse();
      const userTechData = browser.getResult();
      const sn = (o: any, key1: string, key2: string): string | undefined => {
        if (o && o[key1] && o[key1][key2]) {
          return o[key1][key2];
        }

        return undefined;
      };

      const maxUserAgentLength = 4096;
      const profile: ClientEventing.ProfileRecords = {
        records: [
          {
            messageFormatVersion: 1,
            messageType: 'ClientEventingProfile',
            productEnvironment: this.getProductEnvironment(),
            productPlatform: this.getProductPlatform(),
            hostEnvironment: this.getHostEnvironment(),
            hostPlatform: this.getHostPlatform(),
            sessionId: this.sessionId,
            eventTime: this.getDateString(),
            platform: {
              userAgentString: window.navigator.userAgent.substring(0, maxUserAgentLength),
              browserFingerprint: fingerprintHash,
              browserName: sn(userTechData, 'browser', 'name'),
              browserVersion: sn(userTechData, 'browser', 'version'),
              osName: sn(userTechData, 'os', 'name'),
              osVersion: sn(userTechData, 'os', 'version'),
              osVersionName: sn(userTechData, 'os', 'versionName'),
              engineName: sn(userTechData, 'engine', 'name'),
              platformType: sn(userTechData, 'platform', 'type'),
              platformVendor: sn(userTechData, 'platform', 'vendor'),
              language: navigator.languages[0],
              screenResolution: {
                width: this.environmentOptions.useNativeResolution
                  ? window.screen.width * window.devicePixelRatio
                  : window.screen.width,
                height: this.environmentOptions.useNativeResolution
                  ? window.screen.height * window.devicePixelRatio
                  : window.screen.height,
              },
            },
            location: geoLocation,
          },
        ],
      };
      this.environmentOptions.sendProfileRecords(`${this.getEndpoint()}/profile`, profile).subscribe(
        (response: ClientEventing.SubmissionResponse) => {
          if (response.failedRequests > 0) {
            console.error(`Failed to send ${response.failedRequests} events out of ${profile.records.length}.`);
            response.individualStatus.filter((rs: any) => rs.errorMessage).forEach((rs: any) => console.error(rs));
          }
        },
        (error: any) => {
          console.error('Failed to send event stream data');
          console.error(error);
        }
      );
    });
  }

  protected getProductPlatform(): ClientEventing.ProductPlatform {
    return this.environmentOptions.productPlatform;
  }

  protected getProductEnvironment(): ClientEventing.Environment {
    return this.environmentOptions.productEnvironment;
  }

  protected getHostPlatform(): ClientEventing.ProductPlatform {
    return this.environmentOptions.hostPlatform as ClientEventing.ProductPlatform;
  }

  protected getHostEnvironment(): ClientEventing.Environment {
    return this.environmentOptions.hostEnvironment as ClientEventing.Environment;
  }

  protected getUserPlatform(): ClientEventing.UserPlatform {
    return this.environmentOptions.userPlatform as ClientEventing.UserPlatform;
  }

  protected getUserEnvironment(): ClientEventing.Environment {
    return this.environmentOptions.userEnvironment as ClientEventing.Environment;
  }

  // noinspection JSMethodCanBeStatic
  private getDateString(date?: Date): string {
    if (date) {
      return moment(date).toISOString(true);
    }

    return moment().toISOString(true);
  }
}
