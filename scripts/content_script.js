(function(global) {
    /*var host = global.location.host;
    if (host !== "gist.github.com") {
        console.warn("wrong place!");
        return;
    }*/
    var beautifyingGist = null,
        beautifyInProcess = false,
        ace_editor = $('.ace_editor');

    if (!ace_editor && !ace_editor.length) {
        console.warn("Not Ace editor to prettify! I quit!!");
        return;
    }

    var getNewBeautifyBtn = function () {
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

        beautifyBtnClickHandler = function (editor) {
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

            chrome.extension.sendMessage({ input: beautifyingGist[0].innerText}, function(response) {
                // TODO-1: set the content thru Ace's editor layer
                beautifyingGist[0].innerText = response.output;
                beautifyInProcess = false;
            });
        };

    var prepareBeautifyBtns = (function(){
        ace_editor.each(function(index){
            var beautifyBtn = getNewBeautifyBtn();
                beautifyBtn.addEventListener("click", function(){
                    beautifyBtnClickHandler($(this).parent());
                }, true);

            $(this).append(beautifyBtn);
        });
    })();


})(window);
