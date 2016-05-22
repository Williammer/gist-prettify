(function(global) {
    'use strict';

    var beautifyingGist = null,
        beautifyInProcess = false,
        informTimer = null,
        beautifyHeader = null,
        beautifyBtn = null,
        closeBtn = null,
        informer = null,
        body = document.querySelector('body');

        // create
    var createBeautifyHeader = function() {
            var beautifyHeader = document.createElement('div');
                beautifyHeader.className = 'btfy-header';

            return beautifyHeader;
        },
        appendBeautifyHeader = function() {
            body.className = "beautify-notice";
            body.appendChild(beautifyHeader);
        },
        createBeautifyBtn = function() {
            if (beautifyBtn) {
                return beautifyBtn;
            }

            var beautifyBtn = document.createElement('div');

            beautifyBtn.innerText = 'Beautify your newly copied gist';
            beautifyBtn.className = 'btn btfy-btn';

            return beautifyBtn;
        },
        createCloseBtn = function() {
            if (closeBtn) {
                return closeBtn;
            }

            var closeBtn = document.createElement('div');

            closeBtn.innerText = 'x';
            closeBtn.className = 'close-btn';

            return closeBtn;
        },
        showBeautifyBtn = function() {
            beautifyBtn = createBeautifyBtn();
            beautifyBtn.addEventListener("click", beautifyBtnClickHandler, true);

            closeBtn = createCloseBtn();
            closeBtn.addEventListener("click", clearBeautifyBtn, true);

            if (beautifyHeader) {
                body.removeChild(beautifyHeader);
            }
            beautifyHeader = createBeautifyHeader();
            beautifyHeader.appendChild(beautifyBtn);
            beautifyHeader.appendChild(closeBtn);

            appendBeautifyHeader();
        },
        createInformer = function(msg) {
            if (typeof msg !== 'string' || msg.length <= 0) {
                console.warn('[createInformer] not msg to inform.');
                return;
            }
            var informer = document.createElement('div');
                informer.innerText = msg;
                informer.className = 'informer';

            return informer;
        },
        showInformer = function(msg) {
            if (typeof msg !== 'string' || msg.length <= 0) {
                console.warn('[showInformer] not msg to inform.');
                return;
            }
            informer = createInformer(msg);

            if (beautifyHeader) {
                body.removeChild(beautifyHeader);
            }
            beautifyHeader = createBeautifyHeader();
            beautifyHeader.appendChild(informer);

            appendBeautifyHeader();

            addInformTimer();
        },
        addInformTimer = function() {
            informTimer = global.setTimeout(function() {
                clearInform();
                clearInformTimer();
            }, 3000);
        },
        // remove
        clearBeautifyHeader = function() {
            if (!beautifyHeader) {
                console.warn("no container to clear.");
                return;
            }

            body.removeChild(beautifyHeader);
            body.className = "";
            beautifyHeader = null;
        },
        clearBeautifyBtn = function() {
            if (beautifyBtn) {
                closeBtn.removeEventListener("click", clearBeautifyBtn, true);
                beautifyBtn.removeEventListener("click", beautifyBtnClickHandler, true);
                beautifyBtn = null;
                closeBtn = null;

                clearBeautifyHeader();
            }
        },
        clearInform = function() {
            if (informer) {
                clearBeautifyHeader();
                informer = null;
            }
        },
        clearInformTimer = function() {
            if (informTimer) {
                global.clearTimeout(informTimer);
                informTimer = null;
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
                    if (!informTimer) {
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
            console.info("No contents to be beautified :(");
            return;
        }

        showBeautifyBtn();
        e.preventDefault();
    });

})(window);
