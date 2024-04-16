import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import { Avatar, Select, MenuItem, Button } from "@mui/material";
import Cumulocity from "../../assets/img/cumulocity.png";
import Aws from "../../assets/img/aws.png";
import Azure from "../../assets/img/azure.png";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import "date-fns";
// import DateFnsUtils from "@date-io/date-fns";
import { Field, reduxForm } from "redux-form";
import NoImage from "assets/img/catalogue.jpg";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
}));

function Form() {
  const classes = useStyles();
  const [platformValue, setPlatformValue] = useState("cumulocity");
  const [platform, setPlatform] = useState(Cumulocity);
  const [selected, setSelected] = useState([]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  let fileInput;

  function handleImg(e) {
    // const fd = new FormData();
    // fd.append("image", e.target.files[0]);
    // setPreview(URL.createObjectURL(event.target.files[0]));
    // setLogo(e.target.files[0]);
  }

  var changePlatofrm = (e) => {
    var elm = e.target.value;
    switch (elm) {
      case "cumulocity":
        setPlatform(Cumulocity);
        break;
      case "aws":
        setPlatform(Aws);
        break;
      case "azure":
        setPlatform(Azure);
        break;
      default:
        break;
    }
    setPlatformValue(e.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
      }}
    >
      <form
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
        noValidate
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>License</h3>
        </div>
        <Card>
          <div style={{ margin: "20px" }}>
            <div>
              <span
                style={{ display: "flex", position: "relative", top: "5px" }}
              >
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "16px",
                    marginRight: "15px",
                  }}
                >
                  <Avatar
                    src={platform}
                    style={{
                      height: "30px",
                      width: "30px",
                      position: "relative",
                      top: "18px",
                    }}
                  />
                  <FormControl
                    style={{
                      marginLeft: "10px",
                      maxWidth: "140px",
                      minWidth: "140px",
                    }}
                  >
                    <InputLabel>Platform</InputLabel>
                    <Select
                      fullWidth
                      defaultValue="cumulocity"
                      onClick={changePlatofrm}
                      style={{ maxWidth: "140px", minWidth: "140px" }}
                    >
                      <MenuItem value={"cumulocity"}>Cumulocity IoT</MenuItem>
                      <MenuItem value={"aws"}>Amazon Web Services</MenuItem>
                      <MenuItem value={"azure"}>Microsoft Azure</MenuItem>
                    </Select>
                  </FormControl>
                </span>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Field
                    name="date"
                    component={({ input }) => {
                      return (
                        <KeyboardDatePicker
                          disabled={selected.length != 0}
                          margin="normal"
                          id="date-picker-dialog"
                          label="Date"
                          format="MM/dd/yyyy"
                          onChange={handleDateChange}
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                          style={{
                            paddingRight: "20px",
                            maxWidth: "210px",
                            minWidth: "210px",
                          }}
                          {...input}
                        />
                      );
                    }}
                  />
                  <Field
                    name="time"
                    component={({ input }) => {
                      return (
                        <KeyboardTimePicker
                          margin="normal"
                          keyboardIcon={<AccessTimeIcon />}
                          id="time-picker"
                          label="Time"
                          onChange={handleDateChange}
                          KeyboardButtonProps={{
                            "aria-label": "change time",
                          }}
                          style={{
                            maxWidth: "180px",
                            minWidth: "180px",
                          }}
                          {...input}
                        />
                      );
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <TextField type="number" label="No of Devices" />
              <TextField type="number" label="No of Users" />
              <TextField type="number" label="No of Services" />
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Devices</strong>
                </p>
                <Select style={{ maxWidth: "115px", minWidth: "115px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Users</strong>
                </p>
                <Select style={{ maxWidth: "135px", minWidth: "135px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Roles</strong>
                </p>
                <Select style={{ maxWidth: "135px", minWidth: "135px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Groups</strong>
                </p>
                <Select style={{ maxWidth: "115px", minWidth: "115px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Alarms</strong>
                </p>
                <Select style={{ maxWidth: "135px", minWidth: "135px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Monitoring</strong>
                </p>
                <Select style={{ maxWidth: "90px", minWidth: "90px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Events</strong>
                </p>
                <Select style={{ maxWidth: "115px", minWidth: "115px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Tracking</strong>
                </p>
                <Select style={{ maxWidth: "130px", minWidth: "130px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Controlling</strong>
                </p>
                <Select style={{ maxWidth: "90px", minWidth: "90px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>History</strong>
                </p>
                <Select style={{ maxWidth: "110px", minWidth: "110px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Analytics</strong>
                </p>
                <Select style={{ maxWidth: "115px", minWidth: "115px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Maintenance</strong>
                </p>
                <Select style={{ maxWidth: "90px", minWidth: "90px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Service Creator</strong>
                </p>
                <Select style={{ maxWidth: "105px", minWidth: "105px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Branding</strong>
                </p>
                <Select style={{ maxWidth: "95px", minWidth: "95px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
              <span style={{ display: "flex" }}>
                <p
                  style={{
                    position: "relative",
                    top: "5px",
                    marginRight: "10px",
                  }}
                >
                  <strong>Mockup</strong>
                </p>
                <Select style={{ maxWidth: "95px", minWidth: "95px" }}>
                  <MenuItem value={"disable"}>Disable</MenuItem>
                  <MenuItem value={"read"}>Read Only</MenuItem>
                  <MenuItem value={"full"}>Full Access</MenuItem>
                </Select>
              </span>
            </div>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              style={{
                color: "white",
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      </form>
      <form
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
        noValidate
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>Profile</h3>
        </div>
        <Card>
          <div style={{ cursor: "pointer" }} onClick={() => fileInput.click()}>
            <img src={NoImage} width="630px" height="268px" />
          </div>
          <input
            style={{ display: "none" }}
            type="file"
            ref={(e) => (fileInput = e)}
            onChange={handleImg}
          ></input>
          <div style={{ margin: "20px" }}>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <TextField required id="standard-required" label="Company" />
              <TextField required id="standard-required" label="Owner" />
              <TextField
                required
                type="number"
                id="standard-required"
                label="Phone No"
              />
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <TextField required id="standard-required" label="Username" />
              <TextField required id="standard-required" label="Password" />
              <TextField required id="standard-required" label="Tenant" />
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <TextField
                fullWidth
                required
                hrequired
                id="standard-required"
                label="Adress"
              />
              <FormControl
                style={{
                  maxWidth: "185px",
                  minWidth: "185px",
                }}
              >
                <InputLabel>Payment Method</InputLabel>
                <Select style={{ maxWidth: "185px", minWidth: "185px" }}>
                  <MenuItem value={"card"}>Card</MenuItem>
                  <MenuItem value={"cash"}>Cash</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              style={{
                color: "white",
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default reduxForm({
  form: "scheduler",
})(Form);
