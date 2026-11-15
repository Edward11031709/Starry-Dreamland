let THREE;

const PALETTE = {
  night: 0x070918,
  navy: 0x111329,
  stone: 0x302a4a,
  lightStone: 0x6e638b,
  violet: 0x8d75c9,
  lilac: 0xd3c4ff,
  silver: 0xc7d9ef,
  gold: 0xf1d18e,
  blue: 0x64c9ed,
  pink: 0xe89bdc
};

let activeWorld = null;
const gameMeta = [
  { id: "moon", title: "月相共鳴", subtitle: "LUNAR RESONANCE", color: 0x75b9f1, icon: "☾" },
  { id: "cipher", title: "星域解碼", subtitle: "STELLAR CIPHER", color: 0xb59af0, icon: "⌘" },
  { id: "orbit", title: "軌道接線", subtitle: "ORBIT LINK", color: 0xe9c982, icon: "⌁" }
];

function makePatternTexture(kind, base, seam, accent) {
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
  const seed=(x,y)=>Math.abs(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
  if(kind==="stone"||kind==="paving"){
    const rowH=kind==="paving"?64:96,colW=kind==="paving"?96:128;
    for(let row=-1;row<10;row++){
      const offset=row%2?colW/2:0;
      for(let col=-1;col<7;col++){
        const x=col*colW+offset,y=row*rowH;
        const shade=Math.floor(seed(col,row)*18);
        ctx.fillStyle="rgba(255,255,255,"+(0.012+shade/2400)+")";
        ctx.fillRect(x+3,y+3,colW-7,rowH-7);
        ctx.strokeStyle=seam;ctx.lineWidth=kind==="paving"?3:2;
        ctx.strokeRect(x+2,y+2,colW-4,rowH-4);
        ctx.strokeStyle="rgba(255,255,255,0.10)";ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x+9,y+7);ctx.lineTo(x+colW-12,y+7);ctx.stroke();
        if(kind==="paving"){
          ctx.strokeStyle=accent;ctx.globalAlpha=0.10;ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(x+colW*0.2,y+rowH*0.52);ctx.lineTo(x+colW*0.8,y+rowH*0.52);ctx.stroke();ctx.globalAlpha=1;
        }
        for(let fleck=0;fleck<8;fleck++){
          const fx=x+10+seed(col+fleck,row+3)*(colW-20),fy=y+10+seed(row+fleck,col+4)*(rowH-20);
          ctx.fillStyle=accent;ctx.globalAlpha=0.06+seed(fleck,col)*0.08;ctx.fillRect(fx,fy,2,2);
        }
      }
    }
  }else if(kind==="roof"){
    const rowH=54,shingleW=92;
    for(let row=-1;row<12;row++)for(let col=-1;col<7;col++){
      const x=col*shingleW+(row%2?shingleW/2:0),y=row*rowH;
      const light=seed(row,col);
      ctx.fillStyle="rgba(255,255,255,"+(0.025+light*0.05)+")";
      ctx.beginPath();ctx.roundRect(x+3,y+3,shingleW-6,rowH-7,8);ctx.fill();
      ctx.strokeStyle=seam;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+3,y+3,shingleW-6,rowH-7,8);ctx.stroke();
      ctx.strokeStyle=accent;ctx.globalAlpha=0.16;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x+12,y+9);ctx.lineTo(x+shingleW-12,y+9);ctx.stroke();ctx.globalAlpha=1;
    }
  }else{
    for(let i=0;i<1400;i++){
      const x=seed(i,5)*512,y=seed(i,11)*512;
      ctx.fillStyle=accent;ctx.globalAlpha=0.025+seed(i,13)*0.06;ctx.fillRect(x,y,1+seed(i,17)*2,1+seed(i,19)*2);
    }
    ctx.globalAlpha=1;
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.anisotropy=8;
  return texture;
}
function applyPattern(material,kind,base,seam,accent,repeatX=3,repeatY=3){
  const texture=makePatternTexture(kind,base,seam,accent);
  texture.repeat.set(repeatX,repeatY);
  material.map=texture;material.bumpMap=texture;
  material.bumpScale=kind==="paving"?0.022:0.035;
  material.needsUpdate=true;return material;
}

function makeMaterial(color, roughness = 0.72, metalness = 0.12, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function addMesh(parent, geometry, material, position, scale, cast = true, receive = true) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(position[0], position[1], position[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

function makeWindow(parent, x, y, z, width, height, material) {
  const frame = addMesh(parent, new THREE.BoxGeometry(width * 1.55, height * 1.35, 0.1),
    makeMaterial(0x252a4a, 0.52, 0.45), [x, y, z + 0.045], null, true, true);
  const glass = addMesh(parent, new THREE.BoxGeometry(width, height, 0.12), material,
    [x, y, z + 0.11], null, false, false);
  return [frame, glass];
}

function addTower(parent,x,z,baseY,height,radius,materials,detail=true){
 const group=new THREE.Group();group.position.set(x,baseY,z);parent.add(group);
 addMesh(group,new THREE.CylinderGeometry(radius*1.34,radius*1.42,0.32,20),materials.darkStone,[0,0.16,0]);
 addMesh(group,new THREE.CylinderGeometry(radius*1.08,radius*1.18,0.14,20),materials.gold,[0,0.37,0]);
 addMesh(group,new THREE.CylinderGeometry(radius*0.84,radius,height,24,2),materials.wall,[0,height/2+0.42,0]);
 // Narrow silver ribs catch the moonlight and give each round tower a carved silhouette.
 for(let rib=0;rib<10;rib++){
  const angle=rib/10*Math.PI*2,rr=radius*0.86;
  const strip=addMesh(group,new THREE.BoxGeometry(0.055,height*0.78,0.065),materials.silverMetal,
   [Math.cos(angle)*rr,height*0.46+0.42,Math.sin(angle)*rr],null,false,false);
  strip.rotation.y=-angle;
 }
 addMesh(group,new THREE.CylinderGeometry(radius*0.98,radius*0.98,0.16,20),materials.trim,[0,height+0.42,0]);
 if(detail){
  const windowMat=new THREE.MeshStandardMaterial({color:0xffe5b0,emissive:0xffc66f,emissiveIntensity:1.7,roughness:0.26,metalness:0.12});
  [0.34,0.66].forEach(f=>{
   makeWindow(group,0,height*f,radius*0.91,radius*0.23,height*0.115,windowMat);
   addMesh(group,new THREE.BoxGeometry(radius*0.38,0.075,0.11),materials.gold,[0,height*f-height*0.085,radius*1.02]);
  });
  const balcony=addMesh(group,new THREE.TorusGeometry(radius*0.96,0.055,8,40),materials.gold,[0,height*0.78+0.42,0]);balcony.rotation.x=Math.PI/2;
 }
 const roofHeight=Math.max(0.55,Math.min(height*0.24,radius*0.86));
 addMesh(group,new THREE.CylinderGeometry(radius*1.32,radius*1.02,0.22,16),materials.trim,[0,height+0.53,0]);
 const roof=addMesh(group,new THREE.ConeGeometry(radius*1.22,roofHeight,14),materials.roof,[0,height+0.64+roofHeight/2,0]);roof.rotation.y=Math.PI/14;
 addMesh(group,new THREE.SphereGeometry(radius*0.15,14,10),materials.gold,[0,height+0.66+roofHeight,0]);
 addMesh(group,new THREE.CylinderGeometry(0.035,0.055,radius*0.55,8),materials.gold,[0,height+0.68+roofHeight+radius*0.23,0]);
 return group;
}
function addCrystal(parent, x, y, z, size, color) {
  const material = new THREE.MeshPhysicalMaterial({
    color, emissive: color, emissiveIntensity: 0.42, roughness: 0.2,
    metalness: 0.24, transmission: 0.08, thickness: 0.6, clearcoat: 0.7
  });
  const crystal = addMesh(parent, new THREE.OctahedronGeometry(size, 0), material,
    [x, y, z], [0.72, 1.8, 0.72]);
  crystal.rotation.z = 0.14;
  return crystal;
}

function createTree(parent,x,z,scale,materials){
 const tree=new THREE.Group();tree.position.set(x,0.62,z);tree.scale.setScalar(scale);parent.add(tree);
 const wood=materials.wood||makeMaterial(0x3b2e4c,0.84,0.12);
 const a=materials.foliageA||makeMaterial(0x30445f,0.94,0.02);
 const b=materials.foliageB||makeMaterial(0x485071,0.92,0.03);
 const cc=materials.foliageC||makeMaterial(0x655b83,0.9,0.04);
 addMesh(tree,new THREE.CylinderGeometry(0.44,0.5,0.16,20),materials.darkStone,[0,0.08,0]);
 const rootRing=addMesh(tree,new THREE.TorusGeometry(0.42,0.045,8,36),materials.gold,[0,0.17,0]);rootRing.rotation.x=Math.PI/2;
 addMesh(tree,new THREE.CylinderGeometry(0.09,0.18,1.72,14),wood,[0,0.88,0]);
 const tiers=[
  {y:0.58,r:0.82,h:0.98,mat:a},
  {y:1.02,r:0.66,h:0.9,mat:b},
  {y:1.46,r:0.48,h:0.78,mat:cc}
 ];
 tiers.forEach((tier,index)=>{
  const canopy=addMesh(tree,new THREE.IcosahedronGeometry(tier.r,1),tier.mat,[0,tier.y,0],[1.0,tier.h/tier.r,0.9]);
  canopy.rotation.y=index*0.37+0.18;
  const collar=addMesh(tree,new THREE.TorusGeometry(tier.r*0.74,0.026,7,48),materials.gold,[0,tier.y-tier.h*0.28,0]);
  collar.rotation.x=Math.PI/2;
  for(let k=0;k<6;k++){
   const angle=k/6*Math.PI*2+index*0.22,rr=tier.r*0.76;
   const leaf=addMesh(tree,new THREE.OctahedronGeometry(0.105+(k%2)*0.025,1),
    index===1?materials.crystal:(k%3===0?materials.gold:tier.mat),
    [Math.cos(angle)*rr,tier.y+Math.sin(k*1.7)*0.12,Math.sin(angle)*rr],
    [0.62,1.25,0.62],false,false);
   leaf.rotation.set(angle*0.3,angle,Math.PI/4);
  }
 });
 for(let k=0;k<8;k++){
  const angle=k/8*Math.PI*2;
  addMesh(tree,new THREE.SphereGeometry(0.055,10,8),materials.lampGlow,
   [Math.cos(angle)*0.54,0.58+Math.sin(angle)*0.08,Math.sin(angle)*0.54],null,false,false);
 }
 const crown=addMesh(tree,new THREE.OctahedronGeometry(0.19,1),materials.crystal,[0,2.0,0],[0.7,1.55,0.7],false,false);
 crown.rotation.y=Math.PI/4;
 const halo=addMesh(tree,new THREE.TorusGeometry(0.29,0.022,6,40),materials.gold,[0,1.92,0]);
 halo.rotation.x=Math.PI/2;halo.rotation.z=0.24;
 return tree;
}

function makeIsland(parent, x, y, z, radius, palette) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  const rock = addMesh(group, new THREE.DodecahedronGeometry(radius, 1), palette.rock,
    [0, -0.48, 0], [1.08, 0.52, 0.9]);
  rock.rotation.y = 0.3;
  addMesh(group, new THREE.CylinderGeometry(radius * 0.9, radius * 0.98, 0.34, 32),
    palette.top, [0, -0.05, 0]);
  addMesh(group, new THREE.CylinderGeometry(radius * 0.95, radius * 0.98, 0.1, 32),
    palette.trim, [0, 0.16, 0]);
  addMesh(group, new THREE.TorusGeometry(radius * 0.91, 0.055, 7, 48),
    palette.trim, [0, 0.2, 0]).rotation.x = Math.PI / 2;
  return group;
}

function makeLabelSprite(meta){
 const canvas=document.createElement("canvas");canvas.width=768;canvas.height=208;
 const ctx=canvas.getContext("2d");if(!ctx)return null;ctx.clearRect(0,0,canvas.width,canvas.height);
 const gradient=ctx.createLinearGradient(0,0,0,canvas.height);
 gradient.addColorStop(0,"rgba(25,18,52,0.98)");gradient.addColorStop(0.5,"rgba(15,26,55,0.97)");gradient.addColorStop(1,"rgba(8,16,39,0.98)");
 ctx.shadowColor="rgba(128,105,218,0.42)";ctx.shadowBlur=20;ctx.fillStyle=gradient;ctx.beginPath();ctx.roundRect(10,10,748,188,32);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle="rgba(233,201,130,0.95)";ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(12,12,744,184,30);ctx.stroke();
 ctx.strokeStyle="rgba(156,139,214,0.78)";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(23,23,722,162,24);ctx.stroke();
 ctx.fillStyle="#f3dca7";ctx.shadowColor="rgba(255,218,151,0.85)";ctx.shadowBlur=18;
 [[48,104],[720,104]].forEach(([x,y])=>{ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-7,-7,14,14);ctx.restore()});
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.fontKerning="normal";ctx.shadowBlur=18;ctx.fillStyle="#fff0c9";
 const titleFamily='"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
 let titleSize=54;do{ctx.font='700 '+titleSize+'px '+titleFamily;if(ctx.measureText(String(meta.title||"")).width<=690)break;titleSize-=2;}while(titleSize>30);
 ctx.fillText(String(meta.title||""),384,78,690);
 ctx.shadowBlur=0;ctx.fillStyle="#c9c1e7";ctx.font='500 24px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';ctx.letterSpacing="2px";ctx.fillText(String(meta.subtitle||""),384,145,700);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,sizeAttenuation:true});
 const sprite=new THREE.Sprite(material);sprite.scale.set(4.8,1.3,1);return sprite;
}


