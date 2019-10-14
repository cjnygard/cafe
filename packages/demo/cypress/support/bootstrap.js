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

before(function () {

	function envOrDefault(name, defaults) {
		return Cypress.env(name) ? Cypress.env(name) : defaults[name];
	}

	cy.fixture(Cypress.env('defaultFixture'))
		.then((defaultFixtureJson) => {
		let applicationName = envOrDefault('applicationName', defaultFixtureJson);
	let environmentName = envOrDefault('environmentName', defaultFixtureJson);
	Cypress.env({
		baseUrl: envOrDefault('baseUrl', defaultFixtureJson),
		ssoUsername: envOrDefault('ssoUsername', defaultFixtureJson),
		ssoPassword: envOrDefault('ssoPassword', defaultFixtureJson),
		ssoEndpoint: envOrDefault('ssoEndpoint', defaultFixtureJson),
		authEndpoint: envOrDefault('authEndpoint', defaultFixtureJson),
		applicationName: applicationName,
		environmentName: environmentName,
		jwtStorageKey: `cg_portal_access_token/${environmentName}/${applicationName}`,
	});
	return cy.request('POST', `${Cypress.env('ssoEndpoint')}/ssows/rest/getToken`,
		{'uid': Cypress.env('ssoUsername'), 'password': Cypress.env('ssoPassword')});
	})
	.then(response => {
			return cy.request({
				method: 'GET',
				url: Cypress.env('authEndpoint'),
				headers: {'cengage-sso-token': response.body.token},
			});
	})
	.then(response => {
			Cypress.env({
			jwtToken: response.body.jwtToken,
			configured: 'true',
		});
	});
});
