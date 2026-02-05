import Header from "./components/Header/Header";
import UploadForm from "./components/UploadForm/UploadForm";
import UploadList from "./components/UploadList/UploadList";
import Card from "./components/Card/Card";
import { useVideoUploadController } from "./hooks/useVideoUploadController";

export default function App() {
  const controller = useVideoUploadController();

  return (
    <div className="app">
      <Header />

      <main className="main-layout">
        <Card
          title="Uploaded videos"
          description="Review your S3 uploads, metadata, and storage keys."
        >
          <UploadList uploads={controller.uploads} uploadCount={controller.uploadCount} />
        </Card>

        <Card
          title="Upload to AWS S3"
          description="Drag in a file, add a title, and push it to your bucket."
        >
          <UploadForm
            title={controller.title}
            setTitle={controller.setTitle}
            setFile={controller.setFile}
            isUploading={controller.isUploading}
            onSubmit={controller.handleSubmit}
            status={controller.status}
          />
        </Card>
      </main>

      <footer>
        Note: The UI currently simulates S3 uploads. Connect your backend to replace the mock
        uploader with real AWS S3 signed URL uploads.
      </footer>
    </div>
  );
}
