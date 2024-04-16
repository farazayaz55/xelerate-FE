import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InvixibleLogo from "assets/img/sideLogo.png";
import { useSnackbar } from "notistack";
import { Grid } from "@mui/material";
import Menu from "./Menu";
import Popup from "./Popup";
import { useGetTemplatesQuery } from "services/branding";
import Media from "components/Card Skeleton";
import Chip from "@mui/material/Chip";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { useSelector } from "react-redux";
import { useGetBrandingQuery } from "services/branding";
import Keys from "Keys";

const useStyles = makeStyles({
  card: {
    width: "100%",
    backgroundColor: "#E0E0E0 !important",
    "&:hover": {
      boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
    },
  },
});

export default function MediaCard(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const permission = metaDataValue.apps.find((a) => a.name == "Settings")?.tabs[0]?.permission;
  const [template, setTemplate] = React.useState(null);
  const [viewAll, setViewAll] = React.useState(false);
  const templatesRes = useGetTemplatesQuery();
  const globalBrandingRes = useGetBrandingQuery({ user: "false", id: "" });

  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (globalBrandingRes.isError) {
      showSnackbar("Branding", globalBrandingRes.error?.message, "error", 1000);
    }
  }, [globalBrandingRes.isFetching]);

  function cardLoaderFunc() {
    return (
      <Fragment>
        <Grid spacing={2} container>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((elm) => (
            <Grid item xs={12} sm={6} md={4}>
              <Media />
            </Grid>
          ))}
        </Grid>
      </Fragment>
    );
  }

  const defaultBranding = [
    {
      _id: "default",
      name: `${Keys?.company ? Keys.company : "Invixible"} (Default)`,
      primaryColor: Keys?.primary ? Keys.primary : "#3399ff",
      secondaryColor: Keys?.secondary ? Keys.secondary : "#607d8b",
      logoPath: Keys?.logo ? Keys.logo : InvixibleLogo,
      font: {
        friendlyName: Keys?.fontName ? Keys.fontName : "Open Sans",
        font: Keys?.font ? Keys.font : "Open Sans",
        uploaded: Keys?.uploaded ? Keys.uploaded : false,
      },
    },
  ];

  function BrandingCard({ elm, index, block }) {
    return (
      <div
        style={{
          position: "relative",
        }}
      >
        <Card className={classes.card}>
          <Menu
            block={block}
            key={elm._id}
            id={elm._id}
            template={elm}
            setTemplate={setTemplate}
            global={globalBrandingRes.data.payload}
            permission={
              permission == "ALL" &&
              index == 0 &&
              !block &&
              !metaDataValue.branding.applied &&
              !globalBrandingRes.data.payload
            }
          />
          <CardContent
            style={{
              position: "relative",
              borderBottom: "1px solid #bfbec8",
              transition: "0.5s ease",
              background: "rgb(243,243,243)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#404040",
                }}
              >
                {elm.name}
              </p>
              <span style={{ whiteSpace: "nowrap" }}>
                {metaDataValue.branding.id == elm._id &&
                metaDataValue.branding.userFlag ? (
                  <Chip
                    color="secondary"
                    icon={<PersonOutlinedIcon />}
                    label="Personal"
                    size="small"
                    style={{ padding: "5px", margin: "0 5px" }}
                  />
                ) : null}
                {globalBrandingRes.data.payload?.branding?._id == elm._id ||
                (index == 0 &&
                  !globalBrandingRes.data.payload?.branding &&
                  !block) ? (
                  <Chip
                    color="secondary"
                    icon={<PublicOutlinedIcon />}
                    label="Global"
                    size="small"
                    style={{ padding: "5px", margin: "0 5px" }}
                  />
                ) : null}
              </span>
            </div>
            <div
              style={{
                position: "relative",
                top: "15px",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
                color: "gray",
                gap: "5px",
                margin: "0px 70px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p>Primary: </p>
                <div
                  style={{
                    borderRadius: "50%",
                    background: elm.primaryColor,
                    minHeight: "15px",
                    width: "15px",
                    height: "15px",
                    minWidth: "15px",
                    marginLeft: "10px",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p>Logo: </p>
                <div
                  style={{
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    objectFit: "cover",
                  }}
                >
                  <img
                    src={
                      elm?.logoPath
                        ? elm.logoPath
                        : Keys?.logo
                        ? Keys.logo
                        : InvixibleLogo
                    }
                    style={{ maxHeight: "80%", maxWidth: "80%" }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                top: "15px",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
                color: "gray",
                gap: "5px",
                margin: "0px 70px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p>Secondary: </p>
                <div
                  style={{
                    borderRadius: "50%",
                    background: elm.secondaryColor,
                    minHeight: "15px",
                    width: "15px",
                    height: "15px",
                    minWidth: "15px",
                    marginLeft: "10px",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p>Font: </p>
                <p
                  style={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginLeft: "10px",
                  }}
                >
                  {elm.font?.friendlyName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "calc(100vh - 110px)",
        overflowY: "scroll",
        scrollbarWidth: "none",
        padding: "10px",
      }}
    >
      <Popup
        template={template}
        setTemplate={setTemplate}
        length={templatesRes.data?.payload?.length + 1}
        permission={permission}
      />
      {!templatesRes.isLoading && !globalBrandingRes.isLoading ? (
        <>
          <Grid container spacing={2}>
            {(templatesRes.data.payload?.length
              ? [
                  ...defaultBranding,
                  ...(permission == "ALL"
                    ? templatesRes.data.payload.filter(
                        (e) =>
                          metaDataValue.branding.brandingBlockList.indexOf(
                            e._id
                          ) == -1
                      )
                    : templatesRes.data.payload
                        .filter(
                          (e) =>
                            e?.visibility.indexOf(
                              window.localStorage.getItem("role")
                            ) != -1
                        )
                        .filter(
                          (e) =>
                            metaDataValue.branding.brandingBlockList.indexOf(
                              e._id
                            ) == -1
                        )),
                ]
              : defaultBranding
            ).map((elm, index) => (
              <Grid key={elm._id} item xs={12} sm={6} md={4}>
                <BrandingCard elm={elm} index={index} />
              </Grid>
            ))}
          </Grid>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              margin: "30px 0 20px 0",
              cursor: "pointer",
              width: "fit-content",
            }}
            onClick={() => setViewAll((prev) => !prev)}
          >
            <p>Archived Templates</p>
            <ArrowDropDownIcon
              style={{ transform: viewAll ? "rotate(180deg)" : "" }}
            />
          </span>
          {viewAll ? (
            <Grid container spacing={2}>
              {[
                ...(permission == "ALL"
                  ? templatesRes.data.payload.filter(
                      (e) =>
                        metaDataValue.branding.brandingBlockList.indexOf(
                          e._id
                        ) != -1
                    )
                  : templatesRes.data.payload
                      .filter(
                        (e) =>
                          e?.visibility.indexOf(
                            window.localStorage.getItem("role")
                          ) != -1
                      )
                      .filter(
                        (e) =>
                          metaDataValue.branding.brandingBlockList.indexOf(
                            e._id
                          ) != -1
                      )),
              ].map((elm, index) => (
                <Grid key={elm._id} item xs={12} sm={6} md={4}>
                  <BrandingCard elm={elm} index={index} block={true} />
                </Grid>
              ))}
            </Grid>
          ) : null}
        </>
      ) : (
        cardLoaderFunc()
      )}
    </div>
  );
}
