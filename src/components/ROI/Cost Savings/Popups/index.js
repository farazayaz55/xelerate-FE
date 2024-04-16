//----------------CORE-----------------//
import React, { useState, Fragment } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
//----------------EXTERNAL-----------------//
import { setRoiForm } from "rtkSlices/roiForm";

export default function Details(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [toggle, setToggle] = React.useState("");
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const useStyles = makeStyles({
    title: {
      fontSize: "14px",
      color: "#bfbec8",
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
      color: metaDataValue.branding.secondaryColor,
      "&:hover": {
        border: "1px solid black",
      },
      "&:active": {
        border: "1px solid #c4c4c4",
      },
    },
  });

  const classes = useStyles(props);
  function getvalidationSchema(toggle) {
    switch (toggle) {
      case "Site Visits":
        return {
          noSites: Yup.number().required("Required Field"),
          noSitesYear: Yup.number().required("Required Field"),
          costSite: Yup.string().required("Required Field"),
          siteReduction: Yup.number().required("Required Field"),
        };

      case "Outage":
        return {
          singleOutage: Yup.string().required("Required Field"),
          yearOutage: Yup.number().required("Required Field"),
          outageReduction: Yup.number().required("Required Field"),
        };

      default:
        break;
    }
  }

  function parseCost(cost) {
    return typeof cost != "number" ? parseInt(cost.replaceAll(",", "")) : cost;
  }

  const popupForm = useFormik({
    initialValues: {
      noSites: "",
      noSitesYear: "",
      costSite: "",
      siteReduction: "",
      singleOutage: "",
      yearOutage: "",
      outageReduction: "",
    },
    validationSchema: Yup.object(getvalidationSchema(toggle)),
    onSubmit: async (values) => {
      let temp;
      let tempValues = JSON.parse(JSON.stringify(values));
      if (tempValues.costSite) {
        tempValues.costSite = parseInt(tempValues.costSite.replaceAll(",", ""));
      }
      if (tempValues.singleOutage) {
        tempValues.singleOutage = parseInt(
          tempValues.singleOutage.replaceAll(",", "")
        );
      }
      switch (toggle) {
        case "Site Visits":
          temp = Math.round(
            values.noSites *
              values.noSitesYear *
              tempValues.costSite *
              (values.siteReduction / 100)
          );
          dispatch(
            setRoiForm({
              ...roiFormValue,
              costSavings: { ...roiFormValue?.costSavings, siteVisits: temp },
            })
          );
          break;

        case "Outage":
          temp = Math.round(
            values.yearOutage *
              (values.outageReduction / 100) *
              tempValues.singleOutage
          );
          dispatch(
            setRoiForm({
              ...roiFormValue,
              costSavings: { ...roiFormValue?.costSavings, outage: temp },
            })
          );
          break;

        default:
          break;
      }
      handleClose();
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function dialogFn(toggle) {
    switch (toggle) {
      case "Site Visits":
        return (
          <div>
            <TextField
              id="noSites"
              color="secondary"
              margin="dense"
              type="number"
              label="No of sites"
              fullWidth
              value={popupForm.values.noSites}
              onChange={popupForm.handleChange}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.noSites && popupForm.errors.noSites
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.noSites ? popupForm.errors.noSites : ""
              }
            />
            <TextField
              id="noSitesYear"
              color="secondary"
              margin="dense"
              label="No of visits per sites per year"
              fullWidth
              type="number"
              value={popupForm.values.noSitesYear}
              onChange={popupForm.handleChange}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.noSitesYear && popupForm.errors.noSitesYear
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.noSitesYear
                  ? popupForm.errors.noSitesYear
                  : ""
              }
            />
            <TextField
              id="costSite"
              color="secondary"
              margin="dense"
              label="Cost of site visit"
              fullWidth
              value={
                popupForm.values.costSite
                  ? typeof popupForm.values.costSite == "number"
                    ? popupForm.values.costSite.toLocaleString("en-GB")
                    : parseInt(
                        popupForm.values.costSite.replaceAll(",", "")
                      ).toLocaleString("en-GB")
                  : popupForm.values.costSite
              }
              style={{ marginBottom: "20px" }}
              onChange={(e) => {
                if (parseInt(e.target.value) || e.target.value == "") {
                  popupForm.handleChange(e);
                }
              }}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.costSite && popupForm.errors.costSite
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.costSite ? popupForm.errors.costSite : ""
              }
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "13px" }}>
                <span style={{ color: "#c4c9d5", fontWeight: "130px" }}>
                  Total site visits per year:
                </span>
                <b style={{ color: "#666666" }}>
                  {popupForm.values.noSites * popupForm.values.noSitesYear > 0
                    ? `  ${
                        popupForm.values.noSites * popupForm.values.noSitesYear
                      } ${roiFormValue.currency}`
                    : ""}
                </b>
              </p>
              <p style={{ fontSize: "13px" }}>
                <span style={{ color: "#c4c9d5", fontWeight: "130px" }}>
                  Total cost of site visits per year:
                </span>
                <b style={{ color: "#666666" }}>
                  {popupForm.values.noSites *
                    popupForm.values.noSitesYear *
                    parseCost(popupForm.values.costSite) >
                  0
                    ? `  ${
                        popupForm.values.noSites *
                        popupForm.values.noSitesYear *
                        parseCost(popupForm.values.costSite)
                      } ${roiFormValue.currency}`
                    : ""}
                </b>
              </p>
            </div>
            <TextField
              id="siteReduction"
              color="secondary"
              margin="dense"
              type="number"
              label="Expected reduction in visits (0-100%)"
              fullWidth
              value={popupForm.values.siteReduction}
              onChange={popupForm.handleChange}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.siteReduction &&
                popupForm.errors.siteReduction
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.siteReduction
                  ? popupForm.errors.siteReduction
                  : ""
              }
            />
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              <span
                style={{
                  color: "#c4c9d5",
                  fontWeight: "130px",
                }}
              >
                Total Savings:
              </span>
              <b style={{ color: "#666666" }}>
                {Math.round(
                  popupForm.values.noSites *
                    popupForm.values.noSitesYear *
                    parseCost(popupForm.values.costSite) *
                    (popupForm.values.siteReduction / 100)
                ) > 0
                  ? `  ${Math.round(
                      popupForm.values.noSites *
                        popupForm.values.noSitesYear *
                        parseCost(popupForm.values.costSite) *
                        (popupForm.values.siteReduction / 100)
                    )} ${roiFormValue.currency}`
                  : ""}
              </b>
            </p>
          </div>
        );

      case "Outage":
        return (
          <div>
            <TextField
              id="singleOutage"
              margin="dense"
              color="secondary"
              label="Cost of single outage"
              fullWidth
              value={
                popupForm.values.singleOutage
                  ? typeof popupForm.values.singleOutage == "number"
                    ? popupForm.values.singleOutage.toLocaleString("en-GB")
                    : parseInt(
                        popupForm.values.singleOutage.replaceAll(",", "")
                      ).toLocaleString("en-GB")
                  : popupForm.values.singleOutage
              }
              onChange={(e) => {
                if (parseInt(e.target.value) || e.target.value == "") {
                  popupForm.handleChange(e);
                }
              }}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.singleOutage && popupForm.errors.singleOutage
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.singleOutage
                  ? popupForm.errors.singleOutage
                  : ""
              }
            />
            <TextField
              id="yearOutage"
              margin="dense"
              color="secondary"
              label="No of outages per year"
              fullWidth
              type="number"
              value={popupForm.values.yearOutage}
              onChange={popupForm.handleChange}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.yearOutage && popupForm.errors.yearOutage
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.yearOutage ? popupForm.errors.yearOutage : ""
              }
            />
            <p style={{ marginTop: "10px", marginBottom: "5px" }}>
              <span style={{ color: "#c4c9d5", fontWeight: "130px" }}>
                Total cost from outages:
              </span>
              <b style={{ color: "#666666" }}>
                {parseCost(popupForm.values.singleOutage) *
                  popupForm.values.yearOutage >
                0
                  ? `  ${
                      parseCost(popupForm.values.singleOutage) *
                      popupForm.values.yearOutage
                    } ${roiFormValue.currency}`
                  : ""}
              </b>
            </p>
            <TextField
              id="outageReduction"
              margin="dense"
              color="secondary"
              type="number"
              label="Expected reduction in no of outages(0-100%)"
              fullWidth
              value={popupForm.values.outageReduction}
              onChange={popupForm.handleChange}
              onBlur={popupForm.handleBlur}
              error={
                popupForm.touched.outageReduction &&
                popupForm.errors.outageReduction
                  ? true
                  : false
              }
              helperText={
                popupForm.touched.outageReduction
                  ? popupForm.errors.outageReduction
                  : ""
              }
            />
            <p style={{ marginTop: "10px" }}>
              <span style={{ color: "#c4c9d5", fontWeight: "130px" }}>
                Total benefit:
              </span>
              <b style={{ color: "#666666" }}>
                {Math.round(
                  popupForm.values.yearOutage *
                    (popupForm.values.outageReduction / 100) *
                    parseCost(popupForm.values.singleOutage)
                ) > 0
                  ? `  ${Math.round(
                      popupForm.values.yearOutage *
                        (popupForm.values.outageReduction / 100) *
                        parseCost(popupForm.values.singleOutage)
                    )} ${roiFormValue.currency}`
                  : ""}
              </b>
            </p>
          </div>
        );

      default:
        break;
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={popupForm.handleSubmit}>
          <DialogTitle>{toggle}</DialogTitle>
          <DialogContent>{dialogFn(toggle)}</DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={handleClose} style={{ color: "#bf3535" }}>
              Cancel
            </Button>
            <Button type="submit" color="secondary">
              Set
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <p className={classes.title}>
        <b>Benefits</b>
      </p>
      <Divider />
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div
          className={classes.button}
          onClick={() => {
            setToggle("Site Visits");
            handleClickOpen();
          }}
        >
          <p
            style={{
              fontSize: "18px",
              margin: "10px",
            }}
          >
            <b>Site Visits</b>
          </p>
          <p style={{ fontSize: "20px", margin: "10px" }}>
            <b>{`${
              roiFormValue?.costSavings?.siteVisits
                ? roiFormValue?.costSavings?.siteVisits
                : ""
            } ${roiFormValue.currency}`}</b>
          </p>
        </div>
        <div
          className={classes.button}
          onClick={() => {
            setToggle("Outage");
            handleClickOpen();
          }}
        >
          <p
            style={{
              fontSize: "18px",
              margin: "10px",
            }}
          >
            <b>Outage</b>
          </p>
          <p style={{ fontSize: "20px", margin: "10px" }}>
            <b>{`${
              roiFormValue?.costSavings?.outage
                ? roiFormValue?.costSavings?.outage
                : ""
            } ${roiFormValue.currency}`}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
