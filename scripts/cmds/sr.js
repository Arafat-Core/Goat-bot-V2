const axios = require('axios');

module.exports = {
    config: {
        name: "sr",
        version: "1.0",
        author: "Arafat sarder",
        countDown: 5,
        role: 0,
        shortDescription: "Pinterest reverse image search",
        longDescription: "This command utilizes a specialized API to perform a precise reverse image search on Pinterest. Users can execute this command by either replying directly to an existing image attachment in the chat or by providing a valid direct image URL as a command argument. The bot securely processes the input, retrieves visually similar pins from the database, and intelligently limits the output size to prevent messaging spam. It then returns the top matching images natively rendered in chat alongside clipped titles and direct Pinterest links.",
        category: "utility",
        guide: "{pn} <image_url> OR reply to image"
    },

    onStart: async function ({ event, message, args }) {
        let imageUrl = "";

        if (event.type === "message_reply" && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
            imageUrl = event.messageReply.attachments[0].url;
        } else if (args.length > 0) {
            imageUrl = args.join(" ");
        } else {
            return message.reply("⚠️ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴜʀʟ");
        }

        try {
            const response = await axios.get(`https://arafatas.vercel.app/imgsearch/pin?url=${encodeURIComponent(imageUrl)}`);

            if (!response.data || !response.data.data || response.data.data.length === 0) {
                return message.reply("❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ ꜰᴏᴜɴᴅ");
            }

            const results = response.data.data;
            const limit = Math.min(results.length, 6); 
            
            let msgBody = `✅ ᴛᴏᴛᴀʟ ꜰᴏᴜɴᴅ: ${response.data.total_results}\n🔝 ᴛᴏᴘ ${limit} ᴍᴀᴛᴄʜᴇꜱ:\n\n`;
            let attachments = [];

            for (let i = 0; i < limit; i++) {
                const item = results[i];
                let title = item.title ? item.title : "ᴘɪɴᴛᴇʀᴇꜱᴛ ᴍᴀᴛᴄʜ";
                title = title.length > 25 ? title.substring(0, 25) + "..." : title;
                
                msgBody += `[${i + 1}] ${title}\n🔗 ʟɪɴᴋ: ${item.link}\n\n`;
                
                try {
                    const stream = await global.utils.getStreamFromURL(item.img);
                    attachments.push(stream);
                } catch (err) {}
            }

            return message.reply({
                body: msgBody.trim(),
                attachment: attachments
            });

        } catch (error) {
            return message.reply("❌ ᴀᴘɪ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ");
        }
    }
};
