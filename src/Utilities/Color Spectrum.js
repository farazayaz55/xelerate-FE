function getColor(val, sensor) {
  let code = [...sensor.colorArray];
  let res;
  if (sensor?.ranges && sensor?.ranges.length) {
    let index = 0;
    for (const range of sensor?.ranges) {
      let min = parseInt(range.min);

      let max = parseInt(range.max);
      if (index == 0 && val < min) {
        res = code[0];
        break;
      }

      if (
        val >= min &&
        (index == sensor?.ranges.length - 1
          ? val <= max
          : val < parseInt(sensor?.ranges[index + 1].min))
      ) {
        res = code[index];
        break;
      }
      if (index == sensor?.ranges.length - 1 && val > max) {
        res = code[index];
        break;
      }
      index += 1;
    }
  } else {
    if (sensor?.reverse) code.reverse();
    let perc = ((sensor.min - val) / (sensor.min - sensor.max)) * 100;
    if (perc > 100) perc = 100;
    if (perc < 0) perc = 0;
    let range = Math.round(100 / code.length);
    let index = Math.trunc(perc / range);
    index = index >= code.length ? index - 1 : index;
    res = code[index];
  }
  return res;
}

function generateBackground(colorArray, reverse) {
  let res;
  let code = [...colorArray];
  if (reverse) code.reverse();
  res = `linear-gradient(to right,${code.join(", ")})`;
  return res;
}

export { getColor, generateBackground };
