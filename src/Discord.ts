import colors from "colors";
import { Client } from "discord.js";
colors.enable();


export default function BotClient(): Promise<Client> {
    const client = new Client();

    client
        .on("ready", async () => {
            if (client.user === null) { return; }

            await client.user.setActivity(`for ${client.guilds.cache.size} servers`, {
                type: "STREAMING",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            });

            console.log(` > OwlClient ready, logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`.magenta);
        })
        .on("disconnect", () => {
            console.warn("Disconnected!");
            process.exit();
        })

    client.login(process.env.BOT_TOKEN);

    return client;
}