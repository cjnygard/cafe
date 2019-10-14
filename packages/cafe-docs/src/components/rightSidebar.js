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

import React from "react";
import { StaticQuery, graphql } from "gatsby";
import styled from "react-emotion";
import Link from "./link";
import './styles.css';
import config from '../../config';

const forcedNavOrder = config.sidebar.forcedNavOrder;

const Sidebar = styled('aside')`
  width: 100%;
  background-color: #fff;
  border-right: 1px solid #ede7f3;
  height: 100vh;
  overflow: auto;
  position: fixed;
  padding-left: 24px;
  position: -webkit-sticky;
  position: -moz-sticky;
  position: sticky;
  top: 0;
  @media only screen and (max-width: 50rem) {
    width: 100%;
    position: relative;
  }
`;

// eslint-disable-next-line no-unused-vars
const ListItem = styled(({ className, active, level, ...props }) => {
    return (
      <li className={className}>
        <a href={props.to} {...props} />
      </li>
    );
})`
  list-style: none;

  a {
    color: #5C6975;
    text-decoration: none;
    font-weight: ${({ level }) => (level === 0 ? 700 : 400)};
    padding: 0.45rem 0 0.45rem ${props => 2 + (props.level || 0) * 1}rem;
    display: block;
    position: relative;

    &:hover {
      color: rgb(116, 76, 188) !important;
    }

    ${props =>
      props.active &&
      `
      color: #663399;
      border-color: rgb(230,236,241) !important;
      border-style: solid none solid solid;
      border-width: 1px 0px 1px 1px;
      background-color: #fff;
    `} // external link icon
    svg {
      float: right;
      margin-right: 1rem;
    }
  }
`;

const SidebarLayout = ({ location }) => (
  <StaticQuery
    query={graphql`
      query {
        allMdx {
          edges {
            node {
              fields {
                slug
              }
              tableOfContents
            }
          }
        }
      }
    `}
    render={({ allMdx }) => {
      let navItems = [];
      let finalNavItems;
      if (allMdx.edges !== undefined && allMdx.edges.length > 0) {
        const navItems = allMdx.edges.map((item, index) => {
          let innerItems;
          if(item !== undefined) {
            if ((item.node.fields.slug === location.pathname) || (config.gatsby.pathPrefix + item.node.fields.slug) === location.pathname) {
              if (item.node.tableOfContents.items) {
                innerItems = item.node.tableOfContents.items.map((innerItem, index) => {
                  const itemId = innerItem.title ? innerItem.title.replace(/\s+/g, '').toLowerCase() : '#';
                  return (
                    <ListItem
                      key={index}
                      to={`#${itemId}`}
                      level={1}
                    >
                      {innerItem.title}
                    </ListItem>
                  );
                });
              }
            }
          }
          if (innerItems) {
            finalNavItems = innerItems;
          }
        });
      }

      if (finalNavItems && finalNavItems.length) {
        return (
          <Sidebar>
            <ul className={'rightSideBarUL'}>
              <div className={'rightSideTitle'}>CONTENTS</div>
              {finalNavItems}
            </ul>
          </Sidebar>
        );
      } else {
        return (
          <Sidebar>
            <ul></ul>
          </Sidebar>
        );
      }
    }}
  />
);

export default SidebarLayout;
