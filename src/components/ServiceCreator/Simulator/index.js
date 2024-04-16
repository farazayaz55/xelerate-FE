import React, { Fragment, useEffect, useState } from "react";
import { TextField, IconButton, Paper, CardActions } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
// import { Field, reduxForm } from "redux-form";
import { startSimulator } from "../../../actions/simulatorActions";
import { connect } from "react-redux";

export default function Simulator(props) {
  async function startMockup(formValues) {
    let body = {};
    let arr = [];
    body.type = props.serviceName;
    body.sources = props.createdDevices;
    body.interval = formValues.interval.trim();
    props.sensor.forEach((elm) => {
      let temp = {};
      temp.name = elm;
      temp.type = "Number";
      temp.min = formValues[`${elm}:min`].trim();
      temp.max = formValues[`${elm}:max`].trim();
      temp.unit = formValues[`${elm}:unit`].trim();
      arr.push(temp);
    });
    body.parametersInfo = arr;
    await props.startSimulator(body);
    if (props.res3.startSimulator.success) {
      props.setSnackType("success");
    } else {
      props.setSnackType("fail");
    }
    props.setSnackText(props.res3.startSimulator.message);
    props.setSnack(true);
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h3>Data Simulation</h3>
        <p>
          Now you can turn on the simulation by adding one time details of the
          sensors data.
        </p>
        <br></br>
        <form>
          <Card>
            <CardBody>
              {props.sensor.map((elm) => (
                <div style={{ display: "flex" }}>
                  <Chip
                    style={{
                      color: "white",
                      marginTop: "22px",
                      marginRight: "10px",
                    }}
                    label={elm}
                    color="primary"
                  />
                  <Field
                    name={`${elm}:min`}
                    component={({ input }) => {
                      return (
                        <TextField
                          type="number"
                          margin="dense"
                          id={`${elm}:min`}
                          label="Min"
                          fullWidth
                          style={{
                            marginRight: "10px",
                          }}
                          {...input}
                        />
                      );
                    }}
                  />
                  <Field
                    name={`${elm}:max`}
                    component={({ input }) => {
                      return (
                        <TextField
                          type="number"
                          margin="dense"
                          id={`${elm}:max`}
                          label="Max"
                          fullWidth
                          style={{
                            marginRight: "10px",
                          }}
                          {...input}
                        />
                      );
                    }}
                  />
                  <Field
                    name={`${elm}:unit`}
                    component={({ input }) => {
                      return (
                        <TextField
                          margin="dense"
                          id={`${elm}:unit`}
                          label="Unit"
                          fullWidth
                          {...input}
                        />
                      );
                    }}
                  />
                </div>
              ))}
              <div style={{ display: "flex" }}>
                <Chip
                  style={{
                    color: "white",
                    marginTop: "22px",
                    marginRight: "10px",
                  }}
                  label="Time interval"
                  color="primary"
                />
                <Field
                  name="interval"
                  component={({ input }) => {
                    return (
                      <TextField
                        type="number"
                        margin="dense"
                        id="name"
                        label="Seconds"
                        fullWidth
                        {...input}
                      />
                    );
                  }}
                />
              </div>
            </CardBody>
            <CardActions>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                style={{ color: "white" }}
                onClick={props.handleSubmit(startMockup)}
              >
                Generate Simulated Data
              </Button>
            </CardActions>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    res: state.servicecreator,
    res2: state.devices,
    res3: state.simulator,
  };
};

const mapDispatchToProps = {
  startSimulator,
};

Simulator = connect(mapStateToProps, mapDispatchToProps)(Simulator);

// export default reduxForm({
//   form: "simulator",
// })(Simulator);
