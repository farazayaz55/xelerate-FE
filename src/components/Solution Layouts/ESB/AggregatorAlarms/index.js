//-----------------CORE---------------//
import React, { Fragment, useEffect, useState } from "react";
//-----------------MUI---------------//
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
//-----------------MUI ICON---------------//
//-----------------EXTERNAL---------------//
import { useTranslation } from "react-i18next";
import SolutionInsights from "../Solution Insights/index";
import AlarmHealth from "../AlarmHealth";
import { useGetHealthQuery } from "services/devices";
import { useSelector } from "react-redux";
import Alarms from "../Solution Insights/Alarms";
import { useGetAlarmsCountQuery } from "services/alarms";
import { useGetNumOfAlarmsQuery } from "services/devices";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function AggregatorAlarms(props) {
  const filtersValue = useSelector((state) => state.filterDevice);
  const [groupId, setGroupId] = React.useState("");
  const [alarmsStats, setAlarmsStats] = useState({
    CRITICAL: {
      ACTIVE: 0,
      ACKNOWLEDGED: 0,
    },
    MAJOR: {
      ACTIVE: 0,
      ACKNOWLEDGED: 0,
    },
    MINOR: {
      ACTIVE: 0,
      ACKNOWLEDGED: 0,
    },
    WARNING: {
      ACTIVE: 0,
      ACKNOWLEDGED: 0,
    },
  });

  const { t } = useTranslation();

  const alarmsCounts = groupId
    ? useGetAlarmsCountQuery({
        token: window.localStorage.getItem("token"),
        status: '["ACTIVE","ACKNOWLEDGED"]',
        severity: '["CRITICAL","MAJOR","MINOR","WARNING"]',
        serviceId: props.group,
        groupId: groupId || "",
      })
    : useGetAlarmsCountQuery({
        token: window.localStorage.getItem("token"),
        status: '["ACTIVE","ACKNOWLEDGED"]',
        severity: '["CRITICAL","MAJOR","MINOR","WARNING"]',
        serviceId: props.group,
      });

  useEffect(() => {
    if (filtersValue.expanded.length > 0) {
      let id = filtersValue.selectedNodeChain[
        filtersValue.selectedNodeChain.length - 1
      ].split(":")[0];
      if (id && parseInt(id) != 0) {
        setGroupId(id);
      }
    } else {
      setGroupId("");
    }
  }, [filtersValue]);

  useEffect(() => {
    if (alarmsCounts.isSuccess) {
      setAlarmsStats(alarmsCounts.data.payload);
    }
  }, [alarmsCounts.isFetching]);

  function getPermission(chk) {
    let value;
    props.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  return (
    <Fragment>
      {/* <h1 sx={{ marginBottom: "20px" }}>AggregatorAlarms</h1> */}
      <Box sx={{ flexGrow: 2, marginTop: "10px" }}>
        <Grid className="alarmCardWrap" container spacing={2}>
          <Grid item xs={3}>
            <Item className="pieCard">
              <AlarmHealth
                asset={props.asset}
                id={props.group}
                toggleDrawer={() => {}}
              />
            </Item>
          </Grid>
          <Grid item xs>
            <Item className="criticalCard">
              <div className="cardHeader">Critical</div>
              <div className="cardBody">
                <div className="bodyLeft">
                  <div className="toDate">
                    <p>Total</p>
                    <span>
                      {alarmsStats?.CRITICAL?.ACKNOWLEDGED +
                        alarmsStats?.CRITICAL?.ACTIVE}
                    </span>
                  </div>
                  <div className="toMonth">
                    <p>Acknowledged</p>
                    <span>{alarmsStats?.CRITICAL?.ACKNOWLEDGED}</span>
                  </div>
                </div>
                <div className="bodyRight">
                  <div className="status">
                    <span>{alarmsStats?.CRITICAL?.ACTIVE}</span>
                    <p>Active</p>
                  </div>
                </div>
              </div>
            </Item>
          </Grid>
          <Grid item xs>
            <Item className="majorCard">
              <div className="cardHeader">Major</div>
              <div className="cardBody">
                <div className="bodyLeft">
                  <div className="toDate">
                    <p>Total</p>
                    <span>
                      {alarmsStats?.MAJOR?.ACKNOWLEDGED +
                        alarmsStats?.MAJOR?.ACTIVE}
                    </span>
                  </div>
                  <div className="toMonth">
                    <p>Acknowledged</p>
                    <span>{alarmsStats?.MAJOR?.ACKNOWLEDGED}</span>
                  </div>
                </div>
                <div className="bodyRight">
                  <div className="status">
                    <span>{alarmsStats?.MAJOR?.ACTIVE}</span>
                    <p>Active </p>
                  </div>
                </div>
              </div>
            </Item>
          </Grid>
          <Grid item xs>
            <Item className="minorCard">
              <div className="cardHeader">Minor</div>
              <div className="cardBody">
                <div className="bodyLeft">
                  <div className="toDate">
                    <p>Total</p>
                    <span>
                      {alarmsStats?.MINOR?.ACKNOWLEDGED +
                        alarmsStats?.MINOR?.ACTIVE}
                    </span>
                  </div>
                  <div className="toMonth">
                    <p>Acknowledged</p>
                    <span>{alarmsStats?.MINOR?.ACKNOWLEDGED}</span>
                  </div>
                </div>
                <div className="bodyRight">
                  <div className="status">
                    <span>{alarmsStats?.MINOR?.ACTIVE}</span>
                    <p>Active</p>
                  </div>
                </div>
              </div>
            </Item>
          </Grid>
          <Grid item xs>
            <Item className="warningsCard">
              <div className="cardHeader">Warnings</div>
              <div className="cardBody">
                <div className="bodyLeft">
                  <div className="toDate">
                    <p>Total</p>
                    <span>
                      {alarmsStats?.WARNING?.ACKNOWLEDGED +
                        alarmsStats?.WARNING?.ACTIVE}
                    </span>
                  </div>
                  <div className="toMonth">
                    <p>Acknowledged</p>
                    <span>{alarmsStats?.WARNING?.ACKNOWLEDGED}</span>
                  </div>
                </div>
                <div className="bodyRight">
                  <div className="status">
                    <span>{alarmsStats?.WARNING?.ACTIVE}</span>
                    <p>Active</p>
                  </div>
                </div>
              </div>
            </Item>
          </Grid>
        </Grid>
      </Box>
      {getPermission("Alarms") ||
      getPermission("Rule Management") ||
      getPermission("Controlling") ? (
        <div
          style={{
            minWidth: "550px",
            // width: "0%",
            direction: "ltr",
          }}
          className="alarmInverterCard"
        >
          <SolutionInsights
            title={t("Solution Insights")}
            id={props.group}
            history={props.history}
            sensors={props.sensors}
            actuators={props.actuators}
            alarms={getPermission("Alarms")}
            rules={getPermission("Rule Management")}
            controls={getPermission("Controlling")}
            groupId={groupId}
          />
        </div>
      ) : null}
    </Fragment>
  );
}
