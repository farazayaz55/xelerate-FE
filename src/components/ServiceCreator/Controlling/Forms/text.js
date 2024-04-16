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

export default function Text(props) {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();

  const textForm = useFormik({
    initialValues: {
      description: "",
      name: "",
      template: "",
      config: false,
      prompt: false,
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      template: Yup.string(),
      config: Yup.boolean().required("Required field"),
      prompt: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      if (!values.template || values.template.includes("{input}")) {
        let body = {
          name: values.name,
          description: values.description,
          type: "text",
          config: values.config,
          prompt: values.prompt,
          metaData: values.template
            ? {
                template: values.template,
              }
            : {},
        };

        addActuator({ token, body });
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
      <form onSubmit={textForm.handleSubmit}>
        <TextField
          required
          label="Actuator Name"
          fullWidth
          margin="dense"
          id="name"
          error={textForm.touched.name && textForm.errors.name}
          value={textForm.values.name}
          onChange={textForm.handleChange}
          onBlur={textForm.handleBlur}
          helperText={textForm.touched.name ? textForm.errors.name : ""}
        />
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={textForm.touched.description && textForm.errors.description}
          value={textForm.values.description}
          onChange={textForm.handleChange}
          onBlur={textForm.handleBlur}
          helperText={
            textForm.touched.description ? textForm.errors.description : ""
          }
        />
        <TextField
          label="Command Format"
          fullWidth
          margin="dense"
          id="template"
          error={textForm.touched.template && textForm.errors.template}
          value={textForm.values.template}
          onChange={textForm.handleChange}
          onBlur={textForm.handleBlur}
        />
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
                  checked={textForm.values.config}
                  onChange={textForm.handleChange}
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
                  checked={textForm.values.prompt}
                  onChange={textForm.handleChange}
                />
              }
            />
          </span>
        </div>
        <p style={{ color: "#c4c4c4" }}>
          {"Hint: A long command with input: {input}"}
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
