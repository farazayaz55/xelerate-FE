import { useState, useEffect } from "react";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";

const useUpload = () => {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState(null);
  const [type, setType] = useState(null);
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [skip, setSkip] = useState(true);
  const signed = useGetSignedUsersQuery({ token, type }, { skip });
  const [upload, uploadResult] = useUploadUserMutation();

  useEffect(() => {
    if (signed.isSuccess) {
      upload({ url: signed.data.payload, body: file });
    }
    if (signed.isError) {
      showSnackbar(
        "SVG",
        signed.error?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [signed.isFetching]);

  useEffect(() => {
    if (uploadResult.isSuccess) {
      setUrl(signed.data.payload.split("?")[0]);
      setIsLoading(false);
    }
    if (uploadResult.isError) {
      showSnackbar("SVG", uploadResult.error?.message, "error", 1000);
    }
  }, [uploadResult]);

  const fetchUrl = (file, type) => {
    setFile(file);
    setType(type);
    setIsLoading(true);
    if (skip) setSkip(false);
    else signed.refetch();
  };

  const reset = () => {
    setUrl(null);
  };

  return { url, isLoading, error, fetchUrl, reset };
};

export default useUpload;
