import React, { Fragment, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function Catalogue() {
  const dispatch = useDispatch();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [duration, setDuration] = useState(
    serviceValue?.duration
      ? new Date(serviceValue.duration)
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );

  const vanishForm = useFormik({
    initialValues: {
      vanish: serviceValue.vanish,
      devPrompt: serviceValue.devPrompt,
    },
    validationSchema: Yup.object({
      vanish: Yup.boolean(),
      devPrompt: Yup.boolean(),
    }),
  });

  function isValidDate(dateVal) {
    const date = new Date(dateVal);
    return !isNaN(date);
  }

  useEffect(() => {
    dispatch(
      setService({
        vanish: vanishForm.values.vanish,
        devPrompt: vanishForm.values.devPrompt,
        duration: isValidDate(duration) ? duration.toISOString() : null,
      })
    );
  }, [vanishForm.values, duration]);

  function onKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  return (
    <Fragment>
      <form onSubmit={vanishForm.handleSubmit} onKeyDown={onKeyDown}>
        <span style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <p
            style={{
              color: "#616161",
              fontSize: "15px",
            }}
          >
            <b>Expiring Solution</b>
          </p>
          <FormControlLabel
            control={
              <Switch
                name="vanish"
                checked={vanishForm.values.vanish}
                onChange={vanishForm.handleChange}
              />
            }
          />
        </span>
        <Divider />

        <span
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
            padding: "10px",
          }}
        >
          <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
            Wipe devices too
          </p>
          <FormControlLabel
            control={
              <Switch
                disabled={!vanishForm.values.vanish}
                name="devPrompt"
                checked={vanishForm.values.devPrompt}
                onChange={vanishForm.handleChange}
              />
            }
          />
        </span>
        {/* </div> */}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Termination Time"
            inputFormat="dd/MM/yyyy h:mm:ss aaa"
            value={duration}
            disabled={!vanishForm.values.vanish}
            onChange={(e) => {
              setDuration(e);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="dense"
                style={{ marginBottom: "20px" }}
              />
            )}
          />
        </LocalizationProvider>
      </form>
    </Fragment>
  );
}
