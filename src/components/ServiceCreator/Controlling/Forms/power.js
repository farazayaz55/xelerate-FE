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

export default function Boolean(props) {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();

  const powerForm = useFormik({
    initialValues: {
      description: "",
      defaultCommand: "",
      defaultName: "",
      activeCommand: "",
      activeName: "",
      name: "",
      config: false,
      prompt: false,
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      defaultCommand: Yup.string().required("Required field"),
      defaultName: Yup.string().required("Required field"),
      activeCommand: Yup.string().required("Required field"),
      activeName: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      config: Yup.boolean().required("Required field"),
      prompt: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      let body = {
        name: values.name,
        description: values.description,
        type: "power",
        config: values.config,
        prompt: values.prompt,
        metaData: {
          Default: { Name: values.defaultName, Value: values.defaultCommand },
          Active: { Name: values.activeName, Value: values.activeCommand },
        },
      };

      addActuator({ token, body });
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
      <form onSubmit={powerForm.handleSubmit}>
        <TextField
          required
          label="Actuator Name"
          fullWidth
          margin="dense"
          id="name"
          error={powerForm.touched.name && powerForm.errors.name}
          value={powerForm.values.name}
          onChange={powerForm.handleChange}
          onBlur={powerForm.handleBlur}
          helperText={powerForm.touched.name ? powerForm.errors.name : ""}
        />
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={powerForm.touched.description && powerForm.errors.description}
          value={powerForm.values.description}
          onChange={powerForm.handleChange}
          onBlur={powerForm.handleBlur}
          helperText={
            powerForm.touched.description ? powerForm.errors.description : ""
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
            <b>Default State</b>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <TextField
              required
              label="Name"
              fullWidth
              margin="dense"
              id="defaultName"
              error={
                powerForm.touched.defaultName && powerForm.errors.defaultName
              }
              value={powerForm.values.defaultName}
              onChange={powerForm.handleChange}
              onBlur={powerForm.handleBlur}
              helperText={
                powerForm.touched.defaultName
                  ? powerForm.errors.defaultName
                  : ""
              }
            />
            <TextField
              required
              label="Value"
              fullWidth
              margin="dense"
              id="defaultCommand"
              error={
                powerForm.touched.defaultCommand &&
                powerForm.errors.defaultCommand
              }
              value={powerForm.values.defaultCommand}
              onChange={powerForm.handleChange}
              onBlur={powerForm.handleBlur}
              helperText={
                powerForm.touched.defaultCommand
                  ? powerForm.errors.defaultCommand
                  : ""
              }
            />
          </div>
        </div>
        <div>
          <p
            style={{
              fontSize: "16px",
              color: "#666666",
              marginBottom: "10px",
            }}
          >
            <b>Active State</b>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <TextField
              required
              label="Name"
              fullWidth
              margin="dense"
              id="activeName"
              error={
                powerForm.touched.activeName && powerForm.errors.activeName
              }
              value={powerForm.values.activeName}
              onChange={powerForm.handleChange}
              onBlur={powerForm.handleBlur}
              helperText={
                powerForm.touched.activeName ? powerForm.errors.activeName : ""
              }
            />
            <TextField
              required
              label="Value"
              fullWidth
              margin="dense"
              id="activeCommand"
              error={
                powerForm.touched.activeCommand &&
                powerForm.errors.activeCommand
              }
              value={powerForm.values.activeCommand}
              onChange={powerForm.handleChange}
              onBlur={powerForm.handleBlur}
              helperText={
                powerForm.touched.activeCommand
                  ? powerForm.errors.activeCommand
                  : ""
              }
            />
          </div>
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
                  checked={powerForm.values.config}
                  onChange={powerForm.handleChange}
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
                  checked={powerForm.values.prompt}
                  onChange={powerForm.handleChange}
                />
              }
            />
          </span>
        </div>
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
