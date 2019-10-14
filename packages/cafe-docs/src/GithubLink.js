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

import React from 'react';
const githubIcon = require('./components/images/github.svg');
import './components/styles.css';

const GithubLink = ({link, text}) => {
	return (
		<a href={link} className="githubSection">
			<img className="githubIcon" src={githubIcon} alt="github"/>
			{text}
		</a>
	);
}

export default GithubLink;