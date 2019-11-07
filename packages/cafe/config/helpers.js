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

module.exports = {
  camelCaseToDash,
  dashToCamelCase,
  toUpperCase,
  pascalCase,
  normalizePackageName,
  getOutputFileName,
};

/**
 *
 * @param {string} myStr
 */
function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 *
 * @param {string} myStr
 */
function dashToCamelCase(myStr) {
  return myStr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 *
 * @param {string} myStr
 */
function toUpperCase(myStr) {
  return `${myStr.charAt(0).toUpperCase()}${myStr.substr(1)}`;
}

/**
 *
 * @param {string} myStr
 */
function pascalCase(myStr) {
  return toUpperCase(dashToCamelCase(myStr));
}

/**
 *
 * @param {string} rawPackageName
 */
function normalizePackageName(rawPackageName) {
  const scopeEnd = rawPackageName.indexOf('/') + 1;

  return rawPackageName.substring(scopeEnd);
}

/**
 *
 * @param {string} fileName
 * @param {boolean?} isProd
 */
function getOutputFileName(fileName, isProd = false) {
  return isProd ? fileName.replace(/\.js$/, '.min.js') : fileName;
}
