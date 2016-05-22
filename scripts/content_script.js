(function(global) {
    'use strict';

    var beautifyingGist = null,
        beautifyInProcess = false,
        copiedInformTimer = null,
        beautifyBtn = null,
        beautifyBtnContainer = null,
        copiedInform = null,
        body = document.querySelector('body');

        // create
    var createInformer = function(msg) {
            if (typeof msg !== 'string' || msg.length <= 0) {
                console.warn('[createInformer] not msg to inform.');
                return;
            }

            var copiedInform = document.createElement('div');
            copiedInform.innerText = msg;
            copiedInform.className = 'informer';

            return copiedInform;
        },
        createBeautifyBtnContainer = function() {
            var beautifyBtnContainer = document.createElement('div');

            beautifyBtnContainer.className = 'btfy-btn-container';

            return beautifyBtnContainer;
        },
        createBeautifyBtn = function() {
            var beautifyBtn = document.createElement('div');

            beautifyBtn.innerText = 'Beautify your copied gist';
            beautifyBtn.className = 'btn btfy-btn';

            return beautifyBtn;
        },
        showBeautifyBtn = function() {
            beautifyBtn = createBeautifyBtn();
            beautifyBtn.addEventListener("click", beautifyBtnClickHandler, true);

            beautifyBtnContainer = createBeautifyBtnContainer();
            beautifyBtnContainer.appendChild(beautifyBtn);

            body.className = "beautify-notice";
            body.appendChild(beautifyBtnContainer);
        },
        showInformer = function(msg) {
            if (typeof msg !== 'string' || msg.length <= 0) {
                console.warn('[showInformer] not msg to inform.');
                return;
            }

            copiedInform = createInformer(msg);

            if (!beautifyBtnContainer) {
                beautifyBtnContainer = createBeautifyBtnContainer();
            }
            beautifyBtnContainer.appendChild(copiedInform);

            body.className = "beautify-notice";
            body.appendChild(beautifyBtnContainer);

            addInformTimer();
        },
        addInformTimer = function() {
            copiedInformTimer = global.setTimeout(function() {
                clearCopiedInform();
                clearCopiedInformTimer();
            }, 3000);
        },
        // remove
        clearBeautifyBtnContainer = function() {
            if (!beautifyBtnContainer) {
                console.warn("no container to clear.");
                return;
            }

            body.removeChild(beautifyBtnContainer);
            body.className = "";
            beautifyBtnContainer = null;
        },
        clearBeautifyBtn = function() {
            if (beautifyBtn) {
                beautifyBtn.removeEventListener("click", beautifyBtnClickHandler, true);

                clearBeautifyBtnContainer();
                beautifyBtn = null;
            }
        },
        clearCopiedInform = function() {
            if (copiedInform) {
                clearBeautifyBtnContainer();
                copiedInform = null;
            }
        },
        clearCopiedInformTimer = function() {
            if (copiedInformTimer) {
                global.clearTimeout(copiedInformTimer);
                copiedInformTimer = null;
            }
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
                        showInformer('Beautified gist Copied!  Paste it to where you want :)');
                    }

                    beautifyInProcess = false;
                });
            } catch (e) {
                console.error("[beautify] error: " + e);
                showInformer('Has error in the beautify process, please try again :(');
                beautifyInProcess = false;
            }
        };



    // get gist from clipboard after Ctrl+C
    document.addEventListener('copy', function(e) {
        if (beautifyInProcess) {
            console.warn("In the process of beautify...");
            // skip if it's the copy event of beautified codes
            return;
        }

        beautifyingGist = e.clipboardData.getData('text/plain');
        if (typeof beautifyingGist !== 'string' || beautifyingGist.length <= 0) {
            showInformer("No contents copied to be beautified :(");
            return;
        }

        showBeautifyBtn();
        e.preventDefault();
    });

})(window);
