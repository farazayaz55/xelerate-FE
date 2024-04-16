import React, { useEffect, Fragment, useRef } from "react";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  AutoSizer,
  List,
  CellMeasurerCache,
  CellMeasurer,
} from "react-virtualized";

export default function getActuations({ index, form, actuators }) {
  function handleNumeric(value) {
    form.setFieldValue(getName("label"), `Level ${value}`);
    form.setFieldValue(
      getName("value"),
      actuator.metaData.Command.replaceAll("{range}", value)
    );
  }

  const eventCache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    })
  );

  function getName(name) {
    return index || index == 0 ? `actuations[${index}].${name}` : name;
  }

  function getValue(name) {
    return index || index == 0
      ? form.values.actuations[index][name]
      : form.values[name];
  }

  let actuator = actuators.find((a) => a.name == getValue("actuator"));

  function generateData(Min, Max) {
    let min = parseFloat(Min);
    let max = parseFloat(Max);
    let output = [];
    while (min <= max) {
      output.push(min.toString());
      min += 1;
    }
    return output;
  }

  useEffect(() => {
    if (actuator?.type == "touch") {
      form.setFieldValue(getName("command"), actuator.metaData.Command);
      form.setFieldValue(getName("label"), actuator.metaData.Command);
      form.setFieldValue(getName("value"), actuator.metaData.Command);
    }
  }, [actuator?.type]);

  switch (actuator?.type) {
    case "power":
      return (
        <Fragment>
          <FormControl fullWidth margin="dense">
            <InputLabel>Action</InputLabel>
            <Select
              fullWidth
              label="Action"
              name={getName("command")}
              value={getValue("command")}
              onChange={(e) => {
                form.handleChange(e);
                form.setFieldValue(
                  getName("label"),
                  actuator?.metaData.Default.Value == e.target.value
                    ? actuator?.metaData.Default.Name
                    : actuator?.metaData.Active.Name
                );
                form.setFieldValue(
                  getName("value"),
                  actuator?.metaData.Default.Value == e.target.value
                    ? actuator?.metaData.Default.Value
                    : actuator?.metaData.Active.Value
                );
              }}
              required
            >
              <MenuItem value={actuators && actuator?.metaData.Default.Value}>
                {actuators && actuator?.metaData.Default.Name}
              </MenuItem>
              <MenuItem value={actuators && actuator?.metaData.Active.Value}>
                {actuators && actuator?.metaData.Active.Name}
              </MenuItem>
            </Select>
          </FormControl>
        </Fragment>
      );

    case "text":
      return (
        <TextField
          label="Action"
          fullWidth
          margin="dense"
          name={getName("command")}
          value={getValue("command")}
          onChange={(e) => {
            form.handleChange(e);
            form.setFieldValue(getName("label"), e.target.value);
            form.setFieldValue(getName("value"), e.target.value);
          }}
        />
      );

    case "numeric":
      return (
        <TextField
          name={getName("command")}
          placeholder="Input numeric value"
          margin="dense"
          value={getValue("command")}
          type="number"
          label="Action"
          fullWidth
          style={{
            marginBottom: "20px",
          }}
          error={
            getValue("command") < actuator.metaData.Range.Min ||
            getValue("command") > actuator.metaData.Range.Max
          }
          helperText={
            getValue("command") < actuator.metaData.Range.Min ||
            getValue("command") > actuator.metaData.Range.Max
              ? `Range should be in between ${actuator.metaData.Range.Min} to ${actuator.metaData.Range.Max}`
              : ""
          }
          onChange={(e) => {
            form.handleChange(e);
            handleNumeric(e.target.value);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "10px",
                  }}
                >
                  <IconButton
                    onClick={() => {
                      let value =
                        getValue("command") == ""
                          ? actuator.metaData?.Range?.Min
                          : parseFloat(getValue("command")) +
                            parseFloat(actuator.metaData.Increment);
                      form.setFieldValue(getName("command"), `${value}`);
                      handleNumeric(`${value}`);
                    }}
                    disabled={
                      parseFloat(getValue("command")) +
                        parseFloat(actuator.metaData.Increment) >
                      parseFloat(actuator.metaData?.Range?.Max)
                    }
                    style={{ width: "20px", height: "20px" }}
                  >
                    <KeyboardArrowUpIcon
                      style={{ width: "15px", height: "15px" }}
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      let value =
                        parseFloat(getValue("command")) -
                        parseFloat(actuator.metaData.Increment);
                      form.setFieldValue(getName("command"), `${value}`);
                      handleNumeric(`${value}`);
                    }}
                    style={{ width: "20px", height: "20px" }}
                    disabled={
                      getValue("command") == "" ||
                      parseFloat(getValue("command")) -
                        parseFloat(actuator.metaData.Increment) <
                        parseFloat(actuator.metaData?.Range?.Min)
                    }
                  >
                    <KeyboardArrowDownIcon
                      style={{ width: "15px", height: "15px" }}
                    />
                  </IconButton>
                </span>
              </InputAdornment>
            ),
          }}
        />
      );

    case "thermostat":
      let data = generateData(
        parseFloat(actuator?.metaData.Range.Min),
        parseFloat(actuator?.metaData.Range.Max)
      );
      return (
        <Fragment>
          <FormControl fullWidth margin="dense">
            <InputLabel>Action</InputLabel>
            <Select
              fullWidth
              label="Action"
              name={getName("command")}
              value={getValue("command")}
              onChange={(e) => {
                form.handleChange(e);
                form.setFieldValue(getName("label"), `Level ${e.target.value}`);
                form.setFieldValue(
                  getName("value"),
                  actuator.metaData.Command.replaceAll(
                    "{range}",
                    e.target.value
                  )
                );
              }}
              required
            >
              {/* <div style={{ width: "100%", height: "400px" }}>
                <AutoSizer>
                  {({ width, height }) => (
                    <List
                      id="select"
                      rowCount={data.length}
                      rowHeight={eventCache.current.rowHeight}
                      deferredMeasurementCache={eventCache.current}
                      width={width}
                      height={height}
                      rowRenderer={({ key, index, style, parent }) => {
                        return (
                          <CellMeasurer
                            key={key}
                            cache={eventCache.current}
                            parent={parent}
                            columnIndex={0}
                            rowIndex={index}
                          > */}
              {data.map((e) => (
                <MenuItem value={parseFloat(e)} key={e}>
                  {e}
                </MenuItem>
              ))}
              {/* </CellMeasurer>
                        );
                      }}
                    />
                  )}
                </AutoSizer>
              </div> */}
            </Select>
          </FormControl>
        </Fragment>
      );

    default:
      return null;
  }
}
