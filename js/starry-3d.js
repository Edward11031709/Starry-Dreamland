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
 addMesh(group,new THREE.CylinderGeometry(radius*0.84,radius,height,20,1),materials.wall,[0,height/2+0.42,0]);
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
 addMesh(tree,new THREE.CylinderGeometry(0.13,0.2,1.28,10),materials.wood,[0,0.62,0]);
 const a=materials.foliageA||makeMaterial(0x30445f,0.94,0.02),b=materials.foliageB||makeMaterial(0x485071,0.92,0.03),c=materials.foliageC||makeMaterial(0x655b83,0.9,0.04);
 addMesh(tree,new THREE.SphereGeometry(0.68,18,14),a,[0,1.42,0],[1,1.12,0.92]);
 addMesh(tree,new THREE.SphereGeometry(0.48,16,12),b,[-0.34,1.78,0.02],[1,1,0.94]);
 addMesh(tree,new THREE.SphereGeometry(0.47,16,12),c,[0.32,1.92,-0.08],[0.96,1,0.92]);
 addMesh(tree,new THREE.SphereGeometry(0.12,10,8),materials.gold,[0.08,2.03,0.38],[1,1,0.75]);return tree;
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
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.shadowBlur=18;ctx.fillStyle="#fff0c9";
 ctx.font="bold 54px 'Noto Serif TC','Noto Sans TC',serif";ctx.fillText(meta.title,384,78);
 ctx.shadowBlur=0;ctx.fillStyle="#c9c1e7";ctx.font="26px Georgia,serif";ctx.letterSpacing="5px";ctx.fillText(meta.subtitle,384,145);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
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
 const castle=new THREE.Group();castle.position.set(0,0.68,-18.2);scene.add(castle);
 addMesh(castle,new THREE.CylinderGeometry(4.7,4.95,0.42,64),materials.darkStone,[0,0.1,0]);
 addMesh(castle,new THREE.TorusGeometry(4.66,0.09,10,72),materials.gold,[0,0.34,0]).rotation.x=Math.PI/2;
 addMesh(castle,new THREE.BoxGeometry(6.3,3.55,3.72),materials.wall,[0,2.1,0]);
 addMesh(castle,new THREE.BoxGeometry(6.55,0.22,3.94),materials.trim,[0,3.98,0]);
 addMesh(castle,new THREE.BoxGeometry(3.5,4.45,3.18),materials.wall,[0,2.58,-0.78]);
 addMesh(castle,new THREE.BoxGeometry(3.72,0.2,3.38),materials.gold,[0,4.86,-0.78]);
 [-2.95,2.95].forEach(x=>[-1.48,1.42].forEach(z=>{
  addMesh(castle,new THREE.BoxGeometry(0.42,3.35,0.48),materials.darkStone,[x,2.08,z]);
  addMesh(castle,new THREE.BoxGeometry(0.56,0.18,0.62),materials.gold,[x,3.75,z]);
 }));
 [-2.65,-1.65,-0.65,0.65,1.65,2.65].forEach(x=>[-1.82,1.82].forEach(z=>addMesh(castle,new THREE.BoxGeometry(0.44,0.34,0.42),materials.trim,[x,4.2,z])));
 const towers=[[-3.26,-1.62,3.9,0.88],[3.26,-1.62,3.9,0.88],[-3.3,1.42,3.65,0.8],[3.3,1.42,3.65,0.8],[0,-2.32,5.15,0.78]];
 towers.forEach(t=>addTower(castle,t[0],t[1],0.18,t[2],t[3],materials));
 addMesh(castle,new THREE.CylinderGeometry(1.94,1.78,0.22,12),materials.trim,[0,5.1,-0.78]);
 addMesh(castle,new THREE.ConeGeometry(1.94,1.72,12),materials.roof,[0,6.05,-0.78]);
 addMesh(castle,new THREE.SphereGeometry(0.16,16,12),materials.gold,[0,6.98,-0.78]);
 addMesh(castle,new THREE.CylinderGeometry(0.035,0.055,0.58,8),materials.gold,[0,7.33,-0.78]);
 const windowMat=new THREE.MeshStandardMaterial({color:0xffe3ad,emissive:0xffbd68,emissiveIntensity:1.55,roughness:0.22,metalness:0.08});
 [-1.95,-0.67,0.67,1.95].forEach(x=>{makeWindow(castle,x,2.62,1.9,0.34,0.82,windowMat);makeWindow(castle,x,1.52,1.9,0.27,0.48,windowMat)});
 addMesh(castle,new THREE.BoxGeometry(1.15,1.68,0.14),materials.darkStone,[0,1.48,1.91]);
 const doorArch=addMesh(castle,new THREE.TorusGeometry(0.59,0.095,10,40),materials.gold,[0,2.21,2.02]);
 [-0.78,0.78].forEach(x=>{addMesh(castle,new THREE.CylinderGeometry(0.12,0.16,1.9,14),materials.trim,[x,1.42,2]);addMesh(castle,new THREE.CylinderGeometry(0.22,0.22,0.14,14),materials.gold,[x,2.42,2])});
 for(let i=0;i<4;i++){const depth=0.48+i*0.35;addMesh(castle,new THREE.BoxGeometry(2.6+i*0.26,0.16,0.36),i%2?materials.trim:materials.darkStone,[0,0.78-i*0.075,2.15+depth])}
 const crest=addMesh(castle,new THREE.TorusGeometry(0.48,0.055,8,40),materials.gold,[0,5.42,0.92]);crest.rotation.x=Math.PI/2;
 const star=addMesh(castle,new THREE.OctahedronGeometry(0.28,1),materials.crystal,[0,5.42,0.98],[0.9,1.25,0.9]);star.rotation.z=Math.PI/4;return castle;
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
  [-3.25,3.25].forEach(x=>{
    addMesh(gate,new THREE.BoxGeometry(0.62,3.9,0.82),materials.darkStone,[x,1.95,0]);
    addMesh(gate,new THREE.BoxGeometry(0.86,0.22,1.02),materials.gold,[x,3.9,0]);
    addMesh(gate,new THREE.SphereGeometry(0.2,16,12),materials.crystal,[x,4.18,0]);
  });
  addMesh(gate,new THREE.BoxGeometry(7.05,0.48,0.9),materials.trim,[0,3.87,0]);
  addMesh(gate,new THREE.BoxGeometry(6.7,0.12,0.98),materials.gold,[0,4.2,0]);
  const title=makeLabelSprite({title:"星夢夜遊園",subtitle:"STAR DREAMLAND · NIGHT PARK"});
  if(title){title.position.set(0,4.95,0.2);title.scale.set(5.7,1.55,1);gate.add(title)}
  [-2.15,2.15].forEach(x=>{const light=new THREE.PointLight(PALETTE.gold,5,4,2);light.position.set(x,3.4,0.5);gate.add(light)});
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
  const canopy=addMesh(ride,new THREE.ConeGeometry(1.16,0.92,12),materials.trim,[0,3.98,0]);canopy.rotation.y=Math.PI/12;
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
  }
  const rideSeat=new THREE.Group();rideSeat.position.set(1.48,1.34,0);rideSeat.rotation.y=-Math.PI/2;ride.add(rideSeat);
  const sign=makeLabelSprite({title:"星光旋轉木馬",subtitle:"STARLIGHT CAROUSEL · RIDE"});
  if(sign){sign.position.set(0,5.12,0);sign.scale.set(4.4,1.16,1);root.add(sign)}
  return {id:"carousel",root,object:ride,rideSeat,axis:"y",speed:0.24};
}

