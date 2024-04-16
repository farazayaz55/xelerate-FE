//----------------CORE-----------------//
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//----------------MUI-----------------//
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
import MenuBookIcon from "@mui/icons-material/MenuBook";
//----------------EXTERNAL-----------------//
import { next, back, reset } from "rtkSlices/roiWizard";
import { setRoiForm } from "rtkSlices/roiForm";
import Guide from "assets/img/costsavings-guide.png";
import Popups from "./Popups";
import DeleteAlert from "components/Alerts/Delete";

export default function Details(props) {
  const { enqueueSnackbar } = useSnackbar();
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [guide, setGuide] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [inState, setInState] = useState(true);
  const [slideWay, setSlideWay] = useState("left");
  const [resetForm, setResetForm] = useState(false);
  const dispatch = useDispatch();
  const useStyles = makeStyles({
    guide: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px",
      color: metaDataValue.branding.secondaryColor,
      border: `1px solid ${metaDataValue.branding.secondaryColor}`,
      borderRadius: "10px",
      padding: "5px",
      cursor: "pointer",
      "&:hover": {
        opacity: "0.9",
      },
      "&:active": {
        opacity: "1",
      },
    },
    addDiv: {
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
    },
    button: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: "55px",
      border: "1px solid #c4c4c4",
      borderRadius: "5px",
      cursor: "pointer",
      "&:hover": {
        border: `2px solid ${metaDataValue.branding.primaryColor}`,
      },
      "&:active": {
        border: "1px solid #c4c4c4",
      },
    },
    white: {
      color: "white",
    },
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
    formSpan: {
      maxWidth: "800px",
    },
    form: {
      gap: "20px",
      overflow: "scroll",
      minWidth: "200px",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      // maxHeight:'calc(100vh - 346px)',
      margin: "auto",
    },
    formDiv: {
      height: "100%",
      width: "100%",
    },
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
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
  });

  const classes = useStyles(props);

  function generateTotal() {
    let total = 0;
    costSavingForm.values.savings.forEach((elm) => {
      if (elm.value) {
        total +=
          typeof elm.value != "number"
            ? parseInt(elm.value.replaceAll(",", ""))
            : elm.value;
      }
    });
    if (roiFormValue.costSavings?.siteVisits)
      total = roiFormValue.costSavings?.siteVisits
        ? total + roiFormValue.costSavings?.siteVisits
        : total;
    if (roiFormValue.costSavings?.outage)
      total = roiFormValue.costSavings?.outage
        ? total + roiFormValue.costSavings?.outage
        : total;
    return total;
  }

  const costSavingForm = useFormik({
    initialValues: {
      savings: roiFormValue.costSavings?.savings
        ? roiFormValue.costSavings.savings
        : [
            { label: "Staff", value: "" },
            { label: "Asset Servicing", value: "" },
            { label: "Energy", value: "" },
          ],
      name: "",
    },
    validationSchema: Yup.object(
      open
        ? {
            name: Yup.string().required("Required Field"),
          }
        : {
            savings: Yup.array()
              .min(1, "at least 1")
              .required("required")
              .of(
                Yup.object().shape({
                  value: Yup.string(), // these constraints take precedence
                })
              ),
          }
    ),
    onSubmit: async (values) => {
      let total = 0;
      let tempValues = JSON.parse(JSON.stringify(values));
      tempValues.savings.forEach((v) => {
        if (v.value) {
          v.value =
            typeof v.value != "number"
              ? parseInt(v.value.replaceAll(",", ""))
              : v.value;
          total += v.value;
        }
      });
      if (total > 0) {
        delete tempValues.name;
        delete values.name;
        let totalBenefit = generateTotal();
        dispatch(
          setRoiForm({
            ...roiFormValue,
            costSavings: {
              ...roiFormValue.costSavings,
              ...tempValues,
              totalBenefit,
            },
          })
        );
        setSlideWay("right");
        setInState(false);
        setTimeout(() => {
          dispatch(next());
        }, 200);
      } else {
        enqueueSnackbar(
          {
            message: "Set Atleast one cost",
            variant: "warning",
            title: "Cost Savings",
          },
          {
            timeOut: 1000,
          }
        );
      }
    },
  });

  const handleClickGuide = () => {
    setGuide(!guide);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  function chkUnique(name) {
    let res = true;

    if (roiFormValue?.investments?.setup)
      roiFormValue.investments.setup.forEach((elm) => {
        if (elm.label.toLowerCase() == name.toLowerCase()) res = false;
      });

    if (roiFormValue?.investments?.operation)
      roiFormValue.investments.operation.forEach((elm) => {
        if (elm.label.toLowerCase() == name.toLowerCase()) res = false;
      });

    costSavingForm.values.savings.forEach((elm) => {
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
    costSavingForm.resetForm();
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <FormikProvider value={costSavingForm}>
          <form onSubmit={costSavingForm.handleSubmit}>
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
                  <Popups />

                  <FieldArray
                    name="savings"
                    render={(arrayHelpers) => (
                      <div>
                        <Dialog open={open} onClose={handleClose}>
                          <DialogTitle>Add Custom</DialogTitle>
                          <DialogContent style={{ paddingTop: 10 }}>
                            <TextField
                              color="secondary"
                              autoFocus
                              id="name"
                              value={costSavingForm.values.name}
                              onChange={costSavingForm.handleChange}
                              onBlur={costSavingForm.handleBlur}
                              label="Name"
                              fullWidth
                              error={
                                costSavingForm.touched.name &&
                                costSavingForm.errors.name
                                  ? true
                                  : false
                              }
                              helperText={
                                costSavingForm.touched.name
                                  ? costSavingForm.errors.name
                                  : ""
                              }
                            />
                          </DialogContent>
                          <DialogActions>
                            <Button
                              onClick={handleClose}
                              style={{ color: "#bf3535" }}
                            >
                              Cancel
                            </Button>
                            <Button
                              color="secondary"
                              onClick={() => {
                                if (
                                  !costSavingForm.errors.name &&
                                  chkUnique(costSavingForm.values.name)
                                ) {
                                  arrayHelpers.push({
                                    label: costSavingForm.values.name,
                                    value: "",
                                  });
                                  handleClose();
                                }
                              }}
                            >
                              Add
                            </Button>
                          </DialogActions>
                        </Dialog>

                        <Grid container spacing={2}>
                          {costSavingForm.values.savings.map(
                            (friend, index) => (
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  color="secondary"
                                  name={`savings[${index}].value`}
                                  id={costSavingForm.values.savings[
                                    index
                                  ].label.replaceAll(" ", "_")}
                                  value={
                                    costSavingForm.values.savings[index].value
                                      ? typeof costSavingForm.values.savings[
                                          index
                                        ].value == "number"
                                        ? costSavingForm.values.savings[
                                            index
                                          ].value.toLocaleString("en-GB")
                                        : parseInt(
                                            costSavingForm.values.savings[
                                              index
                                            ].value.replaceAll(",", "")
                                          ).toLocaleString("en-GB")
                                      : costSavingForm.values.savings[index]
                                          .value
                                  }
                                  label={
                                    costSavingForm.values.savings[index].label
                                  }
                                  onChange={(e) => {
                                    if (
                                      e.target.value &&
                                      costSavingForm.values.savings[index]
                                        .label == "Staff"
                                    ) {
                                      setStaffError("");
                                    }
                                    if (
                                      parseInt(e.target.value) ||
                                      e.target.value == ""
                                    ) {
                                      costSavingForm.handleChange(e);
                                    }
                                  }}
                                  onBlur={costSavingForm.handleBlur}
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
                                  //   costSavingForm.touched?.savings &&
                                  //   costSavingForm.errors?.savings &&
                                  //   costSavingForm.touched?.savings.length >
                                  //     0 &&
                                  //   costSavingForm.errors?.savings.length > 0 &&
                                  //   costSavingForm.touched.savings[index] &&
                                  //   costSavingForm.errors.savings[index]
                                  //     ? true
                                  //     : false
                                  // }
                                  // helperText={
                                  //   costSavingForm.touched?.savings &&
                                  //   costSavingForm.errors?.savings &&
                                  //   costSavingForm.touched?.savings.length >
                                  //     0 &&
                                  //   costSavingForm.errors?.savings.length > 0 &&
                                  //   costSavingForm.touched.savings[index] &&
                                  //   costSavingForm.errors.savings[index]
                                  //     ? costSavingForm.errors.savings[index]
                                  //         .value
                                  //     : ""
                                  // }
                                />
                                {costSavingForm.values.savings[index].label ==
                                  "Staff" && staffError ? (
                                  <span style={{ fontSize: 13, color: "red" }}>
                                    {staffError}
                                  </span>
                                ) : null}
                              </Grid>
                            )
                          )}
                          <Grid item xs={6}>
                            <div
                              className={classes.addDiv}
                              onClick={handleClickOpen}
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
                  <div
                    onClick={handleClickGuide}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ color: "#c4c4c4" }}>
                      Note: all recurring costs are per Annum
                    </p>
                    <span className={classes.guide}>
                      <MenuBookIcon style={{ height: "20px", width: "20px" }} />
                      <p style={{ fontSize: "12px" }}>
                        <b>Show Guide</b>
                      </p>
                    </span>

                    <Dialog
                      maxWidth="lg"
                      open={guide}
                      onClose={handleClickGuide}
                    >
                      <DialogTitle>
                        ROI Calculator - Cost Savings Guide
                      </DialogTitle>
                      <DialogContent style={{ textAlign: "center" }}>
                        <img src={Guide} />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleClickGuide}
                          style={{ color: "#bf3535" }}
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Slide>
            <div className={classes.buttons}>
              <Button
                color="secondary"
                onClick={() => {
                  let values = costSavingForm.values;
                  delete values.name;
                  dispatch(
                    setRoiForm({
                      ...roiFormValue,
                      costSavings: { ...roiFormValue.costSavings, ...values },
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
              <Button
                color="secondary"
                type="submit"
                disabled={costSavingForm.errors.savings}
              >
                Next
              </Button>
              <div>
                <Button color="secondary" onClick={() => setResetForm(true)}>
                  Reset
                </Button>
              </div>
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
