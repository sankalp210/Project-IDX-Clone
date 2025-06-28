import Docker from 'dockerode';
const docker = new Docker();

export const listContainer = async () => {
    const containers = await docker.listContainers();
    console.log("Containers", containers);
    containers.forEach((containerInfo) => {
        console.log(containerInfo.Ports);
    });
};

export const handleContainerCreate = async (projectId) => {
    console.log("Project id received for container create", projectId);

    try {
        // Try to find container by name
        const containers = await docker.listContainers({ all: true });
        const matching = containers.find(c => c.Names.includes(`/${projectId}`));

        if (matching) {
            console.log("Container already exists, trying to remove...");
            const container = docker.getContainer(matching.Id);
            try {
                await container.remove({ force: true });
                console.log("Old container removed");
            } catch (err) {
                if (err.statusCode === 409) {
                    console.log("Container removal in progress. Retrying in 2s...");
                    await new Promise(res => setTimeout(res, 2000));
                    return await handleContainerCreate(projectId); // retry once
                }
                console.error("Error during container removal", err);
                return null;
            }
        }

        const container = await docker.createContainer({
            Image: 'sandbox',
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Cmd: ['/bin/bash'],
            name: projectId,
            Tty: true,
            User: 'sandbox',
            Volumes: {
                "/home/sandbox/app": {}
            },
            ExposedPorts: {
                "5173/tcp": {}
            },
            Env: ["HOST=0.0.0.0"],
            HostConfig: {
                Binds: [
                    `${process.cwd()}/Projects/${projectId}:/home/sandbox/app`
                ],
                PortBindings: {
                    "5173/tcp": [{ HostPort: "0" }]
                }
            }
        });

        console.log("Container created:", container.id);
        await container.start();
        console.log("Container started");

        return container;

    } catch (error) {
        console.error("Error while creating container", error);
        return null;
    }
};

export async function getContainerPort(containerName) {
    const container = await docker.listContainers({ name: containerName });
    if (container.length > 0) {
        try {
            const info = await docker.getContainer(container[0].Id).inspect();
            return info?.NetworkSettings?.Ports["5173/tcp"]?.[0]?.HostPort;
        } catch (e) {
            console.log("Could not inspect container:", e);
            return undefined;
        }
    }
}
