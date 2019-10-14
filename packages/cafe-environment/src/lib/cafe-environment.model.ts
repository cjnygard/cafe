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

import {InjectionToken} from '@angular/core';

export interface Environment {
  readonly name: string;
  readonly defaultEnvironmentContext: string;

  [s: string]: any;
}

export interface EnvironmentOverride {
  readonly name: string;

  [s: string]: any;
}

export interface EnvironmentTrigger {
  readonly search: string;
  readonly environment: string;
}

export interface Environments {
  readonly defaultEnvironment: string;
  readonly environments: Environment[];
  readonly triggers: EnvironmentTrigger[];
  readonly whitelistedDomains: string[];
  readonly blacklistedRoutes: string[];
}

export interface EnvironmentsOverride {
  readonly defaultEnvironment?: string;

  readonly environments?: EnvironmentOverride[];
  readonly clearEnvironments?: boolean;

  readonly triggers?: EnvironmentTrigger[];
  readonly clearTriggers?: boolean;

  readonly whitelistedDomains?: string[];
  readonly clearWhitelistedDomains?: boolean;

  readonly blacklistedRoutes?: string[];
  readonly clearBlacklistedRoutes?: boolean;
}

export const CAFE_ENVIRONMENTS = new InjectionToken('CAFE_ENVIRONMENTS');

export interface CafeEnvironmentOptions {
  environments: Environments;
  overrides?: EnvironmentsOverride;
  applicationName: string;
}
