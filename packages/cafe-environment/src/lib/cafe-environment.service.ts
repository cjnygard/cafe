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

import {Inject, Injectable} from '@angular/core';
import {APP_BASE_HREF} from '@angular/common';
import * as ld from 'lodash';
import {
  CAFE_ENVIRONMENTS,
  CafeEnvironmentOptions,
  Environment,
  Environments,
  EnvironmentsOverride,
  EnvironmentTrigger
} from './cafe-environment.model';

const _ = ld;

export const DEFAULT_ENVIRONMENT_DATA: Environments = {
  defaultEnvironment: 'dev',
  environments: [
    {
      name: 'dev',
      apiEndpoint: 'https://8tlrx8mmw3.execute-api.us-east-1.amazonaws.com/dev',
      defaultEnvironmentContext: 'dev',
      eventingEndpoint: 'https://8tlrx8mmw3.execute-api.us-east-1.amazonaws.com/dev',
    }
  ],
  triggers: [
    {search: '[/-]dev', environment: 'dev'},
    {search: '[/-]staging', environment: 'staging'},
    {search: '[/-]production', environment: 'production'},
    {search: '(?:localhost|\\.local|analytics-tools)', environment: 'dev'},
    {search: '^https?://s-', environment: 'staging'},
    {search: '^https?://(?!s-)', environment: 'production'},
  ],
  whitelistedDomains: [
  ],
  blacklistedRoutes: [
  ],
};

class EnvironmentBuilder implements Environments {
  readonly defaultEnvironment;
  readonly environments: Environment[];
  readonly triggers: EnvironmentTrigger[];
  readonly blacklistedRoutes: string[];
  readonly whitelistedDomains: string[];


  constructor({overrides, defaults = DEFAULT_ENVIRONMENT_DATA}: { overrides: EnvironmentsOverride, defaults?: Environments }) {
    this.environments = [];
    this.triggers = [];
    this.whitelistedDomains = [];
    this.blacklistedRoutes = [];
    _.assign(this, defaults);
    if (overrides.defaultEnvironment) {
      this.defaultEnvironment = overrides.defaultEnvironment;
    }
    if (overrides.environments) {
      if (overrides.clearEnvironments) {
        this.environments = [];
      }
      overrides.environments
        .forEach(e => {
          const found = this.environments.find(ee => ee.name === e.name);
          if (found) {
            _.assign(found, e);
          } else {
            if (!e.defaultEnvironmentContext) {
              throw new Error(`Specified override environment ${e.name} must contain a defaultEnvironmentContext`);
            }
            this.environments.push(<Environment>e);
          }
        });
    }
    if (overrides.triggers) {
      if (overrides.clearTriggers) {
        this.triggers = [];
      }
      overrides.triggers
        .forEach(t => {
          const found = this.triggers.find(tt => tt.search === t.search);
          if (found) {
            _.assign(found, t);
          } else {
            this.triggers.push(t);
          }
        });
    }
    if (overrides.whitelistedDomains) {
      if (overrides.clearWhitelistedDomains) {
        this.whitelistedDomains = [];
      }
      this.whitelistedDomains.push.apply(this.whitelistedDomains, overrides.whitelistedDomains);
    }
    if (overrides.blacklistedRoutes) {
      if (overrides.clearBlacklistedRoutes) {
        this.blacklistedRoutes = [];
      }
      this.blacklistedRoutes.push.apply(this.blacklistedRoutes, overrides.blacklistedRoutes);
    }
  }

}

@Injectable({
  providedIn: 'root'
})
export class CafeEnvironmentService {

  private readonly environmentData: Environment;
  private readonly _dataEnvironmentContext: string;
  private readonly environments: Environments;
  readonly applicationName: string;

  constructor(
    @Inject(APP_BASE_HREF) private readonly _applicationBaseHref: string,
    @Inject(CAFE_ENVIRONMENTS) environmentOptions: CafeEnvironmentOptions,
  ) {
    this.environments = environmentOptions.environments;
    if (environmentOptions.overrides) {
      this.environments = new EnvironmentBuilder({overrides: environmentOptions.overrides, defaults: environmentOptions.environments});
    }
    this.applicationName = environmentOptions.applicationName;
    const storedUiEnvironment = CafeEnvironmentService.findParameter('cg_portal_debug_ui_environment');
    if (this.environments.triggers.find(t => _.isNil(t.search))) {
      throw new Error('All triggers must have search regexes');
    }
    if (storedUiEnvironment && storedUiEnvironment.length > 0) {
      this.environmentData = _.find(
        this.environments.environments,
        (e) => {
          return e.name === storedUiEnvironment;
        }
      );
    } else {
      const foundTrigger = _.find(
        this.environments.triggers,
        (t) => {
          return !!this._applicationBaseHref.match(new RegExp(t.search));
        }
      );
      if (foundTrigger) {
        this.environmentData = _.find(
          this.environments.environments,
          (e) => {
            return e.name === foundTrigger.environment;
          }
        );
      } else {
        this.environmentData = _.find(
          this.environments.environments,
          (e) => {
            return e.name === this.environments.defaultEnvironment;
          }
        );
      }
    }
    const storedDataEnvironment = CafeEnvironmentService.findParameter('cg_portal_debug_data_environment');
    if (storedDataEnvironment) {
      this._dataEnvironmentContext = storedDataEnvironment;
    } else {
      this._dataEnvironmentContext = this.environmentData.defaultEnvironmentContext;
    }
  }

  private static findParameter(parameterName: string): string {
    let item: string;
    item = new URLSearchParams(window.location.search).get(parameterName);
    if (!item) {
      item = sessionStorage.getItem(parameterName);
      if (!item) {
        item = localStorage.getItem(parameterName);
      }
    }
    return item;
  }

  get environmentName(): string {
    return this.environmentData.name;
  }

  get applicationBaseHref(): string {
    return this._applicationBaseHref;
  }

  get dataEnvironmentContext(): string {
    return this._dataEnvironmentContext;
  }

  getEnvironmentSetting(key: string): string {
    return this.environmentData[key];
  }

  get whitelistedDomains(): string[] {
    return this.environments.whitelistedDomains;
  }

  get blacklistedRoutes(): string[] {
    return this.environments.blacklistedRoutes;
  }

}
