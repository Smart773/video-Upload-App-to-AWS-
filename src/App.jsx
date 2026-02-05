import React, { useMemo, useState } from "react";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import "./App.css";

const defaultForm = {
  region: "",
  bucket: "",
  accessKeyId: "",
  secretAccessKey: "",
  sessionToken: "",
  prefix: ""
};

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const s3Client = useMemo(() => {
    if (!form.region || !form.accessKeyId || !form.secretAccessKey) {
      return null;
    }

    return new S3Client({
      region: form.region,
      credentials: {
        accessKeyId: form.accessKeyId,
        secretAccessKey: form.secretAccessKey,
        sessionToken: form.sessionToken || undefined
      }
    });
  }, [form]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!s3Client) {
      setError("Enter AWS credentials and region before uploading.");
      return;
    }

    if (!form.bucket) {
      setError("Enter an S3 bucket name before uploading.");
      return;
    }

    if (!selectedFile) {
      setError("Choose a video file to upload.");
      return;
    }

    const keyPrefix = form.prefix ? `${form.prefix.replace(/\/+$/, "")}/` : "";
    const objectKey = `${keyPrefix}${selectedFile.name}`;

    try {
      setIsUploading(true);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: form.bucket,
          Key: objectKey,
          Body: selectedFile,
          ContentType: selectedFile.type || "video/mp4"
        })
      );
      setSelectedFile(null);
      await fetchVideoList();
    } catch (uploadError) {
      setError(uploadError?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchVideoList = async () => {
    setError("");

    if (!s3Client) {
      setError("Enter AWS credentials and region to load videos.");
      return;
    }

    if (!form.bucket) {
      setError("Enter an S3 bucket name to load videos.");
      return;
    }

    try {
      setIsLoadingList(true);
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: form.bucket,
          Prefix: form.prefix || undefined
        })
      );
      const items = (response.Contents || [])
        .filter((item) => item.Key)
        .map((item) => ({
          key: item.Key,
          lastModified: item.LastModified,
          size: item.Size
        }))
        .sort((a, b) => {
          if (!a.lastModified || !b.lastModified) return 0;
          return b.lastModified.getTime() - a.lastModified.getTime();
        });
      setVideoList(items);
    } catch (listError) {
      setError(listError?.message || "Unable to load videos.");
    } finally {
      setIsLoadingList(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Video Upload to AWS S3</h1>
          <p>Upload videos on the left and see the uploaded list on the right.</p>
        </div>
      </header>

      <div className="app__content">
        <section className="card">
          <h2>Upload a Video</h2>
          <form className="stack" onSubmit={handleUpload}>
            <label className="field">
              <span>Region</span>
              <input
                name="region"
                type="text"
                placeholder="us-east-1"
                value={form.region}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Bucket name</span>
              <input
                name="bucket"
                type="text"
                placeholder="my-video-bucket"
                value={form.bucket}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Key prefix (optional)</span>
              <input
                name="prefix"
                type="text"
                placeholder="uploads/videos"
                value={form.prefix}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Access key ID</span>
              <input
                name="accessKeyId"
                type="password"
                placeholder="AKIA..."
                value={form.accessKeyId}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Secret access key</span>
              <input
                name="secretAccessKey"
                type="password"
                placeholder="••••••••"
                value={form.secretAccessKey}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Session token (optional)</span>
              <input
                name="sessionToken"
                type="password"
                placeholder="If using temporary credentials"
                value={form.sessionToken}
                onChange={handleFormChange}
              />
            </label>
            <label className="field">
              <span>Video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
              />
            </label>

            <button className="primary" type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload to S3"}
            </button>
          </form>
          <p className="hint">
            Tip: For production apps, use pre-signed URLs instead of embedding AWS keys in the
            browser.
          </p>
          {error ? <div className="error">{error}</div> : null}
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <h2>Uploaded Videos</h2>
              <p>Objects from the bucket and prefix will appear here.</p>
            </div>
            <button className="secondary" type="button" onClick={fetchVideoList}>
              {isLoadingList ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="list">
            {videoList.length === 0 ? (
              <div className="empty">No videos found yet.</div>
            ) : (
              videoList.map((video) => (
                <div className="list__item" key={video.key}>
                  <div>
                    <div className="list__title">{video.key}</div>
                    <div className="list__meta">
                      {video.lastModified
                        ? `Last modified: ${video.lastModified.toLocaleString()}`
                        : "Last modified: --"}
                    </div>
                  </div>
                  <div className="list__size">
                    {typeof video.size === "number"
                      ? `${(video.size / (1024 * 1024)).toFixed(2)} MB`
                      : "--"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
