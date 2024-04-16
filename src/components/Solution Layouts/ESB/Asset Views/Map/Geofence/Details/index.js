import React from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Fragment } from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";

let alarmTypes = [
  { name: "CRITICAL", color: "#e73e3a" },
  { name: "MAJOR", color: "#844204" },
  { name: "MINOR", color: "#fc9208" },
  { name: "WARNING", color: "#278dea" },
];

export default function Edit({ form, ...props }) {
  function handleKeyDown(e) {
    if ([69, 187, 188, 189].includes(e.keyCode)) {
      e.preventDefault();
      return;
    }
  }

  function handleClick(value) {
    form.setFieldValue("severity", value);
  }

  return (
    <div
      style={{
        height: "40vh",
        maxHeight: "380px",
        overflowY: "scroll",
      }}
    >
      <TextField
        id="name"
        required
        label="Name"
        variant="outlined"
        margin="dense"
        error={form.touched.name && form.errors.name}
        value={form.values.name}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        helperText={form.touched.name ? form.errors.name : ""}
        fullWidth
      />

      <TextField
        id="address"
        label="Address"
        variant="outlined"
        margin="dense"
        error={form.touched.address && form.errors.address}
        value={form.values.address}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        helperText={form.touched.address ? form.errors.address : ""}
        fullWidth
      />

      <FormControl fullWidth margin="dense">
        <InputLabel>Alarms On *</InputLabel>
        <Select
          fullWidth
          label="Alarms On *"
          name="alarmOn"
          required
          value={form.values.alarmOn}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        >
          <MenuItem value={"entry"}>{"Entry"}</MenuItem>;
          <MenuItem value={"exit"}>{"Exit"}</MenuItem>;
          <MenuItem value={"both"}>{"Both"}</MenuItem>;
        </Select>
      </FormControl>

      {!props.row ? (
        <div
          style={{
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          {alarmTypes.map((alarm) => {
            return (
              <Chip
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      form.values.severity == alarm.name
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick(alarm.name);
                }}
                clickable
                label={alarm.name}
                style={
                  form.values.severity == alarm.name
                    ? {
                        color: "white",
                        backgroundColor: alarm.color,
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