function buildPortal(scene,meta,x,z,materials){
 const group=new THREE.Group();group.position.set(x,0.48,z);group.userData.gameId=meta.id;scene.add(group);
 const glowMaterial=new THREE.MeshStandardMaterial({color:meta.color,emissive:meta.color,emissiveIntensity:1.55,roughness:0.2,metalness:0.45});
 addMesh(group,new THREE.CylinderGeometry(1.48,1.58,0.4,48),materials.darkStone,[0,0.18,0]);
 addMesh(group,new THREE.CylinderGeometry(1.38,1.42,0.12,48),materials.trim,[0,0.43,0]);
 addMesh(group,new THREE.TorusGeometry(1.36,0.075,10,64),materials.gold,[0,0.5,0]).rotation.x=Math.PI/2;
 const gate=new THREE.Group();gate.position.set(0,0.58,0.04);group.add(gate);
 [-1.02,1.02].forEach(x=>{
  addMesh(gate,new THREE.CylinderGeometry(0.15,0.2,2.55,16),materials.silverMetal,[x,1.28,0]);
  addMesh(gate,new THREE.CylinderGeometry(0.24,0.24,0.16,16),materials.gold,[x,2.55,0]);
  addMesh(gate,new THREE.SphereGeometry(0.14,12,10),glowMaterial,[x,2.69,0]);
 });
 const ring=addMesh(gate,new THREE.TorusGeometry(1.02,0.135,16,72),glowMaterial,[0,1.6,0]);
 const inner=addMesh(gate,new THREE.TorusGeometry(0.84,0.035,8,64),materials.silver,[0,1.6,-0.04]);
 const core=addMesh(gate,new THREE.CircleGeometry(0.89,56),new THREE.MeshBasicMaterial({color:meta.color,transparent:true,opacity:0.2,side:THREE.DoubleSide,depthWrite:false}),[0,1.6,-0.055],null,false,false);
 const crystal=addMesh(gate,new THREE.OctahedronGeometry(0.34,1),new THREE.MeshPhysicalMaterial({color:meta.color,emissive:meta.color,emissiveIntensity:1.15,roughness:0.16,metalness:0.18,transparent:true,opacity:0.98}),[0,1.6,0.14],[0.78,1.18,0.78]);
 const orbit=addMesh(gate,new THREE.TorusGeometry(0.55,0.027,8,56),glowMaterial,[0,1.6,0.12]);orbit.rotation.x=Math.PI/3;
 const aura=new THREE.PointLight(meta.color,10,8,2);aura.position.set(0,1.9,0.35);group.add(aura);
 const label=makeLabelSprite(meta);if(label){label.position.set(0,4.15,0.32);group.add(label)}
 group.userData.motion={ring,inner,core,crystal,orbit,aura,phase:Math.random()*Math.PI*2};group.traverse(obj=>{obj.userData.gameId=meta.id});return group;
}
function buildCastle(scene,materials){
 const castle=new THREE.Group();castle.position.set(0,0.68,-18.2);castle.name="StarDreamCastle";scene.add(castle);
 // Raised courtyard and layered keep foundations.
 addMesh(castle,new THREE.CylinderGeometry(5.05,5.35,0.46,72),materials.darkStone,[0,0.12,0]);
 const baseRing=addMesh(castle,new THREE.TorusGeometry(4.98,0.105,10,96),materials.gold,[0,0.38,0]);baseRing.rotation.x=Math.PI/2;
 addMesh(castle,new THREE.CylinderGeometry(4.65,4.72,0.12,72),materials.top,[0,0.42,0]);
 addMesh(castle,new THREE.BoxGeometry(6.55,3.65,3.9),materials.wall,[0,2.18,0]);
 addMesh(castle,new THREE.BoxGeometry(6.82,0.22,4.12),materials.trim,[0,4.12,0]);
 // Rear keep rises above the curtain wall and carries the tallest star spire.
 addMesh(castle,new THREE.BoxGeometry(3.75,4.5,3.22),materials.wall,[0,2.72,-0.78]);
 addMesh(castle,new THREE.BoxGeometry(3.95,0.22,3.44),materials.gold,[0,5.08,-0.78]);
 [-2.98,2.98].forEach(x=>[-1.52,1.44].forEach(z=>{
  addMesh(castle,new THREE.BoxGeometry(0.46,3.48,0.5),materials.darkStone,[x,2.18,z]);
  addMesh(castle,new THREE.BoxGeometry(0.62,0.18,0.66),materials.gold,[x,3.95,z]);
  addMesh(castle,new THREE.TorusGeometry(0.29,0.045,8,24),materials.trim,[x,3.98,z]);
 }));
 // Fine masonry pilasters and a continuous cornice break up the broad front walls.
 [-2.72,-1.84,1.84,2.72].forEach(x=>{
  addMesh(castle,new THREE.BoxGeometry(0.16,3.36,0.18),materials.silverMetal,[x,2.15,2.02]);
  addMesh(castle,new THREE.BoxGeometry(0.34,0.12,0.34),materials.gold,[x,0.48,2.02]);
  addMesh(castle,new THREE.BoxGeometry(0.3,0.1,0.28),materials.trim,[x,3.84,2.02]);
 });
 addMesh(castle,new THREE.BoxGeometry(6.9,0.11,0.16),materials.gold,[0,4.0,2.06],null,false,false);
 addMesh(castle,new THREE.BoxGeometry(4.0,0.12,0.14),materials.silverMetal,[0,5.18,0.92],null,false,false);
 // Recessed windows with luminous frames and slender mullions.
 const windowMat=new THREE.MeshStandardMaterial({color:0xffe6bc,emissive:0xffc978,emissiveIntensity:1.8,roughness:0.18,metalness:0.18});
 [-2.15,-0.72,0.72,2.15].forEach(x=>{
  [1.52,2.62].forEach(y=>{
   makeWindow(castle,x,y,1.99,0.34,y>2?0.82:0.48,windowMat);
   addMesh(castle,new THREE.BoxGeometry(0.045,y>2?0.78:0.45,0.055),materials.gold,[x,y,2.08],null,false,false);
   const arch=addMesh(castle,new THREE.TorusGeometry(0.23,0.038,7,26,Math.PI),materials.gold,[x,y+(y>2?0.39:0.23),2.03]);arch.rotation.z=Math.PI;
  });
 });
 // A stained-glass astral rose window above the entrance gives the castle a clear signature.
 const roseFrame=addMesh(castle,new THREE.TorusGeometry(0.56,0.075,10,64),materials.gold,[0,3.42,2.13]);
 const roseInner=addMesh(castle,new THREE.TorusGeometry(0.43,0.028,7,56),materials.trim,[0,3.42,2.18]);
 addMesh(castle,new THREE.CircleGeometry(0.42,48),new THREE.MeshPhysicalMaterial({
  color:0x8275c7,emissive:0x33295e,emissiveIntensity:0.38,metalness:0.26,roughness:0.22,
  transparent:true,opacity:0.92,side:THREE.DoubleSide
 }),[0,3.42,2.19],null,false,false);
 for(let ray=0;ray<8;ray++){
  const angle=ray/8*Math.PI*2;
  const spoke=addMesh(castle,new THREE.BoxGeometry(0.026,0.76,0.055),materials.gold,[0,3.42,2.225],null,false,false);
  spoke.rotation.z=angle;
  const gem=addMesh(castle,new THREE.OctahedronGeometry(0.09,1),ray%2?materials.crystal:materials.silverMetal,
   [Math.cos(angle)*0.3,3.42+Math.sin(angle)*0.3,2.25],[0.7,1.15,0.7],null,false,false);
  gem.rotation.z=angle;
 }
 addMesh(castle,new THREE.OctahedronGeometry(0.16,1),materials.crystal,[0,3.42,2.27],[0.7,1.3,0.7],null,false,false);
 // Ornate front portico: four columns, capitals and a luminous pointed arch.
 [-2.45,-0.82,0.82,2.45].forEach(x=>{
  addMesh(castle,new THREE.CylinderGeometry(0.105,0.15,2.55,14),materials.silverMetal,[x,1.62,2.0]);
  addMesh(castle,new THREE.CylinderGeometry(0.22,0.22,0.13,16),materials.gold,[x,2.91,2.0]);
  addMesh(castle,new THREE.CylinderGeometry(0.17,0.17,0.1,16),materials.trim,[x,0.4,2.0]);
 });
 addMesh(castle,new THREE.BoxGeometry(1.1,1.72,0.16),materials.darkStone,[0,1.49,2.02]);
 const doorArch=addMesh(castle,new THREE.TorusGeometry(0.6,0.105,12,48),materials.gold,[0,2.28,2.1]);doorArch.scale.set(1,1.25,1);
 const doorGlow=addMesh(castle,new THREE.CircleGeometry(0.48,48),new THREE.MeshBasicMaterial({color:0x8a75c6,transparent:true,opacity:0.32,side:THREE.DoubleSide,depthWrite:false}),[0,1.95,2.08],null,false,false);
 for(let i=0;i<5;i++){
  const width=2.7+i*0.22;
  addMesh(castle,new THREE.BoxGeometry(width,0.16,0.42),i%2?materials.trim:materials.darkStone,[0,0.86-i*0.075,2.35+i*0.39]);
  addMesh(castle,new THREE.BoxGeometry(width+0.08,0.035,0.46),materials.gold,[0,0.95-i*0.075,2.35+i*0.39],null,false,false);
 }
 // Five towers: the rear spire is taller to give the skyline a clear focal point.
 const towers=[[-3.32,-1.62,4.0,0.9],[3.32,-1.62,4.0,0.9],[-3.34,1.44,3.8,0.84],[3.34,1.44,3.8,0.84],[0,-2.32,7.65,1.02]];
 towers.forEach(t=>addTower(castle,t[0],t[1],0.2,t[2],t[3],materials,true));
 // Orbital rings and a star crystal crown enrich the main tower silhouette.
 const orbitA=addMesh(castle,new THREE.TorusGeometry(1.58,0.052,10,72),materials.gold,[0,7.58,-2.32]);orbitA.rotation.set(0.72,0.28,0.22);
 const orbitB=addMesh(castle,new THREE.TorusGeometry(1.16,0.032,8,64),materials.crystal,[0,8.34,-2.32]);orbitB.rotation.set(1.16,-0.5,0.12);
 const crown=addMesh(castle,new THREE.OctahedronGeometry(0.4,1),materials.crystal,[0,9.75,-2.32],[0.75,1.35,0.75]);crown.rotation.z=Math.PI/4;
 const crest=addMesh(castle,new THREE.TorusGeometry(0.52,0.055,8,48),materials.gold,[0,5.52,0.98]);crest.rotation.x=Math.PI/2;
 const star=addMesh(castle,new THREE.OctahedronGeometry(0.29,1),materials.crystal,[0,5.52,1.05],[0.9,1.35,0.9]);star.rotation.z=Math.PI/4;
 const light=new THREE.PointLight(0xb9a5ff,18,20,2);light.position.set(0,5.8,1.5);castle.add(light);
 const warm=new THREE.PointLight(0xffd58e,13,14,2);warm.position.set(0,3.2,3.4);castle.add(warm);
 // A low circular garden rail gives the keep a finished base without blocking the path.
 const courtyardRing=addMesh(castle,new THREE.TorusGeometry(4.34,0.045,8,100),materials.silver,[0,0.54,0]);courtyardRing.rotation.x=Math.PI/2;
 return castle;
}


function buildObservatory(scene, x, y, z, materials) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  scene.add(group);
  addMesh(group, new THREE.CylinderGeometry(1.2, 1.45, 0.45, 20),
    materials.trim, [0, 0.23, 0]);
  addTower(group, 0, 0, 0.35, 3.1, 0.72, materials, true);
  const dome = addMesh(group, new THREE.SphereGeometry(0.78, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.silverMetal, [0, 3.65, 0], [1.15, 0.8, 1.15]);
  dome.rotation.y = 0.2;
  addMesh(group, new THREE.TorusGeometry(0.78, 0.07, 8, 36),
    materials.gold, [0, 3.66, 0]).rotation.x = Math.PI / 2;
  const lens = addMesh(group, new THREE.CylinderGeometry(0.16, 0.16, 1.35, 16),
    materials.silverMetal, [0, 4.1, 0.14]);
  lens.rotation.x = Math.PI / 2.8;
  addCrystal(group, 1.2, 0.65, -0.5, 0.38, PALETTE.blue);
  const sign=makeLabelSprite({title:"星辰觀測站",subtitle:"STARGAZER OBSERVATORY"});
  if(sign){sign.position.set(0,5.4,0.1);sign.scale.set(4.0,1.08,1);group.add(sign)}
  return group;
}

function buildEntranceGate(scene,materials){
  const gate=new THREE.Group();gate.position.set(0,0.78,45.0);scene.add(gate);
  [-3.15,3.15].forEach((x,index)=>{
    addMesh(gate,new THREE.CylinderGeometry(0.33,0.43,4.0,20),materials.darkStone,[x,1.96,0]);
    addMesh(gate,new THREE.CylinderGeometry(0.53,0.56,0.22,20),materials.gold,[x,0.18,0]);
    addMesh(gate,new THREE.CylinderGeometry(0.42,0.42,0.13,20),materials.trim,[x,0.34,0]);
    addMesh(gate,new THREE.CylinderGeometry(0.47,0.47,0.16,20),materials.gold,[x,3.86,0]);
    addMesh(gate,new THREE.TorusGeometry(0.35,0.045,8,32),materials.trim,[x,3.78,0]);
    addMesh(gate,new THREE.OctahedronGeometry(0.23,1),materials.crystal,[x,4.18,0],[0.74,1.28,0.74],false,false);
    for(let k=0;k<3;k++){
      const stripe=addMesh(gate,new THREE.BoxGeometry(0.055,2.65,0.06),materials.gold,[x+(k-1)*0.13,2.0,0.39],null,false,false);
    }
  });
  // Two nested illuminated arches replace the heavy rectangular lintel.
  const outer=addMesh(gate,new THREE.TorusGeometry(3.12,0.2,14,88,Math.PI),materials.trim,[0,3.72,0]);
  const inner=addMesh(gate,new THREE.TorusGeometry(2.86,0.075,10,80,Math.PI),materials.gold,[0,3.72,-0.04]);
  const innerGlow=addMesh(gate,new THREE.TorusGeometry(2.64,0.028,8,72,Math.PI),materials.crystal,[0,3.72,-0.08]);
  const keystone=addMesh(gate,new THREE.OctahedronGeometry(0.48,1),materials.crystal,[0,6.9,0.05],[0.8,1.45,0.8],false,false);
  keystone.rotation.z=Math.PI/4;
  addMesh(gate,new THREE.TorusGeometry(0.7,0.045,8,48),materials.gold,[0,6.18,0.05]);
  const title=makeLabelSprite({title:"星夢夜遊園",subtitle:"STAR DREAMLAND · NIGHT PARK"});
  if(title){title.position.set(0,5.48,0.28);title.scale.set(5.45,1.42,1);gate.add(title)}
  [-2.25,2.25].forEach(x=>{
    const light=new THREE.PointLight(PALETTE.gold,7,5,2);light.position.set(x,3.2,0.55);gate.add(light);
  });
  const crownLight=new THREE.PointLight(PALETTE.violet,12,8,2);crownLight.position.set(0,5.8,-0.1);gate.add(crownLight);
  return gate;
}

function buildTicketBooth(scene,materials,x,z){
  const booth=new THREE.Group();booth.position.set(x,0.72,z);booth.userData.action="ticket-booth";scene.add(booth);
  addMesh(booth,new THREE.CylinderGeometry(2.25,2.4,0.24,40),materials.darkStone,[0,0.12,0]);
  addMesh(booth,new THREE.TorusGeometry(2.2,0.085,8,64),materials.gold,[0,0.28,0]).rotation.x=Math.PI/2;
  addMesh(booth,new THREE.BoxGeometry(3.25,1.78,2.2),materials.wall,[0,1.2,0]);
  addMesh(booth,new THREE.BoxGeometry(3.42,0.14,2.36),materials.trim,[0,2.12,0]);
  [-1.38,1.38].forEach(xp=>{
    addMesh(booth,new THREE.CylinderGeometry(0.16,0.2,2.56,16),materials.silverMetal,[xp,1.4,1.0]);
    addMesh(booth,new THREE.CylinderGeometry(0.25,0.25,0.13,16),materials.gold,[xp,2.63,1.0]);
    addMesh(booth,new THREE.SphereGeometry(0.16,14,10),materials.crystal,[xp,2.79,1.0],null,false,false);
  });
  const roof=addMesh(booth,new THREE.ConeGeometry(2.28,1.28,6),materials.roof,[0,2.85,0]);roof.rotation.y=Math.PI/6;
  addMesh(booth,new THREE.TorusGeometry(1.1,0.055,8,48),materials.gold,[0,3.45,0]);
  addMesh(booth,new THREE.OctahedronGeometry(0.32,1),materials.crystal,[0,3.62,0],null,false,false);
  addMesh(booth,new THREE.BoxGeometry(2.35,0.82,0.13),materials.darkStone,[0,1.24,1.13]);
  addMesh(booth,new THREE.BoxGeometry(2.12,0.53,0.1),materials.lampGlow,[0,1.35,1.21],null,false,false);
  addMesh(booth,new THREE.BoxGeometry(2.7,0.16,0.5),materials.gold,[0,0.92,1.32]);
  addMesh(booth,new THREE.BoxGeometry(0.72,0.26,0.08),materials.crystal,[0,1.62,1.28],null,false,false);
  const sign=makeLabelSprite({title:"星夢入園票亭",subtitle:"STARDREAM TICKETS · PARK GUIDE"});
  if(sign){sign.position.set(0,4.45,0.34);sign.scale.set(4.6,1.22,1);booth.add(sign)}
  [-1.85,-0.85,0.85,1.85].forEach((xp,i)=>{
    const post=addMesh(booth,new THREE.CylinderGeometry(0.055,0.07,0.76,10),materials.gold,[xp,0.38,1.8]);
    post.rotation.z=i%2?0.08:-0.08;
    addMesh(booth,new THREE.SphereGeometry(0.09,10,8),materials.crystal,[xp,0.8,1.8],null,false,false);
  });
  addMesh(booth,new THREE.BoxGeometry(2.25,0.09,0.08),materials.gold,[0,0.54,1.8]);
  return booth;
}

