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

/**
 * This file only purpose is to execute any build related tasks
 */

const { resolve, normalize } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const pkg = require('../package.json');

const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const TYPES_ROOT_FILE = resolve(DIST, normalize(pkg.typings));

main();

function main() {
  writeDtsHeader();
}

function writeDtsHeader() {
  const dtsHeader = getDtsHeader(pkg.name, pkg.version, pkg.author, pkg.repository.url, pkg.devDependencies.typescript);

  prependFileSync(TYPES_ROOT_FILE, dtsHeader);
}

/**
 *
 * @param {string} pkgName
 * @param {string} version
 * @param {string} author
 * @param {string} repoUrl
 * @param {string} tsVersion
 */
function getDtsHeader(pkgName, version, author, repoUrl, tsVersion) {
  const extractUserName = repoUrl.match(/\.com\/([\w-]+)\/\w+/i);
  const githubUserUrl = extractUserName ? extractUserName[1] : 'Unknown';

  return `
// Type definitions for ${pkgName} ${version}
// Project: ${repoUrl}
// Definitions by: ${author} <https://github.com/${githubUserUrl}>
// Definitions: ${repoUrl}
// TypeScript Version: ${tsVersion}
`.replace(/^\s+/gm, '');
}

/**
 *
 * @param {string} path
 * @param {string | Blob} data
 */
function prependFileSync(path, data) {
  const existingFileContent = readFileSync(path, {
    encoding: 'utf8',
  });
  const newFileContent = [data, existingFileContent].join('\n');
  writeFileSync(path, newFileContent, {
    flag: 'w+',
    encoding: 'utf8',
  });
}
