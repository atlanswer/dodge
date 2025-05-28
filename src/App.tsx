import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import type React from "react";
import { useEffect, useState } from "react";

export default function App() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Trust me bro
  useEffect(() => {
    createPostLandmarker().then((res) => {
      setPoseLandmarker(res);
    });
    return () => {
      poseLandmarker?.close();
    };
  }, []);

  async function handleClick(e: React.MouseEvent | React.KeyboardEvent) {
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent).key !== " " &&
      (e as React.KeyboardEvent).key !== "Enter"
    ) {
      return;
    }
    if (poseLandmarker === undefined) {
      console.warn("postLandmarker not initialized yet");
    }
    console.debug("triggered");
  }

  return (
    <div className="mx-auto flex flex-col place-items-center gap-8">
      <div
        className={`mt-10 rounded px-4 py-2 outline ${poseLandmarker ? "bg-green-800" : "bg-yellow-800"}`}
      >
        {poseLandmarker ? "Mediapipe Loaded" : "Loading Mediapipe"}
      </div>
      <button
        className={`rounded ${poseLandmarker && "cursor-pointer hover:outline-4 focus:outline-4"}`}
        onClick={handleClick}
        onKeyDown={handleClick}
        type="button"
        title="Click to get detection!"
      >
        <img
          src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
          className="rounded-[inherit]"
          width={640}
          crossOrigin="anonymous"
          alt="Post landmark detection sample 1"
        />
      </button>
      <button
        className={`rounded ${poseLandmarker && "cursor-pointer hover:outline-4 focus:outline-4"}`}
        onClick={handleClick}
        onKeyDown={handleClick}
        type="button"
        title="Click to get detection!"
      >
        <img
          src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
          className="rounded-[inherit]"
          width={640}
          crossOrigin="anonymous"
          title="Click to get detection!"
          alt="Post landmark detection sample 1"
        />
      </button>
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
