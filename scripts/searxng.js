const PREFIX_ICON_URL = "https://icons.duckduckgo.com/ip3/";
const SUFFIX_ICON_URL = ".ico";

// Play around for customizations
const UPDATE_DELAY = 1000;
const DEFAULT_ICON_SIZE = 26;
const ICON_UNIT = "rem";

const parse = Range.prototype.createContextualFragment.bind(
    document.createRange()
);
// -----------------
addFavicons();
setInterval(addFavicons, UPDATE_DELAY);
// -----------------

async function addFavicons() {
    // Button
    const isEnabledRes = await browser.storage.sync.get("isEnabled");
    const isEnabled = isEnabledRes.isEnabled || "true";
    if (isEnabled === "true") {
        const sizeRes = await browser.storage.sync.get("size");
        const size = sizeRes.size || DEFAULT_ICON_SIZE;

        resetAllOutdatedFavicons(size);

        const linkElements = document.querySelectorAll("body a.url_wrapper");
        linkElements.forEach(async (link) => {
            try {
                const websiteUrl = link.href;
                const websiteDomain = getDomainFromUrl(websiteUrl);
                const fullIconUrl = `${PREFIX_ICON_URL}${websiteDomain}${SUFFIX_ICON_URL}`;

                const dataUri = await toDataUri(fullIconUrl);

                const newLinkedFavicon = parseIntoHTML(
                    `<a class="neosearch-favicon" href="${websiteUrl}"><img height="${size}${ICON_UNIT}" width="${size}${ICON_UNIT}" src="${dataUri}" alt="${websiteDomain} icon"></a>`
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

function getAllFavicons() {
    return document.querySelectorAll("a.neosearch-favicon");
}

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

function resetFavicons(favicons) {
    favicons.forEach((favicon) => {
        favicon.remove();
    });
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
// Use the function to get the data URI
toDataUri(
    "https://icons.duckduckgo.com/ip3/letstest.ru.ico",
    function (dataUri) {
        // Now you can use the data URI as the src of an image
        var img = document.createElement("img");
        img.src = dataUri;
        document.body.appendChild(img);
    }
);

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
