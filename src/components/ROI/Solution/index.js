//----------------CORE-----------------//
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import Slide from "@mui/material/Slide";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
//----------------EXTERNAL-----------------//
import { next, back, reset } from "rtkSlices/roiWizard";
import { setRoiForm } from "rtkSlices/roiForm";
import DeleteAlert from "components/Alerts/Delete";

export default function Details(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [type, setType] = useState(
    roiFormValue?.type ? roiFormValue.type : ["Monitoring"]
  );
  const [resetForm, setResetForm] = useState(false);
  const [inState, setInState] = useState(true);
  const [slideWay, setSlideWay] = useState("left");
  const dispatch = useDispatch();
  const useStyles = makeStyles({
    backP: {
      color: "#cccccc",
    },
    white: {
      color: "white",
    },
    title: {
      fontSize: "14px",
      color: "#bfbec8",
    },
    divider: {
      marginBottom: "10px",
    },
    solutionDiv: {
      display: "flex",
      gap: "20px",
      marginTop: "10px",
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
      // maxHeight: "calc(100vh - 346px)",
      margin: "auto",
      width: "50%",
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
      cursor: "pointer",
      borderRadius: 6,
    },
  });

  const classes = useStyles(props);
  const solutionForm = useFormik({
    initialValues: {
      vertical: roiFormValue?.vertical ? roiFormValue.vertical : "Industry",
      other: roiFormValue?.other ? roiFormValue.other : "",
    },
    validationSchema: Yup.object({
      vertical: Yup.string(),
    }),
    onSubmit: async (values) => {
      dispatch(setRoiForm({ ...roiFormValue, ...values, type }));
      setSlideWay("right");
      setInState(false);
      setTimeout(() => {
        dispatch(next());
      }, 200);
    },
  });

  function handleType(elm) {
    let old = [...type];
    if (old.indexOf(elm) == -1) {
      old.push(elm);
    } else {
      old.splice(old.indexOf(elm), 1);
    }
    setType(old);
  }

  const onReset = () => {
    solutionForm.resetForm();
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <form onSubmit={solutionForm.handleSubmit}>
          <Slide direction={slideWay} in={inState}>
            <div className={classes.form}>
              <span className={classes.formSpan}>
                <FormControl component="fieldset">
                  <p className={classes.title}>
                    <b>Vertical</b>
                  </p>
                  <Divider className={classes.divider} />
                  <RadioGroup
                    row
                    name="vertical"
                    value={solutionForm.values.vertical}
                    onChange={solutionForm.handleChange}
                    style={{ margin: "20px 0px" }}
                  >
                    {[
                      "Industry",
                      "Healthcare",
                      "Utility",
                      "Facilities Management",
                      "Manufacturing",
                      "Logistics",
                      // "",
                    ].map((elm) => {
                      return (
                        <FormControlLabel
                          value={elm}
                          control={<Radio id={elm} color="secondary" />}
                          label={elm}
                          style={{ marginRight: 30 }}
                        />
                      );
                    })}
                    <span style={{display:'flex'}}>

                    <FormControlLabel
                          value=""
                          control={<Radio color="secondary" />}
                          label=""
                          style={{ marginRight: 30 }}
                        />
                    <TextField
                      color="secondary"
                      label="Other"
                      style={{ position: "relative", right: "30px" }}
                      id="other"
                      value={solutionForm.values.other}
                      onChange={solutionForm.handleChange}
                      onBlur={solutionForm.handleBlur}
                      error={
                        solutionForm.touched.other &&
                        solutionForm.values.vertical == "" &&
                        solutionForm.values.other == ""
                          ? true
                          : false
                      }
                      helperText={
                        solutionForm.touched.other &&
                        solutionForm.values.vertical == "" &&
                        solutionForm.values.other == ""
                          ? "Required field"
                          : ""
                      }
                      disabled={solutionForm.values.vertical != ""}
                    />
                    </span>
                  </RadioGroup>
                </FormControl>
                <span>
                  <FormControl
                    component="fieldset"
                    style={{ margin: "10px 0px" }}
                  >
                    <p className={classes.title}>
                      <b>Solution Type (multiple)</b>
                    </p>
                    <Divider className={classes.divider} />
                    <div className={classes.solutionDiv}>
                      {["Monitoring", "Control", "Tracking"].map((elm) => {
                        return (
                          <div
                            id="elm"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor:
                                type.indexOf(elm) != -1
                                  ? metaDataValue.branding.secondaryColor
                                  : "#f5f5f5",
                              minHeight: "30px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "0.3s",
                            }}
                            onClick={() => {
                              handleType(elm);
                            }}
                          >
                            <p
                              style={{
                                color:
                                  type.indexOf(elm) != -1 ? "white" : "grey",
                                fontSize: "12px",
                                margin: "10px",
                                userSelect: "none",
                                transition: "0.3s",
                              }}
                            >
                              <b>{elm}</b>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                </span>
              </span>
            </div>
          </Slide>
          <div className={classes.buttons}>
            <Button
              color="secondary"
              onClick={() => {
                dispatch(
                  setRoiForm({ ...roiFormValue, ...solutionForm.values, type })
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
