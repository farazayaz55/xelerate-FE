//----------------CORE-----------------//
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//----------------MUI-----------------//
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
//----------------MUI ICONS-----------------//
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
//----------------EXTERNAL-----------------//
import { next, back, reset } from "rtkSlices/roiWizard";
import { setRoiForm } from "rtkSlices/roiForm";
import DeleteAlert from "components/Alerts/Delete";

export default function Investment(props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [openSetup, setOpenSetup] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [deviceFieldError, setDeviceFieldError] = useState("");
  const [openOperation, setOpenOperation] = useState(false);
  const [inState, setInState] = useState(true);
  const [slideWay, setSlideWay] = useState("left");

  const useStyles = makeStyles({
    buttons: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      margin: "20px auto",
      gap: 10,
    },
    backColor: {
      color: metaDataValue.branding.secondaryColor,
    },
    next: {
      display: "flex",
      width: "50%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: metaDataValue.branding.secondaryColor,
      cursor: "pointer",
      "&:hover": {
        opacity: "0.9",
      },
      borderRadius: 6,
    },
    back: {
      display: "flex",
      width: "50%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F5F5",
      borderRadius: 6,
      cursor: "pointer",
    },
    white: {
      color: "white",
    },
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
    },
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
    formDiv: {
      height: "100%",
      width: "100%",
    },
    form: {
      gap: "20px",
      overflow: "scroll",
      minWidth: "200px",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      // maxHeight: "calc(100vh - 346px)",
      margin: "auto",
    },
  });

  const classes = useStyles(props);

  function generateTotal(values) {
    let total = 0;
    values.setup.forEach((elm) => {
      if (
        elm &&
        elm.value &&
        elm.label != "Connectivity Price per device per month" &&
        elm.label != "Device Price Per Unit" &&
        elm.label != "Device Volume"
      ) {
        total +=
          typeof elm.value != "number"
            ? parseInt(elm.value.replaceAll(",", ""))
            : elm.value;
      }
    });
    values.operation.forEach((elm) => {
      if (elm && elm.value) {
        total +=
          typeof elm.value != "number"
            ? parseInt(elm.value.replaceAll(",", "")) * roiFormValue.tenure
            : elm.value * roiFormValue.tenure;
      }
    });
    total = values.platformCost
      ? total + values.platformCost * roiFormValue.tenure
      : total;
    total = values.supportCost
      ? total + values.supportCost * roiFormValue.tenure
      : total;
    return parseInt(total);
  }

  const investmentForm = useFormik({
    initialValues: {
      platform: roiFormValue.investments?.platform
        ? roiFormValue.investments.platform
        : "Cloud",
      platformCost: roiFormValue.investments?.platformCost
        ? roiFormValue.investments.platformCost
        : "",
      support: roiFormValue.investments?.support
        ? roiFormValue.investments.support
        : "Business Hours",
      supportCost: roiFormValue.investments?.supportCost
        ? roiFormValue.investments.supportCost
        : "",
      setup: roiFormValue.investments?.setup
        ? roiFormValue.investments.setup
        : [
            { label: "Device Price Per Unit", value: "" },
            { label: "Device Volume", value: "" },
            { label: "Connectivity Price per device per month", value: "" },
            { label: "One-Off System Price", value: "" },
            { label: "Bespoke Development Cost (one off)", value: "" },
            { label: "Implementation Cost (one off)", value: "" },
          ],
      operation: roiFormValue.investments?.operation
        ? roiFormValue.investments.operation
        : [{ label: "Managed Services", value: "" }],
      name: "",
    },
    validationSchema: Yup.object(
      openSetup || openOperation
        ? {
            name: Yup.string().required("Required Field"),
          }
        : {
            platform: Yup.string(),
            support: Yup.string(),
            platformCost: Yup.string(),
            supportCost: Yup.string(),
            setup: Yup.array().of(
              Yup.object().shape({
                value: Yup.string(), // these constraints take precedence
              })
            ),
            operation: Yup.array().of(
              Yup.object().shape({
                value: Yup.string(), // these constraints take precedence
              })
            ),
          }
    ),
    onSubmit: async (values) => {
      let valid = true;
      if (
        !values.platformCost &&
        !values.supportCost &&
        !values.setup.filter((s) => s.value).length &&
        !values.operation.filter((s) => s.value).length
      ) {
        enqueueSnackbar(
          {
            message: "Please set atleast one cost",
            variant: "warning",
            title: "Investments",
          },
          {
            timeOut: 1000,
          }
        );
        return;
      }
      let tempValues = JSON.parse(JSON.stringify(values));
      tempValues.setup.forEach((v) => {
        if (v.value) {
          v.value =
            typeof v.value != "number"
              ? parseInt(v.value.replaceAll(",", ""))
              : v.value;
        }
        if (v.label == "Device Volume") {
          if (
            v.value &&
            !values.setup.find((s) => s.label == "Device Price Per Unit").value
          ) {
            setDeviceFieldError("Required field");
            valid = false;
          }
          if (!v.value) {
            v.value = 1;
          }
        }
      });
      if (!valid) {
        return;
      }
      tempValues.operation.forEach((v) => {
        if (v.value) {
          v.value =
            typeof v.value != "number"
              ? parseInt(v.value.replaceAll(",", ""))
              : v.value;
        }
      });
      if (
        tempValues.platformCost &&
        typeof tempValues.platformCost != "number"
      ) {
        tempValues.platformCost = parseInt(
          tempValues.platformCost.replaceAll(",", "")
        );
      }
      if (tempValues.supportCost && typeof tempValues.supportCost != "number") {
        tempValues.supportCost = parseInt(
          tempValues.supportCost.replaceAll(",", "")
        );
      }
      delete tempValues.name;
      delete values.name;
      let totalSetup = generateTotal(tempValues);
      let totalDevicesCost =
        tempValues.setup.find((s) => s.label == "Device Price Per Unit").value *
        tempValues.setup.find((s) => s.label == "Device Volume").value;
      let totalConnectivityCost =
        tempValues.setup.find(
          (s) => s.label == "Connectivity Price per device per month"
        ).value *
        tempValues.setup.find((s) => s.label == "Device Volume").value *
        12;
      totalSetup =
        totalSetup +
        totalDevicesCost +
        totalConnectivityCost * roiFormValue.tenure;
      dispatch(
        setRoiForm({
          ...roiFormValue,
          investments: {
            ...roiFormValue.investments,
            ...tempValues,
            totalSetup,
            totalDevicesCost,
            totalConnectivityCost,
          },
        })
      );
      setSlideWay("right");
      setInState(false);
      setTimeout(() => {
        dispatch(next());
      }, 200);
    },
  });

  const handleCloseSetup = () => {
    setOpenSetup(false);
  };
  const handleCloseOperation = () => {
    setOpenOperation(false);
  };

  const handleClickOpenSetup = () => {
    setOpenSetup(true);
  };

  const handleClickOpenOperation = () => {
    setOpenOperation(true);
  };

  function chkUnique(name) {
    let res = true;

    if (roiFormValue?.costSavings?.savings)
      roiFormValue.costSavings.savings.forEach((elm) => {
        if (elm.label.toLowerCase() == name.toLowerCase()) res = false;
      });

    investmentForm.values.setup.forEach((elm) => {
      if (elm.label.toLowerCase() == name.toLowerCase()) res = false;
    });

    investmentForm.values.operation.forEach((elm) => {
      if (elm.label.toLowerCase() == name.toLowerCase()) res = false;
    });

    if (!res)
      enqueueSnackbar(
        {
          message: "Cost already exists",
          variant: "warning",
          title: "Duplication",
        },
        {
          timeOut: 1000,
        }
      );
    return res;
  }

  const onReset = () => {
    investmentForm.resetForm();
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <FormikProvider value={investmentForm}>
          <form onSubmit={investmentForm.handleSubmit}>
            <Slide direction={slideWay} in={inState}>
              <div className={classes.form}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    minWidth: "200px",
                    width: "50%",
                    margin: "0 auto",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                      border: "1px solid #dbdbdb",
                      borderRadius: 4,
                      padding: 10,
                      marginTop: 15,
                    }}
                  >
                    <div style={{ padding: 10 }}>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#666666",
                          margin: "0px 20px 0px 0px",
                          marginTop: "-38px",
                          width: "fit-content",
                          padding: "5px 10px",
                          backgroundColor: "white",
                        }}
                      >
                        <b>Platform & Hosting</b>
                      </p>
                      <RadioGroup
                        row
                        style={{ marginBottom: "20px", marginTop: 20 }}
                        name="platform"
                        value={investmentForm.values.platform}
                        onChange={investmentForm.handleChange}
                      >
                        {["On Premise", "Cloud", "Hybrid"].map((elm) => {
                          return (
                            <FormControlLabel
                              value={elm}
                              control={<Radio color="secondary" />}
                              label={elm}
                            />
                          );
                        })}
                        <TextField
                          color="secondary"
                          label="Cost"
                          margin="dense"
                          id="platformCost"
                          value={
                            investmentForm.values.platformCost
                              ? typeof investmentForm.values.platformCost ==
                                "number"
                                ? investmentForm.values.platformCost.toLocaleString(
                                    "en-GB"
                                  )
                                : parseInt(
                                    investmentForm.values.platformCost.replaceAll(
                                      ",",
                                      ""
                                    )
                                  ).toLocaleString("en-GB")
                              : investmentForm.values.platformCost
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setFieldError("");
                            }
                            if (
                              parseInt(e.target.value) ||
                              e.target.value == ""
                            ) {
                              investmentForm.handleChange(e);
                            }
                          }}
                          onBlur={investmentForm.handleBlur}
                          error={
                            investmentForm.touched.platformCost &&
                            investmentForm.errors.platformCost
                              ? true
                              : false
                          }
                          helperText={
                            investmentForm.touched.platformCost
                              ? investmentForm.errors.platformCost
                              : ""
                          }
                        />
                      </RadioGroup>
                    </div>
                    <Divider orientation="vertical" flexItem />
                    <div style={{ marginLeft: "20px", padding: 10 }}>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#666666",
                          margin: "0px 20px 0px 0px",
                          marginTop: "-38px",
                          width: "fit-content",
                          padding: "5px 10px",
                          backgroundColor: "white",
                        }}
                      >
                        <b>Support Type</b>
                      </p>
                      <RadioGroup
                        row
                        style={{ marginBottom: "20px", marginTop: 20 }}
                        name="support"
                        value={investmentForm.values.support}
                        onChange={investmentForm.handleChange}
                      >
                        {["Premium 24/7", "Business Hours"].map((elm) => {
                          return (
                            <FormControlLabel
                              value={elm}
                              control={<Radio color="secondary" />}
                              label={elm}
                            />
                          );
                        })}
                        <TextField
                          margin="dense"
                          color="secondary"
                          label="Cost"
                          id="supportCost"
                          value={
                            investmentForm.values.supportCost
                              ? typeof investmentForm.values.supportCost ==
                                "number"
                                ? investmentForm.values.supportCost.toLocaleString(
                                    "en-GB"
                                  )
                                : parseInt(
                                    investmentForm.values.supportCost.replaceAll(
                                      ",",
                                      ""
                                    )
                                  ).toLocaleString("en-GB")
                              : investmentForm.values.supportCost
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setFieldError("");
                            }
                            if (
                              parseInt(e.target.value) ||
                              e.target.value == ""
                            ) {
                              investmentForm.handleChange(e);
                            }
                          }}
                          onBlur={investmentForm.handleBlur}
                          error={
                            investmentForm.touched.supportCost &&
                            investmentForm.errors.supportCost
                              ? true
                              : false
                          }
                          helperText={
                            investmentForm.touched.supportCost
                              ? investmentForm.errors.supportCost
                              : ""
                          }
                        />
                      </RadioGroup>
                    </div>
                  </span>
                  <span
                    style={{
                      border: "1px solid #dbdbdb",
                      borderRadius: 4,
                      padding: "20px",
                      marginTop: "5px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#666666",
                        margin: "0px 20px 0px 0px",
                        marginTop: "-38px",
                        width: "fit-content",
                        padding: "5px 10px",
                        backgroundColor: "white",
                      }}
                    >
                      <b>Setup Cost</b>
                    </p>
                    <FieldArray
                      name="setup"
                      render={(arrayHelpers) => (
                        <div>
                          <Dialog open={openSetup} onClose={handleCloseSetup}>
                            <DialogTitle>Add Custom</DialogTitle>
                            <DialogContent style={{ paddingTop: 10 }}>
                              <TextField
                                color="secondary"
                                autoFocus
                                id="name"
                                value={investmentForm.values.name}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setFieldError("");
                                  }
                                  investmentForm.handleChange(e);
                                }}
                                onBlur={investmentForm.handleBlur}
                                label="Name"
                                fullWidth
                                error={
                                  investmentForm.touched.name &&
                                  investmentForm.errors.name
                                    ? true
                                    : false
                                }
                                helperText={
                                  investmentForm.touched.name
                                    ? investmentForm.errors.name
                                    : ""
                                }
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={handleCloseSetup}
                                style={{ color: "#bf3535" }}
                              >
                                Cancel
                              </Button>
                              <Button
                                color="secondary"
                                onClick={() => {
                                  if (
                                    !investmentForm.errors.name &&
                                    chkUnique(investmentForm.values.name)
                                  ) {
                                    arrayHelpers.push({
                                      label: investmentForm.values.name,
                                      value: "",
                                    });
                                    handleCloseSetup();
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <Grid container spacing={2}>
                            {investmentForm.values.setup.map((elm, index) => (
                              <Grid item xs={6}>
                                <TextField
                                  margin="dense"
                                  color="secondary"
                                  fullWidth
                                  name={`setup[${index}].value`}
                                  id={investmentForm.values.setup[
                                    index
                                  ].label.replaceAll(" ", "_")}
                                  value={
                                    investmentForm.values.setup[index].value
                                      ? typeof investmentForm.values.setup[
                                          index
                                        ].value == "number"
                                        ? investmentForm.values.setup[
                                            index
                                          ].value.toLocaleString("en-GB")
                                        : parseInt(
                                            investmentForm.values.setup[
                                              index
                                            ].value.replaceAll(",", "")
                                          ).toLocaleString("en-GB")
                                      : investmentForm.values.setup[index].value
                                  }
                                  label={
                                    investmentForm.values.setup[index].label
                                  }
                                  onChange={(e) => {
                                    if (
                                      e.target.value &&
                                      investmentForm.values.setup[index]
                                        .label == "Device Price Per Unit"
                                    ) {
                                      setDeviceFieldError("");
                                    }
                                    if (
                                      !e.target.value &&
                                      investmentForm.values.setup[index]
                                        .label == "Device Volume"
                                    ) {
                                      setDeviceFieldError("");
                                    }
                                    if (e.target.value) {
                                      setFieldError("");
                                    }
                                    if (
                                      parseInt(e.target.value) ||
                                      e.target.value == ""
                                    ) {
                                      investmentForm.handleChange(e);
                                    }
                                  }}
                                  onBlur={investmentForm.handleBlur}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <RemoveCircleOutlineIcon
                                          fontSize="small"
                                          className={classes.remove}
                                          onClick={() =>
                                            arrayHelpers.remove(index)
                                          }
                                        />
                                      </InputAdornment>
                                    ),
                                  }}
                                  // error={
                                  //   investmentForm.touched?.setup &&
                                  //   investmentForm.errors?.setup &&
                                  //   investmentForm.touched?.setup.length > 0 &&
                                  //   investmentForm.errors?.setup.length > 0 &&
                                  //   investmentForm.touched.setup[index] &&
                                  //   investmentForm.errors.setup[index]
                                  //     ? true
                                  //     : false
                                  // }
                                  // helperText={
                                  //   investmentForm.touched?.setup &&
                                  //   investmentForm.errors?.setup &&
                                  //   investmentForm.touched?.setup.length > 0 &&
                                  //   investmentForm.errors?.setup.length > 0 &&
                                  //   investmentForm.touched.setup[index] &&
                                  //   investmentForm.errors.setup[index]
                                  //     ? investmentForm.errors.setup[index].value
                                  //     : ""
                                  // }
                                />
                                {investmentForm.values.setup[index].label ==
                                  "Device Price Per Unit" &&
                                deviceFieldError ? (
                                  <span style={{ color: "red", fontSize: 13 }}>
                                    {deviceFieldError}
                                  </span>
                                ) : null}
                                {investmentForm.values.setup[index].label ==
                                  "Connectivity Price per device per month" &&
                                investmentForm.values.setup[index - 1].label ==
                                  "Device Volume" &&
                                investmentForm.values.setup[index].value !=
                                  "" &&
                                investmentForm.values.setup[index - 1].value !=
                                  "" ? (
                                  <div>
                                    <p
                                      style={{
                                        fontSize: "13px",
                                        color: "#666666",
                                        marginLeft: "5px",
                                      }}
                                    >
                                      <b>Total Connectivity cost (yearly)</b> :{" "}
                                      <span
                                        style={{
                                          color: "#666666",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {" "}
                                        {typeof investmentForm.values.setup[
                                          index
                                        ].value != "number" &&
                                        typeof investmentForm.values.setup[
                                          index - 1
                                        ].value != "number"
                                          ? (
                                              parseInt(
                                                investmentForm.values.setup[
                                                  index
                                                ].value.replaceAll(",", "")
                                              ) *
                                              parseInt(
                                                investmentForm.values.setup[
                                                  index - 1
                                                ].value.replaceAll(",", "")
                                              ) *
                                              12
                                            ).toLocaleString("en-GB")
                                          : (
                                              investmentForm.values.setup[index]
                                                .value *
                                              investmentForm.values.setup[
                                                index - 1
                                              ].value *
                                              12
                                            ).toLocaleString("en-GB")}
                                      </span>
                                    </p>
                                  </div>
                                ) : (
                                  ""
                                )}
                                {investmentForm.values.setup[index].label ==
                                  "Device Price Per Unit" &&
                                investmentForm.values.setup[index + 1].label ==
                                  "Device Volume" &&
                                investmentForm.values.setup[index].value !=
                                  "" &&
                                investmentForm.values.setup[index + 1].value !=
                                  "" ? (
                                  <div>
                                    <p
                                      style={{
                                        fontSize: "13px",
                                        color: "#666666",
                                        marginLeft: "5px",
                                      }}
                                    >
                                      <b>Devices Total Cost (one-off)</b> :{" "}
                                      <span
                                        style={{
                                          color: "#666666",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {" "}
                                        {typeof investmentForm.values.setup[
                                          index
                                        ].value != "number" &&
                                        typeof investmentForm.values.setup[
                                          index + 1
                                        ].value != "number"
                                          ? (
                                              parseInt(
                                                investmentForm.values.setup[
                                                  index
                                                ].value.replaceAll(",", "")
                                              ) *
                                              parseInt(
                                                investmentForm.values.setup[
                                                  index + 1
                                                ].value.replaceAll(",", "")
                                              )
                                            ).toLocaleString("en-GB")
                                          : (
                                              investmentForm.values.setup[index]
                                                .value *
                                              investmentForm.values.setup[
                                                index + 1
                                              ].value
                                            ).toLocaleString("en-GB")}
                                      </span>
                                    </p>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </Grid>
                            ))}

                            <Grid item xs={6}>
                              <div
                                className={classes.addDiv}
                                onClick={handleClickOpenSetup}
                              >
                                <span className={classes.add}>
                                  <AddCircleIcon />
                                  <p>
                                    <b>Add another cost</b>
                                  </p>
                                </span>
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      )}
                    />
                  </span>
                  <span
                    style={{
                      border: "1px solid #dbdbdb",
                      borderRadius: 4,
                      padding: "20px",
                      marginTop: "5px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#666666",
                        margin: "0px 20px 0px 0px",
                        marginTop: "-38px",
                        width: "fit-content",
                        padding: "5px 10px",
                        backgroundColor: "white",
                      }}
                    >
                      <b>Operational Cost</b>
                    </p>
                    <FieldArray
                      name="operation"
                      render={(arrayHelpers) => (
                        <div>
                          <Dialog
                            open={openOperation}
                            onClose={handleCloseOperation}
                          >
                            <DialogTitle>Add Custom</DialogTitle>
                            <DialogContent style={{ paddingTop: 10 }}>
                              <TextField
                                color="secondary"
                                autoFocus
                                id="name"
                                value={investmentForm.values.name}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setFieldError("");
                                  }
                                  investmentForm.handleChange(e);
                                }}
                                onBlur={investmentForm.handleBlur}
                                label="Name"
                                fullWidth
                                error={
                                  investmentForm.touched.name &&
                                  investmentForm.errors.name
                                    ? true
                                    : false
                                }
                                helperText={
                                  investmentForm.touched.name
                                    ? investmentForm.errors.name
                                    : ""
                                }
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={handleCloseOperation}
                                style={{ color: "#bf3535" }}
                              >
                                Cancel
                              </Button>
                              <Button
                                color="secondary"
                                onClick={() => {
                                  if (
                                    !investmentForm.errors.name &&
                                    chkUnique(investmentForm.values.name)
                                  ) {
                                    arrayHelpers.push({
                                      label: investmentForm.values.name,
                                      value: "",
                                    });
                                    handleCloseOperation();
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <Grid container spacing={2}>
                            {investmentForm.values.operation.map(
                              (elm, index) => (
                                <Grid item xs={6}>
                                  <TextField
                                    margin="dense"
                                    color="secondary"
                                    fullWidth
                                    name={`operation[${index}].value`}
                                    id={investmentForm.values.operation[
                                      index
                                    ].label.replaceAll(" ", "_")}
                                    value={
                                      investmentForm.values.operation[index]
                                        .value
                                        ? typeof investmentForm.values
                                            .operation[index].value == "number"
                                          ? investmentForm.values.operation[
                                              index
                                            ].value.toLocaleString("en-GB")
                                          : parseInt(
                                              investmentForm.values.operation[
                                                index
                                              ].value.replaceAll(",", "")
                                            ).toLocaleString("en-GB")
                                        : investmentForm.values.operation[index]
                                            .value
                                    }
                                    label={
                                      investmentForm.values.operation[index]
                                        .label
                                    }
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setFieldError("");
                                      }
                                      investmentForm.handleChange(e);
                                    }}
                                    onBlur={investmentForm.handleBlur}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <RemoveCircleOutlineIcon
                                            fontSize="small"
                                            className={classes.remove}
                                            onClick={() =>
                                              arrayHelpers.remove(index)
                                            }
                                          />
                                        </InputAdornment>
                                      ),
                                    }}
                                    error={
                                      investmentForm.touched?.operation &&
                                      investmentForm.errors?.operation &&
                                      investmentForm.touched?.operation.length >
                                        0 &&
                                      investmentForm.errors?.operation.length >
                                        0 &&
                                      investmentForm.touched.operation[index] &&
                                      investmentForm.errors.operation[index]
                                        ? true
                                        : false
                                    }
                                    helperText={
                                      investmentForm.touched?.operation &&
                                      investmentForm.errors?.operation &&
                                      investmentForm.touched?.operation.length >
                                        0 &&
                                      investmentForm.errors?.operation.length >
                                        0 &&
                                      investmentForm.touched.operation[index] &&
                                      investmentForm.errors.operation[index]
                                        ? investmentForm.errors.operation[index]
                                            .value
                                        : ""
                                    }
                                  />
                                </Grid>
                              )
                            )}

                            <Grid item xs={6}>
                              <div
                                className={classes.addDiv}
                                onClick={handleClickOpenOperation}
                              >
                                <span className={classes.add}>
                                  <AddCircleIcon />
                                  <p>
                                    <b>Add another cost</b>
                                  </p>
                                </span>
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      )}
                    />
                  </span>
                </div>
                {fieldError ? (
                  <div
                    style={{ textAlign: "center", fontSize: 13, color: "red" }}
                  >
                    {fieldError}
                  </div>
                ) : null}
                <p
                  style={{
                    color: "#c4c4c4",
                    width: "50%",
                    margin: "15px auto",
                  }}
                >
                  Note: all recurring costs are per Annum
                </p>
              </div>
            </Slide>

            <div className={classes.buttons}>
              <Button
                color="secondary"
                onClick={() => {
                  let values = investmentForm.values;
                  delete values.name;
                  dispatch(
                    setRoiForm({
                      ...roiFormValue,
                      investments: { ...roiFormValue.investments, ...values },
                    })
                  );
                  setInState(false);
                  setTimeout(() => {
                    dispatch(back());
                  }, 200);
                }}
              >
                Back
              </Button>
              <Button color="secondary" type="submit">
                Next
              </Button>
              <Button color="secondary" onClick={() => setResetForm(true)}>
                Reset
              </Button>
            </div>
          </form>
        </FormikProvider>
      </div>
      {resetForm ? (
        <DeleteAlert
          deleteModal={true}
          question="Are you sure you want to reset the ROI form?"
          platformCheck={false}
          id={""}
          handleDelete={onReset}
          handleClose={() => setResetForm(false)}
          deleteResult={{ isLoading: false }}
        />
      ) : null}
    </div>
  );
}
