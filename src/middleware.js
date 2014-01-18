'use strict';

module.exports = function (getSnippet,snippetExists,placeholder) {

    var excludeList = ['.woff', '.js', '.css', '.ico','.json','.swf'];

    function bodyExists(body) {
        if (!body) return false;
        return body.indexOf("<body")>=0;
    }

    function acceptsHtmlExplicit(req) {
        var accept = req.headers["accept"];
        if (!accept) return false;
        return (~accept.indexOf("html"));
    }

    function isExcluded(req) {
        var url = req.url;
        var excluded = false;
        if (!url) return true;
        excludeList.forEach(function(exclude) {
            if (~url.indexOf(exclude)) {
                excluded = true;
            }
        });
        return excluded;
    }

    var findBody = /<body[a-z\s\-="'_\(\)\.\,]+>/i;

    var injector = null;

    if (typeof placeholder === "function"){
        injector = function(body){
            return placeholder(body);
        };
    } else if (typeof placeholder === "string" || placeholder instanceof RegExp) {
        injector = function(body){
            return body.replace(placeholder,function() {
                return getSnippet();
            });
        };
    } else {
        injector = function(body){
            return body.replace(findBody, function(w) {
                return w + getSnippet();
            });
        };
    }


    return function(req, res, next) {
        var writeHead = res.writeHead;
        var write = res.write;
        var end = res.end;

        if (!acceptsHtmlExplicit(req) || isExcluded(req)) {
            return next();
        }

        res.push = function(chunk) {
            res.data = (res.data || '') + chunk;
        };

        res.inject = res.write = function(string, encoding) {
            res.write = write;
            if (typeof string !== "undefined") {
                var body = string instanceof Buffer ? string.toString(encoding) : string;

                if ((bodyExists(body) || bodyExists(res.data)) && !snippetExists(body) && (!res.data || !snippetExists(res.data))) {
                    res.push(injector(body));
                    return true;
                } else {
                    return res.write(string, encoding);
                }
            }
            return true;
        };

        res.end = function(string, encoding) {
            res.writeHead = writeHead;
            res.end = end;
            var result = res.inject(string, encoding);
            if (!result) {
                return res.end(string, encoding);
            }
            if (typeof res.data !== "undefined" && !res._header) {
                res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
            }
            return res.end(res.data, encoding);
        };
        return next();
    };
};