function buildCarousel(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.userData.action="ride-carousel";scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.45,2.62,0.34,64),materials.darkStone,[0,0.18,0]);
  addMesh(root,new THREE.TorusGeometry(2.48,0.13,12,80),materials.gold,[0,0.39,0]).rotation.x=Math.PI/2;
  addMesh(root,new THREE.CylinderGeometry(2.28,2.34,0.12,64),materials.paving,[0,0.42,0]);
  const ride=new THREE.Group();ride.position.y=0.42;root.add(ride);
  addMesh(ride,new THREE.CylinderGeometry(0.18,0.3,3.45,20),materials.silverMetal,[0,1.72,0]);
  addMesh(ride,new THREE.CylinderGeometry(0.42,0.6,0.22,32),materials.gold,[0,3.36,0]);
  addMesh(ride,new THREE.CylinderGeometry(2.42,0.86,0.36,48),materials.roof,[0,3.18,0]);
  addMesh(ride,new THREE.CylinderGeometry(2.45,2.45,0.12,48),materials.gold,[0,3.4,0]);
  addMesh(ride,new THREE.TorusGeometry(2.28,0.055,8,72),materials.trim,[0,3.48,0]);
  const scallop=addMesh(ride,new THREE.TorusGeometry(2.42,0.035,7,96),materials.gold,[0,3.43,0]);scallop.rotation.x=Math.PI/2;
  for(let panel=0;panel<12;panel++){
    const a=panel/12*Math.PI*2;
    const ornament=addMesh(ride,new THREE.OctahedronGeometry(0.09,0),panel%2?materials.gold:materials.crystal,
      [Math.cos(a)*2.34,3.5,Math.sin(a)*2.34],[0.72,0.38,1.7],null,false,false);
    ornament.rotation.y=a;
    const pendant=addMesh(ride,new THREE.ConeGeometry(0.07,0.24,6),materials.gold,
      [Math.cos(a)*2.15,3.22,Math.sin(a)*2.15]);pendant.rotation.z=Math.cos(a)*0.35;
  }
  const canopy=addMesh(ride,new THREE.ConeGeometry(1.16,0.92,12),materials.trim,[0,3.98,0]);canopy.rotation.y=Math.PI/12;
  for(let panel=0;panel<12;panel++){
    const a=panel/12*Math.PI*2;
    const seam=addMesh(ride,new THREE.BoxGeometry(0.035,0.38,1.2),materials.gold,
      [Math.cos(a)*0.72,3.19,Math.sin(a)*0.72],null,false,false);seam.rotation.y=a;
  }
  addMesh(ride,new THREE.SphereGeometry(0.22,16,12),materials.crystal,[0,4.5,0],null,false,false);
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,xp=Math.cos(a)*2.13,zp=Math.sin(a)*2.13;
    addMesh(ride,new THREE.CylinderGeometry(0.045,0.06,2.48,10),materials.silverMetal,[xp,2.08,zp]);
    addMesh(ride,new THREE.SphereGeometry(0.095,12,10),materials.lampGlow,[xp,3.28,zp],null,false,false);
    addMesh(ride,new THREE.SphereGeometry(0.07,10,8),materials.gold,[xp,0.52,zp],null,false,false);
  }
  const animalColors=[0xb8a1df,0xe6c98e,0x86b6d8,0xd69acb,0xa9c6ad,0xe7a98e];
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,xp=Math.cos(a)*1.48,zp=Math.sin(a)*1.48;
    const horse=new THREE.Group();horse.position.set(xp,0.62,zp);horse.rotation.y=-a;ride.add(horse);
    const coat=makeMaterial(animalColors[i%animalColors.length],0.28,0.32,{clearcoat:0.72,clearcoatRoughness:0.18});
    const mane=makeMaterial(i%2?0x493a70:0x2b4265,0.34,0.32);
    addMesh(horse,new THREE.SphereGeometry(0.38,20,16),coat,[0,0.46,0],[1.5,0.76,0.74]);
    addMesh(horse,new THREE.SphereGeometry(0.19,16,12),coat,[0.42,0.73,0],[1.12,1.45,0.88]);
    addMesh(horse,new THREE.SphereGeometry(0.18,16,12),coat,[0.7,1.06,0.02],[1.2,0.88,0.8]);
    addMesh(horse,new THREE.SphereGeometry(0.1,12,10),materials.gold,[0.83,1.01,0.16],[0.8,0.65,0.65]);
    addMesh(horse,new THREE.ConeGeometry(0.075,0.23,8),mane,[0.58,1.29,-0.09],[0.8,1,0.8]);
    addMesh(horse,new THREE.ConeGeometry(0.075,0.23,8),mane,[0.58,1.29,0.12],[0.8,1,0.8]);
    addMesh(horse,new THREE.SphereGeometry(0.12,12,10),mane,[0.36,1.03,-0.13],[0.8,1.5,0.85]);
    addMesh(horse,new THREE.SphereGeometry(0.13,12,10),mane,[-0.45,0.7,0],[0.65,1.2,0.7]);
    addMesh(horse,new THREE.BoxGeometry(0.58,0.12,0.48),materials.gold,[0.02,0.88,0]);
    addMesh(horse,new THREE.BoxGeometry(0.48,0.08,0.4),materials.crystal,[0.02,0.97,0],null,false,false);
    for(let leg=0;leg<4;leg++){
      const lx=leg<2?0.27:-0.25,lz=leg%2?0.23:-0.23;
      addMesh(horse,new THREE.CylinderGeometry(0.055,0.07,0.56,10),coat,[lx,0.2,lz]);
      addMesh(horse,new THREE.CylinderGeometry(0.07,0.09,0.12,10),materials.darkStone,[lx,0.02,lz]);
    }
    addMesh(horse,new THREE.TorusGeometry(0.26,0.035,7,24),materials.gold,[0,0.78,0]);
    addMesh(horse,new THREE.TorusGeometry(0.19,0.025,6,24),materials.gold,[0.48,0.76,0]).rotation.y=Math.PI/2;
    addMesh(horse,new THREE.OctahedronGeometry(0.075,1),materials.crystal,[0.46,0.82,0.18],[0.7,1.15,0.7],null,false,false);
    addMesh(horse,new THREE.TorusGeometry(0.12,0.025,6,24),materials.trim,[0.86,1.05,0.02]);
  }
  const rideSeat=new THREE.Group();rideSeat.position.set(1.48,1.34,0);rideSeat.rotation.y=-Math.PI/2;ride.add(rideSeat);
  const sign=makeLabelSprite({title:"星光旋轉木馬",subtitle:"STARLIGHT CAROUSEL · RIDE"});
  if(sign){sign.position.set(0,5.12,0);sign.scale.set(4.4,1.16,1);root.add(sign)}
  return {id:"carousel",name:"星光旋轉木馬",action:"ride-carousel",root,object:ride,rideSeat,axis:"y",speed:0.24,interactionRadius:4.75,dismountRadius:4.9};
}

function buildFerrisWheel(scene,materials,x,y,z){
  const root=new THREE.Group();root.position.set(x,y,z);root.userData.action="ride-ferris";scene.add(root);
  [-0.82,0.82].forEach((sx,i)=>{
    addMesh(root,new THREE.CylinderGeometry(0.34,0.4,0.26,12),materials.darkStone,[sx,0.16,0]);
    addMesh(root,new THREE.TorusGeometry(0.31,0.045,8,28),materials.gold,[sx,0.31,0]).rotation.x=Math.PI/2;
    const leg=addMesh(root,new THREE.BoxGeometry(0.23,3.5,0.28),materials.silverMetal,[sx,1.6,0]);leg.rotation.z=i===0?-0.26:0.26;
    const inlay=addMesh(root,new THREE.BoxGeometry(0.045,3.02,0.045),materials.gold,[sx+(i===0?0.12:-0.12),1.58,0.15]);inlay.rotation.z=i===0?-0.26:0.26;
    addMesh(root,new THREE.BoxGeometry(0.62,0.18,0.72),materials.gold,[sx,0.12,0]);
  });
  const wheel=new THREE.Group();wheel.position.set(0,3.45,0.18);root.add(wheel);
  addMesh(wheel,new THREE.TorusGeometry(2.62,0.085,12,80),materials.gold,[0,0,0]);
  addMesh(wheel,new THREE.TorusGeometry(2.28,0.045,8,72),materials.silver,[0,0,0]);
  addMesh(wheel,new THREE.TorusGeometry(2.8,0.028,7,88),materials.crystal,[0,0,0]);
  let rideSeat=null;const gondolas=[];
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;
    const spoke=addMesh(wheel,new THREE.BoxGeometry(0.075,5.18,0.09),materials.silverMetal,[0,0,0]);spoke.rotation.z=a;
    const pin=addMesh(wheel,new THREE.BoxGeometry(0.025,4.9,0.035),materials.gold,[0,0,0]);pin.rotation.z=a;
    const cx=Math.cos(a)*2.62,cy=Math.sin(a)*2.62;
    const gondola=new THREE.Group();gondola.position.set(cx,cy,0.18);wheel.add(gondola);gondolas.push(gondola);
    const gondolaMat=makeMaterial([0x6f8fc5,0xb18bcf,0xd7ad70,0x81a9a0,0xc27ea1][i%5],0.42,0.28);
    addMesh(gondola,new THREE.BoxGeometry(0.52,0.55,0.46),gondolaMat,[0,-0.08,0]);
    addMesh(gondola,new THREE.BoxGeometry(0.58,0.08,0.52),materials.gold,[0,0.22,0]);
    addMesh(gondola,new THREE.BoxGeometry(0.06,0.33,0.48),materials.trim,[-0.28,-0.05,0]);
    addMesh(gondola,new THREE.BoxGeometry(0.06,0.33,0.48),materials.trim,[0.28,-0.05,0]);
    const canopy=addMesh(gondola,new THREE.ConeGeometry(0.39,0.28,8),materials.trim,[0,0.44,0]);canopy.rotation.y=Math.PI/8;
    addMesh(gondola,new THREE.OctahedronGeometry(0.085,0),materials.crystal,[0,0.61,0],[0.8,1.2,0.8],null,false,false);
    addMesh(gondola,new THREE.SphereGeometry(0.075,10,8),materials.crystal,[0,-0.36,0.24]);
    const anchor=new THREE.Group();anchor.position.set(0,-0.1,0.32);gondola.add(anchor);
    if(i===0)rideSeat=anchor;
  }
  const hub=addMesh(wheel,new THREE.CylinderGeometry(0.42,0.42,0.52,24),materials.gold,[0,0,0]);hub.rotation.x=Math.PI/2;
  addMesh(wheel,new THREE.TorusGeometry(0.49,0.055,8,48),materials.trim,[0,0,0]).rotation.x=Math.PI/2;
  const hubGem=addMesh(wheel,new THREE.OctahedronGeometry(0.28,1),materials.crystal,[0,0,0.32],[0.8,1.15,0.8],null,false,false);hubGem.rotation.z=Math.PI/4;
  const sign=makeLabelSprite({title:"星河摩天輪",subtitle:"GALAXY FERRIS WHEEL · RIDE"});
  if(sign){sign.position.set(0,6.6,0.22);sign.scale.set(4.1,1.1,1);root.add(sign)}
  return {id:"ferris",name:"星河摩天輪",action:"ride-ferris",root,object:wheel,rideSeat,gondolas,axis:"z",speed:-0.105,interactionRadius:4.78,dismountRadius:5.5};
}

function buildRollerCoaster(scene,materials){
  const root=new THREE.Group();root.position.set(-24.5,0.72,-19.0);root.userData.action="ride-coaster";scene.add(root);
  const points=[[-2.8,0.65,1.8],[-2.3,1.7,0.8],[-1.55,3.7,0.2],[-0.45,4.0,0.1],[0.65,2.0,0.3],[1.55,0.9,1.0],[2.55,2.0,1.8],[3.05,2.55,2.2]];
  const pathPoints=points.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
  const curve=new THREE.CatmullRomCurve3(pathPoints,false,"centripetal");
  [-0.24,0.24].forEach(offset=>{
    const railPoints=points.map(p=>new THREE.Vector3(p[0],p[1],p[2]+offset));
    const railCurve=new THREE.CatmullRomCurve3(railPoints,false,"centripetal");
    addMesh(root,new THREE.TubeGeometry(railCurve,96,0.075,8,false),materials.gold,null,null,true,false);
  });
  points.forEach((p,i)=>{
    if(i===0||i===2||i===4||i===6){
      const height=Math.max(0.55,p[1]);
      addMesh(root,new THREE.CylinderGeometry(0.065,0.09,height,10),materials.darkStone,[p[0],height/2,p[2]],null,true,false);
      addMesh(root,new THREE.SphereGeometry(0.11,10,8),materials.gold,[p[0],height,p[2]]);
    }
  });
  addMesh(root,new THREE.BoxGeometry(1.25,0.48,0.62),makeMaterial(0x9d6fc1,0.34,0.44),[-1.75,3.96,0.2]);
  addMesh(root,new THREE.BoxGeometry(1.0,0.12,0.72),materials.gold,[-1.75,4.25,0.2]);
  for(let i=0;i<3;i++)addMesh(root,new THREE.SphereGeometry(0.13,12,10),materials.silver,[-2.1+i*0.34,4.42,0.2],[0.75,0.75,0.75]);
  const cart=new THREE.Group();root.add(cart);
  addMesh(cart,new THREE.BoxGeometry(0.9,0.32,0.82),makeMaterial(0x6c5a91,0.28,0.56,{clearcoat:0.88}),[0,0.18,0]);
  addMesh(cart,new THREE.BoxGeometry(0.82,0.09,0.76),materials.gold,[0,0.38,0]);
  [-0.26,0.26].forEach(x=>{
    addMesh(cart,new THREE.BoxGeometry(0.08,0.46,0.09),materials.silverMetal,[x,0.58,-0.28]);
    addMesh(cart,new THREE.BoxGeometry(0.08,0.46,0.09),materials.silverMetal,[x,0.58,0.28]);
  });
  addMesh(cart,new THREE.BoxGeometry(0.55,0.06,0.08),materials.gold,[0,0.78,0]);
  const rideSeat=new THREE.Group();rideSeat.position.set(0,0.45,0.04);cart.add(rideSeat);
  const sign=makeLabelSprite({title:"星際雲霄飛車",subtitle:"COSMIC COASTER · RIDE"});
  if(sign){sign.position.set(0,4.9,2.05);sign.scale.set(4.3,1.05,1);root.add(sign)}
  return {id:"coaster",name:"星際雲霄飛車",action:"ride-coaster",root,object:cart,rideSeat,curve,axis:"track",progress:0,direction:1,speed:0.105,interactionRadius:5.72,dismountRadius:6.2};
}

function buildTeacupRide(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.userData.action="ride-teacups";scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.65,2.82,0.34,48),materials.darkStone,[0,0.18,0]);
  addMesh(root,new THREE.TorusGeometry(2.7,0.11,10,64),materials.gold,[0,0.38,0]).rotation.x=Math.PI/2;
  const ride=new THREE.Group();ride.position.y=0.42;root.add(ride);
  addMesh(ride,new THREE.CylinderGeometry(0.25,0.32,2.4,16),materials.silverMetal,[0,1.2,0]);
  addMesh(ride,new THREE.CylinderGeometry(1.45,0.48,0.32,32),materials.roof,[0,2.42,0]);
  addMesh(ride,new THREE.ConeGeometry(0.68,0.62,12),materials.gold,[0,2.9,0]);
  const colors=[0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9,0xb59be5,0xe49b82];
  let rideSeat=null;
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,cup=new THREE.Group();
    cup.position.set(Math.cos(a)*1.72,0.45,Math.sin(a)*1.72);ride.add(cup);
    const mat=makeMaterial(colors[i],0.34,0.28);
    addMesh(cup,new THREE.CylinderGeometry(0.32,0.48,0.58,20),mat,[0,0.24,0]);
    addMesh(cup,new THREE.TorusGeometry(0.39,0.055,8,28),materials.gold,[0,0.53,0]);
    addMesh(cup,new THREE.TorusGeometry(0.2,0.045,8,24),materials.trim,[0.2,0.28,0]);
    addMesh(cup,new THREE.TorusGeometry(0.49,0.028,6,32),materials.gold,[0,0.03,0]).rotation.x=Math.PI/2;
    addMesh(cup,new THREE.SphereGeometry(0.14,12,10),materials.lampGlow,[0,0.62,0],null,false,false);
    addMesh(cup,new THREE.OctahedronGeometry(0.085,1),materials.crystal,[0,0.78,0.18],[0.72,1.2,0.72],null,false,false);
    if(i===0){rideSeat=new THREE.Group();rideSeat.position.set(0,0.59,0);cup.add(rideSeat)}
  }
  const sign=makeLabelSprite({title:"星月茶杯",subtitle:"MOONLIGHT TEA CUPS · RIDE"});
  if(sign){sign.position.set(0,4.15,0);sign.scale.set(3.5,0.92,1);root.add(sign)}
  return {id:"teacups",name:"星月茶杯",action:"ride-teacups",root,object:ride,rideSeat,axis:"y",speed:0.34,interactionRadius:4.2,dismountRadius:5.0};
}

