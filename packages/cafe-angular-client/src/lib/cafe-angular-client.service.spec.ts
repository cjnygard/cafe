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

import {discardPeriodicTasks, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {
  CAFE_EVENTING_CONFIGURATION,
  CafeAngularClientService
} from './cafe-angular-client.service';
import {
  AngularEventingOptions,
  UrlSource
} from '@cafe/cafe-angular-config';
import {CafeEnvironmentService} from '@cafe/cafe-environment';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {Component} from '@angular/core';
import {ClientEventing} from '@cafe/cafe-model';
import {AngularDefaultEventingOptions} from "./angular-default-eventing.options";

@Component({
  selector: 'cg-start-page',
  template: '<p>Start page stuff</p>'
})
class MockStartPageComponent {
}

@Component({
  selector: 'cg-version-page',
  template: '<p>Version stuff</p>'
})
class MockVersionPageComponent {
}

class ConfigurationProvider {

  static eventingOptions: AngularEventingOptions;

  static getOptions(): AngularEventingOptions {
    return ConfigurationProvider.eventingOptions;
  }

}

describe('CafeAngularClientService', () => {
  urlBase: String = 'https://8tlrx8mmw3.execute-api.us-east-1.amazonaws.com';

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [MockStartPageComponent, MockVersionPageComponent],
    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([
        {
          path: '',
          children: [
            {path: '', component: MockStartPageComponent},
            {
              path: 'version', component: MockVersionPageComponent,
              data: {eventingCategoryName: 'VERSION_PAGE', eventingActionName: 'VERSION_PAGE_A'}
            },
            {
              path: 'important-route/:courseUri/:activityUri/:barnacle', component: MockStartPageComponent,
              data: {
                eventingActionName: 'IMPORTANT_PAGE',
                eventingTags: [{key: 'foo', value: 'bar'}],
                eventingTagParameters: ['courseUri', 'activityUri']
              }
            }
          ]
        }
      ]),
    ],
    providers: [
      {
        provide: CafeEnvironmentService,
        useValue: {
          getEnvironmentSetting() {
            return '${urlBase}/dev';
          },
          applicationName: 'test',
          environmentName: 'local'
        }
      },
      {
        provide: CAFE_EVENTING_CONFIGURATION,
        useFactory: ConfigurationProvider.getOptions
      },
    ]
  }));

  it('should be created', () => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({productPlatform: 'analytics-portal'});
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    expect(service).toBeTruthy();
  });

  it('should send profile', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 300000,
      recordViewingTime: false,
      profileSubmissionDelay: 1000,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    tick(1200);
    tick(90000);
    const mockRequest = httpMock.expectOne('${urlBase}/dev/profile');
    discardPeriodicTasks();
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ProfileRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingProfile');
    expect(record.productEnvironment).toEqual('local');
    expect(record.productPlatform).toEqual('analytics-portal');
    expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
    expect(record.platform).toBeTruthy();
    expect(record.platform.browserFingerprint).toMatch(/[0-9a-f]{32}/);
    expect(record.platform.screenResolution).toBeTruthy();
    expect(record.platform.screenResolution.width).toBeTruthy();
    expect(record.platform.screenResolution.height).toBeTruthy();
    expect(record.location).toBeTruthy();
    expect(record.location.timeZone).toMatch(/^[\w:. _/+-]{1,64}$/);
  }));

  it('should send profile with IP address', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 300000,
      recordViewingTime: false,
      profileSubmissionDelay: 1000,
      fetchIpAddress: true,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    tick(1200);
    const mockIpRequest = httpMock.expectOne('${urlBase}/dev/ip');
    mockIpRequest.flush({
      ip: '192.0.0.1',
    });
    tick(90000);
    const mockRequest = httpMock.expectOne('${urlBase}/dev/profile');
    discardPeriodicTasks();
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ProfileRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.location).toBeTruthy();
    expect(record.location.timeZone).toMatch(/^[\w:. _\/+-]{1,64}$/);
    expect(record.location.ipAddress).toEqual('192.0.0.1');
  }));

  it('should basic activity send', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION'
    });
    tick(600);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingActivity');
    expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
    expect(record.eventDuration).toBeUndefined();
    expect(record.productEnvironment).toEqual('local');
    expect(record.productPlatform).toEqual('analytics-portal');
    expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventCategory).toEqual('TEST_EVENT');
    expect(record.eventAction).toEqual('TEST_ACTION');
    expect(record.userId).toBeUndefined();
    expect(record.eventUri).toMatch(/https?:.*/);
    expect(record.tags).toEqual([]);
    expect(record.userPlatform).toBeUndefined();
    expect(record.userEnvironment).toBeUndefined();
    expect(record.hostPlatform).toBeUndefined();
    expect(record.hostEnvironment).toBeUndefined();
  }));

  it('should send with user and host data', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      productPlatform: 'analytics-portal',
      userPlatform: 'sso',
      userEnvironment: 'performance',
      hostPlatform: 'cas-mt',
      hostEnvironment: 'staging'
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION'
    });
    tick(600);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingActivity');
    expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
    expect(record.eventDuration).toBeUndefined();
    expect(record.productEnvironment).toEqual('local');
    expect(record.productPlatform).toEqual('analytics-portal');
    expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventCategory).toEqual('TEST_EVENT');
    expect(record.eventAction).toEqual('TEST_ACTION');
    expect(record.userId).toBeUndefined();
    expect(record.eventUri).toMatch(/https?:.*/);
    expect(record.tags).toEqual([]);
    expect(record.userPlatform).toEqual('sso');
    expect(record.userEnvironment).toEqual('performance');
    expect(record.hostPlatform).toEqual('cas-mt');
    expect(record.hostEnvironment).toEqual('staging');
  }));

  it('should send on buffer max instead of waiting for the interval', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 60000,
      recordViewingTime: false,
      profileSubmissionDelay: 90000,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    for (let i = 0; i < 105; i++) {
      service.recordActivity({
        eventCategory: 'TEST_EVENT',
        eventAction: 'TEST_ACTION'
      });
      tick();
    }
    tick();
    tick(70000);
    const mockRequest = httpMock.expectOne((r: HttpRequest<ClientEventing.ActivityRecords>) => {
      return r.url === '${urlBase}/dev/activity' && r.body.records.length === 100;
    });
    const mockRequest2 = httpMock.expectOne((r: HttpRequest<ClientEventing.ActivityRecords>) => {
      return r.url === '${urlBase}/dev/activity' && r.body.records.length === 5;
    });
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(100);

    const req2: HttpRequest<ClientEventing.ActivityRecords> = mockRequest2.request;
    expect(req2.body.records.length).toEqual(5);
    httpMock.verify();
    discardPeriodicTasks();
  }));

  it('should scrubbed activity send', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
      url: 'http://localhost:8080/' +
        '?environment=staging' +
        '&ssoToken=ASDJFLDFHDJKHFKAJSDHFLEUDJDSFHDFLKJFLDKJEIDSFLKSADJFDSFASDJFHAKSDLJFHASKDFHLASDKFJASDKJFASDFJDLHDJFHDDKJDDKKKDKKKDKDKK' +
        '&userRole=INSTRUCTOR' +
        '&courseUri=product:staging.example.com:course:isbn:9781337570831:course-key:MTPNG4VZ8S62' +
        '#analytics-portal&JWT=DKJKLJFKLDJKLDJKLFJDASKLFJALKDSJFLKASDJFLKASDJFLKSADJFLKSADJFL;KSADJFLKASJDFLKASJDFKLJSDAKF;JDKLFJAS;L'
    });
    tick(600);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingActivity');
    expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
    expect(record.eventDuration).toBeUndefined();
    expect(record.productEnvironment).toEqual('local');
    expect(record.productPlatform).toEqual('analytics-portal');
    expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventCategory).toEqual('TEST_EVENT');
    expect(record.eventAction).toEqual('TEST_ACTION');
    expect(record.userId).toBeUndefined();
    expect(record.eventUri).toMatch(/.*ssoToken=REDACTED.*JWT=REDACTED.*/);
    expect(record.tags).toEqual([]);
  }));

  it('should context activity send', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      productPlatform: 'risk-assessment',
      urlSource: UrlSource.ROUTER_URL,
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.setGlobalContext({
      userId: 'BAR',
      tags: [
        {key: 'courseUri', value: 'ABCDEF'},
        {key: 'activityUri', value: 'GHIJKL'},
      ]
    });
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
      eventDuration: 7392,
      tags: [
        {key: 'day', value: 'wednesday'},
        {key: 'courseUri', value: 'BAR'}
      ]
    });
    tick(600);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingActivity');
    expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
    expect(record.eventDuration).toEqual(7392);
    expect(record.productEnvironment).toEqual('local');
    expect(record.productPlatform).toEqual('risk-assessment');
    expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
    expect(record.eventCategory).toEqual('TEST_EVENT');
    expect(record.eventAction).toEqual('TEST_ACTION');
    expect(record.userId).toEqual('BAR');
    expect(record.eventUri).toEqual('/');
    expect(record.tags.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      } else if (a.key > b.key) {
        return 1;
      }
      return 0;
    })).toEqual([
      {key: 'activityUri', value: 'GHIJKL'},
      {key: 'courseUri', value: 'BAR'},
      {key: 'day', value: 'wednesday'}
    ]);
  }));

  it('should basic activity send aggregation', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT-1',
      eventAction: 'TEST_ACTION-1'
    });
    service.recordActivity({
      eventCategory: 'TEST_EVENT-2',
      eventAction: 'TEST_ACTION-2'
    });
    service.recordActivity({
      eventCategory: 'TEST_EVENT-3',
      eventAction: 'TEST_ACTION-3'
    });
    tick(600);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(3);
    expect(req.body.records[0].eventCategory).toEqual('TEST_EVENT-1');
    expect(req.body.records[1].eventCategory).toEqual('TEST_EVENT-2');
    expect(req.body.records[2].eventCategory).toEqual('TEST_EVENT-3');
  }));

  it('should send time on', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      recordViewingTime: true,
      bufferInterval: 5000,
      profileSubmissionDelay: 90000,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    tick(70000);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(1);
    const record = req.body.records[0];
    expect(record.messageFormatVersion).toEqual(1);
    expect(record.messageType).toEqual('ClientEventingActivity');
    expect(record.eventDuration).toBeGreaterThan(50000);
    expect(record.eventCategory).toEqual('VIEWING_TIME');
    expect(record.eventAction).toEqual('VIEWING_TIME');
    expect(record.eventUri).toMatch(/https?:.*/);
    expect(record.tags.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      } else if (a.key > b.key) {
        return 1;
      }
      return 0;
    })).toEqual([
      {key: 'focused', value: 'false'},
      {key: 'visible', value: 'true'},
    ]);
  }));

  it('should send time grouped by url, contiguously', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      recordViewingTime: true,
      bufferInterval: 5000,
      profileSubmissionDelay: 90000,
      recordRoutingNavigation: false,
      recordViewingTimeContiguously: true,
      recordViewingTimeByUrl: true,
      urlSource: UrlSource.ROUTER_URL,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    const router: Router = TestBed.get(Router);
    router.initialNavigation();
    tick();
    tick(5010);
    router.navigate(['/version']);
    tick();
    tick(10010);
    router.navigate(['/']);
    tick(15010);
    tick();
    router.navigate(['/important-route/course:5/activity:3/fred']);
    tick();
    tick(10010);
    router.navigate(['/important-route/course:5/activity:7/george']);
    tick();
    tick(10010);

    tick(15000);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(5);
    expect(req.body.records[0].eventUri).toEqual('/');
    expect(req.body.records[0].eventDuration).toEqual(5000);

    expect(req.body.records[1].eventUri).toEqual('/version');
    expect(req.body.records[1].eventDuration).toEqual(10000);

    expect(req.body.records[2].eventUri).toEqual('/');
    expect(req.body.records[2].eventDuration).toEqual(15000);

    expect(req.body.records[3].eventUri).toEqual('/important-route/course:5/activity:3/fred');
    expect(req.body.records[3].eventDuration).toEqual(10000);

    expect(req.body.records[4].eventUri).toEqual('/important-route/course:5/activity:7/george');
    expect(req.body.records[4].eventDuration).toEqual(15000);
  }));

  it('should send time off', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      recordViewingTime: false,
      profileSubmissionDelay: 90000,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    tick(70000);
    discardPeriodicTasks();
    httpMock.expectNone('${urlBase}/dev/activity');
  }));

  it('should send router on', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      recordViewingTime: false,
      bufferInterval: 5000,
      profileSubmissionDelay: 90000,
      recordRoutingNavigation: true,
      urlSource: UrlSource.ROUTER_URL,
      productPlatform: 'analytics-portal',
    });
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);
    // noinspection JSUnusedLocalSymbols
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    const router: Router = TestBed.get(Router);
    router.initialNavigation();
    tick();
    router.navigate(['/version']);
    tick();
    router.navigate(['/']);
    tick();
    router.navigate(['/important-route/course:5/activity:3/fred']);
    tick();
    tick(6000);
    discardPeriodicTasks();
    const mockRequest = httpMock.expectOne('${urlBase}/dev/activity');
    expect(mockRequest.cancelled).toBeFalsy();
    mockRequest.flush({
      failedRequests: 0,
      individualStatus: [{RecordId: 'foo'}]
    });
    httpMock.verify();
    const req: HttpRequest<ClientEventing.ActivityRecords> = mockRequest.request;
    expect(req.body.records.length).toEqual(4);
    expect(req.body.records[0].eventCategory).toEqual('ROUTER_NAVIGATION');
    expect(req.body.records[1].eventCategory).toEqual('VERSION_PAGE');
    expect(req.body.records[2].eventCategory).toEqual('ROUTER_NAVIGATION');
    expect(req.body.records[3].eventCategory).toEqual('ROUTER_NAVIGATION');
    expect(req.body.records[0].eventAction).toEqual('MockStartPageComponent');
    expect(req.body.records[1].eventAction).toEqual('VERSION_PAGE_A');
    expect(req.body.records[2].eventAction).toEqual('MockStartPageComponent');
    expect(req.body.records[3].eventAction).toEqual('IMPORTANT_PAGE');
    expect(req.body.records[0].eventUri).toEqual('/');
    expect(req.body.records[1].eventUri).toEqual('/version');
    expect(req.body.records[2].eventUri).toEqual('/');
    expect(req.body.records[3].eventUri).toEqual('/important-route/course:5/activity:3/fred');
    expect(req.body.records[3].tags.slice().sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      } else if (a.key > b.key) {
        return 1;
      }
      return 0;
    })).toEqual([
      {key: 'activityUri', value: 'activity:3'},
      {key: 'courseUri', value: 'course:5'},
      {key: 'foo', value: 'bar'}
    ]);

  }));

  it('should send-on-close on', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 60000,
      recordViewingTime: true,
      viewingTimeRecordInterval: 90000,
      viewingTimeCheckInterval: 5000,
      attemptCompletionOnClose: true,
      profileSubmissionDelay: 90000,
      productPlatform: 'analytics-portal',
    });
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION'
    });
    tick(32000);
    const spy = spyOn<any>(service, 'sendRecordsOnUnload');
    service.flush();
    expect(spy).toHaveBeenCalled();
    const args: ClientEventing.ActivityRecords = spy.calls.argsFor(0)[0];
    expect(args.records.length).toEqual(3);
    expect(args.records[0].eventCategory).toEqual('TEST_EVENT');
    expect(args.records[1].eventCategory).toEqual('VIEWING_TIME');
    expect(args.records[2].eventCategory).toEqual('UNLOAD');
    discardPeriodicTasks();
  }));

  it('should send-on-close off', fakeAsync(() => {
    ConfigurationProvider.eventingOptions = new AngularDefaultEventingOptions({
      bufferInterval: 500,
      recordViewingTime: false,
      attemptCompletionOnClose: false,
      productPlatform: 'analytics-portal',
    });
    const service: CafeAngularClientService = TestBed.get(CafeAngularClientService);
    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION'
    });
    spyOn<any>(service, 'sendRecordsOnUnload');
    service.flush();
    expect(service['sendRecordsOnUnload']).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));


});
