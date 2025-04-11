import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import apiRouter from './routes/index.js';
import { PORT } from './config/serverconfig.js';
import chokidar from 'chokidar';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';
import { WebSocketServer } from 'ws';
import { handleContainerCreate } from './containers/handleContainerCreate.js'
import { handleTerminalCreation } from './containers/handleTerminalCreation.js'


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        method: ['GET', 'POST'],
    }
});


app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use('/api', apiRouter);

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' });
});

const editorNamespace = io.of('/editor');

editorNamespace.on("connection", (socket) => {
    console.log("editor connected");

    // somehow we will get the projectId from frontend;
    let projectId = socket.handshake.query['projectId'];

    console.log("Project id received after connection", projectId);

    if(projectId) {
        var watcher = chokidar.watch(`./projects/${projectId}`, {
            ignored: (path) => path.includes("node_modules"),
            persistent: true, /** keeps the watcher in running state till the time app is running */
            awaitWriteFinish: {
                stabilityThreshold: 2000 /** Ensures stability of files before triggering event */
            },
            ignoreInitial: true /** Ignores the initial files in the directory */
        });

        watcher.on("all", (event, path) => {
            console.log(event, path);
        });
    }

    handleEditorSocketEvents(socket, editorNamespace);

});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(process.cwd())
});


const webSocketForTerminal = new WebSocketServer({
    noServer : true
})

server.on("upgrade", (req, tcp, head) => {
    const isTerminal = req.url.includes('/terminal');

    if (isTerminal) {
        console.log("req url received", req.url);
        const projectId = req.url.split('=')[1];
        console.log("Project id received after connection", projectId);

        handleContainerCreate(projectId, webSocketForTerminal, req, tcp, head);
    }
});

webSocketForTerminal.on("connection", (ws, req, container) => {
    console.log("Terminal connected", ws, req, container);

    handleTerminalCreation(container, ws);

    ws.on("getPort", () => {
        console.log("get port event recieved");
    })

    ws.on("close", () => {
        container.remove({ force: true }, (err, data) => {
            if (err) {
                console.log("Error while removing container", err);
                return;
            }
            console.log("Container removed", data);
        });
    });
});