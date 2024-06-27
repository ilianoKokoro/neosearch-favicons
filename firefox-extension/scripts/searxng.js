//#region Constants
const parse = Range.prototype.createContextualFragment.bind(
    document.createRange()
);
let CONSTANTS = {};
fetch(browser.runtime.getURL("/data/constants.json"))
    .then((response) => response.json())
    .then((config) => {
        CONSTANTS = config;
        updateFavicons();
    });

//#endregion

//#region Rate limiters
let checkTimerRunning = false;
let reloadTimerRunning = false;
//#endregion

//#region Events listeners

const targetNode = document.getElementById("urls");
const config = { attributes: true, childList: true, subtree: true };
const callback = (mutationsList, observer) => {
    updateFavicons();
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

browser.runtime.onMessage.addListener((message) => {
    updateFavicons();
});

//#endregion
async function updateFavicons() {
    // Status
    const isEnabledRes = await browser.storage.sync.get(
        CONSTANTS.STATUS_STORAGE_KEY
    );
    const isEnabled = isEnabledRes.isEnabled || CONSTANTS.TRUE;

    if (isEnabled === CONSTANTS.TRUE) {
        if (reloadTimerRunning) {
            return;
        }

        if (checkTimerRunning) {
            reloadTimerRunning = true;
            reloadTimer = setTimeout(() => {
                reloadTimerRunning = false;
            }, CONSTANTS.UPDATE_DELAY);
            return;
        }

        checkTimerRunning = true;
        checkTimer = setTimeout(() => {
            checkTimerRunning = false;
        }, CONSTANTS.UPDATE_DELAY);

        // Size
        const sizeRes = await browser.storage.sync.get(
            CONSTANTS.SIZE_STORAGE_KEY
        );
        const size = sizeRes.size || CONSTANTS.DEFAULT_ICON_SIZE;

        resetAllOutdatedFavicons(size);

        const linkElements = document.querySelectorAll(
            `${CONSTANTS.BODY_TAG} ${CONSTANTS.LINK_TAG}.${CONSTANTS.URL_CLASS}`
        );
        linkElements.forEach(async (link) => {
            try {
                const websiteUrl = link.href;
                const websiteDomain = getDomainFromUrl(websiteUrl);
                const fullIconUrl = `${CONSTANTS.PREFIX_ICON_URL}${websiteDomain}${CONSTANTS.SUFFIX_ICON_URL}`;

                const dataUri = await toDataUri(fullIconUrl);

                const newLinkedFavicon = parseIntoHTML(
                    `<a class="${CONSTANTS.LINK_ICON_CLASS}" href="${websiteUrl}"><img height="${size}${CONSTANTS.ICON_UNIT}" width="${size}${CONSTANTS.ICON_UNIT}" src="${dataUri}" alt="${websiteDomain} icon"></a>`
                );

                if (
                    !link.parentNode.innerHTML.includes(
                        newLinkedFavicon.innerHTML
                    )
                ) {
                    link.parentNode.insertBefore(newLinkedFavicon, link);
                }
            } catch (error) {
                console.error(error);
            }
        });
    } else {
        resetAllFavicons();
    }
}

//#region Favicon management
function resetAllOutdatedFavicons(currentSize) {
    const favicons = getAllFavicons();
    const realFavicons = [];
    favicons.forEach((favicon) => {
        const imageElement = favicon.firstChild;
        if (
            imageElement.height != currentSize ||
            imageElement.width != currentSize
        ) {
            realFavicons.push(favicon);
        }
    });
    resetFavicons(realFavicons);
}

function resetAllFavicons() {
    resetFavicons(getAllFavicons());
}

function getAllFavicons() {
    return document.querySelectorAll(
        `${CONSTANTS.LINK_TAG}.${CONSTANTS.LINK_ICON_CLASS}`
    );
}

function resetFavicons(favicons) {
    favicons.forEach((favicon) => {
        favicon.remove();
    });
}
//#endregion

//#region Helper functions
function parseIntoHTML(htmlString) {
    const fragment = parse(htmlString);
    const tempElement = document.createElement(CONSTANTS.DIV_TAG);
    tempElement.appendChild(fragment);
    return tempElement.firstChild;
}

function getDomainFromUrl(url) {
    var parsedUrl = new URL(url);
    return parsedUrl.hostname;
}

async function toDataUri(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    });
}
//#endregion
