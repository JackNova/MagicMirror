let config;
let map = new Map(); //Mappa contenente coppia nomemodulo-schema
let mapDefault = new Map(); //Mappa contenente coppia nomemodulo-configdefault
let availableModules = readAvailableModules();
let buttons = document.getElementsByClassName("add-buttons");

/**
 * Obtain MM config from modules.json file
 */
function readConfig() {
    fetch("/config/modules.json")
        .then(response => response.json())
        .then(data => (config = data))
        .then(printModules);
}

/**
 * Read default module configuration
 * @param {} moduleName
 */
function readModuleDefault(moduleName) {
    console.log("Reading default values for: " + moduleName);
    return fetch(`/modules/default/${moduleName}/defaultConfig.json`);
}

/**
 * Read module schema
 * @param {*} moduleName
 */
function readModuleSchema(moduleName) {
    console.log("Reading JSON Schema for: " + moduleName);
    return fetch(`/modules/default/${moduleName}/schema.json`);
}

/**
 * Read available modules
 * @param {*}
 */
function readAvailableModules() {
    let promise = fetch(`/config/availableModules.json`)
        .then(response => response.json())
        .then(data => (availableModules = data));
}

/**
 * Create dom from each modules
 */
function printModules() {
    if (!config) return;

    document.querySelectorAll("[data-slot]").forEach(element => {
        const modtoadd = getSlotModules(element.dataset.slot);

        element.querySelectorAll("span").forEach(spantodelete => {
            spantodelete.remove();
        });

        modtoadd.forEach(mod => {
            const span = document.createElement("span");
            span.setAttribute("class", "span");
            span.dataset.module = mod.module;
            span.dataset.position = element.dataset.slot;

            const buttonDelete = document.createElement("button");
            buttonDelete.setAttribute("type", "button");
            buttonDelete.setAttribute("name", "delete");
            buttonDelete.textContent = "🗑️";

            const buttonSettings = document.createElement("button");
            buttonSettings.setAttribute("type", "button");
            buttonSettings.setAttribute("name", "settings");
            buttonSettings.textContent = "🛠️";

            span.textContent = mod.module;
            span.appendChild(buttonDelete);
            span.appendChild(buttonSettings);

            element.appendChild(span);
        });
    });
}

/**
 * Called when the "Delete Button" is pressed
 * @param {module name} name
 * @param {module position} position
 */
function deleteModuleFromSlot(name, position) {
    config.modules = config.modules.filter(
        mod => mod.module !== name || mod.position !== position
    );
    printModules();
    console.log(config);
}

/**
 * boolean -> checkbox
 * string -> text
 * number/integer -> number
 */
function createComponent(componentName, componentType, dialog, moduleName) {
    const form = dialog.querySelector("[name = 'settings']");
    const header = dialog.querySelector("[name = 'header']");

    header.textContent = "Module Settings for: " + moduleName;
    console.log(
        "Create input component for attribute: " +
            componentName +
            ", type: " +
            componentType
    );

    let inputDiv;
    switch (componentType) {
        case "string":
            inputDiv = document.createElement("div");
            inputDiv.setAttribute("class", "divText");
            inputDiv.insertAdjacentHTML(
                "beforeend",
                `<label class="labeltext" for="input-${componentName}">
                    <span>${componentName}</span>
                    <input class="textinput" id="input-${componentName}" name="input-${componentName}" type="text"/>
                </label>`
            );
            form.appendChild(inputDiv);
            break;

        case "boolean":
            inputDiv = document.createElement("div");
            inputDiv.setAttribute("class", "divCheckBox");
            inputDiv.insertAdjacentHTML(
                "beforeend",
                `<label class="labelcheckbox" for="input-${componentName}">
                    <span>${componentName}</span>
                    <input class="checkboxinput" id="input-${componentName}" name="input-${componentName}" type="checkbox"/>
                </label>`
            );
            form.appendChild(inputDiv);
            break;

        case "number":
        case "integer":
            inputDiv = document.createElement("div");
            inputDiv.setAttribute("class", "divNumbers");
            inputDiv.insertAdjacentHTML(
                "beforeend",
                `<label class="labelnumber" for="input-${componentName}">
                    <span>${componentName}</span>
                    <input class="numberinput" id="input-${componentName}" name="input-${componentName}" type="number"/>
                </label>`
            );
            form.appendChild(inputDiv);
            break;
    }
}

