import React, { useState } from "react";
import FiberPinIcon from "@mui/icons-material/FiberPin";
import { CardContent, Button, InputAdornment, TextField } from "@mui/material";
import Card from "../Card/Card.js";
import CardHeader from "../Card/CardHeader.js";
import CardIcon from "../Card/CardIcon.js";
import BackupIcon from "@mui/icons-material/Backup";
import "./superAdmin.css";
import Background from "../../assets/img/login.jpg";
import Logo from "../../assets/img/x.png";

var sectionStyle = {
  backgroundImage: `url(${Background})`,
  backgroundSize: "cover",
};

export default function Login(props) {
  const [pem, setPem] = React.useState("");

  let fileInput;

  function handlePin(e) {
    setPem(e.target.files[0].name);
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };

  function handleUserName(e) {
    if (e.target.value == "") {
      setValues({
        ...values,
        msgUsername: "Required Field",
        errorUsername: true,
      });
    }
    // else if (
    //   e.target.value &&
    //   !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(e.target.value)
    // ) {
    //   setValues({
    //     ...values,
    //     msgUsername: "Invalid Email",
    //     errorUsername: true,
    //   });
    // }
    else {
      setValues({
        ...values,
        msgUsername: "",
        errorUsername: false,
      });
    }
    setUseraName(e.target.value);
  }

  function handlePassword(e) {
    if (e.target.value == "") {
      setValues({
        ...values,
        msgPassword: "Required Field",
        errorPassword: true,
      });
    } else {
      setValues({
        ...values,
        msgPassword: "",
        errorPassword: false,
      });
    }
    setPassword(e.target.value);
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  var onSubmit = async () => {
    let tempError = {};
    if (userName == "") {
      tempError.errorUsername = true;
      tempError.msgUsername = "Required Field";
    }
    if (password == "") {
      tempError.errorPassword = true;
      tempError.msgPassword = "Required Field";
    }
    setValues({ ...values, ...tempError });
    if (Object.keys(tempError).length < 1) {
      await props.Signin(userName, password);
      if (!props.res.login.success[0]) {
        setValues({
          ...values,
          msgUsername: "",
          msgPassword: props.res.login.message[0],
          errorUsername: true,
          errorPassword: true,
        });
      } else if (
        props.res.login.success[0] &&
        window.localStorage.getItem("token") != ""
      ) {
        // window.localStorage.setItem("tenant", "");
        let role = props.res.login.payload[0].role;
        await props.getOne(role);
        if (props.res3.getOne.success[0]) {
          let services = props.res3.getOne.payload[0]?.services;
          let apps = [{ name: "Services" }, { name: "Notifications" }];
          apps = apps.concat(props.res3.getOne.payload[0]?.modules);
          let metaData = {};
          let arr = [
            {
              name: "Services",
              path: "catalogue",
              layout: "/solutions/",
            },
          ];
          let admin = [];
          let serviceCreator = [];
          let settings = [];
          let serviceEnablement = [];
          props.res3.getOne.payload[0]?.modules.forEach((elm) => {
            switch (elm.name) {
              case "Administration":
                elm.tabs.forEach((tab) => {
                  let path;
                  let chk = tab.name;
                  while (chk.indexOf(" ") != -1) {
                    chk =
                      chk.slice(1, chk.indexOf(" ")) +
                      chk.slice(chk.indexOf(" ") + 1);
                  }
                  path = tab.name[0].toLowerCase() + chk;
                  admin.push({
                    path: path,
                    name: tab.name,
                    layout: "/administration/",
                    permission: tab.permission,
                  });
                });
                break;
              case "Solution Enablement":
                elm.tabs.forEach((tab) => {
                  let path;
                  let chk = tab.name;
                  while (chk.indexOf(" ") != -1) {
                    chk =
                      chk.slice(1, chk.indexOf(" ")) +
                      chk.slice(chk.indexOf(" ") + 1);
                  }
                  path = tab.name[0].toLowerCase() + chk;
                  serviceEnablement.push({
                    path: path,
                    name: tab.name,
                    layout: "/solutionEnablement/",
                    permission: tab.permission,
                  });
                });
                break;
              case "Solution Management":
                elm.tabs.forEach((tab) => {
                  let path;
                  let chk = tab.name;
                  while (chk.indexOf(" ") != -1) {
                    chk =
                      chk.slice(1, chk.indexOf(" ")) +
                      chk.slice(chk.indexOf(" ") + 1);
                  }
                  path = tab.name[0].toLowerCase() + chk;
                  serviceCreator.push({
                    path: path,
                    name: tab.name,
                    layout: "/solutionManagement/",
                    permission: tab.permission,
                  });
                });
                break;
              case "Settings":
                elm.tabs.forEach((tab) => {
                  let path;
                  let chk = tab.name;

                  if (chk.indexOf(" ") != -1) {
                    while (chk.indexOf(" ") != -1) {
                      chk =
                        chk.slice(1, chk.indexOf(" ")) +
                        chk.slice(chk.indexOf(" ") + 1);
                    }
                  } else {
                    chk = chk.slice(1);
                  }
                  path = tab.name[0].toLowerCase() + chk;
                  settings.push({
                    path: path,
                    name: tab.name,
                    layout: "/settings/",
                    permission: tab.permission,
                  });
                });
                break;
              default:
                break;
            }
          });
          services.forEach((elm) => {
            if (elm.details) {
              let service = elm.details;
              let serviceName = service.name;
              let id = service._id;
              let tracking = service.location;
              let maintenance = service.maintenance;
              let path;
              let description = service.description;
              let chk = serviceName;
              while (chk.indexOf(" ") != -1) {
                chk =
                  chk.slice(0, chk.indexOf(" ")) +
                  chk.slice(chk.indexOf(" ") + 1);
              }
              chk = chk.slice(1);
              path = serviceName[0].toLowerCase() + chk;
              let sensors = [];
              let switches = [];
              let multilevel = [];
              service.configuredSensors.forEach((sensor) => {
                if (sensor.type == "SENSOR") sensors.push(sensor.name);
                else if (sensor?.actuatorType == "SWITCH")
                  switches.push({ name: sensor.name, levels: sensor.levels });
                else if (sensor?.actuatorType == "MULTILEVEL")
                  multilevel.push({ name: sensor.name, levels: sensor.levels });
              });
              arr.push({
                name: serviceName,
                id: id,
                description: description,
                sensors: sensors,
                switches: switches,
                multilevel: multilevel,
                tracking: tracking,
                pm: maintenance,
                path: `${path}`,
                layout: "/solutions/",
                icon: "manager",
                tabs: elm.tabs,
              });
            }
          });
          metaData.services = arr;
          metaData.serviceEnablement = serviceEnablement;
          metaData.apps = apps;
          metaData.admin = admin;
          metaData.serviceCreator = serviceCreator;
          metaData.settings = settings;
          metaData.role = role;
          metaData.branding = {
            Logo: null,
            primaryColor: "#3399ff",
            secondaryColor: "#3399ff",
          };
          window.localStorage.setItem("Language", "en");
          setTimeout(function () {
            window.location.reload();
          }, 1000);
        } else {
          window.localStorage.setItem("token", "");
          setSnackType("fail");
          setSnackText(props.res3.getOne.message[0]);
          setSnack(true);
        }
      }
    }
  };

  return (
    <section style={sectionStyle}>
      {/* <Snackbar
        type={snackType}
        open={snack}
        setOpen={handleClose}
        text={snackText}
        timeOut={3000}
      /> */}
      <div className="center">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100px",
            width: "300px",
          }}
        >
          <img src={Logo} />
        </div>
        <div className="card">
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <FiberPinIcon />
              </CardIcon>
            </CardHeader>
            <CardContent>
              <form>
                <div className="marg">
                  <TextField
                    fullWidth
                    disabled
                    label="Upload PEM File"
                    variant="outlined"
                    value={pem}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <BackupIcon
                            className="upload"
                            onClick={() => fileInput.click()}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <input
                  style={{ display: "none" }}
                  type="file"
                  ref={(e) => (fileInput = e)}
                  onChange={handlePin}
                ></input>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  style={{
                    color: "white",
                  }}
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
