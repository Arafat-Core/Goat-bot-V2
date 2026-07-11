const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    version: "22.0",
    author: "Arafat",
    role: 0,
    description: { en: "🎵 Premium Music Downloader" },
    category: "audio"
  },

  onStart: async ({ api, args, event, commandName }) => {

    if (!args.length)
      return api.sendMessage("🎵 Please type a song name.", event.threadID, event.messageID);

    const isList = args[0] === "-l";
    const keyword = isList ? args.slice(1).join(" ") : args.join(" ");

    if (!keyword)
      return api.sendMessage("🎵 Please type a song name.", event.threadID, event.messageID);

    try {
      let results = [];
      try {
        const searchResult = await ytSearch(keyword);
        results = searchResult.videos.slice(0, 6);
      } catch (err) {
        console.log("YT-SEARCH ERROR:", err.message);
      }

      if (!results.length)
        return api.sendMessage("❌ No songs found.", event.threadID, event.messageID);

      if (isList) {
        let text = "╭───────────────❍\n";
        text += "│   🎵 𝑺𝒐𝒏𝒈 𝑳𝒊𝒔𝒕\n";
        text += "╰───────────────❍\n\n";

        for (let i = 0; i < results.length; i++) {
          const v = results[i];
          text += `╭─❍\n`;
          text += `┊  ${i + 1}. ${v.title}\n`;
          text += `┊  ⏳ ${v.timestamp || "Unknown"}\n`;
          text += `┊  📺 ${v.author.name}\n`;
          text += `╰───────────────❍\n\n`;
        }

        text += "╭───────────────❍\n";
        text += "│   🔢 Reply with number (1–6)\n";
        text += "╰───────────────❍";

        return api.sendMessage(
          { body: text },
          event.threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              results
            });
          },
          event.messageID
        );
      }

      const video = results[0];
      const apiBase = String(global.GoatBot.config.Arafat?.api || "").trim();

      if (!apiBase)
        return api.sendMessage("❌ Error: API Base URL is empty!", event.threadID, event.messageID);

      const finalURL = `${apiBase}/download/arafatadl?url=${encodeURIComponent(video.url)}`;

      api.setMessageReaction("🌷", event.messageID, () => {}, true);

      const res = await axios({
        url: finalURL,
        method: "GET",
        responseType: "stream",
        timeout: 0
      });

      if (res.status !== 200)
        return api.sendMessage("❌ Download failed.", event.threadID, event.messageID);

      await api.sendMessage(
        {
          body:
`╭───────────────❍
│ 🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑺𝒖𝒄𝒄𝒆𝒔𝒔
├───────────────❍
│ 🎵 ${video.title}
╰───────────────❍`,
          attachment: res.data
        },
        event.threadID,
        () => api.setMessageReaction("🎀", event.messageID, () => {}, true),
        event.messageID
      );

    } catch (err) {
      console.log("SING ERROR:", err.message);
      api.sendMessage(`❌ Failed to fetch audio. Reason: ${err.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply }) => {
    try {
      const { results, author } = Reply;
      if (event.senderID !== author) return;

      const choice = parseInt(event.body);
      if (isNaN(choice) || choice < 1 || choice > results.length)
        return api.sendMessage("❌ Enter valid number (1–6).", event.threadID, event.messageID);

      const video = results[choice - 1];
      const apiBase = String(global.GoatBot.config.Arafat?.api || "").trim();

      if (!apiBase)
        return api.sendMessage("❌ Error: API Base URL is empty!", event.threadID, event.messageID);

      const finalURL = `${apiBase}/download/arafatadl?url=${encodeURIComponent(video.url)}`;

      api.setMessageReaction("🌷", event.messageID, () => {}, true);

      const res = await axios({
        url: finalURL,
        method: "GET",
        responseType: "stream",
        timeout: 0
      });

      if (res.status !== 200)
        return api.sendMessage("❌ Download failed.", event.threadID, event.messageID);

      await api.unsendMessage(Reply.messageID);

      await api.sendMessage(
        {
          body:
`╭───────────────❍
│ 🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑺𝒖𝒄𝒄𝒆𝒔𝒔
├───────────────❍
│ 🎵 ${video.title}
╰───────────────❍`,
          attachment: res.data
        },
        event.threadID,
        () => api.setMessageReaction("🎀", event.messageID, () => {}, true),
        event.messageID
      );

    } catch (err) {
      console.log("REPLY ERROR:", err.message);
      api.sendMessage(`❌ Download failed. Reason: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
