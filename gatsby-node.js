"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const jsYaml = require('js-yaml');

const _ = require('lodash');

const path = require('path');

const remark = require('remark');

const remarkHTML = require('remark-html');

function onCreateNode(_x, _x2) {
  return _onCreateNode.apply(this, arguments);
}

function _onCreateNode() {
  _onCreateNode = (0, _asyncToGenerator2.default)(function* ({
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
      const yamlNode = Object.assign({}, obj, {
        id,
        children: [],
        parent: node.id,
        fileAbsolutePath: node.absolutePath,
        internal: {
          contentDigest: createContentDigest(obj),
          type
        }
      });
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

    const createNode = actions.createNode,
          createParentChildLink = actions.createParentChildLink;
    const content = yield loadNodeContent(node);
    const parsedContent = jsYaml.load(content);

    if (_.isArray(parsedContent)) {
      parsedContent.forEach((obj, i) => {
        transformObject(opts.enableRemark ? recursiveMarkdownRender(obj) : obj, obj.id || createNodeId(`${node.id} [${i}] >>> YAML`), _.upperFirst(_.camelCase(`${node.name} Yaml`)));
      });
    } else if (_.isPlainObject(parsedContent)) {
      transformObject(opts.enableRemark ? recursiveMarkdownRender(parsedContent) : parsedContent, parsedContent.id || createNodeId(`${node.id} >>> YAML`), _.upperFirst(_.camelCase(`${path.basename(node.dir)} Yaml`)));
    }
  });
  return _onCreateNode.apply(this, arguments);
}

exports.onCreateNode = onCreateNode;