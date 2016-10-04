"use strict";
var React = require('react');
var formatJSON = function (obj) {
    var json = JSON.stringify(obj, null, 2);
    // Hide ampersands we don't want replaced
    json = json.replace(/&(amp|apos|copy|gt|lt|nbsp|quot|#x?\d+|[\w\d]+);/g, '\x01');
    // Escape remaining ampersands and other HTML special characters
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Restore hidden ampersands
    json = json.replace(/\x01/g, '&');
    // Match all the JSON parts and add theming markup
    json = json.replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, function (match) {
        // Default to "number"
        var cls = 'number';
        // Detect the type of the JSON part
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            }
            else {
                cls = 'string';
            }
        }
        else if (/true|false/.test(match)) {
            cls = 'boolean';
        }
        else if (/null/.test(match)) {
            cls = 'null';
        }
        if (cls === 'key') {
            // Color string content, not the quotes or colon delimiter
            var exec = /"(.*)":\s*/.exec(match);
            return "\"<span class=\"json-" + cls + "\">" + exec[1] + "</span>\": ";
        }
        else if (cls === 'string') {
            // Color string content, not the quotes
            var exec = /"(.*)"/.exec(match);
            return "\"<span class=\"json-" + cls + "\">" + exec[1] + "</span>\"";
        }
        else {
            return "<span class=\"json-" + cls + "\">" + match + "</span>";
        }
    });
    return React.createElement("span", {dangerouslySetInnerHTML: { __html: json }});
};
exports.FormattedJSON = function (props) {
    return formatJSON(props.obj || {});
};
//# sourceMappingURL=FormattedJSON.js.map