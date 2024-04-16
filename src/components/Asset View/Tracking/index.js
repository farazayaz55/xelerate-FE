import React, { useState, useEffect, Fragment } from "react";
import mapboxgl from "mapbox-gl";
import Chip from "@mui/material/Chip";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import Map from "./map";
import Playback from "./Playback";
import Loader from "../../Progress";
import { useTranslation } from "react-i18next";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useGetLocationsQuery } from "services/locations";
import { setGeofence } from "rtkSlices/assetSlice";
import { useSelector, useDispatch } from "react-redux";
import { useGetRulesQuery } from "services/rules";
import { useParams } from "react-router-dom";
import RulesModal from "./RulesModal";
import { CircularProgress } from "@mui/material";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

export default function Devices(props) {
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const device = useSelector((state) => state.asset.device);
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const { id, tabId } = useParams();
  const [playbackTime, setPlaybackTime] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(),
  });
  const [viewState, setViewState] = useState("Live");
  const [selectedRule, setSelectedRule] = useState(null);
  const [openRulesModal, setOpenRulesModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [eventLoading, setEventLoading] = useState(false)

  const { t } = useTranslation();
  const locations = useGetLocationsQuery(
    { token, id: props.id },
    { skip: !props.permission }
  );

  const rules = useGetRulesQuery(
    { token, id },
    { skip: !props.permission }
  );

  useEffect(() => {
    if (rules.isSuccess) {
      console.log({ rules })
    }
  }, [rules.isFetching])

  function ifLoaded(state, component) {
    if (state) return <Loader top={"40vh"} />;
    else return component;
  }

  var tracking = (viewState) => {
    switch (viewState) {
      case "Live":
        return (
          <Map
            id={props.id}
            permission={props.permission}
            serviceId={props.serviceId}
          />
        );

      case "Playback":
        return (
          <Playback
            sensors={props.sensors}
            id={props.id}
            permission={props.permission}
            setPlaybackTime={setPlaybackTime}
            open={open}
            setOpen={setOpen}
            rule={selectedRule}
            resetRule={() => setSelectedRule(null)}
            loading={loading}
            setLoading={setLoading}
            eventLoading={eventLoading}
            setEventLoading={setEventLoading}
          />
        );

      default:
        break;
    }
  };

  const handleClick = (view) => {
    setViewState(view);
  };

  useEffect(() => {
    if (locations.isSuccess) {
      dispatch(setGeofence(locations.data.payload));
      setLoader(false);
    }
  }, [locations.isFetching]);



  return (
    <>
      {openRulesModal && rules?.data?.payload?.length > 0 && (
        <RulesModal
          open={openRulesModal}
          title={"Select a Rule to view Alarms"}
          handleClose={() => setOpenRulesModal(false)}
          rules={rules?.data?.payload}
          handleRuleSelect={(rule) => {
            if (rule._id == selectedRule?._id) {
              setOpenRulesModal(false)
            } else {
              setSelectedRule(rule);
              setOpenRulesModal(false);
            }
          }}
        />
      )}
      <div >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
            direction: "ltr",
          }}
        >
          <span
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            <div
              style={{
                direction:
                  window.localStorage.getItem("Language") == "ar" ? "rtl" : "ltr",
                display: "flex",
                gap: "10px",
              }}
            >
              {/* {!events.isLoading ? ( */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                {viewState != "Live" ? (
                  //  <IconButton
                  //   size="small"
                  //   onClick={()=>setOpen(true)}
                  // >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Chip
                      icon={loading ? <CircularProgress size={20} /> : <NotificationsActiveIcon size={6} />}
                      label={selectedRule ? selectedRule?.name : "Select a Rule to view Alarm"}
                      clickable
                      variant={"filled"}
                      color={selectedRule ? "success" : "default"}
                      onClick={() => {
                        if (!loading && !eventLoading) {
                          setOpenRulesModal(true)
                        }
                      }}
                    />
                    <Chip
                      icon={<AccessTimeIcon size={6} />}
                      label="Duration"
                      clickable
                      onClick={() => setOpen(true)}
                    />
                  </div>
                ) : // </IconButton>
                  null}
                <div style={{ opacity: "0.7", fontSize: 11 }}>
                  {viewState == "Live" ? (
                    <Fragment>
                      <div>Last Updated</div>
                      <div>
                        {new Date(device?.lastLocationUpdateTime).toLocaleString(
                          "en-GB"
                        )}
                      </div>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <div>{`Start: ${playbackTime.start.toLocaleString(
                        "en-GB"
                      )}`}</div>
                      <div>{`End:\u00A0\u00A0\u00A0${playbackTime.end.toLocaleString(
                        "en-GB"
                      )}`}</div>
                    </Fragment>
                  )}
                </div>
              </div>
              {/* ) : null} */}

              <Chip
                // disabled={events.isLoading}
                icon={
                  <ReplayIcon
                    fontSize="small"
                    style={{
                      position: "relative",
                      right:
                        window.localStorage.getItem("Language") == "ar"
                          ? "12px"
                          : "0px",
                    }}
                  />
                }
                onClick={() => {
                  handleClick("Playback");
                }}
                clickable
                label={
                  <span
                    style={{
                      fontSize:
                        window.localStorage.getItem("Language") == "en"
                          ? "13px"
                          : "16px",
                    }}
                  >
                    {t("playback")}
                  </span>
                }
                color="secondary"
                variant={viewState == "Playback" ? "filled" : "outlined"}
                style={{
                  color: viewState == "Playback" ? "white" : "",
                }}
              />
              <Chip
                icon={
                  <GpsFixedIcon
                    fontSize="small"
                    style={{
                      position: "relative",
                      right:
                        window.localStorage.getItem("Language") == "ar"
                          ? "12px"
                          : "0px",
                    }}
                  />
                }
                onClick={() => {
                  handleClick("Live");
                }}
                clickable
                label={
                  <span
                    style={{
                      fontSize:
                        window.localStorage.getItem("Language") == "en"
                          ? "13px"
                          : "16px",
                    }}
                  >
                    {t("live")}
                  </span>
                }
                color="secondary"
                variant={viewState == "Live" ? "filled" : "outlined"}
                style={{
                  color: viewState == "Live" ? "white" : "",
                }}
              />
            </div>
          </span>
        </div>
        <span>{ifLoaded(loader, tracking(viewState))}</span>
      </div>
    </>
  );
}
