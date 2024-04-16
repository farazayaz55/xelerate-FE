import React, { useEffect, useRef, Fragment, useState } from "react";
import TextField from "@mui/material/TextField";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { useSnackbar } from "notistack";
import HideImageIcon from "@mui/icons-material/HideImage";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useCreateSensorMutation } from "services/services";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import useUpload from "hooks/useUpload";
import { makeStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses} from "@mui/material/Tooltip";
import {styled} from "@mui/material/styles";
import { Zoom, Fade } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FlakyIcon from '@mui/icons-material/Flaky';
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from "@mui/icons-material/Info";

const useStyles = makeStyles({
  operationsContainer: {
    width:"100%",   
    cursor: "pointer", 
    position: "relative",
  },
  iconStyles: {
    width: "20px",
    height: "20px",
    color: "rgba(85,85,85,0.4)",
    cursor: "pointer",
    "&:hover": {
      color: "rgba(85,85,85,0.4)"
    }
  }
})

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #dadde9',
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: "#f5f5f9"
  }
}));

const FormTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgb(255, 255, 220)",
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "600px",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #ffd772',
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: "rgba(0,0,0,0)",
    color: "rgb(255, 255, 220)"
  }
}));

export default function rangeLabel(props) {
  let token = window.localStorage.getItem("token");
  const inputRef = useRef(null);
  const { url, isLoading, error, fetchUrl } = useUpload();
  const [isShown, setIsShown] = React.useState(false);
  const [logo, setLogo] = React.useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [preview, setPreview] = React.useState(null);
  const [validated, setValidated] = useState(false)
  const [errors, setErrors] = useState([])
  const [showDatapoints, setShowDatapoints] = useState(false)
  const [showHTML_Tooltip, setShowHTML_Tooltip] = useState(true)
  const [operationChanged, setOperationChanged] = useState(false)
  const [infoPopup, setInfoPopup] = useState(false)
  const [clicked, setClicked] = useState(false)
  const styles = useStyles()

  const rangeLabelForm = useFormik({
    initialValues: {
      description: "",
      datapoint: "",
      ranges: [
        {
          label: "",
          min: null,
          max: null,
        },
        {
          label: "",
          min: null,
          max: null,
        },
      ],
      name: "",
      defaultTimeseries: false,
      config: false,
      typeValue: props.type,
      operation: ""
    },
    validationSchema: Yup.object({
      description: Yup.string().required("Required field"),
      datapoint: props.type == "datapoint" ? Yup.string()
        .matches(/^[a-zA-Z0-9_]+$/, "Special characters not allowed")
        .required("Required Field") : Yup.string()
        .matches(/^[a-zA-Z0-9_]+$/, "Special characters not allowed"),
      typeValue: Yup.string().required("Required field"),
      operation: props.type == "valueInsight" ? Yup.string().required("Required Field") : Yup.string(),
      ranges: Yup.array().of(
        Yup.object().shape({
          label: Yup.string().required("Required field"),
          min: Yup.number().required("Required field"),
          max: Yup.number().required("Required field"),
        })
      ),
      name: Yup.string().required("Required field"),
      defaultTimeseries: Yup.boolean().required("Required field"),
      config: Yup.boolean().required("Required field"),
    }),
    onSubmit: async (values) => {
      if(props.type == "valueInsight"){
        const valid = validateOperation()
        if(!valid){
          showSnackbar("Value Insights", "Equation has not been validated", "error", 1000)
          return
        }
      }

      let body = {
        name: props.type == "datapoint" ? values.datapoint : values.name.replace(/ /g,"_"),
        friendlyName: values.name,
        description: values.description,
        type: "rangeLabel",
        config: values.config,
        icon: url,
        metaData: values.ranges,
        defaultTimeseries: values.defaultTimeseries,
        typeValue: props.type,
        operation: values.operation
      };

      addSensor({ token, body });
    },
  });

  const rangesEndRef = useRef(null);

  const scrollToBottom = () => {
    rangesEndRef.current.scrollIntoView();
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const [addSensor, addSensorResult] = useCreateSensorMutation();

  useEffect(() => {
    if(rangeLabelForm.values.operation == ""){
      setErrors([])
    }
    const operationArray = rangeLabelForm.values.operation.split("")
    const noOfOpenParanthesis = rangeLabelForm.values.operation.split("{").length -1
    const noOfClosedParanthesis = rangeLabelForm.values.operation.split("}").length -1
    if(operationArray[operationArray.length-1] == "{"){
      setShowDatapoints(true)
      setShowHTML_Tooltip(true);
    }
    if(operationArray[operationArray.length-1] == "}"){
      setShowDatapoints(false)
    }
    if(noOfOpenParanthesis == noOfClosedParanthesis){
      setShowDatapoints(false)
    }
    if(operationChanged){
      setOperationChanged(false)
    }else{
      setValidated(false)
    }
  }, [rangeLabelForm.values.operation])

  useEffect(() => {
    if (addSensorResult.isSuccess) {
      let id = addSensorResult.data.payload._id;
      let friendlyName = addSensorResult.data.payload.friendlyName;
      let name = addSensorResult.data.payload.name;
      props.setSelected(addSensorResult.data.payload);
      props.setOpenPopup(false);
      setTimeout(() => {
        props.setSwitcherState("");
      }, 500);
      showSnackbar(
        props.type == "datapoint" ? "Monitoring" : "Value Insights",
        addSensorResult.data?.message,
        "success",
        1000
      );
    }
    if (addSensorResult.isError) {
      showSnackbar(
        props.type == "datapoint" ? "Monitoring" : "Value Insights",
        addSensorResult.error.data?.message,
        "error",
        1000
      );
    }
  }, [addSensorResult]);

  function handleImage(e) {
    let type = e.target.files[0].type;
    let body = e.target.files[0];
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
        "Widget Image",
        "Selected file format is not supported",
        "error",
        1000
      );
      return;
    }
    setPreview(URL.createObjectURL(e.target.files[0]));
    type = body.name.split(".")[body.name.split(".").length - 1];
    setIsShown(false);
    fetchUrl(body, type);
    
    
  }

  const checkColor = () => {
    if(!validated && !errors.length){
      return "info"
    } else if(validated) {
      return "success"
    } else {
      return "error"
    }
  }

  const checkChar = (char, i, operation) => {
    const operationString = operation ? operation : rangeLabelForm.values.operation
    const currentOperation = operationString.slice(0, i)
    const paranthesisOpenIndex = currentOperation.lastIndexOf("{")
    const paranthesisCloseIndex = currentOperation.lastIndexOf("}")
    if(paranthesisOpenIndex !== -1){
      if(char == "}"){
        return "brown"
      }
      if(paranthesisCloseIndex == -1 || paranthesisOpenIndex > paranthesisCloseIndex){
        return "orange"
      }
    }
    if(char == "{" || char == "}"){
      return "brown"
    } else if(char == "(" || char == ")" || char == ","){
     return "blue"
    } else if(/^[a-zA-Z]+$/.test(char)){
      return "green"
    }else if(/^\d$/.test(char)) {
      return "purple"
    } else {
      return "red"
    }
  }

  const fillArray = (operation, array) => {
    const index = operation.lastIndexOf("(")
    const restString = operation.slice(0, index).split(" ")
    const func = restString[restString.length-1]
    const splitString = operation.slice(index)
    const endBracket = splitString.indexOf(")")
    const parameters = splitString.slice(0, endBracket)
    const newStr = operation.replace(`${func}${parameters})`, "func")
    array.push(`${func}${parameters})`)
    if(newStr.indexOf("(") !== -1){
        fillArray(newStr, array)
    } 
    return array
  } 

  const validateOperation = () => {
    let newErrors = []
    const functions = ["max", "min", "multiply", "divide", "add", "exp", "subtract", "calculateAQI", "calculateHI", "calculateTCIPMV", "calculateTCIPPD"]
    const operationString = rangeLabelForm.values.operation.replaceAll(",", ", ").replaceAll("(", "( ")

    // //check for invalid characters
    // var format = /[ `!@#$%^&*+\-=\[\];':"\\|<>\/?~]/
    // const characters = operationString.split("")
    // characters.forEach((char) => {
    //   if(format.test(char)){
    //     if(!newErrors.find((error) => error == "Invalid characters present in the Equation")){
    //       newErrors.push("Invalid characters present in the Equation")
    //       setErrors(newErrors)
    //       return
    //     }
    //   }
    // })

    //Check Number of brackets
    const noOfOpening = operationString.split("(").length - 1
    const noOfClosing = operationString.split(")").length - 1

    if(noOfOpening > 0 && noOfClosing > 0){
      if(noOfClosing < noOfOpening){
        newErrors.push("Close all functions")
        setErrors(newErrors)
        return
      }
      if(noOfClosing > noOfOpening){
        newErrors.push("Extra ')' has been entered")
        setErrors(newErrors)
        return
      }
    } else {
      newErrors.push("Invalid function format (Provide opening and closing brackets)")
      setErrors(newErrors)
      return
    }
  
    const functionsArray = fillArray(operationString, [])
    let newString = rangeLabelForm.values.operation
    functionsArray.forEach((func) => {
      const functionName = func.split("(")[0]
      const found = functions.find((f) => f == functionName)
      if(found){
        const parameters = func.split("(")[1].replace(")", "")
        const parametersList = parameters.split(",")
        switch(functionName){
          case "min": 
            if(parametersList.length < 2){
              newErrors.push(`${functionName} must have atleast two parameters`)
            }
            break;
          case "max": 
            if(parametersList.length < 2){
              newErrors.push(`${functionName} must have atleast two parameters`)
            }
            break;
            case "add": 
            if(parametersList.length < 2){
              newErrors.push(`${functionName} must have atleast two parameters`)
            }
            if(parametersList.length > 4){
              newErrors.push(`${functionName} can't have more than four parameters`)
            }
            break;
          case "multiply": 
            if(parametersList.length < 2){
              newErrors.push(`${functionName} must have atleast two parameters`)
            }
            if(parametersList.length > 4){
              newErrors.push(`${functionName} can't have more than four parameters`)
            }
            break;
          case "subtract":
            if(parametersList.length > 2){
              newErrors.push(`${functionName} can only have two parameters`)
            }
            if(parametersList.length < 2) {
              newErrors.push(`${functionName} must have two parameters`)
            }
            break;
          case "divide":
            if(parametersList.length > 2){
              newErrors.push(`${functionName} can only have two parameters`)
            }
            if(parametersList.length<2) {
              newErrors.push(`${functionName} must have two parameters`)
            }
            break;
          case "exp":
            if(parametersList.length > 2){
              newErrors.push(`${functionName} can only have two parameters`)
            }
            break;
          case "calculateAQI":
            if(parametersList.length !== 4) {
              newErrors.push(`${functionName} takes in four environmental parameters (PM2.5, PM10, CO2, and VOC)`)
            }
            break;
          case "calculateHI":
            if(parametersList.length !== 2){
              newErrors.push(`${functionName} takes in two environmental parameters (Temperature, Humidity)`)
            }
            break;
          case "calculateTCIPMV":
            if(parametersList.length !== 2){
              newErrors.push(`${functionName} takes in two environmental parameters (Temperature, Humidity)`)
            }
            break;
          case "calculateTCIPPD":
            if(parametersList.length !== 2){
              newErrors.push(`${functionName} takes in two environmental parameters (Temperature, Humidity)`)
            }
            break;
        }
        let datapointCount = 0
        parametersList.forEach((parameter) => {
          const param = parameter.replaceAll(/\s/g,'' )
          if(param !== "func"){
            if(param.split("")[0] == "{"){
              datapointCount ++
              const datapoint = param.split("").slice(1,-1).join("")
              const datapointFound = props.datapoints.find((data) => ((data.name == datapoint)))
              if(!datapointFound){
                const foundFriendlyName = props.datapoints.find((dp) => dp.friendlyName.replaceAll(/\s/g,'' ) == datapoint)
                if(foundFriendlyName){
                  newString = newString.replace(parameter.replace(" {", "{"), `{ ${foundFriendlyName.name} }`)
                } else {
                  const found = newErrors.find((val) => val == `${datapoint} has not been selected for your service`)
                  if(!found){
                    newErrors.push(`${datapoint} has not been selected for your service`)
                  }
                }
              }
            } else{
              if(!Number(param) && param != 0){
                const found = newErrors.find((val) => val == `${param} is not a valid parameter. Constants may only be integers`)
                if(!found){
                  newErrors.push(`${param} is not a valid parameter. Constants may only be integers`)
                }
              }
            }
          } else {
            datapointCount ++
          }
        })
        if(datapointCount == 0){
          newErrors.push(`All the parametes for the ${functionName} function have been entered as constants`)
        }
      } else {
        if(functionName){
          newErrors.push(`${functionName} is not a defined function`)
        } else {
          newErrors.push("Invalid Format")
        }
      }
    })

    setErrors(newErrors)

    if(!newErrors.length){
      if (newString !== rangeLabelForm.values.operation){
        rangeLabelForm.setFieldValue("operation", newString)
        setOperationChanged(true)
      }
      setValidated(true)
      return true
    } else {
      return false
    }
  }

  const selectDatapointFromTheList = (datapoint)=>{
    let newInputValue = rangeLabelForm.values.operation;

    const openingIndex = newInputValue.lastIndexOf("{")
    newInputValue = newInputValue.slice(0, openingIndex)
    newInputValue = newInputValue + "{ " + datapoint?.friendlyName + " }" 
    rangeLabelForm.setFieldValue('operation',newInputValue)
  }
  
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          style={{ display: "none" }}
          type="file"
          id="widget-img"
          ref={inputRef}
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleImage}
          multiple={false}
        ></input>
        <div
          id="widget-img-btn"
          onClick={() => inputRef.current.click()}
          onMouseEnter={() => setIsShown(true)}
          onMouseLeave={() => setIsShown(false)}
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eeeeee",
              borderRadius: "50%",
              height: "145px",
              width: "145px",
              border: "1px solid #b1b1b1",
              backgroundImage: `url(${preview})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: isShown ? "blur(1px)" : "",
            }}
          >
            {preview ? null : (
              <HideImageIcon
                style={{
                  color: "#808080",
                  height: "40px",
                  width: "40px",
                }}
              />
            )}
          </div>
          {isShown ? (
            <CameraAltIcon
              style={{
                height: "50px",
                width: "50px",
                color: "#555555",
                position: "absolute",
                top: "50px",
                left: "50px",
              }}
            />
          ) : null}
        </div>
        <p style={{ color: "#8086a3" }}>
          <b>Widget Icon</b>
        </p>
      </div>
      <form onSubmit={rangeLabelForm.handleSubmit}>
        <p
          style={{
            fontSize: "16px",
            color: "#666666",
            marginBottom: "10px",
          }}
        >
          <b>Details</b>
        </p>
        <TextField
          required
          label="Sensor Name"
          fullWidth
          margin="dense"
          id="name"
          error={rangeLabelForm.touched.name && rangeLabelForm.errors.name}
          value={rangeLabelForm.values.name}
          onChange={rangeLabelForm.handleChange}
          onBlur={rangeLabelForm.handleBlur}
          helperText={
            rangeLabelForm.touched.name ? rangeLabelForm.errors.name : ""
          }
        />
{props.type == "datapoint" ? <TextField
          required
          label={"Datapoint"}
          fullWidth
          margin="dense"
          id={props.type}
          error={rangeLabelForm.touched.datapoint && rangeLabelForm.errors.datapoint}
          value={rangeLabelForm.values.datapoint}
          onChange={rangeLabelForm.handleChange}
          onBlur={rangeLabelForm.handleBlur}
          helperText={
            rangeLabelForm.touched.datapoint ? rangeLabelForm.errors.datapoint : ""
          }
        />: 
        <FormTooltip
          open={infoPopup}
          disableHoverListener
          title={
            <Fragment>
              <div style={{height: "40vh", overflowY: "scroll"}}>
                <div style={{display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px"}}>
                  <span>
                    Value Insights allows creation of custom datapoints based on a formula created from existing datapoints and/or constants. These may also be prebuilt custom libraries.
                  </span>
                  <span>
                    Equation is expected in form of a single line formula that may contain any of the following operations
                    <ul style={{paddingLeft: "10px"}}>
                      <li style={{fontWeight: "bold"}}>
                        {"min({param A}, {param B}, ...)".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "min({param A}, {param B}, ...)")}}>{char}</span>
                        ))}             
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"max({param A}, {param B}, ...)".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "max({param A}, {param B}, ...)")}}>{char}</span>
                        ))} 
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"add({param A}, {param B}, 12, ...)".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "add({param A}, {param B}, 12, ...)")}}>{char}</span>
                        ))} 
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"subtract({param A}, 12)".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "subtract({param A}, 12)")}}>{char}</span>
                        ))} 
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"multiply({param A}, {param B}, {param C}, ...)".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "multiply({param A}, {param B}, {param C}, ...)")}}>{char}</span>
                        ))} 
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"divide({param A}, {param B})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "divide({param A}, {param B})")}}>{char}</span>
                        ))} 
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"exp({base}, {exponent})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "exp({base}, {exponent})")}}>{char}</span>
                        ))} 
                      </li>
                    </ul>
                  </span>
                  <span>
                    Following custom functions are also available
                    <ul style={{paddingLeft: "10px"}}>
                      <li style={{fontWeight: "bold"}}>
                        {"calculateAQI({PM2.5 param}, {PM10 param}, {CO2 param}, {VOC param})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "calculateAQI({PM2.5 param}, {PM10 param}, {CO2 param}, {VOC param})")}}>{char}</span>
                        ))}
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"calculateHI({Temperature param}, {Humidity param})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "calculateHI({Temperature param}, {Humidity param})")}}>{char}</span>
                        ))}
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"calculateTCIPMV({Temperature param}, {Humidity param})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "calculateTCIPMV({Temperature param}, {Humidity param})")}}>{char}</span>
                        ))}
                      </li>
                      <li style={{fontWeight: "bold"}}>
                        {"calculateTCIPPD({Temperature param}, {Humidity param})".split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "calculateTCIPPD({Temperature param}, {Humidity param})")}}>{char}</span>
                        ))}
                      </li>
                    </ul> 
                  </span>
                  <span>
                    <span style={{fontWeight: "bold"}}>Note</span> that param within these functions can be a datapoint, a constant or another fucntion.
                  </span>
                  <span>
                    {"Datapoints can be added by encapsulating the friednly name or datapoint within curly brackets e.g. {Temperature}."}
                  </span>
                  <span>
                    Some examples:
                    <ul style={{paddingLeft: "10px"}}>
                      <li style={{fontWeight: "bold"}}>
                        {("add(max({temperature},12},3.5)").split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "add(max({temperature},12},3.5)")}}>
                            {char}
                          </span>))}
                      </li>
                      <li style={{fontWeight: "bold"}}>
                      {("max( add({PM2_5}, {PM1_5}, min( add(12, {Temperature}), 34)), 12, multiply(34, {Humidity}))").split("").map((char, i) => (
                          <span style={{color: checkChar(char, i, "max( add({PM2_5}, {PM1_5}, min( add(12, {Temperature}), 34)), 12, multiply(34, {Humidity}))")}}>
                            {char}
                          </span>))}
                      </li>
                    </ul>
                    <span style={{paddingLeft: "10px"}}></span>
                  </span>
                </div>
              </div>
            </Fragment>
          }
          placement="right"
          arrow
          TransitionComponent={Zoom} 
        >
            <div
              className = {styles.operationsContainer} 
              >
              <TextField
                multiline
                minRows={2}
                required
                fullWidth
                label="Equation"
                margin="dense"
                id={"operation"}
                value={rangeLabelForm.values.operation}
                error={rangeLabelForm.touched.operation && rangeLabelForm.errors.operation}
                inputProps={{style: {color: "rgba(0,0,0,0.3)", lineHeight: "22px", zIndex: 5, fontSize: "15px", width: "500px", letterSpacing: "normal", fontFamily: "Arial, Helvetica, sans-serif"}}}
                onChange={rangeLabelForm.handleChange}
                onBlur={rangeLabelForm.handleBlur}
                helperText={
                  rangeLabelForm.touched.operation ? rangeLabelForm.errors.operation : ""
                }
              />
              <div style={{position: "absolute", top: "24px", left: "14px", width: "500px", overflowWrap: "break-word", lineHeight: "22px", fontSize: "15px", letterSpacing: "normal", fontFamily: "Arial, Helvetica, sans-serif"}}>
                {rangeLabelForm.values.operation !== "" ?
                  rangeLabelForm.values.operation.split("").map((char,i, arr) => <span style={{color: checkChar(char, i)}} key={i}>
                    {showDatapoints && i == arr.length-1 ? (
                      <HtmlTooltip
                        title={
                          <Fragment>
                            <div style={{display:"flex", flexDirection: "column"}}>
                            {char == "{" ? <span style={{ fontWeight: "bold", display: 'flex', justifyContent: 'space-between' }}>Available Datapoints  <span style={{ cursor: 'pointer' }} onClick={() => { setShowHTML_Tooltip(false) }}>
                                <CloseIcon />
                              </span></span> : null}
                              <div style={{display: "flex", flexDirection:"column"}}>
                              {props.datapoints.map((data) => {
                                const splitIndex = rangeLabelForm.values.operation.lastIndexOf("{")
                                if (i == splitIndex){
                                  return (<span style={{ cursor: 'pointer' }} onClick={() => { selectDatapointFromTheList(data) }}>{`${data.friendlyName} (${data.name})`}</span>)
                                }
                                const datapoint = rangeLabelForm.values.operation.slice(splitIndex+1)
                                if(data.friendlyName.toLowerCase().includes(datapoint?.toLowerCase()) || data.name.toLowerCase().includes(datapoint?.toLowerCase())){
                                  return(<span style={{ cursor: 'pointer' }} onClick={() => { selectDatapointFromTheList(data) }}>{`${data.friendlyName} (${data.name})`}</span>)
                                }
                              })}
                              {props.datapoints.filter((data) => {
                                const splitIndex = rangeLabelForm.values.operation.lastIndexOf("{")
                                const datapoint = rangeLabelForm.values.operation.slice(splitIndex+1)
                                if(data.friendlyName.toLowerCase().includes(datapoint?.toLowerCase()) || data.name.toLowerCase().includes(datapoint?.toLowerCase())){
                                  return data
                                }
                              }).length == 0 ? <span style={{color: "red"}}>No Match</span> : null}
                              </div>
                            </div>
                          </Fragment>
                        }
                        placement="bottom"
                        TransitionComponent={Fade}
                        arrow
                        TransitionProps={{timeOut: 0}}
                        open={showHTML_Tooltip}
                      >
                        {char}
                      </HtmlTooltip>) 
                      : 
                      char}
                  </span>) : null
                }
              </div>
              {props.type == "valueInsight" ? <div style={{position: "absolute", top: "13px", right: "5px", zIndex: "10"}} onMouseEnter={() => {setInfoPopup(true)}} onMouseLeave={() => {if(!clicked){setInfoPopup(false)}}}>
              <InfoIcon className={styles.iconStyles} onClick = {() => {
                if(clicked){
                  setInfoPopup(false)
                  setClicked(false)  
                } else {
                 setInfoPopup(true)
                 setClicked(true) 
                } 
              }}/>
            </div> : null}
              {rangeLabelForm.values.operation !== "" ? (
                <div style={{position: "absolute", bottom: "10px", right: "15px", zIndex: "10"}}>
                  {!errors.length ? (
                    <>
                      {(!validated) ? 
                        (<Tooltip
                          title="Validate"
                          placement="left"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <FlakyIcon color={checkColor()} onClick={() => {validateOperation()}}/>
                        </Tooltip>)
                        : (
                        <Tooltip
                          title="Validated"
                          placement="left"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <TaskAltIcon color={checkColor()} onClick={() => {validateOperation()}}/>
                        </Tooltip>)}
                    </>
                  ) : (
                    <HtmlTooltip
                      title={
                        <Fragment>
                          {errors.map((error) => (<span style={{display: "block", color: "red"}}>{error}</span>))}
                        </Fragment>
                      }
                      transitionComponent = {Zoom}
                      placement="left"
                      arrow
                    >
                      <ErrorOutlineIcon color={checkColor()} onClick={() => {validateOperation()}}/>
                    </HtmlTooltip>
                  )} 
                </div>
              ): null}
            </div>
          </FormTooltip>}
        <TextField
          required
          label="Description"
          fullWidth
          margin="dense"
          id="description"
          error={
            rangeLabelForm.touched.description &&
            rangeLabelForm.errors.description
          }
          value={rangeLabelForm.values.description}
          onChange={rangeLabelForm.handleChange}
          onBlur={rangeLabelForm.handleBlur}
          helperText={
            rangeLabelForm.touched.description
              ? rangeLabelForm.errors.description
              : ""
          }
        />

        <span
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
          }}
        >
          <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
            Set default view to Timeseries
          </p>
          <FormControlLabel
            control={
              <Switch
                name="defaultTimeseries"
                checked={rangeLabelForm.values.defaultTimeseries}
                onChange={rangeLabelForm.handleChange}
              />
            }
          />
        </span>
        <span
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            position: "relative",
            top: "-10px",
          }}
        >
          <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
            Make it a configuration
          </p>
          <FormControlLabel
            control={
              <Switch
                name="config"
                checked={rangeLabelForm.values.config}
                onChange={rangeLabelForm.handleChange}
              />
            }
          />
        </span>

        <FormikProvider value={rangeLabelForm}>
          <FieldArray
            name="ranges"
            render={(arrayHelpers) => (
              <div style={{ marginTop: "20px" }}>
                <span style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={() => {
                      arrayHelpers.push({
                        label: "",
                        value: "",
                        state: false,
                      });
                      setTimeout(() => {
                        scrollToBottom();
                      }, 100);
                    }}
                  >
                    Add another state
                  </Button>
                </span>
                <div
                  style={{
                    maxHeight: "325px",
                    height: "calc(40vh - 80px)",
                    overflowY: "scroll",
                  }}
                >
                  {rangeLabelForm.values.ranges.map((elm, index) => (
                    <div style={{ width: "100%", marginBottom: "10px" }}>
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "16px",
                            color: "#666666",
                            marginBottom: "10px",
                          }}
                        >
                          <b>{`Range ${index + 1}`}</b>
                        </p>
                        {index > 1 ? (
                          <Button
                            onClick={() => arrayHelpers.remove(index)}
                            color="error"
                          >
                            Remove
                          </Button>
                        ) : null}
                      </span>

                      <div style={{ display: "flex", gap: "20px" }}>
                        <TextField
                          required
                          label="Name"
                          fullWidth
                          margin="dense"
                          name={`ranges[${index}].label`}
                          value={rangeLabelForm.values.ranges[index].label}
                          onChange={rangeLabelForm.handleChange}
                          // error={
                          //   rangeLabelForm.touched.defaultName &&
                          //   rangeLabelForm.errors.defaultName
                          // }
                          // value={rangeLabelForm.values.defaultName}
                          // onChange={rangeLabelForm.handleChange}
                          // onBlur={rangeLabelForm.handleBlur}
                          // helperText={
                          //   rangeLabelForm.touched.defaultName
                          //     ? rangeLabelForm.errors.defaultName
                          //     : ""
                          // }
                        />
                        <TextField
                          required
                          label="Min"
                          type="number"
                          fullWidth
                          margin="dense"
                          name={`ranges[${index}].min`}
                          value={rangeLabelForm.values.ranges[index].min}
                          onChange={rangeLabelForm.handleChange}
                          // error={
                          //   rangeLabelForm.touched.defaultCommand &&
                          //   rangeLabelForm.errors.defaultCommand
                          // }
                          // value={rangeLabelForm.values.defaultCommand}
                          // onChange={rangeLabelForm.handleChange}
                          // onBlur={rangeLabelForm.handleBlur}
                          // helperText={
                          //   rangeLabelForm.touched.defaultCommand
                          //     ? rangeLabelForm.errors.defaultCommand
                          //     : ""
                          // }
                        />
                        <TextField
                          required
                          label="Max"
                          type="number"
                          fullWidth
                          margin="dense"
                          name={`ranges[${index}].max`}
                          value={rangeLabelForm.values.ranges[index].max}
                          onChange={rangeLabelForm.handleChange}
                          // error={
                          //   rangeLabelForm.touched.defaultCommand &&
                          //   rangeLabelForm.errors.defaultCommand
                          // }
                          // value={rangeLabelForm.values.defaultCommand}
                          // onChange={rangeLabelForm.handleChange}
                          // onBlur={rangeLabelForm.handleBlur}
                          // helperText={
                          //   rangeLabelForm.touched.defaultCommand
                          //     ? rangeLabelForm.errors.defaultCommand
                          //     : ""
                          // }
                        />
                      </div>
                    </div>
                  ))}
                  <div ref={rangesEndRef} />
                </div>
              </div>
            )}
          />
        </FormikProvider>
        <DialogActions>
          <Button
            id="back"
            onClick={() => props.setSwitcherState("")}
            color="primary"
          >
            Back
          </Button>
          <Button id="add" type="submit" color="primary" disabled={addSensorResult.isLoading}>
            Add
            {addSensorResult.isLoading ? (<span style={{paddingLeft: "5px", paddingTop: "1px"}}><CircularProgress size={20}/></span>) : null}
          </Button>
        </DialogActions>
      </form>
    </div>
  );
}
