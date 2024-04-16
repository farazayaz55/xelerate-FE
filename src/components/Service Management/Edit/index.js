import React, { Fragment, useState, useEffect } from "react";
import { makeStyles, withStyles } from "@mui/styles";
import clsx from "clsx";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsInputCompositeIcon from "@mui/icons-material/SettingsInputComposite";
import GrainIcon from "@mui/icons-material/Grain";
import StepConnector from "@mui/material/StepConnector";
import Card from "@mui/material/Card";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { useGetSpecificRoleQuery } from "services/roles";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InsightsIcon from "@mui/icons-material/Insights";
import Details from "components/ServiceCreator/Details";
import Monitoring from "components/ServiceCreator/Monitoring";
import Controlling from "components/ServiceCreator/Controlling";
import Dashboard from "components/ServiceCreator/Dashboard";
import Layout from "components/ServiceCreator/Layout";
import AssetComp from "components/ServiceCreator/Asset";
import { useSelector, useDispatch } from "react-redux";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { setService, resetService } from "rtkSlices/ServiceCreatorSlice";
import { useEditServiceMutation } from "services/services";
import { useUpdateServicesMutation } from "services/roles";
import { useSnackbar } from "notistack";
import Keys from "Keys";
import { setRole } from "rtkSlices/metaDataSlice";
import SettingsIcon from "@mui/icons-material/Settings";

