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

// This generates model files from an OpenAPI 3.0 definition
// It assumes all required objects are defined in
// .components.schemas{}
// it assumes the tag is the class name, and the value is the schema
// Note, it will not follow references outside the individual schema object tree

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

if (!argv.openapiUri && !argv.local) {
  throw 'A openapiUri must be specified on the command line for remote APIs';
}
if (!argv.openapiPath && argv.local) {
  throw 'A openapiPath must be specified on the command line for local schemas';
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

const openapiUri = argv.openapiUri;

let openapi = "";

if (!argv.local) {

  openapi = JSON.parse(request('GET', `${openapiUri}`).getBody());

} else {

  let fullInputPath;

  if (argv.openapiPath.match(/^\/.*/)) {
    fullInputPath = argv.openapiPath;
  } else {
    fullInputPath = resolve(path, argv.openapiPath);
  }
  options.cwd = fullInputPath;

  function readJsonFile(schemaFilename) {
    const fileContent = fs.readFileSync(schemaFilename, "utf8");
    console.log("read json file [", schemaFilename, "]");
    return JSON.parse(fileContent);
  }

  function readYamlFile(schemaFilename) {
    const fileContent = fs.readFileSync(schemaFilename, "utf8");
    console.log("read yaml file [", schemaFilename, "]");
    return yaml.safeLoad(fileContent, {"filename": schemaFilename, "json": "true"});
  }

  if (!!fullInputPath.match(/.*\.json$/)) {
    openapi = readJsonFile(fullInputPath);
  } else if (!!fullInputPath.match(/.*\.yaml$/)) {
    openapi = readYamlFile(fullInputPath);
  }
}

let overallSchema = {
  "type": "object",
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OverallSchema",
  "properties": {}
};

function replaceRefs(schema) {
  if(!schema) {
    return schema;
  }
  Object.keys(schema).forEach(function(k) {
    obj = schema[k];
    if(Array.isArray(obj)){
      obj.map(function(a) { return replaceRefs(a);});
    }else if(_.isPlainObject(obj)) {
      schema[k] = replaceRefs(obj);
    }else if(!!k.match(/^\$ref$/)) {
      schema[k] = schema[k].replace('components/schemas','definitions');
    }
  });
  return schema;
}

Object.keys(openapi.components.schemas).forEach(function(k) {
  overallSchema.definitions[k] = replaceRefs(openapi.components.schemas[k]);
});

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
