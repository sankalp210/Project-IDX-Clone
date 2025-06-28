import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { handleContainerCreate } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

server.listen(4000, () => {
    console.log(`Server is running on port 4000`);
    console.log(process.cwd());
});

const webSocketForTerminal = new WebSocketServer({ server });

webSocketForTerminal.on("connection", async (ws, req) => {
    const isTerminal = req.url.includes("/terminal");

    if (isTerminal) {
        const projectId = req.url.split("=")[1];
        console.log("Project id received after connection:", projectId);

        const container = await handleContainerCreate(projectId);

        if (!container) {
            console.error("Container creation failed. Aborting terminal init.");
            ws.close(1011, "Container init error");
            return;
        }

        handleTerminalCreation(container, ws);

        ws.on("close", () => {
            container.remove({ force: true }, (err, data) => {
                if (err) {
                    console.log("Error while removing container", err);
                } else {
                    console.log("Container removed successfully");
                }
            });
        });
    }
});