function buildFerrisWheel(scene,materials,x,y,z){
  const root=new THREE.Group();root.position.set(x,y,z);scene.add(root);
  [-0.82,0.82].forEach((sx,i)=>{
    const leg=addMesh(root,new THREE.BoxGeometry(0.23,3.5,0.28),materials.silverMetal,[sx,1.6,0]);leg.rotation.z=i===0?-0.26:0.26;
    addMesh(root,new THREE.BoxGeometry(0.62,0.18,0.72),materials.gold,[sx,0.12,0]);
  });
  const wheel=new THREE.Group();wheel.position.set(0,3.45,0.18);root.add(wheel);
  addMesh(wheel,new THREE.TorusGeometry(2.62,0.085,12,80),materials.gold,[0,0,0]);
  addMesh(wheel,new THREE.TorusGeometry(2.28,0.045,8,72),materials.silver,[0,0,0]);
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;
    const spoke=addMesh(wheel,new THREE.BoxGeometry(0.075,5.18,0.09),materials.silverMetal,[0,0,0]);spoke.rotation.z=a;
    const cx=Math.cos(a)*2.62,cy=Math.sin(a)*2.62;
    const gondolaMat=makeMaterial([0x6f8fc5,0xb18bcf,0xd7ad70,0x81a9a0,0xc27ea1][i%5],0.42,0.28);
    addMesh(wheel,new THREE.BoxGeometry(0.52,0.55,0.46),gondolaMat,[cx,cy-0.08,0.18]);
    addMesh(wheel,new THREE.BoxGeometry(0.58,0.08,0.52),materials.gold,[cx,cy+0.22,0.18]);
    addMesh(wheel,new THREE.SphereGeometry(0.075,10,8),materials.crystal,[cx,cy-0.36,0.42]);
  }
  const hub=addMesh(wheel,new THREE.CylinderGeometry(0.35,0.35,0.42,20),materials.gold,[0,0,0]);hub.rotation.x=Math.PI/2;
  const sign=makeLabelSprite({title:"星河摩天輪",subtitle:"GALAXY FERRIS WHEEL"});
  if(sign){sign.position.set(0,6.6,0.22);sign.scale.set(4.1,1.1,1);root.add(sign)}
  return {object:wheel,axis:"z",speed:-0.105};
}

