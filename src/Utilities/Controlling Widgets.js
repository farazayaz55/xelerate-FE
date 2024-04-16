function extractCommand(command, value, text) {
  let index = command.indexOf(text);
  let first = command.substring(0, index);
  let temp = command.substring(index + 1);
  let last = temp.substring(temp.indexOf("}") + 1);
  let firstIndex;
  if (first.length) firstIndex = value.indexOf(first);
  else firstIndex = 0;
  let lastIndex;
  if (last.length) lastIndex = value.indexOf(last);
  else lastIndex = command.length - 1;
  return value.substring(firstIndex + first.length, lastIndex);
}

function getControllingValues(actuator, setValue) {
  // let actuator = actuators.find((a) => a._id == id);
  let command;
  let label;
  let value;
  let temp;

  switch (actuator?.type) {
    case "power":
      label =
        actuator.metaData.Default.Value == setValue
          ? actuator.metaData.Default.Name
          : actuator.metaData.Active.Name;
      value =
        actuator.metaData.Default.Value == setValue
          ? actuator.metaData.Default.Value
          : actuator.metaData.Active.Value;
      command = setValue;
      break;

    case "touch":
      label = setValue;
      value = setValue;
      command = setValue;
      break;

    case "text":
      if (actuator.metaData?.template) {
        temp = extractCommand(actuator.metaData.template, setValue, "{input}");
        label = temp;
        value = temp;
        command = temp;
      } else {
        label = setValue;
        value = setValue;
        command = setValue;
      }
      break;

    case "numeric":
      temp = parseFloat(extractCommand(actuator.metaData.Command, setValue, "{range}"));
      command = temp;
      label = `Level ${temp}`;
      value = actuator.metaData.Command.replaceAll("{range}", temp);
      break;

    case "thermostat":
      temp = parseFloat(extractCommand(actuator.metaData.Command, setValue, "{range}"));
      command = temp;
      label = `Level ${temp}`;
      value = actuator.metaData.Command.replaceAll("{range}", temp);
      break;

    default:
      break;
  }
  return {
    actuator: actuator?.name,
    command,
    label,
    value,
  };
}

export { getControllingValues };
