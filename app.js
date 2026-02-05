function App() {
  const controller = window.VideoUploadController.useVideoUploadController();
  return <window.VideoUploadView.AppLayout controller={controller} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
