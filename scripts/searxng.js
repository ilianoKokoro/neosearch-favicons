const PREFIX_ICON_URL = "https://icons.duckduckgo.com/ip3/";
const SUFFIX_ICON_URL = ".ico";

const TRUE = "true";
const FALSE = "false";
const LINK_ICON_CLASS = "neosearch-favicon";
const URL_CLASS = "url_wrapper";
const SIZE_STORAGE_KEY = "size";
const STATUS_STORAGE_KEY = "isEnabled";

// Play around for customizations
const UPDATE_DELAY = 1000;
const DEFAULT_ICON_SIZE = 26;
const ICON_UNIT = "rem";

const parse = Range.prototype.createContextualFragment.bind(
    document.createRange()
);

//#region Main loop
main();
setInterval(main, UPDATE_DELAY);
//#endregion

async function main() {
    // Status
    const isEnabledRes = await browser.storage.sync.get(STATUS_STORAGE_KEY);
    const isEnabled = isEnabledRes.isEnabled || TRUE;
    if (isEnabled === TRUE) {
        // Size
        const sizeRes = await browser.storage.sync.get(SIZE_STORAGE_KEY);
        const size = sizeRes.size || DEFAULT_ICON_SIZE;

        resetAllOutdatedFavicons(size);

        const linkElements = document.querySelectorAll(`body a.${URL_CLASS}`);
        linkElements.forEach(async (link) => {
            try {
                const websiteUrl = link.href;
                const websiteDomain = getDomainFromUrl(websiteUrl);
                const fullIconUrl = `${PREFIX_ICON_URL}${websiteDomain}${SUFFIX_ICON_URL}`;

                const dataUri = await toDataUri(fullIconUrl);

                const newLinkedFavicon = parseIntoHTML(
                    `<a class="${LINK_ICON_CLASS}" href="${websiteUrl}"><img height="${size}${ICON_UNIT}" width="${size}${ICON_UNIT}" src="${dataUri}" alt="${websiteDomain} icon"></a>`
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
    return document.querySelectorAll(`a.${LINK_ICON_CLASS}`);
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
    const tempElement = document.createElement("div");
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
