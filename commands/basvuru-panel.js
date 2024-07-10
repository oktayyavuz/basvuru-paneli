const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
    name: "basvuru-panel",
    description: "Başvuru paneli sistemini ayarlarsın!",
    type: 1,
    options: [
        {
            name: "kanal",
            description: "Başvuru mesajının atılacağı kanalı ayarlarsın!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "mod-kanal",
            description: "Başvuruların onaylama ve reddetme işlemlerinin yapılacağı kanal!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "yetkili-rol",
            description: "Başvuru yetkilisinin bakacağı yetkili rol!",
            type: 8,
            required: true,
        },
        {
            name: "log",
            description: "Başvuru loglarının düşeceği kanal!",
            type: 7,
            required: true,
        },
        {
            name: "verilecek-rol",
            description: "Başvuru onaylandığında verilecek rol!",
            type: 8,
            required: true,
        }
    ],
    run: async (client, interaction) => {
        const { user, customId, guild } = interaction;
        const yetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");

        const basvuruKanal = interaction.options.getChannel('kanal');
        const modKanal = interaction.options.getChannel('mod-kanal');
        const logKanal = interaction.options.getChannel('log');
        const yetkiliRol = interaction.options.getRole('yetkili-rol');
        const verilecekRol = interaction.options.getRole('verilecek-rol');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetki], ephemeral: true });
        }

        const basarili = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ | __**Başvuru Paneli**__ başarıyla ayarlandı!\n\n✅ | Başvuru Kanalı: ${basvuruKanal}\n✅ | Mod Kanalı: ${modKanal}\n✅ | Log Kanalı: ${logKanal}\n✅ | Yetkili Rolü: ${yetkiliRol}\n✅ | Verilecek Rol: ${verilecekRol}`);

        db.set(`basvuruKanal_${interaction.guild.id}`, basvuruKanal.id);
        db.set(`modKanal_${interaction.guild.id}`, modKanal.id);
        db.set(`logKanal_${interaction.guild.id}`, logKanal.id);
        db.set(`yetkiliRol_${interaction.guild.id}`, yetkiliRol.id);
        db.set(`verilecekRol_${interaction.guild.id}`, verilecekRol.id);

        const info = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Başvuru Paneli")
            .setDescription("Başvuru yaparak sunucumuzda yetkili olma şansını yakalayabilirsiniz!")
            .addFields(
                { name: "Başvuru Kuralları", value: "1. Kurallar burada listelenecek.\n2. Kurallar burada listelenecek.\n3. Kurallar burada listelenecek." },
                { name: "Dikkat", value: "Başvuru yapmadan önce kuralları dikkatlice okuyunuz." }
            )
            .setImage('https://i.hizliresim.com/pqpqwu7.png');

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Başvuru Yap")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("basvuru"),
                new ButtonBuilder()
                    .setLabel("Başvuru Bilgi")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("basvuru_bilgi")
            );

        await basvuruKanal.send({ embeds: [info], components: [buttons] });
        return interaction.reply({ embeds: [basarili], ephemeral: true });
    }
};

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'basvuru') {
            const modal = new ModalBuilder()
                .setCustomId('basvuruFormu')
                .setTitle('Başvuru Formu');

            const isim = new TextInputBuilder()
                .setCustomId('isim')
                .setLabel('İsminiz')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const discordKullaniciAdi = new TextInputBuilder()
                .setCustomId('discordKullaniciAdi')
                .setLabel('Discord Kullanıcı Adınız')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const yas = new TextInputBuilder()
                .setCustomId('yas')
                .setLabel('Yaşınız')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const yetkiliRol = new TextInputBuilder()
                .setCustomId('yetkiliRol')
                .setLabel('Yetkili Olmak İstediğiniz Rol')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const aciklama = new TextInputBuilder()
                .setCustomId('aciklama')
                .setLabel('Bu yetki hakkında ne biliyorsun?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(isim),
                new ActionRowBuilder().addComponents(discordKullaniciAdi),
                new ActionRowBuilder().addComponents(yas),
                new ActionRowBuilder().addComponents(yetkiliRol),
                new ActionRowBuilder().addComponents(aciklama)
            );

            await interaction.showModal(modal);
        }else if (interaction.customId === 'basvuru_bilgi') {
            const bilgiEmbed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("Başvuru Bilgi")
                .setDescription("Başvuru yaparak sunucumuzda yetkili olma şansını yakalayabilirsiniz!")
                .addFields(
                    { name: "Başvuru Kuralları", value: "1. Kurallar burada listelenecek.\n2. Kurallar burada listelenecek.\n3. Kurallar burada listelenecek." },
                    { name: "Dikkat", value: "Başvuru yapmadan önce kuralları dikkatlice okuyunuz." }
                )
                .setImage('https://i.hizliresim.com/pqpqwu7.png');

            await interaction.reply({ embeds: [bilgiEmbed], ephemeral: true });
        }
    
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'basvuruFormu') {
            const isim = interaction.fields.getTextInputValue('isim');
            const discordKullaniciAdi = interaction.fields.getTextInputValue('discordKullaniciAdi');
            const yas = interaction.fields.getTextInputValue('yas');
            const yetkiliRol = interaction.fields.getTextInputValue('yetkiliRol');
            const aciklama = interaction.fields.getTextInputValue('aciklama');

            const basvuruEmbed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("Yeni Başvuru")
                .addFields(
                    { name: "İsim", value: isim },
                    { name: "Discord Kullanıcı Adı", value: discordKullaniciAdi },
                    { name: "Yaş", value: yas },
                    { name: "Yetkili Olmak İstediğiniz Rol", value: yetkiliRol },
                    { name: "Açıklama", value: aciklama }
                );

            const userId = interaction.user.id;
            db.set(`basvuru_${interaction.id}`, { userId, isim, discordKullaniciAdi, yas, yetkiliRol, aciklama });

            const onayRedButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Onayla")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`basvuru_onayla_${interaction.id}`),
                    new ButtonBuilder()
                        .setLabel("Reddet")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`basvuru_reddet_${interaction.id}`)
                );

            await interaction.guild.channels.cache.get(db.get(`modKanal_${interaction.guild.id}`)).send({ embeds: [basvuruEmbed], components: [onayRedButtons] });

            await interaction.reply({ content: "Başvurunuz alınmıştır.", ephemeral: true });
        }
    } 
    if (interaction.isButton() && (interaction.customId.startsWith('basvuru_onayla_') || interaction.customId.startsWith('basvuru_reddet_'))) {
        try {
            await interaction.deferUpdate();
    
            const basvuruId = interaction.customId.split('_')[2];
            const basvuruData = db.get(`basvuru_${basvuruId}`);
            if (!basvuruData) {
                return await interaction.editReply({ content: "Başvuru bilgileri bulunamadı.", components: [] });
            }
    
            const yetkiliRolId = db.get(`yetkiliRol_${interaction.guild.id}`);
            if (!interaction.member.roles.cache.has(yetkiliRolId)) {
                return await interaction.editReply({ content: "Bu işlemi gerçekleştirmek için yetkiniz yok.", components: [] });
            }
    
            const { userId, isim, discordKullaniciAdi } = basvuruData;
            const logKanalId = db.get(`logKanal_${interaction.guild.id}`);
            const logKanal = interaction.guild.channels.cache.get(logKanalId);
            const verilecekRolId = db.get(`verilecekRol_${interaction.guild.id}`);
    
            const user = await interaction.guild.members.fetch(userId).catch(() => null);
            if (!user) {
                return await interaction.editReply({ content: "Başvuru sahibi bulunamadı.", components: [] });
            }
    
            const botMember = interaction.guild.members.cache.get(client.user.id);
            const verilecekRol = interaction.guild.roles.cache.get(verilecekRolId);
    
            if (botMember.roles.highest.position <= verilecekRol.position) {
                return await interaction.editReply({ content: "Botun rolü, verilecek rolün altında. Lütfen botun rolünü yukarı taşıyın.", components: [] });
            }
    
            if (interaction.customId.startsWith('basvuru_onayla_')) {
                const onayEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Başvurunuz Onaylandı! 😎👌")
                    .setDescription("Tebrikler! Başvurunuz onaylanmıştır.")
                    .setThumbnail(interaction.guild.iconURL())
                    .setImage('https://i.hizliresim.com/efhohxs.gif');
    
                try {
                    await user.send({ embeds: [onayEmbed] });
                    await user.roles.add(verilecekRolId);
                } catch (error) {
                    console.error("DM gönderme veya rol verme hatası:", error);
                    await interaction.followUp(`${user}, başvurunuz onaylandı fakat size özel mesaj gönderilemedi veya rol verilemedi.`);
                }
    
                const logEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Başvuru Onaylandı")
                    .addFields(
                        { name: "Başvuran", value: `${isim} (${discordKullaniciAdi})` },
                        { name: "Onaylayan Yetkili", value: interaction.user.tag },
                        { name: "Onay Zamanı", value: new Date().toLocaleString() }
                    );
    
                if (logKanal) {
                    await logKanal.send({ embeds: [logEmbed] }).catch(console.error);
                }
    
                await interaction.editReply({ content: "Başvuru onaylandı.", components: [] });
            } else if (interaction.customId.startsWith('basvuru_reddet_')) {
                const redEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Başvurunuz Reddedildi.. 😢🥺")
                    .setDescription("Üzgünüz, başvurunuz reddedilmiştir.")
                    .setThumbnail(interaction.guild.iconURL())
                    .setImage('https://i.hizliresim.com/trgenb6.gif');
    
                try {
                    await user.send({ embeds: [redEmbed] });
                } catch (error) {
                    await interaction.followUp(`${user}, başvurunuz reddedildi fakat size özel mesaj gönderilemedi.`);
                }
    
                const logEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Başvuru Reddedildi")
                    .addFields(
                        { name: "Başvuran", value: `${isim} (${discordKullaniciAdi})` },
                        { name: "Reddeden Yetkili", value: interaction.user.tag },
                        { name: "Red Zamanı", value: new Date().toLocaleString() }
                    );
    
                if (logKanal) {
                    await logKanal.send({ embeds: [logEmbed] }).catch(console.error);
                }
    
                await interaction.editReply({ content: "Başvuru reddedildi.", components: [] });
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
            await interaction.followUp('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.').catch(console.error);
        }
    }
});
