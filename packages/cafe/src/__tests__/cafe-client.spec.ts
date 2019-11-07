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

import { CafeClient } from '../cafe-client';

import { DefaultEventingConfiguration } from '../default-eventing-configuration';

import XHRMock, { MockRequest } from 'xhr-mock';
import { ClientEventing } from '@cafe/cafe-model';
import ProfileRecords = ClientEventing.ProfileRecords;
import ActivityRecords = ClientEventing.ActivityRecords;
import { sequence } from 'xhr-mock/lib/utils/sequence';

class Deferred<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (value?: T | PromiseLike<T>) => void;
  promise: Promise<T>;

  constructor() {
    this.resolve = () => {
      //
    };
    this.reject = () => {
      //
    };
    this.promise = new Promise<T>((resolve1, reject1) => {
      this.resolve = resolve1;
      this.reject = reject1;
    });
  }
}

describe('Cafe', () => {
  beforeEach(() => {
    XHRMock.setup();
    jest.useFakeTimers();
  });

  afterEach(() => {
    XHRMock.teardown();
    jest.useRealTimers();
  });

  it('should be created', () => {
    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
      })
    );
    expect(service).toBeTruthy();
    jest.clearAllTimers();
  });

  it('should send profile', () => {
    expect.assertions(16);

    XHRMock.post('http://eventing.example.com/v1/profile', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ProfileRecords;
      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.messageFormatVersion).toEqual(1);
      expect(record.messageType).toEqual('ClientEventingProfile');
      expect(record.productEnvironment).toEqual('develop');
      expect(record.productPlatform).toEqual('analytics-portal');
      expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
      expect(record.platform).toBeTruthy();
      if (record.platform) {
        expect(record.platform.browserFingerprint).toMatch(/[0-9a-f]{32}/);
        expect(record.platform.screenResolution).toBeTruthy();
        if (record.platform.screenResolution) {
          expect(record.platform.screenResolution.width).toEqual(0);
          expect(record.platform.screenResolution.height).toEqual(0);
        }
        expect(record.location).toBeTruthy();
        if (record.location) {
          expect(record.location.timeZone).toMatch(/^[\w:. _/+-]{1,64}$/);
        }
        // duplicate this one because it records assertions even if failed
        expect(record.location).toBeTruthy();
      }

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 300000,
        recordViewingTime: false,
        profileSubmissionDelay: 10,
      })
    );

    expect(service).toBeTruthy();

    jest.advanceTimersByTime(1200);
    jest.advanceTimersByTime(90000);

    jest.clearAllTimers();
  });

  it('should send profile with IP address', async () => {
    jest.useRealTimers();

    const promise = new Promise<boolean>((resolve) => {
      XHRMock.get('http://eventing.example.com/v1/ip', (req: MockRequest, res) => {
        expect(req).toBeTruthy();

        return res.status(200).body('{"ip": "192.0.0.1"}');
      });

      XHRMock.post('http://eventing.example.com/v1/profile', (req: MockRequest, res) => {
        const body = JSON.parse(req.body()) as ProfileRecords;
        expect(body.records.length).toEqual(1);
        const record = body.records[0];
        expect(record.location).toBeTruthy();
        if (record.location) {
          expect(record.location.timeZone).toMatch(/^[\w:. _\/+-]{1,64}$/);
          expect(record.location.ipAddress).toEqual('192.0.0.1');
        }

        resolve(true);

        return res.status(200).body('{}');
      });
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 300000,
        recordViewingTime: false,
        profileSubmissionDelay: 10,
        fetchIpAddress: true,
      })
    );

    expect(service).toBeTruthy();

    await promise;
  });

  it('should basic activity send', () => {
    expect.assertions(20);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.messageFormatVersion).toEqual(1);
      expect(record.messageType).toEqual('ClientEventingActivity');
      expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
      expect(record.eventDuration).toBeUndefined();
      expect(record.productEnvironment).toEqual('develop');
      expect(record.productPlatform).toEqual('analytics-portal');
      expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      expect(record.userSSOGUID).toBeUndefined();
      expect(record.eventUri).toMatch(/https?:.*/);
      expect(record.tags).toEqual([]);
      expect(record.userPlatform).toBeUndefined();
      expect(record.userEnvironment).toBeUndefined();
      expect(record.hostPlatform).toBeUndefined();
      expect(record.hostEnvironment).toBeUndefined();
      // duplicate this one because it records assertions even if they fail
      expect(record.hostEnvironment).toBeUndefined();

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 500,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
    });

    jest.advanceTimersByTime(600);
    jest.clearAllTimers();
  });

  it('should send with user and host data', () => {
    expect.assertions(20);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.messageFormatVersion).toEqual(1);
      expect(record.messageType).toEqual('ClientEventingActivity');
      expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
      expect(record.eventDuration).toBeUndefined();
      expect(record.productEnvironment).toEqual('develop');
      expect(record.productPlatform).toEqual('analytics-portal');
      expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      expect(record.userSSOGUID).toBeUndefined();
      expect(record.eventUri).toMatch(/https?:.*/);
      expect(record.tags).toEqual([]);
      expect(record.userPlatform).toEqual('sso');
      expect(record.userEnvironment).toEqual('performance');
      expect(record.hostPlatform).toEqual('dashboard');
      expect(record.hostEnvironment).toEqual('staging');
      // duplicate this one because it records assertions even if they fail
      expect(record.hostEnvironment).toEqual('staging');

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 500,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
        userPlatform: 'sso',
        userEnvironment: 'performance',
        hostPlatform: 'dashboard',
        hostEnvironment: 'staging',
      })
    );

    expect(service).toBeTruthy();

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
    });

    jest.advanceTimersByTime(600);
    jest.clearAllTimers();
  });

  it('should send on buffer max instead of waiting for the interval', async () => {
    const deferred1 = new Deferred<boolean>();
    const deferred2 = new Deferred<boolean>();

    let resolved1 = false;
    let resolved2 = false;

    XHRMock.post(
      'http://eventing.example.com/v1/activity',
      sequence([
        (req: MockRequest, res) => {
          const body = JSON.parse(req.body()) as ActivityRecords;
          expect(body.records.length).toEqual(100);

          resolved1 = true;
          deferred1.resolve(true);

          return res.status(200).body('{}');
        },
        (req: MockRequest, res) => {
          const body = JSON.parse(req.body()) as ActivityRecords;
          expect(body.records.length).toEqual(5);

          resolved2 = true;
          deferred2.resolve(true);

          return res.status(200).body('{}');
        },
      ])
    );

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 10000,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
        userPlatform: 'sso',
        userEnvironment: 'performance',
        hostPlatform: 'dashboard',
        hostEnvironment: 'staging',
      })
    );

    expect(service).toBeTruthy();

    for (let i = 0; i < 105; i++) {
      service.recordActivity({
        eventCategory: 'TEST_EVENT',
        eventAction: 'TEST_ACTION',
      });
      jest.runAllTicks();
    }

    await expect(deferred1.promise).resolves.toEqual(true);
    expect(resolved1).toBe(true);
    expect(resolved2).toBe(false);

    jest.advanceTimersByTime(15000);
    jest.clearAllTimers();

    await expect(deferred2.promise).resolves.toEqual(true);
    expect(resolved2).toBe(true);
  });

  it('should send a scrubbed URL in the activity send', async () => {
    expect.assertions(4);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.eventUri).toMatch(/.*ssoToken=REDACTED.*JWT=REDACTED.*/);
      // include this one because it records assertions even if they fail
      expect(record.hostEnvironment).toBeUndefined();

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 500,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
      url:
        'http://localhost:8080/' +
        '?environment=staging' +
        '&ssoToken=ASDJFLDFHDJKHFKAJSDHFLEUDJDSFHDFLKJFLDKJEIDSFLKSADJFDSFASDJFHAKSDLJFHASKDFHLASDKFJASDKJFASDFJDLHDJFHDDKJDDKKKDKKKDKDKK' +
        '&userRole=INSTRUCTOR' +
        '&someLocator=a:b:c:d' +
        '#location&JWT=DKJKLJFKLDJKLDJKLFJDASKLFJALKDSJFLKASDJFLKASDJFLKSADJFLKSADJFL;KSADJFLKASJDFLKASJDFKLJSDAKF;JDKLFJAS;L',
    });

    jest.advanceTimersByTime(600);
    jest.clearAllTimers();
  });

  it('should send global context correctly with an activity send', async () => {
    expect.assertions(21);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.messageFormatVersion).toEqual(1);
      expect(record.messageType).toEqual('ClientEventingActivity');
      expect(record.eventTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
      expect(record.eventDuration).toEqual(7392);
      expect(record.productEnvironment).toEqual('develop');
      expect(record.productPlatform).toEqual('analytics-portal');
      expect(record.sessionId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventId).toMatch(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      expect(record.userSSOGUID).toEqual('BAR');
      expect(record.eventUri).toMatch(/https?:.*/);
      expect(record.userPlatform).toBeUndefined();
      expect(record.userEnvironment).toBeUndefined();
      expect(record.hostPlatform).toBeUndefined();
      expect(record.hostEnvironment).toBeUndefined();
      expect(record.tags).toBeTruthy();
      if (record.tags) {
        expect(
          record.tags.sort((a, b) => {
            if (a.key < b.key) {
              return -1;
            } else if (a.key > b.key) {
              return 1;
            }

            return 0;
          })
        ).toEqual([
          { key: 'activityUri', value: 'GHIJKL' },
          { key: 'courseUri', value: 'BAR' },
          { key: 'day', value: 'wednesday' },
        ]);
      }

      // duplicate this one because it records assertions even if they fail
      expect(record.hostEnvironment).toBeUndefined();

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 500,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    service.setGlobalContext({
      userSSOGUID: 'BAR',
      tags: [{ key: 'courseUri', value: 'ABCDEF' }, { key: 'activityUri', value: 'GHIJKL' }],
    });

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
      eventDuration: 7392,
      tags: [{ key: 'day', value: 'wednesday' }, { key: 'courseUri', value: 'BAR' }],
    });

    jest.advanceTimersByTime(600);
    jest.clearAllTimers();
  });

  it('should batch records together', async () => {
    expect.assertions(9);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(3);
      expect(body.records[0].eventCategory).toEqual('TEST_EVENT-1');
      expect(body.records[0].eventAction).toEqual('TEST_ACTION-1');
      expect(body.records[1].eventCategory).toEqual('TEST_EVENT-2');
      expect(body.records[1].eventAction).toEqual('TEST_ACTION-2');
      expect(body.records[2].eventCategory).toEqual('TEST_EVENT-3');
      expect(body.records[2].eventAction).toEqual('TEST_ACTION-3');
      // this one because it records assertions even if they fail
      expect(body.records.length).toEqual(3);

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 500,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    service.recordActivity({
      eventCategory: 'TEST_EVENT-1',
      eventAction: 'TEST_ACTION-1',
    });
    service.recordActivity({
      eventCategory: 'TEST_EVENT-2',
      eventAction: 'TEST_ACTION-2',
    });
    service.recordActivity({
      eventCategory: 'TEST_EVENT-3',
      eventAction: 'TEST_ACTION-3',
    });

    jest.advanceTimersByTime(600);
    jest.clearAllTimers();
  });

  it('should send viewing time correctly', () => {
    expect.assertions(10);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.messageFormatVersion).toEqual(1);
      expect(record.messageType).toEqual('ClientEventingActivity');
      expect(record.eventDuration).toBeGreaterThan(50000);
      expect(record.eventCategory).toEqual('VIEWING_TIME');
      expect(record.eventAction).toEqual('VIEWING_TIME');
      expect(record.eventUri).toMatch(/https?:.*/);
      if (record.tags) {
        expect(
          record.tags.sort((a, b) => {
            if (a.key < b.key) {
              return -1;
            } else if (a.key > b.key) {
              return 1;
            }

            return 0;
          })
        ).toEqual([{ key: 'focused', value: 'false' }, { key: 'visible', value: 'true' }]);
      }
      // duplicate this one because it records assertions even if they fail
      expect(record.hostEnvironment).toBeUndefined();

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 5000,
        recordViewingTime: true,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    jest.advanceTimersByTime(70000);
    jest.clearAllTimers();
  });

  it('should send viewing time grouped by url, contiguously', () => {
    expect.assertions(13);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(5);
      expect(body.records[0].eventUri).toEqual('https://ui.example.com/');
      expect(body.records[0].eventDuration).toEqual(5000);

      expect(body.records[1].eventUri).toEqual('https://ui.example.com/version');
      expect(body.records[1].eventDuration).toEqual(10000);

      expect(body.records[2].eventUri).toEqual('https://ui.example.com/');
      expect(body.records[2].eventDuration).toEqual(15000);

      expect(body.records[3].eventUri).toEqual('https://ui.example.com/important-route/course:5/activity:3/fred');
      expect(body.records[3].eventDuration).toEqual(10000);

      expect(body.records[4].eventUri).toEqual('https://ui.example.com/important-route/course:5/activity:7/george');
      expect(body.records[4].eventDuration).toBeGreaterThanOrEqual(15000);
      // duplicate this one because it records assertions even if they fail
      expect(body.records.length).toEqual(5);

      return res.status(200).body('{}');
    });

    let currentUrl = 'https://ui.example.com/';

    const testUrlProvider = () => currentUrl;

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 5000,
        recordViewingTime: true,
        recordViewingTimeContiguously: true,
        recordViewingTimeByUrl: true,
        profileSubmissionDelay: 300000,
        urlProvider: testUrlProvider,
      })
    );

    expect(service).toBeTruthy();

    jest.advanceTimersByTime(5010);
    currentUrl = 'https://ui.example.com/version';
    jest.advanceTimersByTime(10010);
    currentUrl = 'https://ui.example.com/';
    jest.advanceTimersByTime(15010);
    currentUrl = 'https://ui.example.com/important-route/course:5/activity:3/fred';
    jest.advanceTimersByTime(10010);
    currentUrl = 'https://ui.example.com/important-route/course:5/activity:7/george';
    jest.advanceTimersByTime(10010);

    jest.advanceTimersByTime(15000);
    jest.clearAllTimers();
  });

  it('should not send viewing time if the feature is turned off', () => {
    expect.assertions(5);

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(1);
      const record = body.records[0];
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      // duplicate this one because it records assertions even if they fail
      expect(body.records.length).toEqual(1);

      return res.status(200).body('{}');
    });

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 70000,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
      })
    );

    expect(service).toBeTruthy();

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
    });

    jest.advanceTimersByTime(80000);
    jest.clearAllTimers();
  });

  it('should send data on unload if the feature is enabled', async () => {
    jest.useRealTimers();

    const deferred = new Deferred<boolean>();

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(2);
      const record = body.records[0];
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      expect(body.records[1].eventCategory).toEqual('UNLOAD');
      // duplicate this one because it records assertions even if they fail
      expect(body.records.length).toEqual(2);

      deferred.resolve(true);

      return res.status(200).body('{}');
    });

    spyOn(window, 'addEventListener');

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 70000,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
        attemptCompletionOnClose: true,
        installOnUnloadHandler: true,
      })
    );

    expect(service).toBeTruthy();
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', service.flush);

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
    });

    // I wasn't able to get jest to call onbeforeunload
    service.flush();

    await expect(deferred.promise).resolves.toEqual(true);
  });

  it('should not send data on unload if the feature is disabled', async () => {
    jest.useRealTimers();

    const deferred = new Deferred<boolean>();

    XHRMock.post('http://eventing.example.com/v1/activity', (req: MockRequest, res) => {
      const body = JSON.parse(req.body()) as ActivityRecords;

      expect(body.records.length).toEqual(2);
      const record = body.records[0];
      expect(record.eventCategory).toEqual('TEST_EVENT');
      expect(record.eventAction).toEqual('TEST_ACTION');
      expect(body.records[1].eventCategory).toEqual('UNLOAD');
      // duplicate this one because it records assertions even if they fail
      expect(body.records.length).toEqual(2);

      deferred.resolve(true);

      return res.status(200).body('{}');
    });

    spyOn(window, 'addEventListener');

    const service = new CafeClient(
      new DefaultEventingConfiguration({
        productEnvironment: 'develop',
        productPlatform: 'analytics-portal',
        apiKey: 'BN8U2T9vneR2EYYzh65cSKZ5ZPJymP',
        eventingEndpoint: 'http://eventing.example.com/v1',
        bufferInterval: 70000,
        recordViewingTime: false,
        profileSubmissionDelay: 300000,
        attemptCompletionOnClose: false,
        installOnUnloadHandler: false,
      })
    );

    expect(service).toBeTruthy();
    expect(window.addEventListener).not.toHaveBeenCalled();

    service.recordActivity({
      eventCategory: 'TEST_EVENT',
      eventAction: 'TEST_ACTION',
    });

    const spy = spyOn<any>(service, 'sendRecordsOnUnload');

    // I wasn't able to get jest to call onbeforeunload
    service.flush();

    expect(spy).not.toHaveBeenCalled();
  });
});
