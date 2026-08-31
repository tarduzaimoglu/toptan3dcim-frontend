/// <reference lib="webworker" />
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { computeMetricsFromGeometry } from "./stlMetrics";

type RequestMessage = { type: "parse"; url: string };
const IOS_MAX_VERTICES = 800_000;

function isIOS() {
  return /iPhone|iPad|iPod/i.test(self.navigator?.userAgent || "");
}

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
  if (event.data.type !== "parse") return;
  try {
    const geometry: THREE.BufferGeometry = await new Promise((resolve, reject) => {
      new STLLoader().load(event.data.url, resolve, undefined, reject);
    });
    const position = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (position?.count && isIOS() && position.count > IOS_MAX_VERTICES) {
      geometry.dispose();
      self.postMessage({ type: "err", code: "TOO_COMPLEX" });
      return;
    }

    const metrics = computeMetricsFromGeometry(geometry);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const height = bounds ? bounds.max.y - bounds.min.y : 120;
    const yOffset = bounds ? -bounds.min.y : 0;
    geometry.dispose();
    self.postMessage({ type: "ok", metrics, bounds: { height, yOffset } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    self.postMessage({ type: "err", code: message.includes("TOO_COMPLEX") ? "TOO_COMPLEX" : "STL_UNREADABLE" });
  }
};
