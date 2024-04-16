import React, { Fragment, useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ColorSpectrum from "components/ServiceCreator/Dashboard/Color spectrum/Popup";
import { useSelector, useDispatch } from "react-redux";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useEditDeviceRagMutation } from "services/devices";
import { useSnackbar } from "notistack";
import SettingsIcon from "@mui/icons-material/Settings";

export default function ColorSettings(props) {
  const dispatch = useDispatch();
  const device = useSelector((state) => state.asset.device);
  const [openPopup, setOpenPopup] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [editDeviceRag, editDeviceRagResult] = useEditDeviceRagMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [updatedDeviceThresholds, setUpdatedDeviceThresholds] = useState(device.dataPointThresholds.find(d=>d.dataPoint == props.sensorId))
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if(editDeviceRagResult.isSuccess){
      if(editDeviceRagResult){
        setUpdatedDeviceThresholds(editDeviceRagResult.data.payload.dataPointThresholds.find(d=>d.dataPoint == props.sensorId))
      }
      showSnackbar("Device", "Colors updated successfully", "success", 1000)
      handlepopupClose()
    }
    if (editDeviceRagResult.isError){
      showSnackbar("Device", updated?.data?.message, "error", 1000);
    }
  }, [!editDeviceRagResult.isLoading])

  const handleReset = async () => {
    let token = window.localStorage.getItem("token");
    let body = {
      dataPointThresholds: [
        {
          dataPoint: props.sensorId,
          addFlag: false,
        },
      ],
    };
    editDeviceRag({ token, body, id: props.id });
  };

  const updateRag = async (values, reverse, customRange) => {
    let token = window.localStorage.getItem("token");

    let obj = {
      dataPoint: props.sensorId,
    };

    if (customRange) {
      obj.colorArray = values.customColors.map((e) => e.value);
      obj.ranges = values.customColors.map((e) => {
        let newValue = { ...e };
        delete newValue.value;
        return newValue;
      });
    } else {
      obj.colorArray = values.colors.map((e) => e.value);
      obj.min = values.min;
      obj.max = values.max;
      obj.reverse = reverse;
    }

    let body = {
      dataPointThresholds: [obj]
    };
    editDeviceRag({ token, body, id: props.id });
  };

  function handlepopupClose() {
    setOpenPopup(false);
  }

  function handlepopupOpen() {
    setOpenPopup(true);
  }

  return (
    <Fragment>
      <IconButton
        color="secondary"
        component="span"
        style={{
          height: "30px",
          width: "30px",
        }}
        onClick={() => {
          let color = updatedDeviceThresholds || (props.deviceColor ? props.deviceColor : props?.color);
          if (color){
            console.log({color})
            dispatch(
              setService({
                persist: {
                  ...serviceValue.persist,
                  dataPointThresholds: {
                    colors: color.colorArray.map((e, i) => ({
                      label: `Color ${i + 1}`,
                      value: e,
                    })),
                    customColors:
                      color?.ranges && color?.ranges.length
                        ? color.ranges.map((e, i) => ({
                            label: `Color ${i + 1}`,
                            value: color.colorArray[i],
                            min: e.min,
                            max: e.max,
                          }))
                        : [
                            {
                              label: "Color 1",
                              value: "#ff1001",
                              min: "0",
                              max: "33",
                            },
                            {
                              label: "Color 2",
                              value: "#febe00",
                              min: "34",
                              max: "66",
                            },
                            {
                              label: "Color 3",
                              value: "#03bd00",
                              min: "67",
                              max: "100",
                            },
                          ],
                    min: color.min,
                    max: color.max,
                    reverse: color.reverse,
                    customRange:
                      color?.ranges && color.ranges.length ? true : false,
                  },
                },
              })
            );
          }
          handlepopupOpen();
        }}
      >
        <SettingsIcon
          style={{
            height: "15px",
            width: "15px",
          }}
        />
      </IconButton>
      <ColorSpectrum
        close={handlepopupClose}
        state={openPopup}
        name={props.name}
        handleSubmit={updateRag}
        text={
          props?.color
            ? `Color Spectrum set on ${
                props.deviceColor ? "Device" : "Solution"
              }`
            : "No Color Spectrum set on Solution"
        }
        handleReset={Boolean(props.deviceColor) ? handleReset : false}
      />
    </Fragment>
  );
}
