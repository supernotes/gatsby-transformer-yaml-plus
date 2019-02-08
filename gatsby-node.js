"use strict";

const jsYaml = require(`js-yaml`);

const _ = require(`lodash`);

const path = require(`path`);

const remark = require('remark');

const remarkHTML = require('remark-html');

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest
}, opts) {
  // skip if not YAML
  if (node.internal.mediaType !== `text/yaml`) {
    return;
  } // plugin options defaults


  const markdownPreface = opts.markdownPreface || 'md//'; // add YAML object as node

  function transformObject(obj, id, type) {
    const yamlNode = { ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type
      }
    };
    createNode(yamlNode);
    createParentChildLink({
      parent: node,
      child: yamlNode
    });
  } // iterate through YAML object and render all 'prefaced' strings to HTML with Remark


  function recursiveMarkdownRender(obj) {
    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        const value = obj[property];

        if (_.isObject(value)) {
          obj[property] = recursiveMarkdownRender(value);
        } else {
          // value must be a string and not start with a period (look like a path)
          if (_.isString(value) && value.startsWith(markdownPreface)) {
            const html = remark().use(remarkHTML).processSync(value.split(markdownPreface).join('')).toString();
            obj[property] = html;
          }
        }
      }
    }

    return obj;
  }

  const {
    createNode,
    createParentChildLink
  } = actions;
  const content = await loadNodeContent(node);
  const parsedContent = jsYaml.load(content);

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(opts.enableRemark ? recursiveMarkdownRender(obj) : obj, obj.id || createNodeId(`${node.id} [${i}] >>> YAML`), _.upperFirst(_.camelCase(`${node.name} Yaml`)));
    });
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(opts.enableRemark ? recursiveMarkdownRender(parsedContent) : parsedContent, parsedContent.id || createNodeId(`${node.id} >>> YAML`), _.upperFirst(_.camelCase(`${path.basename(node.dir)} Yaml`)));
  }
}

exports.onCreateNode = onCreateNode;