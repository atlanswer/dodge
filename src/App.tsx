import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker>();
  const [runningMode, setRunningMode] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [videoPermission, setVideoPermission] = useState(false);
  const enablePrediction = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Trust me bro
  useEffect(() => {
    createPostLandmarker().then((res) => {
      setPoseLandmarker(res);
    });
    return () => {
      poseLandmarker?.close();
    };
  }, []);

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
      console.debug("setting running mode: image");
      await poseLandmarker.setOptions({ runningMode: "IMAGE" });
      setRunningMode("IMAGE");
    }

    const canvas = e.currentTarget.getElementsByTagName("canvas")[0];
    const img = e.currentTarget.getElementsByTagName("img")[0];
    if (canvas === undefined) {
      console.error("canvas not found");
      return;
    }
    if (img === undefined) {
      console.error("img not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      console.error("couldn't get canvas context");
      return;
    }
    console.debug("clearing canvas...");
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;

    console.time("detection");
    const res = poseLandmarker.detect(img);
    console.timeEnd("detection");

    const drawingUtils = new DrawingUtils(ctx);
    console.debug("drawing landmarks");
    for (const landmark of res.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        // biome-ignore lint/style/noNonNullAssertion: Trust me bro
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
  }

  async function predictWebcam() {
    const video = document.getElementsByTagName("video")[0];
    if (video === undefined) return;
    const canvas = document.getElementById("canvas");
    if (canvas === null || !(canvas instanceof HTMLCanvasElement)) return;
    console.debug("clearing canvas...");
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    if (poseLandmarker === undefined) {
      console.warn("postLandmarker not initialized yet");
      return;
    }

    if (runningMode === "IMAGE") {
      console.debug("setting runningMode: video");
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
      setRunningMode("VIDEO");
    }

    const drawingUtils = new DrawingUtils(ctx);
    let lastVideoTime = -1;

    function predictVideo() {
      if (video === undefined) return;
      if (poseLandmarker === undefined) return;
      if (canvas === null || !(canvas instanceof HTMLCanvasElement)) return;
      if (ctx === null) return;
      if (!enablePrediction.current) return;

      const startTimeMs = performance.now();

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (res) => {
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (const landmark of res.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) =>
                // biome-ignore lint/style/noNonNullAssertion: Trust me bro
                DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(
              landmark,
              PoseLandmarker.POSE_CONNECTIONS,
            );
          }

          ctx.restore();
        });
      }

      requestAnimationFrame(predictVideo);
    }

    requestAnimationFrame(predictVideo);
  }

  return (
    <div className="mx-auto flex flex-col place-items-center gap-8 py-10">
      <div
        className={`rounded px-4 py-2 ${poseLandmarker ? "bg-green-800" : "bg-yellow-800"}`}
      >
        {poseLandmarker ? "Mediapipe Loaded" : "Loading Mediapipe"}
      </div>

      <button
        type="button"
        className="col-start-1 row-start-1 rounded bg-sky-500 px-4 py-2 font-semibold outline hover:bg-sky-700 disabled:bg-gray-500"
        disabled={!poseLandmarker}
        onClick={
          videoPermission
            ? () => {
                const video = document.querySelector("video");
                if (video === null) return;
                const stream = video.srcObject;
                if (!(stream instanceof MediaStream)) return;
                stream.getTracks().forEach((track) => track.stop());
                video.removeEventListener("loadeddata", predictWebcam);
                setVideoPermission(false);
                enablePrediction.current = false;
              }
            : () => {
                const video = document.querySelector("video");
                if (video === null) return;
                navigator.mediaDevices
                  .getUserMedia({
                    video: {
                      aspectRatio: 1280 / 720,
                      facingMode: "user",
                      frameRate: 30,
                      width: 1280,
                      height: 720,
                    },
                    audio: false,
                  })
                  .then((stream) => {
                    setVideoPermission(true);
                    enablePrediction.current = true;
                    video.srcObject = stream;
                    video.addEventListener("loadeddata", predictWebcam);
                  });
              }
        }
      >
        {videoPermission ? "Close Camera" : "Enable Camera"}
      </button>
      <div className="grid grid-cols-1 grid-rows-1 place-items-center rounded px-4">
        <video
          className="-scale-x-100 col-start-1 row-start-1 rounded-[inherit] outline"
          width={1280}
          height={720}
          muted
          autoPlay
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          id="video"
        ></video>
        <canvas
          className="-scale-x-100 col-start-1 row-start-1 h-full w-full"
          id="canvas"
        ></canvas>
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
