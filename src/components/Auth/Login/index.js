//----------------CORE-----------------//
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
//----------------MUI ICONS-----------------//
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
//-------------EXTERNAL COMPONENTS--------//
import { useSigninMutation } from "services/auth";
import { setSkip, setUserCreds } from "rtkSlices/metaDataSlice";

const useStyles = makeStyles({
  button: {
    color: "white",
    width: 150,
  },
  buttonContainer: { textAlign: "center" },
  forgotPassword: {
    width: "120px",
    paddingTop: "10px",
    position: "relative",
    bottom: "15px",
    fontSize: "14px",
    color: "#808080",
    cursor: "pointer",
  },
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
  loginTxt: {
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
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles(props);
  const [signin, result] = useSigninMutation();
  const [userCredentials, setUserCredentials] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const signinForm = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema: Yup.object({
      userName: Yup.string().required("Required field"),
      password: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      let data = {
        userName: values.userName,
        password: values.password,
        twoFactorAuthCode: "",
      };

      setUserCredentials({
        userName: values.userName,
        password: values.password,
      });

      await signin(data);
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if (result.isSuccess) {
      if (result.data.payload[0].twoFactorAuthVerification === "Verified") {
        dispatch(setSkip(false));
        props.history.push("/solutions");
      }
      if (result.data.payload[0].twoFactorAuthVerification === "Pending") {
        dispatch(
          setUserCreds({
            userName: userCredentials.userName,
            password: userCredentials.password,
            codeExpiry: result.data.payload[0].expiryTime,
          })
        );
        props.history.push("/auth/validate");
      }
    }
    if (result.isError) {
      showSnackbar(
        "Authentication",
        result.error?.data?.message,
        "error",
        1000
      );
    }
  }, [result]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <h4 className={classes.loginTxt}>Login</h4>
      <form onSubmit={signinForm.handleSubmit}>
        <div className={classes.marg}>
          <TextField
            id="userName"
            color="primary"
            error={
              signinForm.touched.userName && signinForm.errors.userName
                ? true
                : false
            }
            value={signinForm.values.userName}
            onChange={signinForm.handleChange}
            onBlur={signinForm.handleBlur}
            fullWidth
            label="Username"
            helperText={
              signinForm.touched.userName ? signinForm.errors.userName : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <PersonIcon className={classes.grey} />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className={classes.marg}>
          <TextField
            id="password"
            color="primary"
            type={showPassword ? "text" : "password"}
            error={
              signinForm.touched.password && signinForm.errors.password
                ? true
                : false
            }
            helperText={
              signinForm.touched.password ? signinForm.errors.password : ""
            }
            value={signinForm.values.password}
            onChange={signinForm.handleChange}
            onBlur={signinForm.handleBlur}
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
        <span>
          <p
            className={classes.forgotPassword}
            onClick={() => {
              props.history.push("/auth/forgotPassword");
            }}
          >
            Forgot password?
          </p>
        </span>
        <div className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.button}
          >
            {!result.isLoading ? (
              <span>Login</span>
            ) : (
              <CircularProgress size={24} className={classes.white} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
