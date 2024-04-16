//-------------CORE-------------//
import React, { Fragment, useEffect, useState } from "react";
//-------------MUI-------------//
import { Grid, Paper } from "@mui/material";
import Link from "@mui/material/Link";
import { useGetGroupInfoQuery } from "services/analytics";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { CircularProgress, ListItemText } from "@mui/material";
import HumidityIcon from "../../../../assets/icons/kpihicon.png";
import TemperatureIcon from "../../../../assets/icons/kpiticon.png";
import KpiQr from "../../../../assets/icons/kpiqr.png";
import Drawer from "@mui/material/Drawer";
import Filters from "../../Default/Asset Views/Settings";
import { makeStyles, withStyles } from "@mui/styles";
import Rensair from "../../../../assets/icons/rensair-logo.png";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import CloudLogo from "../../../../assets/icons/cloud_logo.svg";
import { ScatterPlotOutlined } from "@mui/icons-material";
import { useGetEventsQuery } from "services/events";
import Loader from "components/Progress";
import styled from "@emotion/styled";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Grow from "@mui/material/Grow";
import Stack from "@mui/material/Stack";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from '@mui/material/IconButton';
import { eventsSocket, getSocket } from "Utilities/socket";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import keys from "Keys";
import { setVideoAnalyticsDate, setVideoAnalyticsSearchText } from "rtkSlices/assetSlice";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDial from "@mui/material/SpeedDial";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
let rendered = false;
let socketInst;

