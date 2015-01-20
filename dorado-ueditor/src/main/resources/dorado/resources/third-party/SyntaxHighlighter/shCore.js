
var XRegExp;
if (XRegExp) {
    throw Error("can't load XRegExp twice in the same frame");
}
(function (undefined) {
    XRegExp = function (pattern, flags) {
        var output = [], currScope = XRegExp.OUTSIDE_CLASS, pos = 0, context, tokenResult, match, chr, regex;
        if (XRegExp.isRegExp(pattern)) {
            if (flags !== undefined) {
                throw TypeError("can't supply flags when constructing one RegExp from another");
            }
            return clone(pattern);
        }
        if (isInsideConstructor) {
            throw Error("can't call the XRegExp constructor within token definition functions");
        }
        flags = flags || "";
        context = {hasNamedCapture:false, captureNames:[], hasFlag:function (flag) {
            return flags.indexOf(flag) > -1;
        }, setFlag:function (flag) {
            flags += flag;
        }};
        while (pos < pattern.length) {
            tokenResult = runTokens(pattern, pos, currScope, context);
            if (tokenResult) {
                output.push(tokenResult.output);
                pos += (tokenResult.match[0].length || 1);
            } else {
                if (match = nativ.exec.call(nativeTokens[currScope], pattern.slice(pos))) {
                    output.push(match[0]);
                    pos += match[0].length;
                } else {
                    chr = pattern.charAt(pos);
                    if (chr === "[") {
                        currScope = XRegExp.INSIDE_CLASS;
                    } else {
                        if (chr === "]") {
                            currScope = XRegExp.OUTSIDE_CLASS;
                        }
                    }
                    output.push(chr);
                    pos++;
                }
            }
        }
        regex = RegExp(output.join(""), nativ.replace.call(flags, flagClip, ""));
        regex._xregexp = {source:pattern, captureNames:context.hasNamedCapture ? context.captureNames : null};
        return regex;
    };
    XRegExp.version = "1.5.1";
    XRegExp.INSIDE_CLASS = 1;
    XRegExp.OUTSIDE_CLASS = 2;
    var replacementToken = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g, flagClip = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g, quantifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/, isInsideConstructor = false, tokens = [], nativ = {exec:RegExp.prototype.exec, test:RegExp.prototype.test, match:String.prototype.match, replace:String.prototype.replace, split:String.prototype.split}, compliantExecNpcg = nativ.exec.call(/()??/, "")[1] === undefined, compliantLastIndexIncrement = function () {
        var x = /^/g;
        nativ.test.call(x, "");
        return !x.lastIndex;
    }(), hasNativeY = RegExp.prototype.sticky !== undefined, nativeTokens = {};
    nativeTokens[XRegExp.INSIDE_CLASS] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
    nativeTokens[XRegExp.OUTSIDE_CLASS] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;
    XRegExp.addToken = function (regex, handler, scope, trigger) {
        tokens.push({pattern:clone(regex, "g" + (hasNativeY ? "y" : "")), handler:handler, scope:scope || XRegExp.OUTSIDE_CLASS, trigger:trigger || null});
    };
    XRegExp.cache = function (pattern, flags) {
        var key = pattern + "/" + (flags || "");
        return XRegExp.cache[key] || (XRegExp.cache[key] = XRegExp(pattern, flags));
    };
    XRegExp.copyAsGlobal = function (regex) {
        return clone(regex, "g");
    };
    XRegExp.escape = function (str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    XRegExp.execAt = function (str, regex, pos, anchored) {
        var r2 = clone(regex, "g" + ((anchored && hasNativeY) ? "y" : "")), match;
        r2.lastIndex = pos = pos || 0;
        match = r2.exec(str);
        if (anchored && match && match.index !== pos) {
            match = null;
        }
        if (regex.global) {
            regex.lastIndex = match ? r2.lastIndex : 0;
        }
        return match;
    };
    XRegExp.freezeTokens = function () {
        XRegExp.addToken = function () {
            throw Error("can't run addToken after freezeTokens");
        };
    };
    XRegExp.isRegExp = function (o) {
        return Object.prototype.toString.call(o) === "[object RegExp]";
    };
    XRegExp.iterate = function (str, regex, callback, context) {
        var r2 = clone(regex, "g"), i = -1, match;
        while (match = r2.exec(str)) {
            if (regex.global) {
                regex.lastIndex = r2.lastIndex;
            }
            callback.call(context, match, ++i, str, regex);
            if (r2.lastIndex === match.index) {
                r2.lastIndex++;
            }
        }
        if (regex.global) {
            regex.lastIndex = 0;
        }
    };
    XRegExp.matchChain = function (str, chain) {
        return function recurseChain(values, level) {
            var item = chain[level].regex ? chain[level] : {regex:chain[level]}, regex = clone(item.regex, "g"), matches = [], i;
            for (i = 0; i < values.length; i++) {
                XRegExp.iterate(values[i], regex, function (match) {
                    matches.push(item.backref ? (match[item.backref] || "") : match[0]);
                });
            }
            return ((level === chain.length - 1) || !matches.length) ? matches : recurseChain(matches, level + 1);
        }([str], 0);
    };
    RegExp.prototype.apply = function (context, args) {
        return this.exec(args[0]);
    };
    RegExp.prototype.call = function (context, str) {
        return this.exec(str);
    };
    RegExp.prototype.exec = function (str) {
        var match, name, r2, origLastIndex;
        if (!this.global) {
            origLastIndex = this.lastIndex;
        }
        match = nativ.exec.apply(this, arguments);
        if (match) {
            if (!compliantExecNpcg && match.length > 1 && indexOf(match, "") > -1) {
                r2 = RegExp(this.source, nativ.replace.call(getNativeFlags(this), "g", ""));
                nativ.replace.call((str + "").slice(match.index), r2, function () {
                    for (var i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined) {
                            match[i] = undefined;
                        }
                    }
                });
            }
            if (this._xregexp && this._xregexp.captureNames) {
                for (var i = 1; i < match.length; i++) {
                    name = this._xregexp.captureNames[i - 1];
                    if (name) {
                        match[name] = match[i];
                    }
                }
            }
            if (!compliantLastIndexIncrement && this.global && !match[0].length && (this.lastIndex > match.index)) {
                this.lastIndex--;
            }
        }
        if (!this.global) {
            this.lastIndex = origLastIndex;
        }
        return match;
    };
    RegExp.prototype.test = function (str) {
        var match, origLastIndex;
        if (!this.global) {
            origLastIndex = this.lastIndex;
        }
        match = nativ.exec.call(this, str);
        if (match && !compliantLastIndexIncrement && this.global && !match[0].length && (this.lastIndex > match.index)) {
            this.lastIndex--;
        }
        if (!this.global) {
            this.lastIndex = origLastIndex;
        }
        return !!match;
    };
    String.prototype.match = function (regex) {
        if (!XRegExp.isRegExp(regex)) {
            regex = RegExp(regex);
        }
        if (regex.global) {
            var result = nativ.match.apply(this, arguments);
            regex.lastIndex = 0;
            return result;
        }
        return regex.exec(this);
    };
    String.prototype.replace = function (search, replacement) {
        var isRegex = XRegExp.isRegExp(search), captureNames, result, str, origLastIndex;
        if (isRegex) {
            if (search._xregexp) {
                captureNames = search._xregexp.captureNames;
            }
            if (!search.global) {
                origLastIndex = search.lastIndex;
            }
        } else {
            search = search + "";
        }
        if (Object.prototype.toString.call(replacement) === "[object Function]") {
            result = nativ.replace.call(this + "", search, function () {
                if (captureNames) {
                    arguments[0] = new String(arguments[0]);
                    for (var i = 0; i < captureNames.length; i++) {
                        if (captureNames[i]) {
                            arguments[0][captureNames[i]] = arguments[i + 1];
                        }
                    }
                }
                if (isRegex && search.global) {
                    search.lastIndex = arguments[arguments.length - 2] + arguments[0].length;
                }
                return replacement.apply(null, arguments);
            });
        } else {
            str = this + "";
            result = nativ.replace.call(str, search, function () {
                var args = arguments;
                return nativ.replace.call(replacement + "", replacementToken, function ($0, $1, $2) {
                    if ($1) {
                        switch ($1) {
                          case "$":
                            return "$";
                          case "&":
                            return args[0];
                          case "`":
                            return args[args.length - 1].slice(0, args[args.length - 2]);
                          case "'":
                            return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
                          default:
                            var literalNumbers = "";
                            $1 = +$1;
                            if (!$1) {
                                return $0;
                            }
                            while ($1 > args.length - 3) {
                                literalNumbers = String.prototype.slice.call($1, -1) + literalNumbers;
                                $1 = Math.floor($1 / 10);
                            }
                            return ($1 ? args[$1] || "" : "$") + literalNumbers;
                        }
                    } else {
                        var n = +$2;
                        if (n <= args.length - 3) {
                            return args[n];
                        }
                        n = captureNames ? indexOf(captureNames, $2) : -1;
                        return n > -1 ? args[n + 1] : $0;
                    }
                });
            });
        }
        if (isRegex) {
            if (search.global) {
                search.lastIndex = 0;
            } else {
                search.lastIndex = origLastIndex;
            }
        }
        return result;
    };
    String.prototype.split = function (s, limit) {
        if (!XRegExp.isRegExp(s)) {
            return nativ.split.apply(this, arguments);
        }
        var str = this + "", output = [], lastLastIndex = 0, match, lastLength;
        if (limit === undefined || +limit < 0) {
            limit = Infinity;
        } else {
            limit = Math.floor(+limit);
            if (!limit) {
                return [];
            }
        }
        s = XRegExp.copyAsGlobal(s);
        while (match = s.exec(str)) {
            if (s.lastIndex > lastLastIndex) {
                output.push(str.slice(lastLastIndex, match.index));
                if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(output, match.slice(1));
                }
                lastLength = match[0].length;
                lastLastIndex = s.lastIndex;
                if (output.length >= limit) {
                    break;
                }
            }
            if (s.lastIndex === match.index) {
                s.lastIndex++;
            }
        }
        if (lastLastIndex === str.length) {
            if (!nativ.test.call(s, "") || lastLength) {
                output.push("");
            }
        } else {
            output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
    };
    function clone(regex, additionalFlags) {
        if (!XRegExp.isRegExp(regex)) {
            throw TypeError("type RegExp expected");
        }
        var x = regex._xregexp;
        regex = XRegExp(regex.source, getNativeFlags(regex) + (additionalFlags || ""));
        if (x) {
            regex._xregexp = {source:x.source, captureNames:x.captureNames ? x.captureNames.slice(0) : null};
        }
        return regex;
    }
    function getNativeFlags(regex) {
        return (regex.global ? "g" : "") + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : "") + (regex.extended ? "x" : "") + (regex.sticky ? "y" : "");
    }
    function runTokens(pattern, index, scope, context) {
        var i = tokens.length, result, match, t;
        isInsideConstructor = true;
        try {
            while (i--) {
                t = tokens[i];
                if ((scope & t.scope) && (!t.trigger || t.trigger.call(context))) {
                    t.pattern.lastIndex = index;
                    match = t.pattern.exec(pattern);
                    if (match && match.index === index) {
                        result = {output:t.handler.call(context, match, scope), match:match};
                        break;
                    }
                }
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            isInsideConstructor = false;
        }
        return result;
    }
    function indexOf(array, item, from) {
        if (Array.prototype.indexOf) {
            return array.indexOf(item, from);
        }
        for (var i = from || 0; i < array.length; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    }
    XRegExp.addToken(/\(\?#[^)]*\)/, function (match) {
        return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
    });
    XRegExp.addToken(/\((?!\?)/, function () {
        this.captureNames.push(null);
        return "(";
    });
    XRegExp.addToken(/\(\?<([$\w]+)>/, function (match) {
        this.captureNames.push(match[1]);
        this.hasNamedCapture = true;
        return "(";
    });
    XRegExp.addToken(/\\k<([\w$]+)>/, function (match) {
        var index = indexOf(this.captureNames, match[1]);
        return index > -1 ? "\\" + (index + 1) + (isNaN(match.input.charAt(match.index + match[0].length)) ? "" : "(?:)") : match[0];
    });
    XRegExp.addToken(/\[\^?]/, function (match) {
        return match[0] === "[]" ? "\\b\\B" : "[\\s\\S]";
    });
    XRegExp.addToken(/^\(\?([imsx]+)\)/, function (match) {
        this.setFlag(match[1]);
        return "";
    });
    XRegExp.addToken(/(?:\s+|#.*)+/, function (match) {
        return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
    }, XRegExp.OUTSIDE_CLASS, function () {
        return this.hasFlag("x");
    });
    XRegExp.addToken(/\./, function () {
        return "[\\s\\S]";
    }, XRegExp.OUTSIDE_CLASS, function () {
        return this.hasFlag("s");
    });
})();
if (typeof (SyntaxHighlighter) == "undefined") {
    var SyntaxHighlighter = function () {
        if (typeof (require) != "undefined" && typeof (XRegExp) == "undefined") {
            XRegExp = require("XRegExp").XRegExp;
        }
        var sh = {defaults:{"class-name":"", "first-line":1, "pad-line-numbers":false, "highlight":false, "title":null, "smart-tabs":true, "tab-size":4, "gutter":true, "toolbar":true, "quick-code":true, "collapse":false, "auto-links":false, "light":false, "unindent":true, "html-script":false}, config:{space:"&nbsp;", useScriptTags:true, bloggerMode:false, stripBrs:false, tagName:"pre", strings:{expandSource:"expand source", help:"?", alert:"SyntaxHighlighter\n\n", noBrush:"Can't find brush for: ", brushNotHtmlScript:"Brush wasn't configured for html-script option: ", aboutDialog:"@ABOUT@"}}, vars:{discoveredBrushes:null, highlighters:{}}, brushes:{}, regexLib:{multiLineCComments:/\/\*[\s\S]*?\*\//gm, singleLineCComments:/\/\/.*$/gm, singleLinePerlComments:/#.*$/gm, doubleQuotedString:/"([^\\"\n]|\\.)*"/g, singleQuotedString:/'([^\\'\n]|\\.)*'/g, multiLineDoubleQuotedString:new XRegExp("\"([^\\\\\"]|\\\\.)*\"", "gs"), multiLineSingleQuotedString:new XRegExp("'([^\\\\']|\\\\.)*'", "gs"), xmlComments:/(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm, url:/\w+:\/\/[\w-.\/?%&=:@;#]*/g, phpScriptTags:{left:/(&lt;|<)\?(?:=|php)?/g, right:/\?(&gt;|>)/g, "eof":true}, aspScriptTags:{left:/(&lt;|<)%=?/g, right:/%(&gt;|>)/g}, scriptScriptTags:{left:/(&lt;|<)\s*script.*?(&gt;|>)/gi, right:/(&lt;|<)\/\s*script\s*(&gt;|>)/gi}}, toolbar:{getHtml:function (highlighter) {
            var html = "<div class=\"toolbar\">", items = sh.toolbar.items, list = items.list;
            function defaultGetHtml(highlighter, name) {
                return sh.toolbar.getButtonHtml(highlighter, name, sh.config.strings[name]);
            }
            for (var i = 0; i < list.length; i++) {
                html += (items[list[i]].getHtml || defaultGetHtml)(highlighter, list[i]);
            }
            html += "</div>";
            return html;
        }, getButtonHtml:function (highlighter, commandName, label) {
            return "<span><a href=\"#\" class=\"toolbar_item" + " command_" + commandName + " " + commandName + "\">" + label + "</a></span>";
        }, handler:function (e) {
            var target = e.target, className = target.className || "";
            function getValue(name) {
                var r = new RegExp(name + "_(\\w+)"), match = r.exec(className);
                return match ? match[1] : null;
            }
            var highlighter = getHighlighterById(findParentElement(target, ".syntaxhighlighter").id), commandName = getValue("command");
            if (highlighter && commandName) {
                sh.toolbar.items[commandName].execute(highlighter);
            }
            e.preventDefault();
        }, items:{list:["expandSource", "help"], expandSource:{getHtml:function (highlighter) {
            if (highlighter.getParam("collapse") != true) {
                return "";
            }
            var title = highlighter.getParam("title");
            return sh.toolbar.getButtonHtml(highlighter, "expandSource", title ? title : sh.config.strings.expandSource);
        }, execute:function (highlighter) {
            var div = getHighlighterDivById(highlighter.id);
            removeClass(div, "collapsed");
        }}, help:{execute:function (highlighter) {
            var wnd = popup("", "_blank", 500, 250, "scrollbars=0"), doc = wnd.document;
            doc.write(sh.config.strings.aboutDialog);
            doc.close();
            wnd.focus();
        }}}}, findElements:function (globalParams, element) {
            var elements = element ? [element] : toArray(document.getElementsByTagName(sh.config.tagName)), conf = sh.config, result = [];
            if (conf.useScriptTags) {
                elements = elements.concat(getSyntaxHighlighterScriptTags());
            }
            if (elements.length === 0) {
                return result;
            }
            for (var i = 0; i < elements.length; i++) {
                var item = {target:elements[i], params:merge(globalParams, parseParams(elements[i].className))};
                if (item.params["brush"] == null) {
                    continue;
                }
                result.push(item);
            }
            return result;
        }, highlight:function (globalParams, element) {
            var elements = this.findElements(globalParams, element), propertyName = "innerHTML", highlighter = null, conf = sh.config;
            if (elements.length === 0) {
                return;
            }
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i], target = element.target, params = element.params, brushName = params.brush, code;
                if (brushName == null) {
                    continue;
                }
                if (params["html-script"] == "true" || sh.defaults["html-script"] == true) {
                    highlighter = new sh.HtmlScript(brushName);
                    brushName = "htmlscript";
                } else {
                    var brush = findBrush(brushName);
                    if (brush) {
                        highlighter = new brush();
                    } else {
                        continue;
                    }
                }
                code = target[propertyName];
                if (conf.useScriptTags) {
                    code = stripCData(code);
                }
                if ((target.title || "") != "") {
                    params.title = target.title;
                }
                params["brush"] = brushName;
                highlighter.init(params);
                element = highlighter.getDiv(code);
                if ((target.id || "") != "") {
                    element.id = target.id;
                }
                var tmp = element.firstChild.firstChild;
                tmp.className = element.firstChild.className;
                target.parentNode.replaceChild(tmp, target);
            }
        }, all:function (params) {
            attachEvent(window, "load", function () {
                sh.highlight(params);
            });
        }};
        function hasClass(target, className) {
            return target.className.indexOf(className) != -1;
        }
        function addClass(target, className) {
            if (!hasClass(target, className)) {
                target.className += " " + className;
            }
        }
        function removeClass(target, className) {
            target.className = target.className.replace(className, "");
        }
        function toArray(source) {
            var result = [];
            for (var i = 0; i < source.length; i++) {
                result.push(source[i]);
            }
            return result;
        }
        function splitLines(block) {
            return block.split(/\r?\n/);
        }
        function getHighlighterId(id) {
            var prefix = "highlighter_";
            return id.indexOf(prefix) == 0 ? id : prefix + id;
        }
        function getHighlighterById(id) {
            return sh.vars.highlighters[getHighlighterId(id)];
        }
        function getHighlighterDivById(id) {
            return document.getElementById(getHighlighterId(id));
        }
        function storeHighlighter(highlighter) {
            sh.vars.highlighters[getHighlighterId(highlighter.id)] = highlighter;
        }
        function findElement(target, search, reverse) {
            if (target == null) {
                return null;
            }
            var nodes = reverse != true ? target.childNodes : [target.parentNode], propertyToFind = {"#":"id", ".":"className"}[search.substr(0, 1)] || "nodeName", expectedValue, found;
            expectedValue = propertyToFind != "nodeName" ? search.substr(1) : search.toUpperCase();
            if ((target[propertyToFind] || "").indexOf(expectedValue) != -1) {
                return target;
            }
            for (var i = 0; nodes && i < nodes.length && found == null; i++) {
                found = findElement(nodes[i], search, reverse);
            }
            return found;
        }
        function findParentElement(target, className) {
            return findElement(target, className, true);
        }
        function indexOf(array, searchElement, fromIndex) {
            fromIndex = Math.max(fromIndex || 0, 0);
            for (var i = fromIndex; i < array.length; i++) {
                if (array[i] == searchElement) {
                    return i;
                }
            }
            return -1;
        }
        function guid(prefix) {
            return (prefix || "") + Math.round(Math.random() * 1000000).toString();
        }
        function merge(obj1, obj2) {
            var result = {}, name;
            for (name in obj1) {
                result[name] = obj1[name];
            }
            for (name in obj2) {
                result[name] = obj2[name];
            }
            return result;
        }
        function toBoolean(value) {
            var result = {"true":true, "false":false}[value];
            return result == null ? value : result;
        }
        function popup(url, name, width, height, options) {
            var x = (screen.width - width) / 2, y = (screen.height - height) / 2;
            options += ", left=" + x + ", top=" + y + ", width=" + width + ", height=" + height;
            options = options.replace(/^,/, "");
            var win = window.open(url, name, options);
            win.focus();
            return win;
        }
        function attachEvent(obj, type, func, scope) {
            function handler(e) {
                e = e || window.event;
                if (!e.target) {
                    e.target = e.srcElement;
                    e.preventDefault = function () {
                        this.returnValue = false;
                    };
                }
                func.call(scope || window, e);
            }
            if (obj.attachEvent) {
                obj.attachEvent("on" + type, handler);
            } else {
                obj.addEventListener(type, handler, false);
            }
        }
        function alert(str) {
            window.alert(sh.config.strings.alert + str);
        }
        function findBrush(alias, showAlert) {
            var brushes = sh.vars.discoveredBrushes, result = null;
            if (brushes == null) {
                brushes = {};
                for (var brush in sh.brushes) {
                    var info = sh.brushes[brush], aliases = info.aliases;
                    if (aliases == null) {
                        continue;
                    }
                    info.brushName = brush.toLowerCase();
                    for (var i = 0; i < aliases.length; i++) {
                        brushes[aliases[i]] = brush;
                    }
                }
                sh.vars.discoveredBrushes = brushes;
            }
            result = sh.brushes[brushes[alias]];
            if (result == null && showAlert) {
                alert(sh.config.strings.noBrush + alias);
            }
            return result;
        }
        function eachLine(str, callback) {
            var lines = splitLines(str);
            for (var i = 0; i < lines.length; i++) {
                lines[i] = callback(lines[i], i);
            }
            return lines.join("\r\n");
        }
        function trimFirstAndLastLines(str) {
            return str.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, "");
        }
        function parseParams(str) {
            var match, result = {}, arrayRegex = new XRegExp("^\\[(?<values>(.*?))\\]$"), regex = new XRegExp("(?<name>[\\w-]+)" + "\\s*:\\s*" + "(?<value>" + "[\\w-%#]+|" + "\\[.*?\\]|" + "\".*?\"|" + "'.*?'" + ")\\s*;?", "g");
            while ((match = regex.exec(str)) != null) {
                var value = match.value.replace(/^['"]|['"]$/g, "");
                if (value != null && arrayRegex.test(value)) {
                    var m = arrayRegex.exec(value);
                    value = m.values.length > 0 ? m.values.split(/\s*,\s*/) : [];
                }
                result[match.name] = value;
            }
            return result;
        }
        function wrapLinesWithCode(str, css) {
            if (str == null || str.length == 0 || str == "\n") {
                return str;
            }
            str = str.replace(/</g, "&lt;");
            str = str.replace(/ {2,}/g, function (m) {
                var spaces = "";
                for (var i = 0; i < m.length - 1; i++) {
                    spaces += sh.config.space;
                }
                return spaces + " ";
            });
            if (css != null) {
                str = eachLine(str, function (line) {
                    if (line.length == 0) {
                        return "";
                    }
                    var spaces = "";
                    line = line.replace(/^(&nbsp;| )+/, function (s) {
                        spaces = s;
                        return "";
                    });
                    if (line.length == 0) {
                        return spaces;
                    }
                    return spaces + "<code class=\"" + css + "\">" + line + "</code>";
                });
            }
            return str;
        }
        function padNumber(number, length) {
            var result = number.toString();
            while (result.length < length) {
                result = "0" + result;
            }
            return result;
        }
        function processTabs(code, tabSize) {
            var tab = "";
            for (var i = 0; i < tabSize; i++) {
                tab += " ";
            }
            return code.replace(/\t/g, tab);
        }
        function processSmartTabs(code, tabSize) {
            var lines = splitLines(code), tab = "\t", spaces = "";
            for (var i = 0; i < 50; i++) {
                spaces += "                    ";
            }
            function insertSpaces(line, pos, count) {
                return line.substr(0, pos) + spaces.substr(0, count) + line.substr(pos + 1, line.length);
            }
            code = eachLine(code, function (line) {
                if (line.indexOf(tab) == -1) {
                    return line;
                }
                var pos = 0;
                while ((pos = line.indexOf(tab)) != -1) {
                    var spaces = tabSize - pos % tabSize;
                    line = insertSpaces(line, pos, spaces);
                }
                return line;
            });
            return code;
        }
        function fixInputString(str) {
            var br = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
            if (sh.config.bloggerMode == true) {
                str = str.replace(br, "\n");
            }
            if (sh.config.stripBrs == true) {
                str = str.replace(br, "");
            }
            return str;
        }
        function trim(str) {
            return str.replace(/^\s+|\s+$/g, "");
        }
        function unindent(str) {
            var lines = splitLines(fixInputString(str)), indents = new Array(), regex = /^\s*/, min = 1000;
            for (var i = 0; i < lines.length && min > 0; i++) {
                var line = lines[i];
                if (trim(line).length == 0) {
                    continue;
                }
                var matches = regex.exec(line);
                if (matches == null) {
                    return str;
                }
                min = Math.min(matches[0].length, min);
            }
            if (min > 0) {
                for (var i = 0; i < lines.length; i++) {
                    lines[i] = lines[i].substr(min);
                }
            }
            return lines.join("\n");
        }
        function matchesSortCallback(m1, m2) {
            if (m1.index < m2.index) {
                return -1;
            } else {
                if (m1.index > m2.index) {
                    return 1;
                } else {
                    if (m1.length < m2.length) {
                        return -1;
                    } else {
                        if (m1.length > m2.length) {
                            return 1;
                        }
                    }
                }
            }
            return 0;
        }
        function getMatches(code, regexInfo) {
            function defaultAdd(match, regexInfo) {
                return match[0];
            }
            var index = 0, match = null, matches = [], func = regexInfo.func ? regexInfo.func : defaultAdd;
            while ((match = regexInfo.regex.exec(code)) != null) {
                var resultMatch = func(match, regexInfo);
                if (typeof (resultMatch) == "string") {
                    resultMatch = [new sh.Match(resultMatch, match.index, regexInfo.css)];
                }
                matches = matches.concat(resultMatch);
            }
            return matches;
        }
        function processUrls(code) {
            var gt = /(.*)((&gt;|&lt;).*)/;
            return code.replace(sh.regexLib.url, function (m) {
                var suffix = "", match = null;
                if (match = gt.exec(m)) {
                    m = match[1];
                    suffix = match[2];
                }
                return "<a href=\"" + m + "\">" + m + "</a>" + suffix;
            });
        }
        function getSyntaxHighlighterScriptTags() {
            var tags = document.getElementsByTagName("script"), result = [];
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].type == "syntaxhighlighter") {
                    result.push(tags[i]);
                }
            }
            return result;
        }
        function stripCData(original) {
            var left = "<![CDATA[", right = "]]>", copy = trim(original), changed = false, leftLength = left.length, rightLength = right.length;
            if (copy.indexOf(left) == 0) {
                copy = copy.substring(leftLength);
                changed = true;
            }
            var copyLength = copy.length;
            if (copy.indexOf(right) == copyLength - rightLength) {
                copy = copy.substring(0, copyLength - rightLength);
                changed = true;
            }
            return changed ? copy : original;
        }
        function quickCodeHandler(e) {
            var target = e.target, highlighterDiv = findParentElement(target, ".syntaxhighlighter"), container = findParentElement(target, ".container"), textarea = document.createElement("textarea"), highlighter;
            if (!container || !highlighterDiv || findElement(container, "textarea")) {
                return;
            }
            highlighter = getHighlighterById(highlighterDiv.id);
            addClass(highlighterDiv, "source");
            var lines = container.childNodes, code = [];
            for (var i = 0; i < lines.length; i++) {
                code.push(lines[i].innerText || lines[i].textContent);
            }
            code = code.join("\r");
            code = code.replace(/\u00a0/g, " ");
            textarea.appendChild(document.createTextNode(code));
            container.appendChild(textarea);
            textarea.focus();
            textarea.select();
            attachEvent(textarea, "blur", function (e) {
                textarea.parentNode.removeChild(textarea);
                removeClass(highlighterDiv, "source");
            });
        }
        sh.Match = function (value, index, css) {
            this.value = value;
            this.index = index;
            this.length = value.length;
            this.css = css;
            this.brushName = null;
        };
        sh.Match.prototype.toString = function () {
            return this.value;
        };
        sh.HtmlScript = function (scriptBrushName) {
            var brushClass = findBrush(scriptBrushName), scriptBrush, xmlBrush = new sh.brushes.Xml(), bracketsRegex = null, ref = this, methodsToExpose = "getDiv getHtml init".split(" ");
            if (brushClass == null) {
                return;
            }
            scriptBrush = new brushClass();
            for (var i = 0; i < methodsToExpose.length; i++) {
                (function () {
                    var name = methodsToExpose[i];
                    ref[name] = function () {
                        return xmlBrush[name].apply(xmlBrush, arguments);
                    };
                })();
            }
            if (scriptBrush.htmlScript == null) {
                alert(sh.config.strings.brushNotHtmlScript + scriptBrushName);
                return;
            }
            xmlBrush.regexList.push({regex:scriptBrush.htmlScript.code, func:process});
            function offsetMatches(matches, offset) {
                for (var j = 0; j < matches.length; j++) {
                    matches[j].index += offset;
                }
            }
            function process(match, info) {
                var code = match.code, matches = [], regexList = scriptBrush.regexList, offset = match.index + match.left.length, htmlScript = scriptBrush.htmlScript, result;
                for (var i = 0; i < regexList.length; i++) {
                    result = getMatches(code, regexList[i]);
                    offsetMatches(result, offset);
                    matches = matches.concat(result);
                }
                if (htmlScript.left != null && match.left != null) {
                    result = getMatches(match.left, htmlScript.left);
                    offsetMatches(result, match.index);
                    matches = matches.concat(result);
                }
                if (htmlScript.right != null && match.right != null) {
                    result = getMatches(match.right, htmlScript.right);
                    offsetMatches(result, match.index + match[0].lastIndexOf(match.right));
                    matches = matches.concat(result);
                }
                for (var j = 0; j < matches.length; j++) {
                    matches[j].brushName = brushClass.brushName;
                }
                return matches;
            }
        };
        sh.Highlighter = function () {
        };
        sh.Highlighter.prototype = {getParam:function (name, defaultValue) {
            var result = this.params[name];
            return toBoolean(result == null ? defaultValue : result);
        }, create:function (name) {
            return document.createElement(name);
        }, findMatches:function (regexList, code) {
            var result = [];
            if (regexList != null) {
                for (var i = 0; i < regexList.length; i++) {
                    if (typeof (regexList[i]) == "object") {
                        result = result.concat(getMatches(code, regexList[i]));
                    }
                }
            }
            return this.removeNestedMatches(result.sort(matchesSortCallback));
        }, removeNestedMatches:function (matches) {
            for (var i = 0; i < matches.length; i++) {
                if (matches[i] === null) {
                    continue;
                }
                var itemI = matches[i], itemIEndPos = itemI.index + itemI.length;
                for (var j = i + 1; j < matches.length && matches[i] !== null; j++) {
                    var itemJ = matches[j];
                    if (itemJ === null) {
                        continue;
                    } else {
                        if (itemJ.index > itemIEndPos) {
                            break;
                        } else {
                            if (itemJ.index == itemI.index && itemJ.length > itemI.length) {
                                matches[i] = null;
                            } else {
                                if (itemJ.index >= itemI.index && itemJ.index < itemIEndPos) {
                                    matches[j] = null;
                                }
                            }
                        }
                    }
                }
            }
            return matches;
        }, figureOutLineNumbers:function (code) {
            var lines = [], firstLine = parseInt(this.getParam("first-line"));
            eachLine(code, function (line, index) {
                lines.push(index + firstLine);
            });
            return lines;
        }, isLineHighlighted:function (lineNumber) {
            var list = this.getParam("highlight", []);
            if (typeof (list) != "object" && list.push == null) {
                list = [list];
            }
            return indexOf(list, lineNumber.toString()) != -1;
        }, getLineHtml:function (lineIndex, lineNumber, code) {
            var classes = ["line", "number" + lineNumber, "index" + lineIndex, "alt" + (lineNumber % 2 == 0 ? 1 : 2).toString()];
            if (this.isLineHighlighted(lineNumber)) {
                classes.push("highlighted");
            }
            if (lineNumber == 0) {
                classes.push("break");
            }
            return "<div class=\"" + classes.join(" ") + "\">" + code + "</div>";
        }, getLineNumbersHtml:function (code, lineNumbers) {
            var html = "", count = splitLines(code).length, firstLine = parseInt(this.getParam("first-line")), pad = this.getParam("pad-line-numbers");
            if (pad == true) {
                pad = (firstLine + count - 1).toString().length;
            } else {
                if (isNaN(pad) == true) {
                    pad = 0;
                }
            }
            for (var i = 0; i < count; i++) {
                var lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i, code = lineNumber == 0 ? sh.config.space : padNumber(lineNumber, pad);
                html += this.getLineHtml(i, lineNumber, code);
            }
            return html;
        }, getCodeLinesHtml:function (html, lineNumbers) {
            html = trim(html);
            var lines = splitLines(html), padLength = this.getParam("pad-line-numbers"), firstLine = parseInt(this.getParam("first-line")), html = "", brushName = this.getParam("brush");
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i], indent = /^(&nbsp;|\s)+/.exec(line), spaces = null, lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i;
                if (indent != null) {
                    spaces = indent[0].toString();
                    line = line.substr(spaces.length);
                    spaces = spaces.replace(" ", sh.config.space);
                }
                line = trim(line);
                if (line.length == 0) {
                    line = sh.config.space;
                }
                html += this.getLineHtml(i, lineNumber, (spaces != null ? "<code class=\"" + brushName + " spaces\">" + spaces + "</code>" : "") + line);
            }
            return html;
        }, getTitleHtml:function (title) {
            return title ? "<caption>" + title + "</caption>" : "";
        }, getMatchesHtml:function (code, matches) {
            var pos = 0, result = "", brushName = this.getParam("brush", "");
            function getBrushNameCss(match) {
                var result = match ? (match.brushName || brushName) : brushName;
                return result ? result + " " : "";
            }
            for (var i = 0; i < matches.length; i++) {
                var match = matches[i], matchBrushName;
                if (match === null || match.length === 0) {
                    continue;
                }
                matchBrushName = getBrushNameCss(match);
                result += wrapLinesWithCode(code.substr(pos, match.index - pos), matchBrushName + "plain") + wrapLinesWithCode(match.value, matchBrushName + match.css);
                pos = match.index + match.length + (match.offset || 0);
            }
            result += wrapLinesWithCode(code.substr(pos), getBrushNameCss() + "plain");
            return result;
        }, getHtml:function (code) {
            var html = "", classes = ["syntaxhighlighter"], tabSize, matches, lineNumbers;
            if (this.getParam("light") == true) {
                this.params.toolbar = this.params.gutter = false;
            }
            className = "syntaxhighlighter";
            if (this.getParam("collapse") == true) {
                classes.push("collapsed");
            }
            if ((gutter = this.getParam("gutter")) == false) {
                classes.push("nogutter");
            }
            classes.push(this.getParam("class-name"));
            classes.push(this.getParam("brush"));
            code = trimFirstAndLastLines(code).replace(/\r/g, " ");
            tabSize = this.getParam("tab-size");
            code = this.getParam("smart-tabs") == true ? processSmartTabs(code, tabSize) : processTabs(code, tabSize);
            if (this.getParam("unindent")) {
                code = unindent(code);
            }
            if (gutter) {
                lineNumbers = this.figureOutLineNumbers(code);
            }
            matches = this.findMatches(this.regexList, code);
            html = this.getMatchesHtml(code, matches);
            html = this.getCodeLinesHtml(html, lineNumbers);
            if (this.getParam("auto-links")) {
                html = processUrls(html);
            }
            if (typeof (navigator) != "undefined" && navigator.userAgent && navigator.userAgent.match(/MSIE/)) {
                classes.push("ie");
            }
            html = "<div id=\"" + getHighlighterId(this.id) + "\" class=\"" + classes.join(" ") + "\">" + (this.getParam("toolbar") ? sh.toolbar.getHtml(this) : "") + "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" + this.getTitleHtml(this.getParam("title")) + "<tbody>" + "<tr>" + (gutter ? "<td class=\"gutter\">" + this.getLineNumbersHtml(code) + "</td>" : "") + "<td class=\"code\">" + "<div class=\"container\">" + html + "</div>" + "</td>" + "</tr>" + "</tbody>" + "</table>" + "</div>";
            return html;
        }, getDiv:function (code) {
            if (code === null) {
                code = "";
            }
            this.code = code;
            var div = this.create("div");
            div.innerHTML = this.getHtml(code);
            if (this.getParam("toolbar")) {
                attachEvent(findElement(div, ".toolbar"), "click", sh.toolbar.handler);
            }
            if (this.getParam("quick-code")) {
                attachEvent(findElement(div, ".code"), "dblclick", quickCodeHandler);
            }
            return div;
        }, init:function (params) {
            this.id = guid();
            storeHighlighter(this);
            this.params = merge(sh.defaults, params || {});
            if (this.getParam("light") == true) {
                this.params.toolbar = this.params.gutter = false;
            }
        }, getKeywords:function (str) {
            str = str.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "|");
            return "\\b(?:" + str + ")\\b";
        }, forHtmlScript:function (regexGroup) {
            var regex = {"end":regexGroup.right.source};
            if (regexGroup.eof) {
                regex.end = "(?:(?:" + regex.end + ")|$)";
            }
            this.htmlScript = {left:{regex:regexGroup.left, css:"script"}, right:{regex:regexGroup.right, css:"script"}, code:new XRegExp("(?<left>" + regexGroup.left.source + ")" + "(?<code>.*?)" + "(?<right>" + regex.end + ")", "sgi")};
        }};
        return sh;
    }();
}
typeof (exports) != "undefined" ? exports.SyntaxHighlighter = SyntaxHighlighter : null;
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var inits = "class interface function package";
        var keywords = "-Infinity ...rest Array as AS3 Boolean break case catch const continue Date decodeURI " + "decodeURIComponent default delete do dynamic each else encodeURI encodeURIComponent escape " + "extends false final finally flash_proxy for get if implements import in include Infinity " + "instanceof int internal is isFinite isNaN isXMLName label namespace NaN native new null " + "Null Number Object object_proxy override parseFloat parseInt private protected public " + "return set static String super switch this throw true try typeof uint undefined unescape " + "use void while with";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi, css:"value"}, {regex:new RegExp(this.getKeywords(inits), "gm"), css:"color3"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp("var", "gm"), css:"variable"}, {regex:new RegExp("trace", "gm"), css:"color1"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.scriptScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["actionscript3", "as3"];
    SyntaxHighlighter.brushes.AS3 = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "after before beginning continue copy each end every from return get global in local named of set some that the then times to where whose with without";
        var ordinals = "first second third fourth fifth sixth seventh eighth ninth tenth last front back middle";
        var specials = "activate add alias AppleScript ask attachment boolean class constant delete duplicate empty exists false id integer list make message modal modified new no paragraph pi properties quit real record remove rest result reveal reverse run running save string true word yes";
        this.regexList = [{regex:/(--|#).*$/gm, css:"comments"}, {regex:/\(\*(?:[\s\S]*?\(\*[\s\S]*?\*\))*[\s\S]*?\*\)/gm, css:"comments"}, {regex:/"[\s\S]*?"/gm, css:"string"}, {regex:/(?:,|:|¬|'s\b|\(|\)|\{|\}|«|\b\w*»)/g, css:"color1"}, {regex:/(-)?(\d)+(\.(\d)?)?(E\+(\d)+)?/g, css:"color1"}, {regex:/(?:&(amp;|gt;|lt;)?|=|� |>|<|≥|>=|≤|<=|\*|\+|-|\/|÷|\^)/g, css:"color2"}, {regex:/\b(?:and|as|div|mod|not|or|return(?!\s&)(ing)?|equals|(is(n't| not)? )?equal( to)?|does(n't| not) equal|(is(n't| not)? )?(greater|less) than( or equal( to)?)?|(comes|does(n't| not) come) (after|before)|is(n't| not)?( in)? (back|front) of|is(n't| not)? behind|is(n't| not)?( (in|contained by))?|does(n't| not) contain|contain(s)?|(start|begin|end)(s)? with|((but|end) )?(consider|ignor)ing|prop(erty)?|(a )?ref(erence)?( to)?|repeat (until|while|with)|((end|exit) )?repeat|((else|end) )?if|else|(end )?(script|tell|try)|(on )?error|(put )?into|(of )?(it|me)|its|my|with (timeout( of)?|transaction)|end (timeout|transaction))\b/g, css:"keyword"}, {regex:/\b\d+(st|nd|rd|th)\b/g, css:"keyword"}, {regex:/\b(?:about|above|against|around|at|below|beneath|beside|between|by|(apart|aside) from|(instead|out) of|into|on(to)?|over|since|thr(ough|u)|under)\b/g, css:"color3"}, {regex:/\b(?:adding folder items to|after receiving|choose( ((remote )?application|color|folder|from list|URL))?|clipboard info|set the clipboard to|(the )?clipboard|entire contents|display(ing| (alert|dialog|mode))?|document( (edited|file|nib name))?|file( (name|type))?|(info )?for|giving up after|(name )?extension|quoted form|return(ed)?|second(?! item)(s)?|list (disks|folder)|text item(s| delimiters)?|(Unicode )?text|(disk )?item(s)?|((current|list) )?view|((container|key) )?window|with (data|icon( (caution|note|stop))?|parameter(s)?|prompt|properties|seed|title)|case|diacriticals|hyphens|numeric strings|punctuation|white space|folder creation|application(s( folder)?| (processes|scripts position|support))?|((desktop )?(pictures )?|(documents|downloads|favorites|home|keychain|library|movies|music|public|scripts|sites|system|users|utilities|workflows) )folder|desktop|Folder Action scripts|font(s| panel)?|help|internet plugins|modem scripts|(system )?preferences|printer descriptions|scripting (additions|components)|shared (documents|libraries)|startup (disk|items)|temporary items|trash|on server|in AppleTalk zone|((as|long|short) )?user name|user (ID|locale)|(with )?password|in (bundle( with identifier)?|directory)|(close|open for) access|read|write( permission)?|(g|s)et eof|using( delimiters)?|starting at|default (answer|button|color|country code|entr(y|ies)|identifiers|items|name|location|script editor)|hidden( answer)?|open(ed| (location|untitled))?|error (handling|reporting)|(do( shell)?|load|run|store) script|administrator privileges|altering line endings|get volume settings|(alert|boot|input|mount|output|set) volume|output muted|(fax|random )?number|round(ing)?|up|down|toward zero|to nearest|as taught in school|system (attribute|info)|((AppleScript( Studio)?|system) )?version|(home )?directory|(IPv4|primary Ethernet) address|CPU (type|speed)|physical memory|time (stamp|to GMT)|replacing|ASCII (character|number)|localized string|from table|offset|summarize|beep|delay|say|(empty|multiple) selections allowed|(of|preferred) type|invisibles|showing( package contents)?|editable URL|(File|FTP|News|Media|Web) [Ss]ervers|Telnet hosts|Directory services|Remote applications|waiting until completion|saving( (in|to))?|path (for|to( (((current|frontmost) )?application|resource))?)|POSIX (file|path)|(background|RGB) color|(OK|cancel) button name|cancel button|button(s)?|cubic ((centi)?met(re|er)s|yards|feet|inches)|square ((kilo)?met(re|er)s|miles|yards|feet)|(centi|kilo)?met(re|er)s|miles|yards|feet|inches|lit(re|er)s|gallons|quarts|(kilo)?grams|ounces|pounds|degrees (Celsius|Fahrenheit|Kelvin)|print( (dialog|settings))?|clos(e(able)?|ing)|(de)?miniaturized|miniaturizable|zoom(ed|able)|attribute run|action (method|property|title)|phone|email|((start|end)ing|home) page|((birth|creation|current|custom|modification) )?date|((((phonetic )?(first|last|middle))|computer|host|maiden|related) |nick)?name|aim|icq|jabber|msn|yahoo|address(es)?|save addressbook|should enable action|city|country( code)?|formatte(r|d address)|(palette )?label|state|street|zip|AIM [Hh]andle(s)?|my card|select(ion| all)?|unsaved|(alpha )?value|entr(y|ies)|group|(ICQ|Jabber|MSN) handle|person|people|company|department|icon image|job title|note|organization|suffix|vcard|url|copies|collating|pages (across|down)|request print time|target( printer)?|((GUI Scripting|Script menu) )?enabled|show Computer scripts|(de)?activated|awake from nib|became (key|main)|call method|of (class|object)|center|clicked toolbar item|closed|for document|exposed|(can )?hide|idle|keyboard (down|up)|event( (number|type))?|launch(ed)?|load (image|movie|nib|sound)|owner|log|mouse (down|dragged|entered|exited|moved|up)|move|column|localization|resource|script|register|drag (info|types)|resigned (active|key|main)|resiz(e(d)?|able)|right mouse (down|dragged|up)|scroll wheel|(at )?index|should (close|open( untitled)?|quit( after last window closed)?|zoom)|((proposed|screen) )?bounds|show(n)?|behind|in front of|size (mode|to fit)|update(d| toolbar item)?|was (hidden|miniaturized)|will (become active|close|finish launching|hide|miniaturize|move|open|quit|(resign )?active|((maximum|minimum|proposed) )?size|show|zoom)|bundle|data source|movie|pasteboard|sound|tool(bar| tip)|(color|open|save) panel|coordinate system|frontmost|main( (bundle|menu|window))?|((services|(excluded from )?windows) )?menu|((executable|frameworks|resource|scripts|shared (frameworks|support)) )?path|(selected item )?identifier|data|content(s| view)?|character(s)?|click count|(command|control|option|shift) key down|context|delta (x|y|z)|key( code)?|location|pressure|unmodified characters|types|(first )?responder|playing|(allowed|selectable) identifiers|allows customization|(auto saves )?configuration|visible|image( name)?|menu form representation|tag|user(-| )defaults|associated file name|(auto|needs) display|current field editor|floating|has (resize indicator|shadow)|hides when deactivated|level|minimized (image|title)|opaque|position|release when closed|sheet|title(d)?)\b/g, css:"color3"}, {regex:new RegExp(this.getKeywords(specials), "gm"), css:"color3"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(this.getKeywords(ordinals), "gm"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["applescript"];
    SyntaxHighlighter.brushes.AppleScript = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "if fi then elif else for do done until while break continue case esac function return in eq ne ge le";
        var commands = "alias apropos awk basename bash bc bg builtin bzip2 cal cat cd cfdisk chgrp chmod chown chroot" + "cksum clear cmp comm command cp cron crontab csplit cut date dc dd ddrescue declare df " + "diff diff3 dig dir dircolors dirname dirs du echo egrep eject enable env ethtool eval " + "exec exit expand export expr false fdformat fdisk fg fgrep file find fmt fold format " + "free fsck ftp gawk getopts grep groups gzip hash head history hostname id ifconfig " + "import install join kill less let ln local locate logname logout look lpc lpr lprint " + "lprintd lprintq lprm ls lsof make man mkdir mkfifo mkisofs mknod more mount mtools " + "mv netstat nice nl nohup nslookup open op passwd paste pathchk ping popd pr printcap " + "printenv printf ps pushd pwd quota quotacheck quotactl ram rcp read readonly renice " + "remsync rm rmdir rsync screen scp sdiff sed select seq set sftp shift shopt shutdown " + "sleep sort source split ssh strace su sudo sum symlink sync tail tar tee test time " + "times touch top traceroute trap tr true tsort tty type ulimit umask umount unalias " + "uname unexpand uniq units unset unshar useradd usermod users uuencode uudecode v vdir " + "vi watch wc whereis which who whoami Wget xargs yes";
        this.regexList = [{regex:/^#!.*$/gm, css:"preprocessor bold"}, {regex:/\/[\w-\/]+/gm, css:"plain"}, {regex:SyntaxHighlighter.regexLib.singleLinePerlComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(this.getKeywords(commands), "gm"), css:"functions"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["bash", "shell", "sh"];
    SyntaxHighlighter.brushes.Bash = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var funcs = "Abs ACos AddSOAPRequestHeader AddSOAPResponseHeader AjaxLink AjaxOnLoad ArrayAppend ArrayAvg ArrayClear ArrayDeleteAt " + "ArrayInsertAt ArrayIsDefined ArrayIsEmpty ArrayLen ArrayMax ArrayMin ArraySet ArraySort ArraySum ArraySwap ArrayToList " + "Asc ASin Atn BinaryDecode BinaryEncode BitAnd BitMaskClear BitMaskRead BitMaskSet BitNot BitOr BitSHLN BitSHRN BitXor " + "Ceiling CharsetDecode CharsetEncode Chr CJustify Compare CompareNoCase Cos CreateDate CreateDateTime CreateObject " + "CreateODBCDate CreateODBCDateTime CreateODBCTime CreateTime CreateTimeSpan CreateUUID DateAdd DateCompare DateConvert " + "DateDiff DateFormat DatePart Day DayOfWeek DayOfWeekAsString DayOfYear DaysInMonth DaysInYear DE DecimalFormat DecrementValue " + "Decrypt DecryptBinary DeleteClientVariable DeserializeJSON DirectoryExists DollarFormat DotNetToCFType Duplicate Encrypt " + "EncryptBinary Evaluate Exp ExpandPath FileClose FileCopy FileDelete FileExists FileIsEOF FileMove FileOpen FileRead " + "FileReadBinary FileReadLine FileSetAccessMode FileSetAttribute FileSetLastModified FileWrite Find FindNoCase FindOneOf " + "FirstDayOfMonth Fix FormatBaseN GenerateSecretKey GetAuthUser GetBaseTagData GetBaseTagList GetBaseTemplatePath " + "GetClientVariablesList GetComponentMetaData GetContextRoot GetCurrentTemplatePath GetDirectoryFromPath GetEncoding " + "GetException GetFileFromPath GetFileInfo GetFunctionList GetGatewayHelper GetHttpRequestData GetHttpTimeString " + "GetK2ServerDocCount GetK2ServerDocCountLimit GetLocale GetLocaleDisplayName GetLocalHostIP GetMetaData GetMetricData " + "GetPageContext GetPrinterInfo GetProfileSections GetProfileString GetReadableImageFormats GetSOAPRequest GetSOAPRequestHeader " + "GetSOAPResponse GetSOAPResponseHeader GetTempDirectory GetTempFile GetTemplatePath GetTickCount GetTimeZoneInfo GetToken " + "GetUserRoles GetWriteableImageFormats Hash Hour HTMLCodeFormat HTMLEditFormat IIf ImageAddBorder ImageBlur ImageClearRect " + "ImageCopy ImageCrop ImageDrawArc ImageDrawBeveledRect ImageDrawCubicCurve ImageDrawLine ImageDrawLines ImageDrawOval " + "ImageDrawPoint ImageDrawQuadraticCurve ImageDrawRect ImageDrawRoundRect ImageDrawText ImageFlip ImageGetBlob ImageGetBufferedImage " + "ImageGetEXIFTag ImageGetHeight ImageGetIPTCTag ImageGetWidth ImageGrayscale ImageInfo ImageNegative ImageNew ImageOverlay ImagePaste " + "ImageRead ImageReadBase64 ImageResize ImageRotate ImageRotateDrawingAxis ImageScaleToFit ImageSetAntialiasing ImageSetBackgroundColor " + "ImageSetDrawingColor ImageSetDrawingStroke ImageSetDrawingTransparency ImageSharpen ImageShear ImageShearDrawingAxis ImageTranslate " + "ImageTranslateDrawingAxis ImageWrite ImageWriteBase64 ImageXORDrawingMode IncrementValue InputBaseN Insert Int IsArray IsBinary " + "IsBoolean IsCustomFunction IsDate IsDDX IsDebugMode IsDefined IsImage IsImageFile IsInstanceOf IsJSON IsLeapYear IsLocalHost " + "IsNumeric IsNumericDate IsObject IsPDFFile IsPDFObject IsQuery IsSimpleValue IsSOAPRequest IsStruct IsUserInAnyRole IsUserInRole " + "IsUserLoggedIn IsValid IsWDDX IsXML IsXmlAttribute IsXmlDoc IsXmlElem IsXmlNode IsXmlRoot JavaCast JSStringFormat LCase Left Len " + "ListAppend ListChangeDelims ListContains ListContainsNoCase ListDeleteAt ListFind ListFindNoCase ListFirst ListGetAt ListInsertAt " + "ListLast ListLen ListPrepend ListQualify ListRest ListSetAt ListSort ListToArray ListValueCount ListValueCountNoCase LJustify Log " + "Log10 LSCurrencyFormat LSDateFormat LSEuroCurrencyFormat LSIsCurrency LSIsDate LSIsNumeric LSNumberFormat LSParseCurrency LSParseDateTime " + "LSParseEuroCurrency LSParseNumber LSTimeFormat LTrim Max Mid Min Minute Month MonthAsString Now NumberFormat ParagraphFormat ParseDateTime " + "Pi PrecisionEvaluate PreserveSingleQuotes Quarter QueryAddColumn QueryAddRow QueryConvertForGrid QueryNew QuerySetCell QuotedValueList Rand " + "Randomize RandRange REFind REFindNoCase ReleaseComObject REMatch REMatchNoCase RemoveChars RepeatString Replace ReplaceList ReplaceNoCase " + "REReplace REReplaceNoCase Reverse Right RJustify Round RTrim Second SendGatewayMessage SerializeJSON SetEncoding SetLocale SetProfileString " + "SetVariable Sgn Sin Sleep SpanExcluding SpanIncluding Sqr StripCR StructAppend StructClear StructCopy StructCount StructDelete StructFind " + "StructFindKey StructFindValue StructGet StructInsert StructIsEmpty StructKeyArray StructKeyExists StructKeyList StructKeyList StructNew " + "StructSort StructUpdate Tan TimeFormat ToBase64 ToBinary ToScript ToString Trim UCase URLDecode URLEncodedFormat URLSessionFormat Val " + "ValueList VerifyClient Week Wrap Wrap WriteOutput XmlChildPos XmlElemNew XmlFormat XmlGetNodeType XmlNew XmlParse XmlSearch XmlTransform " + "XmlValidate Year YesNoFormat";
        var keywords = "cfabort cfajaximport cfajaxproxy cfapplet cfapplication cfargument cfassociate cfbreak cfcache cfcalendar " + "cfcase cfcatch cfchart cfchartdata cfchartseries cfcol cfcollection cfcomponent cfcontent cfcookie cfdbinfo " + "cfdefaultcase cfdirectory cfdiv cfdocument cfdocumentitem cfdocumentsection cfdump cfelse cfelseif cferror " + "cfexchangecalendar cfexchangeconnection cfexchangecontact cfexchangefilter cfexchangemail cfexchangetask " + "cfexecute cfexit cffeed cffile cfflush cfform cfformgroup cfformitem cfftp cffunction cfgrid cfgridcolumn " + "cfgridrow cfgridupdate cfheader cfhtmlhead cfhttp cfhttpparam cfif cfimage cfimport cfinclude cfindex " + "cfinput cfinsert cfinterface cfinvoke cfinvokeargument cflayout cflayoutarea cfldap cflocation cflock cflog " + "cflogin cfloginuser cflogout cfloop cfmail cfmailparam cfmailpart cfmenu cfmenuitem cfmodule cfNTauthenticate " + "cfobject cfobjectcache cfoutput cfparam cfpdf cfpdfform cfpdfformparam cfpdfparam cfpdfsubform cfpod cfpop " + "cfpresentation cfpresentationslide cfpresenter cfprint cfprocessingdirective cfprocparam cfprocresult " + "cfproperty cfquery cfqueryparam cfregistry cfreport cfreportparam cfrethrow cfreturn cfsavecontent cfschedule " + "cfscript cfsearch cfselect cfset cfsetting cfsilent cfslider cfsprydataset cfstoredproc cfswitch cftable " + "cftextarea cfthread cfthrow cftimer cftooltip cftrace cftransaction cftree cftreeitem cftry cfupdate cfwddx " + "cfwindow cfxml cfzip cfzipparam";
        var operators = "all and any between cross in join like not null or outer some";
        this.regexList = [{regex:new RegExp("--(.*)$", "gm"), css:"comments"}, {regex:SyntaxHighlighter.regexLib.xmlComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:new RegExp(this.getKeywords(funcs), "gmi"), css:"functions"}, {regex:new RegExp(this.getKeywords(operators), "gmi"), css:"color1"}, {regex:new RegExp(this.getKeywords(keywords), "gmi"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["coldfusion", "cf"];
    SyntaxHighlighter.brushes.ColdFusion = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var datatypes = "ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR " + "DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH " + "HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP " + "HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY " + "HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT " + "HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE " + "LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF " + "LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR " + "LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR " + "PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT " + "PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 " + "POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR " + "PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 " + "PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT " + "SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG " + "ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM " + "char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t " + "clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS " + "FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t " + "__wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t " + "jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler " + "sig_atomic_t size_t _stat __stat64 _stati64 terminate_function " + "time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf " + "va_list wchar_t wctrans_t wctype_t wint_t signed";
        var keywords = "auto break case catch class const decltype __finally __exception __try " + "const_cast continue private public protected __declspec " + "default delete deprecated dllexport dllimport do dynamic_cast " + "else enum explicit extern if for friend goto inline " + "mutable naked namespace new noinline noreturn nothrow " + "register reinterpret_cast return selectany " + "sizeof static static_cast struct switch template this " + "thread throw true false try typedef typeid typename union " + "using uuid virtual void volatile whcar_t while";
        var functions = "assert isalnum isalpha iscntrl isdigit isgraph islower isprint" + "ispunct isspace isupper isxdigit tolower toupper errno localeconv " + "setlocale acos asin atan atan2 ceil cos cosh exp fabs floor fmod " + "frexp ldexp log log10 modf pow sin sinh sqrt tan tanh jmp_buf " + "longjmp setjmp raise signal sig_atomic_t va_arg va_end va_start " + "clearerr fclose feof ferror fflush fgetc fgetpos fgets fopen " + "fprintf fputc fputs fread freopen fscanf fseek fsetpos ftell " + "fwrite getc getchar gets perror printf putc putchar puts remove " + "rename rewind scanf setbuf setvbuf sprintf sscanf tmpfile tmpnam " + "ungetc vfprintf vprintf vsprintf abort abs atexit atof atoi atol " + "bsearch calloc div exit free getenv labs ldiv malloc mblen mbstowcs " + "mbtowc qsort rand realloc srand strtod strtol strtoul system " + "wcstombs wctomb memchr memcmp memcpy memmove memset strcat strchr " + "strcmp strcoll strcpy strcspn strerror strlen strncat strncmp " + "strncpy strpbrk strrchr strspn strstr strtok strxfrm asctime " + "clock ctime difftime gmtime localtime mktime strftime time";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/^ *#.*/gm, css:"preprocessor"}, {regex:new RegExp(this.getKeywords(datatypes), "gm"), css:"color1 bold"}, {regex:new RegExp(this.getKeywords(functions), "gm"), css:"functions bold"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword bold"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["cpp", "c"];
    SyntaxHighlighter.brushes.Cpp = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "abstract as base bool break byte case catch char checked class const " + "continue decimal default delegate do double else enum event explicit volatile " + "extern false finally fixed float for foreach get goto if implicit in int " + "interface internal is lock long namespace new null object operator out " + "override params private protected public readonly ref return sbyte sealed set " + "short sizeof stackalloc static string struct switch this throw true try " + "typeof uint ulong unchecked unsafe ushort using virtual void while var " + "from group by into select let where orderby join on equals ascending descending";
        function fixComments(match, regexInfo) {
            var css = (match[0].indexOf("///") == 0) ? "color1" : "comments";
            return [new SyntaxHighlighter.Match(match[0], match.index, css)];
        }
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, func:fixComments}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:/@"(?:[^"]|"")*"/g, css:"string"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/^\s*#.*/gm, css:"preprocessor"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:/\bpartial(?=\s+(?:class|interface|struct)\b)/g, css:"keyword"}, {regex:/\byield(?=\s+(?:return|break)\b)/g, css:"keyword"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["c#", "c-sharp", "csharp"];
    SyntaxHighlighter.brushes.CSharp = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        function getKeywordsCSS(str) {
            return "\\b([a-z_]|)" + str.replace(/ /g, "(?=:)\\b|\\b([a-z_\\*]|\\*|)") + "(?=:)\\b";
        }
        function getValuesCSS(str) {
            return "\\b" + str.replace(/ /g, "(?!-)(?!:)\\b|\\b()") + ":\\b";
        }
        var keywords = "ascent azimuth background-attachment background-color background-image background-position " + "background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top " + "border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color " + "border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width " + "border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color " + "content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display " + "elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font " + "height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top " + "margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans " + "outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page " + "page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position " + "quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress " + "table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em " + "vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index";
        var values = "above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder " + "both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed " + "continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double " + "embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia " + "gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic " + "justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha " + "lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower " + "navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset " + "outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side " + "rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow " + "small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize " + "table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal " + "text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin " + "upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow";
        var fonts = "[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\#[a-fA-F0-9]{3,6}/g, css:"value"}, {regex:/(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g, css:"value"}, {regex:/!important/g, css:"color3"}, {regex:new RegExp(getKeywordsCSS(keywords), "gm"), css:"keyword"}, {regex:new RegExp(getValuesCSS(values), "g"), css:"value"}, {regex:new RegExp(this.getKeywords(fonts), "g"), css:"color1"}];
        this.forHtmlScript({left:/(&lt;|<)\s*style.*?(&gt;|>)/gi, right:/(&lt;|<)\/\s*style\s*(&gt;|>)/gi});
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["css"];
    SyntaxHighlighter.brushes.CSS = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "abs addr and ansichar ansistring array as asm begin boolean byte cardinal " + "case char class comp const constructor currency destructor div do double " + "downto else end except exports extended false file finalization finally " + "for function goto if implementation in inherited int64 initialization " + "integer interface is label library longint longword mod nil not object " + "of on or packed pansichar pansistring pchar pcurrency pdatetime pextended " + "pint64 pointer private procedure program property pshortstring pstring " + "pvariant pwidechar pwidestring protected public published raise real real48 " + "record repeat set shl shortint shortstring shr single smallint string then " + "threadvar to true try type unit until uses val var varirnt while widechar " + "widestring with word write writeln xor";
        this.regexList = [{regex:/\(\*[\s\S]*?\*\)/gm, css:"comments"}, {regex:/{(?!\$)[\s\S]*?}/gm, css:"comments"}, {regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\{\$[a-zA-Z]+ .+\}/g, css:"color1"}, {regex:/\b[\d\.]+\b/g, css:"value"}, {regex:/\$[a-zA-Z0-9]+\b/g, css:"value"}, {regex:new RegExp(this.getKeywords(keywords), "gmi"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["delphi", "pascal", "pas"];
    SyntaxHighlighter.brushes.Delphi = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        this.regexList = [{regex:/^\+\+\+ .*$/gm, css:"color2"}, {regex:/^\-\-\- .*$/gm, css:"color2"}, {regex:/^\s.*$/gm, css:"color1"}, {regex:/^@@.*@@.*$/gm, css:"variable"}, {regex:/^\+.*$/gm, css:"string"}, {regex:/^\-.*$/gm, css:"color3"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["diff", "patch"];
    SyntaxHighlighter.brushes.Diff = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "after and andalso band begin bnot bor bsl bsr bxor " + "case catch cond div end fun if let not of or orelse " + "query receive rem try when xor" + " module export import define";
        this.regexList = [{regex:new RegExp("[A-Z][A-Za-z0-9_]+", "g"), css:"constants"}, {regex:new RegExp("\\%.+", "gm"), css:"comments"}, {regex:new RegExp("\\?[A-Za-z0-9_]+", "g"), css:"preprocessor"}, {regex:new RegExp("[a-z0-9_]+:[a-z0-9_]+", "g"), css:"functions"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["erl", "erlang"];
    SyntaxHighlighter.brushes.Erland = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "as assert break case catch class continue def default do else extends finally " + "if in implements import instanceof interface new package property return switch " + "throw throws try while public protected private static";
        var types = "void boolean byte char short int long float double";
        var constants = "null";
        var methods = "allProperties count get size " + "collect each eachProperty eachPropertyName eachWithIndex find findAll " + "findIndexOf grep inject max min reverseEach sort " + "asImmutable asSynchronized flatten intersect join pop reverse subMap toList " + "padRight padLeft contains eachMatch toCharacter toLong toUrl tokenize " + "eachFile eachFileRecurse eachB yte eachLine readBytes readLine getText " + "splitEachLine withReader append encodeBase64 decodeBase64 filterLine " + "transformChar transformLine withOutputStream withPrintWriter withStream " + "withStreams withWriter withWriterAppend write writeLine " + "dump inspect invokeMethod print println step times upto use waitForOrKill " + "getText";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/""".*"""/g, css:"string"}, {regex:new RegExp("\\b([\\d]+(\\.[\\d]+)?|0x[a-f0-9]+)\\b", "gi"), css:"value"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(this.getKeywords(types), "gm"), css:"color1"}, {regex:new RegExp(this.getKeywords(constants), "gm"), css:"constants"}, {regex:new RegExp(this.getKeywords(methods), "gm"), css:"functions"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["groovy"];
    SyntaxHighlighter.brushes.Groovy = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "abstract assert boolean break byte case catch char class const " + "continue default do double else enum extends " + "false final finally float for goto if implements import " + "instanceof int interface long native new null " + "package private protected public return " + "short static strictfp super switch synchronized this throw throws true " + "transient try void volatile while";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:/\/\*([^\*][\s\S]*)?\*\//gm, css:"comments"}, {regex:/\/\*(?!\*\/)\*[\s\S]*?\*\//gm, css:"preprocessor"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi, css:"value"}, {regex:/(?!\@interface\b)\@[\$\w]+\b/g, css:"color1"}, {regex:/\@interface\b/g, css:"color2"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript({left:/(&lt;|<)%[@!=]?/g, right:/%(&gt;|>)/g});
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["java"];
    SyntaxHighlighter.brushes.Java = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var datatypes = "Boolean Byte Character Double Duration " + "Float Integer Long Number Short String Void";
        var keywords = "abstract after and as assert at before bind bound break catch class " + "continue def delete else exclusive extends false finally first for from " + "function if import in indexof init insert instanceof into inverse last " + "lazy mixin mod nativearray new not null on or override package postinit " + "protected public public-init public-read replace return reverse sizeof " + "step super then this throw true try tween typeof var where while with " + "attribute let private readonly static trigger";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:/(-?\.?)(\b(\d*\.?\d+|\d+\.?\d*)(e[+-]?\d+)?|0x[a-f\d]+)\b\.?/gi, css:"color2"}, {regex:new RegExp(this.getKeywords(datatypes), "gm"), css:"variable"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["jfx", "javafx"];
    SyntaxHighlighter.brushes.JavaFX = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "break case catch continue " + "default delete do else false  " + "for function if in instanceof " + "new null return super switch " + "this throw true try typeof var while with";
        var r = SyntaxHighlighter.regexLib;
        this.regexList = [{regex:r.multiLineDoubleQuotedString, css:"string"}, {regex:r.multiLineSingleQuotedString, css:"string"}, {regex:r.singleLineCComments, css:"comments"}, {regex:r.multiLineCComments, css:"comments"}, {regex:/\s*#.*/gm, css:"preprocessor"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript(r.scriptScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["js", "jscript", "javascript"];
    SyntaxHighlighter.brushes.JScript = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var funcs = "abs accept alarm atan2 bind binmode chdir chmod chomp chop chown chr " + "chroot close closedir connect cos crypt defined delete each endgrent " + "endhostent endnetent endprotoent endpwent endservent eof exec exists " + "exp fcntl fileno flock fork format formline getc getgrent getgrgid " + "getgrnam gethostbyaddr gethostbyname gethostent getlogin getnetbyaddr " + "getnetbyname getnetent getpeername getpgrp getppid getpriority " + "getprotobyname getprotobynumber getprotoent getpwent getpwnam getpwuid " + "getservbyname getservbyport getservent getsockname getsockopt glob " + "gmtime grep hex index int ioctl join keys kill lc lcfirst length link " + "listen localtime lock log lstat map mkdir msgctl msgget msgrcv msgsnd " + "oct open opendir ord pack pipe pop pos print printf prototype push " + "quotemeta rand read readdir readline readlink readpipe recv rename " + "reset reverse rewinddir rindex rmdir scalar seek seekdir select semctl " + "semget semop send setgrent sethostent setnetent setpgrp setpriority " + "setprotoent setpwent setservent setsockopt shift shmctl shmget shmread " + "shmwrite shutdown sin sleep socket socketpair sort splice split sprintf " + "sqrt srand stat study substr symlink syscall sysopen sysread sysseek " + "system syswrite tell telldir time times tr truncate uc ucfirst umask " + "undef unlink unpack unshift utime values vec wait waitpid warn write " + "say";
        var keywords = "bless caller continue dbmclose dbmopen die do dump else elsif eval exit " + "for foreach goto if import last local my next no our package redo ref " + "require return sub tie tied unless untie until use wantarray while " + "given when default " + "try catch finally " + "has extends with before after around override augment";
        this.regexList = [{regex:/(<<|&lt;&lt;)((\w+)|(['"])(.+?)\4)[\s\S]+?\n\3\5\n/g, css:"string"}, {regex:/#.*$/gm, css:"comments"}, {regex:/^#!.*\n/g, css:"preprocessor"}, {regex:/-?\w+(?=\s*=(>|&gt;))/g, css:"string"}, {regex:/\bq[qwxr]?\([\s\S]*?\)/g, css:"string"}, {regex:/\bq[qwxr]?\{[\s\S]*?\}/g, css:"string"}, {regex:/\bq[qwxr]?\[[\s\S]*?\]/g, css:"string"}, {regex:/\bq[qwxr]?(<|&lt;)[\s\S]*?(>|&gt;)/g, css:"string"}, {regex:/\bq[qwxr]?([^\w({<[])[\s\S]*?\1/g, css:"string"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/(?:&amp;|[$@%*]|\$#)[a-zA-Z_](\w+|::)*/g, css:"variable"}, {regex:/\b__(?:END|DATA)__\b[\s\S]*$/g, css:"comments"}, {regex:/(^|\n)=\w[\s\S]*?(\n=cut\s*\n|$)/g, css:"comments"}, {regex:new RegExp(this.getKeywords(funcs), "gm"), css:"functions"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["perl", "Perl", "pl"];
    SyntaxHighlighter.brushes.Perl = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var funcs = "abs acos acosh addcslashes addslashes " + "array_change_key_case array_chunk array_combine array_count_values array_diff " + "array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill " + "array_filter array_flip array_intersect array_intersect_assoc array_intersect_key " + "array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map " + "array_merge array_merge_recursive array_multisort array_pad array_pop array_product " + "array_push array_rand array_reduce array_reverse array_search array_shift " + "array_slice array_splice array_sum array_udiff array_udiff_assoc " + "array_udiff_uassoc array_uintersect array_uintersect_assoc " + "array_uintersect_uassoc array_unique array_unshift array_values array_walk " + "array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert " + "basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress " + "bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir " + "checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists " + "closedir closelog copy cos cosh count count_chars date decbin dechex decoct " + "deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log " + "error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded " + "feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents " + "fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype " + "floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf " + "fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname " + "gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt " + "getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext " + "gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set " + "interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double " + "is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long " + "is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault " + "is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br " + "parse_ini_file parse_str parse_url passthru pathinfo print readlink realpath rewind rewinddir rmdir " + "round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split " + "str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes " + "stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk " + "strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime " + "strtoupper strtr strval substr substr_compare";
        var keywords = "abstract and array as break case catch cfunction class clone const continue declare default die do " + "else elseif enddeclare endfor endforeach endif endswitch endwhile extends final for foreach " + "function global goto if implements include include_once interface instanceof insteadof namespace new " + "old_function or private protected public return require require_once static switch " + "trait throw try use var while xor ";
        var constants = "__FILE__ __LINE__ __METHOD__ __FUNCTION__ __CLASS__";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\$\w+/g, css:"variable"}, {regex:new RegExp(this.getKeywords(funcs), "gmi"), css:"functions"}, {regex:new RegExp(this.getKeywords(constants), "gmi"), css:"constants"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["php"];
    SyntaxHighlighter.brushes.Php = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["text", "plain"];
    SyntaxHighlighter.brushes.Plain = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "while validateset validaterange validatepattern validatelength validatecount " + "until trap switch return ref process param parameter in if global: " + "function foreach for finally filter end elseif else dynamicparam do default " + "continue cmdletbinding break begin alias \\? % #script #private #local #global " + "mandatory parametersetname position valuefrompipeline " + "valuefrompipelinebypropertyname valuefromremainingarguments helpmessage ";
        var operators = " and as band bnot bor bxor casesensitive ccontains ceq cge cgt cle " + "clike clt cmatch cne cnotcontains cnotlike cnotmatch contains " + "creplace eq exact f file ge gt icontains ieq ige igt ile ilike ilt " + "imatch ine inotcontains inotlike inotmatch ireplace is isnot le like " + "lt match ne not notcontains notlike notmatch or regex replace wildcard";
        var verbs = "write where wait use update unregister undo trace test tee take suspend " + "stop start split sort skip show set send select scroll resume restore " + "restart resolve resize reset rename remove register receive read push " + "pop ping out new move measure limit join invoke import group get format " + "foreach export expand exit enter enable disconnect disable debug cxnew " + "copy convertto convertfrom convert connect complete compare clear " + "checkpoint aggregate add";
        var commenthelp = " component description example externalhelp forwardhelpcategory forwardhelptargetname forwardhelptargetname functionality inputs link notes outputs parameter remotehelprunspace role synopsis";
        this.regexList = [{regex:new RegExp("^\\s*#[#\\s]*\\.(" + this.getKeywords(commenthelp) + ").*$", "gim"), css:"preprocessor help bold"}, {regex:SyntaxHighlighter.regexLib.singleLinePerlComments, css:"comments"}, {regex:/(&lt;|<)#[\s\S]*?#(&gt;|>)/gm, css:"comments here"}, {regex:new RegExp("@\"\\n[\\s\\S]*?\\n\"@", "gm"), css:"script string here"}, {regex:new RegExp("@'\\n[\\s\\S]*?\\n'@", "gm"), css:"script string single here"}, {regex:new RegExp("\"(?:\\$\\([^\\)]*\\)|[^\"]|`\"|\"\")*[^`]\"", "g"), css:"string"}, {regex:new RegExp("'(?:[^']|'')*'", "g"), css:"string single"}, {regex:new RegExp("[\\$|@|@@](?:(?:global|script|private|env):)?[A-Z0-9_]+", "gi"), css:"variable"}, {regex:new RegExp("(?:\\b" + verbs.replace(/ /g, "\\b|\\b") + ")-[a-zA-Z_][a-zA-Z0-9_]*", "gmi"), css:"functions"}, {regex:new RegExp(this.getKeywords(keywords), "gmi"), css:"keyword"}, {regex:new RegExp("-" + this.getKeywords(operators), "gmi"), css:"operator value"}, {regex:new RegExp("\\[[A-Z_\\[][A-Z0-9_. `,\\[\\]]*\\]", "gi"), css:"constants"}, {regex:new RegExp("\\s+-(?!" + this.getKeywords(operators) + ")[a-zA-Z_][a-zA-Z0-9_]*", "gmi"), css:"color1"}, ];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["powershell", "ps", "posh"];
    SyntaxHighlighter.brushes.PowerShell = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "and assert break class continue def del elif else " + "except exec finally for from global if import in is " + "lambda not or pass print raise return try yield while";
        var funcs = "__import__ abs all any apply basestring bin bool buffer callable " + "chr classmethod cmp coerce compile complex delattr dict dir " + "divmod enumerate eval execfile file filter float format frozenset " + "getattr globals hasattr hash help hex id input int intern " + "isinstance issubclass iter len list locals long map max min next " + "object oct open ord pow print property range raw_input reduce " + "reload repr reversed round set setattr slice sorted staticmethod " + "str sum super tuple type type unichr unicode vars xrange zip";
        var special = "None True False self cls class_";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLinePerlComments, css:"comments"}, {regex:/^\s*@\w+/gm, css:"decorator"}, {regex:/(['\"]{3})([^\1])*?\1/gm, css:"comments"}, {regex:/"(?!")(?:\.|\\\"|[^\""\n])*"/gm, css:"string"}, {regex:/'(?!')(?:\.|(\\\')|[^\''\n])*'/gm, css:"string"}, {regex:/\+|\-|\*|\/|\%|=|==/gm, css:"keyword"}, {regex:/\b\d+\.?\w*/g, css:"value"}, {regex:new RegExp(this.getKeywords(funcs), "gmi"), css:"functions"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(this.getKeywords(special), "gm"), css:"color1"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["py", "python"];
    SyntaxHighlighter.brushes.Python = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "alias and BEGIN begin break case class def define_method defined do each else elsif " + "END end ensure false for if in module new next nil not or raise redo rescue retry return " + "self super then throw true undef unless until when while yield";
        var builtins = "Array Bignum Binding Class Continuation Dir Exception FalseClass File::Stat File Fixnum Fload " + "Hash Integer IO MatchData Method Module NilClass Numeric Object Proc Range Regexp String Struct::TMS Symbol " + "ThreadGroup Thread Time TrueClass";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLinePerlComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/\b[A-Z0-9_]+\b/g, css:"constants"}, {regex:/:[a-z][A-Za-z0-9_]*/g, css:"color2"}, {regex:/(\$|@@|@)\w+/g, css:"variable bold"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(this.getKeywords(builtins), "gm"), css:"color1"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["ruby", "rails", "ror", "rb"];
    SyntaxHighlighter.brushes.Ruby = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        function getKeywordsCSS(str) {
            return "\\b([a-z_]|)" + str.replace(/ /g, "(?=:)\\b|\\b([a-z_\\*]|\\*|)") + "(?=:)\\b";
        }
        function getValuesCSS(str) {
            return "\\b" + str.replace(/ /g, "(?!-)(?!:)\\b|\\b()") + ":\\b";
        }
        var keywords = "ascent azimuth background-attachment background-color background-image background-position " + "background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top " + "border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color " + "border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width " + "border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color " + "content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display " + "elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font " + "height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top " + "margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans " + "outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page " + "page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position " + "quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress " + "table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em " + "vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index";
        var values = "above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder " + "both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed " + "continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero digits disc dotted double " + "embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia " + "gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic " + "justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha " + "lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower " + "navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset " + "outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side " + "rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow " + "small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize " + "table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal " + "text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin " + "upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow";
        var fonts = "[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";
        var statements = "!important !default";
        var preprocessor = "@import @extend @debug @warn @if @for @while @mixin @include";
        var r = SyntaxHighlighter.regexLib;
        this.regexList = [{regex:r.multiLineCComments, css:"comments"}, {regex:r.singleLineCComments, css:"comments"}, {regex:r.doubleQuotedString, css:"string"}, {regex:r.singleQuotedString, css:"string"}, {regex:/\#[a-fA-F0-9]{3,6}/g, css:"value"}, {regex:/\b(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)\b/g, css:"value"}, {regex:/\$\w+/g, css:"variable"}, {regex:new RegExp(this.getKeywords(statements), "g"), css:"color3"}, {regex:new RegExp(this.getKeywords(preprocessor), "g"), css:"preprocessor"}, {regex:new RegExp(getKeywordsCSS(keywords), "gm"), css:"keyword"}, {regex:new RegExp(getValuesCSS(values), "g"), css:"value"}, {regex:new RegExp(this.getKeywords(fonts), "g"), css:"color1"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["sass", "scss"];
    SyntaxHighlighter.brushes.Sass = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "val sealed case def true trait implicit forSome import match object null finally super " + "override try lazy for var catch throw type extends class while with new final yield abstract " + "else do if return protected private this package false";
        var keyops = "[_:=><%#@]+";
        this.regexList = [{regex:SyntaxHighlighter.regexLib.singleLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineCComments, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineSingleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.multiLineDoubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.singleQuotedString, css:"string"}, {regex:/0x[a-f0-9]+|\d+(\.\d+)?/gi, css:"value"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}, {regex:new RegExp(keyops, "gm"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["scala"];
    SyntaxHighlighter.brushes.Scala = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var funcs = "abs avg case cast coalesce convert count current_timestamp " + "current_user day isnull left lower month nullif replace right " + "session_user space substring sum system_user upper user year";
        var keywords = "absolute action add after alter as asc at authorization begin bigint " + "binary bit by cascade char character check checkpoint close collate " + "column commit committed connect connection constraint contains continue " + "create cube current current_date current_time cursor database date " + "deallocate dec decimal declare default delete desc distinct double drop " + "dynamic else end end-exec escape except exec execute false fetch first " + "float for force foreign forward free from full function global goto grant " + "group grouping having hour ignore index inner insensitive insert instead " + "int integer intersect into is isolation key last level load local max min " + "minute modify move name national nchar next no numeric of off on only " + "open option order out output partial password precision prepare primary " + "prior privileges procedure public read real references relative repeatable " + "restrict return returns revoke rollback rollup rows rule schema scroll " + "second section select sequence serializable set size smallint static " + "statistics table temp temporary then time timestamp to top transaction " + "translation trigger true truncate uncommitted union unique update values " + "varchar varying view when where with work";
        var operators = "all and any between cross in join like not null or outer some";
        this.regexList = [{regex:/--(.*)$/gm, css:"comments"}, {regex:SyntaxHighlighter.regexLib.multiLineDoubleQuotedString, css:"string"}, {regex:SyntaxHighlighter.regexLib.multiLineSingleQuotedString, css:"string"}, {regex:new RegExp(this.getKeywords(funcs), "gmi"), css:"color2"}, {regex:new RegExp(this.getKeywords(operators), "gmi"), css:"color1"}, {regex:new RegExp(this.getKeywords(keywords), "gmi"), css:"keyword"}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["sql"];
    SyntaxHighlighter.brushes.Sql = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        var keywords = "AddHandler AddressOf AndAlso Alias And Ansi As Assembly Auto " + "Boolean ByRef Byte ByVal Call Case Catch CBool CByte CChar CDate " + "CDec CDbl Char CInt Class CLng CObj Const CShort CSng CStr CType " + "Date Decimal Declare Default Delegate Dim DirectCast Do Double Each " + "Else ElseIf End Enum Erase Error Event Exit False Finally For Friend " + "Function Get GetType GoSub GoTo Handles If Implements Imports In " + "Inherits Integer Interface Is Let Lib Like Long Loop Me Mod Module " + "MustInherit MustOverride MyBase MyClass Namespace New Next Not Nothing " + "NotInheritable NotOverridable Object On Option Optional Or OrElse " + "Overloads Overridable Overrides ParamArray Preserve Private Property " + "Protected Public RaiseEvent ReadOnly ReDim REM RemoveHandler Resume " + "Return Select Set Shadows Shared Short Single Static Step Stop String " + "Structure Sub SyncLock Then Throw To True Try TypeOf Unicode Until " + "Variant When While With WithEvents WriteOnly Xor";
        this.regexList = [{regex:/'.*$/gm, css:"comments"}, {regex:SyntaxHighlighter.regexLib.doubleQuotedString, css:"string"}, {regex:/^\s*#.*$/gm, css:"preprocessor"}, {regex:new RegExp(this.getKeywords(keywords), "gm"), css:"keyword"}];
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["vb", "vbnet"];
    SyntaxHighlighter.brushes.Vb = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();
(function () {
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== "undefined" ? require("shCore").SyntaxHighlighter : null);
    function Brush() {
        function process(match, regexInfo) {
            var constructor = SyntaxHighlighter.Match, code = match[0], tag = new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)", "xg").exec(code), result = [];
            if (match.attributes != null) {
                var attributes, regex = new XRegExp("(?<name> [\\w:\\-\\.]+)" + "\\s*=\\s*" + "(?<value> \".*?\"|'.*?'|\\w+)", "xg");
                while ((attributes = regex.exec(code)) != null) {
                    result.push(new constructor(attributes.name, match.index + attributes.index, "color1"));
                    result.push(new constructor(attributes.value, match.index + attributes.index + attributes[0].indexOf(attributes.value), "string"));
                }
            }
            if (tag != null) {
                result.push(new constructor(tag.name, match.index + tag[0].indexOf(tag.name), "keyword"));
            }
            return result;
        }
        this.regexList = [{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)", "gm"), css:"color2"}, {regex:SyntaxHighlighter.regexLib.xmlComments, css:"comments"}, {regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)", "sg"), func:process}];
    }
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ["xml", "xhtml", "xslt", "html"];
    SyntaxHighlighter.brushes.Xml = Brush;
    typeof (exports) != "undefined" ? exports.Brush = Brush : null;
})();

