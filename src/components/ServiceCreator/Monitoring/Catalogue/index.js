import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Grid } from "@mui/material";
import MultiImg from "assets/img/multiState.png";
import RangeImg from "assets/img/range.png";
import BatteryImg from "assets/img/battery.png";
import FillLevelImg from "assets/img/fillLevel.png";
import GuageImg from "assets/img/guage.png";
import ReadingImg from "assets/img/reading.png";
import TimeSeriesImg from "assets/img/timeSeries.png";
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
            widget: "multiState",
            title: "Multi State",
            description:
              "A widget to represent multiple numeric values with friendly labels. e.g. Value status as on/off or Engine Status as off/idle/running",
            image: MultiImg,
          },
          {
            widget: "rangeLabel",
            title: "Range Label",
            description:
              "A widget to represent multiple numeric ranges as friendly labels. e.g. Air Quality Index 0-50: Good, 50-100: Moderate, 100-150:Poor",
            image: RangeImg,
          },
          {
            widget: "battery",
            title: "Battery",
            description:
              "A widget to represent Battery level in percentage. If data is available it can even show when the battery is charging or discharging",
            image: BatteryImg,
          },
          {
            widget: "fillLevel",
            title: "Fill Level",
            description:
              "A level sensor to represent most forms of levels with configurable min and max limits. e.g. Humidity, Tank fill level, Gas concentration",
            image: FillLevelImg,
          },
          {
            widget: "guage",
            title: "Guage",
            description:
              "A widget to represent a linear numeric range in form of a gauge. e.g. speed, voltage, current etc",
            image: GuageImg,
          },
          {
            widget: "reading",
            title: "Single Reading",
            description:
              "A sensor to depict datapoint and its unit with a relative icon",
            image: ReadingImg,
          },
          {
            widget: "timeSeries",
            title: "Time Series Chart",
            description:
              "A widget to represent a data point in simple chart form with current, min and max values",
            image: TimeSeriesImg,
          },
        ].map((elm, ind) => (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              id={`monitoring-widget-${ind}`}
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
                  <p style={{ color: "white" }}>{elm.description}</p>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
