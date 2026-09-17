#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [demoPathArg, baselinePathArg] = process.argv.slice(2);
if (!demoPathArg || !baselinePathArg) {
  console.error("Usage: node tools/merge_demo_baselines.mjs <demo-json> <baseline-export-json>");
  process.exit(2);
}

const demoPath = path.resolve(demoPathArg);
const baselinePath = path.resolve(baselinePathArg);
const demo = JSON.parse(fs.readFileSync(demoPath, "utf8"));
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

if (demo.recordingId !== baseline.recording_id) {
  throw new Error("Recording identity mismatch");
}
if (
  demo.sourceStartSeconds !== baseline.source_start_seconds ||
  demo.durationSeconds !== baseline.duration_seconds
) {
  throw new Error("Excerpt timing mismatch");
}

for (const model of ["muscriptor_medium", "yu"]) {
  const events = baseline.tracks?.[model]?.all;
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error(`Missing ${model} event array`);
  }
  for (const [index, event] of events.entries()) {
    const valid =
      Number.isInteger(event.p) &&
      event.p >= 0 &&
      event.p <= 127 &&
      Number.isFinite(event.t) &&
      event.t >= 0 &&
      event.t < demo.durationSeconds &&
      Number.isFinite(event.d) &&
      event.d > 0 &&
      event.t + event.d <= demo.durationSeconds + 1e-6 &&
      Number.isInteger(event.v) &&
      event.v >= 1 &&
      event.v <= 127;
    if (!valid) throw new Error(`Invalid ${model} event at index ${index}`);
  }
  demo.tracks[model] = { all: events };
}

fs.writeFileSync(demoPath, `${JSON.stringify(demo)}\n`);
console.log(
  JSON.stringify({
    recordingId: demo.recordingId,
    durationSeconds: demo.durationSeconds,
    muscriptor_medium: demo.tracks.muscriptor_medium.all.length,
    yu: demo.tracks.yu.all.length,
  })
);