function buildDropTower(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.userData.action="ride-drop";scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.2,2.45,0.38,40),materials.darkStone,[0,0.2,0]);
  addMesh(root,new THREE.TorusGeometry(2.28,0.1,8,56),materials.gold,[0,0.42,0]).rotation.x=Math.PI/2;
  addMesh(root,new THREE.CylinderGeometry(0.34,0.52,7.1,16),materials.silverMetal,[0,3.95,0]);
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2,xp=Math.cos(a)*1.08,zp=Math.sin(a)*1.08;
    const leg=addMesh(root,new THREE.CylinderGeometry(0.11,0.16,6.8,10),materials.darkStone,[xp,3.6,zp]);
    leg.rotation.z=-Math.cos(a)*0.14;leg.rotation.x=Math.sin(a)*0.14;
    addMesh(root,new THREE.SphereGeometry(0.16,12,10),materials.lampGlow,[xp,7.0,zp],null,false,false);
  }
  [1.0,3.8,6.55].forEach((yy,index)=>{
    const band=addMesh(root,new THREE.TorusGeometry(index===1?0.72:0.56,0.045,8,48),index===1?materials.gold:materials.trim,[0,yy,0]);
    band.rotation.x=Math.PI/2;
  });
  const crown=addMesh(root,new THREE.CylinderGeometry(0.72,0.88,0.2,12),materials.gold,[0,7.48,0]);
  addMesh(root,new THREE.OctahedronGeometry(0.32,1),materials.crystal,[0,7.82,0],[0.76,1.3,0.76],null,false,false);
  const gondola=new THREE.Group();root.add(gondola);gondola.position.y=1.7;
  addMesh(gondola,new THREE.TorusGeometry(1.05,0.16,10,48),materials.gold,[0,0,0]);
  addMesh(gondola,new THREE.TorusGeometry(0.9,0.045,8,48),materials.trim,[0,0.1,0]);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    addMesh(gondola,new THREE.BoxGeometry(0.42,0.48,0.52),
      makeMaterial([0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9][i%4],0.38,0.22),
      [Math.cos(a)*0.95,0,Math.sin(a)*0.95]);
  }
  const rideSeat=new THREE.Group();rideSeat.position.set(0,0.24,0);gondola.add(rideSeat);
  const sign=makeLabelSprite({title:"星際自由落體",subtitle:"GALAXY DROP · RIDE"});
  if(sign){sign.position.set(0,8.8,0);sign.scale.set(3.7,0.98,1);root.add(sign)}
  return {id:"drop",name:"星際自由落體",action:"ride-drop",root,object:gondola,rideSeat,axis:"lift",baseY:1.4,range:3.9,speed:0.82,phase:Math.random()*Math.PI*2,interactionRadius:4.0,dismountRadius:5.0};
}



function buildShootingGallery(scene,materials,x,z){
  const hall=new THREE.Group();hall.position.set(x,0.78,z);hall.userData.gameId="shooting-range";scene.add(hall);
  addMesh(hall,new THREE.CylinderGeometry(4.0,4.2,0.24,48),materials.darkStone,[0,0.12,0]);
  addMesh(hall,new THREE.TorusGeometry(3.92,0.1,8,72),materials.gold,[0,0.28,0]).rotation.x=Math.PI/2;
  addMesh(hall,new THREE.BoxGeometry(7.0,3.2,1.0),materials.wall,[0,2.0,-1.1]);
  addMesh(hall,new THREE.BoxGeometry(7.25,0.18,1.2),materials.trim,[0,3.65,-1.1]);
  [-3.25,3.25].forEach(xp=>{
    addMesh(hall,new THREE.CylinderGeometry(0.18,0.22,3.75,16),materials.silverMetal,[xp,1.9,0.2]);
    addMesh(hall,new THREE.CylinderGeometry(0.26,0.26,0.14,16),materials.gold,[xp,3.78,0.2]);
    addMesh(hall,new THREE.SphereGeometry(0.14,12,10),materials.crystal,[xp,3.98,0.2],null,false,false);
  });
  const canopy=addMesh(hall,new THREE.ConeGeometry(4.05,1.1,6),materials.roof,[0,4.0,-0.75]);canopy.rotation.y=Math.PI/6;
  addMesh(hall,new THREE.BoxGeometry(5.7,0.22,2.2),materials.darkStone,[0,0.82,0.65]);
  addMesh(hall,new THREE.BoxGeometry(5.3,0.16,0.42),materials.gold,[0,1.15,0.7]);
  const targetColors=[0x73d6ed,0xf0c47a,0xc19bff];
  for(let i=0;i<3;i++){
    const xp=-2.15+i*2.15;
    addMesh(hall,new THREE.CylinderGeometry(0.55,0.6,0.16,40),materials.silverMetal,[xp,2.25,-0.48]).rotation.x=Math.PI/2;
    addMesh(hall,new THREE.CylinderGeometry(0.43,0.43,0.18,40),makeMaterial(targetColors[i],0.24,0.36,{emissive:targetColors[i],emissiveIntensity:0.62}),[xp,2.25,-0.34]).rotation.x=Math.PI/2;
    addMesh(hall,new THREE.CylinderGeometry(0.13,0.13,0.2,24),materials.gold,[xp,2.25,-0.18]).rotation.x=Math.PI/2;
    addMesh(hall,new THREE.SphereGeometry(0.1,12,10),materials.lampGlow,[xp,3.0,-0.5],null,false,false);
  }
  const sign=makeLabelSprite({title:"霓虹神射手",subtitle:"NEON SHOOTING GALLERY · PLAY"});
  if(sign){sign.position.set(0,5.15,0.15);sign.scale.set(4.8,1.28,1);hall.add(sign)}
  addMesh(hall,new THREE.TorusGeometry(0.2,0.035,8,28),materials.gold,[0,1.55,0.78]);
  return hall;
}

function buildMirrorHouse(scene,materials,x,z){
  const hall=new THREE.Group();hall.position.set(x,0.78,z);hall.userData.gameId="mirror-house";scene.add(hall);
  addMesh(hall,new THREE.CylinderGeometry(4.0,4.25,0.28,48),materials.darkStone,[0,0.14,0]);
  addMesh(hall,new THREE.TorusGeometry(3.92,0.1,8,72),materials.gold,[0,0.3,0]).rotation.x=Math.PI/2;
  addMesh(hall,new THREE.BoxGeometry(6.2,3.7,0.72),materials.roof,[0,2.08,-1.15]);
  addMesh(hall,new THREE.BoxGeometry(6.45,0.2,0.92),materials.gold,[0,4.02,-1.15]);
  [-2.85,2.85].forEach(xp=>{
    addMesh(hall,new THREE.CylinderGeometry(0.2,0.26,3.9,16),materials.silverMetal,[xp,1.98,0.1]);
    addMesh(hall,new THREE.TorusGeometry(0.24,0.05,8,24),materials.gold,[xp,3.72,0.1]);
  });
  const arch=addMesh(hall,new THREE.TorusGeometry(1.25,0.19,16,64),materials.crystal,[0,2.08,0.1]);arch.scale.set(1,1.35,1);
  addMesh(hall,new THREE.CircleGeometry(1.12,48),new THREE.MeshPhysicalMaterial({
    color:0x7b7be1,emissive:0x3f348f,emissiveIntensity:0.55,metalness:0.35,roughness:0.12,
    transparent:true,opacity:0.58,side:THREE.DoubleSide,clearcoat:1
  }),[0,2.08,0.16],null,false,false);
  for(let i=0;i<5;i++){
    const shard=addMesh(hall,new THREE.BoxGeometry(0.12,2.3,0.14),materials.silverMetal,[-2.0+i,1.92,-0.68]);
    shard.rotation.z=(i-2)*0.11;
  }
  const sign=makeLabelSprite({title:"幻影鏡屋",subtitle:"MIRROR MAZE · MEMORY TRIAL"});
  if(sign){sign.position.set(0,5.05,0.2);sign.scale.set(4.4,1.18,1);hall.add(sign)}
  return hall;
}

