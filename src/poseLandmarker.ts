import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export async function createPostLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://unpkg.com/@mediapipe/tasks-vision/wasm",
  );
  return await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 2,
  });
}
