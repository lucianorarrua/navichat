/* DEPENDENCIES */
import http from "http";
import express from "express";
import { Server } from "socket.io";
import path from "path";// default package to make path of directory 
import { fileURLToPath } from 'url'; // Necesario para obtener el __dirname
import { dirname } from 'path'; // Necesario para obtener el __dirname

/* CONFIG */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const server = http.createServer(app);
const publicDirPath = path.join(__dirname)
const io = new Server(server);

/**
 * Lista de voces disponibles. Se reciben desde el cliente de chat y se emiten a los clientes transmisores
 * transmisores = App para enviar textos
 * chat = App que muestra y reproduce textos
 */
let voices = [];
/**
 * Lista de mensajes a enviar
 */
let messajesQueue = [];

/* MIDDLEWARES */
app.use(express.static(publicDirPath, { extensions: ['html', 'js', 'css'] }))

/* ENDPOINTS */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/send/index.html')
})

app.get('/send', (req, res) => {
    res.sendFile(__dirname + '/public/pages/send/index.html')
})

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/pages/chat/index.html')
})

/* SOCKET */

io.on('connection', (socket) => {
    console.log('connected')
    // Arranca el server y emite las voces disponibles
    io.emit('updateVoices', voices);

    /* VOCES DISPONIBLES ENVIADAS DESDE EL CHAT */
    socket.on('voices', (newVoices) => {
        voices = newVoices;
        // Si se reciben nuevas voces, las emite a los transmisores
        io.emit('updateVoices', voices)
    })

    /* MENSAJES RECIBIDOS DESDE TRANSMISORES*/
    socket.on('message', (newMessage) => {
        // { text, voiceName, transmitter }
        //Si se recibe un nuevo mensaje, lo guarda agrega a la cola
        messajesQueue.push(newMessage);
    })

    /* SONIDOS RECIBIDOS DESDE TRANSMISORES*/
    socket.on('sound', (newSound) => {
        // { soundName, transmitter }
        //Si se recibe un nuevo sonido, lo transmite por el socket
        io.emit('newSound', newSound)
    })

    socket.on('disconnect', () => {
        console.log('server disconnected')
    })
})

server.listen(3000, () => {
    console.log('Server is up and running on PORT 3000.')
})

// Esto se hace así para que exista un espacio entre cada mensaje. Entonces se va armando una cola de mensajes y se van tomando de a uno.
setInterval(() => {
    const item = messajesQueue.reverse().pop();
    if (item) {
        io.emit('newMessage', item)
    }
}, 10000);