export default function VideoWall(props) {
  console.log("component of Video Wall");
  let actions = [];
  actions.push({
    icon: <ExitToAppIcon />,
    name: "Exit",
    handleFn: () => {
      const ind = kpiData.findIndex(
        (k) => k.serviceId == props.service
      );
      if (ind != -1) {
        const tempKpiData = [...kpiData];
        tempKpiData[ind] = {
          ...tempKpiData[ind],
          videoWallPopup: false,
          serviceDashboard: true,
        };
        localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
      }
      props.history.push(`/solutions/${props.service}`);
    },
  });
  // const StyledDrawer = withStyles({
  //   root: {
  //     position: 'fixed',
  //     zIndex: '1400 !important',
  //     right: '0px',
  //     bottom: '0px',
  //     top: '0px',
  //     left: '0px'
  //   }
  // })(Drawer);
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  console.log("metaDataValue custom: ", metaDataValue);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [datapoints, setDatapoints] = useState({});
  const kpiData = localStorage.getItem("kpiData")
    ? JSON.parse(localStorage.getItem("kpiData"))
    : [];
  console.log({ metaDataValue, filtersValue });
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const [intervalRef, setIntervalRef] = useState(null);
  const [socket, setSocket] = React.useState(null);
  const [dateTo, setDateTo] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(9);
  const [value, setValue] = React.useState(new Date());
  const [pageSize, setPageSize] = React.useState(9);
  const [totalDocuments, setTotalDocuments] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loader, setLoader] = React.useState(true);
  const [data, setData] = React.useState([]);
  const [socketData, setSocketData] = React.useState([]);
  const [contentLoader, setContentLoader] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [openPopupContent, setOpenPopupContent] = React.useState("");
  const [openPopupTitle, setOpenPopupTitle] = React.useState("");
  const [openPopupAssetName, setOpenPopupAssetName] = React.useState("");
  const [openPopupCreatedAt, setOpenPopupCreatedAt] = React.useState("");
  const [openPopupSensorId, setOpenPopupSensorId] = React.useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);


  
  const useStyles = makeStyles((theme) => ({
    root: {
      transition: "0.3s",
      "&:hover": {
        transition: "0.3s",
        transform: "translate(0, -5px)",
      },
    },
    card: {
      transition: "0.3s",
      width: "100%",
      "&:hover": {
        transition: "0.3s",
        boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
        transform: "translate(0, -5px)",
      },
    },
    media: {
      height: 200,
    },
    accordionSummary: {
      "> .MuiAccordionSummary-content": {
        display: "contents",
      },
    },
    newLabel: {
      position: 'relative',
      top: theme.spacing(1),
      right: theme.spacing(1),
      background: theme.palette.secondary.main,
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      zIndex: 99,
      color: '#000000'
    },
    noHover: {
      '&:hover': {
        backgroundColor: 'transparent',
      }
    },
    dialogContainer: {
      // width: '80vw',
      height: '80vh',
      overflow: 'hidden',
    },
    dialogContainerImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover', // Maintain aspect ratio and cover container
    },
    speedDial: {
      position: "absolute",
      bottom: "30px",
      right: "-33px",
      zIndex: theme.zIndex.speedDial,
    },
  }));
  const classes = useStyles();

  console.log("data of eventssssss: ", data);

  /* const events = useGetEventsQuery({
    token,
    params: `?dateTo=${dateTo}&dateFrom=${dateFrom}&pageSize=${pageSize}&currentPage=${
      currentPage
    }&withTotalPages=true&serviceId=${props.service}&groupId=${service.group?.id || filtersValue.group?.id}&type=c8y_videoAnalytics`,
  }); */

  const fetchData = async () => {
    
    try {
      const queryParams = new URLSearchParams({
        currentPage: currentPage,
        pageSize: pageSize,
        dateTo,
        dateFrom,
        withTotalPages: true,
        serviceId: props.service,
        groupId: service.group?.id || filtersValue.group?.id,
        type: 'c8y_videoAnalytics'
      });
  
      const response = await fetch(`${keys.baseUrl}/events/get?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': `${token}`
        },
      });
        const responseData = await response.json();
        console.log("response data: ", responseData);

        let tempEvents = responseData.payload.data;
        setTotalDocuments(responseData.payload.totalDocuments);
        setTotalPages(responseData.payload.totalPages);
        setCurrentPage(currentPage + 1);
        //setFirstTimeLoading(false);

          // Reset isNew property to false for all elements in data
          // const resetData = data.map((event) => ({ ...event, isNew: false }));

          // Check for new events and add them to the array
          // const newEvents = tempEvents.filter((event) => !resetData.some((existingEvent) => existingEvent._id === event._id));

          // Add a label to new events
          // const newEventsWithLabel = newEvents.map((event) => ({ ...event, isNew: true }));

          // Check for deleted events
          // const deletedEvents = resetData.filter((existingEvent) => !tempEvents.some((event) => event._id === existingEvent._id));

          // Remove deleted events from data
          // const updatedData = resetData.filter((existingEvent) => !deletedEvents.some((deletedEvent) => deletedEvent._id === existingEvent._id));

          // setData([...newEventsWithLabel, ...updatedData]);
          setData([...data, ...tempEvents]);
          // setData((prevData) => [...prevData, ...responseData]);

      setFirstTimeLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    setFirstTimeLoading(true);
  }, []); // Fetch initial data on component mount

  const getFileType = (url)=> {
    // Extract the file extension from the URL
    const fileExtension = url.split('.').pop().toLowerCase();
  
    // Define common video file extensions
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'mpg', 'mpeg'];
  
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


  function handleClick(sensorId, eventDate, eventText, assetTab) {
    dispatch(setVideoAnalyticsDate(eventDate));
    dispatch(setVideoAnalyticsSearchText(eventText));
    if(assetTab) {
      props.history.push(`/solutions/${props.service}/${sensorId}/0`);
    } else {
      props.history.push(`/solutions/${props.service}/${sensorId}/1`);
    }
  }

  let processing = false;
  async function initializeSocket(topics) {
    socketInst = await getSocket(topics);
    socketInst.on("realtime", async (payload) => {
      if (!processing) {
        processing = true;
        let topic = payload.topic.substring(0, payload.topic.indexOf("__"));
        console.log("----------: topic: ", topic);
        console.log("-----------: payload.message: ", payload.message);
        let socketFinalResponse = JSON.parse(JSON.stringify(payload.message.message));
        console.log("test ------ socketFinalResponse: ", socketFinalResponse);
        let updatedObject = { ...socketFinalResponse, isNew: true };
        const isDuplicate = socketData.some(item => item.id === updatedObject.id);
  
        // Add the updatedObject to socketData only if it's not a duplicate
        if (!isDuplicate) {
          setSocketData(prevSocketData => [updatedObject, ...prevSocketData]);
        }
      
        // Pause execution for 2 seconds
        await pause(2000);

        processing = false;
        // setSocketData([updatedObject, ...socketData]);
      }
    });
  }

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    initializeSocket([
      `devices__${props.service}`,
      `events-c8y_videoAnalytics__${props.service}`,
    ]);
    return () => {
      socketInst.disconnect();
    };
  }, []);

  /* useEffect(() => {
    getEvents();
  }, [events.isFetching]); */

  async function getEvents() {
    if (!events.isFetching && events.isSuccess) {
      setIsRefetching(true);
      let tempEvents = events.data.payload.data;
            if (tempEvents.length) {
        /* if (pageSize == 1) {
          handleChange(tempEvents[0].time);
        } else if (pageSize != 1) { */
        setTotalDocuments(events.data.payload.totalDocuments);

          // Reset isNew property to false for all elements in data
          const resetData = data.map((event) => ({ ...event, isNew: false }));

          // Check for new events and add them to the array
          const newEvents = tempEvents.filter((event) => !resetData.some((existingEvent) => existingEvent._id === event._id));

          // Add a label to new events
          const newEventsWithLabel = newEvents.map((event) => ({ ...event, isNew: true }));

          // Check for deleted events
          const deletedEvents = resetData.filter((existingEvent) => !tempEvents.some((event) => event._id === existingEvent._id));

          // Remove deleted events from data
          const updatedData = resetData.filter((existingEvent) => !deletedEvents.some((deletedEvent) => deletedEvent._id === existingEvent._id));

          setData([...newEventsWithLabel, ...updatedData]);
        // }
      }
      setLoader(false);
    }
  }

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  const handleChange = (newValue) => {
    let day = new Date(newValue);
    let temp = new Date(day.setMinutes(0));
    temp = new Date(temp.setSeconds(0));
    temp = new Date(temp.setHours(0));
    let from = temp.toISOString();
    let to = new Date(temp.setDate(temp.getDate() + 1)).toISOString();
    // setDateFrom(from);
    // setDateTo(to);
    // setPageSize(10);
    setValue(newValue);
    setLoader(true);
  };

  useEffect(() => {
    if (!rendered) {
      rendered = true;
    }
  })
// Handle page change
const handlePageChange = (page) => {
  console.log("page number: ", page);
  setCurrentPage(page);
  // events.refetch();
};
  useEffect(() => {
    const ind = kpiData.findIndex((k) => k.serviceId == props.service);
    if (ind == -1) {
      kpiData.push({
        popup: false,
        videoWallPopup: true,
        serviceId: props.service,
      });
      localStorage.setItem("kpiData", JSON.stringify(kpiData));
    } else {
      const tempKpiData = [...kpiData];
      tempKpiData[ind] = { ...tempKpiData[ind], popup: false, videoWallPopup: true };
      localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
    }
    /* const timerRef = setInterval(() => {
      events.refetch()
    }, 60000);
    setIntervalRef(timerRef);
    return () => {
      clearInterval(intervalRef);
    }; */
  }, []);
  
  const openPopover = Boolean(anchorEl);
  const id = openPopover ? "simple-popover" : undefined;

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  return (
    <div
      id="videowall-catalogue"
      style={{
        height: "calc(100vh - 66px)",
        overflowY: "scroll",
        scrollbarWidth: "none",
        padding: "10px",
      }}
    >
      <span
        style={{
          display: "grid",
          gridGap: "10px",
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: "100",
        }}
      >
      <SpeedDial
          ariaLabel="SpeedDial example"
          className={classes.speedDial}
          icon={<ArrowBackIosIcon />}
          FabProps={{
            color: "secondary",
          }}
          // onClose={handleClose}
          // onOpen={handleOpen}
          // open={openSpeedDial}
          direction="left"
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              id={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.handleFn}
            />
          ))}
        </SpeedDial>
      </span>
      {firstTimeLoading ? (
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              height: "100%",
              width: "100%",
              // backgroundColor: metaDataValue.branding.secondaryColor,
            }}
          >
            <CircularProgress size={70}/>
          </div>
        ) : (
      <Fragment>
        {!socketData.length && !data.length ? (
          <Grid style={{position: "relative", top: "50%"}} item xs={12} sm={6} md={4}>
            <div style={{textAlign: "center", fontSize: "18px"}}>No media events found</div>
            </Grid>
        ) : null}
      <div
      style={{
        margin: "30px 10px 0 0",
      }}>
        {data.length ? (
          <Grid container spacing={2}>
            <Dialog
        open={openPopup}
        onClose={handlepopupClose}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            maxWidth: '80vw',
            maxHeight: '80vh',
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <DialogTitle style={{ width: '100%' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "2px",
                fontSize: "15px",
                fontWeight: "bold",
                width: "calc(100% - 38px)"
              }}
            >
              {openPopupTitle}
            </Typography>

            <IconButton className={classes.noHover}
            edge="start"
            color="inherit"
            onClick={handlepopupClose}
            aria-label="close"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              margin: "-16px",
              justifyContent: "flex-end",
              cursor: "pointer"
            }}
          >
            <CloseIcon />
          </IconButton>

          </div>

         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "2px",
              }}
            >
              
              <Link
                underline="hover"
                color="inherit"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(openPopupSensorId, openPopupCreatedAt, openPopupTitle, true);
                }}
                style={{color: 'rgba(0, 0, 0, 0.6)'}}
              >
                {openPopupAssetName}
              </Link>
            &nbsp;
             ({openPopupCreatedAt})
              
            </Typography>
            
          </div>
                          
        </DialogTitle>
        
        </div>
        <DialogContent className={classes.dialogContainer} style={{ padding: "0px 20px 20px 20px" }}>
          <img className={classes.dialogContainerImage} src={openPopupContent} />
        </DialogContent>
        </Dialog>
            {[...socketData, ...data].map((elm, i) => (
              <Grid item xs={12} sm={6} md={4} id={`videowall-${elm.id}`}>

                <Grow appear={!rendered || elm.isNew} in timeout={(i + 1) * 200}>
                
                  <div className={classes.root}>
                    <Card
                      onClick={(e) => {}}
                      onMouseOver={() => setHovered(i + 1)}
                      onMouseLeave={() => setHovered(false)}
                      className={classes.card}
                      style={{ position: "relative" }}
                    >
                    {isRefetching && elm.isNew && (
                      <Typography 
                        variant="caption"
                        color="secondary" 
                        className={classes.newLabel} style={{
                            position: "absolute",
                            top: 0, 
                            left: 0, 
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            width: "36px"
                            }}>
                          New
                        </Typography>
                      )}
                      <CardActionArea>
                        <CardMedia
                        component={getFileType(elm.metaData.videoUrl) == 'video' ? "iframe" : "img"}

                          className={classes.media}
                          image={elm.metaData.videoUrl}
                          src={elm.metaData.videoUrl}
                          allowFullScreen
                          onClick={() => {
                            setOpenPopup(true); 
                            setOpenPopupContent(elm.metaData.videoUrl);
                            setOpenPopupTitle(elm.text);
                            setOpenPopupAssetName(elm.deviceName);
                            setOpenPopupCreatedAt(elm.createdAt);
                            setOpenPopupSensorId(elm.sensorId);
                          }}
                        />
                        {/* {events.refetch() && elm.isNew && (
                        <Typography variant="caption" color="secondary" className={classes.newLabel}>
                          New
                        </Typography>
                      )} */}
                        <CardContent
                          style={{
                            // minHeight: "102px",
                          }}
                        >
                          
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Tooltip title={elm.text} placement="top">
                            <Typography
                              gutterBottom
                              variant="h7"
                              component="strong"
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <Link
                                underline="hover"
                                color="inherit"
                                href="/"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleClick(elm.sensorId, elm.createdAt, elm.text, false);
                                }}
                                style={{color: 'rgba(0, 0, 0, 0.6)'}}
                              >
                                {elm.text}
                              </Link>
                              
                            </Typography>
                            </Tooltip>
                      
                            <Link
                              underline="hover"
                              color="inherit"
                              href="/"
                              onClick={(e) => {
                                e.preventDefault();
                                handleClick(elm.sensorId, elm.createdAt, elm.text, false);
                              }}
                              style={{color: 'rgba(0, 0, 0, 0.6)'}}
                            >                            
                            {getFileType(elm.metaData.videoUrl) == 'video' ? 
                            <VideocamIcon
                              sx={{
                                color: "gray",
                                padding: "1px"
                              }}
                            /> : <ImageIcon
                            sx={{
                              color: "gray",
                              padding: "1px"
                            }}
                            />}
                            </Link>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: "2px",
                            }}
                          >
                            {new Date(elm.createdAt).toLocaleDateString("en-GB")+" "+new Date(elm.createdAt).toLocaleTimeString()}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: "2px",
                              justifyContent: "flex-end",
                              cursor: "pointer"
                            }}
                          >
                            <Link
                              underline="hover"
                              color="inherit"
                              href="/"
                              onClick={(e) => {
                                e.preventDefault();
                                handleClick(elm.sensorId, elm.createdAt, elm.text, true);
                              }}
                              style={{color: 'rgba(0, 0, 0, 0.6)'}}
                            >
                              {elm.deviceName}
                            </Link>
                          
                          </Typography>
                          </div>
                          <Stack
                            direction="row"
                            spacing={1}
                            style={{ justifyContent: "flex-end" }}
                          >
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </div>
                </Grow>
                
              </Grid>
            ))}

            {(totalPages +1) != currentPage ? (
              <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      margin: "25px 25px"
                    }}>
                  <Button 
                    variant="contained"
                    color="success"
                    style={{ textTransform: 'none' }}
                    onClick={() => {setLoading(true); fetchData();}}>Load more events (total: {totalDocuments})&nbsp;{loading ? <CircularProgress size={20}/> : '' }</Button>
              </div>
              ) : null}
          </Grid>
        ) : null
        }
      </div>
      </Fragment>
        )}
    </div>
  );
}
