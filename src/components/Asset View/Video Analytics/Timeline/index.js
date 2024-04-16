import React, { useEffect } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Thumbnail from "./Thumbnail";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import noData from "assets/img/no-event.png";
import hexRgb from "hex-rgb";
import IconButton from "@mui/material/IconButton";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useSelector } from "react-redux";
export default function TimelineComp(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.primaryColor)
  );

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
          // ctx.canvas.toBlob(
          //   (blob) => {
          //     resolve(blob);
          //   },
          //   "image/jpeg",
          //   0.75 /* quality */
          // );
        });
      });
    });
  }
  const getFileType = (url) => {
    // Extract the file extension from the URL
    const fileExtension = url.split('.').pop().toLowerCase();

    // Define common video file extensions
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv'];

    // Define common image file extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

    // Check if the file extension is in the videoExtensions array
    if (videoExtensions.includes(fileExtension)) {
      return 'video';
    }

    // Check if the file extension is in the imageExtensions array
    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    }

    // If the file extension is not recognized as video or image, you can return null or handle it differently
    return null;
  }
  async function getUrl(url) {
    let cover = await getVideoCover(url, 0.5);
    return cover;
  }
  console.log('props in timeline = ', props)
  useEffect(() => {
    // let cover = await getVideoCover(
    //   "https://xelerate-video.s3.eu-central-1.amazonaws.com/5047052566ae88b47317479c2766a614.mp4?",
    //   0.5
    // );
    if (props.data[0]) {
      props.setId(props.data[0]._id);
      props.setLink(
        props.data[0].metaData?.videoUrl
          ? props.data[0].metaData.videoUrl
          : props.data[0].metaData?.imageUrl
            ? props.data[0].metaData.imageUrl
            : ""
      );
      props.setType(
        props.data[0].metaData?.videoUrl
          ? getFileType(props.data[0].metaData?.videoUrl) ? getFileType(props.data[0].metaData?.videoUrl) : "video"
          : props.data[0].metaData?.imageUrl
            ? "image"
            : "null"
      );
    }
  }, [props.data]);

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  function back(page) {
    let disabled;
    if (page != 0) disabled = false;
    else disabled = true;
    return (
      <IconButton
        size="medium"
        onClick={handlePagePrevious}
        disabled={disabled}
      >
        <NavigateBeforeIcon fontSize="inherit" />
      </IconButton>
    );
  }

  function next(page) {
    let disabled;
    if (page * 10 + 10 <= props.data.length) disabled = false;
    else disabled = true;
    return (
      <IconButton size="medium" onClick={handlePageNext} disabled={disabled}>
        <NavigateNextIcon fontSize="inherit" />
      </IconButton>
    );
  }

  const handlePageNext = () => {
    props.setPage(props.currentPage + 1);
  };
  const handlePagePrevious = () => {
    props.setPage(props.currentPage - 1);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: '1rem',
        position: "relative",
      }}
    >
      {props.data.length == 0 && !props.events?.isFetching && props.events?.isSuccess ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={noData} height={"150px"} width={"150px"} />
          <p style={{ color: "#c7c7c7" }}>No Events Found</p>
        </div>
      ) : (
        <div
          style={{
            height: "calc(100vh - 480px)",
            overflowY: "scroll",
            width: '100%'
          }}
        >
          <Timeline>
            {props.data
              .slice(props.currentPage * 10, props.currentPage * 10 + 10)
              .map((elm) => {
                return (
                  <TimelineItem>
                    <TimelineOppositeContent
                      sx={{ m: "auto 0" }}
                      align="right"
                      variant="body2"
                      color="text.secondary"
                      style={{ maxWidth: "100px" }}
                    >
                      {formatAMPM(new Date(elm.createdAt))}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot
                        onClick={() => {
                          props.setId(elm._id);

                          if (
                            `${elm.metaData.videoUrl
                              ? elm.metaData.videoUrl
                              : elm.metaData.imageUrl
                            }` != `${props.link}`
                          ) {
                            props.setLink(
                              elm.metaData.videoUrl
                                ? elm.metaData.videoUrl
                                : elm.metaData.imageUrl
                            );
                            props.setType(
                              elm.metaData.videoUrl
                                ? getFileType(elm.metaData.videoUrl) ? getFileType(elm.metaData.videoUrl) : "video"

                                : elm.metaData.imageUrl
                                  ? "image"
                                  : "null"
                            );
                            props.setContentLoader(true);
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            elm._id == props.id
                              ? metaDataValue.branding.primaryColor
                              : "",
                        }}
                      // color={
                      //   props.link == elm.metaData?.videoUrl ||
                      //   props.link == elm.metaData?.imageUrl
                      //     ? "primary"
                      //     : "grey"
                      // }
                      >
                        {elm.metaData?.videoUrl && getFileType(elm.metaData.videoUrl) !== "image" ? (
                          <VideocamIcon />
                        ) : (
                          <ImageIcon />
                        )}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: "12px", px: 2 }}>
                      <div
                        onClick={() => {
                          props.setId(elm._id);
                          if (
                            `${elm.metaData.videoUrl
                              ? elm.metaData.videoUrl
                              : elm.metaData.imageUrl
                            }` != `${props.link}`
                          ) {
                            props.setLink(
                              elm.metaData.videoUrl
                                ? elm.metaData.videoUrl
                                : elm.metaData.imageUrl
                            );
                            props.setType(
                              elm.metaData.videoUrl
                                ? getFileType(elm.metaData.videoUrl) ? getFileType(elm.metaData.videoUrl) : "video"
                                : elm.metaData.imageUrl
                                  ? "image"
                                  : "null"
                            );
                            props.setContentLoader(true);
                          }
                        }}
                        style={{
                          border:
                            elm._id == props.id
                              ? `2px solid ${metaDataValue.branding.primaryColor}`
                              : "1px solid #bdbdbd",
                          borderRadius: "5px",
                          padding: "5px",
                          display: "flex",
                          backgroundColor:
                            elm._id == props.id
                              ? `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`
                              : "rgb(189,189,189,0.1)",
                          cursor: "pointer",
                          maxWidth: "200px",
                        }}
                      >
                        {elm.metaData?.videoUrl && getFileType(elm.metaData.videoUrl) !== "image" ? (
                          <Thumbnail url={elm.metaData.videoUrl} />
                        ) : getFileType(elm.metaData.videoUrl) === "image" || elm.metaData?.imageUrl ? (
                          <div
                            style={{
                              marginRight: "10px",
                              boxShadow:
                                "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                            }}
                          >
                            <img
                              src={getFileType(elm.metaData.videoUrl) === "image" ? elm.metaData.videoUrl : elm.metaData.imageUrl}
                              style={{
                                maxHeight: "50px",
                              }}
                            />
                          </div>
                        ) : null}

                        <p
                          style={{
                            fontSize: "10px",
                          }}
                        >
                          <b>
                            {elm.text.length < 80
                              ? elm.text
                              : `${elm.text.substring(0, 80)}...`}
                          </b>
                        </p>
                      </div>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}

          </Timeline>

        </div>
      )}
      {props.data.length != 0 ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {back(props.currentPage)}
          <p>{props.currentPage + 1}</p>
          {next(props.currentPage)}
        </span>
      ) : null}
    </div>
  );
}
