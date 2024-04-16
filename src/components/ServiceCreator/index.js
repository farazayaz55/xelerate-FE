import React, { Fragment, useState } from "react";
import { makeStyles, withStyles } from "@mui/styles";
import clsx from "clsx";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import DoneIcon from "@mui/icons-material/Done";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsInputCompositeIcon from "@mui/icons-material/SettingsInputComposite";
import GrainIcon from "@mui/icons-material/Grain";
import StepConnector from "@mui/material/StepConnector";
import Card from "@mui/material/Card";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import InsightsIcon from '@mui/icons-material/Insights';
import Done from "./Done";
import Dashboard from "./Dashboard";
import Layout from "./Layout";
import Details from "./Details";
import Monitoring from "./Monitoring";
import Controlling from "./Controlling";
import Device from "./Devices";
import AssetComp from "./Asset";
import { useSelector } from "react-redux";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

function ColorlibStepIcon(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  console.log({metaDataValue})
  const useColorlibStepIconStyles = makeStyles({
    fab: {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      zIndex: 20,
    },
    root: {
      backgroundColor: "#ccc",
      zIndex: 1,
      color: "#fff",
      width: 50,
      height: 50,
      display: "flex",
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    active: {
      backgroundImage: `linear-gradient( 136deg, ${metaDataValue.branding.secondaryColor} 0%, ${metaDataValue.branding.secondaryColor} 50%, ${metaDataValue.branding.secondaryColor} 100%)`,
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    },
    completed: {
      backgroundImage: `linear-gradient( 136deg, ${metaDataValue.branding.secondaryColor} 0%, ${metaDataValue.branding.secondaryColor} 50%, ${metaDataValue.branding.secondaryColor} 100%)`,
    },
  });

  const classes = useColorlibStepIconStyles();
  const { active, completed } = props;
  const icons = {
    1: <FeaturedPlayListIcon />,
    2: <GrainIcon />,
    3: <AssessmentIcon />,
    4: <RadioButtonCheckedIcon />,
    5: <InsightsIcon />,
    6: <SettingsIcon />,
    7: <DashboardIcon />,
    8: <SettingsInputCompositeIcon />,
    9: <DoneIcon />,
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  button: {
    marginRight: "10px",
  },
  instructions: {
    marginTop: "10px",
    marginBottom: "10px",
  },
});

export default function CustomizedSteppers(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const serviceValue = useSelector((state) => state.serviceCreator);
  function getSteps() {
    return [
      "Key Info",
      "Asset",
      "Monitoring",
      "Controlling",
      "Value Insights",
      "Configurations",
      "Layout",
      "Device",
      "Done",
    ];
  }

  const ColorlibConnector = withStyles({
    alternativeLabel: {
      top: 22,
    },
    active: {
      "& $line": {
        backgroundImage: `linear-gradient( 95deg,${metaDataValue.branding.secondaryColor} 0%,${metaDataValue.branding.secondaryColor} 50%,${metaDataValue.branding.secondaryColor} 100%)`,
      },
    },
    completed: {
      "& $line": {
        backgroundImage: `linear-gradient( 95deg,${metaDataValue.branding.secondaryColor} 0%,${metaDataValue.branding.secondaryColor} 50%,${metaDataValue.branding.secondaryColor} 100%)`,
      },
    },
    line: {
      height: 3,
      border: 0,
      backgroundColor: "#eaeaf0",
      borderRadius: 1,
    },
  })(StepConnector);

  const classes = useStyles();
  const [svg, setSvg] = useState("");

  const steps = getSteps();

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <Details setSvg={setSvg} />;
      case 1:
        return <AssetComp />;
      case 2:
        return <Monitoring type={"datapoint"}/>;
      case 3:
        return <Controlling />;
      case 4:
        return <Monitoring type={"valueInsight"}/>;
      case 5:
        return <Dashboard sensors={props.sensors} />;
      case 6:
        return <Layout sensors={props.sensors} />;
      case 7:
        return <Device svg={svg} />;
      case 8:
        return <Done history={props.history} />;
      default:
        return null;
    }
  }

  const detailText = { 
    0: "Please fill out the required info and select the features you want to enable in the solution.",
    1: "Define appropriate image and name for your asset.",
    2: "Select data from the catalogue or create new data points that this solution should monitor.",
    3: "Select control features from the catalogue or create new ones that this solution should offer.",
    4: "Set Solution Dashboard settings.",
    5: `${serviceValue.name} has been created successfully, now lets add some devices.`,
  };

  return (
    <Fragment>
      {/* <Dialog
        open={openPopup3}
        onClose={handlepopupClose3}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to create a service with the selected
            parameters?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlepopupClose3} color="primary">
            Cancel
          </Button>
          <Button type="submit" onClick={proceed} color="primary">
            Proceed
          </Button>
        </DialogActions>
      </Dialog> */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Card style={{ width: "100%", padding: "20px" }}>
          <div className={classes.root}>
            <Stepper
              alternativeLabel
              activeStep={serviceValue.page}
              connector={<ColorlibConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>
                    {label != "Key Info" ? (
                      <p>{label}</p>
                    ) : (
                      <div>
                        <p>Key Info</p>
                        <p style={{ color: "#cccccc" }}>
                          {serviceValue.name != ""
                            ? `(${serviceValue.name})`
                            : ""}
                        </p>
                      </div>
                    )}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {detailText[serviceValue.page] ? (
              <div
                style={{
                  position: "absolute",
                  right: "185px",
                  color: "#555555",
                  cursor: "pointer",
                }}
              >
                <Tooltip
                  title={detailText[serviceValue.page]}
                  placement="left"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <InfoIcon />
                </Tooltip>
              </div>
            ) : null}

            <div>{getStepContent(serviceValue.page)}</div>
          </div>
        </Card>
      </div>
    </Fragment>
  );
}