function buildRollerCoaster(scene,materials){
  const root=new THREE.Group();root.position.set(-24.5,0.72,-19.0);scene.add(root);
  const points=[[-2.8,0.65,1.8],[-2.3,1.7,0.8],[-1.55,3.7,0.2],[-0.45,4.0,0.1],[0.65,2.0,0.3],[1.55,0.9,1.0],[2.55,2.0,1.8],[3.05,2.55,2.2]];
  [-0.24,0.24].forEach(offset=>{
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]+offset)));
    const geometry=new THREE.TubeGeometry(curve,96,0.075,8,false);
    addMesh(root,geometry,materials.gold,null,null,true,false);
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
  const sign=makeLabelSprite({title:"星際雲霄飛車",subtitle:"COSMIC COASTER"});
  if(sign){sign.position.set(0,4.9,2.05);sign.scale.set(4.3,1.05,1);root.add(sign)}
  return root;
}

function buildArcadeStalls(scene,materials){
  const stalls=[];
  [
    [5.1,6.9,"星塵兌換所","STAR DUST REWARDS"],
    [8.25,5.45,"旅人補給站","TRAVELER SUPPLY"]
  ].forEach(([x,z,title,sub],index)=>{
    const booth=new THREE.Group();booth.position.set(x,0.72,z);scene.add(booth);
    addMesh(booth,new THREE.CylinderGeometry(1.18,1.28,0.22,32),materials.darkStone,[0,0.11,0]);
    addMesh(booth,new THREE.BoxGeometry(1.85,1.5,1.42),materials.wall,[0,0.85,0]);
    addMesh(booth,new THREE.BoxGeometry(2.0,0.15,1.55),materials.gold,[0,1.62,0]);
    const roof=addMesh(booth,new THREE.ConeGeometry(1.38,0.72,4),materials.roof,[0,2.02,0]);roof.rotation.y=Math.PI/4;
    addMesh(booth,new THREE.BoxGeometry(1.32,0.76,0.12),materials.darkStone,[0,1.0,0.73]);
    if(index===0){
      for(let k=0;k<3;k++)addMesh(booth,new THREE.OctahedronGeometry(0.22,1),[materials.crystal,materials.silver,materials.gold][k],[-0.43+k*0.43,1.05,0.84],null,false,false);
      addMesh(booth,new THREE.BoxGeometry(1.42,0.12,0.18),materials.gold,[0,0.62,0.9]);
    }else{
      addMesh(booth,new THREE.BoxGeometry(0.85,0.62,0.1),materials.wood,[-0.38,1.1,0.84]);
      addMesh(booth,new THREE.BoxGeometry(0.4,0.28,0.12),materials.crystal,[0.38,1.1,0.84],null,false,false);
    }
    const sign=makeLabelSprite({title,subtitle:sub});
    if(sign){sign.position.set(0,2.58,0.2);sign.scale.set(3.3,0.88,1);booth.add(sign)}
    stalls.push(booth);
  });
  return stalls;
}