function buildEnvironment(scene) {
  const materials = {
    rock: makeMaterial(0x211e39, 0.92, 0.12),
    rockLight: makeMaterial(0x39345d, 0.84, 0.18),
    wall: makeMaterial(0x494163, 0.58, 0.28),
    roof: makeMaterial(0x262341, 0.32, 0.62),
    trim: makeMaterial(0xb7a4df, 0.24, 0.74),
    gold: makeMaterial(PALETTE.gold, 0.2, 0.82),
    silver: makeMaterial(PALETTE.silver, 0.22, 0.76),
    silverMetal: new THREE.MeshPhysicalMaterial({color:0xc2c8dc,roughness:0.24,metalness:0.78,clearcoat:0.65}),
    darkStone: makeMaterial(0x17172e, 0.72, 0.42),
    top: makeMaterial(0x292747, 0.72, 0.22),
    wood: makeMaterial(0x2b2038, 0.8, 0.12),
    foliageA: makeMaterial(0x344b67, 0.95, 0.02), foliageB: makeMaterial(0x465578, 0.93, 0.03),
    foliageC: makeMaterial(0x675b88, 0.92, 0.04),
    crystal: new THREE.MeshPhysicalMaterial({color:PALETTE.lilac,emissive:0x8e68e8,emissiveIntensity:0.62,roughness:0.12,metalness:0.32,clearcoat:1,clearcoatRoughness:0.08}),
    water: new THREE.MeshPhysicalMaterial({color:0x648de0,emissive:0x171f68,emissiveIntensity:0.45,roughness:0.12,metalness:0.38,transparent:true,opacity:0.72}),
    road: makeMaterial(0x292d50, 0.94, 0.08), roadEdge: makeMaterial(0xb5a0c9, 0.48, 0.48),
    paving: makeMaterial(0x393451, 0.78, 0.22),
    lampGlow: new THREE.MeshStandardMaterial({color:0xffedc2,emissive:0xf1bb72,emissiveIntensity:2.6,roughness:0.18,metalness:0.18}),
  };
  applyPattern(materials.wall,"stone","#655b83","rgba(15,13,36,0.42)","#e2d7ff",2.2,2.2);
  applyPattern(materials.roof,"roof","#393253","rgba(9,8,27,0.48)","#e5c58d",2.4,2.4);
  applyPattern(materials.road,"paving","#343451","rgba(13,13,34,0.5)","#bda7e6",1.4,2.8);
  applyPattern(materials.paving,"paving","#4a456b","rgba(22,18,48,0.34)","#ddc89b",2.8,2.8);
  applyPattern(materials.top,"stone","#373451","rgba(12,11,33,0.4)","#9c8cc6",2.5,2.5);

  // A large connected floating island gives the park room for real exploration.
  const island = new THREE.Group();
  island.name = "OpenWorldParkIsland";
  scene.add(island);
  const colliders = [];
  const walkSegments = [];
  const terrainZones = [];
  const addCollider = (x,z,radius,label)=>colliders.push({x,z,radius,label});
  const cliff = addMesh(island,new THREE.CylinderGeometry(44.2,34.5,4.2,64,3),materials.rock,[0,-1.42,0]);
  cliff.rotation.y=0.12;
  // The island underside tapers DOWN. A tall rock dome here used to pierce the
  // walkable platform and look like a giant mountain in the center of the park.
  const underbody=addMesh(island,new THREE.ConeGeometry(34.45,8.45,64,4),materials.rockLight,[0,-7.745,0],[1,1,0.94]);
  underbody.rotation.set(Math.PI,0.22,0);
  const lowerRim=addMesh(island,new THREE.TorusGeometry(34.25,0.18,12,128),materials.trim,[0,-3.54,0]);
  lowerRim.rotation.x=Math.PI/2;
  for(let i=0;i<16;i++){
    const angle=(i/16)*Math.PI*2,radius=30.8+(i%3)*1.1;
    const shard=addMesh(island,new THREE.ConeGeometry(0.62+(i%3)*0.14,2.0+(i%4)*0.42,7),materials.rockLight,
      [Math.cos(angle)*radius,-4.65-(i%3)*0.42,Math.sin(angle)*radius],[1,1,0.92]);
    shard.rotation.z=(i%2?1:-1)*0.2;
    shard.rotation.x=Math.PI+(i%3)*0.08;
    if(i%2===0){
      const glint=addMesh(island,new THREE.OctahedronGeometry(0.17,1),materials.crystal,
        [Math.cos(angle)*radius,-5.65-(i%2)*0.3,Math.sin(angle)*radius],[0.62,1.4,0.62],false,false);
      glint.rotation.y=angle;
    }
  }
  addMesh(island,new THREE.CylinderGeometry(44.15,44.15,0.48,96),materials.top,[0,0.46,0]);
  addMesh(island,new THREE.TorusGeometry(43.82,0.23,12,144),materials.gold,[0,0.70,0]).rotation.x=Math.PI/2;
  addMesh(island,new THREE.CylinderGeometry(41.8,41.8,0.13,96),makeMaterial(0x46466e,0.88,0.14),[0,0.72,0]);

  const pavingMaterials=[makeMaterial(0x4c4d78,0.86,0.12),makeMaterial(0x55547f,0.84,0.14)];
  for(let i=0;i<24;i++){
    const start=(i/24)*Math.PI*2;
    const tile=addMesh(island,new THREE.RingGeometry(3.4,12.2,28,1,start,Math.PI/12),pavingMaterials[i%2],[0,0.755,0],null,false,true);
    tile.rotation.x=-Math.PI/2;
  }
  const inlayMat=makeMaterial(0x81749f,0.52,0.58);
  for(let i=0;i<24;i++){
    const angle=(i/24)*Math.PI*2;
    const spoke=addMesh(island,new THREE.BoxGeometry(0.035,0.018,9.4),inlayMat,[Math.sin(angle)*7.8,0.78,Math.cos(angle)*7.8],null,false,false);
    spoke.rotation.y=angle;
  }
  [3.25,6.0,9.5,12.0].forEach((radius,i)=>{
    const ring=addMesh(island,new THREE.TorusGeometry(radius,i===1?0.07:0.04,8,112),i===1?materials.gold:materials.trim,[0,0.82+i*0.003,0]);
    ring.rotation.x=Math.PI/2;
  });
  // Fine radial inlays and tiny north-star studs complete the central mirror-stone plaza.
  for(let i=0;i<32;i++){
    const angle=i/32*Math.PI*2;
    const outer=addMesh(island,new THREE.BoxGeometry(0.045,0.018,11.3),i%4===0?materials.gold:materials.trim,
      [Math.sin(angle)*6.0,0.805,Math.cos(angle)*6.0],null,false,false);
    outer.rotation.y=angle;
    const pin=addMesh(island,new THREE.OctahedronGeometry(i%4===0?0.085:0.045,0),i%4===0?materials.crystal:materials.gold,
      [Math.sin(angle)*11.85,0.82,Math.cos(angle)*11.85],[0.8,0.3,1.5],null,false,false);
    pin.rotation.y=angle;
  }
  // Flush celestial compass medallion: decorative, readable, and never blocks the plaza.
  const compass=new THREE.Group();compass.name="FlushAstralCompass";compass.position.set(0,0.82,0);island.add(compass);
  addMesh(compass,new THREE.CylinderGeometry(2.15,2.22,0.1,64),materials.darkStone,[0,0,0]);
  addMesh(compass,new THREE.CylinderGeometry(1.98,2.02,0.045,64),materials.top,[0,0.068,0]);
  const outerRune=addMesh(compass,new THREE.TorusGeometry(2.0,0.045,8,96),materials.gold,[0,0.095,0]);outerRune.rotation.x=Math.PI/2;
  const innerRune=addMesh(compass,new THREE.TorusGeometry(1.05,0.028,8,72),materials.trim,[0,0.1,0]);innerRune.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const mark=addMesh(compass,new THREE.OctahedronGeometry(i%2?0.12:0.19,0),i%2?materials.trim:materials.crystal,[Math.sin(a)*1.55,0.14,Math.cos(a)*1.55],[0.58,0.32,1.5],false,false);
    mark.rotation.y=a;
  }
  const compassCore=addMesh(compass,new THREE.OctahedronGeometry(0.28,0),materials.gold,[0,0.16,0],[1,0.32,1],false,false);
  compassCore.rotation.y=Math.PI/4;
  const compassHalo=addMesh(compass,new THREE.TorusGeometry(1.78,0.025,6,96),materials.crystal,[0,0.13,0]);compassHalo.rotation.x=Math.PI/2;

  // Wide illuminated pedestrian routes connect the themed districts.
  function addWalkway(points,width=4.1){
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      if(length<0.1)continue;
      const segment=new THREE.Group();
      segment.position.set((a[0]+b[0])/2,0.785,(a[1]+b[1])/2);
      segment.rotation.y=Math.atan2(dx,dz);island.add(segment);
      walkSegments.push({x1:a[0],z1:a[1],x2:b[0],z2:b[1],width,surfaceY:0.822});
      addMesh(segment,new THREE.BoxGeometry(width,0.075,length+0.42),materials.road,[0,0,0],null,false,true);
      [-1,1].forEach(side=>{
        addMesh(segment,new THREE.BoxGeometry(0.16,0.06,length+0.5),materials.roadEdge,[side*(width/2-0.08),0.052,0],null,false,false);
        addMesh(segment,new THREE.BoxGeometry(0.045,0.025,length+0.28),materials.gold,[side*(width/2-0.26),0.094,0],null,false,false);
      });
      addMesh(segment,new THREE.BoxGeometry(0.055,0.018,length*0.82),materials.trim,[0,0.091,0],null,false,false);
      const seamCount=Math.max(1,Math.floor(length/3.2));
      for(let seam=1;seam<seamCount;seam++){
        const zSeam=-length/2+seam*length/seamCount;
        addMesh(segment,new THREE.BoxGeometry(width-0.48,0.018,0.035),materials.roadEdge,[0,0.094,zSeam],null,false,false);
        for(const side of [-1,1]){
          const inset=addMesh(segment,new THREE.OctahedronGeometry(0.085,0),materials.crystal,[side*(width/2-0.42),0.12,zSeam],[0.8,0.28,1.5],null,false,false);
          inset.rotation.y=Math.PI/4;
        }
      }
    }
  }
  [
    [[0,44],[0,36],[0,27],[0,18],[0,9],[0,0],[0,-10],[0,-19]],
    [[0,15],[-10,15],[-18,9],[-22,1],[-23,-9],[-25,-19]],
    [[0,15],[10,15],[18,9],[23,1],[25,-8],[25,-18]],
    [[0,-15],[-9,-20],[-20,-21],[-30,-17]],
    [[0,-15],[9,-20],[20,-21],[30,-17]],
    [[-6,-5],[-10,-9],[-13,-11.5],[-20,-19]],
    [[0,15],[9,15],[18,9]],
    [[0,-3],[-10,-3],[-19,-8]],
    [[6,-5],[10,-8],[13,-10],[20,-15],[25,-17]],
    [[-22,1],[-29,5],[-34,12]],[[25,-8],[34,-2],[36,8]]
  ].forEach(path=>addWalkway(path));

  function addDistrictPlaza(x,z,radius,tint=materials.paving){
    addMesh(island,new THREE.CylinderGeometry(radius,radius,0.13,48),tint,[x,0.80,z],null,false,true);
    const ring=addMesh(island,new THREE.TorusGeometry(radius-0.16,0.075,8,64),materials.gold,[x,0.89,z]);
    ring.rotation.x=Math.PI/2;
    terrainZones.push({x,z,radius,surfaceY:0.865});
    // Small radial floor gems create a finished paving pattern without adding obstacles.
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2,rr=radius*0.78;
      const gem=addMesh(island,new THREE.OctahedronGeometry(0.1,0),materials.trim,
        [x+Math.cos(a)*rr,0.9,z+Math.sin(a)*rr],[0.72,0.2,1.6],false,false);
      gem.rotation.y=a;
    }
  }

  function addStarPlanter(x,z,scale=1,accent=PALETTE.blue){
    const bed=new THREE.Group();bed.position.set(x,0.78,z);island.add(bed);
    addMesh(bed,new THREE.CylinderGeometry(0.72*scale,0.84*scale,0.34*scale,12),materials.darkStone,[0,0.17*scale,0]);
    const rim=addMesh(bed,new THREE.TorusGeometry(0.69*scale,0.075*scale,8,32),materials.gold,[0,0.35*scale,0]);rim.rotation.x=Math.PI/2;
    addMesh(bed,new THREE.CylinderGeometry(0.61*scale,0.64*scale,0.07*scale,12),materials.wood,[0,0.35*scale,0],null,false,false);
    for(let i=0;i<5;i++){
      const a=i/5*Math.PI*2;
      const crystal=addCrystal(bed,Math.cos(a)*0.34*scale,0.46*scale,Math.sin(a)*0.34*scale,(0.34+(i%2)*0.12)*scale,accent);
      crystal.rotation.z=(i%2?1:-1)*0.14;
    }
    addMesh(bed,new THREE.OctahedronGeometry(0.22*scale,1),materials.crystal,[0,0.84*scale,0],[0.74,1.5,0.74],false,false);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      const bloom=addMesh(bed,new THREE.SphereGeometry(0.085*scale,10,8),i%2?materials.lampGlow:materials.trim,
        [Math.cos(a)*0.52*scale,0.52*scale,Math.sin(a)*0.52*scale],[1,0.72,1],false,false);
    }
    addCollider(x,z,0.82*scale,"星晶花圃");
  }

  function addOrnamentalArch(x,z,width,title,subtitle){
    const arch=new THREE.Group();arch.position.set(x,0.78,z);island.add(arch);
    const radius=width/2-0.38;
    [-1,1].forEach(side=>{
      const px=side*radius;
      addMesh(arch,new THREE.CylinderGeometry(0.28,0.36,3.1,16),materials.darkStone,[px,1.55,0]);
      addMesh(arch,new THREE.CylinderGeometry(0.39,0.39,0.18,16),materials.gold,[px,2.95,0]);
      addMesh(arch,new THREE.CylinderGeometry(0.32,0.32,0.14,16),materials.trim,[px,3.12,0]);
      addMesh(arch,new THREE.OctahedronGeometry(0.24,1),materials.crystal,[px,3.34,0],[0.75,1.35,0.75],false,false);
      addCollider(x+px,z,0.46,title+"門柱");
    });
    const crown=addMesh(arch,new THREE.TorusGeometry(radius,0.14,12,56,Math.PI),materials.gold,[0,3.1,0]);
    const inner=addMesh(arch,new THREE.TorusGeometry(radius-0.22,0.045,8,56,Math.PI),materials.crystal,[0,3.1,-0.06]);
    const crest=addMesh(arch,new THREE.OctahedronGeometry(0.25,1),materials.crystal,[0,4.52,0],[0.8,1.2,0.8],false,false);
    crest.rotation.y=Math.PI/4;
    const sign=makeLabelSprite({title,subtitle});
    if(sign){sign.position.set(0,4.17,0.22);sign.scale.set(width*0.72,0.92,1);arch.add(sign)}
    return arch;
  }

  addDistrictPlaza(0,0,12.8);addDistrictPlaza(-21.5,0.7,7.1);
  addDistrictPlaza(-13,-11.5,5.4);addDistrictPlaza(13,-10,5.4);
  addDistrictPlaza(18,9,6.3);addDistrictPlaza(-19,-8,6.3);
  addDistrictPlaza(-25,-19,7.0);addDistrictPlaza(25,-17,7.0);addDistrictPlaza(0,31,6.2);

  // Ornate gateways frame the themed districts and lead the eye along the main paths.
  addOrnamentalArch(0,18.2,8.6,"星夢中庭","STARDREAM PROMENADE");
  addOrnamentalArch(-17.2,5.7,7.3,"星光嘉年華","STARLIGHT CARNIVAL");
  addOrnamentalArch(17.2,6.5,7.3,"銀河冒險區","GALAXY ADVENTURE");

  // Jewel planters soften the geometric plazas and give the paths a garden-park character.
  [
    [-7.5,23,0.9,PALETTE.pink],[7.5,23,0.9,PALETTE.blue],
    [-11.2,4.4,0.82,PALETTE.violet],[11.2,4.4,0.82,PALETTE.blue],
    [-32,-9,0.88,PALETTE.pink],[32,-8,0.88,PALETTE.blue],
    [-9,-27,0.92,PALETTE.violet],[9,-27,0.92,PALETTE.pink],
    [-34,13,0.76,PALETTE.blue],[34,13,0.76,PALETTE.violet]
  ].forEach(([x,z,s,color])=>addStarPlanter(x,z,s,color));

  // The old satellite islands become reachable themed gardens at the far end of the park.
  buildCastle(scene,materials);
  addCollider(0,-18.2,5.7,"星夢城堡");
  const left=makeIsland(scene,-30,0.68,-16.5,4.4,{rock:materials.rock,top:materials.top,trim:materials.gold});
  left.rotation.y=-0.12;
  buildObservatory(scene,-30,0.68,-16.5,materials);
  addCollider(-30,-16.5,3.0,"星辰觀測站");
  const right=makeIsland(scene,30,0.68,-16.5,4.1,{rock:materials.rock,top:materials.top,trim:materials.silver});
  right.rotation.y=0.18;
  for(let i=0;i<5;i++)createTree(right,-1.45+i*0.72,-0.35+(i%2)*0.85,0.7+(i%2)*0.16,{wood:materials.wood});
  addCrystal(right,1.1,0.55,-1.0,0.6,PALETTE.pink);

  const planet=new THREE.Group();planet.position.set(58,27,-82);scene.add(planet);
  addMesh(planet,new THREE.SphereGeometry(6.2,48,32),new THREE.MeshStandardMaterial({color:0x545e9d,emissive:0x151d55,emissiveIntensity:0.55,roughness:0.92,metalness:0.06}),[0,0,0],[1,1,0.92],false,false);
  const planetRing=addMesh(planet,new THREE.TorusGeometry(8.5,0.11,8,96),makeMaterial(0xaab7ef,0.24,0.8),[0,0,0]);
  planetRing.rotation.x=1.15;planetRing.rotation.y=0.45;

  for(let i=0;i<17;i++){
    const angle=(i/17)*Math.PI*2,radius=25+(i%3)*5;
    const crystal=addCrystal(island,Math.cos(angle)*radius,-2.8-(i%3)*0.24,Math.sin(angle)*radius,0.34+(i%3)*0.12,i%2?PALETTE.blue:PALETTE.violet);
    crystal.rotation.z=(i%2?1:-1)*0.28;
  }

  const portals=[];
  [-7.2,0,7.2].forEach((x,i)=>{portals.push(buildPortal(scene,gameMeta[i],x,8.2,materials));addCollider(x,8.2,1.62,gameMeta[i].title)});

  const rides=[];
  const carousel=buildCarousel(scene,materials,-21.5,0.7);rides.push(carousel);addCollider(-21.5,0.7,3.65,"星光旋轉木馬");
  const teacups=buildTeacupRide(scene,materials,-13,-11.5);rides.push(teacups);addCollider(-13,-11.5,3.2,"星月茶杯");
  const drop=buildDropTower(scene,materials,13,-10);rides.push(drop);addCollider(13,-10,2.7,"星際自由落體");
  const ferris=buildFerrisWheel(scene,materials,25,0.78,-17);rides.push(ferris);addCollider(25,-17,3.8,"星河摩天輪");
  const coaster=buildRollerCoaster(scene,materials);rides.push(coaster);addCollider(-24.5,-19.0,4.8,"星際雲霄飛車");
  const rideStations=[carousel,teacups,drop,ferris,coaster];
  const ticketBooth=buildTicketBooth(scene,materials,-4.8,30.5);addCollider(-4.8,30.5,2.55,"星夢入園票亭");
  buildEntranceGate(scene,materials);
  const arcadeStalls=buildArcadeStalls(scene,materials);
  addCollider(5.1,6.9,1.35,"星塵兌換所");addCollider(8.25,5.45,1.35,"旅人補給站");
  const shootingGallery=buildShootingGallery(scene,materials,18,9);addCollider(18,9,4.45,"霓虹神射手");
  const mirrorHouse=buildMirrorHouse(scene,materials,-19,-8);addCollider(-19,-8,4.2,"幻影鏡屋");
  const interactables=[...portals,...rideStations.map(ride=>ride.root),ticketBooth,shootingGallery,mirrorHouse];

  // Each attraction carries its own sign directly on the matching model.

  // Ornate lanterns and crystal groves add life to the walkways; no placeholder visitors are spawned.
  function addParkLamp(x,z,scale=1){
    const lamp=new THREE.Group();lamp.position.set(x,0.72,z);lamp.scale.setScalar(scale);island.add(lamp);
    addMesh(lamp,new THREE.CylinderGeometry(0.25,0.32,0.2,12),materials.darkStone,[0,0.1,0]);
    addMesh(lamp,new THREE.TorusGeometry(0.27,0.045,8,32),materials.gold,[0,0.19,0]).rotation.x=Math.PI/2;
    addMesh(lamp,new THREE.CylinderGeometry(0.095,0.16,2.28,16),materials.darkStone,[0,1.35,0]);
    for(let k=0;k<4;k++){
      const rib=addMesh(lamp,new THREE.BoxGeometry(0.026,1.82,0.026),materials.gold,[0,1.36,0.14]);
      rib.rotation.y=k*Math.PI/2;
    }
    addMesh(lamp,new THREE.TorusGeometry(0.19,0.04,8,32),materials.trim,[0,2.42,0]).rotation.x=Math.PI/2;
    addMesh(lamp,new THREE.CylinderGeometry(0.24,0.3,0.16,12),materials.gold,[0,2.55,0]);
    // Hexagonal glass lantern cage around a warm crystal lamp.
    for(let k=0;k<6;k++){
      const a=k/6*Math.PI*2;
      addMesh(lamp,new THREE.CylinderGeometry(0.025,0.025,0.48,8),materials.silverMetal,
        [Math.cos(a)*0.19,2.85,Math.sin(a)*0.19]);
      addMesh(lamp,new THREE.SphereGeometry(0.045,8,8),materials.gold,
        [Math.cos(a)*0.19,3.11,Math.sin(a)*0.19],null,false,false);
    }
    const glass=addMesh(lamp,new THREE.OctahedronGeometry(0.22,1),materials.lampGlow,[0,2.86,0],[0.82,1.12,0.82],null,false,false);
    const halo=addMesh(lamp,new THREE.TorusGeometry(0.34,0.032,8,40),materials.gold,[0,2.84,0]);halo.rotation.x=Math.PI/2;
    addMesh(lamp,new THREE.ConeGeometry(0.28,0.34,8),materials.trim,[0,3.28,0]);
    addMesh(lamp,new THREE.OctahedronGeometry(0.15,1),materials.crystal,[0,3.56,0],[0.68,1.42,0.68],null,false,false);
    const glow=new THREE.PointLight(0xffd48d,0.48,5.5,2);glow.position.set(0,2.82,0);lamp.add(glow);
  }
  [
    [-4,25],[4,25],[-5,14],[5,14],[-10,2],[10,2],[-17,8],[-26,8],
    [-17,-9],[-29,-17],[17,8],[27,2],[18,-10],[31,-12],[-9,-20],[9,-20],
    [-4,-28],[4,-28],[-34,15],[35,10],[-34,-5],[36,-3]
  ].forEach((p,i)=>addParkLamp(p[0],p[1],i%4===0?1.12:1));

  [
    [-35,23],[-32,27],[-27,25],[-20,23],[-14,28],[14,27],[20,24],[27,26],
    [33,23],[36,17],[-36,3],[-34,-8],[-33,-23],[-25,-29],[-16,-31],[15,-31],
    [25,-29],[34,-23],[37,-13],[36,2],[-9,-34],[0,-35],[9,-34],[-2,22],[2,22]
  ].forEach((p,i)=>{
    createTree(island,p[0],p[1],0.62+(i%3)*0.12,{
      wood:materials.wood,foliageA:materials.foliageA,foliageB:materials.foliageB,
      foliageC:materials.foliageC,gold:materials.gold
    });
    addCollider(p[0],p[1],0.42,"星樹");
  });

  const clouds=new THREE.Group();scene.add(clouds);
  for(let i=0;i<18;i++){
    const angle=(i/18)*Math.PI*2,radius=34+(i%4)*4.5;
    const cloud=addMesh(clouds,new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({
      color:i%2?0x7473b8:0x9d83c4,transparent:true,opacity:0.075,depthWrite:false
    }),[Math.cos(angle)*radius,-6.1-(i%3)*0.65,Math.sin(angle)*radius],[4.4+(i%3),0.72,2.5],false,false);
    cloud.userData.phase=angle;
  }
  return {materials,island,compass,compassHalo,portals,planet,planetRing,clouds,rides,rideStations,carousel,ticketBooth,arcadeStalls,shootingGallery,mirrorHouse,interactables,colliders,walkSegments,terrainZones,playableRadius:41.2};
}

