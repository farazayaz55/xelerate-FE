import React, { Fragment, useEffect, useState, useCallback } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Card from "@mui/material/Card";
import Timeline from "./Timeline";
import { Divider } from "@mui/material";
import Loader from "components/Progress";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import { useGetEventsQuery } from "services/events";
import emitter from "Utilities/events";
import { getSocket } from "Utilities/socket";
import EventIcon from "@mui/icons-material/Event";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function VideoAnalytics(props) {
  //styling
  const inputBaseHeight = "4rem";
  const textFieldMinHeight = "2.4rem";
  //

  let token = window.localStorage.getItem("token");
  const [value, setValue] = React.useState(new Date(props?.videoAnalyticsDate) || new Date());
  const [data, setData] = React.useState([]);
  const [contentLoader, setContentLoader] = React.useState(true);
  const [loader, setLoader] = React.useState(true);
  const [link, setLink] = React.useState("");
  const [id, setId] = React.useState("");
  const [type, setType] = React.useState("null");
  const [pageSize, setPageSize] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [dateTo, setDateTo] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [searchText, setSearchText] = React.useState(null);
  const [searchInput, setSearchInput] = React.useState(props?.videoAnalyticsSearchText || "");

  const events = useGetEventsQuery({
    token,
    params: `?dateTo=${dateTo}&dateFrom=${dateFrom}&pageSize=${pageSize}&currentPage=${
      currentPage + 1
    }&source=${props.id}&type=c8y_videoAnalytics${
      searchText ? `&text=${searchText}` : ""
    }`,
  });

  const handleOpenDatePicker = () => {
    setOpenDatePicker(!openDatePicker);
  };
  // useEffect(() => {
  //   const delay = 1000; // 1000 milliseconds (1 second)
  //   let timeoutId;

  //   // Debounce function
  //   const debounce = (func, wait) => {
  //     clearTimeout(timeoutId);
  //     timeoutId = setTimeout(func, wait);
  //   };

  //   // Function to be called after the debounce
  //   const delayedAPICall = () => {
  //     // Call your API function here
  //     // apiCall(searchInput);
  //     setSearchText(target);

  //     console.log('API call with:', searchInput);
  //   };

  //   // Call the debounce function after each input change
  //   debounce(delayedAPICall, delay);

  //   // Cleanup the timeout if the component unmounts or the input changes
  //   return () => clearTimeout(timeoutId);
  // }, [searchInput]);
  const delay = 1000; // 1000 milliseconds (1 second)
  let timeoutId;

  // Debounce function
  const debounce = (func, wait) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, wait);
  };

  // Function to be called after the debounce
  const delayedAPICall = useCallback(() => {
    // Call your API function here
    // apiCall(searchInput);
    setSearchText(searchInput);

    console.log("API call with:", searchInput);
  }, [searchInput]);

  useEffect(() => {
    // Call the debounce function after each input change
    debounce(delayedAPICall, delay);

    // Cleanup the timeout if the component unmounts or the input changes
    return () => clearTimeout(timeoutId);
  }, [delayedAPICall]);

  const resetCalender = () => {
    console.log("reset");
    setDateTo("");
    setDateFrom("");
    setPageSize(1);
    setCurrentPage(0);
    setSearchInput("");
  };
  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function callbackfn(payload) {
    console.log("CallBack ran")
    setData((prev) => {
      let temp = [...prev];
      temp.unshift(payload.message);
      return temp;
    });
  }
  const handleSearch = (e) => {
    let target = e.target.value;
    setLoader(true);
    setSearchInput(target);
    console.log("value", target);
  };

  const clearSearch = (e) => {
    setLoader(true);
    setSearchInput("");
  };

  async function initializeSocket(topics) {
    await getSocket(topics);
    emitter.on("asset?events-c8y_videoAnalytics", callbackfn);
  }

  useEffect(() => {
    initializeSocket([
      `devices__${props.serviceId}__${props.id}`,
      `events-c8y_videoAnalytics__${props.serviceId}__${props.id}`,
    ]);

    return () => {
      emitter.off("asset?events-c8y_videoAnalytics", callbackfn);
    };
  }, []);

  useEffect(() => {
    setLoader(true);
    getEvents();
  }, [events.isFetching]);

  async function getEvents() {
    if (!events.isFetching && events.isSuccess) {
      let tempEvents = events.data.payload.data;
      console.log("tempEvents", tempEvents);
      if (tempEvents.length) {
        if (pageSize == 1) {
          handleChange(tempEvents[0].time);
        } else if (pageSize != 1) {
          setData([...tempEvents]);
          setLoader(false);
        }
      } else {
        setLoader(false);
        setData([]);
      }
    }
  }

  const handleChange = (newValue) => {
    let day = new Date(newValue);
    let temp = new Date(day.setMinutes(0));
    temp = new Date(temp.setSeconds(0));
    temp = new Date(temp.setHours(0));
    let from = temp.toISOString();
    let to = new Date(temp.setDate(temp.getDate() + 1)).toISOString();
    setDateFrom(from);
    setDateTo(to);
    setPageSize(10);
    setValue(newValue);
    setLoader(true);
  };

  function timelineFn() {
    return (
      <Timeline
        data={data}
        link={link}
        id={id}
        setId={setId}
        setLink={setLink}
        type={type}
        setType={setType}
        setPage={(p) => setCurrentPage(p)}
        currentPage={currentPage}
        setContentLoader={setContentLoader}
        events={events}
      />
    );
  }

  function getMedia(type) {
    switch (type) {
      case "image":
        return (
          <Fragment>
            {contentLoader ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", left: "100%", top: "50%" }}>
                  <Loader />
                </div>
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                maxWidth: "27rem",
              }}
            >
              <img
                src={link}
                onLoad={() => {
                  setContentLoader(false);
                }}
                height={"100%"}
              ></img>
            </div>
          </Fragment>
        );

      case "video":
        return (
          <Fragment>
            {contentLoader ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", left: "100%", top: "50%" }}>
                  <Loader />
                </div>
              </div>
            ) : null}
            <iframe
              src={link}
              title="description"
              height="100%"
              width="100%"
              allow="fullscreen"
              frameBorder={0}
              onLoad={() => {
                setContentLoader(false);
              }}
            ></iframe>
          </Fragment>
        );

      case "null":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageNotSupportedIcon
              style={{ color: "#c7c7c7", height: "150px", width: "150px" }}
            />
            <p style={{ color: "#c7c7c7" }}>No Media Found</p>
          </div>
        );

      default:
        break;
    }
  }

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minWidth: "500px",
          width: "100%",
          height: "calc(100vh - 238px)",
          minHeight: "calc(100vh - 300px)",
        }}
      >
        <div id="left-pane">
          <div
            style={{
              position: "relative",
              minWidth: "400px",
              display: "flex",
              marginBottom: "50px",
              flexDirection: "row",
            }}
          >
