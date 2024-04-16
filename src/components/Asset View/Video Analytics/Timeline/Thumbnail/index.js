import React, { useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function Thumbnail(props) {
  const [img, setImg] = React.useState("");

  function getVideoCover(file, seekTo) {
    return new Promise((resolve, reject) => {
      // load the file to a video player
      const videoPlayer = document.createElement("video");
      videoPlayer.setAttribute("src", file);
      videoPlayer.setAttribute("crossOrigin", "anonymous");
      videoPlayer.load();
      videoPlayer.addEventListener("error", (ex) => {
        reject("error when loading video file", ex);
      });
      // load metadata of the video to get video duration and dimensions
      videoPlayer.addEventListener("loadedmetadata", () => {
        // seek to user defined timestamp (in seconds) if possible
        if (videoPlayer.duration < seekTo) {
          reject("video is too short.");
          return;
        }
        // delay seeking or else 'seeked' event won't fire on Safari
        setTimeout(() => {
          videoPlayer.currentTime = seekTo;
        }, 200);
        // extract video thumbnail once seeking is complete
        videoPlayer.addEventListener("seeked", () => {
          // define a canvas to have the same dimension as the video
          const canvas = document.createElement("canvas");
          canvas.width = videoPlayer.videoWidth;
          canvas.height = videoPlayer.videoHeight;
          // draw the video frame to canvas
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
          // return the canvas image as a blob
          var dataURL = ctx.canvas.toDataURL();
          resolve(dataURL);
        });
      });
    });
  }

  async function getUrl(url) {
    let cover = await getVideoCover(url, 0.1);
    setImg(cover);
    return cover;
  }

  useEffect(() => {
    getUrl(props.url, 0.5);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10px",
        minHeight: "50px",
        minWidth: "30px",
        boxShadow:
          "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
      }}
    >
      <PlayArrowIcon
        style={{
          color: "white",
          position: "absolute",
          textAlign: "center",
        }}
      />
      <img
        src={img}
        style={{
          maxHeight: "50px",
        }}
      />
    </div>
  );
}
