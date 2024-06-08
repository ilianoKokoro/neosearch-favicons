async function saveOptions(e) {
    e.preventDefault();

    let size = document.querySelector("#size").value;
    if (size <= 0) {
        size = 26;
    } else if (size > 500) {
        size = 26;
    }
    await browser.storage.sync.set({
        size: size,
    });
}

async function retrieveSettings() {
    res = await browser.storage.sync.get("size");
    const size = res.size || DEFAULT_ICON_SIZE;

    document.querySelector("#size").value = size || 26;
}
document.addEventListener("DOMContentLoaded", retrieveSettings);
document.querySelector("form").addEventListener("submit", saveOptions);
