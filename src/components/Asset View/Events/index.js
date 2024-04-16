import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconButton } from "@mui/material";
import { Fragment } from "react";
import Loader from "components/Progress";
import noData from "assets/img/no-event.png";
import Card from "@mui/material/Card";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useTranslation } from "react-i18next";
import { useGetEventsQuery } from "services/events";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { getSocket } from "Utilities/socket";
import emitter from "Utilities/events";

export default function Events(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const useStyles = makeStyles(() => ({
    paper: {
      padding: "6px 16px",
      borderRadius: "10px",
    },
    secondaryTail: {
      backgroundColor: metaDataValue.branding.secondaryColor,
    },
  }));
  let token = window.localStorage.getItem("token");
  const classes = useStyles();
  const [data, setData] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [disable, setDisable] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [dateTo, setDateTo] = useState(new Date().toISOString());
  const events = useGetEventsQuery({
    token,
    params: `?pageSize=8&currentPage=${page}&withTotalPages=true&dateFrom=1970-01-01&dateTo=${dateTo}&source=${props.id}`,
  });
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  function callbackfn(payload) {
    setData((prev) => {
      let temp = [...prev];
      let elm = payload.message;
      let time = new Date(elm.time);
      temp.unshift({
        type: elm.type,
        text: elm.text,
        time: `${time.toLocaleDateString(
          "en-GB"
        )} ${time.toLocaleTimeString()}`,
        id: elm.eventId,
      });
      return temp;
    });
  }

  async function initializeSocket(topics) {
    await getSocket(topics);
    emitter.on("asset?events", callbackfn);
  }

  useEffect(() => {
    initializeSocket([
      `devices__${props.serviceId}__${props.id}`,
      `events__${props.serviceId}__${props.id}`,
    ]);

    return () => {
      emitter.off("asset?events", callbackfn);
    };
  }, []);

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function updateEvents(payload, index) {
    setData((prev) => {
      let temp = [...prev];
      payload.forEach((elm) => {
        let time = new Date(elm.time);
        temp.push({
          type: elm.type,
          text: elm.text,
          time: `${time.toLocaleDateString(
            "en-GB"
          )} ${time.toLocaleTimeString()}`,
          id: elm.eventId,
        });
      });
      return temp;
    });
  }

  async function getEvents(page) {
    if (events.isSuccess) {
      let totalPages = events?.data.payload.totalPages;
      if (page == totalPages || totalPages <= 1) {
        setDisable(true);
      }
      setTotalPages(totalPages);
      updateEvents(events?.data.payload.data);
      setLoader(false);
    } else if (
      !events.isLoading &&
      events.isError &&
      events.data.message != ""
    ) {
      showSnackbar("Events", events?.data.message, "error");
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    getEvents(page);
  }, [events.isFetching]);

  function loadMore() {
    if (page < totalPages) {
      setPage(page + 1);
      if (page + 1 == totalPages) {
        setDisable(true);
      }
      // getEvents(page+1);
    }
  }

  function eventsFn() {
    return (
      <Fragment>
        {data.length == 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "40px",
            }}
          >
            <img src={noData} />
            <p style={{ color: "#c7c7c7" }}>{t("noEvents")}</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                paddingTop: "20px",
                direction: "ltr",
                minWidth: "800px",
              }}
            >
              <Timeline position="alternate">
                {data.map((elm, i) => (
                  <TimelineItem>
                    <TimelineOppositeContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{
                          position: "relative",
                          top: "5px",
                        }}
                      >
                        {elm.time}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="secondary"></TimelineDot>
                      {i != data.length - 1 ? (
                        <TimelineConnector className={classes.secondaryTail} />
                      ) : null}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper
                        elevation={3}
                        className={classes.paper}
                        style={{
                          position: "relative",
                          bottom: "20px",
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h1"
                          style={{ color: "white" }}
                        >
                          {elm.text}
                        </Typography>
                        <Typography style={{ color: "white" }}>
                          {elm.type}
                        </Typography>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
              {!disable ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <IconButton onClick={loadMore}>
                    <ExpandMoreIcon color="secondary" />
                  </IconButton>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <Card>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px",
        }}
      >
        <p
          style={{
            color: "#bfbec8",
            fontSize:
              window.localStorage.getItem("Language") == "en" ? "15px" : "22px",
          }}
        >
          <b>Events</b>
        </p>
        <TimelineIcon style={{ color: "#bfbec8" }} />
      </span>
      <div
        style={{
          height: "calc(100vh - 289px)",
          overflowY: "scroll",
          margin: "10px",
        }}
      >
        <Fragment>{ifLoaded(loader, eventsFn)}</Fragment>
      </div>
    </Card>
  );
}
