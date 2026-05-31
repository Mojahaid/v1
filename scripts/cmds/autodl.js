const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return res.data.mahmud69;
};

module.exports = {
  config: {
    name: "autodl",
    version: "2.0",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download videos from social platforms"
    },
    category: "media",
    guide: {
      en: "[video link]"
    }
  },

  langs: {
    en: {
      error: "❌ Failed to download video."
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, getLang }) {

    if (this.config.author !== "MahMUD") {
      return api.sendMessage(
        "You are not allowed to change author name.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const text = event.body?.trim();
      if (!text) return;

      const urlMatch = text.match(/^https?:\/\/[^\s]+$/i);
      if (!urlMatch) return;

      const videoUrl = urlMatch[0];

      const supportedDomains = [
        "tiktok.com",
        "youtube.com",
        "youtu.be",
        "facebook.com",
        "fb.watch",
        "instagram.com",
        "twitter.com",
        "x.com",
        "threads.net",
        "snapchat.com",
        "reddit.com",
        "pinterest.com",
        "pin.it",
        "spotify.com",
        "soundcloud.com",
        "linkedin.com",
        "tumblr.com",
        "capcut.com",
        "dailymotion.com",
        "dai.ly",
        "kwai.com",
        "kuaishou.com",
        "douyin.com",
        "bsky.app"
      ];

      const isSupported = supportedDomains.some(domain =>
        videoUrl.includes(domain)
      );

      if (!isSupported) return;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(
        cacheDir,
        `autodl_${Date.now()}.mp4`
      );

      const base = await baseApiUrl();

      const res = await axios.get(
        `${base}/api/download?url=${encodeURIComponent(videoUrl)}`
      );

      if (!res.data || !res.data.result) {
        throw new Error("No result found");
      }

      const video = await axios.get(res.data.result, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, video.data);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        {
          body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😘\n\n• 𝐀𝐝𝐦𝐢𝐧: 𝗠𝗔𝗠𝗨𝗡`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        },
        event.messageID
      );

    } catch (err) {
      console.log(err);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.sendMessage(
        getLang("error"),
        event.threadID,
        event.messageID
      );
    }
  }
};
