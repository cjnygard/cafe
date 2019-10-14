---
title: "UUID"
metaTitle: "CAFe UUID Specs"
metaDescription: "Details and examples of UUID formats and generation"
---

# UUID Generation

For generating unique session and event identifiers, we recommend a UUID (Type 4) generator solution.

## NPM / Node.js Solution

For projects that support the use of Node Package Manager (NPM), the "UUID" package can be utilized:

* https://www.npmjs.com/package/uuid

## Pure Javascript

For a pure Javascript implementation, the following method can be used:

! Note that this approach has its limitations (see source) and should only be used if a stronger solution like the "UUID" package noted above is not an option.

```javascript
// Source: https://stackoverflow.com/a/2117523
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```
