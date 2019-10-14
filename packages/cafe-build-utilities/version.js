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

#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

var appRoot = require('app-root-path');
var path = (argv.path === undefined) ? appRoot.path : argv.path;

const { gitDescribeSync } = require('git-describe');
const { version } = require(path + '/package.json');
const { resolve, relative } = require('path');
const fs = require('fs');
const { writeFileSync } = require('fs-extra');

const gitInfo = gitDescribeSync({
  dirtyMark: false,
  dirtySemver: false
});

console.log(`package version[${version}]`);
gitInfo.version = version;

const srcDir = resolve(path, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

const environmentsDir = resolve(srcDir, 'environments');
if (!fs.existsSync(environmentsDir)) {
  fs.mkdirSync(environmentsDir);
}

const file = resolve(environmentsDir, 'version.ts');
writeFileSync(file,
  `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION: { readonly version: string; [s: string]: any; } = ${JSON.stringify(gitInfo, null, 4)};
/* tslint:enable */
`, { encoding: 'utf-8' });

console.log(`Wrote version info ${gitInfo.raw}:${gitInfo.version} to ${relative(resolve(__dirname, '..'), file)}`);
