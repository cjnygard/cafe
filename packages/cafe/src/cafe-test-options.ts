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


/*
 * If you make changes to these interfaces,, you need to make corresponding changes to RequiredEventingOptions,
 * and to DefaultEventingConfiguration.  Also a new parameter to AngularDefaultEventingOptions and a new getter
 * in that class
 */

export interface TestOptions {
  readonly apiKey?: string;
  readonly bufferInterval?: number;
}


export interface OldRequiredTestOptions extends TestOptions {
  readonly maxBufferSize?: number;
}


