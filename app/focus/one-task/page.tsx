"use client";

import { useState } from "react";

export default function OneTaskPage() {
  const [task, setTask] = useState("");
  const [started, setStarted] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {!started ? (
        <>
          <h1 className="text-2xl mb-4">One Task Mode</h1>

          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What is ONE thing you will do?"
            className="border p-2 mb-4"
          />

          <button
            onClick={() => setStarted(true)}
            className="bg-green-500 text-white p-2"
          >
            Start
          </button>
        </>
      ) : (
        <>
          <h1 className="text-4xl">{task}</h1>
          <p className="mt-4 text-gray-500">
            Focus only on this.
          </p>
        </>
      )}
    </div>
  );
}