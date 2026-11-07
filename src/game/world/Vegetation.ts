import {MaterialPluginBase,type Material,type UniformBuffer} from '@babylonjs/core';
export class WindPlugin extends MaterialPluginBase {
  constructor(material: Material, private strength: number, private localMode: boolean, private base: number) {
    super(material, 'Wind', 200, { WIND: false });
    this._enable(true);
  }
  override prepareDefines(defines: Record<string, unknown>) { defines.WIND = true; }
  override getClassName() { return 'WindPlugin'; }
  override getUniforms() {
    return {
      ubo: [{ name: 'windParams', size: 4, type: 'vec4' }],
      vertex: 'uniform vec4 windParams;',
    };
  }
  override bindForSubMesh(ubo: UniformBuffer) {
    ubo.updateFloat4('windParams', performance.now() / 1000, this.strength, this.localMode ? 1 : 0, this.base);
  }
  override getCustomCode(shaderType: string) {
    if (shaderType !== 'vertex') return null;
    return {
      CUSTOM_VERTEX_UPDATE_WORLDPOS: `
        #ifdef WIND
        {
          vec3 origin = finalWorld[3].xyz;
          float h = windParams.z > 0.5 ? max(positionUpdated.y + windParams.w, 0.0) : max(worldPos.y - origin.y - windParams.w, 0.0);
          h = min(h, 10.0);
          float ph = origin.x * 0.23 + origin.z * 0.19;
          float t = windParams.x;
          float gust = 0.6 + 0.4 * sin(t * 0.37 + origin.x * 0.02);
          float sway = windParams.y * h * h * gust;
          worldPos.x += sin(t * 1.9 + ph) * sway;
          worldPos.z += cos(t * 1.4 + ph * 1.3) * sway * 0.7;
        }
        #endif`,
    };
  }
}