function createParkMotes(scene,count=56){
 const positions=new Float32Array(count*3),phases=new Float32Array(count),colors=new Float32Array(count*3);
 const palette=[new THREE.Color(0xffdba0),new THREE.Color(0xb7a4f0),new THREE.Color(0x9ce2f4)];
 for(let i=0;i<count;i++){
  const angle=(i*2.3999632297)%(Math.PI*2),radius=5.5+(i%9)*3.55;
  positions[i*3]=Math.cos(angle)*radius;
  positions[i*3+1]=0.95+(i%5)*0.22;
  positions[i*3+2]=Math.sin(angle)*radius;
  phases[i]=i*0.73;
  const color=palette[i%palette.length];colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
 geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
 const material=new THREE.PointsMaterial({size:0.075,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:0.58,depthWrite:false,blending:THREE.AdditiveBlending});
 const points=new THREE.Points(geometry,material);points.userData.basePositions=positions.slice();points.userData.phases=phases;scene.add(points);return points;
}

function createStarfield(scene, count = 620) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color(0xd9d6ff),
    new THREE.Color(0xf5dfaa),
    new THREE.Color(0x96b9ed),
    new THREE.Color(0xe5b9ee)
  ];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 260;
    positions[i * 3 + 1] = 8 + Math.random() * 82;
    positions[i * 3 + 2] = -150 + Math.random() * 250;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.18, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.88, depthWrite: false
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

function disposeWorld(world) {
  if (!world) return;
  if (world.resizeObserver) world.resizeObserver.disconnect();
  if (world.canvas) {
    world.canvas.removeEventListener("wheel", world.onWheel);
    if(world.onAvatarChange)window.removeEventListener("starry-3d-avatar-change",world.onAvatarChange);
    if(world.onRemotePlayers)window.removeEventListener("starry-3d-players",world.onRemotePlayers);
    if(world.onRemoteMove)window.removeEventListener("starry-3d-player-move",world.onRemoteMove);
    world.canvas.removeEventListener("pointerdown", world.onPointerDown);
    world.canvas.removeEventListener("pointermove", world.onPointerMove);
    world.canvas.removeEventListener("pointerup", world.onPointerUp);
    world.canvas.removeEventListener("pointercancel", world.onPointerUp);
    window.removeEventListener("starry-3d-camera-toggle",world.onCameraToggle);
    window.removeEventListener("starry-3d-touch-move",world.onTouchMove);
    window.removeEventListener("starry-3d-touch-run",world.onTouchRun);
    window.removeEventListener("starry-3d-touch-interact",world.onTouchInteract);
  }
  if (world.onKeyDown) window.removeEventListener("keydown", world.onKeyDown);
  if (world.onKeyUp) window.removeEventListener("keyup", world.onKeyUp);
  if (world.onBlur) window.removeEventListener("blur", world.onBlur);
  if (world.visibilityHandler) document.removeEventListener("visibilitychange", world.visibilityHandler);
  if (world.renderer) {
    world.renderer.setAnimationLoop(null);
    world.renderer.dispose();
    if (world.renderer.domElement && world.renderer.domElement.parentNode) {
      world.renderer.domElement.parentNode.removeChild(world.renderer.domElement);
    }
  }
  world.scene?.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        Object.values(mat).forEach(value => {
          if (value && value.isTexture) value.dispose();
        });
        mat.dispose();
      });
    }
  });
}

function buildPlayer(scene,avatarId="wanderer",customization={}){
  const styles={
    wanderer:{robe:0x30466f,mantle:0x6556a2,metal:0x8cbcd8},
    "moon-priestess":{robe:0x7770a7,mantle:0x9b91cf,metal:0xa7d9ed},
    "nebula-prince":{robe:0x265c73,mantle:0x4f75a5,metal:0x8be0db},
    "crystal-witch":{robe:0x593d75,mantle:0x34234f,metal:0xc7a6ef},
    "astral-knight":{robe:0x536a86,mantle:0x273a59,metal:0xdce6f5},
    "celestial-guardian":{robe:0xe0d9c8,mantle:0x8b7ab7,metal:0xf1e8ff}
  };
  const types=["wanderer","mage","knight","priest","guardian"];
  const hairStyles=["long","short","twin","hood"];
  const hairColors=["#30263f","#633e69","#27445c","#a98b62","#d4b67c","#d5d7e8"];
  const skinTones=["#f0d5c1","#f3d9c3","#e9bea0","#cc9877","#9c6c54"];
  const accents=["#f1d18e","#8c75d6","#65c5e3","#e69cca","#a9d5b1","#d8e1f5"];
  const rawAppearance=customization&&customization.appearance||{};
  const appearance={
    hairStyle:hairStyles.includes(rawAppearance.hairStyle)?rawAppearance.hairStyle:"long",
    hairColor:hairColors.includes(rawAppearance.hairColor)?rawAppearance.hairColor:"#30263f",
    skinTone:skinTones.includes(rawAppearance.skinTone)?rawAppearance.skinTone:"#f0d5c1",
    accentColor:accents.includes(rawAppearance.accentColor)?rawAppearance.accentColor:"#f1d18e"
  };
  const avatarType=types.includes(customization&&customization.avatarType)?customization.avatarType:"wanderer";
  const style=styles[avatarId]||styles.wanderer;
  const hex=value=>parseInt(String(value).replace("#",""),16);
  const player=new THREE.Group();player.name="StarryDreamlandPlayer";
  player.userData.avatarId=avatarId;player.userData.avatarType=avatarType;player.userData.appearance=appearance;
  const robe=makeMaterial(style.robe,0.32,0.34,{clearcoat:0.72,clearcoatRoughness:0.18});
  const mantle=makeMaterial(style.mantle,0.36,0.28,{clearcoat:0.68});
  const trim=makeMaterial(hex(appearance.accentColor),0.2,0.82,{clearcoat:1});
  const hair=makeMaterial(hex(appearance.hairColor),0.5,0.08);
  const skin=makeMaterial(hex(appearance.skinTone),0.78,0.02);
  const metal=makeMaterial(style.metal,0.2,0.76,{clearcoat:1});
  const shadow=makeMaterial(0x1a1930,0.82,0.05);

  // Tailored robe, layered mantle and a gemstone clasp.
  addMesh(player,new THREE.CylinderGeometry(0.25,0.48,0.98,24,3),robe,[0,0.77,0]);
  addMesh(player,new THREE.CylinderGeometry(0.28,0.31,0.12,24),trim,[0,1.19,0]);
  const cape=addMesh(player,new THREE.CylinderGeometry(0.12,0.53,0.9,24,2,true),mantle,[0,0.72,-0.16]);
  cape.rotation.x=-0.1;
  addMesh(player,new THREE.TorusGeometry(0.31,0.045,8,40),trim,[0,0.98,0]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.BoxGeometry(0.54,0.1,0.18),metal,[0,0.99,0.02]);
  addMesh(player,new THREE.OctahedronGeometry(0.13,1),trim,[0,1.0,0.14],[0.72,1.15,0.72]);
  // Boots, sleeves, gloves and decorative arm cuffs.
  [-0.19,0.19].forEach(x=>{
    addMesh(player,new THREE.CylinderGeometry(0.105,0.13,0.31,14),shadow,[x,0.19,0.02]);
    addMesh(player,new THREE.TorusGeometry(0.11,0.025,6,22),trim,[x,0.31,0.02]);
    addMesh(player,new THREE.SphereGeometry(0.13,16,12),robe,[x*1.55,1.03,0],[1,0.86,0.92]);
    addMesh(player,new THREE.SphereGeometry(0.09,14,10),skin,[x*1.78,0.76,0.06]);
    const cuff=addMesh(player,new THREE.TorusGeometry(0.095,0.022,6,20),metal,[x*1.78,0.82,0.06]);
    cuff.rotation.x=Math.PI/2;
  });
  // Face and selectable hair styles. The hood is an actual garment silhouette.
  addMesh(player,new THREE.SphereGeometry(0.255,24,18),skin,[0,1.48,0.025],[0.94,1.05,0.9]);
  addMesh(player,new THREE.SphereGeometry(0.27,24,16,0,Math.PI*2,0,Math.PI/2),hair,[0,1.56,-0.015],
    appearance.hairStyle==="short"?[1.04,0.58,0.98]:[1.04,0.86,0.98]);
  if(appearance.hairStyle==="long"){
    [-1,1].forEach(side=>{
      addMesh(player,new THREE.SphereGeometry(0.085,14,12),hair,[side*0.235,1.34,-0.015],[0.8,2.3,0.98]);
      addMesh(player,new THREE.ConeGeometry(0.07,0.48,10),hair,[side*0.245,1.03,-0.12]);
    });
    addMesh(player,new THREE.SphereGeometry(0.18,14,12),hair,[0,1.34,-0.19],[1.0,1.2,0.75]);
  }else if(appearance.hairStyle==="twin"){
    [-1,1].forEach(side=>{
      addMesh(player,new THREE.SphereGeometry(0.12,16,12),hair,[side*0.29,1.62,-0.015],[1,1.05,1]);
      addMesh(player,new THREE.ConeGeometry(0.07,0.42,10),hair,[side*0.34,1.31,-0.04]);
      addMesh(player,new THREE.TorusGeometry(0.13,0.022,6,20),trim,[side*0.29,1.64,-0.015]);
    });
  }else if(appearance.hairStyle==="hood"){
    const hood=addMesh(player,new THREE.SphereGeometry(0.34,24,16,0,Math.PI*2,0,Math.PI/1.65),mantle,[0,1.54,-0.075],[1.08,1.16,1.08]);
    hood.rotation.x=-0.1;
    addMesh(player,new THREE.TorusGeometry(0.28,0.045,8,36),trim,[0,1.39,0.12]).rotation.x=Math.PI/2;
  }else{
    [-1,1].forEach(side=>addMesh(player,new THREE.SphereGeometry(0.07,12,10),hair,[side*0.23,1.39,-0.01],[0.8,1.4,0.9]));
  }
  [-1,1].forEach(side=>{
    addMesh(player,new THREE.SphereGeometry(0.028,10,8),shadow,[side*0.095,1.5,0.242]);
  });
  addMesh(player,new THREE.SphereGeometry(0.045,12,10),skin,[0,1.41,0.238],[0.8,0.62,0.7]);
  addMesh(player,new THREE.TorusGeometry(0.285,0.045,8,36),trim,[0,1.68,0]).rotation.x=Math.PI/2;

  // Traveler archetype controls the silhouette; outfits remain independently selectable.
  if(avatarType==="mage"||(avatarType==="wanderer"&&avatarId==="crystal-witch")){
    addMesh(player,new THREE.CylinderGeometry(0.43,0.43,0.07,24),mantle,[0,1.78,0]);
    addMesh(player,new THREE.ConeGeometry(0.34,0.68,16),mantle,[0,2.12,0]);
    addMesh(player,new THREE.TorusGeometry(0.25,0.035,8,28),trim,[0,1.93,0]);
  }else if(avatarType==="guardian"||(avatarType==="wanderer"&&avatarId==="celestial-guardian")){
    [-1,1].forEach(side=>{
      const wing=new THREE.Group();wing.position.set(side*0.27,1.1,-0.13);wing.rotation.z=side*-0.2;player.add(wing);
      for(let feather=0;feather<3;feather++){
        const plume=addMesh(wing,new THREE.ConeGeometry(0.14,0.78-feather*0.12,8),feather%2?trim:metal,
          [side*feather*0.13,0.22-feather*0.12,-0.03],[1,1,0.56]);
        plume.rotation.z=side*0.68;
      }
    });
    addMesh(player,new THREE.TorusGeometry(0.52,0.035,8,48),trim,[0,2.13,0]);
  }else if(avatarType==="knight"||(avatarType==="wanderer"&&avatarId==="astral-knight")){
    addMesh(player,new THREE.CylinderGeometry(0.31,0.35,0.12,16),metal,[0,1.74,0]);
    addMesh(player,new THREE.ConeGeometry(0.18,0.48,8),trim,[0,1.99,0]);
    [-1,1].forEach(side=>{
      const horn=addMesh(player,new THREE.ConeGeometry(0.09,0.34,8),metal,[side*0.26,1.9,0]);
      horn.rotation.z=side*0.48;
      addMesh(player,new THREE.SphereGeometry(0.2,16,12),metal,[side*0.29,1.08,-0.015],[1.12,0.56,1.08]);
      const pauldronTrim=addMesh(player,new THREE.TorusGeometry(0.17,0.025,6,24),trim,[side*0.29,1.12,0.03]);
      pauldronTrim.rotation.x=Math.PI/2;
    });
    addMesh(player,new THREE.SphereGeometry(0.29,18,12),metal,[0,1.0,0.13],[0.9,0.85,0.35]);
  }else if(avatarType==="priest"||(avatarType==="wanderer"&&avatarId==="moon-priestess")){
    addMesh(player,new THREE.TorusGeometry(0.36,0.045,8,48),trim,[0,1.9,0.02]);
    const crescent=addMesh(player,new THREE.TorusGeometry(0.24,0.052,8,36,Math.PI*1.3),metal,[0,2.15,0.05]);
    crescent.rotation.z=Math.PI*0.62;
    addMesh(player,new THREE.OctahedronGeometry(0.14,1),trim,[0,2.4,0.05],[0.72,1.25,0.72]);
    [-1,1].forEach(side=>{
      const drape=addMesh(player,new THREE.ConeGeometry(0.065,0.74,8),mantle,[side*0.29,1.14,-0.1]);
      drape.rotation.z=side*0.22;
    });
  }else{
    addMesh(player,new THREE.CylinderGeometry(0.36,0.28,0.08,24),mantle,[0,1.76,0]);
    addMesh(player,new THREE.ConeGeometry(0.25,0.42,12),mantle,[0,1.98,0]);
    addMesh(player,new THREE.OctahedronGeometry(0.12,1),trim,[0,2.23,0],null,false,false);
  }

  if(avatarType==="mage"){
    const staff=new THREE.Group();staff.position.set(-0.48,0.34,0.12);staff.rotation.z=0.08;player.add(staff);
    addMesh(staff,new THREE.CylinderGeometry(0.035,0.055,1.15,10),makeMaterial(0x3b2b48,0.62,0.22),[0,0.55,0]);
    addMesh(staff,new THREE.TorusGeometry(0.15,0.025,6,24),trim,[0,1.14,0]);
    addMesh(staff,new THREE.OctahedronGeometry(0.16,1),metal,[0,1.25,0],[0.8,1.35,0.8]);
  }else if(avatarType==="wanderer"){
    const satchel=addMesh(player,new THREE.BoxGeometry(0.3,0.34,0.18),mantle,[-0.37,0.72,-0.18]);
    addMesh(player,new THREE.TorusGeometry(0.14,0.024,6,22),trim,[-0.37,0.76,-0.09]);
  }

  const floatingStar=addMesh(player,new THREE.OctahedronGeometry(0.105,1),trim,[0,2.34,0],null,false,false);
  const halo=addMesh(player,new THREE.TorusGeometry(0.49,0.028,8,44),metal,[0,2.21,0]);
  halo.rotation.x=Math.PI/2;
  [-0.26,0.26].forEach(x=>addMesh(player,new THREE.OctahedronGeometry(0.075,1),trim,[x,1.08,0.09],null,false,false));
  player.userData.halo=halo;player.userData.floatingStar=floatingStar;player.userData.walkPhase=0;
  scene.add(player);return player;
}