/**
 * Set values from default configuration loaded with readModuleDefault inside
 * input areas.
 */
function setDefaultValues(moduleName, dialog) {
    let promise;
    let defaults;

    const form = dialog.querySelector("[name = 'settings']");
    const textinput = document.getElementsByClassName("textinput");
    const labeltext = document.getElementsByClassName("labeltext");
    const checkboxinput = document.getElementsByClassName("checkboxinput");
    const labelcheckbox = document.getElementsByClassName("labelcheckbox");
    const numberinput = document.getElementsByClassName("numberinput");
    const labelnumber = document.getElementsByClassName("labelnumber");

    let i;

    if (!mapDefault.get(moduleName)) {
        promise = readModuleDefault(moduleName);
        promise
            .then(response => response.json())
            .then(data => mapDefault.set(moduleName, data))
            .then(function() {
                defaults = mapDefault.get(moduleName);
                console.log(defaults);
                Object.keys(defaults).forEach(element => {
                    console.log(element + ": " + defaults[element]);

                    if (textinput) {
                        for (i = 0; i < textinput.length; i++) {
                            if (
                                labeltext.item(i).textContent.trim() === element
                            )
                                textinput.item(i).value = defaults[element];
                        }
                    }
                    if (checkboxinput) {
                        for (i = 0; i < checkboxinput.length; i++) {
                            if (
                                labelcheckbox.item(i).textContent.trim() ===
                                element
                            ) {
                                if (
                                    !defaults[element]
                                        .toString()
                                        .localeCompare("true")
                                ) {
                                    checkboxinput.item(i).checked = true;
                                } else {
                                    checkboxinput.item(i).checked = false;
                                }
                            }
                        }
                    }
                    if (numberinput) {
                        for (i = 0; i < numberinput.length; i++) {
                            if (
                                labelnumber.item(i).textContent.trim() ===
                                element
                            )
                                numberinput.item(i).value = defaults[element];
                        }
                    }
                });
            });
    } else {
        defaults = mapDefault.get(moduleName);
        console.log(defaults);
        Object.keys(defaults).forEach(element => {
            console.log(element + ": " + defaults[element]);

            if (textinput) {
                for (i = 0; i < textinput.length; i++) {
                    if (labeltext.item(i).textContent.trim() === element)
                        textinput.item(i).value = defaults[element];
                }
            }
            if (checkboxinput) {
                for (i = 0; i < checkboxinput.length; i++) {
                    if (labelcheckbox.item(i).textContent.trim() === element) {
                        if (
                            !defaults[element].toString().localeCompare("true")
                        ) {
                            checkboxinput.item(i).checked = true;
                        } else {
                            checkboxinput.item(i).checked = false;
                        }
                    }
                }
            }
            if (numberinput) {
                for (i = 0; i < numberinput.length; i++) {
                    if (labelnumber.item(i).textContent.trim() === element)
                        numberinput.item(i).value = defaults[element];
                }
            }
        });
    }
}

/**
 * Display the form that allows user to modify module's settings
 * @param {} moduleName
 */
function showSettingsForm(moduleName) {
    let promise;
    let promiseDefault;
    const dialog = document.getElementById("SettingsForm");
    dialog.hidden = false;

    if (!map.get(moduleName)) {
        promise = readModuleSchema(moduleName);

        promise
            .then(response => response.json())
            .then(data => map.set(moduleName, data))
            .then(function() {
                const moduleSchema = map.get(moduleName);
                Object.keys(moduleSchema).forEach(element => {
                    if (moduleSchema[element].type) {
                        createComponent(
                            element,
                            moduleSchema[element].type,
                            dialog,
                            moduleName
                        );
                    }
                });
                setDefaultValues(moduleName, dialog);
            });
    } else {
        const moduleSchema = map.get(moduleName);
        Object.keys(moduleSchema).forEach(element => {
            if (moduleSchema[element].type) {
                createComponent(element, moduleSchema[element].type, dialog);
            }
        });
        setDefaultValues(moduleName, dialog);
    }
}

