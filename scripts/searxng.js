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
    res = await browser.storage.sync.get("size");
    const size = res.size || DEFAULT_ICON_SIZE;

    resetAllOutdatedFavicons(size);

    const linkElements = document.querySelectorAll("body a.url_wrapper");
    linkElements.forEach((link) => {
        const websiteUrl = link.href;
        const websiteDomain = getDomainFromUrl(websiteUrl);
        const fullIconUrl = `${PREFIX_ICON_URL}${websiteDomain}${SUFFIX_ICON_URL}`;
        const newLinkedFavicon = parseIntoHTML(
            `<a class="neosearch-favicon" href="${websiteUrl}"><img height="${size}${ICON_UNIT}" width="${size}${ICON_UNIT}" src="${fullIconUrl}" alt="${websiteDomain} icon"></a>`
        );

        if (!link.parentNode.innerHTML.includes(newLinkedFavicon.innerHTML)) {
            link.parentNode.insertBefore(newLinkedFavicon, link);
        }
    });
}

function resetAllOutdatedFavicons(currentSize) {
    const favicons = document.querySelectorAll("a.neosearch-favicon");
    favicons.forEach((favicon) => {
        const imageElement = favicon.firstChild;
        if (
            imageElement.height != currentSize ||
            imageElement.width != currentSize
        ) {
            favicon.remove();
        }
    });
}

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
