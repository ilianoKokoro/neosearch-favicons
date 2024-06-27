//#region Import of constants
let CONSTANTS = {};

fetch(browser.runtime.getURL("/data/constants.json"))
    .then((response) => response.json())
    .then((config) => {
        CONSTANTS = config;
        // Entrypoint
        retrieveSettings();
    });
//#endregion

//#region Event listeners
// Save button
document.querySelector("form").addEventListener("submit", saveOptions);
// All other button actions
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
        showModalMessage(
            `The size must be a number between ${CONSTANTS.MIN_ICON_SIZE} and ${CONSTANTS.MAX_ICON_SIZE}.`,
            true
        );
        return;
    }

    if (isNaN(size)) {
        showModalMessage(CONSTANTS.SETTINGS_NUMBER_FAILED_MSG, true);
        return;
    }

    await browser.storage.sync.set({
        size: size,
    });
    showModalMessage(CONSTANTS.SETTINGS_SAVED_MSG, false);
    updateAllTabs();
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
    updateAllTabs();
}

async function resetDefaults() {
    await browser.storage.sync.set({
        size: CONSTANTS.DEFAULT_ICON_SIZE,
    });
    retrieveSettings();
    showModalMessage(CONSTANTS.SETTINGS_RESTORED_SAVED_MSG, false);
    updateAllTabs();
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

    const isStatusEnabled = status === CONSTANTS.TRUE;

    const color = isStatusEnabled ? CONSTANTS.BG_GREEN : CONSTANTS.BG_RED;
    const textContent = isStatusEnabled
        ? CONSTANTS.BUTTON_ENABLED_MSG
        : CONSTANTS.BUTTON_DISABLED_MSG;

    button.classList.remove(CONSTANTS.BG_RED);
    button.classList.remove(CONSTANTS.BG_GREEN);
    button.classList.add(color);
    button.textContent = textContent;
}
// #endregion

//#region Modal controls :
function showModalMessage(message, isError) {
    const modal = document.getElementById(CONSTANTS.MODAL_CLASS);
    modal.classList.add(CONSTANTS.MODAL_ACTIVE_CLASS);

    const errorParagraph = document.getElementById(
        CONSTANTS.ERROR_MODAL_PARAGRAPH_CLASS
    );
    const paragraph = document.getElementById(
        CONSTANTS.MESSAGE_MODAL_PARAGRAPH_CLASS
    );

    errorParagraph.textContent = isError ? message : CONSTANTS.EMPTY;
    paragraph.textContent = isError ? CONSTANTS.EMPTY : message;
}

function closeModal() {
    const modal = document.getElementById(CONSTANTS.MODAL_CLASS);
    modal.classList.remove(CONSTANTS.MODAL_ACTIVE_CLASS);
}
// #endregion

//#region Event senders
function updateAllTabs() {
    sendMessageToAllTabs(CONSTANTS.SETTINGS_CHANGED_EVENT);
}

function sendMessageToAllTabs(type, data = {}) {
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
