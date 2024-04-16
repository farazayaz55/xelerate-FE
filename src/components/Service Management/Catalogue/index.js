import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import NoImage from "assets/img/catalogue.jpg";
import { Grid } from "@mui/material";
import Menu from "./Menu";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const useStyles = makeStyles({
  card: {
    width: "100%",
    "&:hover": {
      boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
    },
  },
  media: {
    height: 200,
    objectFit: "cover",
  },
});

export default function MediaCard(props) {
  const [blur, setBlur] = React.useState("");

  const classes = useStyles();

  return (
    <div>
      <Grid container spacing={2}>
        {props.services?.map((elm) => (
          <Grid key={elm._id} item xs={12} sm={6} md={4}>
            <div
              style={{
                position: "relative",
              }}
            >
              <Card className={classes.card}>
                <CardContent
                  style={{
                    position: "relative",
                    borderBottom: "1px solid #bfbec8",
                    filter: blur == elm._id ? "blur(2px)" : "",
                    transition: "0.5s ease",
                  }}
                >
                  <Typography
                    gutterBottom
                    variant="h7"
                    component="strong"
                    style={{
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {elm.name}
                  </Typography>

                  <span
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                      style={{
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {elm.description}
                    </Typography>
                    {elm?.vanish ? (
                      <AccessTimeIcon
                        style={{
                          height: "15px",
                          width: "15px",
                          color: "grey",
                          position: "relative",
                          left: "5px",
                          top: "3px",
                        }}
                      />
                    ) : null}
                  </span>
                </CardContent>
                <CardMedia
                  className={classes.media}
                  component="img"
                  style={{
                    height: 200,
                    filter: blur == elm._id ? "blur(2px)" : "",
                    transition: "0.5s ease",
                  }}
                  image={elm.logoPath ? elm.logoPath : NoImage}
                  title={elm.description}
                />
              </Card>
              <Menu
                key={elm._id}
                setBlur={setBlur}
                id={elm._id}
                service={elm}
                setSelected={props.setSelected}
              />
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
