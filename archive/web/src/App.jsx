import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(response.data);

    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>CastingAI</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload & Detect
      </button>

      <br /><br />

      {result && (
        <div>
          <h2>Detection Results</h2>

          <p>
            <strong>Filename:</strong> {result.filename}
          </p>

          {result.detections.map((det, index) => (
            <div key={index}>
              <p>
                Defect Class: {det.class_id}
              </p>

              <p>
                Confidence: {det.confidence}
              </p>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;