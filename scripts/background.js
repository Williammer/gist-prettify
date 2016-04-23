/*
 * background tasks to perform code beautify on gist
 * @dep lib/beautify.js, lib/beautify-css.js, lib/beautify-html.js
 */
var beautify_in_progress = false,
    output;

function looks_like_html(source) {
    // <foo> - looks like html
    // <!--\nalert('foo!');\n--> - doesn't look like html
    var trimmed = source.replace(/^[ \t\n\r]+/, ''),
        comment_mark = '<' + '!-' + '-';

    return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
}

function beautify(input) {
    function isTrue(storageId) {
        return localStorage[storageId] === 'on';
    }

    var opts = {};

    opts.indent_size = localStorage['tabsize'];
    opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
    opts.indent_scripts = localStorage['indent-scripts'];
    opts.brace_style = localStorage['brace-style'];
    opts.preserve_newlines = isTrue('preserve-newlines');
    opts.keep_array_indentation = isTrue('keep-array-indentation');
    opts.break_chained_methods = isTrue('break-chained-methods');
    opts.space_before_conditional = isTrue('space-before-conditional');
    opts.unescape_strings = isTrue('unescape-strings');
    opts.space_after_anon_function = true;
    opts.e4x = true;

    if (isTrue('limit-preserve-newlines'))
        opts.max_preserve_newlines = localStorage['max-preserve-newlines'];

    if (looks_like_html(input)) {
        return style_html(input, opts);
    }

    return js_beautify(input, opts);
}

(function init() {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (!request.input) {
        	console.warn("[background] No outputs!");
        	return;
        }

        if (beautify_in_progress) {
            console.warn("[background] beautify in progress !");
            return;
        }

        beautify_in_progress = true;

        output = beautify(request.input);

        beautify_in_progress = false;

        sendResponse({ output: output });
    });

})();