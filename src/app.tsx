import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useId, useRef, useState } from "react";
import { createPostLandmarker } from "src/pose-landmarker";

export default function App() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker>();
  const [videoPermission, setVideoPermission] = useState(false);
  const runningMode = useRef<"IMAGE" | "VIDEO">("VIDEO");
  const enablePrediction = useRef(false);
  const videoId = useId();
  const canvasId = useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Trust me bro
  useEffect(() => {
    createPostLandmarker().then((res) => {
      setPoseLandmarker(res);
    });
    return () => {
      poseLandmarker?.close();
    };
  }, []);

  async function predictWebcam() {
    const video = document.getElementById(videoId);
    if (video === null || !(video instanceof HTMLVideoElement)) return;
    const canvas = document.getElementById(canvasId);
    if (canvas === null || !(canvas instanceof HTMLCanvasElement)) return;
    console.debug("clearing canvas...");
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    if (poseLandmarker === undefined) {
      console.warn("postLandmarker not initialized yet");
      return;
    }

    if (runningMode.current === "IMAGE") {
      console.debug("setting runningMode: video");
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
      runningMode.current = "VIDEO";
    }

    const drawingUtils = new DrawingUtils(ctx);
    let lastVideoTime = -1;

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is perfectly straightforward
    function predictVideo() {
      if (video === undefined || !(video instanceof HTMLVideoElement)) return;
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
              PoseLandmarker.POSE_CONNECTIONS
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
    <div className="items-center-safe flex flex-col gap-8 py-10">
      <div
        className={`rounded px-4 py-2 ${poseLandmarker ? "bg-green-800" : "bg-yellow-800"}`}
      >
        {poseLandmarker ? "Mediapipe Loaded" : "Loading Mediapipe"}
      </div>

      <button
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
        type="button"
      >
        {videoPermission ? "Close Camera" : "Enable Camera"}
      </button>
      <div className="justify-items-center-safe grid grid-cols-1 grid-rows-1 rounded px-4">
        <video
          autoPlay
          className="-scale-x-100 col-start-1 row-start-1 rounded-[inherit] outline"
          disablePictureInPicture
          disableRemotePlayback
          height={720}
          id={videoId}
          muted
          playsInline
          width={1280}
        />
        <canvas
          className="-scale-x-100 col-start-1 row-start-1 h-full w-full"
          id={canvasId}
        />
      </div>
    </div>
  );
}