function mount(host) {
  if (!host || !host.isConnected) return;
  if (activeWorld && activeWorld.host === host) return;
  disposeWorld(activeWorld);
  activeWorld = null;

  host.dataset.status = "loading";
  const status = document.getElementById("starry-3d-status");
  if (status) status.textContent = "正在喚醒星夢廣場…";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio <= 1.25,
      alpha: false,
      powerPreference: "high-performance"
    });
  } catch (error) {
    host.dataset.status = "fallback";
    host.innerHTML = '<div class="starry-3d-fallback"><strong>目前瀏覽器無法啟用 3D 畫面</strong><span>遊戲入口仍可從下方挑戰卡片開啟。</span></div>';
    if (status) status.textContent = "3D 模式無法啟動，已保留遊戲入口";
    console.warn("Starry Dreamland 3D renderer unavailable:", error);
    return;
  }

  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.night);
  scene.fog = new THREE.FogExp2(PALETTE.night, 0.0038);

  const isSmall = width < 650;
  const camera = new THREE.PerspectiveCamera(isSmall ? 62 : 60,width/height,0.1,320);
  const cameraState = { yaw: 0, pitch: 0.035, distance: isSmall ? 10.2 : 9.5 };
  camera.position.set(0, 3.2, 42.2);
  camera.lookAt(0, 1.7, 33.0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.0 : 1.25));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "starry-3d-canvas";
  renderer.domElement.setAttribute("aria-label", "可自由探索星夢夜遊園、漫遊各主題園區並點擊挑戰星門");
  host.appendChild(renderer.domElement);

  const hemisphere = new THREE.HemisphereLight(0xcbd5ff, 0x171329, 1.28);
  scene.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(0xffe9d0, 2.15);
  moonLight.position.set(-15, 28, 18);
  moonLight.castShadow = true;
  const shadowResolution = isSmall ? 768 : 1536;
  moonLight.shadow.mapSize.set(shadowResolution, shadowResolution);
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 90;
  moonLight.shadow.camera.left = -48;
  moonLight.shadow.camera.right = 48;
  moonLight.shadow.camera.top = 52;
  moonLight.shadow.camera.bottom = -42;
  moonLight.shadow.bias = -0.00022;
  moonLight.shadow.normalBias = 0.035;
  moonLight.shadow.radius = isSmall ? 2 : 3;
  moonLight.shadow.camera.updateProjectionMatrix();
  scene.add(moonLight);

  const fillLight = new THREE.DirectionalLight(0x9c91eb, 0.68);
  fillLight.position.set(12, 8, -12);
  scene.add(fillLight);

  const warmLight = new THREE.PointLight(0xf2c884, 19, 30, 2);
  warmLight.position.set(0, 7, -4);
  scene.add(warmLight);

  const blueLight = new THREE.PointLight(0x6d80dc, 23, 28, 2);
  blueLight.position.set(-7, 4, 5);
  scene.add(blueLight);

  const starfield = createStarfield(scene, isSmall ? 420 : 760);
  const parkMotes = createParkMotes(scene,isSmall?28:56);
  const environment = buildEnvironment(scene);
  let initialCustomization={};
  try{initialCustomization=JSON.parse(host.dataset.avatarCustomization||"{}")}catch(error){}
  let player = buildPlayer(scene,host.dataset.avatar || "wanderer",initialCustomization);
  player.position.set(0, 0.68, 33.0);
  camera.position.set(
    player.position.x - Math.sin(cameraState.yaw) * Math.cos(cameraState.pitch) * cameraState.distance,
    player.position.y + Math.sin(cameraState.pitch) * cameraState.distance + 1.0,
    player.position.z + Math.cos(cameraState.yaw) * Math.cos(cameraState.pitch) * cameraState.distance
  );
  camera.lookAt(player.position.x, player.position.y + 1.15, player.position.z);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const world = {
    host, scene, renderer, camera, starfield, parkMotes, environment,
    portals: environment.portals, raycaster, pointer, canvas: renderer.domElement, player,
    cameraState, cameraMode: host.dataset.cameraMode || "first", keys: new Set(),
    touchMove: {x:0,y:0}, touchRun: false, mountedRide: null, mountedRideData:null, minimapLast: 0, nearbyHintLast:0,
    localUserId: host.dataset.sessionId || null, otherPlayers: new Map(),
    pointerDrag: { down: false, dragged: false, x: 0, y: 0 },
    running: true, frame: 0, lastTime: 0
  };
  activeWorld = world;
  player.visible = world.cameraMode !== "first";

  function setCameraMode(mode){
    world.cameraMode=mode==="third"?"third":"first";
    cameraState.pitch=world.cameraMode==="third"?0.24:0.035;
    player.visible=world.cameraMode==="third"&&!world.mountedRide;
    if(world.mountedRide)player.visible=world.cameraMode==="third";
    window.dispatchEvent(new CustomEvent("starry-3d-camera-mode",{detail:{mode:world.cameraMode}}));
  }

  function rideDistance(ride){
    return Math.hypot(player.position.x-ride.root.position.x,player.position.z-ride.root.position.z);
  }
  function mountRide(ride){
    if(!ride||!ride.rideSeat||world.mountedRide)return;
    world.mountedRide=ride.rideSeat;world.mountedRideData=ride;
    player.visible=world.cameraMode==="third";player.scale.setScalar(0.72);
    world.keys.clear();world.touchMove.x=0;world.touchMove.y=0;world.touchRun=false;
    const status=document.getElementById("starry-3d-status");
    if(status)status.textContent="正在搭乘「"+ride.name+"」 · 按互動鍵或 E 下車";
    window.dispatchEvent(new CustomEvent("starry-3d-nearby",{detail:{label:"下車　E",name:"下車"}}));
  }
  function dismountRide(){
    if(!world.mountedRide)return;
    const ride=world.mountedRideData;
    world.mountedRide=null;world.mountedRideData=null;
    player.visible=world.cameraMode==="third";player.scale.setScalar(1);
    const root=ride?.root,baseX=root?.position.x??player.position.x,baseZ=root?.position.z??player.position.z;
    const radius=ride?.dismountRadius||5.0;
    let exit=null;
    for(let i=0;i<20;i++){
      const angle=(i/20)*Math.PI*2+0.24;
      const x=baseX+Math.cos(angle)*radius,z=baseZ+Math.sin(angle)*radius;
      if(Math.hypot(x,z)<(environment.playableRadius||41.2)-0.6&&!blockedAt(x,z)){exit={x,z};break}
    }
    if(!exit){exit={x:baseX+radius,z:baseZ}}
    player.position.set(exit.x,surfaceAt(exit.x,exit.z)-0.025,exit.z);
    const status=document.getElementById("starry-3d-status");
    if(status)status.textContent="已離開設施 · 繼續探索星夢樂園";
    window.dispatchEvent(new CustomEvent("starry-3d-nearby",{detail:{label:"互動　E",name:"互動"}}));
  }
  function interactNearby(){
    if(world.mountedRide){dismountRide();return}
    const nearest=environment.rideStations
      .map(ride=>({ride,distance:rideDistance(ride)}))
      .sort((a,b)=>a.distance-b.distance)[0];
    if(nearest&&nearest.distance<=nearest.ride.interactionRadius){
      mountRide(nearest.ride);return;
    }
    const booth=environment.ticketBooth.position;
    if(Math.hypot(player.position.x-booth.x,player.position.z-booth.z)<4.2){
      window.dispatchEvent(new CustomEvent("starry-3d-action",{detail:{action:"ticket-booth"}}));return;
    }
    window.dispatchEvent(new CustomEvent("starry-3d-action",{detail:{action:"nearby-hint"}}));
  }
  world.onCameraToggle=()=>setCameraMode(world.cameraMode==="first"?"third":"first");
  world.onTouchMove=event=>{
    const d=event.detail||{};
    world.touchMove.x=THREE.MathUtils.clamp(Number(d.x)||0,-1,1);
    world.touchMove.y=THREE.MathUtils.clamp(Number(d.y)||0,-1,1);
  };
  world.onTouchRun=event=>{world.touchRun=!!(event.detail&&event.detail.active)};
  world.onTouchInteract=()=>interactNearby();
  window.addEventListener("starry-3d-camera-toggle",world.onCameraToggle);
  window.addEventListener("starry-3d-touch-move",world.onTouchMove);
  window.addEventListener("starry-3d-touch-run",world.onTouchRun);
  window.addEventListener("starry-3d-touch-interact",world.onTouchInteract);

  function findTarget(object) {
    let current = object;
    while (current) {
      if (current.userData && current.userData.gameId) return { type: "game", gameId: current.userData.gameId };
      if (current.userData && current.userData.action) return { type: "action", action: current.userData.action };
      current = current.parent;
    }
    return null;
  }

  function surfaceAt(x,z) {
    let surface = 0.70;
    environment.terrainZones.forEach(zone => {
      if (Math.hypot(x-zone.x,z-zone.z) <= zone.radius) surface = Math.max(surface,zone.surfaceY);
    });
    environment.walkSegments.forEach(seg => {
      const dx=seg.x2-seg.x1,dz=seg.z2-seg.z1,lenSq=dx*dx+dz*dz;
      const t=lenSq?THREE.MathUtils.clamp(((x-seg.x1)*dx+(z-seg.z1)*dz)/lenSq,0,1):0;
      const px=seg.x1+t*dx,pz=seg.z1+t*dz;
      if(Math.hypot(x-px,z-pz)<=seg.width/2+0.28)surface=Math.max(surface,seg.surfaceY);
    });
    return surface;
  }

  function blockedAt(x,z) {
    return environment.colliders.some(collider => Math.hypot(x-collider.x,z-collider.z) < collider.radius + 0.48);
  }

  world.onAvatarChange = event => {
    const detail=event.detail||{};
    const avatarId=detail.avatarId||player.userData.avatarId||"wanderer";
    const customization={avatarType:detail.avatarType||player.userData.avatarType,appearance:detail.appearance||player.userData.appearance};
    const previous=player;
    const next=buildPlayer(scene,avatarId,customization);
    next.position.copy(previous.position);next.rotation.copy(previous.rotation);next.visible=previous.visible;
    if(previous.scale)next.scale.copy(previous.scale);
    player=next;world.player=next;
    releaseRemoteAvatar({model:previous});
  };
  window.addEventListener("starry-3d-avatar-change",world.onAvatarChange);

  function releaseRemoteAvatar(entry){
    if(!entry||!entry.model)return;
    scene.remove(entry.model);
    entry.model.traverse(obj=>{
      if(obj.geometry)obj.geometry.dispose();
      if(obj.material){
        const list=Array.isArray(obj.material)?obj.material:[obj.material];
        list.forEach(mat=>{Object.values(mat).forEach(v=>{if(v&&v.isTexture)v.dispose()});mat.dispose()});
      }
    });
  }

  function upsertRemotePlayer(info){
    if(!info||!(info.sessionId||info.userId)||(info.sessionId||info.userId)===world.localUserId)return;
    const id=String(info.sessionId||info.userId);
    const x=THREE.MathUtils.clamp(Number(info.x)||0,-environment.playableRadius,environment.playableRadius);
    const z=THREE.MathUtils.clamp(Number(info.z)||0,-environment.playableRadius,environment.playableRadius);
    const avatarId=info.avatarId||"wanderer";
    const customization={avatarType:info.avatarType||"wanderer",appearance:info.appearance||{}};
    const appearanceKey=JSON.stringify([avatarId,customization.avatarType,customization.appearance]);
    let entry=world.otherPlayers.get(id);
    if(!entry||entry.appearanceKey!==appearanceKey){
      const oldEntry=entry;
      if(entry)releaseRemoteAvatar(entry);
      const model=buildPlayer(scene,avatarId,customization);
      model.scale.setScalar(0.82);
      const nameTag=makeLabelSprite({title:String(info.nickname||"星空旅人").slice(0,12),subtitle:"ONLINE"});
      if(nameTag){nameTag.position.set(0,3.05,0);nameTag.scale.set(2.35,0.64,1);model.add(nameTag)}
      entry={model,avatarId,appearanceKey,target:new THREE.Vector3(x,surfaceAt(x,z)-0.025,z),targetYaw:Number(info.yaw)||0,nickname:info.nickname||"星空旅人"};
      if(oldEntry){entry.target.copy(oldEntry.target);entry.model.position.copy(oldEntry.model.position)}
      world.otherPlayers.set(id,entry);
    }
    entry.nickname=info.nickname||entry.nickname;
    entry.target.set(x,surfaceAt(x,z)-0.025,z);
    entry.targetYaw=Number(info.yaw)||0;
  }

  world.onRemotePlayers = event => {
    const list=event.detail&&Array.isArray(event.detail.players)?event.detail.players:[];
    const visible=new Set();
    list.forEach(info=>{
      if(!info||!(info.sessionId||info.userId)||(info.sessionId||info.userId)===world.localUserId)return;
      visible.add(String(info.sessionId||info.userId));
      upsertRemotePlayer(info);
    });
    for(const [id,entry] of world.otherPlayers){
      if(!visible.has(id)){releaseRemoteAvatar(entry);world.otherPlayers.delete(id)}
    }
  };
  world.onRemoteMove = event => upsertRemotePlayer(event.detail&&event.detail.player);
  window.addEventListener("starry-3d-players",world.onRemotePlayers);
  window.addEventListener("starry-3d-player-move",world.onRemoteMove);

  world.onKeyDown = event => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target && event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if(key==="e"){event.preventDefault();interactNearby();return}
    if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"].includes(key)) {
      if(world.mountedRide)return;
      event.preventDefault();world.keys.add(key);
    }
  };
  world.onKeyUp = event => world.keys.delete(event.key.toLowerCase());
  world.onBlur = () => {world.keys.clear();world.touchMove.x=0;world.touchMove.y=0;world.touchRun=false};
  window.addEventListener("keydown", world.onKeyDown, { passive: false });
  window.addEventListener("keyup", world.onKeyUp);
  window.addEventListener("blur", world.onBlur);

  world.onWheel = event => {
    event.preventDefault();
    cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + Math.sign(event.deltaY) * 1.1, 8.5, 22);
  };
  renderer.domElement.addEventListener("wheel", world.onWheel, { passive: false });

  world.onPointerDown = event => {
    world.pointerDrag.down = true;
    world.pointerDrag.dragged = false;
    world.pointerDrag.x = event.clientX;
    world.pointerDrag.y = event.clientY;
  };
  world.onPointerMove = event => {
    if (world.pointerDrag.down) {
      const dx = event.clientX - world.pointerDrag.x;
      const dy = event.clientY - world.pointerDrag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) world.pointerDrag.dragged = true;
      if (world.pointerDrag.dragged) {
        cameraState.yaw -= dx * (world.cameraMode==="first"?0.0048:0.006);
        cameraState.pitch = THREE.MathUtils.clamp(
          cameraState.pitch + dy * 0.0032,
          world.cameraMode==="first"?-0.62:0.10,
          world.cameraMode==="first"?0.62:0.82
        );
        world.pointerDrag.x = event.clientX;
        world.pointerDrag.y = event.clientY;
        renderer.domElement.style.cursor = "grabbing";
        return;
      }
    }
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(environment.interactables, true);
    renderer.domElement.style.cursor = hits.some(hit => findTarget(hit.object)) ? "pointer" : "grab";
  };

  world.onPointerUp = event => {
    const wasDragged = world.pointerDrag.dragged;
    world.pointerDrag.down = false;
    world.pointerDrag.dragged = false;
    renderer.domElement.style.cursor = "grab";
    if (wasDragged || event.button !== 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(environment.interactables, true);
    for (const hit of hits) {
      const target=findTarget(hit.object);
      if(!target)continue;
      if(target.type==="game"){
        if(world.mountedRide)dismountRide();
        window.dispatchEvent(new CustomEvent("starry-3d-portal",{detail:{gameId:target.gameId}}));
      }else if(target.action&&target.action.startsWith("ride-")){
        if(world.mountedRide){dismountRide();break}
        const ride=environment.rideStations.find(item=>item.action===target.action);
        if(ride&&rideDistance(ride)<=ride.interactionRadius+5.5)mountRide(ride);
        else if(ride){
          const status=document.getElementById("starry-3d-status");
          if(status)status.textContent="請再靠近「"+ride.name+"」，即可搭乘";
        }
      }else{
        window.dispatchEvent(new CustomEvent("starry-3d-action",{detail:{action:target.action}}));
      }
      break;
    }
  };

  renderer.domElement.addEventListener("pointerdown", world.onPointerDown);
  renderer.domElement.addEventListener("pointermove", world.onPointerMove);
  renderer.domElement.addEventListener("pointerup", world.onPointerUp);
  renderer.domElement.addEventListener("pointercancel", world.onPointerUp);

  const clock = new THREE.Clock();
  world.renderFrame = () => {
    if (!world.running || !world.host.isConnected) return;
    const delta = Math.min(clock.getDelta(), 0.04);
    const t = clock.elapsedTime;
    environment.compass.rotation.y += delta * 0.36;
    environment.rides.forEach(ride => {
      if (ride.axis === "y") ride.object.rotation.y += delta * ride.speed;
      else if (ride.axis === "lift") {
        const wave = (Math.sin(t * ride.speed + ride.phase) + 1) * 0.5;
        ride.object.position.y = ride.baseY + wave * ride.range;
      } else if(ride.axis==="track"){
        ride.progress+=delta*ride.speed*ride.direction;
        if(ride.progress>=1){ride.progress=1;ride.direction=-1}
        if(ride.progress<=0){ride.progress=0;ride.direction=1}
        const point=ride.curve.getPointAt(ride.progress),tangent=ride.curve.getTangentAt(ride.progress);
        ride.object.position.copy(point);
        ride.object.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent);
      } else ride.object.rotation.z += delta * ride.speed;
    });
    environment.compassHalo.rotation.z += delta * 0.17;
    environment.planet.rotation.y += delta * 0.045;
    environment.planetRing.rotation.z += delta * 0.06;
    if(parkMotes){
      const position=parkMotes.geometry.attributes.position,base=parkMotes.userData.basePositions,phases=parkMotes.userData.phases;
      for(let i=0;i<phases.length;i++)position.array[i*3+1]=base[i*3+1]+Math.sin(t*0.8+phases[i])*0.16;
      position.needsUpdate=true;
    }
    environment.clouds.children.forEach((cloud, i) => {
      cloud.position.x += Math.sin(t * 0.12 + cloud.userData.phase) * delta * 0.025;
    });
    const forward = new THREE.Vector3(-Math.sin(cameraState.yaw), 0, -Math.cos(cameraState.yaw));
    const right = new THREE.Vector3(Math.cos(cameraState.yaw), 0, -Math.sin(cameraState.yaw));
    const move = new THREE.Vector3();
    if (world.keys.has("w") || world.keys.has("arrowup")) move.add(forward);
    if (world.keys.has("s") || world.keys.has("arrowdown")) move.sub(forward);
    if (world.keys.has("d") || world.keys.has("arrowright")) move.add(right);
    if (world.keys.has("a") || world.keys.has("arrowleft")) move.sub(right);
    if(world.touchMove.x||world.touchMove.y){
      move.addScaledVector(right,world.touchMove.x);
      move.addScaledVector(forward,-world.touchMove.y);
    }
    if(world.mountedRide){
      const mountedPosition=new THREE.Vector3();
      world.mountedRide.getWorldPosition(mountedPosition);
      player.position.copy(mountedPosition);
      player.position.y-=0.18;
      if(world.mountedRideData?.axis==="y")player.rotation.y=world.mountedRideData.object.rotation.y;
      else if(world.mountedRideData?.axis==="track")player.rotation.y=Math.atan2(
        Math.sin(world.mountedRideData.object.rotation.y),Math.cos(world.mountedRideData.object.rotation.y)
      );
      world.keys.clear();
    }else{
      const moving = move.lengthSq() > 0;
      if (moving) {
        move.normalize();
        if(move.lengthSq()>1)move.normalize();
        const speed = world.keys.has("shift") || world.touchRun ? 8.2 : 5.4;
        const step=speed*delta;
        let nextX=player.position.x+move.x*step;
        let nextZ=player.position.z+move.z*step;
        const limit=environment.playableRadius||41.2;
        const clampRadius=(x,z)=>{
          const radius=Math.hypot(x,z);
          if(radius>limit)return {x:x*limit/radius,z:z*limit/radius};
          return {x,z};
        };
        let candidate=clampRadius(nextX,player.position.z);
        if(!blockedAt(candidate.x,candidate.z))player.position.x=candidate.x;
        candidate=clampRadius(player.position.x,nextZ);
        if(!blockedAt(candidate.x,candidate.z))player.position.z=candidate.z;
        player.rotation.y=Math.atan2(move.x,move.z);
        player.userData.walkPhase+=delta*9;
      }
      const ground=surfaceAt(player.position.x,player.position.z);
      const bob=moving?Math.abs(Math.sin(player.userData.walkPhase))*0.045:0;
      player.position.y=THREE.MathUtils.lerp(player.position.y,ground-0.025+bob,Math.min(1,delta*12));
    }
    player.userData.halo.rotation.z += delta * 0.45;
    if(player.userData.floatingStar)player.userData.floatingStar.rotation.y+=delta*0.75;
    if(world.cameraMode==="first"){
      const eye=new THREE.Vector3(player.position.x,player.position.y+1.48,player.position.z);
      const lookDirection=new THREE.Vector3(
        -Math.sin(cameraState.yaw)*Math.cos(cameraState.pitch),
        Math.sin(cameraState.pitch),
        -Math.cos(cameraState.yaw)*Math.cos(cameraState.pitch)
      );
      const lookTarget=eye.clone().addScaledVector(lookDirection,18);
      camera.position.lerp(eye,Math.min(1,delta*13));
      camera.lookAt(lookTarget);
    }else{
      const horizontalDistance = Math.cos(cameraState.pitch) * cameraState.distance;
      const desiredCamera = new THREE.Vector3(
        player.position.x - Math.sin(cameraState.yaw) * horizontalDistance,
        player.position.y + Math.sin(cameraState.pitch) * cameraState.distance + 1.0,
        player.position.z + Math.cos(cameraState.yaw) * horizontalDistance
      );
      camera.position.lerp(desiredCamera, Math.min(1, delta * 5.5));
      camera.lookAt(player.position.x, player.position.y + 1.15, player.position.z);
    }
    environment.portals.forEach((portal, i) => {
      const motion = portal.userData.motion;
      motion.ring.rotation.z = Math.sin(t * 0.5 + motion.phase) * 0.08;
      motion.inner.rotation.z -= delta * 0.08;
      motion.orbit.rotation.z += delta * (i % 2 ? -0.32 : 0.32);
      motion.crystal.rotation.y += delta * 0.45;
      motion.crystal.position.y = 2.16 + Math.sin(t * 1.1 + motion.phase) * 0.11;
      motion.core.material.opacity = 0.17 + (Math.sin(t * 1.5 + motion.phase) + 1) * 0.08;
      if (motion.aura) motion.aura.intensity = 8 + (Math.sin(t * 1.8 + motion.phase) + 1) * 2.5;
    });
    world.otherPlayers.forEach(entry=>{
      entry.model.position.lerp(entry.target,Math.min(1,delta*9));
      let angle=entry.targetYaw;
      const current=entry.model.rotation.y;
      angle=current+Math.atan2(Math.sin(angle-current),Math.cos(angle-current));
      entry.model.rotation.y=THREE.MathUtils.lerp(current,angle,Math.min(1,delta*8));
      entry.model.userData.halo.rotation.z+=delta*0.38;
      if(entry.model.userData.floatingStar)entry.model.userData.floatingStar.rotation.y+=delta*0.58;
    });
    if(!world.mountedRide&&t-world.nearbyHintLast>0.34){
      world.nearbyHintLast=t;
      const nearest=environment.rideStations.map(ride=>({ride,distance:rideDistance(ride)})).sort((a,b)=>a.distance-b.distance)[0];
      let hint={label:"互動　E",name:"互動"};
      if(nearest&&nearest.distance<=nearest.ride.interactionRadius+1.25)hint={label:"搭乘　E",name:nearest.ride.name};
      else if(Math.hypot(player.position.x-environment.ticketBooth.position.x,player.position.z-environment.ticketBooth.position.z)<4.5)hint={label:"票亭　E",name:"星夢入園票亭"};
      window.dispatchEvent(new CustomEvent("starry-3d-nearby",{detail:hint}));
    }
    if(t-world.minimapLast>0.15){
      world.minimapLast=t;
      window.dispatchEvent(new CustomEvent("starry-3d-map",{detail:{x:player.position.x,z:player.position.z,yaw:cameraState.yaw}}));
    }
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(world.renderFrame);

  world.resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0];
    if (!entry) return;
    const w = Math.max(1, Math.floor(entry.contentRect.width));
    const h = Math.max(1, Math.floor(entry.contentRect.height));
    const small = w < 650;
    camera.aspect = w / h;
    cameraState.distance = small ? 10.2 : 9.5;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.0 : 1.25));
    renderer.setSize(w, h, false);
  });
  world.resizeObserver.observe(host);

  world.visibilityHandler = () => {
    world.running = !document.hidden;
    if (world.running) clock.start();
  };
  document.addEventListener("visibilitychange", world.visibilityHandler);

  host.dataset.status = "ready";
  const fallback = host.querySelector(".starry-3d-fallback");
  if (fallback) fallback.hidden = true;
  if (status) status.textContent = window.matchMedia&&window.matchMedia("(pointer: coarse)").matches ? "左側搖桿移動 · 滑動右側畫面環顧四周 · 互動按鈕使用設施" : "第一人稱自由探索 · 拖曳環顧四周 · E 互動";
  window.dispatchEvent(new CustomEvent("starry-3d-mounted"));
}

