//----------------CORE-----------------//
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import Grid from "@mui/material/Grid";
//----------------EXTERNAL-----------------//
import { back, reset } from "rtkSlices/roiWizard";
import { useEmailMutation } from "services/email";
import BarChart from "components/Charts/Bar";
import VerticalBarChart from "components/Charts/Vertical Bar";
import DeleteAlert from "components/Alerts/Delete";
import { setRoiForm } from "rtkSlices/roiForm";

export default function Details(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [sendEmail, result] = useEmailMutation();
  const [open, setOpen] = useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const [resetForm, setResetForm] = useState(false);
  const [emailError, setEmailError] = useState('')
  const roiFormValue = useSelector((state) => state.roiForm);
  const [inState, setInState] = useState(true);
  const dispatch = useDispatch();
  const emailForm = useFormik({
    initialValues: {
      email: "",
      subject: 'Xelerate ROI Calculation - '+roiFormValue.name,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("Required Field"),
        // .email("Must be a valid email"),
      subject: Yup.string().required("Required Field"),
    }),
    onSubmit: async (values) => {
      let emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if(values.email.includes(',')){
        let emails = values.email.split(',')
        emails.forEach(email=>{
          if(!emailRegex.test(email)){
            setEmailError(email+' is not valid email')
            return;
          }
        })
      }
      else{
        if(!emailRegex.test(values.email)){
          setEmailError('Invalid email')
          return;
        }
      }
      setEmailError('')
      handleClose();
      enqueueSnackbar(
        { message: "Generating Email", title: "Email", variant: "info" },
        { variant: "info" }
      );
      let userInfo = metaDataValue.userInfo;
      
      let attachmet = await props.generatePDF();
      const fd = new FormData();
      fd.append("emailList", JSON.stringify([values.email]));
      fd.append("subject", values.subject);
      fd.append("attachment", attachmet, `${roiFormValue.name}.pdf`);
      fd.append(
        "message",
        `Dear customer,\n\nThank you for using the ROI Calculator by InviXible. Your report on the estimated ROI is attached with this email. If you require any further clarification, then please feel free to contact ${userInfo.firstName} ${userInfo.lastName} at ${userInfo.email} or ${userInfo.phone}.\nWe hope that you will find your ROI estimate useful and look forward to hearing back from you.\nThank you for co-creating IoT with us!\nwww.InviXible.com`
      );
      let emailSent = await sendEmail({
        token: window.localStorage.getItem("token"),
        body: fd,
      });
      enqueueSnackbar(
        { message: emailSent.data.message, title: "Email", variant: emailSent.data.success ? 'success' : 'error' },
        { variant: emailSent.data.success ? 'success' : 'error' }
      );
    },
  });

  useEffect(() => {
    if (!result.isFetching && result.isSuccess)
      enqueueSnackbar(
        { message: result.data.message, title: "Email", variant: "success" },
        { variant: "success" }
      );
    if (!result.isFetching && result.isError)
      enqueueSnackbar(
        { message: result.data.message, title: "Email", variant: "error" },
        { variant: "error" }
      );
  }, [result.isFetching]);

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

  function Benefits() {
    let arr = [...roiFormValue?.costSavings?.savings];
    if (roiFormValue?.costSavings?.siteVisits)
      arr.push({
        label: "Site Visits",
        value: roiFormValue?.costSavings?.siteVisits,
      });
    if (roiFormValue?.costSavings?.outage)
      arr.push({
        label: "Outage",
        value: roiFormValue?.costSavings?.outage,
      });
    return arr;
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  function generateChartdata(arr) {
    let output = [];
    arr.forEach((elm) => {
      if (
        // elm.label != "Device Price Per Unit" &&
        // elm.label != "Device Volume" &&
        // elm.label != "Connectivity Price per device per month" &&
        elm.value &&
        elm.value > 0
      ) {
        output.push({
          country: elm.label,
          value:
            elm.label != "One-off Devices Total Cost" &&
            elm.label != "Implementation Cost (one off)" &&
            elm.label != "Bespoke Development Cost (one off)" &&
            elm.label != "Total Devices Cost (one-off)" &&
            elm.label != "One-Off System Price" &&
            elm.type != 'setup'
              ? elm.value * roiFormValue.tenure
              : elm.value,
        });
      }
    });
    return output;
  }

  const onReset = () => {
    emailForm.resetForm();
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false);
  }

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <Slide direction="right" in={inState}>
          <div id="result-pdf" className={classes.form}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                minWidth: "200px",
                width: "90%",
              }}
            >
              <Dialog open={open} onClose={handleClose}>
                <form onSubmit={emailForm.handleSubmit}>
                  <DialogTitle>Email</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      required
                      id="email"
                      value={emailForm.values.email}
                      onChange={emailForm.handleChange}
                      onBlur={emailForm.handleBlur}
                      label="Email"
                      fullWidth
                      // error={
                      //   emailForm.touched.email && emailForm.errors.email
                      //     ? true
                      //     : false
                      // }
                      helperText={
                        emailForm.touched.email
                          ? emailForm.errors.email
                          : "Hint: Supports Multiple comma seperated entries"
                      }
                      margin="dense"
                    />
                    {emailError ? <span style={{color: 'red', fontSize: 12, position:'relative',top:'-5px',left:5}}>{emailError}</span> : null}
                    <TextField
                      required
                      id="subject"
                      value={emailForm.values.subject}
                      onChange={emailForm.handleChange}
                      onBlur={emailForm.handleBlur}
                      label="Subject"
                      fullWidth
                      error={
                        emailForm.touched.subject && emailForm.errors.subject
                          ? true
                          : false
                      }
                      helperText={
                        emailForm.touched.subject
                          ? emailForm.errors.subject
                          : ""
                      }
                      margin="dense"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} style={{ color: "#bf3535" }}>
                      Cancel
                    </Button>
                    <Button type="submit" color="secondary">
                      Send
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "center",
                  marginLeft: "5vw",
                  marginRight: "5vw",
                  marginTop: "40px",
                  marginBottom: "40px",
                }}
              >
                <span
                  style={{
                    width: "100%",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      color: "#666666",
                      margin: "0px 20px 0px 0px",
                    }}
                  >
                    <b>{roiFormValue.name}</b>
                  </p>
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    height: "160px",
                    width: "100%",
                    borderRadius: "5px",
                    border: `solid 2px ${metaDataValue.branding.secondaryColor}`,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      marginRight: "20px",
                      marginLeft: "10px",
                    }}
                  >
                    <VerticalBarChart
                      height={"150px"}
                      name="ROI-vertical"
                      data={[
                        {
                          network: `Total Cost Saving (${roiFormValue.currency})`,
                          value:
                            roiFormValue.costSavings.totalBenefit *
                            roiFormValue.tenure,
                        },
                        {
                          network: `Total Investment (${roiFormValue.currency})`,
                          value:
                            roiFormValue.investments.totalSetup,
                        },
                      ]}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: metaDataValue.branding.secondaryColor,
                      minWidth: "30%",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        marginLeft: "10px",
                        marginRight: "10px",
                        fontSize: "24px",
                      }}
                    >
                      <b>
                        ROI:
                        {` ${
                          ((roiFormValue.costSavings.totalBenefit *
                            roiFormValue.tenure) /
                            (roiFormValue.investments.totalSetup *
                              roiFormValue.tenure)) *
                            100 <
                          0
                            ? 0
                            : (
                                ((roiFormValue.costSavings.totalBenefit *
                                  roiFormValue.tenure) /
                                  (roiFormValue.investments.totalSetup *
                                    roiFormValue.tenure)) *
                                100
                              ).toFixed(1)
                        }`}
                        %
                      </b>
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      color: "#666666",
                      margin: "5px 1px 0px 0px",
                    }}
                  >
                    <b>Tenure: {roiFormValue.tenure} Year</b>
                  </p>
                </span>

                <Grid container spacing={5}>
                  <Grid item xs={12} sm={12} md={6}>
                    <div>
                      <p
                        style={{
                          fontSize: "20px",
                          color: "#666666",
                          margin: "0px 20px 10px 0px",
                        }}
                      >
                        <b>Cost Savings {`(${roiFormValue.currency})`}</b>
                      </p>
                      <BarChart
                        name={"ROI-costs"}
                        data={generateChartdata(Benefits())}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <div>
                      <p
                        style={{
                          fontSize: "18px",
                          color: "#666666",
                          margin: "0px 20px 10px 0px",
                        }}
                      >
                        <b>Investments {`(${roiFormValue.currency})`}</b>
                      </p>
                      <BarChart
                        name={"ROI-benifits"}
                        data={generateChartdata([
                          ...[
                            {
                              label: `Platform & Hosting(${roiFormValue?.investments.platform})`,
                              value:
                                roiFormValue?.investments.platformCost || 0,
                            },
                            {
                              label: `Support Type(${roiFormValue?.investments.support})`,
                              value:
                                roiFormValue?.investments?.supportCost || 0,
                            },
                          ],
                          ...[{label:'Total Devices Cost (one-off)',value:roiFormValue?.investments?.totalDevicesCost}],
                          ...[{label:'Total Connectivity Cost',value:roiFormValue?.investments?.totalConnectivityCost}],
                          ...roiFormValue?.investments?.setup.filter(s=>s.label!='Device Price Per Unit' && s.label!='Device Volume' && s.label!='Connectivity Price per device per month').map((s) => {
                            return { label: s.label, value: s.value || 0, type:'setup' };
                          }),
                          ...roiFormValue?.investments?.operation.map((s) => {
                            return { label: s.label, value: s.value || 0 };
                          }),
                        ])}
                      />
                    </div>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        </Slide>
        <div id="result-btns" className={classes.buttons}>
          <Button
            color="secondary"
            onClick={() => {
              setInState(false);
              setTimeout(() => {
                dispatch(back());
              }, 200);
            }}
          >
            Back
          </Button>
          <Button color="secondary" onClick={handleClickOpen}>
            EMAIL
          </Button>
          <Button
                color="secondary"
                onClick={()=>setResetForm(true)}
              >
                Reset
              </Button>
        </div>
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
