//-------------CORE------------//
import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//--------------MUI-------------//
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
//----------MUI ICONS---------//
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
//----------EXTERNAL COMPONENTS----------//
import { useResetPasswordMutation, useValidateTokenQuery } from "services/auth";
//----------EXTERNAL CSS--------------//
import "./reset.css";

const useStyles = makeStyles({
  infoDiv: {
    backgroundColor: "#fe9f1b",
    color: "#333",
    padding: "5px 8px",
    fontSize: 12,
    borderRadius: "10px",
    margin: "10px 0px",
    borderColor: "yellow",
    borderWidth: 1,
  },
  verifying: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 35,
    fontWeight: 500,
    margin: 30,
    gap: 6,
    height: "20vh",
  },
  invalid: {
    textAlign: "center",
    margin: 20,
  },
  red: {
    color: "red",
  },
  txt: {
    color: "#999",
    fontWeight: "bold",
    marginBottom: "20px",
    marginTop: "5px",
  },
  dontmatch: {
    color: "red",
    marginTop: "-25px",
    marginBottom: "25px",
    fontSize: 13,
    position: "absolute",
  },
  "mb-25": {
    marginBottom: 25,
  },
  successDiv: {
    backgroundColor: "#5fb762",
    color: "#333",
    padding: "5px 8px",
    fontSize: 12,
    borderRadius: "10px",
    margin: "10px 0px",
    borderColor: "green",
    borderWidth: 1,
  },
  errorDiv: {
    backgroundColor: "#bf3535",
    color: "#333",
    padding: "5px 8px",
    fontSize: 12,
    borderRadius: "10px",
    margin: "10px 0px",
    borderColor: "red",
    borderWidth: 1,
  },
  infoText: {
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },
  white: {
    color: "white",
  },
  button: {
    color: "white",
    width: 150,
  },
  buttonContainer: { textAlign: "center", marginTop: "25px" },
  visibility: {
    color: "grey",
    cursor: "pointer",
  },
  marg: {
    marginBottom: "20px",
  },
  grey: {
    color: "grey",
  },
  heading: {
    fontWeight: "bold !important",
  },
  "lds-ellipsis": {
    display: "inline-block",
    position: "relative",
    width: "80px",
    height: "80px",
  },
  "lds-ellipsis div": {
    position: "absolute",
    top: "33px",
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    background: "rgb(77, 77, 77)",
    animationTimingFunction: "cubic-bezier(0, 1, 1, 0)",
  },
  "lds-ellipsis div:nth-child(1)": {
    left: "8px",
    animation: "lds-ellipsis1 0.6s infinite",
  },
  "lds-ellipsis div:nth-child(2)": {
    left: "8px",
    animation: "lds-ellipsis2 0.6s infinite",
  },
  "lds-ellipsis div:nth-child(3)": {
    left: "32px",
    animation: "lds-ellipsis2 0.6s infinite",
  },
  "lds-ellipsis div:nth-child(4)": {
    left: "56px",
    animation: "lds-ellipsis3 0.6s infinite",
  },
  "@keyframes lds-ellipsis1": {
    "0%": {
      transform: "scale(0)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
  "@keyframes lds-ellipsis3": {
    "0%": {
      transform: "scale(1)",
    },
    "100%": {
      transform: "scale(0)",
    },
  },
  "@keyframes lds-ellipsis2": {
    "0%": {
      transform: "translate(0, 0)",
    },
    "100%": {
      transform: "translate(24px, 0)",
    },
  },
});

export default function ResetPassword(props) {
  let token = props.match.params.token;
  const classes = useStyles(props);
  const { enqueueSnackbar } = useSnackbar();
  const [resetPassword, result] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const { data, isLoading, isSuccess, isError } = useValidateTokenQuery(
    props.match.params.token
  );
  const [verificationStatus, setVerificationStatus] = useState("validating");
  const resetPasswordForm = useFormik({
    initialValues: {
      password: "",
      rePassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .matches(
          /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*|\":<>[\]{}`\\()';@&$#!_.,])/
        )
        .required("Required field")
        .max(32)
        .min(8),
      rePassword: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      let data = { password: values.password };
      await resetPassword({ body: data, token });
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleClickShowRePassword = () => {
    setShowRePassword(!showRePassword);
  };

  const handleMouseDownRePassword = (event) => {
    event.preventDefault();
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (result.isSuccess) {
      showSnackbar(
        "Reset Password",
        "Password has been reset successfully",
        "success",
        1000
      );
      window.localStorage.setItem("token", "");
      props.history.push("/auth/login");
      return;
    }
    if (result.isError) {
      showSnackbar(
        "Reset Password",
        result.error?.data?.message,
        "error",
        1000
      );
    }
  }, [result]);

  useEffect(() => {
    if (!isError && !isSuccess) {
      setVerificationStatus("validating");
    }
    if (isError) {
      setVerificationStatus("invalid");
    }
    if (isSuccess) {
      setVerificationStatus("valid");
    }
  }, [data, isError, isSuccess]);

  return (
    <div>
      {verificationStatus == "valid" ? (
        <div>
          <h4 className={classes.txt}>Reset Password</h4>
          <form onSubmit={resetPasswordForm.handleSubmit}>
            <div className={classes.marg}>
              <TextField
                id="password"
                color="primary"
                type={showPassword ? "text" : "password"}
                value={resetPasswordForm.values.password}
                onChange={resetPasswordForm.handleChange}
                onKeyUp={() => {
                  if (!resetPasswordForm.errors?.password) {
                    setValidated(true);
                  } else {
                    setValidated(false);
                  }
                }}
                onBlur={resetPasswordForm.handleBlur}
                label="Password"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      position="end"
                    >
                      {showPassword ? (
                        <Visibility className={classes.visibility} />
                      ) : (
                        <VisibilityOff className={classes.visibility} />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div
              className={
                resetPasswordForm.touched.rePassword &&
                resetPasswordForm.values.password !=
                  resetPasswordForm.values.rePassword
                  ? classes["mb-25"]
                  : classes.marg
              }
            >
              <TextField
                id="rePassword"
                color="primary"
                type={showRePassword ? "text" : "password"}
                value={resetPasswordForm.values.rePassword}
                onChange={resetPasswordForm.handleChange}
                onBlur={resetPasswordForm.handleBlur}
                label="Confirm Password"
                error={
                  resetPasswordForm.touched.rePassword &&
                  resetPasswordForm.values.password !=
                    resetPasswordForm.values.rePassword
                }
                helperText={
                  resetPasswordForm.touched.rePassword &&
                  resetPasswordForm.values.password !=
                    resetPasswordForm.values.rePassword
                    ? "Passwords do not match"
                    : ""
                }
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      onClick={handleClickShowRePassword}
                      onMouseDown={handleMouseDownRePassword}
                      position="end"
                    >
                      {showRePassword ? (
                        <Visibility className={classes.visibility} />
                      ) : (
                        <VisibilityOff className={classes.visibility} />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div
              className={
                resetPasswordForm.values.password && validated
                  ? classes.successDiv
                  : resetPasswordForm.values.password && !validated
                  ? classes.errorDiv
                  : !resetPasswordForm.values.password
                  ? classes.infoDiv
                  : null
              }
            >
              <div className={classes.infoText}>
                <div style={{ marginTop: "8px" }}>
                  {resetPasswordForm.values.password && validated ? (
                    <CheckCircleIcon />
                  ) : (
                    <Tooltip
                      title={
                        <div>
                          <p style={{ fontSize: "11px" }}>
                            ○ Atleast one Numeric letter and one Special
                            character.
                          </p>
                          <p style={{ fontSize: "11px" }}>
                            ○ Atleast one Capital and one Small Alphabet.
                          </p>
                          <p style={{ fontSize: "11px" }}>
                            ○ Should not contain Username or Email
                          </p>
                          <p style={{ fontSize: "11px" }}>
                            ○ Length should be between 8-32
                          </p>
                        </div>
                      }
                      placement="bottom"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <InfoIcon style={{ cursor: "pointer" }} />
                    </Tooltip>
                  )}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  {resetPasswordForm.values.password && validated
                    ? "Password complies with password Policies"
                    : resetPasswordForm.values.password && !validated
                    ? "Please ensure compliance with Password policies"
                    : !resetPasswordForm.values.password
                    ? "Please ensure compliance with Password policies"
                    : null}
                </div>
              </div>
            </div>

            <div className={classes.buttonContainer}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className={classes.button}
                disabled={
                  !validated ||
                  resetPasswordForm.errors.password ||
                  resetPasswordForm.errors.rePassword ||
                  resetPasswordForm.values.password !=
                    resetPasswordForm.values.rePassword
                }
              >
                {!result.isLoading ? (
                  <span>Submit</span>
                ) : (
                  <CircularProgress size={24} className={classes.white} />
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : verificationStatus == "invalid" ? (
        <div className={classes.invalid}>
          <h2 className={classes.red}>Your link has expired. Please contact support@invixible.com</h2>
        </div>
      ) : (
        <div className={classes.verifying}>
          <div>Verifying </div>
          <div class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}
