/*
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: 'videopro',
  desc: 'Search and download YouTube videos',
  category: 'media',
  filename: __filename
}, async (conn, mek, m, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    if (!q) return reply(`*Example*: .videopro Faded by Alan Walker`);

    const searchResults = await yts(q);
    const video = searchResults.all[0];

    if (!video) return reply(`*No video found for ${q}*`);

    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4`;
    const apiResponse = await axios.get(apiUrl, { params: { url: video.url } });

    if (apiResponse.data.success) {
      const { title, download_url } = apiResponse.data.result;

      await reply(`*Video found!* \n\n*Title:* ${title}\n*Size:* ${apiResponse.data.result.filesize}\n*Duration:* ${video.timestamp}\n\n*Downloading...*`);

      await conn.sendMessage(m.chat, { video: { url: download_url }, mimetype: 'video/mp4', caption: `📹 *${title}*` }, { quoted: m });
    } else {
      reply(`*Error downloading video! Please try again later.*`);
    }
  } catch (error) {
    console.error('Error during video command:', error);
    reply(`*An error occurred while processing your request.*`);
  }
});
*/
const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

// List of APIs to try (fallback mechanism for video downloads)
const APIS = [
  "https://api.ahmmikun.live/api/downloader/ytdl?type=mp4&url=",
  "https://api.fgmods.xyz/api/downloader/ytmp4?url=",
  "https://api.siputzx.my.id/api/d/ytmp4?url=",
  "https://api.davidcyriltech.my.id/download/ytmp4?url=",
];

cmd({
  pattern: "playvideo1",
  react: '🎥',
  alias: ['ytmp41', 'ytvideo1', 'ytvid1'],
  desc: "Download video from YouTube by searching for keywords (using multiple APIs).",
  category: "media",
  use: ".playvideo <video name or keywords>",
  filename: __filename
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      return reply("*Please provide a video name or keywords to search for.*");
    }

    reply("*Subzero Searching Video 🔍*");

    // Search for videos on YouTube
    const searchResults = await yts(searchQuery);
    if (!searchResults.videos || searchResults.videos.length === 0) {
      return reply(`❌ No results found for "${searchQuery}".`);
    }

    const firstResult = searchResults.videos[0];
    const videoUrl = firstResult.url;

    let downloadUrl = null;
    let title = firstResult.title;

    // Try each API until one works
    for (const api of APIS) {
      try {
        const apiUrl = api + encodeURIComponent(videoUrl);
        const response = await axios.get(apiUrl);

        if (response.data && response.data.success && response.data.result && response.data.result.download_url) {
          downloadUrl = response.data.result.download_url;
          title = response.data.result.title || title;
          break; // Exit loop if successful
        }
      } catch (error) {
        console.error(`API failed: ${api}`, error);
      }
    }

    if (!downloadUrl) {
      return reply("❌ All APIs failed. Please try again later.");
    }

    // Send the video file
    await conn.sendMessage(from, {
      video: { url: downloadUrl },
      mimetype: "video/mp4",
      fileName: title + ".mp4",
      caption: `> Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ ⚡`
    }, { quoted: mek });

    reply(`✅ *${title}* has been downloaded successfully!`);
  } catch (error) {
    console.error("Error downloading video:", error);
    reply("❌ An error occurred while processing your request.");
  }
});
