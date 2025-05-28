import { useState } from "react";
import reactDarkLogo from "/icons/react_dark.svg";
import reactLightLogo from "/icons/react_light.svg";
import viteLogo from "/icons/vite.svg";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="mx-auto max-w-1/2 text-center">
      <div className="flex place-content-center">
        <a href="https://react.dev" target="_blank" rel="noopener">
          <img
            src={reactLightLogo}
            role="image"
            alt="React Logo"
            className="h-24 dark:hidden"
          />
          <img
            src={reactDarkLogo}
            role="image"
            alt="React Logo"
            className="hidden h-24 dark:block"
          />
        </a>
        <a href="https://vite.dev" target="_blank" rel="noopener">
          <img
            src={viteLogo}
            role="image"
            alt="Vite Logo"
            className="h-24 animate-spin"
          />
        </a>
      </div>
      <h1>React + Vite</h1>
      <div className="card">
        <button
          onClick={() => setCount((count) => count + 1)}
          type="button"
          className="rounded p-2 outline"
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}
