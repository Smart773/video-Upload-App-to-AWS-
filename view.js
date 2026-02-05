const { formatBytes } = window.VideoUploadModel;

function StatusMessage({ status }) {
  if (!status.message) return null;
  return <div className={`status ${status.type}`}>{status.message}</div>;
}

function UploadForm({ title, setTitle, setFile, isUploading, onSubmit, status }) {
  return (
    <form className="upload-form" onSubmit={onSubmit}>
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

      <StatusMessage status={status} />
    </form>
  );
}

function UploadList({ uploads, uploadCount }) {
  return (
    <>
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
    </>
  );
}

function AppLayout({ controller }) {
  return (
    <div className="app">
      <header className="header">
        <h1>Video Upload Dashboard</h1>
        <p>Upload videos to AWS S3 and review everything in one place.</p>
      </header>

      <section className="layout">
        <div className="card">
          <h2>Upload to AWS S3</h2>
          <UploadForm
            title={controller.title}
            setTitle={controller.setTitle}
            setFile={controller.setFile}
            isUploading={controller.isUploading}
            onSubmit={controller.handleSubmit}
            status={controller.status}
          />
        </div>

        <div className="card">
          <UploadList uploads={controller.uploads} uploadCount={controller.uploadCount} />
        </div>
      </section>

      <footer>
        Note: The UI currently simulates S3 uploads. Connect your backend to replace the
        mock uploader with real AWS S3 signed URL uploads.
      </footer>
    </div>
  );
}

window.VideoUploadView = {
  AppLayout,
};
