//----------------CORE-----------------//
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CheckBox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";

//-------------EXTERNAL COMPONENTS--------//
import { useSigninMutation } from "services/auth";
import { setSkip } from "rtkSlices/metaDataSlice";

const useStyles = makeStyles({
  button: {
    color: "white",
    width: 150,
  },
  buttonContainer: { textAlign: "center" },
  backtoLogin: {
    width: "100%",
    paddingTop: "10px",
    position: "relative",
    bottom: "15px",
    textAlign: "right",
    fontSize: "12px",
    color: "#808080",
    cursor: "pointer",
    "&:hover": {
      color: "#5179c4",
      cursor: "pointer",
      textDecoration: "underline",
    },
  },
  visibility: {
    color: "#5179c4",
    cursor: "pointer",
  },
  marg: {
    marginBottom: "20px",
    color: "grey",
  },
  grey: {
    color: "grey",
  },
  twoFAField: {
    color: "#999",
    fontWeight: "bold",
    marginBottom: "20px",
    marginTop: "5px",
  },
  white: {
    color: "white !important",
  },
});

export default function LoginForm(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles(props);
  const [signin, result] = useSigninMutation();

  const signinForm = useFormik({
    initialValues: {
      twoFactorAuthCode: "",
      keep2FAoff: false,
    },
    onSubmit: async (values) => {
      let data = {
        userName: metaDataValue.userCreds.userName,
        password: metaDataValue.userCreds.password,
        twoFactorAuthCode: values.twoFactorAuthCode
          ? values.twoFactorAuthCode
          : "default",
      };
      if (values.keep2FAoff) data["keepMeLoggedIn"] = values.keep2FAoff;
      await signin(data);
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  async function sendCodeAgain() {
    let data = {
      userName: metaDataValue.userCreds.userName,
      password: metaDataValue.userCreds.password,
      twoFactorAuthCode: "",
    };
    await signin(data);
    showSnackbar("Authentication", "Code Sent Again", "success", 4000);
  }

  useEffect(() => {
    if (result.isSuccess) {
      if (result.data.payload[0].twoFactorAuthVerification === "Verified") {
        dispatch(setSkip(false));
        props.history.push("/solutions");
      }
    }
    if (result.isError) {
      props.history.push("/auth/login");
      showSnackbar(
        "Authentication",
        result.error?.data?.message,
        "error",
        4000
      );
    }
  }, [result]);

  return (
    <div>
      <h4 className={classes.twoFAField}>
        Enter 2FA code
        <Tooltip
          title={
            <div>
              <p>Sent to registered email</p>
            </div>
          }
          placement="bottom"
        >
          <InfoIcon
            style={{
              height: "25px",
              width: "18px",
              position: "absolute",
              padding: "2px",
              color: "#555555",
              cursor: "pointer",
            }}
          />
        </Tooltip>
      </h4>
      <form onSubmit={signinForm.handleSubmit}>
        <div className={classes.marg}>
          <TextField
            id="twoFactorAuthCode"
            color="primary"
            error={
              signinForm.touched.twoFactorAuthCode &&
              signinForm.errors.twoFactorAuthCode
                ? true
                : false
            }
            value={signinForm.values.twoFactorAuthCode}
            onChange={signinForm.handleChange}
            onBlur={signinForm.handleBlur}
            fullWidth
            label="2FA Code"
            helperText={
              signinForm.touched.twoFactorAuthCode
                ? signinForm.errors.twoFactorAuthCode
                : ""
            }
          />
        </div>

        <div>
          <p
            className={classes.backtoLogin}
            onClick={() => {
              sendCodeAgain();
            }}
          >
            Resend code ?
          </p>
        </div>

        <div className={classes.marg}>
          <FormControlLabel
            label={
              "Trust this computer for " +
              metaDataValue.userCreds.codeExpiry +
              " days"
            }
            control={
              <CheckBox
                id="keep2FAoff"
                label={
                  "Trust this computer for " +
                  metaDataValue.userCreds.codeExpiry +
                  " days"
                }
                color="primary"
                fullWidth
                checked={signinForm.values.keep2FAoff}
                onChange={signinForm.handleChange}
              />
            }
          />
        </div>

        <div className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.button}
          >
            {!result.isLoading ? (
              <span>Proceed</span>
            ) : (
              <CircularProgress size={24} className={classes.white} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
