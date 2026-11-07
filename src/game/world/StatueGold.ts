import {PBRMaterial,Color3,type Scene}from '@babylonjs/core';
/** Polished pure-gold appearance; scene HDR supplies reflected light. */
export function create24kGold(scene:Scene){const m=new PBRMaterial('owner-triad-polished-24k-gold',scene);m.albedoColor=new Color3(1,.68,.14);m.metallic=.82;m.roughness=.34;m.environmentIntensity=1.65;m.directIntensity=1.15;m.emissiveColor=new Color3(.18,.105,.018);return m;}
