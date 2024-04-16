import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogActions, DialogContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

export default function Measures({ close, alarm }) {
  let time = new Date(alarm.time);
  const [fontSize, setFontSize] = React.useState(20);

  
  return (
    <Dialog
      open={true}
      onClose={close}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        style: {
          maxWidth: "40vw",
          width: "40vw",
        },
      }}
    >
      <DialogTitle
        id="form-dialog-title"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <span
          style={{
            display: "flex",
            gap: "5px",
          }}
        >
          <NotificationsActiveIcon
            style={{
              color:
                alarm.severity == "CRITICAL"
                  ? "#bf3535"
                  : alarm.severity == "MAJOR"
                  ? "#844204"
                  : alarm.severity == "MINOR"
                  ? "#fe9f1b"
                  : alarm.severity == "WARNING"
                  ? "#3399ff"
                  : "",
            }}
          />

          <Tooltip title={alarm.type} placement="bottom" arrow>
            <Typography
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "#999",
                opacity: "0.5",
                fontWeight: "bold",
              }}
            >
              {alarm.type}
            </Typography>
          </Tooltip>

          {alarm.status == "ACTIVE" || alarm.status == "ACKNOWLEDGED" ? (
            <Skeleton
              variant="circular"
              width={8}
              height={8}
              style={{
                backgroundColor:
                  alarm.status == "ACKNOWLEDGED" ? "orange" : "#bf3535",
                position: "relative",
                top: "7px",
              }}
            />
          ) : null}
        </span>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            fontSize: "17px",
            textOverflow: "ellipsis",
            fontWeight: "bold",
            color: "#999",
            opacity: "0.5",
          }}
        >
          {alarm.deviceName} ( {alarm.sensorId} )
        </div>
      </DialogTitle>

      <React.Fragment>
        <DialogContent style={{maxHeight:'170px', height:'170px'}}>

          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div
              style={{
                color: "lightgrey",
                fontSize: "14px",
                fontWeight: "bold",
                width:'85%'
              }}
            >
              Prescriptive Measures
            </div>
          <Box width={60} style={{display:'flex', gap:'5px', width:'15%'}}>
              <span style={{fontSize:'10px', color:'grey', width:'90%'}}>Font size </span>
              <Slider
                size="small"
                defaultValue={fontSize}
                aria-label="Small"
                onChange={(e)=>setFontSize(e.target.value)}
                max={40}
                min={20}
                valueLabelDisplay='off'
              />
            </Box>
          </div>
            <div
              style={{
                marginBottom: "20px",
                marginTop: "5px",
                fontSize,
                color: "#222",
                lineHeight:1
              }}
            >
              {alarm.measures}
            </div>
            
         
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#999",
              opacity: "0.5",
              marginLeft: "16px",
            }}
          >{`${time.toLocaleDateString(
            "en-GB"
          )} - ${time.toLocaleTimeString()}`}</div>
          <Button onClick={close} color="primary">
            Close
          </Button>
        </DialogActions>
      </React.Fragment>
    </Dialog>
  );
}
