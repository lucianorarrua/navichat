import sounds from "/public/shared/data/sounds.js";

const socket = io();
let voicesAvailable = [];

const configSocket = () => {
    // Cuando hay actualizaciones de las voces, actualiza el select
    socket.on('updateVoices', (data) => {
        try {
            voicesAvailable = data.filter(v => (v || '').includes('-')).map(v => v.split('-')[1].trim());
            refreshSelect(voicesAvailable)
        } catch (error) {
            console.warn('Error newMessage', data)
            console.error(error);
        }
    })
}

/**
 * Actualiza el select de voces con las voces enviadas en como parámetro
 */
const refreshSelect = (voicesName) => {
    const select = document.querySelector("#langs");
    select.innerHTML = "";
    for (let index = 0; index < voicesName.length; index++) {
        const element = voicesName[index];
        let option = document.createElement('option');
        option.value = element
        let optionText = document.createTextNode(element);
        option.appendChild(optionText);
        select.appendChild(option);
    }
}

/* Agrega los botones de sonido basandose en el objeto pasado como parámetro.
Se requiere que el objeto tenga los campos: "sound_url", "image_url", "emoji", todos de tipo string
*/
const addSoundButtons = (sounds) => {
    const buttonsWrapper = document.querySelector(".buttons-wrapper");
    for (let index = 0; index < Object.keys(sounds).length; index++) {
        const soundName = Object.keys(sounds)[index];
        const sound = sounds[soundName];
        let button = document.createElement('button');
        button.type = "button";
        button.className = "btn btn-outline-light square";
        button.addEventListener("click", function (e) { onclickSoundHandler(soundName, this, sound.time) })
        let img = document.createElement('img');
        img.src = sound.image_url
        img.alt = soundName
        button.appendChild(img);
        buttonsWrapper.appendChild(button);
    }
}

/**
 * Emite el mensaje por el socket
 */
const sendText = ({ text, transmitter, voiceName }) => {
    socket.emit('message', { text, transmitter, voiceName })
}

/**
 * Emite el sonido por el socket
 */
const sendSound = ({ soundName, transmitter }) => {
    socket.emit('sound', { soundName, transmitter })
}

/**
 * Función que controla el envío del mensaje
 */
const onSubmitFormHandler = (event) => {
    event.preventDefault();
    var lang = document.getElementById("langs");
    var message = document.getElementById("message");
    var transmitter = document.getElementById("transmitter");
    const obj = { text: message.value.trim(), voiceName: lang.value.trim(), transmitter: transmitter.value.trim() }
    sendText(obj)
    message.value = '';
}

const onclickSoundHandler = (soundName, buttonElement, disabledTime) => {
    buttonElement.disabled = true
    const transmitter = document.getElementById("transmitter").value.trim();
    sendSound({ soundName, transmitter })
    setTimeout(() => {
        buttonElement.disabled = false
    }, disabledTime);
}

/**
 * START SCRIPT
 */
// Inicia y configura el socket
configSocket();
var form = document.getElementById("message-form");
form.addEventListener("submit", onSubmitFormHandler, true);
// Agrega los botones de sonido a partir del objeto "sounds" importado
addSoundButtons(sounds);