const avatarPreviews=new Map();

function disposePreviewModel(model){
 if(!model)return;
 model.parent?.remove(model);
 model.traverse(obj=>{
  if(obj.geometry)obj.geometry.dispose();
  if(obj.material){
   const mats=Array.isArray(obj.material)?obj.material:[obj.material];
   mats.forEach(mat=>{
    Object.values(mat).forEach(value=>{if(value&&value.isTexture)value.dispose()});
    mat.dispose();
   });
  }
 });
}
function mountAvatarPreview(host,options={}){
 if(!host||!host.isConnected)return false;
 disposeAvatarPreview(host);
 let renderer;
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
 }catch(error){
  host.innerHTML='<div class="avatar-preview-fallback">目前裝置無法建立 3D 預覽</div>';
  console.warn("Avatar preview renderer unavailable:",error);return false;
 }
 const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
 renderer.setSize(width,height,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.16;
 renderer.setClearColor(0x080e25,0);
 renderer.domElement.className="avatar-preview-canvas";
 renderer.domElement.setAttribute("aria-label","旅人角色 3D 即時預覽");
 host.replaceChildren(renderer.domElement);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(28,width/height,0.1,40);
 camera.position.set(0,2.38,8.2);camera.lookAt(0,1.12,0);
 scene.add(new THREE.HemisphereLight(0xdde3ff,0x151329,1.75));
 const key=new THREE.DirectionalLight(0xffe5c1,2.5);key.position.set(-3,6,5);scene.add(key);
 const fill=new THREE.DirectionalLight(0x9e8de8,1.25);fill.position.set(4,3,-3);scene.add(fill);
 const rim=new THREE.PointLight(0x76d7f4,13,12,2);rim.position.set(0,2.7,-2.5);scene.add(rim);
 const pedestal=new THREE.Group();scene.add(pedestal);
 const stone=makeMaterial(0x292747,0.34,0.68,{clearcoat:0.9});
 const gold=makeMaterial(0xf1d18e,0.2,0.85,{clearcoat:1});
 addMesh(pedestal,new THREE.CylinderGeometry(1.48,1.56,0.2,64),stone,[0,-0.16,0],null,false,true);
 const rimBand=addMesh(pedestal,new THREE.TorusGeometry(1.48,0.045,10,80),gold,[0,-0.04,0],null,false,false);rimBand.rotation.x=Math.PI/2;
 const inner=addMesh(pedestal,new THREE.TorusGeometry(1.18,0.018,6,80),makeMaterial(0x9c8bd2,0.25,0.72),[0,-0.045,0],null,false,false);inner.rotation.x=Math.PI/2;
 const backHalo=addMesh(pedestal,new THREE.TorusGeometry(1.3,0.022,8,72),makeMaterial(0x8d7bd0,0.25,0.7,{emissive:0x51418c,emissiveIntensity:0.55}),[0,1.63,-0.82],null,false,false);
 backHalo.rotation.y=0.16;
 const stars=[];
 for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2;
  const star=addMesh(pedestal,new THREE.OctahedronGeometry(0.075,1),gold,
   [Math.cos(a)*1.2,0.02,Math.sin(a)*1.2],[0.72,1.35,0.72],false,false);
  stars.push(star);
 }
 const preview={host,renderer,scene,camera,pedestal,model:null,clock:new THREE.Clock(),observer:null,options:{},manualYaw:0,manualPitch:0,pointer:{down:false,x:0,y:0}};
 preview.onPointerDown=event=>{
  preview.pointer.down=true;preview.pointer.x=event.clientX;preview.pointer.y=event.clientY;
  try{renderer.domElement.setPointerCapture(event.pointerId)}catch(error){}
 };
 preview.onPointerMove=event=>{
  if(!preview.pointer.down)return;
  const dx=event.clientX-preview.pointer.x,dy=event.clientY-preview.pointer.y;
  preview.pointer.x=event.clientX;preview.pointer.y=event.clientY;
  preview.manualYaw+=dx*0.009;
  preview.manualPitch=THREE.MathUtils.clamp(preview.manualPitch+dy*0.003,-0.22,0.22);
 };
 preview.onPointerUp=()=>{preview.pointer.down=false};
 renderer.domElement.addEventListener("pointerdown",preview.onPointerDown);
 renderer.domElement.addEventListener("pointermove",preview.onPointerMove);
 renderer.domElement.addEventListener("pointerup",preview.onPointerUp);
 renderer.domElement.addEventListener("pointercancel",preview.onPointerUp);
 avatarPreviews.set(host,preview);
 updateAvatarPreview(host,options);
 const resize=()=>{
  if(!host.isConnected)return;
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 };
 if(typeof ResizeObserver!=="undefined"){preview.observer=new ResizeObserver(resize);preview.observer.observe(host)}
 else window.addEventListener("resize",resize);
 preview.resize=resize;
 renderer.setAnimationLoop(()=>{
  if(!host.isConnected){disposeAvatarPreview(host);return}
  const t=preview.clock.getElapsedTime();
  if(preview.model){
   preview.model.rotation.y=preview.manualYaw+Math.sin(t*0.32)*0.035;
   preview.model.rotation.x=preview.manualPitch;
   preview.model.position.y=0.02+Math.sin(t*1.1)*0.025;
   if(preview.model.userData.halo)preview.model.userData.halo.rotation.z+=0.006;
   if(preview.model.userData.floatingStar)preview.model.userData.floatingStar.rotation.y+=0.012;
  }
  backHalo.rotation.z=Math.sin(t*0.28)*0.08;
  stars.forEach((star,i)=>{star.rotation.y+=0.008;star.position.y=0.02+Math.sin(t+i)*0.018});
  renderer.render(scene,camera);
 });
 return true;
}
function updateAvatarPreview(host,options={}){
 const preview=avatarPreviews.get(host);
 if(!preview){return mountAvatarPreview(host,options)}
 const avatarId=options.avatarId||"wanderer";
 const avatarType=options.avatarType||"wanderer";
 const appearance=options.appearance||{};
 const key=JSON.stringify([avatarId,avatarType,appearance]);
 if(preview.options.key===key)return true;
 const next=buildPlayer(preview.scene,avatarId,{avatarType,appearance});
 next.position.y=0.02;next.scale.setScalar(1.04);
 if(preview.model)disposePreviewModel(preview.model);
 preview.model=next;preview.options={key,avatarId,avatarType,appearance};
 return true;
}
function disposeAvatarPreview(host){
 const preview=avatarPreviews.get(host);if(!preview)return;
 preview.renderer.setAnimationLoop(null);
 preview.renderer.domElement.removeEventListener("pointerdown",preview.onPointerDown);
 preview.renderer.domElement.removeEventListener("pointermove",preview.onPointerMove);
 preview.renderer.domElement.removeEventListener("pointerup",preview.onPointerUp);
 preview.renderer.domElement.removeEventListener("pointercancel",preview.onPointerUp);
 if(preview.observer)preview.observer.disconnect();
 else if(preview.resize)window.removeEventListener("resize",preview.resize);
 if(preview.model)disposePreviewModel(preview.model);
 preview.scene.traverse(obj=>{
  if(obj.geometry)obj.geometry.dispose();
  if(obj.material){
   const mats=Array.isArray(obj.material)?obj.material:[obj.material];
   mats.forEach(mat=>{Object.values(mat).forEach(value=>{if(value&&value.isTexture)value.dispose()});mat.dispose()});
  }
 });
 preview.renderer.dispose();
 if(preview.renderer.domElement.parentNode)preview.renderer.domElement.parentNode.removeChild(preview.renderer.domElement);
 avatarPreviews.delete(host);
}

function dispose() {
  disposeWorld(activeWorld);
  activeWorld = null;
}

async function importWithTimeout(url, timeoutMs = 12000) {
  return Promise.race([
    import(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("3D 引擎載入逾時：" + url)), timeoutMs);
    })
  ]);
}

async function loadThreeEngine() {
  const sources = [
    "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js",
    "https://unpkg.com/three@0.187.0/build/three.module.js"
  ];
  let lastError = null;
  for (const url of sources) {
    try {
      THREE = await importWithTimeout(url);
      window.Starry3D = { mount, dispose, mountAvatarPreview, updateAvatarPreview, disposeAvatarPreview };
      window.dispatchEvent(new Event("starry-3d-ready"));
      return;
    } catch (error) {
      lastError = error;
      console.warn("Starry Dreamland: 3D engine source failed:", url, error);
    }
  }
  window.STARRY_3D_ERROR = lastError && lastError.message ? lastError.message : String(lastError || "未知載入錯誤");
  window.dispatchEvent(new Event("starry-3d-error"));
}
loadThreeEngine();