function ColorlibStepIcon(props) {
  const metaDataValue = useSelector((state) => state.metaData);
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
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const selectedTags = useSelector((state) => state.selectedTags);
  const filteredServices = useSelector((state) => state.filteredServices);
  const [updateServices, updateServicesResult] = useUpdateServicesMutation();
  const [editService, editServiceResult] = useEditServiceMutation();
  const { enqueueSnackbar } = useSnackbar();
  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !updateServicesResult.isSuccess,
  });
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if (editServiceResult.isSuccess) {
      let tempTabs = {
        location: serviceValue.metaData.location,
        maintenance: serviceValue.metaData.maintenance,
        videoAnalytics: serviceValue.metaData.videoAnalytics,
        digitalTwin: serviceValue.metaData.digitalTwin,
      };

      let dynamicTabs = [
        { key: "maintenance", name: "Rule Management" },
        { key: "location", name: "Tracking" },
        { key: "videoAnalytics", name: "Video Analytics" },
        { key: "digitalTwin", name: "Digital Twin" },
      ];
      let tabs = metaDataValue.services.find(
        (s) => s.id == serviceValue.serviceId
      ).tabs;
      let serviceTabs = [];
      dynamicTabs.forEach((r) => {
        if (!tabs.find((t) => t.name == r.name) && tempTabs[r.key] == true) {
          serviceTabs.push({
            name: r.name,
            permission: "ALL",
            addFlag: "true",
          });
        }
        if (tabs.find((t) => t.name == r.name) && tempTabs[r.key] == false) {
          serviceTabs.push({ name: r.name, addFlag: "false" });
        }
      });
      let body = {
        service: {
          serviceId: serviceValue.serviceId,
          tabs: serviceTabs,
        },
      };
      updateServiceForRoles(body);

      showSnackbar(
        "Solution",
        editServiceResult.data?.message,
        "success",
        1000
      );
      dispatch(resetService());
      //
    }
    if (editServiceResult.isError) {
      showSnackbar(
        "Solution",
        editServiceResult.error?.data?.message,
        "error",
        1000
      );
      dispatch(
        setService({
          page: 0,
        })
      );
    }
  }, [editServiceResult]);

  async function updateServiceForRoles(body) {
    let updated = await updateServices({
      token,
      id: window.localStorage.getItem("role"),
      body,
    });
  }

  useEffect(() => {
    if (roleRes.isSuccess) {
      dispatch(setRole(roleRes.data.payload));
      props.setSelected(null);
    }
  }, [roleRes.isFetching]);

  useEffect(() => {
    return () => {
      dispatch(resetService());
    };
  }, []);
  const modifyAssetMapping = (assetMappingArray) => {
    return assetMappingArray.map((item) => {
      // Modify the assetType property
      const modifiedItem = {
        assetId: item.assetType._id,
        actuators: item.actuators.map((obj) => obj._id),
        sensors: item.sensors
          ? item.sensors
              .filter((sensor) => sensor.typeValue === "datapoint")
              .map((datapointSensor) => datapointSensor._id)
          : [], // Filter sensors with typeValue "datapoint"
        valueInsights: item.sensors
          ? item.sensors
              .filter((sensor) => sensor.typeValue === "valueInsight")
              .map((datapointSensor) => datapointSensor._id)
          : [], // Add the valueInsights property
      };

      return modifiedItem;
    });
  };
  const modifyAssetToMultipleAssets = (
    assetId,
    actuators,
    sensors,
    valueInsights
  ) => {
    const modifiedItem = {
      assetId: assetId,
      actuators: actuators,
      sensors: sensors
        ? sensors
            .filter((sensor) => sensor.typeValue === "datapoint")
            .map((datapointSensor) => datapointSensor._id)
        : [], // Filter sensors with typeValue "datapoint"
      valueInsights: sensors
        ? sensors
            .filter((sensor) => sensor.typeValue === "valueInsight")
            .map((datapointSensor) => datapointSensor._id)
        : [],
    };
    return [modifiedItem];
  };
  useEffect(() => {
    console.log("props", props);

    if (props.selected) {
      let configuredAssets = [];
      if (
        props.selected?.configuredAssets &&
        props.selected?.configuredAssets.length
      ) {
        configuredAssets = props.selected?.configuredAssets;
      }
      let configuredActuators = [];
      if (props.selected?.configuredActuators) {
        configuredActuators = props.selected?.configuredActuators;
      }
      let configuredSensors = [];
      if (props.selected?.configuredSensors) {
        configuredSensors = props.selected?.configuredSensors;
      }
      let assetMapping = [];
      if (props.selected?.assetMapping && props.selected?.assetMapping.length) {
        assetMapping = modifyAssetMapping(props.selected?.assetMapping);
      }
      console.log(props.selected);
      let tags = [];
      let meta = [];
      props.selected.tags.forEach((elm) => {
        tags.push(elm._id);
      });
      props.selected.metaTags?.forEach((elm) => {
        meta.push(elm._id);
      });
      let actuator = [];
      props.selected.configuredActuators.forEach((elm) => {
        actuator.push(elm._id);
      });
      let sensors = [];
      props.selected.configuredSensors.forEach((elm) => {
        sensors.push(elm._id);
      });
      let datapoints = [];
      props.selected.configuredSensors.forEach((elm) => {
        datapoints.push({
          id: elm._id,
          name: elm.name,
          friendlyName: elm.friendlyName,
        });
      });
      let dataPointThresholds = [];
      if (props.selected?.dataPointThresholds)
        dataPointThresholds = props.selected.dataPointThresholds.map((e) => {
          let res = { ...e };
          res.dataPoint = e.dataPoint?._id;
          return res;
        });
      let metaData;
      if (typeof props.selected.metaData === "string")
        metaData = JSON.parse(props.selected.metaData);
      else metaData = props.selected.metaData;
      let tabs = metaData.tabs;
      dispatch(
        setService({
          serviceId: props.selected._id,
          name: props.selected.name,
          duration: props.selected?.duration,
          vanish: props.selected?.vanish ? props.selected?.vanish : false,
          devPrompt: props.selected?.devicePrompt
            ? props.selected?.devicePrompt
            : false,
          description: props.selected.description,
          parentChildEnabled: props.selected.parentChildEnabled,
          tags: tags,
          cover: props.selected.logoPath,
          svg: tabs.digitalTwin.svg,
          meta,
          asset: configuredAssets.length
            ? configuredAssets.map((obj) => obj._id)
            : [props.selected.configuredAsset._id],

          actuator: actuator,
          configuredAssets: configuredAssets.length
            ? configuredAssets
            : [props.selected.configuredAsset._id],
          configuredActuators: configuredActuators,
          configuredSensors: configuredSensors,
          assetMapping: assetMapping.length
            ? assetMapping
            : modifyAssetToMultipleAssets(
                props.selected.configuredAsset._id,
                actuator,
                props.selected.configuredSensors
              ),
          defaultLocation: props.selected.defaultLocation,
          monitoring: sensors,
          datapoints: datapoints,
          widgetDatapoints: props.selected.widgetDatapoints || {},
          dataPointThresholds: dataPointThresholds,
          metaData: {
            location: tabs.location,
            maintenance: tabs.maintenance,
            videoAnalytics: tabs.videoAnalytics,
            digitalTwin: tabs.digitalTwin.value,
          },
          map: props.selected?.layout?.map
            ? props.selected?.layout?.map
            : serviceValue.map,
          layout: props.selected.layout?.dashboardView || serviceValue.layout,
          trend: props.selected.trend,
          persist: {
            ...serviceValue.persist,
            tags: [],
            meta: props.selected.metaTags,
            cover: props.selected.logoPath
              ? `${Keys.baseUrl}/servicecreator/service/${props.selected.logoPath}`
              : null,
          },
        })
      );
      setLoader(false);
    }
  }, [props.selected]);

  const classes = useStyles();
  const [loader, setLoader] = React.useState(true);

  const steps = getSteps();

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Details
            edit
            setSelected={props.setSelected}
            handleSave={handleSave}
          />
        );
      case 1:
        return (
          <AssetComp
            edit
            setSelected={props.setSelected}
            handleSave={handleSave}
          />
        );
      case 2:
        return (
          <Monitoring
            edit
            setSelected={props.setSelected}
            handleSave={handleSave}
            type={"datapoint"}
          />
        );
      case 3:
        return (
          <Controlling
            edit
            setSelected={props.setSelected}
            handleSave={handleSave}
          />
        );
      case 4:
        return (
          <Monitoring
            edit
            setSelected={props.setSelected}
            handleSave={handleSave}
            type={"valueInsight"}
          />
        );
      case 5:
        return (
          <Dashboard
            edit
            sensors={props.sensors}
            handleSave={handleSave}
            id={props.selected._id}
          />
        );
      case 6:
        return (
          <Layout
            edit
            sensors={props.sensors}
            handleSave={handleSave}
            id={props.selected._id}
            dashboardView={props?.selected?.layout?.dashboardView}
            widgetDatapoints={props?.selected?.widgetDatapoints}
          />
        );
      default:
        return null;
    }
  }

  async function handleSave() {
    let metaData = {};
    metaData.tabs = {
      location: serviceValue.metaData.location,
      maintenance: serviceValue.metaData.maintenance,
      videoAnalytics: serviceValue.metaData.videoAnalytics,
      digitalTwin: {
        value: serviceValue.metaData.digitalTwin,
        svg: serviceValue.svg,
      },
    };

    if (
      serviceValue.layout == 1 &&
      (!metaData.tabs.digitalTwin || !metaData.tabs.digitalTwin.value)
    ) {
      metaData.tabs.digitalTwin = {
        value: true,
        svg: "test-svg",
      };
    }
    const assetMapping = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );
    console.log('serviceValue.trend',serviceValue.trend)
    // Replace Default data point if it is removed from datapoints
    let trend = serviceValue?.trend && JSON.parse(JSON.stringify(serviceValue.trend));
    if (
      serviceValue.trend?.defaultDatapoint &&
      serviceValue.trend?.defaultDatapoint?.id
    ) {
      const foundSensor = serviceValue.configuredSensors.find(
        (sensor) =>
          (sensor?.id || sensor?._id) ===
            serviceValue.trend?.defaultDatapoint?.id &&
          sensor.typeValue === "datapoint"
      );

      const resultSensor =
        foundSensor ||
        serviceValue.configuredSensors.find(
          (sensor) => sensor.typeValue === "datapoint"
        );
      trend.defaultDatapoint = {
        id: resultSensor?.id || resultSensor._id,
        name: resultSensor.name,
      };
    }
    let missingAssets = false;
    serviceValue.asset.forEach((assetId) => {
      const matchingAsset = assetMapping.find(
        (asset) => asset.assetId === assetId
      );

      if (
        !matchingAsset ||
        !matchingAsset.sensors ||
        matchingAsset.sensors.length === 0
      ) {
        if(!missingAssets){
          missingAssets = true;
          showSnackbar(
            "Solution",
            "Please select atleast 1 datapoint for each asset",
            "error",
            1000
          );
        }
        return;
      }
    });
    if (missingAssets) {
      return;
    }
    // Merging value insights to sensors and removing it
    // Also replacing assetId with assetType
    for (var i = 0; i < assetMapping.length; i++) {
      var object = assetMapping[i];
      if (!object.sensors || !object.sensors.length) {
        showSnackbar(
          "Solution",
          "Please select atleast 1 datapoint for each asset",
          "error",
          1000
        );
        return;
      }
      object.sensors = object.sensors.concat(object.valueInsights);
      object.assetType = object.assetId;
      delete object.assetId;
      delete object.valueInsights;
    }
    let body = {
      name: serviceValue.name,
      description: serviceValue.description,
      tags: serviceValue.tags,
      configuredSensors: serviceValue.configuredSensors.map(function (obj) {
        return obj.id || obj._id;
      }),
      configuredActuators: serviceValue.configuredActuators.map(function (obj) {
        return obj.id || obj._id;
      }),
      metaData: metaData,
      configuredAsset: serviceValue.asset[0],
      configuredAssets: serviceValue.asset,
      assetMapping: assetMapping,
      dataPointThresholds: serviceValue.dataPointThresholds,
      parentChildEnabled: serviceValue.parentChildEnabled,
      // metaTags: serviceValue.meta,
      layout: { map: serviceValue.map, dashboardView: serviceValue.layout },
      widgetDatapoints: serviceValue.widgetDatapoints,
      trend: trend,
      defaultLocation: serviceValue.defaultLocation,
    };

    if (serviceValue.vanish) {
      body.vanish = serviceValue.vanish;
      body.devicePrompt = serviceValue.devPrompt;
      body.duration = serviceValue.duration;
    } else {
      body.vanish = serviceValue.vanish;
    }

    if (serviceValue.cover) body.logoPath = serviceValue.cover;
    editService({
      token,
      id: serviceValue.serviceId,
      body,
    });
  }

  const detailText = {
    0: "Please fill out the required info and select the features you want to enable in the solution.",
    1: "Define appropriate image and name for your asset.",
    2: "Select data from the catalogue or create new data points that this solution should monitor.",
    3: "Select control features from the catalogue or create new ones that this solution should offer.",
    4: "Set Solution Dashboard settings.",
  };

  return (
    <Fragment>
      {loader ? null : (
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
      )}
    </Fragment>
  );
}
