//----------------CORE-----------------//
import React from "react";
//----------------Assets-----------------//
import InvixibleLogo from "assets/img/sideLogo.png";
import loginBackground from "assets/img/login-background.png";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Fab from "@mui/material/Fab";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
//----------------MUI ICONS-----------------//
import EmailIcon from "@mui/icons-material/Email";
import { Route, Switch } from "react-router-dom";
//-------------EXTERNAL COMPONENTS--------//
import ForgotPassword from "./Reset Password/Forgot Password/forgotPassword";
import ResetPassword from "./Reset Password/resetPassword";
import LoginForm from "./Login";
import Background from "assets/img/three-bg.png";
import Keys from "Keys";
import hexRgb from "hex-rgb";
import Dragable from "components/Dragable";
import LoginTwoFactorValidator from "./Login/validateTwoFactorCode";

export default function Login(props) {
  const [rgb, setRgb] = React.useState(
    hexRgb(Keys?.primary ? Keys?.primary : "#3399ff")
  );

  const useStyles = makeStyles({
    sectionStyle: {
      backgroundImage: `linear-gradient(360deg, rgb(50 50 50 / 66%), rgba(0, 0, 0, 0.5)), url(${Background})`,
      backgroundSize: "cover",
    },
    fab: {
      position: "absolute",
      bottom: "30px",
      right: "30px",
    },
    center: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "calc(100vh)",
      flexDirection: "column",
      direction: "ltr",
    },
    cardDiv: {
      width: "50%",
    },
    card: {
      maxHeight: "480px",
      maxWidth: "900px",
      padding: "0px !important",
    },
    cardContent: {
      height: "100%",
      padding: "0px !important",
      backgroundColor: "#fafafa",
    },
    noPadding: { padding: "0px !important" },
    leftContent: {
      height: "100%",
      backgroundImage: `linear-gradient(to right, rgb(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0.6) ,rgb(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0.6)),url(${loginBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    logoImg: {
      position: "absolute",
      margin: "40px",
    },
    fullHeight: { height: "100%" },
    rightContent: {
      height: "100%",
      padding: "35px 35px 30px 35px",
    },
    logoContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingBottom: "30px",
    },
    logo: {
      maxWidth: "200px",
      maxHeight: "100px",
    },
    heading: {
      fontWeight: "bold !important",
      fontSize: "20px !important",
    },
  });

  const classes = useStyles(props);

  return (
    <section className={classes.sectionStyle}>
      <Dragable bottom={"30px"} right={"30px"} name="support">
        <Tooltip title="Contact Support">
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            onClick={() => {
              window.location.href =
                "mailto:support@invixible.com?subject=Support request - Xelerate Login page&body=Requestor: [please provide contact details for support team to reach out on]%20Support Request details: [please provide details for this support request]";
            }}
          >
            <EmailIcon />
          </Fab>
        </Tooltip>
      </Dragable>
      <div className={classes.center}>
        <div className={classes.cardDiv}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Grid container spacing={2} className={classes.noPadding}>
                <Grid item xs={6} className={classes.noPadding}>
                  <div className={classes.leftContent}>
                    <div className={classes.logoImg} />
                  </div>
                </Grid>
                <Grid item xs={6} className={classes.fullHeight}>
                  <div className={classes.rightContent}>
                    <div className={classes.logoContainer}>
                      <img
                        className={classes.logo}
                        src={Keys?.logo ? Keys.logo : InvixibleLogo}
                      />
                    </div>
                    {window.location.pathname.includes("login") ? (
                      <h1 className={classes.heading}>
                        Welcome To {Keys?.company ? Keys.company : "Xelerate"}
                      </h1>
                    ) : null}
                    <Switch>
                      <Route
                        path="/auth/validate"
                        component={LoginTwoFactorValidator}
                      />
                      <Route path="/auth/login" component={LoginForm} />
                      <Route
                        path="/auth/forgotPassword"
                        component={ForgotPassword}
                      />
                      <Route
                        path="/auth/resetPassword/:token"
                        component={ResetPassword}
                      />
                    </Switch>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
