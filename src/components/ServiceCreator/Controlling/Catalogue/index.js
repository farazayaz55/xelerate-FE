import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Grid } from "@mui/material";
import PowerImg from "assets/img/power.png";
import ThermostatImg from "assets/img/thermostat.png";
import TouchImg from "assets/img/touch.png";
import TextFieldImg from "assets/img/textField.png";
import TextFieldNumericImg from "assets/img/textFieldNumeric.png";
import { useSelector } from "react-redux";

const useStyles = makeStyles({
  card: {
    width: "100%",
    borderRadius: "10px",
    "&:hover": {
      boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
    },
  },
  media: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eeee",
    height: 200,
    width: "100%",
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);

  return (
    <div style={{ margin: "10px 20px 40px 20px" }}>
      <Grid container spacing={5}>
        {[
          {
            widget: "power",
            title: "Binary Switch",
            description:
              "A toggle button to control binary actuation. Labels for both states can be customized",
            image: PowerImg,
          },
          {
            widget: "thermostat",
            title: "Circular Slider",
            description:
              "A circular slider to allow selection within a min and max range with linear intervals of 1 ",
            image: ThermostatImg,
          },
          {
            widget: "touch",
            title: "Touch Button",
            description: "A touch button to fire a single event/command",
            image: TouchImg,
          },
          {
            widget: "text",
            title: "Text Commands",
            description:
              "A generic text command input widget that sends whatever is entered as a command to device",
            image: TextFieldImg,
          },
          {
            widget: "numeric",
            title: "Numeric Input",
            description:
              "A numeric input widget for entering positive or negative numbers with decimals. Includes an increment/decrement scroller with configurable intervals",
            image: TextFieldNumericImg,
          },
        ].map((elm, ind) => (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              id={`controlling-widget-${ind}`}
              onClick={() => {
                setTimeout(() => {
                  props.setSwitcherState(elm.widget);
                }, 200);
              }}
              className={classes.card}
            >
              <CardActionArea>
                <div className={classes.media}>
                  <img
                    src={elm.image}
                    style={{
                      width: "70%",
                      height: "80%",
                      position: "relative",
                      top: "5px",
                    }}
                  />
                </div>

                <CardContent
                  style={{
                    minHeight: "90px",
                    maxHeight: "90px",
                    backgroundColor: metaDataValue.branding.secondaryColor,
                  }}
                >
                  <p style={{ color: "white" }}>
                    <b>{elm.title}</b>
                  </p>
                  <p style={{ color: "white", fontSize: "13px" }}>
                    {elm.description}
                  </p>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
