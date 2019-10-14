# Copyright 2019 Cengage Learning, Inc
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# End license text.

#! /bin/bash

htmlLicenseFile=/tmp/htmlLicense
shellLicenseFile=/tmp/shellLicense
yamlLicenseFile=/tmp/yamlLicense

function findCopyright {
  local file=$1;

  if [ $(head -4 $file | grep Copyright | wc -l) -gt 0 ]
  then
    return 0;
  fi
  return 1;
}

function updateCopyright {
  local file=$1
  local license=$2

  echo "WARN: updating not implemented, can't update file: [${file}]"
}

function addCopyright {
  local filepath=$1
  local license=$2
  local filename=$(basename ${filepath})
  local newfile=/tmp/license.${filename}

  echo -n "Updating File [${filepath}]... "
  (cat ${license}; echo; cat ${filepath}) > ${newfile}
  cp ${newfile} ${filepath}
  rm ${newfile}

  echo "updated"
}

function findFiles {
  local type=$1

  # don't process build artifacts in ./node_modules or ./target
#  find . -type d \( -name node_modules -o -name target \) -prune -o -name "${type}" -type f -print
#  echo "find . -type d \( -name node_modules -o -name target -o -name .git -o -name .idea \) -prune -o -type f -name \"${type}\" -print"
  find . -type d \( -name node_modules -o -name target -o -name .git -o -name .idea \) -prune -o -type f -name "${type}" -print
}

function updateFiles {
  local type=$1;
  local licenseFile=$2;

  files=$(findFiles ${type})
  for f in ${files};
  do
    echo -n "Checking [$f] "
    if [ $(findCopyright $f) ]
    then
      updateCopyright ${f} ${licenseFile}
    else
      addCopyright ${f} ${licenseFile}
    fi
  done
}

function createHTMLLicenseFile {
  local license=$1
  echo "Creating [${license}] file"
  (echo "<!--"; cat $license; echo "-->") > ${htmlLicenseFile}
}

function createShellLicenseFile {
  local license=$1

  echo "Creating [${license}] file"
  cat ${license} | sed -e "s:^//:#:" > ${shellLicenseFile}
}

function createYAMLLicenseFile {
  local license=$1

  echo "Creating [${license}] file"
  cat ${license} | sed -e "s:^//:#:" > ${yamlLicenseFile}
}

createHTMLLicenseFile LICENSE
createShellLicenseFile LICENSE
createYAMLLicenseFile LICENSE

updateFiles "*.js" LICENSE
updateFiles "*.ts" LICENSE
updateFiles "*.java" LICENSE
updateFiles "*.scss" LICENSE
updateFiles "*.adoc" LICENSE
updateFiles "*.md" LICENSE
updateFiles "*.yaml" ${yamlLicenseFile}
updateFiles "*.xml" ${htmlLicenseFile}
updateFiles "*.html" ${htmlLicenseFile}
updateFiles "*.sh" ${shellLicenseFile}


# clean up
rm ${htmlLicenseFile}
rm ${yamlLicenseFile}
rm ${shellLicenseFile}
