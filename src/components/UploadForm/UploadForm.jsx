import StatusMessage from "../StatusMessage/StatusMessage";

export default function UploadForm({ title, setTitle, setFile, isUploading, onSubmit, status }) {
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
