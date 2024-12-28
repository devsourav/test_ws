"use client";

import { useState } from "react";
import { Camera, Mic, Monitor, StopCircle, Video } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useWebSocket } from "../context/WebSocketContext";
import html2canvas from "html2canvas";

export const MediaControls = () => {
  const { isRecording, setIsRecording } = useChat();
  const { sendMessage } = useWebSocket();

  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleAudio = async (option) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const audioRecorder = new MediaRecorder(stream);
      const recordedChunks = [];

      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      audioRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = () => {
          sendMessage({
            type: option, 
            content: reader.result.split(",")[1],
          });
        };

        reader.readAsDataURL(blob);
      };

      setMediaStream(stream);
      setMediaRecorder(audioRecorder);
      setIsRecording(true); 
      audioRecorder.start();
      
      // setTimeout(() => {
      //   audioRecorder.stop(); 
      //   setIsRecording(false); 
      // }, 5000);
    } catch (error) {
      console.error("Error capturing audio:", error);
    }
  };

  const handleScreenshot = async (option) => {
    const element = document.body;

    try {
      const canvas = await html2canvas(element, {
        scale: window.devicePixelRatio,
      });
      const imgData = canvas.toDataURL("image/png");

      console.log(imgData);

      sendMessage({
        type: option,
        content: imgData.split(",")[1],
      });
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const handleScreenRecord = async (option) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenRecorder = new MediaRecorder(stream);
      const recordedChunks = [];

      screenRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      screenRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const reader = new FileReader();

        reader.onloadend = () => {
          sendMessage({
            type: option,
            content: reader.result.split(",")[1],
          });
        };

        reader.readAsDataURL(blob);
      };

      setMediaStream(stream);
      setMediaRecorder(screenRecorder);
      setIsRecording(true);
      screenRecorder.start();
    } catch (error) {
      console.error("Error capturing screen recording:", error);
    }
  };

  const handleAction = (option) => {
    console.log(option);
    switch (option) {
      case "audio":
        handleAudio(option);
        break;
      case "screenshot":
        handleScreenshot(option);
        break;
      case "screen-record":
        handleScreenRecord(option);
        break;
      default:
        return;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setMediaStream(null);
      setMediaRecorder(null);
    }
  };

  const actionButtons = [
    { title: "Audio", type: "audio", icon: <Mic size={20} /> },
    { title: "Screenshot", type: "screenshot", icon: <Camera size={20} /> },
    {
      title: "Screen Record",
      type: "screen-record",
      icon: <Monitor size={20} />,
    },
  ];

  return (
    <div className="flex justify-center space-x-4 p-2 border-t border-gray-200 text-gray-600">
      {actionButtons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleAction(button.type)}
          disabled={isRecording}
          className="p-2 rounded-full hover:bg-gray-100"
          title={button.title}
        >
          {button.icon}
        </button>
      ))}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="p-2 rounded-full hover:bg-red-100"
        >
          <StopCircle size={20} className="text-red-500" />
        </button>
      )}
    </div>
  );
};

// const takeScreenshot = async () => {
//   try {
//     const stream = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//     });
//     const track = stream.getVideoTracks()[0];
//     const imageCapture = new window.ImageCapture(track);
//     const bitmap = await imageCapture.grabFrame();

//     const canvas = document.createElement("canvas");
//     canvas.width = bitmap.width;
//     canvas.height = bitmap.height;
//     const context = canvas.getContext("2d");
//     context.drawImage(bitmap, 0, 0);

//     const base64Image = canvas.toDataURL("image/jpeg");

//     sendMessage({
//       type: "recordedData",
//       mode: "screenshot",
//       mediaBase64: base64Image.split(",")[1],
//     });

//     track.stop();
//   } catch (err) {
//     console.error("Screenshot error:", err);
//   }
// };

// const startRecording = async (mode) => {
//   try {
//     let stream;
//     if (mode === "audio") {
//       stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     } else if (mode === "video") {
//       stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//     } else if (mode === "screen") {
//       stream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true,
//       });
//     }

//     const recorder = new MediaRecorder(stream);
//     setChunks([]);

//     recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: "video/webm" });
//       const reader = new FileReader();

//       reader.onloadend = () => {
//         sendMessage({
//           type: "screen",
//           mode,
//           mediaBase64: reader.result.split(",")[1],
//         });
//       };

//       reader.readAsDataURL(blob);
//     };

//     setMediaStream(stream);
//     setMediaRecorder(recorder);
//     setIsRecording(true);
//     setRecordingMode(mode);
//     recorder.start();
//   } catch (err) {
//     console.error("Recording error:", err);
//   }
// };
