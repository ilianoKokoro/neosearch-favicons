import CONSTANTS from "../constants.js";

//#region Event listeners :
document.addEventListener("DOMContentLoaded", retrieveSettings);
document.querySelector("form").addEventListener("submit", saveOptions);
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal-close-custom")) {
        closeModal();
    }

    if (event.target.classList.contains("toggle")) {
        toggleStatus();
    }

    if (event.target.classList.contains("reset-defaults")) {
        resetDefaults();
    }
});
// #endregion

//#region Settings write
async function saveOptions(e) {
    e.preventDefault();

    let size = document.querySelector("#size").value;
    if (size < CONSTANTS.MIN_ICON_SIZE || size > CONSTANTS.MAX_ICON_SIZE) {
        showError(
            `The size must be a number between ${CONSTANTS.MIN_ICON_SIZE} and ${CONSTANTS.MAX_ICON_SIZE}.`
        );
        return;
    }

    if (isNaN(size)) {
        showError(`The size must be a number.`);
        return;
    }

    await browser.storage.sync.set({
        size: size,
    });
    showMessage("Settings saved.");
}

async function toggleStatus() {
    const isEnabledRes = await browser.storage.sync.get("isEnabled");
    let isEnabled = isEnabledRes.isEnabled || CONSTANTS.DEFAULT_STATUS;

    if (isEnabled === "true") {
        isEnabled = "false";
    } else {
        isEnabled = "true";
    }

    await browser.storage.sync.set({
        isEnabled: isEnabled,
    });

    setButtonStatus(isEnabled);
}

async function resetDefaults() {
    await browser.storage.sync.set({
        size: CONSTANTS.DEFAULT_ICON_SIZE,
    });
    retrieveSettings();
    showMessage("Settings restored to default.");
}
// #endregion

//#region Settings read
async function retrieveSettings() {
    // Status
    const isEnabledRes = await browser.storage.sync.get("isEnabled");
    const isEnabled = isEnabledRes.isEnabled || CONSTANTS.DEFAULT_STATUS;
    setButtonStatus(isEnabled);

    // Size
    const sizeRes = await browser.storage.sync.get("size");
    const size = sizeRes.size || CONSTANTS.DEFAULT_ICON_SIZE;
    document.querySelector("#size").value = size || CONSTANTS.DEFAULT_ICON_SIZE;
}

function setButtonStatus(status) {
    const button = document.getElementById("toggle");
    if (status === "true") {
        button.classList.remove("is-danger");
        button.classList.add("is-success");
        button.textContent = "Enabled";
    } else {
        button.classList.remove("is-success");
        button.classList.add("is-danger");
        button.textContent = "Disabled";
    }
}
// #endregion

//#region Modal controls :
function showError(message) {
    const modal = document.getElementById("modal");
    modal.classList.add("is-active");
    const errorParagraph = document.getElementById("error-message");
    const paragraph = document.getElementById("message");
    paragraph.textContent = "";
    errorParagraph.textContent = message;
}

function showMessage(message) {
    const modal = document.getElementById("modal");
    modal.classList.add("is-active");
    const errorParagraph = document.getElementById("error-message");
    const paragraph = document.getElementById("message");
    errorParagraph.textContent = "";
    paragraph.textContent = message;
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("is-active");
}
// #endregion
