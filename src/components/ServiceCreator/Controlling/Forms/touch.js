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

  const touchForm = useFormik({
    initialValues: {
      description: "",
      format: "",
      name: "",
      config: false,
      prompt: false,
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      format: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      config: Yup.boolean().required("Required field"),
      prompt: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      let body = {
        name: values.name,
        description: values.description,
        config: values.config,
        prompt: values.prompt,
        type: "touch",
        metaData: {
          Command: values.format,
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
      <form onSubmit={touchForm.handleSubmit}>
        <TextField
          required
          label="Actuator Name"
          fullWidth
          margin="dense"
          id="name"
          error={touchForm.touched.name && touchForm.errors.name}
          value={touchForm.values.name}
          onChange={touchForm.handleChange}
          onBlur={touchForm.handleBlur}
          helperText={touchForm.touched.name ? touchForm.errors.name : ""}
        />
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={touchForm.touched.description && touchForm.errors.description}
          value={touchForm.values.description}
          onChange={touchForm.handleChange}
          onBlur={touchForm.handleBlur}
          helperText={
            touchForm.touched.description ? touchForm.errors.description : ""
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
          <TextField
            required
            label="Command Format"
            fullWidth
            margin="dense"
            id="format"
            error={touchForm.touched.format && touchForm.errors.format}
            value={touchForm.values.format}
            onChange={touchForm.handleChange}
            onBlur={touchForm.handleBlur}
            helperText={touchForm.touched.format ? touchForm.errors.format : ""}
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
                  checked={touchForm.values.config}
                  onChange={touchForm.handleChange}
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
                  checked={touchForm.values.prompt}
                  onChange={touchForm.handleChange}
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
