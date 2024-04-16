//----------------CORE-----------------//
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
//---------------EXTERNAL--------------//
import { setRoiForm } from "rtkSlices/roiForm";
//----------------MUI-----------------//
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { next, back, reset } from "rtkSlices/roiWizard";
import Slide from "@mui/material/Slide";
import DeleteAlert from "components/Alerts/Delete";

export default function Details(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const roiFormValue = useSelector((state) => state.roiForm);
  const [inState, setInState] = useState(true);
  const [slideWay, setSlideWay] = useState("left");
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
      color: metaDataValue.branding.secondaryColor,
    },
    white: {
      color: "white",
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
      "&:hover": {
        opacity: "0.9",
      },
      borderRadius: 6,
    },
  });

  const classes = useStyles(props);

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function getType(arr) {
    let output = "";
    arr.forEach((elm, i) => {
      output += elm;
      if (i < arr.length - 1) output += ",";
    });
    return output;
  }

  function Details() {
    return (
      <div
        style={{
          display: "flex",
          margin: "10px 20px",
          gap: "20px",
          marginBottom: "20px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ lineHeight: "30px", fontSize: "16px" }}>
          {["Name", "Remarks", "Tenure", "Vertical", "Solution Type"].map(
            (elm) => (
              <p
                style={{
                  color: metaDataValue.branding.secondaryColor,
                }}
              >
                <b>{elm}</b>
              </p>
            )
          )}
        </div>
        <div style={{ lineHeight: "30px", fontSize: "16px" }}>
          {[
            roiFormValue?.name,
            roiFormValue?.remarks,
            roiFormValue?.tenure ? `${roiFormValue.tenure} Year` : "",
            roiFormValue?.vertical,
            getType(roiFormValue?.type ? roiFormValue.type : []),
          ].map((elm) => (
            <p>
              <b style={{ color: "grey" }}>{elm && elm != "" ? elm : "-"}</b>
            </p>
          ))}
        </div>
      </div>
    );
  }

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

  function Table(props) {
    return (
      <div
        style={{
          display: "flex",
          margin: "10px 20px",
          gap: "20px",
          marginBottom: "20px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ lineHeight: "30px", fontSize: "16px" }}>
          {props.arr.map((elm) => (
            <p
              style={{
                color: metaDataValue.branding.secondaryColor,
              }}
            >
              <b>{elm.label}</b>
            </p>
          ))}
        </div>
        <div style={{ lineHeight: "30px", fontSize: "16px" }}>
          {props.arr.map((elm) => (
            <p>
              <b style={{ color: "grey" }}>
                {elm.value && elm.value != ""
                  ? `${roiFormValue?.currency} ${numberWithCommas(elm.value)}`
                  : "-"}
              </b>
            </p>
          ))}
        </div>
      </div>
    );
  }
  const Componenets = {
    Details: <Details />,
    Benefits: <Table arr={Benefits()} />,
    Investments: (
      <Table
        arr={[
          ...[
            {
              label: `Platform & Hosting(${roiFormValue?.investments.platform})`,
              value: roiFormValue?.investments.platformCost,
            },
            {
              label: `Support Type(${roiFormValue?.investments.support})`,
              value: roiFormValue?.investments?.supportCost,
            },
          ],
          {
            label: "Devices Total Cost (one-off)",
            value: roiFormValue?.investments?.totalDevicesCost,
          },
          {
            label: "Total Connectivity Cost (yearly)",
            value: roiFormValue?.investments?.totalConnectivityCost,
          },
          ...roiFormValue?.investments?.setup.filter(
            (s) =>
              s.label != "Device Price Per Unit" &&
              s.label != "Device Volume" &&
              s.label != "Connectivity Price per device per month"
          ),
          ...roiFormValue?.investments?.operation,
        ]}
      />
    ),
  };

  const onReset = () => {
    dispatch(setRoiForm({}));
    dispatch(reset());
    setResetForm(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.formDiv}>
        <Slide direction={slideWay} in={inState}>
          <div id="summary-pdf" className={classes.form}>
            <div
              style={{
                display: "flex",
                gap: "20px",
                minWidth: "200px",
                width: "50%",
                margin: "20px auto",
              }}
            >
              {["Details", "Benefits"].map((elm) => (
                <div
                  style={{
                    width: "100%",
                    border: "solid 1px #c4c4c4",
                    borderRadius: "5px",
                  }}
                >
                  <p
                    style={{
                      color: "grey",
                      width: "fit-content",
                      fontSize: "20px",
                      marginTop: -10,
                      marginLeft: 10,
                      padding: "0px 5px",
                      backgroundColor: "white",
                    }}
                  >
                    {" "}
                    <b>{elm}</b>
                  </p>
                  {Componenets[elm]}
                </div>
              ))}
            </div>
            <div
                  style={{
                    width: "50%",
                    border: "solid 1px #c4c4c4",
                    borderRadius: "5px",
                    margin: '0 auto'
                  }}
                >
                  <p
                    style={{
                      color: "grey",
                      width: "fit-content",
                      fontSize: "20px",
                      marginTop: -10,
                      marginLeft: 10,
                      padding: "0px 5px",
                      backgroundColor: "white",
                    }}
                  >
                    {" "}
                    <b>{'Investments'}</b>
                  </p>
                  {Componenets['Investments']}
                </div>
            <p style={{ color: "#c4c4c4", width: "50%", margin: "10px auto" }}>
              Note: all recurring costs are per Annum
            </p>
          </div>
        </Slide>
        <div className={classes.buttons}>
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
          <Button
            color="secondary"
            onClick={() => {
              document.getElementById('summary-pdf').style.overflow = 'inherit';
              props.generateSummaryPDF();
              document.getElementById('summary-pdf').style.overflow = 'scroll';
              setSlideWay("right");
              setInState(false);
              setTimeout(() => {
                dispatch(next());
              }, 200);
            }}
          >
            Next
          </Button>
          <Button color="secondary" onClick={() => setResetForm(true)}>
            Reset
          </Button>
        </div>
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
