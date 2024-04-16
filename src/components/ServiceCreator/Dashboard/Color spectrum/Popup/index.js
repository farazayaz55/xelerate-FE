//----------------CORE-----------------//
import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { useSnackbar } from "notistack";
import * as Yup from "yup";
//----------------MUI-----------------//
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
//----------------MUI ICONS-----------------//
import InfoIcon from "@mui/icons-material/Info";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import StopIcon from "@mui/icons-material/Stop";
//----------------EXTERNAL-----------------//
import { acceptNegativeAndFloat } from "Utilities/Form Validations";
import { generateBackground } from "Utilities/Color Spectrum";

export default function Catalogue(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const useStyles = makeStyles({
    addDiv: {
      width: "100%",
      height: "55px",
      border: "solid 1px #c4c4c4",
      borderRadius: "3px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "8px",
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
    },
  });

  const classes = useStyles(props);
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [reverse, setReverse] = React.useState(false);
  const [customRange, setCustomRange] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    datapointForm.setValues({
      colors: serviceValue.persist.dataPointThresholds.colors,
      customColors: serviceValue.persist.dataPointThresholds.customColors,
      min: serviceValue.persist.dataPointThresholds.min,
      max: serviceValue.persist.dataPointThresholds.max,
    });
    setReverse(serviceValue.persist.dataPointThresholds.reverse);
    setCustomRange(serviceValue.persist.dataPointThresholds.customRange);
  }, [serviceValue.persist.dataPointThresholds]);

  const datapointForm = useFormik({
    initialValues: {
      colors: serviceValue.persist.dataPointThresholds.colors,
      customColors: serviceValue.persist.dataPointThresholds.customColors,
      min: serviceValue.persist.dataPointThresholds.min,
      max: serviceValue.persist.dataPointThresholds.max,
    },
    validationSchema: Yup.object({
      customColors: customRange
        ? Yup.array().of(
            Yup.object().shape({
              value: Yup.string()
                .required("Required field")
                .matches(/^#([0-9a-f]{3}){1,2}$/i, "Must be a valid hex code"),
              min: Yup.string()
                .required("Required field")
                .matches(/^[-+]?\d+(\.\d+)?$/, "Must be a number"),
              max: Yup.string()
                .required("Required field")
                .matches(/^[-+]?\d+(\.\d+)?$/, "Must be a number"),
            })
          )
        : "",
      colors: !customRange
        ? Yup.array().of(
            Yup.object().shape({
              value: Yup.string()
                .required("Required field")
                .matches(/^#([0-9a-f]{3}){1,2}$/i, "Must be a valid hex code"),
            })
          )
        : "",
      min: !customRange
        ? Yup.string()
            .required("Required field")
            .matches(/^[-+]?\d+(\.\d+)?$/, "Must be a number")
        : "",
      max: !customRange
        ? Yup.string()
            .required("Required field")
            .matches(/^[-+]?\d+(\.\d+)?$/, "Must be a number")
        : "",
    }),
    onSubmit: async (values) => {
      props.handleSubmit(values, reverse, customRange);
    },
  });

  function validateRange({ min, max }) {
    if (parseFloat(max) > parseFloat(min)) return true;
    else return false;
  }

  function validateCustomRanges(array) {
    let index = 0;
    for (const arr of array) {
      if (
        !validateRange({ min: arr.min, max: arr.max }) ||
        (index > 0 &&
          !validateRange({ min: array[index - 1].min, max: arr.min }))
      )
        return false;
      index += 1;
    }
    return true;
  }

  return (
    <Dialog
      open={props.state}
      onClose={() => {
        datapointForm.resetForm();
        datapointForm.resetForm();
        props.close();
      }}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle>Set color spectrum mapping ({props.name})</DialogTitle>
      <form onSubmit={datapointForm.handleSubmit}>
        <DialogContent dividers>
          {props.text ? (
            <div
              style={{
                color: "#b1b1b1",
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                alignItems: "center",
              }}
            >
              <InfoIcon />
              <p style={{ fontSize: "13px" }}>{props.text}</p>
            </div>
          ) : null}
          <span
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
              Enable custom color ranges
            </p>
            <Switch
              checked={customRange}
              color="secondary"
              onClick={() => {
                setCustomRange(!customRange);
                setReverse(false);
              }}
            />
          </span>
          {customRange ? (
            <Fragment>
              <FormikProvider value={datapointForm}>
                <FieldArray
                  name="customColors"
                  render={(arrayHelpers) => (
                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      {datapointForm.values.customColors.map((elm, index) => (
                        <div
                          style={{
                            paddingRight: index == 0 ? "40px" : "0",
                            display: "flex",
                            gap: "20px",
                          }}
                        >
                          <TextField
                            required
                            margin="dense"
                            label="Minimum"
                            fullWidth
                            name={`customColors[${index}].min`}
                            value={datapointForm.values.customColors[index].min}
                            onChange={(e) => {
                              if (
                                !acceptNegativeAndFloat({
                                  new: e,
                                  old:
                                    datapointForm.values.customColors[index]
                                      .min,
                                })
                              )
                                return;

                              datapointForm.handleChange(e);
                            }}
                            onBlur={datapointForm.handleBlur}
                            helperText={
                              datapointForm.touched?.customColors &&
                              datapointForm.errors?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.errors?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index] &&
                              datapointForm.errors.customColors[index]
                                ? datapointForm.errors.customColors[index].min
                                : ""
                            }
                            error={
                              datapointForm.touched?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index]?.min &&
                              ((datapointForm.errors?.customColors &&
                                datapointForm.errors?.customColors.length > 0 &&
                                datapointForm.errors.customColors[index]
                                  ?.min) ||
                                !validateRange({
                                  min:
                                    datapointForm.values.customColors[index]
                                      .min,
                                  max:
                                    datapointForm.values.customColors[index]
                                      .max,
                                }) ||
                                (index > 0 &&
                                  !validateRange({
                                    min:
                                      datapointForm.values.customColors[
                                        index - 1
                                      ].max,
                                    max:
                                      datapointForm.values.customColors[index]
                                        .min,
                                  })))
                            }
                          />
                          <TextField
                            required
                            margin="dense"
                            label="Maximum"
                            fullWidth
                            name={`customColors[${index}].max`}
                            value={datapointForm.values.customColors[index].max}
                            onChange={(e) => {
                              if (
                                !acceptNegativeAndFloat({
                                  new: e,
                                  old:
                                    datapointForm.values.customColors[index]
                                      .max,
                                })
                              )
                                return;

                              datapointForm.handleChange(e);
                            }}
                            onBlur={datapointForm.handleBlur}
                            helperText={
                              datapointForm.touched?.customColors &&
                              datapointForm.errors?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.errors?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index] &&
                              datapointForm.errors.customColors[index]
                                ? datapointForm.errors.customColors[index].max
                                : ""
                            }
                            error={
                              datapointForm.touched?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index]?.max &&
                              ((datapointForm.errors?.customColors &&
                                datapointForm.errors?.customColors.length > 0 &&
                                datapointForm.errors.customColors[index]
                                  ?.max) ||
                                !validateRange({
                                  min:
                                    datapointForm.values.customColors[index]
                                      .min,
                                  max:
                                    datapointForm.values.customColors[index]
                                      .max,
                                }))
                            }
                          />
                          <TextField
                            margin="dense"
                            color="secondary"
                            fullWidth
                            name={`customColors[${index}].value`}
                            value={
                              datapointForm.values.customColors[index].value
                            }
                            label={
                              datapointForm.values.customColors[index].label
                            }
                            onChange={datapointForm.handleChange}
                            onBlur={datapointForm.handleBlur}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StopIcon
                                    fontSize="small"
                                    style={{
                                      color:
                                        datapointForm.values.customColors[index]
                                          .value,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            error={
                              datapointForm.touched?.customColors &&
                              datapointForm.errors?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.errors?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index] &&
                              datapointForm.errors.customColors[index]
                                ? true
                                : false
                            }
                            helperText={
                              datapointForm.touched?.customColors &&
                              datapointForm.errors?.customColors &&
                              datapointForm.touched?.customColors.length > 0 &&
                              datapointForm.errors?.customColors.length > 0 &&
                              datapointForm.touched.customColors[index] &&
                              datapointForm.errors.customColors[index]
                                ? datapointForm.errors.customColors[index].value
                                : ""
                            }
                          />
                          {index > 0 ? (
                            <RemoveCircleOutlineIcon
                              fontSize="small"
                              className={classes.remove}
                              style={{ position: "relative", top: "25px" }}
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          ) : null}
                        </div>
                      ))}

                      <div
                        className={classes.addDiv}
                        onClick={() => {
                          if (
                            datapointForm.values.customColors[
                              datapointForm.values.customColors.length - 1
                            ].max == ""
                          )
                            showSnackbar(
                              "Color Spectrum",
                              "Maximun of last value is required",
                              "warning",
                              1000
                            );
                          else if (
                            parseFloat(
                              datapointForm.values.customColors[
                                datapointForm.values.customColors.length - 1
                              ].max
                            ) <=
                            parseFloat(
                              datapointForm.values.customColors[
                                datapointForm.values.customColors.length - 1
                              ].min
                            )
                          )
                            showSnackbar(
                              "Color Spectrum",
                              "Range of last value is invalid",
                              "warning",
                              1000
                            );
                          else if (!datapointForm.errors.name) {
                            arrayHelpers.push({
                              label: `Color ${
                                datapointForm.values.customColors.length + 1
                              }`,
                              value: "",
                              min:
                                parseFloat(
                                  datapointForm.values.customColors[
                                    datapointForm.values.customColors.length - 1
                                  ].max
                                ) + 1,
                              max: "",
                            });
                          }
                        }}
                      >
                        <span className={classes.add}>
                          <AddCircleIcon />
                          <p>
                            <b>Add another color</b>
                          </p>
                        </span>
                      </div>
                    </div>
                  )}
                />
              </FormikProvider>
            </Fragment>
          ) : (
            <Fragment>
              <FormikProvider value={datapointForm}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    marginTop: "10px",
                    gap: "8px",
                  }}
                >
                  <TextField
                    id="min"
                    required
                    margin="dense"
                    label="Minimum"
                    fullWidth
                    value={datapointForm.values.min}
                    onChange={(e) => {
                      if (
                        !acceptNegativeAndFloat({
                          new: e,
                          old: datapointForm.values.min,
                        })
                      )
                        return;
                      datapointForm.handleChange(e);
                    }}
                    onBlur={datapointForm.handleBlur}
                    helperText={
                      datapointForm.touched.min ? datapointForm.errors.min : ""
                    }
                    error={
                      datapointForm.touched.min &&
                      (datapointForm.errors.min ||
                        !validateRange({
                          min: datapointForm.values.min,
                          max: datapointForm.values.max,
                        }))
                    }
                  />
                  <TextField
                    id="max"
                    required
                    margin="dense"
                    label="Maximum"
                    fullWidth
                    value={datapointForm.values.max}
                    onChange={(e) => {
                      if (
                        !acceptNegativeAndFloat({
                          new: e,
                          old: datapointForm.values.max,
                        })
                      )
                        return;

                      datapointForm.handleChange(e);
                    }}
                    onBlur={datapointForm.handleBlur}
                    helperText={
                      datapointForm.touched.max ? datapointForm.errors.max : ""
                    }
                    error={
                      datapointForm.touched.max &&
                      (datapointForm.errors.max ||
                        !validateRange({
                          min: datapointForm.values.min,
                          max: datapointForm.values.max,
                        }))
                    }
                  />
                </div>
                <FieldArray
                  name="colors"
                  render={(arrayHelpers) => (
                    <div style={{ marginTop: "10px" }}>
                      <Grid container spacing={1}>
                        {datapointForm.values.colors.map((elm, index) => (
                          <Grid item xs={6}>
                            <TextField
                              margin="dense"
                              color="secondary"
                              fullWidth
                              name={`colors[${index}].value`}
                              value={datapointForm.values.colors[index].value}
                              label={datapointForm.values.colors[index].label}
                              onChange={datapointForm.handleChange}
                              onBlur={datapointForm.handleBlur}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {datapointForm.values.colors.length > 2 ? (
                                      <RemoveCircleOutlineIcon
                                        fontSize="small"
                                        className={classes.remove}
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      />
                                    ) : null}
                                  </InputAdornment>
                                ),
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <StopIcon
                                      fontSize="small"
                                      style={{
                                        color:
                                          datapointForm.values.colors[index]
                                            .value,
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              error={
                                datapointForm.touched?.colors &&
                                datapointForm.errors?.colors &&
                                datapointForm.touched?.colors.length > 0 &&
                                datapointForm.errors?.colors.length > 0 &&
                                datapointForm.touched.colors[index] &&
                                datapointForm.errors.colors[index]
                                  ? true
                                  : false
                              }
                              helperText={
                                datapointForm.touched?.colors &&
                                datapointForm.errors?.colors &&
                                datapointForm.touched?.colors.length > 0 &&
                                datapointForm.errors?.colors.length > 0 &&
                                datapointForm.touched.colors[index] &&
                                datapointForm.errors.colors[index]
                                  ? datapointForm.errors.colors[index].value
                                  : ""
                              }
                            />
                          </Grid>
                        ))}

                        <Grid item xs={6}>
                          <div
                            className={classes.addDiv}
                            onClick={() => {
                              if (!datapointForm.errors.name) {
                                arrayHelpers.push({
                                  label: `Color ${
                                    datapointForm.values.colors.length + 1
                                  }`,
                                  value: "",
                                });
                              }
                            }}
                          >
                            <span className={classes.add}>
                              <AddCircleIcon />
                              <p>
                                <b>Add another color</b>
                              </p>
                            </span>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  )}
                />
              </FormikProvider>
            </Fragment>
          )}
          <div
            style={{
              display: "flex",
              margin: "10px 2px",
              justifyContent: customRange ? "flex-end" : "space-between",
              alignItems: "center",
            }}
          >
            {!customRange ? (
              <span
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
                  Invert color spectrum
                </p>
                <Switch
                  disabled={Object.keys(datapointForm.errors).length}
                  checked={reverse}
                  color="secondary"
                  onClick={() => setReverse(!reverse)}
                />
              </span>
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: generateBackground(
                  customRange
                    ? datapointForm.values.customColors.map((e) => e.value)
                    : datapointForm.values.colors.map((e) => e.value),
                  reverse
                ),
                opacity: "0.6",
                borderRadius: "20px",
                width: "100px",
                height: "10px",
                position: "relative",
                bottom: "5px",
              }}
            >
              <p
                style={{
                  position: "relative",
                  top: "10px",
                  fontSize: "13px",
                }}
              >
                {!customRange
                  ? datapointForm.values.min
                  : datapointForm.values.customColors.length
                  ? datapointForm.values.customColors[0].min
                  : ""}
              </p>
              <p
                style={{
                  position: "relative",
                  top: "10px",
                  fontSize: "13px",
                }}
              >
                {!customRange
                  ? datapointForm.values.max
                  : datapointForm.values.customColors.length
                  ? datapointForm.values.customColors[
                      datapointForm.values.customColors.length - 1
                    ].max
                  : ""}
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              datapointForm.resetForm();
              props.close();
            }}
            color="error"
          >
            Cancel
          </Button>
          {props.handleReset ? (
            <Button onClick={props.handleReset} color="secondary">
              Reset
            </Button>
          ) : null}
          <Button
            type="submit"
            color="secondary"
            disabled={
              customRange
                ? Object.keys(datapointForm.errors).length > 0 ||
                  !validateCustomRanges(datapointForm.values.customColors)
                : Object.keys(datapointForm.errors).length > 0 ||
                  !validateRange({
                    min: datapointForm.values.min,
                    max: datapointForm.values.max,
                  })
            }
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
