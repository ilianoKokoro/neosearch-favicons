//#region Constants
let CONSTANTS = {};

fetch(browser.runtime.getURL("/constants.json"))
    .then((response) => response.json())
    .then((config) => {
        CONSTANTS = config;
        retrieveSettings();
    });
//#endregion

//#region Event listeners :
document.querySelector("form").addEventListener("submit", saveOptions);
document.addEventListener("click", function (event) {
    if (event.target.classList.contains(CONSTANTS.MODAL_CLOSE_BUTTON_CLASS)) {
        closeModal();
    }

    if (event.target.classList.contains(CONSTANTS.STATUS_BUTTON_ID)) {
        toggleStatus();
    }

    if (event.target.classList.contains(CONSTANTS.DEFAULT_BUTTON_CLASS)) {
        resetDefaults();
    }
});
// #endregion

//#region Settings write
async function saveOptions(e) {
    e.preventDefault();

    let size = document.querySelector(`#${CONSTANTS.SIZE_INPUT_ID}`).value;
    if (size < CONSTANTS.MIN_ICON_SIZE || size > CONSTANTS.MAX_ICON_SIZE) {
        showError(
            `The size must be a number between ${CONSTANTS.MIN_ICON_SIZE} and ${CONSTANTS.MAX_ICON_SIZE}.`
        );
        return;
    }

    if (isNaN(size)) {
        showError(CONSTANTS.SETTINGS_NUMBER_FAILED_MSG);
        return;
    }

    await browser.storage.sync.set({
        size: size,
    });
    showMessage(CONSTANTS.SETTINGS_SAVED_MSG);
    sendMessageToBackground(CONSTANTS.SETTINGS_CHANGED_EVENT);
}

async function toggleStatus() {
    const isEnabledRes = await browser.storage.sync.get(
        CONSTANTS.STATUS_STORAGE_KEY
    );

    const isEnabled =
        (isEnabledRes.isEnabled || CONSTANTS.DEFAULT_STATUS) === CONSTANTS.TRUE
            ? CONSTANTS.FALSE
            : CONSTANTS.TRUE;

    await browser.storage.sync.set({
        isEnabled: isEnabled,
    });

    setButtonStatus(isEnabled);
    sendMessageToBackground(CONSTANTS.SETTINGS_CHANGED_EVENT);
}

async function resetDefaults() {
    await browser.storage.sync.set({
        size: CONSTANTS.DEFAULT_ICON_SIZE,
    });
    retrieveSettings();
    showMessage(CONSTANTS.SETTINGS_RESTORED_SAVED_MSG);
    sendMessageToBackground(CONSTANTS.SETTINGS_CHANGED_EVENT);
}

// #endregion

//#region Settings read
async function retrieveSettings() {
    // Status
    const isEnabledRes = await browser.storage.sync.get(
        CONSTANTS.STATUS_STORAGE_KEY
    );
    const isEnabled = isEnabledRes.isEnabled || CONSTANTS.DEFAULT_STATUS;
    setButtonStatus(isEnabled);

    // Size
    const sizeRes = await browser.storage.sync.get(CONSTANTS.SIZE_STORAGE_KEY);
    const size = sizeRes.size || CONSTANTS.DEFAULT_ICON_SIZE;
    document.querySelector(`#${CONSTANTS.SIZE_INPUT_ID}`).value =
        size || CONSTANTS.DEFAULT_ICON_SIZE;
}

function setButtonStatus(status) {
    const button = document.getElementById(CONSTANTS.STATUS_BUTTON_ID);
    if (button == null) {
        return;
    }
    if (status === CONSTANTS.TRUE) {
        button.classList.remove(CONSTANTS.BG_RED);
        button.classList.add(CONSTANTS.BG_GREEN);
        button.textContent = CONSTANTS.BUTTON_ENABLED_MSG;
    } else {
        button.classList.remove(CONSTANTS.BG_GREEN);
        button.classList.add(CONSTANTS.BG_RED);
        button.textContent = CONSTANTS.BUTTON_DISABLED_MSG;
    }
}
// #endregion

//#region Modal controls :
function showError(message) {
    const modal = document.getElementById(CONSTANTS.MODAL_CLASS);
    modal.classList.add(CONSTANTS.MODAL_ACTIVE_CLASS);
    const errorParagraph = document.getElementById(
        CONSTANTS.ERROR_MODAL_PARAGRAPH_CLASS
    );
    const paragraph = document.getElementById(
        CONSTANTS.MESSAGE_MODAL_PARAGRAPH_CLASS
    );
    paragraph.textContent = CONSTANTS.EMPTY;
    errorParagraph.textContent = message;
}

function showMessage(message) {
    const modal = document.getElementById(CONSTANTS.MODAL_CLASS);
    modal.classList.add(CONSTANTS.MODAL_ACTIVE_CLASS);
    const errorParagraph = document.getElementById(
        CONSTANTS.ERROR_MODAL_PARAGRAPH_CLASS
    );
    const paragraph = document.getElementById(
        CONSTANTS.MESSAGE_MODAL_PARAGRAPH_CLASS
    );
    errorParagraph.textContent = CONSTANTS.EMPTY;
    paragraph.textContent = message;
}

function closeModal() {
    const modal = document.getElementById(CONSTANTS.MODAL_CLASS);
    modal.classList.remove(CONSTANTS.MODAL_ACTIVE_CLASS);
}
// #endregion

//#region Event sender
function sendMessageToBackground(type, data = {}) {
    browser.tabs.query({}).then((tabs) => {
        tabs.forEach((tab) => {
            browser.tabs
                .sendMessage(tab.id, {
                    type: type,
                    data: data,
                })
                .catch((_) => {
                    // Do nothing for the sake of speed
                    // console.error("Sent message to an incompatible tab");
                });
        });
    });
}
//#endregion
