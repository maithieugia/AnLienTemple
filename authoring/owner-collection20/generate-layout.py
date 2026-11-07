"""Regenerate the runtime plan from the reviewed placement data; do not restore old coordinates."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent;project=root.parents[1]
data=json.loads((root/'placements.json').read_text(encoding='utf-8'))
text="""/** Owner-supplied models; layout reviewed in authoring/owner-collection20/placements.json. */
export type OwnerPlacement={id:string;name:string;asset:string;x:number;z:number;height:number;base:number;yaw:number;group:'owner-hall'|'owner-court'|'owner-special';width:number;depth:number;slot?:string};
"""
text+='export const OWNER_COLLECTION:OwnerPlacement[]='+json.dumps(data['placements'],ensure_ascii=False,indent=2)+';\nexport const NEW_GATE_MAITREYA='+json.dumps(data['gate'],ensure_ascii=False,indent=2)+';\n'
(project/'src/game/world/OwnerCollectionPlan.ts').write_text(text,encoding='utf-8')
print('Generated reviewed layout:',len(data['placements']))
