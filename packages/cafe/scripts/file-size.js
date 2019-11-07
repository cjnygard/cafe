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

const { basename, normalize } = require('path');
const { readFile: readFileCb } = require('fs');
const { promisify } = require('util');
const readFile = promisify(readFileCb);

const kolor = require('kleur');
const prettyBytes = require('pretty-bytes');
const brotliSize = require('brotli-size');
const gzipSize = require('gzip-size');
const { log } = console;
const pkg = require('../package.json');

main();

async function main() {
  const args = process.argv.splice(2);
  const filePaths = [...args.map(normalize)];
  const fileMetadata = await Promise.all(
    filePaths.map(async (filePath) => {
      return {
        path: filePath,
        blob: await readFile(filePath, { encoding: 'utf8' }),
      };
    })
  );

  const output = await Promise.all(fileMetadata.map((metadata) => getSizeInfo(metadata.blob, metadata.path)));

  log(getFormatedOutput(pkg.name, output));
}

/**
 *
 * @param {string} pkgName
 * @param {string[]} filesOutput
 */
function getFormatedOutput(pkgName, filesOutput) {
  const MAGIC_INDENTATION = 3;
  const WHITE_SPACE = ' '.repeat(MAGIC_INDENTATION);

  return (
    kolor.blue(`${pkgName} bundle sizes: 📦`) +
    `\n${WHITE_SPACE}` +
    readFile.name +
    filesOutput.join(`\n${WHITE_SPACE}`)
  );
}

/**
 *
 * @param {number} size
 * @param {string} filename
 * @param {'br' | 'gz'} type
 * @param {boolean} raw
 */
function formatSize(size, filename, type, raw) {
  const pretty = raw ? `${size} B` : prettyBytes(size);
  const color = size < 5000 ? 'green' : size > 40000 ? 'red' : 'yellow';
  const MAGIC_INDENTATION = type === 'br' ? 13 : 10;

  return `${' '.repeat(MAGIC_INDENTATION - pretty.length)}${kolor[color](pretty)}: ${kolor.white(
    basename(filename)
  )}.${type}`;
}

/**
 *
 * @param {string} code
 * @param {string} filename
 * @param {boolean} [raw=false]
 */
async function getSizeInfo(code, filename, raw = false) {
  const isRaw = raw || code.length < 5000;
  const gzip = formatSize(await gzipSize(code), filename, 'gz', isRaw);
  const brotli = formatSize(await brotliSize.default(code), filename, 'br', isRaw);
  return gzip + '\n' + brotli;
}
