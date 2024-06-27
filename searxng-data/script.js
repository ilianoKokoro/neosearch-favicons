const URL = "https://searx.space/data/instances.json";
addEventListener("DOMContentLoaded", (event) => {
    main();
});

async function main() {
    const response = await fetch(URL);
    const json = await response.json();
    const instances = json.instances;
    clear();
    Object.keys(instances).forEach((url) => {
        const formatedUrl = `"${url
            .replace("https", "*")
            .replace("http", "*")}search*",\n`;
        if (!formatedUrl.includes(".onion/search*")) {
            print(formatedUrl);
        }
    });
}

function clear() {
    const container = document.getElementById("container");
    if (container == undefined) {
        return;
    }
    container.innerText = "";
}

function print(string) {
    const container = document.getElementById("container");
    if (container == undefined) {
        return;
    }
    container.innerText = `${container.innerText}${string}`;
}
