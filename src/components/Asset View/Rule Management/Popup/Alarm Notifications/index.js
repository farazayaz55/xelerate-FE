import React, { Fragment } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import TextField from "@mui/material/TextField";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import InfoIcon from "@mui/icons-material/Info";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";

export default function Edit({
  form,
  payload,
  muteNotifications,
  open,
  setOpen,
}) {
  return (
    <Fragment>

    <div
      style={{
        height: "40vh",
        maxHeight: "380px",
        overflowY: "scroll",
      }}
    >
      <TextField
        disabled={true}
        id="number"
        variant="outlined"
        label="No sms Gateway integrated"
        fullWidth
        margin="dense"
        value={form.values.number}
        onChange={form.handleChange}
        helperText={"Hint: you can add multiple comma seperated numbers"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <PhoneAndroidIcon
                style={{
                  color: "grey",
                }}
              />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        id="email"
        label="Email"
        fullWidth
        margin="dense"
        value={form.values.email}
        onChange={form.handleChange}
        helperText={"Hint: you can add multiple comma seperated emails"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <MailOutlineIcon
                style={{
                  color: "grey",
                }}
              />
            </InputAdornment>
          ),
        }}
      />
       <TextField
        id="measures"
        variant="outlined"
        label="Prescriptive Measures"
        fullWidth
        multiline
        margin="dense"
        value={form.values.measures}
        onChange={form.handleChange}
        inputProps={{
          style: {
            height: "90px",
          },
        }}
      />
     
    </div>
    <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={form.values.repeatNotification}
                onChange={(e) => {
                  form.setFieldValue("repeatNotification", e.target.checked);
                }}
              />
            }
            label="Notify on each violation"
          />
          <Tooltip
            title="By default, notifications are only sent once however many times a rule is violated (until user clears the alarm). Enabling this switch will result in notifications being sent every time the rule violates even for same alarm and the count will increment on alarm card"
            placement="top"
            arrow
            TransitionComponent={Zoom}
          >
            <InfoIcon style={{ color: "#9f9f9f" }} />
          </Tooltip>
        </span>
        <Tooltip
          title={
            "Manage notifications suppression timetable"
          }
          placement="top"
          arrow
          TransitionComponent={Zoom}
        >
          <Button
            variant="outlined"
            startIcon={
              JSON.stringify(muteNotifications) == JSON.stringify(payload) ? (
                <ScheduleIcon color="secondary" fontSize="small" />
              ) : (
                <RunningWithErrorsIcon
                  sx={{ color: "#bf3535" }}
                  fontSize="small"
                />
              )
            }
            sx={{
              fontWeight:
                JSON.stringify(muteNotifications) == JSON.stringify(payload)
                  ? "normal"
                  : "bold",
              fontSize: 10,
              borderRadius: "6px !important",
              padding: "2px 10px !important",
              marginTop: "-5px",
            }}
            onClick={() => setOpen(!open)}
            color={
              JSON.stringify(muteNotifications) == JSON.stringify(payload)
                ? "secondary"
                : "error"
            }
          >
            Timetable
          </Button>
        </Tooltip>
      </div>
    </Fragment>
  );
}
