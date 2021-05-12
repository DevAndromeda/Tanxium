# Tanxium
Custom, lightweight library to make simple http requests.

# Installation
```sh
$ npm install --save tanxium
```

# Example

```js
// ES6
import fetch from "tanxium";

// commonjs
const fetch = require("tanxium");

const url = "https://github.com";

fetch(url)
    .then(response => response.text())
    .then(data => console.log(`Received:\n\n${data}`))
    .catch(console.error);
```