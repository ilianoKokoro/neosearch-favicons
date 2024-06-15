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
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((tab) => {
                browser.tabs
                    .sendMessage(tab.id, {
                        type: CONSTANTS.BACKGROUND_SETTINGS_CHANGED_EVENT,
                        data: message.data,
                    })
                    .catch((_) => {
                        // Do nothing for the sake of speed
                        //  console.error("Sent message to an incompatible tab");
                    });
            });
        });
    }
});
