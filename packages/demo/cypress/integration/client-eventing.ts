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

/* tslint:disable:no-unused-expression */
import {VERSION} from '../../src/environments/version';
import {HttpRequest, HttpResponse} from '@angular/common/http';
import {ClientEventing} from '@cafe/cafe-model';

context('The event recording service', () => {

  beforeEach(() => {

  });
  let url="https://553sorqzoj.execute-api.us-east-2.amazonaws.com/dev";
  it('should record a sequence of events', () => {
    cy.server();
    cy.route({
      method: 'POST',
      url: `${url}/activity`,
    }).as('activityCheck');
    cy.route({
      method: 'GET',
      url: `${url}/ip`,
    }).as('ipCheck');
    cy.route({
      method: 'POST',
      url: `${url}/profile`,
    }).as('profileCheck');
    cy.route({
      method: 'POST',
      url: `${url}/log`,
    }).as('logCheck');
    cy.visit(`${Cypress.env('baseUrl')}/`)
      .window()
      .then(() => {
        cy.get('#start-page-content').contains('start-page works!');
        cy.get('#version-footer').contains('v' + VERSION.version);
        cy.wait('@activityCheck').then((xhr) => {
          const requestBody = (
            xhr.request as HttpRequest<ClientEventing.ActivityRecords>
          ).body || {records: []};
          assert.equal(requestBody.records.length, 1, 'Should have sent one record from initial navigation');
          const record = requestBody.records[0];
          expect(record.messageFormatVersion).equal(1);
          expect(record.messageType).equal('ClientEventingActivity');
          expect(record.eventTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
          expect(record.productEnvironment).equal('staging');
          expect(record.productPlatform).equal('analytics-portal');
          expect(record.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
          expect(record.eventId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
          expect(record.eventCategory).equal('ROUTER_NAVIGATION');
          expect(record.eventAction).equal('START_PAGE');
          expect(record.eventUri).match(/https?:.*/);
          const responseBody = (
            xhr.response as HttpResponse<ClientEventing.SubmissionResponse>
          ).body || {failedRequests: 9999, individualStatus: []};
          assert.equal(responseBody.failedRequests, 0, 'activity submission succeeded');
          assert.isUndefined(responseBody.individualStatus[0].errorMessage, 'activity submission succeeded');
        });
        cy.wait('@ipCheck').then((xhr) => {
          const ipResponse = (
            xhr.response as HttpResponse<ClientEventing.Ip>
          ).body || {ip: 'NONE'};
          assert.match(ipResponse.ip, /[\d]+\.[\d]+\.[\d]+\.[\d]+/, 'ip submission succeeded');
          cy.wait('@profileCheck').then((xhr) => {
            const requestBody = (
              xhr.request as HttpRequest<ClientEventing.ProfileRecords>
            ).body || {records: []};
            assert.equal(requestBody.records.length, 1, 'Should have sent one record for profile');
            const record = requestBody.records[0];
            expect(record.messageFormatVersion).equal(1);
            expect(record.messageType).equal('ClientEventingProfile');
            expect(record.eventTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
            expect(record.productEnvironment).equal('staging');
            expect(record.productPlatform).equal('analytics-portal');
            expect(record.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
            expect(record.platform).to.not.be.null;
            const platform = record.platform || {};
            expect(platform.browserFingerprint).match(/[0-9a-f]{32}/);
            expect(platform.screenResolution).to.not.be.null;
            if (platform.screenResolution) {
              expect(platform.screenResolution).to.not.be.null;
              expect(platform.screenResolution).to.not.be.null;
            }
            expect(record.location).to.not.be.null;
            if (record.location) {
              expect(record.location.ipAddress).to.equal(ipResponse.ip);
            }
            const responseBody = (
              xhr.response as HttpResponse<ClientEventing.SubmissionResponse>
            ).body || {failedRequests: 9999, individualStatus: []};
            assert.equal(responseBody.failedRequests, 0, 'profile submission succeeded');
            assert.isUndefined(responseBody.individualStatus[0].errorMessage, 'profile submission succeeded');
          });
        });
        cy.get('#cause-an-error').click()
          .then(() => {
            cy.wait('@logCheck').then((xhr) => {
              const requestBody = (
                xhr.request as HttpRequest<ClientEventing.LogRecords>
              ).body || {records: []};
              assert.equal(requestBody.records.length, 1, 'Should have sent one record for error logging');
              const record = requestBody.records[0];
              expect(record.messageFormatVersion).equal(1);
              expect(record.messageType).equal('ClientEventingLog');
              expect(record.logTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
              expect(record.productEnvironment).equal('staging');
              expect(record.productPlatform).equal('analytics-portal');
              expect(record.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
              expect(record.eventUri).match(/https?:.*/);
              expect(record.logMessage).match(/.*/);
              const responseBody = (
                xhr.response as HttpResponse<ClientEventing.SubmissionResponse>
              ).body || {failedRequests: 9999, individualStatus: []};
              assert.equal(responseBody.failedRequests, 0, 'activity submission succeeded');
              assert.isUndefined(responseBody.individualStatus[0].errorMessage, 'activity submission succeeded');
            });
            cy.get('#go-to-course-activity').click()
              .then(() => {
                cy.get('#version-footer').click();
                cy.get('app-root h1').contains('Versions')
                  .then(() => {
                    cy.wait('@activityCheck').then((xhr) => {
                      const requestBody = (
                        xhr.request as HttpRequest<ClientEventing.ActivityRecords>
                      ).body || {records: []};
                      assert.equal(requestBody.records.length, 2, 'Should have sent two records from navigation');
                      const activityRouteRecord = requestBody.records[0];
                      expect(activityRouteRecord.messageFormatVersion).equal(1);
                      expect(activityRouteRecord.messageType).equal('ClientEventingActivity');
                      expect(activityRouteRecord.eventTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
                      expect(activityRouteRecord.productEnvironment).equal('staging');
                      expect(activityRouteRecord.productPlatform).equal('analytics-portal');
                      expect(activityRouteRecord.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                      expect(activityRouteRecord.eventId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                      expect(activityRouteRecord.eventCategory).equal('ROUTER_NAVIGATION');
                      expect(activityRouteRecord.eventAction).equal('StartPageComponent');
                      expect(activityRouteRecord.eventUri).match(/https?:.*course:foo\/activity:bar/);
                      expect(activityRouteRecord.tags).to.not.be.null;
                      if (activityRouteRecord.tags) {
                        expect(JSON.stringify(activityRouteRecord.tags.slice().sort((a, b) => {
                          if (a.key < b.key) {
                            return -1;
                          } else if (a.key > b.key) {
                            return 1;
                          }
                          return 0;
                        }))).equal(JSON.stringify([
                          {key: 'activityUri', value: 'activity:bar'},
                          {key: 'courseUri', value: 'course:foo'},
                          {key: 'foo', value: 'bar'}
                        ]));
                      }

                      const versionPageRecord = requestBody.records[1];
                      expect(versionPageRecord.messageFormatVersion).equal(1);
                      expect(versionPageRecord.messageType).equal('ClientEventingActivity');
                      expect(versionPageRecord.eventTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
                      expect(versionPageRecord.productEnvironment).equal('staging');
                      expect(versionPageRecord.productPlatform).equal('analytics-portal');
                      expect(versionPageRecord.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                      expect(versionPageRecord.eventId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                      expect(versionPageRecord.eventCategory).equal('ROUTER_NAVIGATION');
                      expect(versionPageRecord.eventAction).equal('VERSION');
                      expect(versionPageRecord.eventUri).match(/https?:.*/);
                      const responseBody = (
                        xhr.response as HttpResponse<ClientEventing.SubmissionResponse>
                      ).body || {failedRequests: 9999, individualStatus: []};
                      assert.equal(responseBody.failedRequests, 0, 'activity submission succeeded');
                      assert.isUndefined(responseBody.individualStatus[0].errorMessage, 'activity submission succeeded');
                    });
                    cy.wait('@activityCheck', {timeout: 70000}).then((xhr) => {
                      const requestBody = (
                        xhr.request as HttpRequest<ClientEventing.ActivityRecords>
                      ).body || {records: []};
                      expect(requestBody.records.length).to.be.greaterThan(0, 'Should have sent one or two from viewing time');
                      expect(requestBody.records.length).to.be.lessThan(3, 'Should have sent one or two from viewing time');
                      requestBody.records
                        .forEach((record) => {
                          expect(record.messageFormatVersion).equal(1);
                          expect(record.messageType).equal('ClientEventingActivity');
                          expect(record.eventTime).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})(Z|[+-]\d{2}:\d{2})/);
                          expect(record.productEnvironment).equal('staging');
                          expect(record.productPlatform).equal('analytics-portal');
                          expect(record.sessionId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                          expect(record.eventId).match(/[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/);
                          expect(record.eventCategory).equal('VIEWING_TIME');
                          expect(record.eventAction).equal('VIEWING_TIME');
                          expect(record.eventUri).match(/https?:.*/);
                          expect(record.tags).to.not.be.null;
                          if (record.tags) {
                            expect(record.tags.filter(t => t.key === 'focused')[0].value).to.match(/false|true/);
                            expect(record.tags.filter(t => t.key === 'visible')[0].value).to.equal('true');
                          }
                        });
                      const responseBody = (
                        xhr.response as HttpResponse<ClientEventing.SubmissionResponse>
                      ).body || {failedRequests: 9999, individualStatus: []};
                      assert.equal(responseBody.failedRequests, 0, 'activity submission succeeded');
                      assert.isUndefined(responseBody.individualStatus[0].errorMessage, 'activity submission succeeded');
                    });
                  });
              });
          });
      });
  });


});
