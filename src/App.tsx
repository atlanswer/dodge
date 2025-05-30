import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type React from "react";
import { useEffect, useState } from "react";

export default function App() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker>();
  const [runningMode, setRunningMode] = useState<"IMAGE" | "VIDEO">("IMAGE");

  // biome-ignore lint/correctness/useExhaustiveDependencies: Trust me bro
  useEffect(() => {
    createPostLandmarker().then((res) => {
      setPoseLandmarker(res);
    });
    return () => {
      poseLandmarker?.close();
    };

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
        runningMode: runningMode,
        numPoses: 2,
      });
    }
  }, []);

  async function handleClick(
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent).key !== " " &&
      (e as React.KeyboardEvent).key !== "Enter"
    ) {
      return;
    }
    if (poseLandmarker === undefined) {
      console.warn("postLandmarker not initialized yet");
      return;
    }

    if (runningMode === "VIDEO") {
      await poseLandmarker.setOptions({ runningMode: "IMAGE" });
      setRunningMode("IMAGE");
    }

    // @ts-expect-error: Trust me bro
    const res = poseLandmarker.detect(e.target);
  }

  return (
    <div className="mx-auto flex flex-col place-items-center gap-8 py-10">
      <div
        className={`rounded px-4 py-2 outline ${poseLandmarker ? "bg-green-800" : "bg-yellow-800"}`}
      >
        {poseLandmarker ? "Mediapipe Loaded" : "Loading Mediapipe"}
      </div>
      <button
        className={`grid grid-cols-1 grid-rows-1 rounded ${poseLandmarker && "cursor-pointer hover:outline-4 focus:outline-4"}`}
        onClick={handleClick}
        onKeyDown={handleClick}
        type="button"
        title="Click to get detection!"
      >
        <img
          src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
          className="col-start-1 row-start-1 rounded-[inherit]"
          width={640}
          crossOrigin="anonymous"
          alt="Post landmark detection sample 1"
        />
        <canvas className="col-start-1 row-start-1 h-full w-full"></canvas>
      </button>
      <button
        className={`grid grid-cols-1 grid-rows-1 rounded ${poseLandmarker && "cursor-pointer hover:outline-4 focus:outline-4"}`}
        onClick={handleClick}
        onKeyDown={handleClick}
        type="button"
        title="Click to get detection!"
      >
        <img
          src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
          className="col-start-1 row-start-1 rounded-[inherit]"
          width={640}
          crossOrigin="anonymous"
          title="Click to get detection!"
          alt="Post landmark detection sample 2"
        />
        <canvas className="col-start-1 row-start-1 h-full w-full"></canvas>
      </button>
    </div>
  );
}
