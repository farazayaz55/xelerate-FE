import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateActuatorMutation } from "services/services";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export default function Thermostat(props) {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();

  const thermostatForm = useFormik({
    initialValues: {
      description: "",
      defaultCommand: "",
      defaultName: "",
      format: "",
      name: "",
      config: false,
      prompt: false,
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      defaultCommand: Yup.string().required("Required field"),
      defaultName: Yup.string().required("Required field"),
      format: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      config: Yup.boolean().required("Required field"),
      prompt: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      if (values.format.includes("{range}")) {
        let body = {
          name: values.name,
          description: values.description,
          type: "thermostat",
          config: values.config,
          prompt: values.prompt,
          metaData: {
            Range: { Min: values.defaultName, Max: values.defaultCommand },
            Command: values.format,
          },
        };

        addActuator({ token, body });
      } else {
        showSnackbar(
          "Actuator",
          "Range must be added in command format i.e {range}",
          "info",
          1000
        );
      }
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const [addActuator, addActuatorResult] = useCreateActuatorMutation();

  useEffect(() => {
    if (addActuatorResult.isSuccess) {
      let id = addActuatorResult.data.payload._id;
      props.setSelected(addActuatorResult.data.payload);
      props.setOpenPopup(false);
      setTimeout(() => {
        props.setSwitcherState("");
      }, 500);
      showSnackbar(
        "Actuator",
        addActuatorResult.data?.message,
        "success",
        1000
      );
    }
    if (addActuatorResult.isError) {
      showSnackbar(
        "Actuator",
        addActuatorResult.error.data?.message,
        "error",
        1000
      );
    }
  }, [addActuatorResult]);

  return (
    <div>
      <p
        style={{
          fontSize: "16px",
          color: "#666666",
          marginBottom: "10px",
        }}
      >
        <b>Details</b>
      </p>
      <form onSubmit={thermostatForm.handleSubmit}>
        <TextField
          required
          label="Actuator Name"
          fullWidth
          margin="dense"
          id="name"
          error={thermostatForm.touched.name && thermostatForm.errors.name}
          value={thermostatForm.values.name}
          onChange={thermostatForm.handleChange}
          onBlur={thermostatForm.handleBlur}
          helperText={
            thermostatForm.touched.name ? thermostatForm.errors.name : ""
          }
        />
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={
            thermostatForm.touched.description &&
            thermostatForm.errors.description
          }
          value={thermostatForm.values.description}
          onChange={thermostatForm.handleChange}
          onBlur={thermostatForm.handleBlur}
          helperText={
            thermostatForm.touched.description
              ? thermostatForm.errors.description
              : ""
          }
        />
        <div>
          <p
            style={{
              fontSize: "16px",
              color: "#666666",
              marginBottom: "10px",
            }}
          >
            <b>Command</b>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <TextField
              type="number"
              required
              label="Min"
              fullWidth
              margin="dense"
              id="defaultName"
              error={
                thermostatForm.touched.defaultName &&
                thermostatForm.errors.defaultName
              }
              value={thermostatForm.values.defaultName}
              onChange={thermostatForm.handleChange}
              onBlur={thermostatForm.handleBlur}
              helperText={
                thermostatForm.touched.defaultName
                  ? thermostatForm.errors.defaultName
                  : ""
              }
            />
            <TextField
              required
              type="number"
              label="Max"
              fullWidth
              margin="dense"
              id="defaultCommand"
              error={
                thermostatForm.touched.defaultCommand &&
                thermostatForm.errors.defaultCommand
              }
              value={thermostatForm.values.defaultCommand}
              onChange={thermostatForm.handleChange}
              onBlur={thermostatForm.handleBlur}
              helperText={
                thermostatForm.touched.defaultCommand
                  ? thermostatForm.errors.defaultCommand
                  : ""
              }
            />
          </div>
          <TextField
            required
            label="Command Format"
            fullWidth
            id="format"
            margin="dense"
            error={
              thermostatForm.touched.format && thermostatForm.errors.format
            }
            value={thermostatForm.values.format}
            onChange={thermostatForm.handleChange}
            onBlur={thermostatForm.handleBlur}
            helperText={
              thermostatForm.touched.format ? thermostatForm.errors.format : ""
            }
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
              Make it a configuration
            </p>
            <FormControlLabel
              control={
                <Switch
                  name="config"
                  checked={thermostatForm.values.config}
                  onChange={thermostatForm.handleChange}
                />
              }
            />
          </span>
          <span
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
              Prompt Toggle
            </p>
            <FormControlLabel
              control={
                <Switch
                  name="prompt"
                  checked={thermostatForm.values.prompt}
                  onChange={thermostatForm.handleChange}
                />
              }
            />
          </span>
        </div>
        <p style={{ color: "#c4c4c4" }}>
          {"Hint: Range values can be entered in command e.g {range}"}
        </p>
        <DialogActions>
          <Button
            id="back"
            onClick={() => props.setSwitcherState("")}
            color="primary"
          >
            Back
          </Button>
          <Button id="add" type="submit" color="primary">
            Add
          </Button>
        </DialogActions>
      </form>
    </div>
  );
}
