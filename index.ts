import "dotenv/config";
import { IMessageSDK } from "@photon-ai/imessage-kit";
import { handleMessage } from "./agent";

const sdk = new IMessageSDK({
    watcher: {
        pollInterval: 3000,
        unreadOnly: true,
    },
})

async function main(): Promise<void> {
    console.log("Future You Running!");

    await sdk.startWatching({

        onDirectMessage: async (msg) => {
            if (msg.isFromMe) return;

            console.log("Got msg!");
            const reply = await handleMessage(msg.text ?? "");
            await sdk.send(msg.sender, reply)
            console.log("Sent!");
        },

        onError: (err) => console.error("Error:", err),
    })
}

main()

process.on("SIGINT", async () => {
    await sdk.close();
    process.exit(0);
})