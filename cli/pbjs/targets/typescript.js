/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
var description = "Runtime structures as TypeScript definition module, to be used alongside a commonjs module.";

var util = require("../util.js"),
    ProtoBuf = require(__dirname+"/../../../index.js"),
    js = require("./js.js");

/**
 * pbjs target: Runtime structures as a TypeScript definition module
 * @exports pbjs/targets/typescript
 * @function
 * @param {!ProtoBuf.Builder} builder Builder
 * @param {!Object.<string,*>=} options Options
 * @returns {string}
 */
var typescript = module.exports = function(builder, options) {
    options = options || {};
    builder.resolveAll();

    // Set the pointer to the lowest common namespace (with options)
    var ptr = builder.ns;
    while (ptr.children.length === 1 && Object.keys(ptr.options).length === 0 && ptr.children[0].className === "Namespace")
        ptr = ptr.children[0];

    var out = [];

    function trim() {
        out[out.length-1] = out[out.length-1].replace(/\n{2,}$/, "\n");
    }

    // Builds some "contant" helpers that we always need.
    function buildHelperObjects(indent) {
      out.push(indent, "export class Buffer {\n");
      out.push(indent, "  toArrayBuffer(): ArrayBuffer;\n");
      out.push(indent, "}\n");
      out.push("\n");
    }

    // Returns true if the given namespace has any children that need to be generated.
    function hasNamespaceChildren(ns) {
      var n = ns.getChildren(ProtoBuf.Reflect.Enum).length;
      n += ns.getChildren(ProtoBuf.Reflect.Message).length;
      n += ns.getChildren(ProtoBuf.Reflect.Namespace).length;
      return (n > 0);
    }

    // Builds everything within a namespace
    function buildNamespace(ns, indent) {
        ns.getChildren(ProtoBuf.Reflect.Enum).forEach(function(enm) {
            buildEnum(enm, indent);
        });
        ns.getChildren(ProtoBuf.Reflect.Message).forEach(function(msg) {
            if (!msg.isGroup) {// legacy groups are build within the respective field
                buildMessageParameters(msg, indent);
                buildMessage(msg, indent);
            }
        });
        ns.getChildren(ProtoBuf.Reflect.Namespace).forEach(function(innerNs) {
            if (innerNs.className !== "Namespace")
                return;
            out.push(indent);
            out.push("message ", innerNs.name, " {\n");
            buildNamespace(innerNs, indent+"    ");
            out.push(indent, "}\n");
        });
        trim();
    }

    function buildMessageParameters(msg, indent) {
        if (!msg.isGroup) {
            out.push(indent, "export class ", msg.name, "Parameters");
        }
        out.push(" {\n");
        var n = 0;
        msg.getChildren(ProtoBuf.Reflect.Message.Field).forEach(function(fld) {
            if (fld instanceof ProtoBuf.Reflect.Message.ExtensionField)
                return;
            buildMessageField(msg, fld, indent+"  ", true);
            n++;
        });
        out.push(indent, "}\n\n");
    }

    // Builds a message
    function buildMessage(msg, indent) {
        if (!msg.isGroup) {
            out.push(indent, "export class ", msg.name);
        }
        out.push(" {\n");
        var n = 0;
        msg.getChildren(ProtoBuf.Reflect.Message.Field).forEach(function(fld) {
            if (fld instanceof ProtoBuf.Reflect.Message.ExtensionField)
                return;
            buildMessageField(msg, fld, indent+"  ", false);
            n++;
        });
        if (n > 0)
            out.push("\n");

        out.push(indent, "  constructor(args?: ", msg.name, "Parameters);\n");
        out.push(indent, "  static decode(arr: ArrayBuffer): ", msg.name, ";\n");
        out.push(indent, "  encode(): Buffer;\n");       
        out.push(indent, "}\n");

        if (hasNamespaceChildren(msg)) {
            out.push(indent, "export module ", msg.name, " {\n");
            buildNamespace(msg, indent+"  ");
            out.push(indent, "}\n");
        }

        out.push("\n");
    }

    // Builds a message field
    function buildMessageField(msg, fld, indent, isParameters) {
        var isGroup = false;
        out.push(indent);
        out.push(fld.name);
        out.push(fld.required && !isParameters ? ": " : "?: ");
        if (fld.resolvedType !== null) {
            out.push(msg.parent.qn(fld.resolvedType));
            if (isParameters && fld.type.name != "enum") {
              out.push("Parameters");
            }
        } else {
            out.push(typeName(fld.type['name']));
        }
        if (fld.repeated) {
          out.push("[]");
        }
        out.push(";\n");
    }

    // Builds an enum
    function buildEnum(enm, indent) {
        out.push(indent, "enum ", enm.name, " {\n");
        enm.getChildren(ProtoBuf.Reflect.Enum.Value).forEach(function(val) {
            out.push(indent, "  ", val.name, ",\n");
        });
        out.push(indent, "}\n\n");
    }

    // Start by building the package namespace
    var pkg = ptr.fqn().substring(1);
    if (pkg !== "")
        out.push("export module ", pkg, " {\n\n");
    else
        out.push("export module ProtoBuf {\n\n");
    buildHelperObjects("  ");
    buildNamespace(ptr, "  ");
    out.push("}\n");
    return out.join('');
};

/**
 * Module description.
 * @type {string}
 */
typescript.description = description;

/**
 * Converts a proto type (int64, float32, etc) to a javascript type name.
 * @param {*} protoType The type name in proto format.
 * @returns {string} Dot proto value
 */
function typeName(protoType) {
    if (["int64", "int32", "float", "float", "uint32", "uint64"].indexOf(protoType) >= 0) {
      return "number";
    }

    if (protoType == "bool") {
      return "boolean";
    }

    // Just default to being the same (e.g. for string).
    return protoType;
}
