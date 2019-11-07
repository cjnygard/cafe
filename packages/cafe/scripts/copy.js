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
 * This file only purpose is to copy files before npm publish and strip churn/security sensitive metadata from package.json
 *
 * **NOTE:**
 * 👉 This file should not use any 3rd party dependency
 */
const { writeFileSync, copyFileSync, statSync, readFileSync } = require('fs');
const { resolve, basename } = require('path');
const packageJson = require('../package.json');

const findUp = require('find-up');

const configPath = findUp.sync(['.publish-config-rc', '.publish-config-rc.json']);
const optionalPublishConfig = configPath ? JSON.parse(readFileSync(configPath, 'utf-8')) : {};

main();

function main() {
  const projectRoot = resolve(__dirname, '..');
  const distPath = resolve(projectRoot, 'dist');
  const distPackageJson = createDistPackageJson(packageJson);

//  const cpFiles = ['README.md', 'CHANGELOG.md', 'LICENSE.md', '.npmignore'].map((file) => resolve(projectRoot, file));
  const cpFiles = ['../../.npmignore'].map((file) => resolve(projectRoot, file));

  cp(cpFiles, distPath);

  writeFileSync(resolve(distPath, 'package.json'), distPackageJson);
}

/**
 *
 * @param {string[]|string} source
 * @param {string} target
 */
function cp(source, target) {
  const isDir = statSync(target).isDirectory();

  if (isDir) {
    if (!Array.isArray(source)) {
      throw new Error('if <target> is directory you need to provide source as an array');
    }

    source.forEach((file) => copyFileSync(file, resolve(target, basename(file))));

    return;
  }

  copyFileSync(/** @type {string} */ (source), target);
}

/**
 * @param {any} packageConfig
 * @return {string}
 */
function createDistPackageJson(packageConfig) {
  const { devDependencies, scripts, engines, config, 'lint-staged': lintStaged, ...distPackageJson } = packageConfig;

  if (optionalPublishConfig && optionalPublishConfig.publishConfig) {
    distPackageJson.publishConfig = optionalPublishConfig.publishConfig;
  }

  return JSON.stringify(distPackageJson, null, 2);
}
