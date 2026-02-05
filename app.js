const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = "videoUploads";

const mockUploadToS3 = (file, title) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: title || file.name,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        s3Key: `uploads/${file.name}`,
      });
    }, 900);
  });

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${sizes[index]}`;
}

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUploads(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
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

  return (
    <div className="app">
      <header className="header">
        <h1>Video Upload Dashboard</h1>
        <p>Upload videos to AWS S3 and review everything in one place.</p>
      </header>

      <section className="layout">
        <div className="card">
          <h2>Upload to AWS S3</h2>
          <form className="upload-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Video title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Product demo"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="file">Choose a video file</label>
              <input
                id="file"
                type="file"
                accept="video/*"
                onChange={(event) => setFile(event.target.files[0])}
              />
              <p className="helper">Supported formats: MP4, MOV, AVI (up to 2GB).</p>
            </div>

            <button className="button" type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Video"}
            </button>

            {status.message && (
              <div className={`status ${status.type}`}>{status.message}</div>
            )}
          </form>
        </div>

        <div className="card">
          <h2>
            Uploaded videos <span className="badge">{uploadCount}</span>
          </h2>
          <div className="video-list">
            {uploads.length === 0 ? (
              <div className="empty-state">
                No videos uploaded yet. Start by uploading a video on the left.
              </div>
            ) : (
              uploads.map((video) => (
                <div className="video-item" key={video.id}>
                  <h3>{video.title}</h3>
                  <div className="video-meta">File: {video.filename}</div>
                  <div className="video-meta">Size: {formatBytes(video.size)}</div>
                  <div className="video-meta">S3 Key: {video.s3Key}</div>
                  <div className="video-meta">
                    Uploaded: {new Date(video.uploadedAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer>
        Note: The UI currently simulates S3 uploads. Connect your backend to replace the
        mock uploader with real AWS S3 signed URL uploads.
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
