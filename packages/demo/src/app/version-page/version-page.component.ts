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

import {Component, Inject, OnInit} from '@angular/core';
import {CAFE_VERSION, GeneratedVersionData, VersionData} from './version-page.model';
import * as ld from 'lodash';
const _ = ld;

@Component({
  selector: 'cafe-version-page',
  template: `
    <div class="row">
      <div class="col-auto">
        <h1>Versions</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-auto">
        <table class="table table-striped">
          <tr>
            <th>Version Data Key</th>
            <th>Value</th>
          </tr>
          <tr *ngFor="let versionDatum of versionData" id="versionData-{{versionDatum.key}}">
            <td>{{versionDatum.key}}</td>
            <td>{{versionDatum.value}}</td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class VersionPageComponent implements OnInit {

  public versionData: VersionData[];

  constructor(@Inject(CAFE_VERSION) config: GeneratedVersionData = null) {
    this.versionData = _(config).entries()
      .filter((value: [string, any]) => value[0] !== 'semver')
      .map((value: [string, any]) => {
        return new VersionData(value[0], `${value[1]}`);
      })
      .value();
  }

  ngOnInit() {
  }

}
