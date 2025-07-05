import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { handleContainerCreate } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';
import { PORT } from './config/serverconfig.js';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors());

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(process.cwd());
});

const webSocketForTerminal = new WebSocketServer({ server });

webSocketForTerminal.on("connection", async (ws, req) => {
    const isTerminal = req.url.includes("/terminal");

    if (isTerminal) {
        const urlParams = new URLSearchParams(req.url.split("?")[1]);
        const projectId = urlParams.get("projectId");
        console.log("Project ID received for terminal:", projectId);
        const userId = urlParams.get("userId");
        console.log("User ID received for terminal:", userId);


        const container = await handleContainerCreate(projectId,userId);

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