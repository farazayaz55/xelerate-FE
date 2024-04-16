//----------------CORE-----------------//
import React, { Fragment } from "react";
import { setService, resetColor } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
//----------------MUI-----------------//
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";
//----------------MUI ICONS-----------------//
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
//----------------EXTERNAL-----------------//
import Popup from "./Popup";

export default function Catalogue() {
  const dispatch = useDispatch();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const metaDataValue = useSelector((state) => state.metaData);
  let service = metaDataValue.services.find(s=>s.id == serviceValue.serviceId)
  const [openPopup, setOpenPopup] = React.useState(false);
  const [temp, setTemp] = React.useState(null);
  const [datapointName, setDatapointName] = React.useState(
    (serviceValue?.dataPointThresholds).map((e) => e.dataPoint)
  );
  console.log({serviceValue})
  console.log({datapointName})

  function handlepopupClose() {
    setOpenPopup(false);
  }

  function handlepopupOpen() {
    setOpenPopup(true);
  }

  function findName(name) {
    let sensor = serviceValue.datapoints.find((g) => g.id == name);
    if (sensor) return sensor.friendlyName;
    else return "";
  }

  function handleSubmit(values, reverse, customRange) {
    let newData =  [...serviceValue.dataPointThresholds] ; 

    let chk = newData.findIndex((e) => e.dataPoint == temp);

    if (chk != -1) {
      newData.splice(chk, 1);
    }

    let body = {
      dataPoint: temp,
    };

    if (customRange) {
      body.colorArray = values.customColors.map((e) => e.value);
      body.ranges = values.customColors.map((e) => {
        let newValue = { ...e };
        delete newValue.value;
        return newValue;
      });
    } else {
      body.colorArray = values.colors.map((e) => e.value);
      body.min = values.min;
      body.max = values.max;
      body.reverse = reverse;
    }

    newData = [...newData, body];

    dispatch(
      setService({
        dataPointThresholds: newData,
      })
    );
    setDatapointName(newData.map((e) => e.dataPoint));
    handlepopupClose();
  }

  const handleDatapoint = (chk, val) => {
    if (chk) {
      setTemp(val.id);
      handlepopupOpen();
    } else {
      let newData = [...serviceValue.dataPointThresholds];
      newData = newData.filter((e) => e.dataPoint != val.id);
      dispatch(
        setService({
          dataPointThresholds: newData,
        })
      );
      setDatapointName(newData.map((e) => e.dataPoint));
    }
  };

  return (
    <>
      <Popup
        close={handlepopupClose}
        state={openPopup}
        name={findName(temp)}
        handleSubmit={handleSubmit}
      />
      <FormControl
        sx={{
          m: 1,
          width: "100%",
          marginTop: "20px",
          position: "relative",
          right: "8px",
        }}
      >
        <InputLabel id="demo-multiple-checkbox-label">
          Color spectrum mapping
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={datapointName}
          input={
            <OutlinedInput
              label="Color spectrum mapping"
              style={{ marginBottom: "10px" }}
            />
          }
          renderValue={(selected) => {
            return selected
              .filter((e) => serviceValue.datapoints.find((g) => g.id == e))
              .map(
                (e) =>
                  serviceValue.datapoints.find((g) => g.id == e)?.friendlyName
              )
              .join(", ");
          }}
        >
          {serviceValue.datapoints?.map((elm, i) => (
            <Fragment>
              <div
                key={i}
                value={elm.id}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  marginTop: "10px",
                }}
              >
                <p>{elm.friendlyName}</p>
                <span>
                  {datapointName.indexOf(elm.id) > -1 ? (
                    <Fragment>
                      <EditIcon
                        color="secondary"
                        style={{
                          height: "18px",
                          width: "18px",
                          margin: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          let found = (serviceValue.dataPointThresholds).find(
                            (e) => e.dataPoint == elm.id
                          );
                          dispatch(
                            setService({
                              persist: {
                                ...serviceValue.persist,
                                dataPointThresholds: {
                                  colors: found.colorArray.map((e, i) => ({
                                    label: `Color ${i + 1}`,
                                    value: e,
                                  })),
                                  customColors:
                                    found?.ranges && found?.ranges.length
                                      ? found.ranges.map((e, i) => ({
                                          label: `Color ${i + 1}`,
                                          value: found.colorArray[i],
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
                                  min: found.min,
                                  max: found.max,
                                  reverse: found.reverse,
                                  customRange:
                                    found?.ranges && found.ranges.length
                                      ? true
                                      : false,
                                },
                              },
                            })
                          );
                          handleDatapoint(true, elm);
                        }}
                      />
                      <CheckCircleIcon
                        color="secondary"
                        style={{
                          height: "18px",
                          width: "18px",
                          margin: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDatapoint(false, elm)}
                      />
                    </Fragment>
                  ) : (
                    <CheckCircleOutlineIcon
                      color="secondary"
                      style={{
                        height: "18px",
                        width: "18px",
                        margin: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        dispatch(resetColor());
                        handleDatapoint(true, elm);
                      }}
                    />
                  )}
                </span>
              </div>
              <Divider />
            </Fragment>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
