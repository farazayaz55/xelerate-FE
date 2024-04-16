//--------------CORE------------------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
//--------------MUI ICONS------------------------//
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
//--------------EXTERNAL------------------------//
import Accordion from "./Accordion";
import { useGetEventsQuery } from "services/events";
import Loader from "components/Progress";
import noData from "assets/img/no-data.png";

export default function Alarms(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const [disabled, setDisable] = useState(false);
  const [operations, setOperations] = useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(null);
  const [page, setPage] = useState(1);
  const device = useSelector((state) => state.asset.device);
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType) : null;
  const actuators = device.esbMetaData && device.esbMetaData.actuators && device.esbMetaData.actuators.length ? props.actuators.filter(s=>device.esbMetaData.actuators.includes(s.name)) : asset && asset.actuators ? asset.actuators : props.actuators;

  const operationsRes = useGetEventsQuery({
    token: window.localStorage.getItem("token"),
    params: `?pageSize=25&currentPage=${page}&withTotalPages=true&type=c8y_ControlUpdate&source=${
      props.id
    }&metaDataFilter={"metaData.actuatorName":{"$in":${JSON.stringify(
      actuators.map((e) => e.name)
    )}}}`,
  });

  useEffect(() => {
    if (operationsRes.isSuccess) {
      setTotalPages(operationsRes.data?.payload?.totalPages);
      if (page == 1) setOperations(operationsRes.data?.payload?.data);
      else setOperations([...operations, ...operationsRes.data?.payload?.data]);
      if (page >= operationsRes.data?.payload?.totalPages) {
        setDisable(true);
      }
    }
  }, [operationsRes.isFetching]);

  function handleMore() {
    if (page < totalPages) {
      setPage(page + 1);
      if (page + 1 >= totalPages) {
        setDisable(true);
      }
    }
  }

  function alarmsFn() {
    return (
      <Fragment>
        <div
          style={{
            width: "100%",
          }}
        >
          {operations.length == 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  width: "200px",
                }}
              >
                <img
                  style={{ maxWidth: "70%", maxHeight: "70%" }}
                  src={noData}
                />
              </div>
              <p style={{ color: "#c8c8c8" }}>No data found</p>
            </div>
          ) : (
            <Fragment>
              <div
                style={{
                  height: "calc(100vh - 100px)",
                  overflowY: "scroll",
                }}
              >
                {operations.map((elm, i) => (
                  <Accordion
                    expanded={expanded}
                    setExpanded={setExpanded}
                    index={i}
                    operation={elm}
                    permisson={props.permisson}
                    actuators={actuators}
                  />
                ))}
                {operations.length != 0 && !disabled ? (
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "15px",
                      position: "relative",
                      bottom: "10px",
                    }}
                  >
                    {operationsRes.isFetching ? (
                      <div
                        style={{
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          height: "25px",
                          width: "25px",
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <CircularProgress
                          size={20}
                          style={{ color: "white" }}
                        />
                      </div>
                    ) : (
                      <IconButton
                        color="secondary"
                        onClick={handleMore}
                        style={{
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <KeyboardArrowDownIcon
                          style={{
                            cursor: "pointer",
                            height: "20px",
                            width: "20px",
                            color: "white",
                          }}
                        />
                      </IconButton>
                    )}
                  </span>
                ) : null}
              </div>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {operationsRes.isSuccess ? (
          alarmsFn()
        ) : (
          <div
            style={{
              display: "flex",
              height: "calc(100vh - 500px)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader />
          </div>
        )}
      </div>
    </Fragment>
  );
}
