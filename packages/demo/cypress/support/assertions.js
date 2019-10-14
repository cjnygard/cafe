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

const accessible = function (chai, utils) {
  const Assertion = chai.Assertion;
  utils.addProperty(Assertion.prototype, 'accessible', function () {
    let violations = "";
    if (this._obj.violations.length > 0) {
      cy.log('Accessibility violations found', this._obj.violations);
      violations = this._obj.violations
        .map((violation) => {
          return `
          ================================================================================
          ${
            violation.description
            }:${
            violation.nodes
              .map((node) => {
                return `
                --------------------------------------------------------------------------------
                target: ${
                  node.target.join(",")
                  }
                html: ${
                  node.html
                  }
                summary: ${
                  node.failureSummary
                  }`;
              })
              .join("")
            }`;
        })
        .join("\n");
    }
    this.assert(
      this._obj.violations.length === 0
      , `expected #{this} to have no accessibility violations, but had: ${violations}`
      , 'expected #{this} to have some accessibility violations'
    );
  });
};

chai.use(accessible);
