import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export default function App() {
  return (
    <div className="mx-auto flex flex-col place-items-center gap-4">
      <img
        src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
        className="mt-4 rounded"
        width={640}
        crossOrigin="anonymous"
        title="Click to get detection!"
        alt="Post landmark detection sample 1"
      />
      <img
        src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
        className="rounded"
        width={640}
        crossOrigin="anonymous"
        title="Click to get detection!"
        alt="Post landmark detection sample 1"
      />
    </div>
  );
}

async function createPostLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );
  return await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numPoses: 2,
  });
}
