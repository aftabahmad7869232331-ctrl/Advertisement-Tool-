// scripts/check-wan21.js
// Script to check status of Wan2.1 Text-to-Video Engine dependencies, folder paths, and configuration.

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const status = {
  python: false,
  git: false,
  engineFolder: false,
  modelFolder: false,
  overallReady: false,
  details: {
    pythonVersion: "Not detected",
    gitVersion: "Not detected",
    enginePath: "./engines/Wan2.1",
    modelPath: "./models/Wan2.1-T2V-1.3B",
  }
};

// 1. Check Python
try {
  const pyOut = execSync("python3 --version || python --version", { stdio: "pipe" }).toString().trim();
  status.python = true;
  status.details.pythonVersion = pyOut;
} catch (e) {
  // ignore
}

// 2. Check Git
try {
  const gitOut = execSync("git --version", { stdio: "pipe" }).toString().trim();
  status.git = true;
  status.details.gitVersion = gitOut;
} catch (e) {
  // ignore
}

// 3. Check Engine Folder
const absoluteEnginePath = path.resolve(status.details.enginePath);
if (fs.existsSync(absoluteEnginePath)) {
  status.engineFolder = true;
}

// 4. Check Model Folder
const absoluteModelPath = path.resolve(status.details.modelPath);
if (fs.existsSync(absoluteModelPath)) {
  status.modelFolder = true;
}

// Determine overall readiness
status.overallReady = status.python && status.git && status.engineFolder && status.modelFolder;

process.stdout.write(JSON.stringify(status, null, 2));

