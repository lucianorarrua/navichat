import sounds from "/public/shared/data/sounds.js";

const socket = io();

const configSocket = () => {
    // No se pasa parámetro porque por defecto apunta a la dirección del servidor
    // Nuevos mensajes enviados a través del socket  
    socket.on('newMessage', (data) => {
        try {
            const { text, voiceName, transmitter } = data;
            addMessageToChat({ text, transmitter })
            playTTS({ text, voiceName });
        } catch (error) {
            console.warn('Error newMessage', data)
            console.error(error);
        }
    })
    // Nuevos sonidos enviados a través del socket 
    socket.on('newSound', (data) => {
        try {
            const { soundName, transmitter } = data;
            const sound = sounds[soundName]
            const text = `Envió un sonido ${sound.emoji || soundName}`
            addMessageToChat({ text, transmitter })
            playSound(soundName);
        } catch (error) {
            console.warn('Error newMessage', data)
            console.error(error);
        }
    })
    // Envía las voces disponibles al servidor. Si las voces cambian, las vuelve a enviar
    socket.emit('voices', getVoicesByLang('es').map(v => v.name))
    if ('onvoiceschanged' in speechSynthesis) {
        speechSynthesis.onvoiceschanged = function () {
            socket.emit('voices', getVoicesByLang('es').map(v => v.name))
        };
    }
}

/**
 * Emite el sonido seleccionado.
 */
const playSound = (soundName) => {
    const { sound_url } = sounds[soundName]
    var soundObject = new Audio(sound_url);
    soundObject.play();
}

/**
 * Agrega un item al frontend del Chat
 */
const addMessageToChat = ({ text, transmitter }) => {
    let p = document.createElement('p');
    let span = document.createElement('span');
    let pText = document.createTextNode(text);
    let spanText = document.createTextNode(`${transmitter || 'Anónimo'} : `);
    p.classList.add("chat-bubble");
    span.classList.add("transmitter-name");
    span.appendChild(spanText);
    p.appendChild(span);
    p.appendChild(pText)
    document.querySelector(".chat-wrapper").appendChild(p)
}

/**
 * Reproduce el texto con la voz seleccionada
 */
const playTTS = ({ text, voiceName }) => {
    if (!('speechSynthesis' in window)) {
        alert("Error con el sintetizador de voz");
        return;
    }
    const voices = getVoicesByLang('es');

    let voice = voices.find(v => v.name.includes(voiceName)) || voices[0];
    if (!voice) {
        alert("Error al cargar la voz");
        return;
    }
    const msj = new SpeechSynthesisUtterance(text);
    msj.voice = voice;
    speechSynthesis.speak(msj);
}

/**
 * Obtiene una lista de las voces disponibles en el navegador. Se usa para enviarlas al servidor y que este las emita a todos los dispositivos
 */
const getVoicesByLang = (lang) => {
    const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith(lang));
    return voices
}

/**
 * START SCRIPT
 */

// Inicia y configura el socket
configSocket();
//Esto oculta el mensaje de "hacer click para habilitar los sonidos"
document.querySelector("body").addEventListener("click", function () { document.querySelector("#sounds-note").classList.add("hidden") })
