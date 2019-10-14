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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {VersionPageModule} from './version-page/version-page.module';
import {VERSION} from '../environments/version';
import {CafeEnvironmentModule, DEFAULT_ENVIRONMENT_DATA} from '@cafe/cafe-environment';
import {StartPageComponent} from './start-page/start-page.component';
import {CafeAngularClientModule} from '@cafe/cafe-angular-client';

@NgModule({
  declarations: [
    AppComponent,
    StartPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    VersionPageModule.forRoot({
      versionConfig: VERSION
    }),
    CafeEnvironmentModule.forRoot({
      environments: DEFAULT_ENVIRONMENT_DATA,
      overrides: {
        environments: [
          {
            name: 'dev',
            errorLoggingApiKey: 'GG6xqJHlmw7Z0XqLSdM0m63Wkt7h9f9u4I4foscv',
          }
        ]
      },
      applicationName: 'eventing'
    }),
    CafeAngularClientModule.forRoot({
      productPlatform: 'analytics-portal',
      useBrowserGeoLocation: true,
      fetchIpAddress: true,
      recordViewingTime: true,
      recordRoutingNavigation: true,
      logErrorsToService: true,
      bufferInterval: 5000,
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
