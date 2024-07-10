const Discord = require("discord.js");
const fs = require("fs");
const db = require('croxydb')
const config = require("./config.json");

const Rest = require("@discordjs/rest");
const DiscordApi = require("discord-api-types/v10");
const { GatewayIntentBits, Partials } = require('discord.js')
const client = new Discord.Client({
	intents:  [
		"AutoModerationConfiguration",
		"AutoModerationExecution",
		"DirectMessageReactions",
		"DirectMessageTyping",
		"DirectMessages",
		"GuildBans",
		"GuildEmojisAndStickers",
		"GuildIntegrations",
		"GuildInvites",
		"GuildMembers",
		"GuildMessageReactions",
		"GuildMessageTyping",
		"GuildMessages",
		"GuildModeration",
		"GuildPresences",
		"GuildScheduledEvents",
		"GuildVoiceStates",
		"GuildWebhooks",
		"Guilds",
		"MessageContent"
	],
    partials: [
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message
	],
});
global.client = client;
client.commands = (global.commands = []);

//
console.log(`[-] ${fs.readdirSync("./commands").length} komut algılandı.`)

for(let commandName of fs.readdirSync("./commands")) {
	if(!commandName.endsWith(".js")) return;

	const command = require(`./commands/${commandName}`);	
	client.commands.push({
		name: command.name.toLowerCase(),
		description: command.description.toLowerCase(),
		options: command.options,
		dm_permission: false,
		type: 1
	});

	console.log(`[+] ${commandName} komutu başarıyla yüklendi.`)
}


console.log(`[-] ${fs.readdirSync("./events").length} olay algılandı.`)

for(let eventName of fs.readdirSync("./events")) {
	if(!eventName.endsWith(".js")) return;

	const event = require(`./events/${eventName}`);	
	const evenet_name = eventName.split(".")[0];

	client.on(event.name, (...args) => {
		event.run(client, ...args)
	});

	console.log(`[+] ${eventName} olayı başarıyla yüklendi.`)
}


//

client.once("ready", async() => {
	const rest = new Rest.REST({ version: "10" }).setToken(config.token);
  try {
    await rest.put(DiscordApi.Routes.applicationCommands(client.user.id), {
      body: client.commands,  //
    });
	console.log(`${client.user.tag} Aktif! 💕`);

  } catch (error) {
    throw error;
  }
});

client.login(config.token)
.catch((err) => {
	console.log(`[x] Discord API'ye istek gönderimi başarısız(token girmeyi unutmuşsun).` + err);
});    