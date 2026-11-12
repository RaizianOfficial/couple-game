// Shared High-Performance GLTF/GLB Loader with Draco Decompression Support
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let dracoLoader = null;
let gltfLoader = null;

export function getGLTFLoader() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    
    dracoLoader = new DRACOLoader();
    // Resolve draco decoder files from public/draco/
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const decoderPath = baseUrl.endsWith('/') ? `${baseUrl}draco/` : `${baseUrl}/draco/`;
    dracoLoader.setDecoderPath(decoderPath);
    
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  return gltfLoader;
}

export function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    const loader = getGLTFLoader();
    loader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      (err) => {
        console.error(`[Loader] Failed to load GLTF from ${url}:`, err);
        reject(err);
      }
    );
  });
}
