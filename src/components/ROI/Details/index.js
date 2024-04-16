//----------------CORE-----------------//
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
//----------------EXTERNAL-----------------//
import { next, reset } from "rtkSlices/roiWizard";
import { setRoiForm } from "rtkSlices/roiForm";
import DeleteAlert from "components/Alerts/Delete";

export default function Details(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [inState, setInState] = useState(true);
  const [resetForm, setResetForm] = useState(false);
  const dispatch = useDispatch();
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
      color: "#cccccc",
    },
    white: {
      color: "white",
    },
    formSpan: {
      maxWidth: "800px",
    },
    form: {
      gap: '20px',
      overflow: 'scroll',
      minWidth: '200px',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      // maxHeight:'calc(100vh - 346px)',
      margin: 'auto',
      width:'50%'
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
  const detailsForm = useFormik({
    initialValues: {
      name: roiFormValue?.name ? roiFormValue.name : "",
      remarks: roiFormValue?.remarks ? roiFormValue.remarks : "",
      currency: roiFormValue?.currency ? roiFormValue.currency : "£",
      tenure: roiFormValue?.tenure ? roiFormValue.tenure : 1,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
      currency: Yup.string().required("Required field"),
      tenure: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      dispatch(setRoiForm({ ...roiFormValue, ...values }));
      setInState(false);
      setTimeout(() => {
        dispatch(next());
      }, 200);
    },
  });

  const onReset = () => {
    detailsForm.resetForm();
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false)
  }

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <form onSubmit={detailsForm.handleSubmit}>
          <Slide direction="right" in={inState}>
            <div className={classes.form}>
              <span className={classes.formSpan}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#bfbec8",
                  }}
                >
                  <b>Calculation Info</b>
                </p>
                <Divider
                  style={{
                    marginBottom: "10px",
                  }}
                />
                <TextField
                  color="secondary"
                  margin="dense"
                  required
                  id="name"
                  label="Name"
                  fullWidth
                  error={
                    detailsForm.touched.name && detailsForm.errors.name
                      ? true
                      : false
                  }
                  value={detailsForm.values.name}
                  onChange={detailsForm.handleChange}
                  onBlur={detailsForm.handleBlur}
                  helperText={
                    detailsForm.touched.name ? detailsForm.errors.name : ""
                  }
                />
                <TextField
                  color="secondary"
                  margin="dense"
                  id="remarks"
                  label="Remarks"
                  fullWidth
                  multiline
                  rows={4}
                  value={detailsForm.values.remarks}
                  onChange={detailsForm.handleChange}
                />
                <span
                  style={{
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <div style={{ width: "100%", marginRight: "10px" }}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel color="secondary">Currency</InputLabel>
                      <Select
                        color="secondary"
                        name="currency"
                        id="currency"
                        value={detailsForm.values.currency}
                        onChange={detailsForm.handleChange}
                        label="Currency"
                      >
                        <MenuItem value={"$"}>Dollar $</MenuItem>
                        <MenuItem value={"£"}>GBP £</MenuItem>
                        <MenuItem value={"€"}>Euro €</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div style={{ width: "100%", marginLeft: "10px" }}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel color="secondary">Tenure</InputLabel>
                      <Select
                        color="secondary"
                        name="tenure"
                        id="tenure"
                        value={detailsForm.values.tenure}
                        onChange={detailsForm.handleChange}
                        label="Tenure"
                      >
                        <MenuItem value={1}>1 Year</MenuItem>
                        <MenuItem value={2}>2 Years</MenuItem>
                        <MenuItem value={3}>3 Years</MenuItem>
                        <MenuItem value={4}>4 Years</MenuItem>
                        <MenuItem value={5}>5 Years</MenuItem>
                        <MenuItem value={6}>6 Years</MenuItem>
                        <MenuItem value={7}>7 Years</MenuItem>
                        <MenuItem value={9}>8 Years</MenuItem>
                        <MenuItem value={9}>9 Years</MenuItem>
                        <MenuItem value={10}>10 Years</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </span>
              </span>
            </div>
          </Slide>

          <div className={classes.buttons}>
            <Button disabled>Back</Button>
            <Button color="secondary" type="submit">
              Next
            </Button>
            <Button
                color="secondary"
                onClick={()=>setResetForm(true)}
              >
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
          id={''}
          handleDelete={onReset}
          handleClose={()=>setResetForm(false)}
          deleteResult={{isLoading:false}}
        />
      ) : null}
    </div>
  );
}
