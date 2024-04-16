function acceptNegativeAndFloat({ new: e, old }) {
  let arr = e.target.value.split("");
  let last = e.target.value[e.target.value.length - 1];
  if (last && last != 0 && last != "." && last != "-" && !parseInt(last)) {
    return false;
  }
  if (last == "-" && old.length > 0 && e.target.value != "-") {
    return false;
  }
  if (arr.filter((a) => a == ".").length > 1) {
    return false;
  }
  return true;
}

export { acceptNegativeAndFloat };