<LocalizationProvider dateAdapter={AdapterDateFns}>
    <DesktopDatePicker
      label="Date"
      inputFormat="MM/dd/yyyy"
      value={value}
      onChange={handleChange}
      open={openDatePicker}
      onClose={handleOpenDatePicker}
      renderInput={(params) => (
        <TextField
          {...params}
          size="medium"
          style={{
            margin: "20px",
            marginTop:"17px",
            zIndex: "1",
            minHeight: textFieldMinHeight,
            maxHeight: "60px",
            width: "100%", // Set the width to 100%
          }}
          
          InputProps={{
            style: { height: inputBaseHeight ,padding:0},
            size:"small",
            endAdornment: (
              <InputAdornment position="end"  >
                <Tooltip
                  title={"Reset to find latest events"}
                  placement="bottom"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <IconButton>
                    <RestartAltIcon onClick={resetCalender} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={"Open date picker"}
                  placement="bottom"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <IconButton>
                    <EventIcon onClick={handleOpenDatePicker} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
    <TextField
      variant="outlined"
      size="medium"
      label="Search media events"
      onChange={handleSearch}
      value={searchInput}
      style={{
        margin: "20px",
        zIndex: "1",
        minHeight: textFieldMinHeight,
        width: "100%", // Set the width to 100%
        marginTop: "1rem",
        marginLeft:"0px"// else left will have double space
      }}
      InputProps={{
        style: { height: "100%" },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon style={{ color: "grey" }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="start">
            {searchText && (
              <ClearIcon
                style={{ color: "grey", cursor: "pointer" }}
                onClick={clearSearch}
              />
            )}
          </InputAdornment>
        ),
      }}
    />
</LocalizationProvider>

          </div>
          {ifLoaded(loader, timelineFn)}
        </div>
        <Divider orientation="vertical" flexItem />
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data?.length ? (
            getMedia(type)
          ) : loader ? (
            <>
              <Loader />
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
