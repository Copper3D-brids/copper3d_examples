import * as THREE from "three";
import { VolumeRenderShader1 } from "three/examples/jsm/shaders/VolumeShader";

/**
 * three's VolumeRenderShader1 exposes no opacity control. Clone it and splice in a
 * `u_opacity` uniform.
 *
 * Both edits are asserted: if a future three.js release rewrites those lines we fail
 * loudly at construction rather than shipping a shader that silently ignores opacity
 * (or worse, fails to compile).
 */

/** Matches the trailing `if (gl_FragColor.a < 0.05) discard;` in main(), tabs and all. */
const DISCARD_TEST = /if\s*\(\s*gl_FragColor\.a\s*<\s*0\.05\s*\)\s*discard;/;

const CLIM_DECL = "uniform vec2 u_clim;";

export interface VolumeShaderParts {
  uniforms: Record<string, THREE.IUniform>;
  vertexShader: string;
  fragmentShader: string;
}

export function createVolumeShaderWithOpacity(): VolumeShaderParts {
  const uniforms = THREE.UniformsUtils.clone(
    VolumeRenderShader1.uniforms
  ) as Record<string, THREE.IUniform>;
  uniforms.u_opacity = { value: 1.0 };

  const source = VolumeRenderShader1.fragmentShader;

  const declared = source.replace(
    CLIM_DECL,
    `${CLIM_DECL}\n                uniform float u_opacity;`
  );
  if (declared === source) {
    throw new Error(
      "volumeShader: could not declare u_opacity — three's VolumeShader changed"
    );
  }

  const fragmentShader = declared.replace(
    DISCARD_TEST,
    "gl_FragColor.a *= u_opacity;\n\t\t\t\t\t\tif (gl_FragColor.a < 0.01) discard;"
  );
  if (fragmentShader === declared) {
    throw new Error(
      "volumeShader: could not patch the discard test — three's VolumeShader changed"
    );
  }

  return { uniforms, vertexShader: VolumeRenderShader1.vertexShader, fragmentShader };
}
