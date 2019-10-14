---
title: "Timestamps"
metaTitle: "CAFe Timestamp Specs"
metaDescription: "Details and examples of timetstamp formats"
---

# Timestamp Requirements

In general, a timestamp reflecting the local time on the user's machine should be captured for each event and included in a custom dimension.
For interoperability, this timestamp should adhere to the ISO 8601 Internet Date/Time Format (https://tools.ietf.org/html/rfc3339#section-5.6).

The following Javascript snippet provides an example of how to generate a timestamp in the required format:

```javascript
function getLocalDateISOString() {
    var now = new Date();
    var tzo = now.getTimezoneOffset();
    var pad = function(num, len) {
        var norm = Math.abs(Math.floor(num)).toString();
        if (norm.length > len) {
            return norm;
        }
        else {
            var padding = '';
            for (var i = 0; i < len - norm.length; i++) {
                padding += '0';
            }
            return padding + norm;
        }
    };
    return now.getFullYear().toString().concat(
        '-', pad(now.getMonth() + 1, 2),
        '-', pad(now.getDate(), 2),
        'T', pad(now.getHours(), 2),
        ':', pad(now.getMinutes(), 2),
        ':', pad(now.getSeconds(), 2),
        '.', pad(now.getMilliseconds(), 3),
        tzo < 0 ? '+' : '-', pad(Math.abs(tzo) / 60, 2),
        ':', pad(Math.abs(tzo) % 60, 2)
    )
}
```

If your client application utilizes Moment.js, a data layer variable (for example, "eventLocalTime") can be set using Moment's default timestamp format: 

```javascript
moment().format();
```

