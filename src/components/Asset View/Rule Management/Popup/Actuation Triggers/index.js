import React, { useRef, useState } from "react";
import { FieldArray, FormikProvider } from "formik";
import { useSelector } from "react-redux";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { makeStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import Actuators from "components/Actuators";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import Zoom from "@mui/material/Zoom";
export default function Edit({ form, actuators, ...props }) {
  const metaDataValue = useSelector((state) => state.metaData);
  const [infoDetail, setInfoDetail] = useState([]);

  let alt =
    metaDataValue?.services && props?.id
      ? metaDataValue?.services?.find((s) => s?.id == props?.id)
      : null;
  let altDevice = alt ? JSON?.parse(JSON?.stringify(alt)) : null;

  let device =
    useSelector((state) => state.asset.device) || altDevice ? altDevice : null;
  if (props.id && device && device.esbMetaData) {
    device.esbMetaData = device.esbMetaData.find(
      (type) => type.assetType == form.values.assetType
    );

  }
  const filteredActuators =
    device?.esbMetaData &&
    device?.esbMetaData?.actuators &&
    device?.esbMetaData?.actuators?.length
      ? actuators?.filter((s) =>
          device?.esbMetaData?.actuators?.includes(s.name)
        )
      : actuators;
  console.log({ filteredActuators });
  const creatTooltipData = (actuator) => {
    let detail = [];
    detail.push(`Description: ${actuator.description}`);
    if (
      actuator.metaData?.Range?.Min != undefined &&
      actuator.metaData?.Range?.Max != undefined
    ) {
      detail.push(`Min: ${actuator.metaData?.Range?.Min}`);
      detail.push(`Min: ${actuator.metaData?.Range?.Max}`);
    }
    if (actuator.metaData?.Increment) {
      detail.push(`Increment: ${actuator.metaData?.Increment}`);
    }
    if (actuator.metaData?.Command) {
      detail.push(`Command: ${actuator.metaData?.Command}`);
    }
    return detail;
  };
  const tooltipContent = (name) => {
    const actuat = filteredActuators.find((actuator) => actuator.name === name);
    const detailList = creatTooltipData(actuat);
    return (
      <Typography>
        {detailList.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </Typography>
    );
  };

  const useStyles = makeStyles({
    addDiv: {
      marginTop: "20px",
      width: "100%",
      height: "55px",
      border: "solid 1px #c4c4c4",
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      "&:hover": {
        border: "solid 1px black",
      },
    },
    add: {
      color: metaDataValue.branding.secondaryColor,
      fontSize: "18px",
      display: "flex",
      gap: "10px",
      alignItems: "center",
      justifyContent: "center",
    },
    remove: {
      color: "#bf3535",
      cursor: "pointer",
      marginRight: "20px",
    },
  });

  const actuatorsEndRef = useRef(null);

  const classes = useStyles(props);

  const scrollToBottom = () => {
    actuatorsEndRef.current.scrollIntoView();
  };

  function actuatorType(actuator) {
    let output;
    filteredActuators?.forEach((elm, i) => {
      if (actuator == elm.name) {
        output = elm.type;
      }
    });
    return output;
  }

  function actuatorIndex(actuator) {
    let output;
    filteredActuators?.forEach((elm, i) => {
      if (actuator == elm.name) {
        output = i;
      }
    });
    return output;
  }

  return (
    <FormikProvider value={form}>
      <FieldArray
        name="actuations"
        render={(arrayHelpers) => (
          <div>
            <span
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "20px",
                margin: "10px",
                width: "500px",
              }}
            >
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => {
                  arrayHelpers.push({
                    actuator: "",
                    command: "",
                    label: "",
                    value: "",
                  });
                  setTimeout(() => {
                    scrollToBottom();
                  }, 100);
                }}
              >
                Add another actuation
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  form.setValues({
                    ...form.values,
                    actuations: [
                      {
                        actuator: "",
                        command: "",
                        label: "",
                        value: "",
                      },
                    ],
                  });
                }}
              >
                Clear Actuations
              </Button>
            </span>
            <div
              style={{
                maxHeight: "325px",
                height: "calc(40vh - 80px)",
                overflowY: "scroll",
              }}
            >
              {form.values.actuations.map((elm, index) => (
                <div style={{ paddingRight: "5px" }}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>{`Actuator  ${index + 1}`}</InputLabel>
                    <Select
                      fullWidth
                      label={`Actuator  ${index + 1}`}
                      name={`actuations[${index}].actuator`}
                      value={form.values.actuations[index].actuator}
                      onChange={(e) => {
                        console.log("event", e);
                        form.handleChange(e);

                        form.setFieldValue(`actuations[${index}].command`, "");
                        form.setFieldValue(`actuations[${index}].label`, "");
                        form.setFieldValue(`actuations[${index}].value`, "");
                        const actuat = filteredActuators.find(
                          (actuator) => actuator.name === e.target.value
                        );
                        creatTooltipData(actuat);
                      }}
                      endAdornment={
                        <InputAdornment position="end" style={{marginRight:'2rem'}}>
                          {index != 0 ? (
                            <DeleteIcon
                              className={classes.remove}
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          ) : null}
                          {form.values.actuations[index].actuator && (
                            <Tooltip
                              title={tooltipContent(
                                form.values.actuations[index].actuator
                              )}
                              placement="left"
                              arrow
                              TransitionComponent={Zoom}
                            >
                              <InfoIcon />
                            </Tooltip>
                          )}
                        </InputAdornment>
                      }
                    >
                      {filteredActuators?.map((elm) => {
                        return <MenuItem value={elm.name}>{elm.name}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                  <Actuators
                    actuators={filteredActuators}
                    index={index}
                    form={form}
                  />
                  <Divider style={{ margin: "17px 0" }} />
                </div>
              ))}
              <div ref={actuatorsEndRef} />
            </div>
          </div>
        )}
      />
    </FormikProvider>
  );
}
