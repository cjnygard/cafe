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
import './components/styles.css';

const CommunityAuthor = ({name, imageUrl, twitterUrl, githubUrl, description}) => {
    return(
        <>
        	<h2 className="communitySection">About the community author</h2>
        	<hr className="separator" />
        	<div className="authorSection">
        		<div className="authorImg">
        			<img src={imageUrl} />
        		</div>
        		<div className="authorDetails">
	        		<div className="authorName">
	        			<strong>{name}</strong>
	        			{twitterUrl ? (<a href={twitterUrl} target="_blank"><img src="https://storage.googleapis.com/graphql-engine-cdn.hasura.io/learn-hasura/assets/social-media/twitter-icon.svg" /></a>) : null}
	        			{githubUrl ? (<a href={githubUrl} target="_blank"><img src="https://storage.googleapis.com/graphql-engine-cdn.hasura.io/learn-hasura/assets/social-media/github-icon.svg" /></a>) : null}
	        		</div>
	        		<div className="authorDesc">
                        {description}
	        		</div>
        		</div>
        	</div>
        	<hr className="separator" />
        </>
    )
};

export default CommunityAuthor;
