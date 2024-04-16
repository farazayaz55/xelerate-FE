import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import AlarmCard from "./Card";
import { getSocket } from "Utilities/socket";

export default function Alarms(props) {
  async function initializeSocket(topics) {
    await getSocket(topics);
  }

  useEffect(() => {
    initializeSocket([
      `devices__${props.serviceId}__${props.id}`,
      `alarms__${props.serviceId}__${props.id}`,
    ]);
  }, []);

  return (
    <div
      style={{
        height: 'calc(100vh - 238px)',
        minHeight: 'calc(100vh - 300px)',
        overflowY: "scroll",
        paddingRight: "10px",
        paddingBottom: "10px",
      }}
    >
      <Grid container>
        {[
          { type: "CRITICAL", color: "#bf3535" },
          { type: "MAJOR", color: "#844204" },
          { type: "MINOR", color: "#ffa320" },
          { type: "WARNING", color: "#3399ff" },
        ].map((elm) => (
          <Grid item xs={12} sm={6} md={6}>
            <AlarmCard
              permission={props.permission}
              type={elm.type}
              id={props.id}
              color={elm.color}
              mode={props.mode}
              serviceId={props.serviceId}
              sensors={props.sensors}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
