import React, { Fragment, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { useSnackbar } from "notistack";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateSensorMutation } from "services/services";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { makeStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses} from "@mui/material/Tooltip";
import {styled} from "@mui/material/styles";
import { Fade, Zoom } from "@mui/material";
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
    color: "#f5f5f9",
  }
}));

const FormTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgb(255, 240, 195)",
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "600px",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #ffd772',
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: "rgba(0,0,0,0)",
    color: "rgb(255, 240, 195)"
  }
}));

export default function Guage(props) {

  const [validated, setValidated] = useState(false)
  const [errors, setErrors] = useState([])
  const [showDatapoints, setShowDatapoints] = useState(false)
  const [showHTML_Tooltip, setShowHTML_Tooltip] = useState(true)
  const [operationChanged, setOperationChanged] = useState(false)
  const [infoPopup, setInfoPopup] = useState(false)
  const [clicked, setClicked] = useState(false)
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const styles = useStyles()

  const guageForm = useFormik({
    initialValues: {
      description: "",
      datapoint: "",
      defaultCommand: "",
      defaultName: "",
      name: "",
      gradient: true,
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
      defaultCommand: Yup.string().required("Required field"),
      defaultName: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      gradient: Yup.string().required("Required field"),
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
        type: "guage",
        config: values.config,
        metaData: {
          Min: values.defaultName,
          Max: values.defaultCommand,
          gradient: values.gradient,
        },
        defaultTimeseries: values.defaultTimeseries,
        typeValue: props.type,
        operation: values.operation
      };

      addSensor({ token, body });
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const [addSensor, addSensorResult] = useCreateSensorMutation();

  useEffect(() => {
    if(guageForm.values.operation == ""){
      setErrors([])
    }
    const operationArray = guageForm.values.operation.split("")
    const noOfOpenParanthesis = guageForm.values.operation.split("{").length -1
    const noOfClosedParanthesis = guageForm.values.operation.split("}").length -1
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
  }, [guageForm.values.operation])

  useEffect(() => {
    if (addSensorResult.isSuccess) {
      let id = addSensorResult.data.payload._id;
      let name = addSensorResult.data.payload.name;
      let friendlyName = addSensorResult.data.payload.friendlyName;
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
      console.log({addSensorResult})
      showSnackbar(props.type == "datapoint" ? "Monitoring" : "Value Insights", addSensorResult.error?.message, "error", 1000);
    }
  }, [addSensorResult]); 

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
    const operationString = operation ? operation : guageForm.values.operation
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
    const operationString = guageForm.values.operation.replaceAll(",", ", ").replaceAll("(", "( ")

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
    let newString = guageForm.values.operation
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
      if (newString !== guageForm.values.operation){
        guageForm.setFieldValue("operation", newString)
        setOperationChanged(true)
      }
      setValidated(true)
      return true
    } else {
      return false
    }
  }
  const selectDatapointFromTheList = (datapoint)=>{
    let newInputValue = guageForm.values.operation;

    const openingIndex = newInputValue.lastIndexOf("{")
    newInputValue = newInputValue.slice(0, openingIndex)
    newInputValue = newInputValue + "{ " + datapoint?.friendlyName + " }" 
    guageForm.setFieldValue('operation',newInputValue)
  }
  
  return (
      <div>
        <form onSubmit={guageForm.handleSubmit}>
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
            error={guageForm.touched.name && guageForm.errors.name}
            value={guageForm.values.name}
            onChange={guageForm.handleChange}
            onBlur={guageForm.handleBlur}
            helperText={guageForm.touched.name ? guageForm.errors.name : ""}
          />
          {props.type == "datapoint" ? <TextField
            required
            label={"Datapoint"}
            fullWidth
            margin="dense"
            id={props.type}
            error={guageForm.touched.datapoint && guageForm.errors.datapoint}
            value={guageForm.values.datapoint}
            onChange={guageForm.handleChange}
            onBlur={guageForm.handleBlur}
            helperText={
              guageForm.touched.datapoint ? guageForm.errors.datapoint : ""
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
                value={guageForm.values.operation}
                error={guageForm.touched.operation && guageForm.errors.operation}
                inputProps={{style: {color: "rgba(0,0,0,0.3)", lineHeight: "22px", zIndex: 5, fontSize: "15px", width: "380px", letterSpacing: "normal", fontFamily: "Arial, Helvetica, sans-serif"}}}
                onChange={guageForm.handleChange}
                onBlur={guageForm.handleBlur}
                helperText={
                  guageForm.touched.operation ? guageForm.errors.operation : ""
                }
              />
              <div style={{position: "absolute", top: "24px", left: "14px", width: "380px", overflowWrap: "break-word", lineHeight: "22px",fontSize: "15px", letterSpacing: "normal", fontFamily: "Arial, Helvetica, sans-serif"}}>
                {guageForm.values.operation !== "" ?
                  guageForm.values.operation.split("").map((char,i, arr) => <span style={{color: checkChar(char, i)}} key={i}>
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
                                const splitIndex = guageForm.values.operation.lastIndexOf("{")
                                if (i == splitIndex){
                                  return (<span style={{ cursor: 'pointer' }} onClick={() => { selectDatapointFromTheList(data) }}>{`${data.friendlyName} (${data.name})`}</span>)
                                }
                                const datapoint = guageForm.values.operation.slice(splitIndex+1)
                                if(data.friendlyName.toLowerCase().includes(datapoint?.toLowerCase()) || data.name.toLowerCase().includes(datapoint?.toLowerCase())){
                                  return(<span style={{ cursor: 'pointer' }} onClick={() => { selectDatapointFromTheList(data) }}>{`${data.friendlyName} (${data.name})`}</span>)
                                }
                              })}
                              {props.datapoints.filter((data) => {
                                const splitIndex = guageForm.values.operation.lastIndexOf("{")
                                const datapoint = guageForm.values.operation.slice(splitIndex+1)
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
              {guageForm.values.operation !== "" ? (
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
            error={guageForm.touched.description && guageForm.errors.description}
            value={guageForm.values.description}
            onChange={guageForm.handleChange}
            onBlur={guageForm.handleBlur}
            helperText={
              guageForm.touched.description ? guageForm.errors.description : ""
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
                  checked={guageForm.values.defaultTimeseries}
                  onChange={guageForm.handleChange}
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
                  checked={guageForm.values.config}
                  onChange={guageForm.handleChange}
                />
              }
            />
          </span>
          <div>
            <p
              style={{
                fontSize: "16px",
                color: "#666666",
                marginBottom: "10px",
              }}
            >
              <b>Gradient</b>
            </p>
            <div style={{ display: "flex", gap: "20px" }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Linear Direction</InputLabel>
                <Select
                  id="direction-dropdown"
                  name="gradient"
                  value={guageForm.values.gradient}
                  onChange={guageForm.handleChange}
                  label="Linear Direction"
                >
                  <MenuItem value={true}>Abnormality at Minimum Value</MenuItem>
                  <MenuItem value={false}>Abnormality at Maximum Value</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <div>
            <p
              style={{
                fontSize: "16px",
                color: "#666666",
                marginBottom: "10px",
              }}
            >
              <b>Ranges</b>
            </p>
            <div style={{ display: "flex", gap: "20px" }}>
              <TextField
                required
                label="Min"
                type="number"
                fullWidth
                margin="dense"
                id="defaultName"
                error={
                  guageForm.touched.defaultName && guageForm.errors.defaultName
                }
                value={guageForm.values.defaultName}
                onChange={guageForm.handleChange}
                onBlur={guageForm.handleBlur}
                helperText={
                  guageForm.touched.defaultName
                    ? guageForm.errors.defaultName
                    : ""
                }
              />
              <TextField
                required
                label="Max"
                type="number"
                fullWidth
                margin="dense"
                id="defaultCommand"
                error={
                  guageForm.touched.defaultCommand &&
                  guageForm.errors.defaultCommand
                }
                value={guageForm.values.defaultCommand}
                onChange={guageForm.handleChange}
                onBlur={guageForm.handleBlur}
                helperText={
                  guageForm.touched.defaultCommand
                    ? guageForm.errors.defaultCommand
                    : ""
                }
              />
            </div>
          </div>
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
