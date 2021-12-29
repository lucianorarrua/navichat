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

/**
 * Emite el mensaje por el socket
 */
const sendText = ({ text, transmitter, voiceName }) => {
    socket.emit('message', { text, transmitter, voiceName })
}

/**
 * Función que controla el envío del mensaje
 */
const onSubmitForm = (event) => {
    event.preventDefault();
    var lang = document.getElementById("langs");
    var message = document.getElementById("message");
    var transmitter = document.getElementById("transmitter");
    const obj = { text: message.value.trim(), voiceName: lang.value.trim(), transmitter: transmitter.value.trim() }
    sendText(obj)
    message.value = '';
}

/**
 * START SCRIPT
 */
// Inicia y configura el socket
configSocket();
var form = document.getElementById("message-form");
form.addEventListener("submit", onSubmitForm, true);
