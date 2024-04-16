import React from "react";
import Avatar from "components/Avatar";
import { useSelector } from "react-redux";
import { Grid } from "@mui/material";

export default function Catalogue(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  return (
    <div>
      <Grid Container display={"flex"}>
        <Grid item md={4} justifyContent={'center'} display={'flex'}>
          <Avatar
            color={
              props.image != "" ? "white" : metaDataValue.branding.primaryColor
            }
            title={props.title}
            height={
              props?.style?.avatarHeigthAndWidth
                ? props?.style?.avatarHeigthAndWidth
                : "70px"
            }
            width={
              props?.style?.avatarHeigthAndWidth
                ? props?.style?.avatarHeigthAndWidth
                : "70px"
            }
            image={props.image}
            Icon={props.icon}
            IconColor={metaDataValue.branding.primaryColor}
            zoomOut={props.zoomOut}
          />
        </Grid>
        <Grid item md={8} textAlign={'center'}>
          <p
            style={{
              fontSize: props?.style?.titleSize
                ? props?.style?.titleSize
                : "13px",
              marginTop: props?.style?.marginBtwAvatarAndTitle
                ? props?.style?.marginBtwAvatarAndTitle
                : "10px",
            }}
          >
            <strong>{props.title}</strong>
          </p>

          {props.description && (
            <p
              style={{
                fontSize: "12px",
              }}
            >
              {props.description}
            </p>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
