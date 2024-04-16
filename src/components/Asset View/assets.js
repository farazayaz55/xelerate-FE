import React, { useState } from "react";
import { Grid, Typography, Tooltip } from "@mui/material";
import NoImage from "../../assets/img/location-pin.png";

const ShowAssets = (props) => {
  return (
    <Grid container style={{ maxHeight: "15rem", overflow: "auto" }}>
      <Grid
        item
        sm={3}
        style={{ display: "flex", alignItems: "center", maxHeight: "15rem" }}
      >
        <Typography
          style={{
            fontSize: "1.25rem",
            // fontWeight: "bold",
            color: "rgb(169, 169, 169)",
          }}
        >
          Asset Types:
        </Typography>
      </Grid>
      <Grid item sm={9}>
        <Grid container rowSpacing={1}>
          {props.assets.map((asset) => {
            return (
              <Grid
                item
                sm={4}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => props.selectAsset(asset)}
              >
                <div
                  style={{
                    display: "grid",
                    textAlign: "center",
                    borderRadius: "1rem",
                    width: "95%",
                    height: "7rem",
                    justifyContent: "center",
                    border:
                      props.selectedAsset &&
                      props.selectedAsset.includes(asset.id || asset._id)
                        ? `2px solid ${props.selectedColor}`
                        : `2px solid #f7f7f7`,
                  }}
                >
                  <div>
                    <img
                      style={{ maxWidth: "5rem" }}
                      src={asset?.image ? asset?.image : NoImage}
                    ></img>
                  </div>
                  <Tooltip title={asset.name.length > 11 ? asset.name : ""}>
                    <p
                      style={{
                        maxWidth: "6rem", // Adjust the width as needed
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {asset.name}
                    </p>
                  </Tooltip>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ShowAssets;
