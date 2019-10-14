#! /usr/bin/env node

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


var argv = require('minimist')(process.argv.slice(2));

const {compile} = require('json-schema-to-typescript');
const {resolve} = require('path');
const fs = require('fs');
const request = require('sync-request');
const rimraf = require('rimraf');
const _ = require('lodash');
const appRoot = require('app-root-path');
const yaml = require('js-yaml');

var path = (argv.path === undefined) ? appRoot.path : argv.path;

if (!argv.baseUri && !argv.local) {
  throw 'A baseUri must be specified on the command line for remote APIs';
}
if (!argv.inputDirectory && argv.local) {
  throw 'A inputDirectory must be specified on the command line for local schemas';
}
if (!argv.apiName && !argv.local) {
  throw 'A apiName must be specified on the command line for remote APIs';
}
if (!argv.modelName && argv.local) {
  throw 'A modelName must be specified on the command line for local APIs';
}

const options = {
  unreachableDefinitions: true,
  style: {
    printWidth: 140,
    singleQuote: true
  }
};

let outputFile = '';
let directorySegments = [];
if (argv.outputFile) {
  if (argv.outputFile.match(/^\/.*/)) {
    outputFile = argv.outputFile;
  } else {
    outputFile = resolve(path, argv.outputFile);
  }
  directorySegments = argv.outputFile.split('/').slice(0, -1);
} else {
  outputFile = resolve(path, 'src', 'app', 'model', argv.apiName || argv.modelName, 'api.ts');
  directorySegments = ['src', 'app', 'model', argv.local ? argv.modelName : argv.apiName];
}

let soFar = path;
_.forEach(
  directorySegments,
  function (segment) {
    soFar = resolve(soFar, segment);
    if (!fs.existsSync(soFar)) {
      fs.mkdirSync(soFar);
    }
  }
);

if (fs.existsSync(outputFile)) {
  rimraf.sync(outputFile);
}

const baseUri = argv.baseUri;

let overallSchema = {
  "type": "object",
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OverallSchema",
  "properties": {}
};

if (!argv.local) {

  function download(schemaName) {
    const res = request('GET', `${baseUri}/schema/${schemaName}`);
    overallSchema.definitions[schemaName] = JSON.parse(
      `${res.getBody()}`.replace(/"http.*schema\/([^"]+)"/g, '"#/definitions/$1"')
    );
  }

  const schemas = JSON.parse(request('GET', `${baseUri}/schemas`).getBody());

  schemas
    .forEach(function (schemaName) {
      return download(schemaName);
    });
} else {

  let fullInputDir;

  if (argv.inputDirectory.match(/^\/.*/)) {
    fullInputDir = argv.inputDirectory;
  } else {
    fullInputDir = resolve(path, argv.inputDirectory);
  }
  console.log("input dir [", fullInputDir, "]");
  options.cwd = fullInputDir;

  function readJsonFile(schemaFileName) {
    const fullFilePath = resolve(fullInputDir, schemaFileName);
    const fileContent = fs.readFileSync(fullFilePath, "utf8");
    console.log("read json file [", fullFilePath, "]");
    overallSchema.definitions[schemaFileName.replace(/\.schema\.json$/, '')] = JSON.parse(
      fileContent
    );
  }

  function readYamlFile(schemaFileName) {
    const fullFilePath = resolve(fullInputDir, schemaFileName);
    const fileContent = fs.readFileSync(fullFilePath, "utf8");
    console.log("read yaml file [", fullFilePath, "]");
    overallSchema.definitions[schemaFileName.replace(/\.schema\.yaml$/, '')] =
      yaml.safeLoad(fileContent, { "filename": "fullFilePath", "json": "true" });
  }

  if (argv.schemaInputFile) {
    readFile(argv.schemaInputFile)
  } else {
    const allFiles = fs.readdirSync(fullInputDir);
    const jsonSchemaFiles = allFiles.filter(function (fileName) {
      return !!fileName.match(/.*\.schema\.json$/);
    });
    const yamlSchemaFiles = allFiles.filter(function (fileName) {
      return !!fileName.match(/.*\.schema\.yaml$/);
    });

    jsonSchemaFiles
      .forEach(function (schemaFileName) {
        readJsonFile(schemaFileName);
      });

    yamlSchemaFiles
      .forEach(function (schemaFileName) {
        readYamlFile(schemaFileName);
      });
  }

}

return compile(overallSchema, 'OverallSchema', options)
  .then(ts => {
    if (argv.namespace) {
      fs.writeFileSync(
        outputFile,
        `export namespace ${argv.namespace} {\n${ts.replace(/^/gm, '  ').replace(/^ +$/gm,'')}\n}\n`
      );
    } else {
      fs.writeFileSync(outputFile, ts);
    }
  });
