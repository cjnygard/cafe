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

const { compile } = require('json-schema-to-typescript');
const { resolve } = require('path');
const fs = require('fs');
const request = require('sync-request');
const rimraf = require('rimraf');
const _ = require('lodash');
const appRoot = require('app-root-path');
const findUp = require('find-up');

const configPath = findUp.sync(['.cafe-schema-rc', '.cafe-schema-rc.json']);
const config = configPath
  ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  : JSON.parse(fs.readFileSync(resolve(appRoot.path, 'config', 'default-schema-rc.json'), 'utf-8'));

const argv = require('yargs').config(config).argv;

const apiName = argv.apiName;
const baseUri = argv.baseUri;
const inputDirectory = argv.inputDirectory;
const local = argv.local;
const modelName = argv.modelName;
const namespace = argv.namespace;
let outputFile = argv.outputFile;
const schemaInputFile = argv.schemaInputFile;

console.info('Model generation input:');
console.info(`   apiName:         ${apiName}`);
console.info(`   baseUri:         ${baseUri}`);
console.info(`   inputDirectory:  ${inputDirectory}`);
console.info(`   local:           ${local}`);
console.info(`   modelName:       ${modelName}`);
console.info(`   namespace:       ${namespace}`);
console.info(`   outputFile:      ${outputFile}`);
console.info(`   schemaInputFile: ${schemaInputFile}`);

if (!baseUri && !local) {
  throw 'A baseUri must be specified on the command line for remote APIs';
}
if (!inputDirectory && local) {
  throw 'A inputDirectory must be specified on the command line for local schemas';
}
if (!apiName && !local) {
  throw 'A apiName must be specified on the command line for remote APIs';
}
if (!modelName && local) {
  throw 'A modelName must be specified on the command line for local APIs';
}

const options = {
  unreachableDefinitions: true,
  style: {
    printWidth: 140,
    singleQuote: true,
  },
};

let directorySegments = [];
if (outputFile) {
  if (!outputFile.match(/^\/.*/)) {
    outputFile = resolve(appRoot.path, outputFile);
  }
  directorySegments = outputFile.split('/').slice(0, -1);
} else {
  outputFile = resolve(appRoot.path, 'src', 'app', 'model', apiName || modelName, 'api.ts');
  directorySegments = ['src', 'app', 'model', apiName || modelName];
}

let soFar = appRoot.path;
_.forEach(directorySegments, (segment) => {
  soFar = resolve(soFar, segment);
  if (!fs.existsSync(soFar)) {
    fs.mkdirSync(soFar);
  }
});

if (fs.existsSync(outputFile)) {
  rimraf.sync(outputFile);
}

let overallSchema = {
  type: 'object',
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'OverallSchema',
  properties: {},
};

if (!local) {
  function download(schemaName) {
    const res = request('GET', `${baseUri}/schema/${schemaName}`);
    overallSchema.definitions[schemaName] = JSON.parse(
      `${res.getBody()}`.replace(/"http.*schema\/([^"]+)"/g, '"#/definitions/$1"')
    );
  }

  const schemas = JSON.parse(request('GET', `${baseUri}/schemas`).getBody('utf-8'));

  schemas.forEach((schemaName) => {
    return download(schemaName);
  });
} else {
  let fullInputDir;

  if (inputDirectory.match(/^\/.*/)) {
    fullInputDir = inputDirectory;
  } else {
    fullInputDir = resolve(appRoot.path, inputDirectory);
  }

  options.cwd = fullInputDir;

  function readFile(schemaFileName) {
    const fullFilePath = resolve(fullInputDir, schemaFileName);
    const fileContent = fs.readFileSync(fullFilePath, 'utf8');
    overallSchema.definitions[schemaFileName.replace(/\.schema\.json$/, '')] = JSON.parse(fileContent);
  }

  if (schemaInputFile) {
    readFile(schemaInputFile);
  } else {
    const schemaFiles = fs.readdirSync(fullInputDir).filter((fileName) => {
      return !!fileName.match(/.*\.schema\.json$/);
    });

    schemaFiles.forEach((schemaFileName) => {
      readFile(schemaFileName);
    });
  }
}

return compile(overallSchema, 'OverallSchema', options).then((ts) => {
  if (namespace) {
    fs.writeFileSync(
      outputFile,
      `export namespace ${namespace} {\n${ts.replace(/^/gm, '  ').replace(/^ +$/gm, '')}}\n`
    );
  } else {
    fs.writeFileSync(outputFile, ts);
  }
});
