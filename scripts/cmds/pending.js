const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pe"],
    version: "1.6.9",
    author: "♡ Nazrul ♡",
    countDown: 5,
    role: 1,
    shortDescription: "handle pending requests",
    longDescription: "Approve orreject pending users or group requests",
    category: "utility",
  },

  onReply: async function ({ message, api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;

    if (body.trim().toLowerCase() === "c") {
      try {
        await api.unsendMessage(messageID);
        return api.sendMessage(
          ` Operation has been canceled!`,
          threadID
        );
      } catch {
        return;
      }
    }

    const indexes = body.split(/\s+/).map(Number);

    if (isNaN(indexes[0])) {
      return api.sendMessage(`⚠ Invalid input! Please try again.`, threadID);
    }

    let count = 0;

    for (const idx of indexes) {
 
      if (idx <= 0 || idx > pending.length) continue;

      const group = pending[idx - 1];

      try {
        await api.sendMessage(
          `✅ Group has been Successfully Approved\n\n📜 Type ${global.GoatBot.config.prefix}help to See Cmds!`,
          group.threadID
        );

        await api.changeNickname(
          `${global.GoatBot.config.nickNameBot || "𝚢𝚘𝚞 𝚁 𝙲𝚑𝚘𝚌𝚘𝚕𝚊𝚝𝚎 🍫"}`,
          group.threadID,
          api.getCurrentUserID()
        );

        count++;
      } catch {
  
        count++;
      }
    }

    for (const idx of indexes.sort((a, b) => b - a)) {
      if (idx > 0 && idx <= pending.length) {
        pending.splice(idx - 1, 1);
      }
    }

    return api.sendMessage(
      `✅ | [ Successfully ] 🎉 Approved ${count} Groups✨!`,
      threadID
    );
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID } = event;
    const adminBot = global.GoatBot.config.adminBot;

    if (!adminBot.includes(event.senderID)) {
      return api.sendMessage(
        `⚠ you have no permission to use this command!`,
        threadID
      );
    }

    const type = args[0]?.toLowerCase();
    if (!type) {
      return api.sendMessage(
        `Usage: pending [user/thread/all]`,
        threadID
      );
    }

    let msg = "",
      index = 1;
    try {
      const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
      const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
      const list = [...spam, ...pending];

      let filteredList = [];
      if (type.startsWith("u")) filteredList = list.filter((t) => !t.isGroup);
      if (type.startsWith("t")) filteredList = list.filter((t) => t.isGroup);
      if (type === "all") filteredList = list;

      for (const single of filteredList) {
        const name =
          single.name || (await usersData.getName(single.threadID)) || "Unknown";

        msg += `[ ${index} ]  ${name}\n`;
        index++;
      }

      msg += `🦋 please Reply with the correct group number to approve!\n`;
      msg += `✨ Reply with "c" to Cancel.\n`;

      return api.sendMessage(
        `✨ | [ Pending Groups & Users ${type
          .charAt(0)
          .toUpperCase()}${type.slice(1)} List ✨ ]\n\n${msg}`,
        threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            pending: filteredList,
          });
        },
        messageID
      );
    } catch (error) {
      return api.sendMessage(
        `⚠ Failed to retrieve pending list. Please try again later.`,
        threadID
      );
    }
  },
};
