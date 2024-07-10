const db = require("croxydb");
const { PermissionFlagsBits, EmbedBuilder, Events, PermissionsBitField  } = require("discord.js");
const Discord = require("discord.js")
const config = require('../config.json');
module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) return;

            const xp = db.fetch(`xpPos_${message.author.id}${message.guild.id}`);
            const levellog = db.fetch(`level_log_${message.guild.id}`);
            const level = db.fetch(`levelPos_${message.author.id}${message.guild.id}`);

            const acikmi = db.fetch(`acikmiLevel_${message.guild.id}`) ? true : false;
            if (acikmi) {
                if (xp >= config.levelXp) {
                    db.subtract(`xpPos_${message.author.id}${message.guild.id}`, xp);
                    db.add(`levelPos_${message.author.id}${message.guild.id}`, 1);

                    client.channels.cache.get(levellog).send(`${message.author} GG!, artık yeni seviyene ulaştın, tebrikler! Yeni seviyen: **${level + 1}**`);
                } else {
                    db.add(`xpPos_${message.author.id}${message.guild.id}`, config.mesajXp);
                }
            }
        } catch (err) {
            console.error('An error occurred:', err);
        }
    }
};
