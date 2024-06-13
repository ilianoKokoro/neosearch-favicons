//#region Constants
let CONSTANTS = {};

fetch(browser.runtime.getURL("/constants.json"))
    .then((response) => response.json())
    .then((config) => {
        CONSTANTS = config;
    });
//#endregion

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === CONSTANTS.SETTINGS_CHANGED_EVENT) {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
                browser.tabs.sendMessage(tabs[0].id, {
                    type: CONSTANTS.BACKGROUND_SETTINGS_CHANGED_EVENT,
                    data: message.data,
                });
            });
    }
});
