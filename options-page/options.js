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
document.querySelector("form").addEventListener("submit", saveOptions);
