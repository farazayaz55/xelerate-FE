 //-----------CORE----------//
import React, { useEffect, Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
//-----------MUI----------//
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import Checkbox from "@mui/material/Checkbox";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
//----------MUI ICON----------//
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
//----------EXTERNAL----------//
import { useGetRolesQuery } from "services/roles";
import InvixibleLogo from "assets/img/sideLogo.png";
import checked from "assets/img/check.jpg";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";

import "../branding.css";
import {
  useCreateTemplateMutation,
  useCreateFontMutation,
  useGetFontsQuery,
} from "services/branding";
import ColorPicker from "./colorPicker";
import { setBranding } from "rtkSlices/metaDataSlice";

export default function Branding(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  let role = window.localStorage.getItem("role");
  const [visibility, setVisibility] = useState(
    props.permission == "ALL" ? [] : [role]
  );
  const [body, setBody] = useState(null);
  const getRoles = useGetRolesQuery(token, {
    refetchOnMountOrArgChange: false,
  });
  const signed = useGetSignedUsersQuery(
    {
      token,
      type: body ? body.name.split(".")[body.name.split(".").length - 1] : "",
    },
    { skip: !body }
  );
  const [name, setName] = React.useState(
    props.template ? props.template.name : `Template ${props.length}`
  );
  const [loader, setLoader] = React.useState(false);
  const [fontLoader, setFontLoader] = React.useState(true);
  const [uploadType, setUploadType] = React.useState(null);
  const [uploadFile, uploadFileResult] = useUploadUserMutation();
  const [createFont, createFontResult] = useCreateFontMutation();
  const [createTemplate, createTemplateResult] = useCreateTemplateMutation();
  const [logo, setLogo] = React.useState(null);
  const [tenantFonts, setTenantFonts] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [isShown, setIsShown] = React.useState(false);
  const [preview, setPreview] = React.useState(
    props.template?.logoPath ? props.template.logoPath : InvixibleLogo
  );
  const [primary, setPrimary] = React.useState(
    props.template ? props.template.primaryColor : "#3399ff"
  );
  const [secondary, setSecondary] = React.useState(
    props.template ? props.template.secondaryColor : "#607d8b"
  );
  const [font, setFont] = React.useState();
  const fontsRes = useGetFontsQuery();

  useEffect(() => {
    if (getRoles.isSuccess && getRoles.data?.payload) {
      if (props.permission == "ALL") {
        if (props.template && props.template?.visibility)
          setVisibility(props.template?.visibility);
        else setVisibility(getRoles.data?.payload?.map((e) => e._id));
      }
    }
    if (getRoles.isError) {
      showSnackbar("Roles", getRoles?.data?.message, "error");
    }
  }, [getRoles.isFetching]);

  useEffect(() => {
    if (!fontsRes.isFetching && fontsRes.isSuccess) {
      let tempfonts = [];
      fontsRes.data.payload.forEach((l, i) => {
        let customFont = new FontFace("testfont-" + i, "url('" + l.font + "')");
        customFont.load().then(function () {
          document.fonts.add(customFont);
        });

        tempfonts.push({
          font: l.font,
          fontfam: "testfont-" + i,
          name: l.friendlyName,
          uploaded: l.uploaded,
          id: l._id,
        });
      });
      if (body) {
        setFont(tempfonts[tempfonts.length - 1]?.id);
        setBody(null);
      } else
        setFont(
          props.template?.font
            ? tempfonts.find((f) => f.font == props.template.font.font)?.id
            : tempfonts[0]?.id
        );
      setTenantFonts(tempfonts);
      setFontLoader(false);
    }
    if (fontsRes.isError) {
      showSnackbar("Fonts", fontsRes.error?.message, "error", 1000);
    }
  }, [fontsRes.isFetching]);

  useEffect(() => {
    if (createFontResult.isSuccess) {
      showSnackbar("Font", createFontResult.data?.message, "success", 1000);
    }
    if (createFontResult.isError) {
      showSnackbar("Font", createFontResult.error?.message, "error", 1000);
    }
  }, [createFontResult]);

  useEffect(() => {
    if (createTemplateResult.isSuccess) {
      setLoader(false);
      if (
        props.template?._id &&
        metaDataValue.branding?.id &&
        props.template?._id == metaDataValue.branding?.id
      )
        dispatch(setBranding({ branding: createTemplateResult.data.payload }));
      props.close();
      showSnackbar(
        "Template",
        createTemplateResult.data?.message,
        "success",
        1000
      );
    }
    if (createTemplateResult.isError) {
      showSnackbar(
        "Template",
        createTemplateResult.error?.message,
        "error",
        1000
      );
    }
  }, [createTemplateResult]);

  useEffect(() => {
    if (uploadFileResult.isSuccess) {
      let link = signed.data.payload.split("?")[0];
      switch (uploadType) {
        case "LOGO":
          setLogo(link);
          setBody(null);
          break;

        case "FONT":
          createFont({
            body: {
              font: link,
              friendlyName: body.name.split(".")[0],
              uploaded: true,
            },
          });
          break;

        default:
          break;
      }
    }
    if (uploadFileResult.isError) {
      showSnackbar(
        "Font upload",
        uploadFileResult.error?.message,
        "error",
        1000
      );
    }
  }, [uploadFileResult]);

  useEffect(() => {
    if (!signed.isFetching && signed.isSuccess) {
      uploadFile({ url: signed.data.payload, body });
    }
    if (signed.isError) {
      showSnackbar("Font upload error", signed.error?.message, "error", 1000);
    }
  }, [signed.isFetching]);

  let fileInput;

  function handleLogo(e) {
    let type = e.target.files[0].type.toLowerCase();
    if (
      !(
        type.toLowerCase().includes("image/png") ||
        type.toLowerCase().includes("image/svg") ||
        type.toLowerCase().includes("image/jpeg") ||
        type.toLowerCase().includes("image/jpg") ||
        type.toLowerCase().includes("image/gif")
      )
    ) {
      showSnackbar(
        "Logo Image",
        "Selected file format is not supported",
        "error",
        1000
      );
      return;
    }
    setPreview(URL.createObjectURL(e.target.files[0]));
    setUploadType("LOGO");
    setBody(e.target.files[0]);
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const handleVisibility = (event) => {
    const value = event.target.value;
    if (value[value.length - 1] === "all") {
      setVisibility(
        visibility.length === getRoles.data?.payload?.length
          ? []
          : getRoles.data?.payload?.map((e) => e._id)
      );
      return;
    }
    setVisibility(value);
  };

  return (
    <Fragment>
      <div
        style={{
          margin: "10px 30px 5px 30px",
          maxWidth: "485px",
        }}
      >
        <h4>Details</h4>
        <Divider />

        <TextField
          id="name"
          required
          margin="dense"
          style={{
            margin: "15px 0 10px 0px",
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          label="Name"
        />
        {props.permission == "ALL" ? (
          <Fragment>
            {!getRoles.isLoading ? (
              <FormControl fullWidth margin="dense">
                <InputLabel id="demo-multiple-checkbox-label">
                  Visibility
                </InputLabel>
                <Select
                  multiple
                  value={visibility}
                  input={<OutlinedInput label="Visibility" />}
                  renderValue={(selected) => {
                    return selected
                      .map(
                        (e) =>
                          getRoles.data?.payload.find((g) => g._id == e)?.name
                      )
                      .join(", ");
                  }}
                  onChange={handleVisibility}
                >
                  <MenuItem value="all">
                    <ListItemIcon>
                      <Checkbox
                        checked={
                          visibility.length === getRoles.data?.payload?.length
                        }
                        indeterminate={
                          visibility.length > 0 &&
                          visibility.length < getRoles.data?.payload.length
                        }
                      />
                    </ListItemIcon>
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {getRoles.data?.payload?.map((elm, i) => (
                    <MenuItem key={elm._id} value={elm._id}>
                      <ListItemIcon>
                        <Checkbox checked={visibility.indexOf(elm._id) > -1} />
                      </ListItemIcon>
                      <ListItemText primary={elm.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <p style={{ textAlign: "center" }}>Loading ...</p>
            )}
          </Fragment>
        ) : null}

        <h4>Logo</h4>
        <Divider />
        <div
          style={{ display: "flex", marginTop: "20px", marginBottom: "20px" }}
        >
          <input
            style={{ display: "none" }}
            type="file"
            ref={(e) => (fileInput = e)}
            onChange={handleLogo}
          ></input>
          <div
            onClick={() => fileInput.click()}
            onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
            className="logo"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100px",
              width: "485px",
              backgroundImage: `url(${checked})`,
              cursor: "pointer",
              boxShadow: "50px",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
              borderRadius: "10px",
            }}
          >
            {isShown ? (
              <CameraAltIcon
                style={{
                  height: "50px",
                  width: "50px",
                  position: "absolute",
                  textAlign: "center",
                }}
              />
            ) : null}
            <img style={{ maxWidth: "80%", maxHeight: "80%" }} src={preview} />
          </div>
          <span
            style={{
              paddingBottom: "100px",
            }}
          ></span>
        </div>
        <h4>Color</h4>
        <Divider />
        <div style={{ marginTop: "15px" }}>
          <span
            style={{
              display: "flex",
            }}
          >
            <ColorPicker
              primaryColor={primary}
              secondaryColor={secondary}
              setPrimaryColor={setPrimary}
              setSecondaryColor={setSecondary}
            />
          </span>
        </div>
        <h4>Font</h4>
        <Divider />
        {!fontsRes.isLoading && font ? (
          <Fragment>
            <div style={{ margin: "15px" }}>
              <FormControl fullWidth>
                <InputLabel>Select Font-Family</InputLabel>
                {fontLoader ? (
                  <CircularProgress
                    size={20}
                    color="primary"
                    style={{
                      position: "absolute",
                      top: "18px",
                      right: "38px",
                      zIndex: "10",
                    }}
                  />
                ) : (
                  <IconButton
                    color="primary"
                    onClick={() => {
                      document.getElementById("upload-font").click();
                    }}
                    component="label"
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "35px",
                      zIndex: "10",
                    }}
                  >
                    <FileUploadOutlinedIcon />
                  </IconButton>
                )}
                <Select
                  label="Select Font-Family"
                  style={{
                    fontFamily: font,
                  }}
                  value={font}
                  onChange={(e) => {
                    setFont(e.target.value);
                  }}
                >
                  {tenantFonts?.map((f) => {
                    return (
                      <MenuItem
                        style={{ fontFamily: f.fontfam }}
                        value={f.id}
                      >{`${f.name} ${
                        f.uploaded ? "( uploaded )" : ""
                      }`}</MenuItem>
                    );
                  })}
                </Select>
                <input
                  type="file"
                  onChange={(e) => {
                    let type = e.target.files[0].name.split(".")[
                      e.target.files[0].name.split(".").length - 1
                    ];
                    if (!(type == "otf" || type == "ttf")) {
                      showSnackbar(
                        "Font",
                        "Selected file format is not supported",
                        "error",
                        1000
                      );
                      return;
                    }
                    if (
                      tenantFonts.find(
                        (d) => d.name == e.target.files[0].name.split(".")[0]
                      )
                    ) {
                      showSnackbar(
                        "Font",
                        "Font already exists",
                        "warning",
                        1000
                      );
                      return;
                    }
                    setFontLoader(true);
                    setUploadType("FONT");
                    setBody(e.target.files[0]);
                  }}
                  id="upload-font"
                  style={{ display: "none" }}
                />
              </FormControl>
            </div>
          </Fragment>
        ) : (
          <p style={{ textAlign: "center" }}>Loading ...</p>
        )}
        <Divider />
        <div
          style={{
            paddingTop: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={() => props.close()}>Cancel</Button>

          <Button
            color="primary"
            onClick={() => {
              if (!loader) {
                setLoader(true);
                let body = {
                  name: name,
                  primaryColor: primary,
                  secondaryColor: secondary,
                  visibility,
                };
                if (logo) body.logoPath = logo;
                if (
                  props.template?.font ? font != props.template.font.font : true
                )
                  body.font = font;
                createTemplate({
                  body,
                  id: props.template ? props.template._id : false,
                });
              }
            }}
          >
            {loader ? (
              <CircularProgress size={20} />
            ) : (
              <span>{props.template ? "Save" : "Add"}</span>
            )}
          </Button>
        </div>
      </div>
    </Fragment>
  );
}
