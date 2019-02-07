# gatsby-transformer-yaml-plus

A Gatsby transformer plugin to parse YAML files, with some extra goodies.

This plugin is based off of gatsby-transformer-yaml, and like `gatsby-transformer-yaml`, this plugin can:
* convert a yaml file object into a node
* convert an array of objects in a yaml file, each into their own node
* supports both `.yaml` and `.yml` extensions (anything with a mediaType of `text/yaml`)

Currently, the main benefits of `gatsby-transformer-yaml-plus` over `gatsby-transformer-yaml` are:
* Optional Markdown rendering 

## Installation

`npm i gatsby-transformer-yaml-plus`

You also need to install `gatsby-source-filesystem`, if it is not already:

`npm i gatsby-source-filesystem`

# Usage

`gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-yaml-plus`,
      options: {
        enableRemark: true,
        markdownPreface: 'md//',
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./content/`,
      },
    },
  ],
}
```

The path `./content/` should contain all the YAML files you want to parse.

## Structure of the Resulting Nodes

When processing your YAML files, this plugin can handle a root-level array of objects, like so:

`people.yaml`
```yaml
- name: Meg
  age: 31
- name: Joe
  age: 17
- name: Pat
  age: 54
```

Or you can have root-level objects in multiple files, like so:

```yaml
content/
  people/
    meg.yaml
    joe.yaml
    pat.yaml
```

`meg.yaml`
```yaml
name: Meg
age: 31
```

`joe.yaml`
```yaml
name: Joe
age: 17
```

`pat.yaml`
```yaml
name: Pat
age: 54
```

In both cases, you'd end up with the same three nodes:

```json
[
  {
    "name": "Meg",
    "age": 31,
  },
  {
    "name": "Joe",
    "age": 17,
  },
  {
    "name": "Pat",
    "age": 54,
  }
]
```


## Queries

Because the resulting structure of the nodes is the same if you choose to use an array of objects or files containing a single object, the GraphQL query is the same.

```graphql
{
  allPeopleYaml {
    edges {
      node {
        name
        age
      }
    }
  }
}
```

Which gives:

```javascript
{
  allPeopleYaml: {
    edges: [
      {
        node: {
          name: "Meg",
          age: 31
        },
      },
      {
        node: {
          name: "Joe",
          age: 17
        },
      },
      {
        node: {
          name: "Pat",
          age: 54
        },
      },
    ]
  }
}
```

## Markdown Support

The lack of markdown support in config-like files such as YAML has been an ongoing topic of discussion in the Gatsby community. A helpful feature of `gatsby-transformer-yaml-plus` is that it can optionally crawl through all the fields in a YAML file, and parse any fields which have a special `markdownPreface` identifier.

It looks like this:

```yaml
title: A Good Title
description: md//This description has some **markdown** in it.
```

Where 'md//' is the preface string required to tell `gatsby-transformer-yaml-plus` to render that field as HTML. If you want to change this string, just set `markdownPreface` in the plugin options in `gatsby-config.js`

# All plugin options

These are all of the plugin options which can be set in `gatsby-config.js`

| -- | -- |
| enableRemark | boolean (default: false) | 
| markdownPraface



