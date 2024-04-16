import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import NoImage from "assets/img/catalogue.jpg";
import { Grid } from "@mui/material";

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

export default function MediaCard(props) {
  const classes = useStyles();

  function handleClick(path) {
    props.history.push(`/superAdmin/${path}`);
  }

  return (
    <div>
      <Grid container spacing={5}>
        {props.routes.map((elm) => (
          <Grid item xs={12} sm={3} md={2}>
            <Card
              className={classes.root}
              onClick={() => {
                handleClick(elm.path);
              }}
            >
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={NoImage}
                  title="Contemplative Reptile"
                />
                <CardContent>
                  <Typography gutterBottom variant="h7" component="h6">
                    {elm.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
