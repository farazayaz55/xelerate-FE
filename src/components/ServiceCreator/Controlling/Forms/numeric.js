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

  const numericForm = useFormik({
    initialValues: {
      description: "",
      name: "",
      format: "",
      defaultCommand: "",
      defaultName: "",
      increment: "",
      config: false,
      prompt: false,
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      format: Yup.string().required("Required field"),
      defaultCommand: Yup.number().required("Required field"),
      defaultName: Yup.number().required("Required field"),
      increment: Yup.number().required("Required field").min(0.001),
      config: Yup.boolean().required("Required field"),
      prompt: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      if (values.format.includes("{range}")) {
        let body = {
          name: values.name,
          description: values.description,
          type: "numeric",
          config: values.config,
          prompt: values.prompt,
          metaData: {
            Command: values.format,
            Increment: values.increment,
            Range: { Min: values.defaultName, Max: values.defaultCommand },
          },
        };
        addActuator({ token, body });
      } else if (
        parseFloat(values.increment) > parseFloat(values.defaultCommand)
      ) {
        showSnackbar(
          "Actuator",
          "Increment must be less then the max value of range",
          "info",
          1000
        );
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
      <form onSubmit={numericForm.handleSubmit}>
        <TextField
          required
          label="Actuator Name"
          fullWidth
          margin="dense"
          id="name"
          error={numericForm.touched.name && numericForm.errors.name}
          value={numericForm.values.name}
          onChange={numericForm.handleChange}
          onBlur={numericForm.handleBlur}
          helperText={numericForm.touched.name ? numericForm.errors.name : ""}
        />
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={
            numericForm.touched.description && numericForm.errors.description
          }
          value={numericForm.values.description}
          onChange={numericForm.handleChange}
          onBlur={numericForm.handleBlur}
          helperText={
            numericForm.touched.description
              ? numericForm.errors.description
              : ""
          }
        />
        <div style={{ display: "flex", gap: "20px" }}>
          <TextField
            type="number"
            required
            label="Min"
            fullWidth
            margin="dense"
            id="defaultName"
            error={
              numericForm.touched.defaultName && numericForm.errors.defaultName
            }
            value={numericForm.values.defaultName}
            onChange={numericForm.handleChange}
            onBlur={numericForm.handleBlur}
            helperText={
              numericForm.touched.defaultName
                ? numericForm.errors.defaultName
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
              numericForm.touched.defaultCommand &&
              numericForm.errors.defaultCommand
            }
            value={numericForm.values.defaultCommand}
            onChange={numericForm.handleChange}
            onBlur={numericForm.handleBlur}
            helperText={
              numericForm.touched.defaultCommand
                ? numericForm.errors.defaultCommand
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
          error={numericForm.touched.format && numericForm.errors.format}
          value={numericForm.values.format}
          onChange={numericForm.handleChange}
          onBlur={numericForm.handleBlur}
          helperText={
            numericForm.touched.format ? numericForm.errors.format : ""
          }
        />
        <TextField
          required
          type="number"
          label="Increment/Decrement"
          fullWidth
          margin="dense"
          id="increment"
          inputProps={{
            step: "0.001"
          }}
          error={numericForm.touched.increment && numericForm.errors.increment}
          value={numericForm.values.increment}
          onChange={numericForm.handleChange}
          onBlur={numericForm.handleBlur}
          helperText={
            numericForm.touched.increment ? numericForm.errors.increment : ""
          }
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
                  checked={numericForm.values.config}
                  onChange={numericForm.handleChange}
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
                  checked={numericForm.values.prompt}
                  onChange={numericForm.handleChange}
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
