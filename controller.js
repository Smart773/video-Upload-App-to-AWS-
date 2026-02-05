const { useEffect, useMemo, useState } = React;

const { loadUploads, mockUploadToS3, saveUploads } = window.VideoUploadModel;

function useVideoUploadController() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setUploads(loadUploads());
  }, []);

  useEffect(() => {
    saveUploads(uploads);
  }, [uploads]);

  const uploadCount = useMemo(() => uploads.length, [uploads]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus({ type: "error", message: "Please select a video file to upload." });
      return;
    }

    setIsUploading(true);
    setStatus({ type: "info", message: "Uploading to AWS S3..." });

    try {
      const uploaded = await mockUploadToS3(file, title.trim());
      setUploads((prev) => [uploaded, ...prev]);
      setFile(null);
      setTitle("");
      setStatus({ type: "success", message: "Upload complete! Video saved to S3." });
    } catch (error) {
      setStatus({ type: "error", message: "Upload failed. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    handleSubmit,
    isUploading,
    setFile,
    setTitle,
    status,
    title,
    uploadCount,
    uploads,
  };
}

window.VideoUploadController = {
  useVideoUploadController,
};
