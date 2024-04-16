//-------------CORE------------//
import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
//--------------MUI----------//
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
//---------------MUI ICONS--------//
import PersonIcon from "@mui/icons-material/Person";
//------------EXTERNAL COMPONENTS-----------//
import { useForgotPasswordMutation } from "services/auth";

const useStyles = makeStyles({
  white: {
    color: "white",
  },
  button: {
    color: "white",
    width: 150,
  },
  login: {
    width: "120px",
    paddingTop: "10px",
    position: "relative",
    bottom: "15px",
    fontSize: "14px",
    color: "#808080",
    cursor: "pointer",
  },
  buttonContainer: { textAlign: "center" },
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
  txt: {
    color: "#999",
    fontWeight: "bold",
    marginBottom: "30px",
    marginTop: "5px",
  },
});

export default function ForgotPassword(props) {
  const classes = useStyles(props);
  const { enqueueSnackbar } = useSnackbar();
  const [forgotPassword, result] = useForgotPasswordMutation();
  const forgotPasswordForm = useFormik({
    initialValues: {
      userName: "",
    },
    validationSchema: Yup.object({
      userName: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      let data = { userName: values.userName };
      await forgotPassword(data);
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if (result.status != "uninitialized") {
      if (result.isSuccess) {
        showSnackbar(
          "Forget Password",
          `Verification Email has been sent to ${forgotPasswordForm.values.userName}`,
          "success",
          1000
        );
        props.history.push("/auth/login");
        return;
      }
      if (result.isError) {
        showSnackbar(
          "Forget Password",
          result.error?.data?.message,
          "error",
          1000
        );
      }
    }
  }, [result]);

  return (
    <div>
      <h4 className={classes.txt}>Forgot Password</h4>
      <form onSubmit={forgotPasswordForm.handleSubmit}>
        <div className={classes.marg}>
          <TextField
            id="userName"
            color="primary"
            error={
              forgotPasswordForm.touched.userName &&
              forgotPasswordForm.errors.userName
                ? true
                : false
            }
            value={forgotPasswordForm.values.userName}
            onChange={forgotPasswordForm.handleChange}
            onBlur={forgotPasswordForm.handleBlur}
            fullWidth
            label="Username"
            helperText={
              forgotPasswordForm.touched.userName
                ? forgotPasswordForm.errors.userName
                : ""
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
        <span>
          <p
            className={classes.login}
            onClick={() => {
              props.history.push("/auth/login");
            }}
          >
            Go back to Login
          </p>
        </span>{" "}
        <div className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.button}
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
  );
}
