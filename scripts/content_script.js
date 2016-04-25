(function(global) {
    /*var host = global.location.host;
    if (host !== "gist.github.com") {
        console.warn("wrong place!");
        return;
    }*/
    var beautifyingGist = null,
        beautifyInProcess = false,
        copiedInformerTimer = null,
        ace_editor = $('.ace_editor');

    if (!ace_editor && !ace_editor.length) {
        console.warn("Not Ace editor to prettify! I quit!!");
        return;
    }

    var getCopiedInformer = function() {
            var copiedInformer = document.createElement('div');
            copiedInformer.innerText = 'Beautified gist Copied! Select All and Paste it.';
            copiedInformer.className = 'copiedInformer';
            copiedInformer.style.position = 'absolute';
            copiedInformer.style.font = '16px / 1.4 Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            copiedInformer.style.fontWeight = 'bold';
            copiedInformer.style.top = '36px';
            copiedInformer.style.right = '20px';
            copiedInformer.style.zIndex = 1;
            copiedInformer.style.color = '#39c';

            return copiedInformer;
        },

        getNewBeautifyBtn = function() {
            var beautifyBtn = document.createElement('div');
            beautifyBtn.innerText = 'Beautify gist';
            beautifyBtn.className = 'btn gist-beautify';
            beautifyBtn.style.position = 'absolute';
            beautifyBtn.style.font = '13px / 1.4 Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            beautifyBtn.style.top = '-1px';
            beautifyBtn.style.right = '18px';
            beautifyBtn.style.zIndex = 1;
            beautifyBtn.style.color = '#333';

            return beautifyBtn;
        },

        beautifyBtnClickHandler = function(editor) {
            if (!editor) {
                console.warn('[beautifyBtnClickHandler] not editor parent provided!');
                return;
            }
            if (beautifyInProcess) {
                console.warn('[beautifyBtnClickHandler] beautify In Process, try again later.');
                return;
            }

            beautifyInProcess = true;

            beautifyingGist = editor.find('.ace_text-layer');

            if (!beautifyingGist || !beautifyingGist.length) {
                console.warn("[beautifyBtnClickHandler] fail to find the gist!");
                return;
            }

            chrome.extension.sendMessage({ input: beautifyingGist[0].innerText }, function(response) {
                // put beautified output in clipboard.
                document.addEventListener('copy', function(e) {
                    e.clipboardData.setData('text/plain', response.output);
                    e.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
                });
                document.execCommand('copy');

                if (!copiedInformerTimer) {
                    var copiedInformer = getCopiedInformer();
                    beautifyingGist[0].appendChild(copiedInformer);
                
                    var copiedInformerTimer = setTimeout(function(){
                        beautifyingGist[0].removeChild(copiedInformer);
                        clearTimeout(copiedInformerTimer);
                        copiedInformerTimer = null;
                    }, 2000);
                }

                beautifyInProcess = false;
            });
        };

    var prepareBeautifyBtns = (function() {
        ace_editor.each(function(index) {
            var beautifyBtn = getNewBeautifyBtn();
            beautifyBtn.addEventListener("click", function() {
                beautifyBtnClickHandler($(this).parent());
            }, true);

            $(this).append(beautifyBtn);
        });
    })();


})(window);
