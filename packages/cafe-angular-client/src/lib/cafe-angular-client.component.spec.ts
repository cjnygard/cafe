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

import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {CafeAngularClientComponent} from './cafe-angular-client.component';
import {CafeAngularClientService} from './cafe-angular-client.service';

describe('CafeAngularClientComponent', () => {
  let component: CafeAngularClientComponent;
  let fixture: ComponentFixture<CafeAngularClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CafeAngularClientComponent],
      providers: [
        {
          provide: CafeAngularClientService,
          useValue: {
            flush() {
              // do nothing
            }
          }
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CafeAngularClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const service = getTestBed().get(CafeAngularClientService);
    spyOn(service, 'flush');
    window.dispatchEvent(new Event('beforeunload'));
    expect(service.flush).toHaveBeenCalled();
  });
});