/**
 * Allows to access modules' list for given position
 * @param {slot position} position
 */
function getSlotModules(position) {
    return config.modules.filter(mod => mod.position === position);
}

/**
 * Event listener for click on delete and settings buttons
 */
document.addEventListener("click", event => {
    const button = event.target.closest("span button");
    if (button) {
        const span = button.closest("span");
        const spanPosition = span.closest("[data-slot]").dataset.slot;

        switch (button.name) {
            case "delete":
                console.log("Deleting module: " + span.dataset.module);
                deleteModuleFromSlot(span.dataset.module, spanPosition);
                break;
            case "settings":
                console.log(
                    "Required settings function for module: " +
                        span.dataset.module
                );
                showSettingsForm(span.dataset.module);
                break;
        }
        return;
    }
});

/**
 * Event listener for click on "Annulla" button of settings form
 */
document
    .getElementById("form_button_annulla")
    .addEventListener("click", event => {
        console.log("Closing settings form");
        const form = document.getElementById("form");
        const window = document.getElementById("SettingsForm");
        window.hidden = true;
        while (form.firstChild) {
            form.removeChild(form.firstChild);
        }
    });

/**
 * Event listener for click on "Conferma" button on settings form
 */
document
    .getElementById("form_button_conferma")
    .addEventListener("click", event => {
        console.log("Updating module config");

        const formWindow = document.getElementById("SettingsForm");
        const form = document.getElementById("form");
        const modConfig = config.modules;
        const moduloAttivo = formWindow
            .querySelector("[name = 'header']")
            .textContent.replace("Module Settings for: ", "");

        const textinput = document.getElementsByClassName("textinput");
        const labeltext = document.getElementsByClassName("labeltext");
        const checkboxinput = document.getElementsByClassName("checkboxinput");
        const labelcheckbox = document.getElementsByClassName("labelcheckbox");
        const numberinput = document.getElementsByClassName("numberinput");
        const labelnumber = document.getElementsByClassName("labelnumber");

        let i;
        let objectConfig = {};

        console.log("Saving the following configuration for " + moduloAttivo);

        if (textinput) {
            let labelTextContent;
            for (i = 0; i < textinput.length; i++) {
                labelTextContent = labeltext.item(i).textContent.trim();
                modConfig.forEach(modulo => {
                    if (
                        !modulo.module.localeCompare(moduloAttivo) &&
                        textinput.item(i).value
                    ) {
                        modulo[`${labelTextContent}`] = textinput.item(i).value;
                    }
                });
                console.log(
                    labeltext.item(i).textContent.trim() +
                        ": " +
                        textinput.item(i).value
                );
            }
        }
        if (checkboxinput) {
            let labelCheckboxContent;
            for (i = 0; i < checkboxinput.length; i++) {
                labelCheckboxContent = labelcheckbox.item(i).textContent.trim();
                modConfig.forEach(modulo => {
                    if (!modulo.module.localeCompare(moduloAttivo)) {
                        modulo[
                            `${labelcheckbox.item(i).textContent.trim()}`
                        ] = checkboxinput.item(i).checked;
                    }
                });
                console.log(
                    labelcheckbox.item(i).textContent.trim() +
                        ": " +
                        checkboxinput.item(i).checked
                );
            }
        }
        if (numberinput) {
            let labelNumberContent;
            for (i = 0; i < numberinput.length; i++) {
                labelNumberContent = labelnumber.item(i).textContent.trim();
                modConfig.forEach(modulo => {
                    if (
                        !modulo.module.localeCompare(moduloAttivo) &&
                        textinput.item(i).value
                    ) {
                        modulo[`${labelNumberContent}`] = numberinput.item(
                            i
                        ).value;
                    }
                });
                console.log(
                    labelnumber.item(i).textContent.trim() +
                        ": " +
                        numberinput.item(i).value
                );
            }
        }
        let findConfigKey = 0;
        modConfig.forEach(modulo => {
            // Per ogni modulo
            objectConfig = {}; // Re-inizializzo objectConfig
            Object.keys(modulo).forEach((key, index) => {
                // Per ogni key del modulo
                if (
                    //Se la key
                    key.localeCompare("position") !== 0 && // non è "position"
                    key.localeCompare("module") !== 0 && // non è "module"
                    key.localeCompare("header") !== 0 && // non è header
                    key.localeCompare("config") !== 0 // e non è già presente la key config
                ) {
                    console.log("Moving " + key + " to config object"); // avviso
                    objectConfig[`${key}`] = modulo[key]; // assegna a objectConfig la key "key" e associale il valore modulo[key]
                    delete modulo[key]; // poi cancella la key dal modulo
                    findConfigKey = 1;
                }
            });
            if (findConfigKey) {
                // Se ho variato il valore di objectConfig
                modulo["config"] = objectConfig; // assegna a modulo la key config e al suo interno poni il valore di objectConfig
            }
            findConfigKey = 0; // Setto nuovamente findConfigKey a 0
        });
        formWindow.hidden = true;
        while (form.firstChild) {
            form.removeChild(form.firstChild);
        }
        console.log(config);
    });

