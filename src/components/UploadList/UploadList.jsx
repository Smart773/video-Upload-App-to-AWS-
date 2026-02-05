import { formatBytes } from "../../models/uploadModel";

export default function UploadList({ uploads, uploadCount }) {
  return (
    <div className="upload-list">
      <div className="list-header">
        <div>
          <p className="eyebrow">S3 Video Library</p>
          <h2>Uploaded videos</h2>
        </div>
        <span className="badge">{uploadCount}</span>
      </div>
      <div className="video-list">
        {uploads.length === 0 ? (
          <div className="empty-state">
            No videos uploaded yet. Start by uploading a video on the right.
          </div>
        ) : (
          uploads.map((video) => (
            <div className="video-item" key={video.id}>
              <div>
                <h3>{video.title}</h3>
                <p>File: {video.filename}</p>
                <p>Size: {formatBytes(video.size)}</p>
              </div>
              <div>
                <p className="meta-label">S3 Key</p>
                <p className="mono">{video.s3Key}</p>
                <p className="meta-label">Uploaded</p>
                <p className="mono">{new Date(video.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
