// Shared High-Performance GLTF/GLB Loader with Draco Decompression Support
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let dracoLoader = null;
let gltfLoader = null;

export function getGLTFLoader() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    
    dracoLoader = new DRACOLoader();
    // Official globally cached Google Draco decoder (works across all browsers, mobile & production builds)
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    
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

