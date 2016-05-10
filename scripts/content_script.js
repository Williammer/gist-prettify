(function(global) {
    var beautifyingGist = null,
        beautifyInProcess = false,
        copiedInformTimer = null,
        beautifyBtn = null,
        copiedInform = null,
        body = document.querySelector('body');

    var createInformer = function(msg) {
            if (typeof msg !== 'string' || msg.length <= 0) {
                console.warn('[createInformer] not msg to inform.');
                return;
            }
            
            var copiedInform = document.createElement('div');
                copiedInform.innerText = msg;
                copiedInform.className = 'copiedInform';
                copiedInform.style.position = 'absolute';
                copiedInform.style.font = '20px / 1.5 Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
                copiedInform.style.fontWeight = 'bold';
                copiedInform.style.top = '100px';
                copiedInform.style.width = '100%';
                copiedInform.style.textAlign = 'center';
                copiedInform.style.zIndex = 100;
                copiedInform.style.color = '#39c';

            return copiedInform;
        },

        getNewBeautifyBtn = function() {
            var beautifyBtn = document.createElement('div');
            beautifyBtn.innerText = 'Beautify gist';
            beautifyBtn.className = 'btn gist-beautify';
            beautifyBtn.style.position = 'absolute';
            beautifyBtn.style.font = '16px / 1.4 Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            beautifyBtn.style.top = '100px';
            beautifyBtn.style.left = '500px';
            beautifyBtn.style.zIndex = 100;
            beautifyBtn.style.color = '#333';

            return beautifyBtn;
        },

        appendBeautifyBtn = function() {
            beautifyBtn = getNewBeautifyBtn();
            beautifyBtn.addEventListener("click", beautifyBtnClickHandler, true);

            body.appendChild(beautifyBtn);
        },

        appendCopiedInform = function() {
            copiedInform = createInformer('Beautified gist Copied!  Paste it to where you want :)');
            body.appendChild(copiedInform);
        },

        addCopiedInformTimer = function() {
            copiedInformTimer = global.setTimeout(function() {
                clearCopiedInform();
                clearCopiedInformTimer();
            }, 2000);
        },

        beautifyBtnClickHandler = function() {
            if (!beautifyingGist) {
                console.warn('[beautifyBtnClickHandler] not valid beautifyingGist.');
                return;
            }

            if (beautifyInProcess) {
                console.warn('[beautifyBtnClickHandler] beautify In Process, try again later.');
                return;
            }

            beautifyInProcess = true;

            try {
                chrome.extension.sendMessage({ input: beautifyingGist }, function(response) {
                    // Put beautified output in clipboard
                    document.addEventListener('copy', function(e) {
                        e.clipboardData.setData('text/plain', response.output);
                        e.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
                    });
                    document.execCommand('copy');

                    // Send success message
                    if (!copiedInformTimer) {
                        clearBeautifyBtn();
                        appendInformer('Beautified gist Copied!  Paste it to where you want :)');
                    }

                    beautifyInProcess = false;
                });
            } catch (e){
                console.error("[beautify] error: "+e);
                appendInformer('Has error in the beautify process, please try again :(');
                beautifyInProcess = false;
            }
        },

        clearBeautifyBtn = function() {
            if (beautifyBtn) {
                beautifyBtn.removeEventListener("click", beautifyBtnClickHandler, true);
                body.removeChild(beautifyBtn);
                beautifyBtn = null;
            }
        },

        clearCopiedInform = function() {
            if (copiedInform) {
                body.removeChild(copiedInform);
                copiedInform = null;
            }
        },

        clearCopiedInformTimer = function() {
            if (copiedInformTimer) {
                global.clearTimeout(copiedInformTimer);
                copiedInformTimer = null;
            }
        };

    // get gist from clipboard after Ctrl+A and Ctrl+C
    document.addEventListener('copy', function(e) {
        if (beautifyingGist) {
            // skip if it's the copy event of beautified codes
            return;
        }

        beautifyingGist = e.clipboardData.getData('text/plain');
        if (typeof beautifyingGist !== 'string' || beautifyingGist.length <= 0) {
            createInformer("No contents copied to be beautified :(");
            return;
        }

        appendBeautifyBtn();
        e.preventDefault();
    });

})(window);
