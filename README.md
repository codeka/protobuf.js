protobuf.js
===========

**Protocol Buffers** are a language-neutral, platform-neutral, extensible way of serializing structured data for use 
in communications protocols, data storage, and more, originally designed at Google ([see](https://developers.google.com/protocol-buffers/docs/overview)).

**protobuf.js** is a pure JavaScript implementation for node and browsers with zero dependencies. It efficiently encodes
plain objects and custom classes and works out of the box with .proto files.

**WARNING:** This is the development branch for protobuf.js 6, which is a complete but yet unfinished rewrite of the previous
codebase. If you are looking for the current stable version, see the [master branch](https://github.com/dcodeIO/protobuf.js).

Examples
--------

### Using .proto files

```protobuf
// awesome.proto
package awesomepackage;
syntax = "proto3";

message AwesomeMessage {
    string awesomefield = 1;
}
```

```js
var protobuf = require("protobufjs");
protobuf.load("awesome.proto", function(err, root) {
    if (err) throw err;
    
    // Obtain a message type
    var AwesomeMessage = root.lookup("awesomepackage.AwesomeMessage");

    // Create a new message
    var message = AwesomeMessage.create({ awesomefield: "AwesomeString" });

    // Encode a message (note that reflection encodes to a writer and we need to call finish)
    var buffer = AwesomeMessage.encode(message).finish();
    // ... do something with buffer

    // Or, encode a plain object (note that reflection encodes to a writer and we need to call finish)
    var buffer = AwesomeMessage.encode({ awesomefield: "AwesomeString" }).finish();
    // ... do something with buffer

    // Decode a buffer
    var message = AwesomeMessage.decode(buffer);
    // ... do something with message
});
```

You can also use promises by omitting the callback:

```js
protobuf.load("awesome.proto")
    .then(function(root) {
       ...
    });
``` 

### Using reflection instead

```js
...
var Root  = protobuf.Root,
    Type  = protobuf.Type,
    Field = protobuf.Field;

var AwesomeMessage = new Type("AwesomeMessage").add(new Field(1, "awesomefield", "string"));

var root = new Root().define("awesomepackage").add(AwesomeMessage);

// Continue at "Create a new message" above
...
```

### Using your own classes (wip)

```js
...
var Prototype = protobuf.Prototype;

function AwesomeMessage(properties) {
    Prototype.call(this, properties);
}
Prototype.extend(AwesomeMessage, root.lookup("awesomepackage.AwesomeMessage") /* or use reflection */);

var message = new AwesomeMessage({ awesomefield: "AwesomeString" });

// Encode a message (note that classes encode to a buffer directly)
var buffer = AwesomeMessage.encode(message);
// ... do something with buffer

// Or, encode a plain object (note that classes encode to a buffer directly)
var buffer = AwesomeMessage.encode({ awesomefield: "AwesomeString" });
// ... do something with buffer

// Decode a buffer
var message = AwesomeMessage.decode(buffer);
// ... do something with message
```

Structure
---------
The library exports the `protobuf` namespace with the following members:

### Parser

* **load(filename: `string|Array`, [root: `Root`], [callback: `function(err: Error, [root: Root])`]): `Promise`**<br />
  Loads one or multiple .proto files into the specified root or creates a new one when omitted.

* **tokenize(source: `string`): `Object`**<br />
  Tokenizes the given .proto source and returns an object with useful utility functions.

* **parse(source: `string`): `Object`**<br />
  Parses the given .proto source and returns an object with the parsed contents.
  
  * **package: `string|undefined`**<br />
    The package name, if declared.

  * **imports: `Array|undefined`**<br />
    File names of imported files, if any.

  * **publicImports: `Array|undefined`**<br />
    File names of publicly imported files, if any.

  * **weakImports: `Array|undefined`**<br />
    File names of weakly imported files, if any.

  * **syntax: `string|undefined`**<br />
    Source syntax, if defined.
 
  * **root: `Root`**<br />
    The root namespace.

### Serialization

* **Writer**<br />
  Wire format writer.

* **BufferWriter** *extends **Writer***<br />
  Wire format writer, node version.

* **Reader**<br />
  Wire format reader.

* **BufferReader** *extends **Reader***<br />
  Wire format reader, node version.

### Reflection

* **ReflectionObject**<br />
  Base class of all reflection objects.

* **Namespace** *extends **ReflectionObject***<br />
  Base class of all reflection objects containing nested objects.

* **Root** *extends **Namespace***<br />
  Root namespace.

* **Type** *extends **Namespace***<br />
  Reflected message type.

* **Field** *extends **ReflectionObject***<br />
  Reflected message field.

* **Enum** *extends **ReflectionObject***<br />
  Reflected enum.

* **Service** *extends **Namespace***<br />
  Reflected service.

* **Method** *extends **ReflectionObject***<br />
  Reflected service method.

### Runtime

* **Prototype**<br />
  Runtime message prototype ready to be extended by custom classes or generated code.

### Utility

* **util: `Object`**<br />
  Utility functions.

For now, you can find documentation on these objects in the respective source files within
`src/`.

To build production and development versions for the browser, run `npm install --dev` once,
then `gulp` and see the files created in `dist/`.

**License:** [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
