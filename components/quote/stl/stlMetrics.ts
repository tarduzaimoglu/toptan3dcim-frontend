import * as THREE from "three";

const MAX_VERTICES = 2_000_000;
const MAX_TRIANGLES = 1_200_000;

export function computeMetricsFromGeometry(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
  if (!position) throw new Error("NO_POSITION");
  if (position.count > MAX_VERTICES) throw new Error("TOO_COMPLEX");

  const index = geometry.getIndex();
  const triangleCount = index ? index.count / 3 : position.count / 3;
  if (triangleCount > MAX_TRIANGLES) throw new Error("TOO_COMPLEX");

  let volume = 0;
  let area = 0;
  let horizontalArea = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const setVertex = (vertexIndex: number, output: THREE.Vector3) => output.set(
    position.getX(vertexIndex), position.getY(vertexIndex), position.getZ(vertexIndex),
  );
  const inspectTriangle = (i0: number, i1: number, i2: number) => {
    setVertex(i0, a); setVertex(i1, b); setVertex(i2, c);
    ab.subVectors(b, a); ac.subVectors(c, a); cross.crossVectors(ab, ac);
    const crossLength = cross.length();
    const triangleArea = crossLength * 0.5;
    area += triangleArea;
    volume += a.dot(cross) / 6;
    if (crossLength > 0) horizontalArea += triangleArea * (Math.abs(cross.y) / crossLength);
  };

  if (index) {
    for (let i = 0; i < index.count; i += 3) inspectTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  } else {
    for (let i = 0; i < position.count; i += 3) inspectTriangle(i, i + 1, i + 2);
  }

  return { volumeMM3: Math.abs(volume), saMM2: area, sahMM2: horizontalArea };
}