function buildTeacupRide(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.65,2.82,0.34,48),materials.darkStone,[0,0.18,0]);
  addMesh(root,new THREE.TorusGeometry(2.7,0.11,10,64),materials.gold,[0,0.38,0]).rotation.x=Math.PI/2;
  const ride=new THREE.Group();ride.position.y=0.42;root.add(ride);
  addMesh(ride,new THREE.CylinderGeometry(0.25,0.32,2.4,16),materials.silverMetal,[0,1.2,0]);
  addMesh(ride,new THREE.CylinderGeometry(1.45,0.48,0.32,32),materials.roof,[0,2.42,0]);
  addMesh(ride,new THREE.ConeGeometry(0.68,0.62,12),materials.gold,[0,2.9,0]);
  const colors=[0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9,0xb59be5,0xe49b82];
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,cup=new THREE.Group();
    cup.position.set(Math.cos(a)*1.72,0.45,Math.sin(a)*1.72);ride.add(cup);
    const mat=makeMaterial(colors[i],0.34,0.28);
    addMesh(cup,new THREE.CylinderGeometry(0.32,0.48,0.58,20),mat,[0,0.24,0]);
    addMesh(cup,new THREE.TorusGeometry(0.39,0.055,8,28),materials.gold,[0,0.53,0]);
    addMesh(cup,new THREE.SphereGeometry(0.14,12,10),materials.lampGlow,[0,0.62,0],null,false,false);
  }
  const sign=makeLabelSprite({title:"星月茶杯",subtitle:"MOONLIGHT TEA CUPS"});
  if(sign){sign.position.set(0,4.15,0);sign.scale.set(3.5,0.92,1);root.add(sign)}
  return {object:ride,axis:"y",speed:0.34};
}

