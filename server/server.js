// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Store active connections
const clients = new Set();

// Handle WebSocket connections
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("New client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "text":
          handleTextMessage(data, ws);
          break;
        case "audio":
          handleAudioMessage(data, ws);
          break;
        case "screenshot":
          handleScreenshot(data, ws);
          break;
        case "screen-record":
          handleScreenRecord(data, ws);
          break;
        default:
          return;
      }
    } catch (err) {
      console.error("Error processing message:", err);
      ws.send(
        JSON.stringify({
          type: "error",
          content: "Error processing message",
        })
      );
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

function handleTextMessage(data, ws) {
  console.log("Received text message:", data.text);

  ws.send(
    JSON.stringify({
      type: "text",
      sender: "bot",
      content: `Received: ${data.text}`,
    })
  );
}

function handleAudioMessage(data, ws) {
  console.log("Received audio message");

  if (data && data.content) {
    const buffer = Buffer.from(data.content, "base64");
    const filename = `audio-${Date.now()}.webm`;
    const filepath = path.join(__dirname, "audio", filename);

    if (!fs.existsSync(path.join(__dirname, "audio"))) {
      fs.mkdirSync(path.join(__dirname, "audio"));
    }

    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error("Error saving audio recording", err);
        ws.send(
          JSON.stringify({
            type: "error",
            content: "Error saving audio recording",
          })
        );
      } else {
        console.log("Audio saved:", filename);
        // Notify the client with the filename
        ws.send(
          JSON.stringify({
            type: "success",
            content: `Audio saved as ${filename}`,
          })
        );
      }
    });
  } else {
    console.error("Invalid audio recording received:", data);
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Invalid audio recorded data",
      })
    );
  }
}

function handleScreenshot(data, ws) {
  console.log("Received screenshot:");

  if (data && data.content) {
    const base64Data = data.content;
    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(__dirname, "screenshots", filename);

    // Ensure the screenshots directory exists
    if (!fs.existsSync(path.join(__dirname, "screenshots"))) {
      fs.mkdirSync(path.join(__dirname, "screenshots"));
    }

    // Write the base64 data to a file
    fs.writeFile(filepath, base64Data, { encoding: "base64" }, (err) => {
      if (err) {
        console.error("Error saving screenshot:", err);
        ws.send(
          JSON.stringify({
            type: "error",
            sender: "bot",
            content: "Error saving screenshot",
          })
        );
      } else {
        console.log("Screenshot saved:", filename);
        ws.send(
          JSON.stringify({
            type: "success",
            sender: "bot",
            content: `Screenshot saved as ${filename}`,
          })
        );
      }
    });
  } else {
    console.error("Invalid screenshot data received:", data);
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Invalid screenshot data",
      })
    );
  }
}

function handleScreenRecord(data, ws) {
  console.log("Received screen recording");

  if (data && data.content) {
    const buffer = Buffer.from(data.content, "base64");
    const filename = `recording-${Date.now()}.webm`;
    const filepath = path.join(__dirname, "recordings", filename);

    // Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, "recordings"))) {
      fs.mkdirSync(path.join(__dirname, "recordings"));
    }

    // Write the base64 data to a file
    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error("Error saving screen recording:", err);
        ws.send(
          JSON.stringify({
            type: "error",
            sender: "bot",
            content: "Error saving screen recording",
          })
        );
      } else {
        console.log("Screenshot saved:", filename);
        ws.send(
          JSON.stringify({
            type: "success",
            sender: "bot",
            content: `Screen recording saved as ${filename}`,
          })
        );
      }
    });
  } else {
    console.error("Invalid screen recording received:", data);
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Invalid screen recorded data",
      })
    );
  }
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// if (data.screenshotBase64) {
//   const buffer = Buffer.from(data.screenshotBase64, 'base64');
//   const screenshotFilename = `screenshot-${Date.now()}.png`;
//   const screenshotPath = path.join(__dirname, 'screenshots', screenshotFilename);

//   // Ensure directory exists for screenshots
//   if (!fs.existsSync(path.join(__dirname, 'screenshots'))) {
//     fs.mkdirSync(path.join(__dirname, 'screenshots'));
//   }

//   fs.writeFile(screenshotPath, buffer, (err) => {
//     if (err) {
//       console.error('Error saving screenshot:', err);
//       ws.send(JSON.stringify({
//         type: 'error',
//         content: 'Error saving screenshot'
//       }));
//     } else {
//       console.log('Screenshot saved:', screenshotFilename);
//       ws.send(JSON.stringify({
//         type: 'text',
//         sender: 'bot',
//         content: `Screenshot saved as ${screenshotFilename}`
//       }));
//     }
//   });
// }

// REST endpoint for media upload fallback
// app.post('/upload', (req, res) => {
//   const { mediaBase64, mode } = req.body;

//   if (!mediaBase64) {
//     return res.status(400).send('No media data provided');
//   }

//   console.log('Received media upload:', {
//     mode,
//     size: mediaBase64.length
//   });

//   const buffer = Buffer.from(mediaBase64, 'base64');
//   const filename = `upload-${Date.now()}.webm`;
//   const filepath = path.join(__dirname, 'recordings', filename);

//   fs.writeFile(filepath, buffer, (err) => {
//     if (err) {
//       console.error('Error saving upload:', err);
//       res.status(500).send('Error saving file');
//     } else {
//       console.log('Upload saved:', filename);
//       res.json({ filename });
//     }
//   });
// });
