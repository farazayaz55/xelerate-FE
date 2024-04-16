function showSnackbar(title, message, variant, timeout, enqueueSnackbar) {
  return enqueueSnackbar(
    { title, message: message ? message : "Something went wrong", variant },
    { timeout }
  );
}

export { showSnackbar };