document.getElementById("saveconfig").addEventListener("click", event => {
    console.log("Generate new config file");
    generateNewConfigFile();
});

/**
 * Create new config file for MM
 */
function generateNewConfigFile() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/modulesconfig", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(config));
}

// document.getElementById("add-top-bar").addEventListener("click", event => {
//     const addWindow = document.getElementById("AddWindow");
//     const button = document.getElementById("add-top-bar");
    
//     const span = button.closest("div");
//     const spanPosition = span.closest("[data-slot]").dataset.slot;
//     addWindow.dataset.position = spanPosition;
//     addWindow.hidden = false;
//     let i = 0;
//     let v = 0;
//     let select = document.getElementById("addSelect");

//     while (select.firstChild) {
//         select.removeChild(select.firstChild);
//     }

//     Object.keys(availableModules).forEach(element => {
//         i++;
//     });

//     for (v = 0; v < i; v++) {
//         var opt = document.createElement("option");
//         opt.value = availableModules[v];
//         opt.innerHTML = availableModules[v];
//         select.appendChild(opt);
//     }
// });

for(var i=0; i < buttons.length; i++){
    buttons.item(i).addEventListener("click", event => {
        const addWindow = document.getElementById("AddWindow");
        const button = document.getElementById(event.target.id);
       
        
        const span = button.closest("div");
        const spanPosition = span.closest("[data-slot]").dataset.slot;
        addWindow.dataset.position = spanPosition;
        addWindow.hidden = false;
        let i = 0;
        let v = 0;
        let select = document.getElementById("addSelect");
    
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    
        Object.keys(availableModules).forEach(element => {
            i++;
        });
    
        for (v = 0; v < i; v++) {
            var opt = document.createElement("option");
            opt.value = availableModules[v];
            opt.innerHTML = availableModules[v];
            select.appendChild(opt);
        }
    });
}

document
    .getElementById("add_button_annulla")
    .addEventListener("click", event => {
        const form = document.getElementById("AddWindow");
        form.removeAttribute("dataset.position");
        form.hidden = true;
    });

document
    .getElementById("add_button_conferma")
    .addEventListener("click", event => {
        const form = document.getElementById("AddWindow");
        const select = document.getElementById("addSelect");
        let item = {};
        item["module"] = select.value;
        item["position"] = form.dataset.position;
        config.modules[config.modules.length] = item;
        
        printModules();
        form.hidden = true;
    });

readConfig();
