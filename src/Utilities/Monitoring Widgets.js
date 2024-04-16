function hasDecimal(num) {
  return num % 1 != 0;
}

function getMonitoringValues(type, metaData, value, unit) {
  let res = "";
  switch (type) {
    case "rangeLabel":
      let index = 0;
      for (const range of metaData) {
        let min = parseInt(range.min);
        let max = parseInt(range.max);

        if (index == 0 && value < min) {
          res = range.label;
          break;
        }

        if (
          value >= min &&
          (index == metaData.length - 1
            ? value <= max
            : value < parseInt(metaData[index + 1].min))
        ) {
          res = range.label;
          break;
        }
        if (index == metaData.length - 1 && value > max) {
          res = range.label;
          break;
        }
        index += 1;
      }

      return { value: res, unit: "" };

    case "multiState":
      let state = metaData.find((elm) => elm.value == value);
      if (state) {
        res = state.label;
      } else {
        res = value ? `Other(${value.toFixed(2)})` : "";
      }

      return { value: res, unit: "" };

    case "fillLevel":
      res = ((metaData.Min - value) / (metaData.Min - metaData.Max)) * 100;

      return {
        value: parseInt(
          hasDecimal(res) ? res?.toFixed(2).toString() : res.toString()
        ),
        unit: "%",
      };

    case "boolean":
      if (metaData.Active.Value == value) {
        res = metaData.Active.Name;
      } else if (metaData.Default.Value == value) {
        res = metaData.Default.Name;
      } else {
        res = "";
      }
      return { value: res, unit: "" };

    default:
      return {
        value: hasDecimal(value)
          ? value?.toFixed(2).toString()
          : value?.toString(),
        unit: unit,
      };
  }
}

export { getMonitoringValues };