function buildDropTower(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.2,2.45,0.38,40),materials.darkStone,[0,0.2,0]);
  addMesh(root,new THREE.TorusGeometry(2.28,0.1,8,56),materials.gold,[0,0.42,0]).rotation.x=Math.PI/2;
  addMesh(root,new THREE.CylinderGeometry(0.34,0.52,7.1,16),materials.silverMetal,[0,3.95,0]);
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2,xp=Math.cos(a)*1.08,zp=Math.sin(a)*1.08;
    const leg=addMesh(root,new THREE.CylinderGeometry(0.11,0.16,6.8,10),materials.darkStone,[xp,3.6,zp]);
    leg.rotation.z=-Math.cos(a)*0.14;leg.rotation.x=Math.sin(a)*0.14;
    addMesh(root,new THREE.SphereGeometry(0.16,12,10),materials.lampGlow,[xp,7.0,zp],null,false,false);
  }
  const gondola=new THREE.Group();root.add(gondola);gondola.position.y=1.7;
  addMesh(gondola,new THREE.TorusGeometry(1.05,0.16,10,48),materials.gold,[0,0,0]);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    addMesh(gondola,new THREE.BoxGeometry(0.42,0.48,0.52),
      makeMaterial([0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9][i%4],0.38,0.22),
      [Math.cos(a)*0.95,0,Math.sin(a)*0.95]);
  }
  const sign=makeLabelSprite({title:"星際自由落體",subtitle:"GALAXY DROP"});
  if(sign){sign.position.set(0,8.8,0);sign.scale.set(3.7,0.98,1);root.add(sign)}
  return {object:gondola,axis:"lift",baseY:1.4,range:3.9,speed:0.82,phase:Math.random()*Math.PI*2};
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
    npcClothes: [makeMaterial(0x6f8fc5,0.58,0.08),makeMaterial(0xc27ea1,0.58,0.08),makeMaterial(0x7eaa9a,0.58,0.08),makeMaterial(0xd2a45f,0.58,0.08)],
    npcSkin: makeMaterial(0xf0d2b8, 0.82, 0.02)
  };

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
  addMesh(island,new THREE.DodecahedronGeometry(34,1),materials.rockLight,[0,-2.55,0],[1.06,0.5,0.92]).rotation.y=0.22;
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
      [-1,1].forEach(side=>addMesh(segment,new THREE.BoxGeometry(0.12,0.045,length+0.48),materials.roadEdge,[side*(width/2-0.08),0.052,0],null,false,false));
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
  rides.push(buildTeacupRide(scene,materials,-13,-11.5));addCollider(-13,-11.5,3.2,"星月茶杯");
  rides.push(buildDropTower(scene,materials,13,-10));addCollider(13,-10,2.7,"星際自由落體");
  rides.push(buildFerrisWheel(scene,materials,25,0.78,-17));addCollider(25,-17,3.8,"星河摩天輪");
  buildRollerCoaster(scene,materials);addCollider(-24.5,-19.0,4.8,"星際雲霄飛車");
  const ticketBooth=buildTicketBooth(scene,materials,-4.8,30.5);addCollider(-4.8,30.5,2.55,"星夢入園票亭");
  buildEntranceGate(scene,materials);
  const arcadeStalls=buildArcadeStalls(scene,materials);
  addCollider(5.1,6.9,1.35,"星塵兌換所");addCollider(8.25,5.45,1.35,"旅人補給站");
  const shootingGallery=buildShootingGallery(scene,materials,18,9);addCollider(18,9,4.45,"霓虹神射手");
  const mirrorHouse=buildMirrorHouse(scene,materials,-19,-8);addCollider(-19,-8,4.2,"幻影鏡屋");
  const interactables=[...portals,carousel.root,ticketBooth,shootingGallery,mirrorHouse];

  // Each attraction carries its own sign directly on the matching model.

  // Warm lanterns, groves and small guests add scale and life to the walkways.
  function addParkLamp(x,z,scale=1){
    const lamp=new THREE.Group();lamp.position.set(x,0.72,z);island.add(lamp);
    addMesh(lamp,new THREE.CylinderGeometry(0.075,0.12,2.65*scale,10),materials.darkStone,[0,1.32*scale,0]);
    addMesh(lamp,new THREE.CylinderGeometry(0.19,0.24,0.13,12),materials.gold,[0,2.58*scale,0]);
    addMesh(lamp,new THREE.SphereGeometry(0.2*scale,14,10),materials.lampGlow,[0,2.82*scale,0],null,false,false);
    const halo=addMesh(lamp,new THREE.TorusGeometry(0.29*scale,0.035,6,28),materials.gold,[0,2.82*scale,0]);
    halo.rotation.x=Math.PI/2;
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

  function addGuest(x,z,outfitIndex,facing=0){
    const guest=new THREE.Group();guest.position.set(x,0.62,z);guest.rotation.y=facing;island.add(guest);
    addMesh(guest,new THREE.SphereGeometry(0.27,12,10),materials.npcClothes[outfitIndex%materials.npcClothes.length],[0,0.72,0],[0.78,1.18,0.68]);
    addMesh(guest,new THREE.SphereGeometry(0.2,12,10),materials.npcSkin,[0,1.27,0.015]);
    addMesh(guest,new THREE.ConeGeometry(0.21,0.25,8),materials.npcClothes[outfitIndex%materials.npcClothes.length],[0,1.52,0]);
    return guest;
  }
  const guests=[
    addGuest(-5.5,12.5,0,0.6),addGuest(5.8,11.8,1,-0.7),
    addGuest(-17.2,5.4,2,1.2),addGuest(-25.5,3.8,3,-0.8),
    addGuest(21,-9,1,2.1),addGuest(28.3,-8.5,0,-1.7),
    addGuest(-3.2,27,3,0.2),addGuest(5.5,27.5,2,-0.3),
    addGuest(-11.2,-8,0,0.8),addGuest(14.8,-7.5,1,-1.1)
  ];

  const clouds=new THREE.Group();scene.add(clouds);
  for(let i=0;i<18;i++){
    const angle=(i/18)*Math.PI*2,radius=34+(i%4)*4.5;
    const cloud=addMesh(clouds,new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({
      color:i%2?0x7473b8:0x9d83c4,transparent:true,opacity:0.075,depthWrite:false
    }),[Math.cos(angle)*radius,-6.1-(i%3)*0.65,Math.sin(angle)*radius],[4.4+(i%3),0.72,2.5],false,false);
    cloud.userData.phase=angle;
  }
  return {materials,island,compass,compassHalo,portals,planet,planetRing,clouds,rides,guests,carousel,ticketBooth,arcadeStalls,shootingGallery,mirrorHouse,interactables,colliders,walkSegments,terrainZones,playableRadius:41.2};
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

function buildPlayer(scene,avatarId="wanderer"){
  const styles={
    wanderer:{robe:0x30466f,trim:0xf1d18e,mantle:0x6556a2,hair:0x332744,skin:0xf0d5c1,metal:0x8cbcd8},
    "moon-priestess":{robe:0x7770a7,trim:0xe6e4ff,mantle:0x9b91cf,hair:0x3b315e,skin:0xf1d8ca,metal:0xa7d9ed},
    "nebula-prince":{robe:0x265c73,trim:0xf2d28f,mantle:0x4f75a5,hair:0x261f46,skin:0xe9c9ad,metal:0x8be0db},
    "crystal-witch":{robe:0x593d75,trim:0xe7b7f0,mantle:0x34234f,hair:0x251b39,skin:0xf2d2c8,metal:0xc7a6ef},
    "astral-knight":{robe:0x536a86,trim:0xf5dda7,mantle:0x273a59,hair:0x39313b,skin:0xeacdb7,metal:0xdce6f5},
    "celestial-guardian":{robe:0xe0d9c8,trim:0xffe2a0,mantle:0x8b7ab7,hair:0xdbc8a2,skin:0xf3d9c3,metal:0xf1e8ff}
  };
  const style=styles[avatarId]||styles.wanderer;
  const player=new THREE.Group();player.name="StarryDreamlandPlayer";player.userData.avatarId=avatarId;
  const robe=makeMaterial(style.robe,0.34,0.28,{clearcoat:0.62,clearcoatRoughness:0.22});
  const mantle=makeMaterial(style.mantle,0.38,0.22,{clearcoat:0.55});
  const trim=makeMaterial(style.trim,0.2,0.78,{clearcoat:1});
  const hair=makeMaterial(style.hair,0.52,0.08);
  const skin=makeMaterial(style.skin,0.78,0.02);
  const metal=makeMaterial(style.metal,0.2,0.76,{clearcoat:1});
  const shadow=makeMaterial(0x1a1930,0.82,0.05);
  // Tailored layered robe and short mantle; no more plain sphere-only body.
  addMesh(player,new THREE.CylinderGeometry(0.25,0.48,0.98,20,2),robe,[0,0.77,0]);
  addMesh(player,new THREE.CylinderGeometry(0.28,0.31,0.12,20),trim,[0,1.19,0]);
  const cape=addMesh(player,new THREE.CylinderGeometry(0.12,0.53,0.88,20,1,true),mantle,[0,0.72,-0.16]);
  cape.rotation.x=-0.1;
  addMesh(player,new THREE.TorusGeometry(0.31,0.045,8,36),trim,[0,0.98,0]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.BoxGeometry(0.54,0.1,0.18),metal,[0,0.99,0.02]);
  addMesh(player,new THREE.OctahedronGeometry(0.12,1),trim,[0,1.0,0.13],[0.72,1.15,0.72]);
  // Boots, gloves and small shoulder guards give the silhouette readable detail.
  [-0.19,0.19].forEach(x=>{
    addMesh(player,new THREE.CylinderGeometry(0.105,0.13,0.31,12),shadow,[x,0.19,0.02]);
    addMesh(player,new THREE.TorusGeometry(0.11,0.025,6,20),trim,[x,0.31,0.02]);
    addMesh(player,new THREE.SphereGeometry(0.13,14,10),robe,[x*1.55,1.03,0],[1,0.86,0.92]);
    addMesh(player,new THREE.SphereGeometry(0.09,12,10),skin,[x*1.78,0.76,0.06]);
  });
  // Face, hair, eyes and side locks.
  addMesh(player,new THREE.SphereGeometry(0.255,24,18),skin,[0,1.48,0.025],[0.94,1.05,0.9]);
  addMesh(player,new THREE.SphereGeometry(0.27,20,14,0,Math.PI*2,0,Math.PI/2),hair,[0,1.56,-0.015],[1.04,0.86,0.98]);
  [-1,1].forEach(side=>{
    addMesh(player,new THREE.SphereGeometry(0.085,12,10),hair,[side*0.235,1.38,0.02],[0.8,1.65,0.95]);
    addMesh(player,new THREE.SphereGeometry(0.028,10,8),shadow,[side*0.095,1.5,0.242]);
  });
  addMesh(player,new THREE.SphereGeometry(0.045,12,10),skin,[0,1.41,0.238],[0.8,0.62,0.7]);
  addMesh(player,new THREE.TorusGeometry(0.285,0.045,8,36),trim,[0,1.68,0]).rotation.x=Math.PI/2;
  // Signature headpiece differs by outfit, while every free outfit remains detailed.
  if(avatarId==="crystal-witch"){
    const brim=addMesh(player,new THREE.CylinderGeometry(0.43,0.43,0.07,24),mantle,[0,1.78,0]);
    addMesh(player,new THREE.ConeGeometry(0.34,0.68,16),mantle,[0,2.12,0]);
    addMesh(player,new THREE.TorusGeometry(0.25,0.035,8,28),trim,[0,1.93,0]);
  }else if(avatarId==="astral-knight"||avatarId==="celestial-guardian"){
    addMesh(player,new THREE.CylinderGeometry(0.31,0.35,0.12,16),metal,[0,1.74,0]);
    addMesh(player,new THREE.ConeGeometry(0.18,0.48,8),trim,[0,1.99,0]);
    [-1,1].forEach(side=>{const horn=addMesh(player,new THREE.ConeGeometry(0.09,0.34,8),metal,[side*0.26,1.9,0]);horn.rotation.z=side*0.48});
  }else{
    addMesh(player,new THREE.CylinderGeometry(0.36,0.28,0.08,24),mantle,[0,1.76,0]);
    addMesh(player,new THREE.ConeGeometry(0.25,0.42,12),mantle,[0,1.98,0]);
    addMesh(player,new THREE.OctahedronGeometry(0.12,1),trim,[0,2.23,0],null,false,false);
  }
  const floatingStar=addMesh(player,new THREE.OctahedronGeometry(0.105,1),trim,[0,2.34,0],null,false,false);
  const halo=addMesh(player,new THREE.TorusGeometry(0.49,0.028,8,44),metal,[0,2.21,0]);
  halo.rotation.x=Math.PI/2;
  const shoulderGem=addMesh(player,new THREE.OctahedronGeometry(0.075,1),trim,[-0.26,1.08,0.09],null,false,false);
  const shoulderGem2=addMesh(player,new THREE.OctahedronGeometry(0.075,1),trim,[0.26,1.08,0.09],null,false,false);
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
  const cameraState = { yaw: 0, pitch: 0.24, distance: isSmall ? 10.2 : 9.5 };
  camera.position.set(0, 3.2, 42.2);
  camera.lookAt(0, 1.7, 33.0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.0 : 1.25));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "starry-3d-canvas";
  renderer.domElement.setAttribute("aria-label", "可自由探索星夢夜遊園、漫遊各主題園區並點擊挑戰星門");
  host.appendChild(renderer.domElement);

  const hemisphere = new THREE.HemisphereLight(0xdbe3ff, 0x28223f, 2.05);
  scene.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(0xffe8ca, 2.55);
  moonLight.position.set(-11, 20, 15);
  moonLight.castShadow = false;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -24;
  moonLight.shadow.camera.right = 24;
  moonLight.shadow.camera.top = 24;
  moonLight.shadow.camera.bottom = -24;
  moonLight.shadow.bias = -0.00035;
  scene.add(moonLight);

  const fillLight = new THREE.DirectionalLight(0x9ba9ff, 1.55);
  fillLight.position.set(12, 8, -12);
  scene.add(fillLight);

  const warmLight = new THREE.PointLight(0xe6b66f, 42, 24, 2);
  warmLight.position.set(0, 7, -4);
  scene.add(warmLight);

  const blueLight = new THREE.PointLight(0x6b92ef, 30, 26, 2);
  blueLight.position.set(-7, 4, 5);
  scene.add(blueLight);

  const starfield = createStarfield(scene, isSmall ? 420 : 760);
  const environment = buildEnvironment(scene);
  let player = buildPlayer(scene,host.dataset.avatar || "wanderer");
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
    host, scene, renderer, camera, starfield, environment,
    portals: environment.portals, raycaster, pointer, canvas: renderer.domElement, player,
    cameraState, keys: new Set(), mountedRide: null, minimapLast: 0,
    localUserId: host.dataset.sessionId || null, otherPlayers: new Map(),
    pointerDrag: { down: false, dragged: false, x: 0, y: 0 },
    running: true, frame: 0, lastTime: 0
  };
  activeWorld = world;

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

  function mountCarousel() {
    if(world.mountedRide)return;
    world.mountedRide=environment.carousel.rideSeat;
    player.visible=true;player.scale.setScalar(0.72);
    const status=document.getElementById("starry-3d-status");
    if(status)status.textContent="正在乘坐星光旋轉木馬 · 按 E 下車";
  }

  function dismountCarousel() {
    if(!world.mountedRide)return;
    world.mountedRide=null;
    player.visible=true;
    const root=environment.carousel.root;
    player.scale.setScalar(1);player.position.set(root.position.x+4.25,surfaceAt(root.position.x+4.25,root.position.z)-0.025,root.position.z);
    const status=document.getElementById("starry-3d-status");
    if(status)status.textContent="WASD 探索園區 · 找到設施按 E 互動";
  }

  world.onAvatarChange = event => {
    const avatarId=event.detail&&event.detail.avatarId;
    if(!avatarId||avatarId===player.userData.avatarId)return;
    const next=buildPlayer(scene,avatarId);
    next.position.copy(player.position);next.rotation.copy(player.rotation);next.visible=player.visible;
    scene.remove(player);player=next;world.player=next;
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
    let entry=world.otherPlayers.get(id);
    if(!entry||entry.avatarId!==avatarId){
      if(entry)releaseRemoteAvatar(entry);
      const model=buildPlayer(scene,avatarId);
      model.scale.setScalar(0.82);
      const nameTag=makeLabelSprite({title:String(info.nickname||"星空旅人").slice(0,12),subtitle:"ONLINE"});
      if(nameTag){nameTag.position.set(0,3.05,0);nameTag.scale.set(2.35,0.64,1);model.add(nameTag)}
      entry={model,avatarId,target:new THREE.Vector3(x,surfaceAt(x,z)-0.025,z),targetYaw:Number(info.yaw)||0,nickname:info.nickname||"星空旅人"};
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
    if(key==="e"){
      event.preventDefault();
      if(world.mountedRide){dismountCarousel();return}
      const p=player.position,ride=environment.carousel.root.position,booth=environment.ticketBooth.position;
      if(Math.hypot(p.x-ride.x,p.z-ride.z)<5.4){mountCarousel();return}
      if(Math.hypot(p.x-booth.x,p.z-booth.z)<4.2){
        window.dispatchEvent(new CustomEvent("starry-3d-action",{detail:{action:"ticket-booth"}}));
        return;
      }
    }
    if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"].includes(key)) {
      if(world.mountedRide)return;
      event.preventDefault();world.keys.add(key);
    }
  };
  world.onKeyUp = event => world.keys.delete(event.key.toLowerCase());
  world.onBlur = () => world.keys.clear();
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
        cameraState.yaw -= dx * 0.006;
        cameraState.pitch = THREE.MathUtils.clamp(cameraState.pitch + dy * 0.0035, 0.10, 0.82);
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
        window.dispatchEvent(new CustomEvent("starry-3d-portal",{detail:{gameId:target.gameId}}));
      }else if(target.action==="ride-carousel"){
        if(world.mountedRide)dismountCarousel();else mountCarousel();
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
      } else ride.object.rotation.z += delta * ride.speed;
    });
    environment.compassHalo.rotation.z += delta * 0.17;
    environment.planet.rotation.y += delta * 0.045;
    environment.planetRing.rotation.z += delta * 0.06;
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
    if(world.mountedRide){
      const mountedPosition=new THREE.Vector3();
      world.mountedRide.getWorldPosition(mountedPosition);
      player.position.copy(mountedPosition);
      player.position.y-=0.18;player.rotation.y=environment.carousel.object.rotation.y;
      world.keys.clear();
    }else{
      const moving = move.lengthSq() > 0;
      if (moving) {
        move.normalize();
        const speed = world.keys.has("shift") ? 8.2 : 5.4;
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
    const horizontalDistance = Math.cos(cameraState.pitch) * cameraState.distance;
    const desiredCamera = new THREE.Vector3(
      player.position.x - Math.sin(cameraState.yaw) * horizontalDistance,
      player.position.y + Math.sin(cameraState.pitch) * cameraState.distance + 1.0,
      player.position.z + Math.cos(cameraState.yaw) * horizontalDistance
    );
    camera.position.lerp(desiredCamera, Math.min(1, delta * 5.5));
    camera.lookAt(player.position.x, player.position.y + 1.15, player.position.z);
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
  if (status) status.textContent = "WASD 自由探索園區；找到星門即可開始挑戰";
  window.dispatchEvent(new CustomEvent("starry-3d-mounted"));
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
      window.Starry3D = { mount, dispose };
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
