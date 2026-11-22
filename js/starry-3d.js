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
function createPbrSurfaceMaps(kind,base,seam,accent,repeatX=3,repeatY=3){
  const size=512;
  const albedo=document.createElement("canvas");albedo.width=albedo.height=size;
  const height=document.createElement("canvas");height.width=height.height=size;
  const rough=document.createElement("canvas");rough.width=rough.height=size;
  const color=albedo.getContext("2d"),heightCtx=height.getContext("2d"),roughCtx=rough.getContext("2d");
  if(!color||!heightCtx||!roughCtx)return null;
  const seed=(x,y)=>Math.abs(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
  const baseColor=new THREE.Color("#"+base.replace("#",""));
  const tint=(amount)=>{
    const value=baseColor.clone().multiplyScalar(amount);
    return "#"+value.getHexString();
  };
  color.fillStyle=base;color.fillRect(0,0,size,size);
  heightCtx.fillStyle="rgb(128,128,128)";heightCtx.fillRect(0,0,size,size);
  roughCtx.fillStyle="rgb(224,224,224)";roughCtx.fillRect(0,0,size,size);

  if(kind==="stone"||kind==="paving"){
    const rowH=kind==="paving"?64:96,colW=kind==="paving"?96:128;
    for(let row=-1;row<10;row++){
      const offset=row%2?colW/2:0;
      for(let col=-1;col<7;col++){
        const x=col*colW+offset,y=row*rowH;
        const variation=0.86+seed(col,row)*0.23;
        color.fillStyle=tint(variation);color.fillRect(x+3,y+3,colW-6,rowH-6);
        const block=color.createLinearGradient(x,y,x+colW,y+rowH);
        block.addColorStop(0,"rgba(255,255,255,0.075)");
        block.addColorStop(0.48,"rgba(255,255,255,0.008)");
        block.addColorStop(1,"rgba(4,5,18,0.16)");
        color.fillStyle=block;color.fillRect(x+3,y+3,colW-6,rowH-6);
        color.strokeStyle=seam;color.lineWidth=kind==="paving"?3:2;
        color.strokeRect(x+2,y+2,colW-4,rowH-4);
        color.strokeStyle="rgba(255,255,255,0.11)";color.lineWidth=1;
        color.beginPath();color.moveTo(x+8,y+6);color.lineTo(x+colW-10,y+6);color.stroke();
        heightCtx.fillStyle="rgb(145,145,145)";heightCtx.fillRect(x+3,y+3,colW-6,rowH-6);
        heightCtx.strokeStyle="rgb(76,76,76)";
        heightCtx.lineWidth=kind==="paving"?4:3;heightCtx.strokeRect(x+2,y+2,colW-4,rowH-4);
        heightCtx.strokeStyle="rgb(174,174,174)";heightCtx.lineWidth=1;
        heightCtx.beginPath();heightCtx.moveTo(x+7,y+7);heightCtx.lineTo(x+colW-9,y+7);heightCtx.stroke();
        for(let fleck=0;fleck<22;fleck++){
          const fx=x+8+seed(col+fleck,row+3)*(colW-16);
          const fy=y+8+seed(row+fleck,col+4)*(rowH-16);
          const alpha=0.025+seed(fleck,col)*0.07;
          color.fillStyle=accent;color.globalAlpha=alpha;color.fillRect(fx,fy,1+seed(fleck,row)*2,1+seed(row,col)*2);
          heightCtx.fillStyle=seed(fleck,row)>0.5?"rgb(164,164,164)":"rgb(111,111,111)";
          heightCtx.fillRect(fx,fy,1.5,1.5);
        }
      }
    }
  }else if(kind==="roof"){
    const rowH=54,shingleW=92;
    for(let row=-1;row<12;row++)for(let col=-1;col<7;col++){
      const x=col*shingleW+(row%2?shingleW/2:0),y=row*rowH;
      const light=seed(row,col),variation=0.83+light*0.28;
      color.fillStyle=tint(variation);color.beginPath();color.roundRect(x+3,y+3,shingleW-6,rowH-7,8);color.fill();
      const glaze=color.createLinearGradient(0,y,0,y+rowH);
      glaze.addColorStop(0,"rgba(255,255,255,0.13)");glaze.addColorStop(0.54,"rgba(255,255,255,0.015)");glaze.addColorStop(1,"rgba(0,0,0,0.18)");
      color.fillStyle=glaze;color.beginPath();color.roundRect(x+3,y+3,shingleW-6,rowH-7,8);color.fill();
      color.strokeStyle=seam;color.lineWidth=2;color.beginPath();color.roundRect(x+3,y+3,shingleW-6,rowH-7,8);color.stroke();
      color.strokeStyle=accent;color.globalAlpha=0.2;color.lineWidth=2;
      color.beginPath();color.moveTo(x+12,y+9);color.lineTo(x+shingleW-12,y+9);color.stroke();color.globalAlpha=1;
      heightCtx.fillStyle="rgb(155,155,155)";heightCtx.beginPath();heightCtx.roundRect(x+3,y+3,shingleW-6,rowH-7,8);heightCtx.fill();
      heightCtx.strokeStyle="rgb(80,80,80)";heightCtx.lineWidth=3;heightCtx.beginPath();heightCtx.roundRect(x+3,y+3,shingleW-6,rowH-7,8);heightCtx.stroke();
      heightCtx.strokeStyle="rgb(184,184,184)";heightCtx.lineWidth=1;heightCtx.beginPath();heightCtx.moveTo(x+10,y+8);heightCtx.lineTo(x+shingleW-12,y+8);heightCtx.stroke();
    }
  }else if(kind==="wood"){
    const grain=color.createLinearGradient(0,0,size,0);
    grain.addColorStop(0,tint(0.78));grain.addColorStop(0.5,tint(1.02));grain.addColorStop(1,tint(0.82));
    color.fillStyle=grain;color.fillRect(0,0,size,size);
    for(let line=0;line<90;line++){
      const y=line/90*size,phase=seed(line,7)*Math.PI*2;
      color.strokeStyle=seam;color.globalAlpha=0.12+seed(line,9)*0.14;color.lineWidth=1+seed(line,11)*2;
      color.beginPath();color.moveTo(0,y);
      for(let x=0;x<=size;x+=32)color.lineTo(x,y+Math.sin(x/38+phase)*1.8);
      color.stroke();
      heightCtx.strokeStyle=line%4===0?"rgb(165,165,165)":"rgb(112,112,112)";
      heightCtx.lineWidth=line%4===0?3:1;heightCtx.beginPath();heightCtx.moveTo(0,y);heightCtx.lineTo(size,y);heightCtx.stroke();
    }
    color.globalAlpha=1;
  }else{
    for(let i=0;i<2200;i++){
      const x=seed(i,5)*size,y=seed(i,11)*size;
      const alpha=0.02+seed(i,13)*0.07;
      color.fillStyle=accent;color.globalAlpha=alpha;color.fillRect(x,y,1+seed(i,17)*2,1+seed(i,19)*2);
      heightCtx.fillStyle=seed(i,23)>0.5?"rgb(166,166,166)":"rgb(98,98,98)";
      heightCtx.fillRect(x,y,2,2);
    }
    color.globalAlpha=1;
  }

  const heightPixels=heightCtx.getImageData(0,0,size,size).data;
  const normalData=new Uint8Array(size*size*4);
  const roughData=new Uint8Array(size*size*4);
  const roughBase=kind==="roof"?0.58:kind==="paving"?0.83:kind==="wood"?0.72:0.88;
  const strength=kind==="roof"?3.2:kind==="paving"?2.6:2.1;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const left=heightPixels[(y*size+((x+size-1)%size))*4]/255;
    const right=heightPixels[(y*size+((x+1)%size))*4]/255;
    const up=heightPixels[(((y+size-1)%size)*size+x)*4]/255;
    const down=heightPixels[(((y+1)%size)*size+x)*4]/255;
    let nx=(left-right)*strength,ny=(up-down)*strength,nz=1;
    const inv=1/Math.sqrt(nx*nx+ny*ny+nz*nz);nx*=inv;ny*=inv;nz*=inv;
    normalData[i]=Math.round((nx*0.5+0.5)*255);
    normalData[i+1]=Math.round((ny*0.5+0.5)*255);
    normalData[i+2]=Math.round((nz*0.5+0.5)*255);
    normalData[i+3]=255;
    const noise=(seed(x,y)-0.5)*0.12;
    const roughness=THREE.MathUtils.clamp(roughBase+noise+(heightPixels[i]/255-0.5)*0.08,0.32,0.99);
    const value=Math.round(roughness*255);
    roughData[i]=roughData[i+1]=roughData[i+2]=value;roughData[i+3]=255;
  }
  const makeCanvasTexture=(canvas)=>{
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(repeatX,repeatY);
    texture.anisotropy=8;
    return texture;
  };
  const normalMap=new THREE.DataTexture(normalData,size,size,THREE.RGBAFormat);
  normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
  normalMap.repeat.set(repeatX,repeatY);
  normalMap.magFilter=THREE.LinearFilter;
  normalMap.minFilter=THREE.LinearMipmapLinearFilter;
  normalMap.generateMipmaps=true;
  normalMap.flipY=true;
  normalMap.anisotropy=8;
  normalMap.needsUpdate=true;
  normalMap.colorSpace=THREE.NoColorSpace;
  const roughnessMap=new THREE.DataTexture(roughData,size,size,THREE.RGBAFormat);
  roughnessMap.wrapS=roughnessMap.wrapT=THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX,repeatY);
  roughnessMap.magFilter=THREE.LinearFilter;
  roughnessMap.minFilter=THREE.LinearMipmapLinearFilter;
  roughnessMap.generateMipmaps=true;
  roughnessMap.flipY=true;
  roughnessMap.anisotropy=8;
  roughnessMap.needsUpdate=true;
  roughnessMap.colorSpace=THREE.NoColorSpace;
  return {map:makeCanvasTexture(albedo),normalMap,roughnessMap};
}

function applyPattern(material,kind,base,seam,accent,repeatX=3,repeatY=3){
  const maps=createPbrSurfaceMaps(kind,base,seam,accent,repeatX,repeatY);
  if(!maps)return material;
  material.map=maps.map;
  material.normalMap=maps.normalMap;
  material.normalScale=new THREE.Vector2(kind==="roof"?0.72:0.54,kind==="roof"?0.72:0.54);
  material.roughnessMap=maps.roughnessMap;
  material.bumpMap=null;
  material.needsUpdate=true;
  return material;
}

function createReflectionEnvironment(renderer,scene){
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext("2d");
  if(!ctx)return null;
  const sky=ctx.createLinearGradient(0,0,0,512);
  sky.addColorStop(0,"#081026");sky.addColorStop(0.36,"#182443");sky.addColorStop(0.68,"#494467");sky.addColorStop(1,"#b0917d");
  ctx.fillStyle=sky;ctx.fillRect(0,0,1024,512);
  const addSoftBox=(x,y,w,h,color,blur)=>{
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.fillStyle=color;ctx.globalAlpha=0.88;
    ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(w,h)*0.22);ctx.fill();ctx.restore();
  };
  addSoftBox(86,72,108,20,"#a7c7ff",36);
  addSoftBox(366,44,152,25,"#f7d7a0",46);
  addSoftBox(686,84,118,22,"#c5a8ff",40);
  addSoftBox(888,58,70,18,"#f4cda1",32);
  const horizon=ctx.createRadialGradient(512,422,6,512,422,460);
  horizon.addColorStop(0,"rgba(255,210,164,0.38)");
  horizon.addColorStop(0.3,"rgba(193,164,220,0.14)");
  horizon.addColorStop(1,"rgba(15,22,52,0)");
  ctx.fillStyle=horizon;ctx.fillRect(0,0,1024,512);
  const source=new THREE.CanvasTexture(canvas);
  source.colorSpace=THREE.SRGBColorSpace;
  source.mapping=THREE.EquirectangularReflectionMapping;
  let target=null,generator=null;
  try{
    generator=new THREE.PMREMGenerator(renderer);
    generator.compileEquirectangularShader();
    target=generator.fromEquirectangular(source);
    scene.environment=target.texture;
    scene.environmentIntensity=0.72;
  }catch(error){
    console.warn("Starry Dreamland: reflection environment unavailable",error);
    target?.dispose();target=null;
  }finally{
    source.dispose();
    generator?.dispose();
  }
  return target;
}



function createCinematicPostFX(renderer,width,height,isSmall){
  let target=null,quadGeometry=null,quadMaterial=null,postScene=null,disabled=false;
  try{
    const scale=isSmall?0.78:1;
    target=new THREE.WebGLRenderTarget(
      Math.max(1,Math.floor(width*renderer.getPixelRatio()*scale)),
      Math.max(1,Math.floor(height*renderer.getPixelRatio()*scale)),
      {format:THREE.RGBAFormat,type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false}
    );
    target.texture.name="StarryDreamlandLinearScene";
    target.texture.minFilter=THREE.LinearFilter;
    target.texture.magFilter=THREE.LinearFilter;
    target.texture.generateMipmaps=false;
    target.texture.colorSpace=THREE.NoColorSpace;

    postScene=new THREE.Scene();
    const postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    quadGeometry=new THREE.PlaneGeometry(2,2);
    quadMaterial=new THREE.ShaderMaterial({
      uniforms:{
        tDiffuse:{value:target.texture},
        texelSize:{value:new THREE.Vector2(1/target.width,1/target.height)},
        bloomStrength:{value:isSmall?0.28:0.38},
        vignetteStrength:{value:isSmall?0.12:0.16}
      },
      vertexShader:[
        "varying vec2 vUv;",
        "void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}"
      ].join("\n"),
      fragmentShader:[
        "uniform sampler2D tDiffuse;",
        "uniform vec2 texelSize;",
        "uniform float bloomStrength;",
        "uniform float vignetteStrength;",
        "varying vec2 vUv;",
        "vec3 brightSample(vec2 uv){",
        "  vec3 c=texture2D(tDiffuse,clamp(uv,vec2(0.0),vec2(1.0))).rgb;",
        "  float l=dot(c,vec3(0.2126,0.7152,0.0722));",
        "  float mask=smoothstep(0.68,0.94,l);",
        "  return c*mask;",
        "}",
        "void main(){",
        "  vec3 base=texture2D(tDiffuse,vUv).rgb;",
        "  vec2 r=texelSize;",
        "  vec3 glow=vec3(0.0);",
        "  glow+=brightSample(vUv+vec2( 2.0, 0.0)*r)*0.105;",
        "  glow+=brightSample(vUv+vec2(-2.0, 0.0)*r)*0.105;",
        "  glow+=brightSample(vUv+vec2( 0.0, 2.0)*r)*0.105;",
        "  glow+=brightSample(vUv+vec2( 0.0,-2.0)*r)*0.105;",
        "  glow+=brightSample(vUv+vec2( 5.0, 2.0)*r)*0.075;",
        "  glow+=brightSample(vUv+vec2(-5.0, 2.0)*r)*0.075;",
        "  glow+=brightSample(vUv+vec2( 5.0,-2.0)*r)*0.075;",
        "  glow+=brightSample(vUv+vec2(-5.0,-2.0)*r)*0.075;",
        "  glow+=brightSample(vUv+vec2( 9.0, 0.0)*r)*0.045;",
        "  glow+=brightSample(vUv+vec2(-9.0, 0.0)*r)*0.045;",
        "  glow+=brightSample(vUv+vec2( 0.0, 9.0)*r)*0.045;",
        "  glow+=brightSample(vUv+vec2( 0.0,-9.0)*r)*0.045;",
        "  vec3 color=base+glow*bloomStrength;",
        "  float vignette=smoothstep(0.24,0.88,distance(vUv,vec2(0.5)));",
        "  color*=1.0-vignette*vignetteStrength;",
        "  float luma=dot(color,vec3(0.2126,0.7152,0.0722));",
        "  color=mix(vec3(luma),color,1.055);",
        "  color=(color-0.5)*1.035+0.5;",
        "  gl_FragColor=vec4(color,1.0);",
        "  #include <tonemapping_fragment>",
        "  #include <colorspace_fragment>",
        "}"
      ].join("\n"),
      depthTest:false,depthWrite:false,toneMapped:true
    });
    postScene.add(new THREE.Mesh(quadGeometry,quadMaterial));

    return {
      target,scene:postScene,camera:postCamera,geometry:quadGeometry,material:quadMaterial,
      render(scene,camera){
        if(disabled){renderer.render(scene,camera);return false}
        const previousToneMapping=renderer.toneMapping;
        try{
          renderer.toneMapping=THREE.NoToneMapping;
          renderer.setRenderTarget(target);
          renderer.clear();
          renderer.render(scene,camera);
          renderer.setRenderTarget(null);
          renderer.toneMapping=previousToneMapping;
          renderer.clear();
          renderer.render(postScene,postCamera);
          return true;
        }catch(error){
          renderer.setRenderTarget(null);
          renderer.toneMapping=previousToneMapping;
          disabled=true;
          console.warn("Starry Dreamland: post-processing failed; using standard renderer",error);
          renderer.render(scene,camera);
          return false;
        }
      },
      setSize(w,h,pixelRatio=renderer.getPixelRatio()){
        const targetWidth=Math.max(1,Math.floor(w*pixelRatio*scale));
        const targetHeight=Math.max(1,Math.floor(h*pixelRatio*scale));
        target.setSize(targetWidth,targetHeight);
        quadMaterial.uniforms.texelSize.value.set(1/targetWidth,1/targetHeight);
      },
      dispose(){
        target.dispose();quadGeometry.dispose();quadMaterial.dispose();
      }
    };
  }catch(error){
    target?.dispose();quadGeometry?.dispose();quadMaterial?.dispose();
    console.warn("Starry Dreamland: cinematic post-processing disabled",error);
    return null;
  }
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

function makeLancetGeometry(width,height) {
  const shape=new THREE.Shape();
  shape.moveTo(-width/2,-height/2);
  shape.lineTo(width/2,-height/2);
  shape.lineTo(width/2,height*0.12);
  shape.quadraticCurveTo(width*0.46,height*0.4,0,height/2);
  shape.quadraticCurveTo(-width*0.46,height*0.4,-width/2,height*0.12);
  shape.closePath();
  return new THREE.ShapeGeometry(shape,24);
}

function makeLancetArchCurve(x,baseY,z,width,height) {
  const half=width/2;
  const shoulder=height*0.56;
  const crown=height*0.87;
  const inset=width*0.38;
  const points=[
    new THREE.Vector3(x-half,baseY,z),
    new THREE.Vector3(x-half,baseY+shoulder,z),
    new THREE.Vector3(x-inset,baseY+crown,z),
    new THREE.Vector3(x,baseY+height,z),
    new THREE.Vector3(x+inset,baseY+crown,z),
    new THREE.Vector3(x+half,baseY+shoulder,z),
    new THREE.Vector3(x+half,baseY,z)
  ];
  return new THREE.CatmullRomCurve3(points,false,"centripetal");
}
function makeWindow(parent, x, y, z, width, height, material) {
  // Recessed lancet window: the pointed crown makes the facade read as crafted Gothic fantasy architecture.
  const frame = addMesh(parent, makeLancetGeometry(width * 1.38, height * 1.24),
    makeMaterial(0x252a4a, 0.52, 0.45), [x, y, z + 0.045], null, true, true);
  const innerRim = addMesh(parent, makeLancetGeometry(width * 1.12, height * 1.08),
    makeMaterial(0x9e88c7, 0.28, 0.58), [x, y, z + 0.082], null, false, false);
  const glass = addMesh(parent, makeLancetGeometry(width, height), material,
    [x, y, z + 0.112], null, false, false);
  return [frame, innerRim, glass];
}

function addTower(parent,x,z,baseY,height,radius,materials,detail=true){
 const group=new THREE.Group();group.position.set(x,baseY,z);parent.add(group);
 addMesh(group,new THREE.CylinderGeometry(radius*1.38,radius*1.48,0.36,24),materials.darkStone,[0,0.18,0]);
 addMesh(group,new THREE.CylinderGeometry(radius*1.13,radius*1.22,0.13,24),materials.gold,[0,0.42,0]);
 addMesh(group,new THREE.CylinderGeometry(radius*0.86,radius,height,32,3),materials.wall,[0,height/2+0.48,0]);
 // Vertical stone ribs and recessed lancet windows make the shaft read as crafted masonry.
 for(let rib=0;rib<12;rib++){
  const angle=rib/12*Math.PI*2,rr=radius*0.865;
  const strip=addMesh(group,new THREE.BoxGeometry(0.052,height*0.82,0.068),rib%3===0?materials.gold:materials.silverMetal,
   [Math.cos(angle)*rr,height*0.47+0.48,Math.sin(angle)*rr],null,false,false);
  strip.rotation.y=-angle;
 }
 if(detail){
  const windowMat=new THREE.MeshStandardMaterial({color:0xffe6c3,emissive:0xffc77d,emissiveIntensity:1.55,roughness:0.3,metalness:0.08});
  [0.32,0.61,0.82].forEach((f,index)=>{
   makeWindow(group,0,height*f,radius*0.9,radius*(index===2?0.24:0.28),height*(index===2?0.13:0.15),windowMat);
   addMesh(group,new THREE.BoxGeometry(radius*0.52,0.065,0.14),materials.gold,
     [0,height*f-height*0.09,radius*1.03],null,false,false);
  });
  const balcony=addMesh(group,new THREE.TorusGeometry(radius*0.98,0.045,8,48),materials.gold,[0,height*0.76+0.48,0]);balcony.rotation.x=Math.PI/2;
  for(let post=0;post<16;post++){
   const angle=post/16*Math.PI*2,rr=radius*0.97;
   addMesh(group,new THREE.CylinderGeometry(0.018,0.026,0.24,7),materials.silverMetal,
    [Math.cos(angle)*rr,height*0.76+0.6,Math.sin(angle)*rr],null,false,false);
  }
 }
 const roofHeight=Math.max(0.72,Math.min(height*0.3,radius*1.05));
 addMesh(group,new THREE.CylinderGeometry(radius*1.12,radius*1.28,0.18,24),materials.trim,[0,height+0.56,0]);
 const spireProfile=[
  new THREE.Vector2(0,0),new THREE.Vector2(radius*1.25,0),
  new THREE.Vector2(radius*1.16,roofHeight*0.10),new THREE.Vector2(radius*0.94,roofHeight*0.22),
  new THREE.Vector2(radius*0.72,roofHeight*0.48),new THREE.Vector2(radius*0.48,roofHeight*0.73),
  new THREE.Vector2(radius*0.24,roofHeight*0.92),new THREE.Vector2(0,roofHeight)
 ];
 addMesh(group,new THREE.LatheGeometry(spireProfile,32),materials.roof,[0,height+0.64,0],null,true,true);
 for(let rib=0;rib<8;rib++){
  const angle=rib/8*Math.PI*2;
  const points=[
   new THREE.Vector3(Math.cos(angle)*radius*1.12,0.07,Math.sin(angle)*radius*1.12),
   new THREE.Vector3(Math.cos(angle)*radius*0.98,roofHeight*0.22,Math.sin(angle)*radius*0.98),
   new THREE.Vector3(Math.cos(angle)*radius*0.7,roofHeight*0.49,Math.sin(angle)*radius*0.7),
   new THREE.Vector3(Math.cos(angle)*radius*0.42,roofHeight*0.75,Math.sin(angle)*radius*0.42),
   new THREE.Vector3(Math.cos(angle)*radius*0.08,roofHeight*0.98,Math.sin(angle)*radius*0.08)
  ];
  addMesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,0.018,6,false),
   rib%2?materials.gold:materials.trim,[0,height+0.64,0],null,false,false);
 }
 [0.2,0.52,0.8].forEach((fraction,index)=>{
  const ringRadius=radius*(1.1-fraction*0.78);
  const band=addMesh(group,new THREE.TorusGeometry(ringRadius,0.022,6,40),index===1?materials.gold:materials.silverMetal,
    [0,height+0.64+roofHeight*fraction,0],null,false,false);
  band.rotation.x=Math.PI/2;
 });
 addMesh(group,new THREE.SphereGeometry(radius*0.16,16,12),materials.gold,[0,height+0.66+roofHeight,0],null,false,false);
 addMesh(group,new THREE.CylinderGeometry(radius*0.035,radius*0.045,radius*0.62,8),materials.silverMetal,
   [0,height+0.88+roofHeight,0],null,false,false);
 const finial=addMesh(group,new THREE.OctahedronGeometry(radius*0.19,1),materials.crystal,
   [0,height+1.22+roofHeight,0],[0.72,1.4,0.72],null,false,false);
 finial.rotation.z=Math.PI/4;
 const halo=addMesh(group,new THREE.TorusGeometry(radius*0.25,0.018,6,40),materials.gold,
   [0,height+1.22+roofHeight,0],null,false,false);
 halo.rotation.x=Math.PI/2;
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
 const foliageA=materials.foliageA||makeMaterial(0x405775,0.95,0.02);
 const silver=materials.silverMetal||makeMaterial(0xb8c9e2,0.3,0.52);
 const gold=materials.gold||makeMaterial(0xe9d09a,0.28,0.52);
 addMesh(tree,new THREE.CylinderGeometry(0.42,0.5,0.14,24),materials.darkStone,[0,0.07,0]);
 const rootRing=addMesh(tree,new THREE.TorusGeometry(0.39,0.035,8,48),gold,[0,0.16,0]);rootRing.rotation.x=Math.PI/2;
 const trunkProfile=[
  new THREE.Vector2(0,0),new THREE.Vector2(0.16,0),new THREE.Vector2(0.2,0.35),
  new THREE.Vector2(0.14,0.82),new THREE.Vector2(0.12,1.25),new THREE.Vector2(0.15,1.68),
  new THREE.Vector2(0.1,2.08),new THREE.Vector2(0.045,2.34),new THREE.Vector2(0,2.42)
 ];
 addMesh(tree,new THREE.LatheGeometry(trunkProfile,16),wood,[0,0.14,0]);

 // Five sculpted structural limbs share one instanced draw call.
 const branchGeometry=new THREE.CylinderGeometry(0.035,0.065,1.25,7);
 const branches=new THREE.InstancedMesh(branchGeometry,silver,5);
 const branchDummy=new THREE.Object3D();
 for(let branch=0;branch<5;branch++){
  const angle=branch/5*Math.PI*2+0.24;
  const from=new THREE.Vector3(0,1.15,0);
  const to=new THREE.Vector3(Math.cos(angle)*0.92,1.94,Math.sin(angle)*0.92);
  const direction=to.clone().sub(from);
  branchDummy.position.copy(from).add(to).multiplyScalar(0.5);
  branchDummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
  branchDummy.scale.set(1,direction.length()/1.25,1);
  branchDummy.updateMatrix();
  branches.setMatrixAt(branch,branchDummy.matrix);
 }
 branches.instanceMatrix.needsUpdate=true;
 branches.castShadow=false;branches.receiveShadow=true;
 tree.add(branches);

 // Six overlapping foliage masses share one instanced batch, with per-instance colour variation.
 const canopyGeometry=new THREE.DodecahedronGeometry(0.72,1);
 const canopyInstances=new THREE.InstancedMesh(canopyGeometry,foliageA,6);
 const canopyClusters=[
  {position:[0,1.94,0],scale:[1.22,0.78,1.12],rotation:0.12,color:0x405775},
  {position:[-0.58,1.65,0.04],scale:[0.76,0.72,0.83],rotation:0.4,color:0x526184},
  {position:[0.56,1.67,-0.06],scale:[0.78,0.7,0.82],rotation:-0.34,color:0x756b98},
  {position:[0,1.54,0.58],scale:[0.82,0.68,0.72],rotation:0.22,color:0x56658a},
  {position:[0.08,1.62,-0.58],scale:[0.78,0.7,0.74],rotation:-0.28,color:0x405775},
  {position:[0,2.36,0],scale:[0.68,0.7,0.68],rotation:0.18,color:0x756b98}
 ];
 const canopyDummy=new THREE.Object3D();
 canopyClusters.forEach((cluster,index)=>{
  canopyDummy.position.set(...cluster.position);
  canopyDummy.rotation.set(0,cluster.rotation,0);
  canopyDummy.scale.set(...cluster.scale);
  canopyDummy.updateMatrix();
  canopyInstances.setMatrixAt(index,canopyDummy.matrix);
  canopyInstances.setColorAt(index,new THREE.Color(cluster.color));
 });
 canopyInstances.instanceMatrix.needsUpdate=true;
 if(canopyInstances.instanceColor)canopyInstances.instanceColor.needsUpdate=true;
 canopyInstances.castShadow=true;canopyInstances.receiveShadow=true;
 tree.add(canopyInstances);

 // A single orbital halo and crystal crown finish the recognisable moonlit tree silhouette.
 const halo=addMesh(tree,new THREE.TorusGeometry(0.62,0.022,6,56),gold,[0,2.18,0],[1.25,1,0.88],false,false);
 halo.rotation.x=Math.PI/2;halo.rotation.z=0.18;
 const crown=addMesh(tree,new THREE.OctahedronGeometry(0.17,1),materials.crystal||silver,[0,2.62,0],[0.68,1.45,0.68],null,false,false);
 crown.rotation.z=Math.PI/4;
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

function makeChatBubbleSprite(message){
 const canvas=document.createElement("canvas");canvas.width=512;canvas.height=192;
 const ctx=canvas.getContext("2d");if(!ctx)return null;
 ctx.clearRect(0,0,512,192);
 ctx.shadowColor="rgba(3,7,24,0.55)";ctx.shadowBlur=20;
 const gradient=ctx.createLinearGradient(0,8,0,178);
 gradient.addColorStop(0,"rgba(35,34,72,0.97)");gradient.addColorStop(1,"rgba(10,19,45,0.96)");
 ctx.fillStyle=gradient;ctx.beginPath();ctx.roundRect(8,8,496,166,26);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle="rgba(231,207,153,0.95)";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(10,10,492,162,24);ctx.stroke();
 // Small tail points toward the speaker without covering the text.
 ctx.fillStyle="rgba(18,24,54,0.98)";ctx.beginPath();ctx.moveTo(224,166);ctx.lineTo(256,190);ctx.lineTo(278,166);ctx.fill();
 ctx.strokeStyle="rgba(231,207,153,0.82)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(224,166);ctx.lineTo(256,190);ctx.lineTo(278,166);ctx.stroke();
 const raw=String(message||"").replace(/\s+/g," ").trim().slice(0,180);
 ctx.font='600 30px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#fff0cf";
 const lines=[];let line="";
 for(const char of raw){
  const next=line+char;
  if(ctx.measureText(next).width>438&&line){
   lines.push(line);line=char;
   if(lines.length===3)break;
  }else line=next;
 }
 if(line&&lines.length<3)lines.push(line);
 const rendered=lines.join("").length;
 if(rendered<raw.length&&lines.length===3)lines[2]=lines[2].slice(0,Math.max(0,lines[2].length-1))+"…";
 const top=lines.length===1?92:lines.length===2?76:62;
 lines.forEach((text,i)=>ctx.fillText(text,256,top+i*39,438));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,sizeAttenuation:true});
 const sprite=new THREE.Sprite(material);sprite.scale.set(2.85,1.12,1);
 sprite.position.set(0,3.55,0.02);sprite.renderOrder=10;
 return sprite;
}

function clearChatBubble(model){
 const bubble=model&&model.userData&&model.userData.chatBubble;
 if(!bubble)return;
 model.remove(bubble);
 if(bubble.material?.map)bubble.material.map.dispose();
 if(bubble.material)bubble.material.dispose();
 model.userData.chatBubble=null;model.userData.chatBubbleUntil=0;
}
function showChatBubble(model,message,until){
 if(!model)return;
 clearChatBubble(model);
 const bubble=makeChatBubbleSprite(message);if(!bubble)return;
 model.add(bubble);model.userData.chatBubble=bubble;model.userData.chatBubbleUntil=until;
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
 // Hand-finished facade relief: narrow pilasters, stepped cornices and jewel-set bosses
 // break the broad rectangular wall into smaller architectural bays.
 [-3.05,3.05].forEach(x=>{
   addMesh(castle,new THREE.BoxGeometry(0.12,3.22,0.12),materials.silverMetal,[x,2.12,2.12]);
   addMesh(castle,new THREE.BoxGeometry(0.28,0.09,0.22),materials.gold,[x,0.62,2.16]);
   addMesh(castle,new THREE.BoxGeometry(0.25,0.08,0.2),materials.trim,[x,3.67,2.16]);
 });
 for(let bay=0;bay<5;bay++){
   const x=-2.42+bay*1.21;
   const boss=addMesh(castle,new THREE.OctahedronGeometry(0.075,1),bay%2?materials.crystal:materials.gold,
     [x,3.91,2.13],[0.7,1.25,0.7],null,false,false);
   boss.rotation.z=Math.PI/4;
   addMesh(castle,new THREE.BoxGeometry(0.56,0.035,0.035),materials.silverMetal,[x,3.79,2.13],null,false,false);
 }
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
 // A pointed double-lancet portal replaces the rounded ring, giving the entrance
 // the same Gothic silhouette language as the castle windows and tower roofs.
 addMesh(castle,new THREE.TubeGeometry(
   makeLancetArchCurve(0,1.37,2.17,1.62,1.47),56,0.078,10,false),
   materials.gold,null,null,false,false);
 addMesh(castle,new THREE.TubeGeometry(
   makeLancetArchCurve(0,1.43,2.215,1.39,1.35),56,0.027,8,false),
   materials.silverMetal,null,null,false,false);
 const doorKeystone=addMesh(castle,new THREE.OctahedronGeometry(0.105,1),materials.crystal,
   [0,2.91,2.23],[0.72,1.22,0.72],null,false,false);
 doorKeystone.rotation.z=Math.PI/4;
 const doorGlow=addMesh(castle,new THREE.CircleGeometry(0.48,48),new THREE.MeshBasicMaterial({color:0x8a75c6,transparent:true,opacity:0.32,side:THREE.DoubleSide,depthWrite:false}),[0,1.95,2.08],null,false,false);
 for(let i=0;i<5;i++){
  const width=2.7+i*0.22;
  addMesh(castle,new THREE.BoxGeometry(width,0.16,0.42),i%2?materials.trim:materials.darkStone,[0,0.86-i*0.075,2.35+i*0.39]);
  addMesh(castle,new THREE.BoxGeometry(width+0.08,0.035,0.46),materials.gold,[0,0.95-i*0.075,2.35+i*0.39],null,false,false);
 }
 // Fine twin balustrades finish the grand stair without narrowing its walking line.
 [-1,1].forEach(side=>{
   const railX=side*1.62;
   const upperRail=addMesh(castle,new THREE.BoxGeometry(0.09,0.09,2.16),materials.gold,
     [railX,1.045,3.15],null,false,false);
   upperRail.rotation.x=0.19;
   const lowerRail=addMesh(castle,new THREE.BoxGeometry(0.045,0.045,2.08),materials.silverMetal,
     [railX,0.865,3.15],null,false,false);
   lowerRail.rotation.x=0.19;
   for(let postIndex=0;postIndex<4;postIndex++){
     const z=2.42+postIndex*0.47;
     const progress=(z-2.35)/1.56;
     const treadY=0.94-progress*0.30;
     const railY=1.18-progress*0.30;
     const postHeight=railY-treadY+0.07;
     const postY=(railY+treadY)/2;
     addMesh(castle,new THREE.CylinderGeometry(0.032,0.046,postHeight,10),materials.silverMetal,
       [railX,postY,z],null,false,false);
     addMesh(castle,new THREE.CylinderGeometry(0.078,0.082,0.065,12),materials.gold,
       [railX,treadY+0.032,z],null,false,false);
     const cap=addMesh(castle,new THREE.OctahedronGeometry(0.065,1),materials.crystal,
       [railX,railY+0.055,z],[0.72,1.2,0.72],null,false,false);
     cap.rotation.z=Math.PI/4;
   }
 });
 // Five towers: the rear spire is taller to give the skyline a clear focal point.
 const towers=[[-3.32,-1.62,4.0,0.9],[3.32,-1.62,4.0,0.9],[-3.34,1.44,3.8,0.84],[3.34,1.44,3.8,0.84],[0,-2.32,7.65,1.02]];
 towers.forEach(t=>addTower(castle,t[0],t[1],0.2,t[2],t[3],materials,true));
 // Orbital rings and a star crystal crown enrich the main tower silhouette.
 const orbitA=addMesh(castle,new THREE.TorusGeometry(1.58,0.052,10,72),materials.gold,[0,7.58,-2.32]);orbitA.rotation.set(0.72,0.28,0.22);
 const orbitB=addMesh(castle,new THREE.TorusGeometry(1.16,0.032,8,64),materials.crystal,[0,8.34,-2.32]);orbitB.rotation.set(1.16,-0.5,0.12);
 const crown=addMesh(castle,new THREE.OctahedronGeometry(0.4,1),materials.crystal,[0,9.75,-2.32],[0.75,1.35,0.75]);crown.rotation.z=Math.PI/4;
 const crest=addMesh(castle,new THREE.TorusGeometry(0.52,0.055,8,48),materials.gold,[0,5.52,0.98]);crest.rotation.x=Math.PI/2;
 const star=addMesh(castle,new THREE.OctahedronGeometry(0.29,1),materials.crystal,[0,5.52,1.05],[0.9,1.35,0.9]);star.rotation.z=Math.PI/4;
 // Paired side balconies frame the rose window but deliberately leave its centre unobstructed.
 [-1,1].forEach(side=>{
  const balconyX=side*1.95;
  addMesh(castle,new THREE.BoxGeometry(1.72,0.16,0.42),materials.darkStone,[balconyX,3.18,2.23]);
  addMesh(castle,new THREE.BoxGeometry(1.82,0.055,0.48),materials.gold,[balconyX,3.28,2.23],null,false,false);
  [-0.66,-0.22,0.22,0.66].forEach(offset=>{
   addMesh(castle,new THREE.CylinderGeometry(0.027,0.035,0.43,8),materials.silverMetal,
    [balconyX+offset,3.5,2.36],null,false,false);
  });
  addMesh(castle,new THREE.BoxGeometry(1.72,0.06,0.06),materials.gold,[balconyX,3.73,2.36],null,false,false);
 });
 // A second roof tier gives the rear keep a more recognizable fairytale silhouette.
 const keepRoof=addMesh(castle,new THREE.ConeGeometry(2.42,1.36,4),materials.roof,[0,5.78,-0.78]);
 keepRoof.rotation.y=Math.PI/4;
 addMesh(castle,new THREE.TorusGeometry(1.7,0.045,8,48),materials.gold,[0,6.34,-0.78]).rotation.x=Math.PI/2;
 // Small ceremonial pennants top the four corner turrets.
 [[-3.32,-1.62],[3.32,-1.62],[-3.34,1.44],[3.34,1.44]].forEach(([x,z],i)=>{
  const pole=new THREE.Group();pole.position.set(x,5.72,z);castle.add(pole);
  addMesh(pole,new THREE.CylinderGeometry(0.025,0.035,0.82,8),materials.gold,[0,0.4,0]);
  const pennant=addMesh(pole,new THREE.ConeGeometry(0.19,0.48,3),i%2?materials.trim:materials.crystal,[0.17,0.48,0],[1,1,0.28]);
  pennant.rotation.z=Math.PI/2;
  addMesh(pole,new THREE.OctahedronGeometry(0.065,1),materials.gold,[0,0.86,0],[0.75,1.35,0.75],null,false,false);
 });
 // Cathedral gable: a clear, high silhouette with carved ribs and jewel-set lancet glazing.
 const gableShape=new THREE.Shape();
 gableShape.moveTo(-3.38,4.02);
 gableShape.lineTo(-3.28,4.3);
 gableShape.lineTo(0,6.12);
 gableShape.lineTo(3.28,4.3);
 gableShape.lineTo(3.38,4.02);
 gableShape.closePath();
 const gableGeometry=new THREE.ExtrudeGeometry(gableShape,{
  depth:0.17,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:0.045,bevelThickness:0.035,curveSegments:18
 });
 addMesh(castle,gableGeometry,materials.wall,[0,0,2.12],null,true,true);
 const gableEdge=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-3.37,4.08,2.34),new THREE.Vector3(-2.4,4.62,2.34),
  new THREE.Vector3(-1.25,5.28,2.34),new THREE.Vector3(0,6.12,2.34),
  new THREE.Vector3(1.25,5.28,2.34),new THREE.Vector3(2.4,4.62,2.34),
  new THREE.Vector3(3.37,4.08,2.34)
 ]);
 addMesh(castle,new THREE.TubeGeometry(gableEdge,72,0.075,10,false),materials.gold,null,null,false,false);
 const gableInner=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.55,4.28,2.36),new THREE.Vector3(-1.55,4.86,2.36),
  new THREE.Vector3(0,5.65,2.36),new THREE.Vector3(1.55,4.86,2.36),
  new THREE.Vector3(2.55,4.28,2.36)
 ]);
 addMesh(castle,new THREE.TubeGeometry(gableInner,56,0.028,8,false),materials.silverMetal,null,null,false,false);
 const gableWindowMat=new THREE.MeshStandardMaterial({color:0xc9c6f2,emissive:0x54458f,emissiveIntensity:0.52,roughness:0.24,metalness:0.18});
 [-1.25,1.25].forEach(x=>{
  makeWindow(castle,x,4.78,2.31,0.46,0.76,gableWindowMat);
  addMesh(castle,new THREE.BoxGeometry(0.035,0.68,0.045),materials.gold,[x,4.78,2.42],null,false,false);
  addMesh(castle,new THREE.OctahedronGeometry(0.065,1),materials.crystal,[x,5.22,2.42],[0.72,1.3,0.72],null,false,false);
 });
 const gableCrest=addMesh(castle,new THREE.OctahedronGeometry(0.25,1),materials.crystal,[0,5.87,2.39],[0.76,1.42,0.76],null,false,false);
 gableCrest.rotation.z=Math.PI/4;
 // Tapered facade buttresses, stone plinths and door leaves add depth at player eye level.
 [-1,1].forEach(side=>{
  const buttress=addMesh(castle,new THREE.CylinderGeometry(0.18,0.34,3.5,6),materials.darkStone,[side*3.16,2.14,2.24]);
  buttress.rotation.y=Math.PI/6;
  addMesh(castle,new THREE.CylinderGeometry(0.39,0.42,0.18,8),materials.gold,[side*3.16,0.43,2.24]);
  addMesh(castle,new THREE.CylinderGeometry(0.27,0.3,0.14,8),materials.trim,[side*3.16,3.91,2.24]);
  const shoulder=addMesh(castle,new THREE.OctahedronGeometry(0.2,1),materials.crystal,[side*3.16,4.12,2.24],[0.72,1.55,0.72],null,false,false);
  shoulder.rotation.z=side*0.12;
 });
 [-0.34,0.34].forEach(x=>{
  addMesh(castle,new THREE.BoxGeometry(0.61,1.24,0.065),materials.wood,[x,1.53,2.31]);
  addMesh(castle,new THREE.BoxGeometry(0.48,1.03,0.035),materials.darkStone,[x,1.54,2.36]);
  addMesh(castle,new THREE.BoxGeometry(0.035,0.92,0.022),materials.gold,[x,1.54,2.39],null,false,false);
  addMesh(castle,new THREE.SphereGeometry(0.055,12,10),materials.gold,[x+(x<0?0.19:-0.19),1.54,2.42],null,false,false);
 });
 addMesh(castle,new THREE.BoxGeometry(1.54,0.13,0.24),materials.trim,[0,0.77,2.34],null,false,false);
 const light=new THREE.PointLight(0xb9a5ff,18,20,2);light.position.set(0,5.8,1.5);castle.add(light);
 const warm=new THREE.PointLight(0xffd58e,13,14,2);warm.position.set(0,3.2,3.4);castle.add(warm);
 // A low circular garden rail gives the keep a finished base without blocking the path.
 const courtyardRing=addMesh(castle,new THREE.TorusGeometry(4.34,0.045,8,100),materials.silver,[0,0.54,0]);courtyardRing.rotation.x=Math.PI/2;
 return castle;
}


function buildObservatory(scene, x, y, z, materials) {
  const group = new THREE.Group();
  group.name="StargazerObservatory";
  group.position.set(x, y, z);
  scene.add(group);
  // A wider stepped podium gives the observatory the scale of a destination landmark.
  addMesh(group,new THREE.CylinderGeometry(2.12,2.34,0.34,48),materials.darkStone,[0,0.18,0]);
  addMesh(group,new THREE.TorusGeometry(2.08,0.075,8,80),materials.gold,[0,0.36,0]).rotation.x=Math.PI/2;
  addMesh(group,new THREE.CylinderGeometry(1.82,1.9,0.12,48),materials.top,[0,0.42,0]);
  addTower(group,0,0,0.46,3.08,0.86,materials,true);
  // The upper drum carries a ring balcony, twelve supports and a ribbed telescope dome.
  addMesh(group,new THREE.CylinderGeometry(1.18,1.3,0.22,48),materials.darkStone,[0,3.68,0]);
  const drumRing=addMesh(group,new THREE.TorusGeometry(1.24,0.075,8,72),materials.gold,[0,3.82,0]);
  drumRing.rotation.x=Math.PI/2;
  for(let rib=0;rib<12;rib++){
    const angle=rib/12*Math.PI*2,rr=1.18;
    addMesh(group,new THREE.CylinderGeometry(0.025,0.038,0.48,8),materials.silverMetal,
      [Math.cos(angle)*rr,4.02,Math.sin(angle)*rr],null,false,false);
    addMesh(group,new THREE.OctahedronGeometry(0.052,0),materials.crystal,
      [Math.cos(angle)*rr,4.3,Math.sin(angle)*rr],[0.7,1.35,0.7],null,false,false);
  }
  const dome=addMesh(group,new THREE.SphereGeometry(1.08,40,24,0,Math.PI*2,0,Math.PI/2),
    materials.silverMetal,[0,3.86,0],[1.16,0.92,1.16]);
  dome.rotation.y=0.2;
  const domeRim=addMesh(group,new THREE.TorusGeometry(1.08,0.075,10,80),materials.gold,[0,3.88,0],[1.16,1,1.16]);
  domeRim.rotation.x=Math.PI/2;
  for(let rib=0;rib<16;rib++){
    const angle=rib/16*Math.PI*2;
    const points=[
      new THREE.Vector3(Math.cos(angle)*1.12,3.9,Math.sin(angle)*1.12),
      new THREE.Vector3(Math.cos(angle)*0.98,4.2,Math.sin(angle)*0.98),
      new THREE.Vector3(Math.cos(angle)*0.68,4.55,Math.sin(angle)*0.68),
      new THREE.Vector3(Math.cos(angle)*0.3,4.72,Math.sin(angle)*0.3),
      new THREE.Vector3(0,4.82,0)
    ];
    addMesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,0.021,6,false),
      rib%2?materials.gold:materials.trim,null,null,false,false);
  }
  const crown=addMesh(group,new THREE.OctahedronGeometry(0.24,1),materials.crystal,[0,4.95,0],[0.72,1.42,0.72],null,false,false);
  crown.rotation.z=Math.PI/4;
  const telescope=new THREE.Group();telescope.position.set(0.14,4.34,0.12);telescope.rotation.z=-0.52;group.add(telescope);
  const lens=addMesh(telescope,new THREE.CylinderGeometry(0.19,0.24,1.65,24),materials.silverMetal,[0,0,0]);
  lens.rotation.x=Math.PI/2;
  addMesh(telescope,new THREE.CylinderGeometry(0.28,0.28,0.16,24),materials.gold,[0,0,0.82]);
  const eyepiece=addMesh(telescope,new THREE.TorusGeometry(0.22,0.035,8,40),materials.crystal,[0,0,0.91]);
  eyepiece.rotation.x=Math.PI/2;
  const support=addMesh(group,new THREE.CylinderGeometry(0.09,0.15,0.78,12),materials.darkStone,[0.12,3.93,0.08]);
  support.rotation.z=-0.52;
  [-1,1].forEach(side=>{
    const wing=addMesh(group,new THREE.BoxGeometry(0.24,0.68,0.34),materials.wall,[side*1.42,0.65,0.18]);
    wing.rotation.z=side*0.08;
    addMesh(group,new THREE.OctahedronGeometry(0.13,1),materials.crystal,[side*1.43,1.08,0.2],[0.7,1.3,0.7],null,false,false);
  });
  const sign=makeLabelSprite({title:"星辰觀測站",subtitle:"STARGAZER OBSERVATORY"});
  if(sign){sign.position.set(0,5.62,0.1);sign.scale.set(4.25,1.12,1);group.add(sign)}
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
  // Repeat the castle's pointed lancet profile at the park threshold so the
  // entrance gate and keep share one architectural silhouette.
  const outer=addMesh(gate,new THREE.TubeGeometry(
    makeLancetArchCurve(0,3.72,0,6.24,3.05),88,0.2,12,false),
    materials.trim,null,null,false,false);
  const inner=addMesh(gate,new THREE.TubeGeometry(
    makeLancetArchCurve(0,3.72,-0.04,5.72,2.78),80,0.075,10,false),
    materials.gold,null,null,false,false);
  const innerGlow=addMesh(gate,new THREE.TubeGeometry(
    makeLancetArchCurve(0,3.72,-0.08,5.28,2.55),72,0.028,8,false),
    materials.crystal,null,null,false,false);
  const keystone=addMesh(gate,new THREE.OctahedronGeometry(0.48,1),materials.crystal,[0,6.9,0.05],[0.8,1.45,0.8],false,false);
  keystone.rotation.z=Math.PI/4;
  addMesh(gate,new THREE.TorusGeometry(0.7,0.045,8,48),materials.gold,[0,6.18,0.05]);
  const title=makeLabelSprite({title:"星夢夜遊園",subtitle:"STAR DREAMLAND · NIGHT PARK"});
  if(title){title.position.set(0,5.48,0.28);title.scale.set(5.45,1.42,1);gate.add(title)}
  [-2.25,2.25].forEach(x=>{
    const light=new THREE.PointLight(PALETTE.gold,7,5,2);light.position.set(x,3.2,0.55);gate.add(light);
  });
  const crownLight=new THREE.PointLight(PALETTE.violet,12,8,2);crownLight.position.set(0,5.8,-0.1);gate.add(crownLight);
  // Sculpted side chapels and broad entry treads give the threshold a ceremonial scale.
  [-1,1].forEach(side=>{
    const wing=new THREE.Group();wing.position.set(side*4.18,0.12,-0.08);gate.add(wing);
    addMesh(wing,new THREE.BoxGeometry(2.15,1.22,0.56),materials.wall,[0,0.72,0]);
    addMesh(wing,new THREE.BoxGeometry(2.28,0.13,0.68),materials.gold,[0,1.37,0]);
    addMesh(wing,new THREE.BoxGeometry(2.1,0.08,0.62),materials.trim,[0,0.14,0]);
    for(let bay=0;bay<3;bay++){
      const bx=(bay-1)*0.62;
      makeWindow(wing,bx,0.79,0.3,0.27,0.62,materials.lampGlow);
      addMesh(wing,new THREE.BoxGeometry(0.035,0.68,0.08),materials.gold,[bx,0.77,0.36],null,false,false);
    }
    addTower(wing,0,0,1.42,2.25,0.34,materials,true);
    addMesh(wing,new THREE.BoxGeometry(2.34,0.11,0.72),materials.darkStone,[0,0.12,0],null,false,false);
  });
  // Low approach treads extend toward the outer arrival side; the main walking line remains open.
  for(let step=0;step<4;step++){
    const width=7.2+step*0.72,depth=0.48;
    addMesh(gate,new THREE.BoxGeometry(width,0.105,depth),step%2?materials.top:materials.darkStone,
      [0,0.08-step*0.035,0.48+step*0.49],null,false,true);
    addMesh(gate,new THREE.BoxGeometry(width-0.16,0.018,0.045),materials.gold,
      [0,0.14-step*0.035,0.68+step*0.49],null,false,false);
  }
  addMesh(gate,new THREE.CylinderGeometry(0.94,0.98,0.055,64),materials.darkStone,[0,0.2,2.78],null,false,true);
  const sealRing=addMesh(gate,new THREE.TorusGeometry(0.82,0.035,8,72),materials.gold,[0,0.24,2.78],null,false,false);
  sealRing.rotation.x=Math.PI/2;
  for(let ray=0;ray<8;ray++){
    const a=ray/8*Math.PI*2;
    const sealGem=addMesh(gate,new THREE.OctahedronGeometry(0.12,0),ray%2?materials.crystal:materials.silverMetal,
      [Math.cos(a)*0.62,0.25,2.78+Math.sin(a)*0.62],[0.68,0.25,1.45],null,false,false);
    sealGem.rotation.y=a;
  }
  return gate;
}

function buildTicketBooth(scene,materials,x,z){
  const booth=new THREE.Group();booth.name="StarDreamTicketPavilion";
  booth.position.set(x,0.72,z);booth.userData.action="ticket-booth";scene.add(booth);
  // A broad octagonal stone base and a sculpted lantern-like pavilion replace the small box kiosk.
  addMesh(booth,new THREE.CylinderGeometry(1.78,1.95,0.28,10),materials.darkStone,[0,0.14,0]);
  const baseRing=addMesh(booth,new THREE.TorusGeometry(1.76,0.08,9,72),materials.gold,[0,0.29,0]);
  baseRing.rotation.x=Math.PI/2;
  addMesh(booth,new THREE.CylinderGeometry(1.58,1.62,0.08,10),materials.top,[0,0.32,0]);
  addMesh(booth,new THREE.CylinderGeometry(1.42,1.52,1.66,10),materials.wall,[0,1.19,0]);
  addMesh(booth,new THREE.CylinderGeometry(1.48,1.52,0.13,10),materials.trim,[0,2.04,0]);
  addMesh(booth,new THREE.CylinderGeometry(1.34,1.38,0.07,10),materials.darkStone,[0,2.14,0]);

  // Eight slim pilasters and paired collars give the octagonal shell a crafted rhythm.
  for(let i=0;i<8;i++){
    const angle=i/8*Math.PI*2+Math.PI/8;
    const px=Math.cos(angle)*1.43,pz=Math.sin(angle)*1.43;
    addMesh(booth,new THREE.CylinderGeometry(0.06,0.09,1.68,8),materials.silverMetal,[px,1.18,pz],null,false,false);
    [0.42,1.98].forEach(y=>{
      addMesh(booth,new THREE.CylinderGeometry(0.12,0.12,0.085,10),materials.gold,[px,y,pz],null,false,false);
    });
    const stud=addMesh(booth,new THREE.OctahedronGeometry(0.075,1),materials.crystal,
      [px,2.11,pz],[0.72,1.35,0.72],null,false,false);
    stud.rotation.y=angle;
  }

  // A forward-facing lancet information window and a low service counter.
  addMesh(booth,makeLancetGeometry(1.42,1.35),materials.darkStone,[0,1.24,1.29],null,false,false);
  addMesh(booth,makeLancetGeometry(1.18,1.12),new THREE.MeshPhysicalMaterial({
    color:0x9eb4e2,emissive:0x322c68,emissiveIntensity:0.22,
    roughness:0.22,metalness:0.18,transparent:true,opacity:0.78,clearcoat:1,
    side:THREE.DoubleSide
  }),[0,1.24,1.32],null,false,false);
  const windowArch=addMesh(booth,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.55,1.36,1.62,1.55),56,0.055,8,false),
    materials.gold,null,null,false,false);
  const innerArch=addMesh(booth,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.62,1.39,1.37,1.39),52,0.022,6,false),
    materials.silverMetal,null,null,false,false);
  addMesh(booth,new THREE.BoxGeometry(1.62,0.13,0.52),materials.darkStone,[0,0.82,1.3]);
  addMesh(booth,new THREE.BoxGeometry(1.72,0.085,0.6),materials.gold,[0,0.91,1.35]);
  addMesh(booth,new THREE.BoxGeometry(1.48,0.055,0.38),materials.wood,[0,0.98,1.36],null,false,false);
  addMesh(booth,new THREE.OctahedronGeometry(0.13,1),materials.crystal,[0,1.39,1.38],[0.7,1.35,0.7],null,false,false);

  // A tapered multi-ring lantern roof echoes the castle spires without reading as a plain cone.
  const roofProfile=[
    new THREE.Vector2(0,0),new THREE.Vector2(1.55,0),new THREE.Vector2(1.48,0.12),
    new THREE.Vector2(1.22,0.28),new THREE.Vector2(0.92,0.52),
    new THREE.Vector2(0.62,0.78),new THREE.Vector2(0.34,1.02),
    new THREE.Vector2(0.13,1.2),new THREE.Vector2(0,1.28)
  ];
  addMesh(booth,new THREE.LatheGeometry(roofProfile,40),materials.roof,[0,2.17,0]);
  [0.16,0.48,0.78,1.05].forEach((height,index)=>{
    const radius=[1.43,1.13,0.78,0.42][index];
    const ring=addMesh(booth,new THREE.TorusGeometry(radius,0.026,6,56),
      index%2?materials.gold:materials.silverMetal,[0,2.22+height,0],null,false,false);
    ring.rotation.x=Math.PI/2;
  });
  for(let rib=0;rib<8;rib++){
    const angle=rib/8*Math.PI*2;
    const points=[
      new THREE.Vector3(Math.cos(angle)*1.48,2.28,Math.sin(angle)*1.48),
      new THREE.Vector3(Math.cos(angle)*1.12,2.64,Math.sin(angle)*1.12),
      new THREE.Vector3(Math.cos(angle)*0.72,2.99,Math.sin(angle)*0.72),
      new THREE.Vector3(Math.cos(angle)*0.32,3.32,Math.sin(angle)*0.32),
      new THREE.Vector3(0,3.49,0)
    ];
    addMesh(booth,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,0.022,6,false),
      rib%2?materials.gold:materials.silverMetal,null,null,false,false);
  }
  const roofCrown=addMesh(booth,new THREE.OctahedronGeometry(0.23,1),materials.crystal,
    [0,3.56,0],[0.72,1.5,0.72],null,false,false);
  roofCrown.rotation.z=Math.PI/4;
  const sign=makeLabelSprite({title:"星夢入園票亭",subtitle:"STARDREAM TICKETS · PARK GUIDE"});
  if(sign){sign.position.set(0,4.05,0.44);sign.scale.set(4.25,1.12,1);booth.add(sign)}

  // Four low queue posts preserve the original approach area without blocking the route.
  [-1.62,-0.54,0.54,1.62].forEach((xp,index)=>{
    const post=new THREE.Group();post.position.set(xp,0.1,2.05);booth.add(post);
    addMesh(post,new THREE.CylinderGeometry(0.08,0.12,0.62,10),materials.silverMetal,[0,0.31,0]);
    addMesh(post,new THREE.CylinderGeometry(0.17,0.17,0.09,10),materials.gold,[0,0.62,0]);
    addMesh(post,new THREE.OctahedronGeometry(0.07,1),materials.crystal,[0,0.75,0],[0.72,1.25,0.72],null,false,false);
  });
  return booth;
}

function buildCarousel(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.scale.setScalar(1.12);root.userData.action="ride-carousel";scene.add(root);
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
    [-1,1].forEach(side=>{
      addMesh(horse,new THREE.SphereGeometry(0.026,12,10),materials.darkStone,[0.72,1.12,side*0.118],[1,1,0.6],false,false);
      addMesh(horse,new THREE.SphereGeometry(0.011,8,8),materials.lampGlow,[0.731,1.13,side*0.128],null,false,false);
      addMesh(horse,new THREE.SphereGeometry(0.023,10,8),materials.darkStone,[0.87,1.015,side*0.13],[1,0.6,0.65],false,false);
    });
    const browBand=addMesh(horse,new THREE.TorusGeometry(0.18,0.018,6,24),materials.gold,[0.57,0.93,0]);
    browBand.rotation.y=Math.PI/2;
    const bridle=addMesh(horse,new THREE.TorusGeometry(0.23,0.022,6,28),materials.trim,[0.69,1.02,0]);
    bridle.rotation.y=Math.PI/2;
    addMesh(horse,new THREE.SphereGeometry(0.045,10,8),materials.crystal,[0.68,1.23,0],[0.7,1.25,0.7],null,false,false);
    // Flowing sculpted mane and tail replace the original cluster of cone-shaped tufts.
    [-1,1].forEach(side=>{
      const maneCurve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.6,1.25,side*0.075),
        new THREE.Vector3(0.48,1.32,side*0.12),
        new THREE.Vector3(0.3,1.2,side*0.16),
        new THREE.Vector3(0.12,1.02,side*0.15),
        new THREE.Vector3(-0.12,0.9,side*0.11)
      ]);
      addMesh(horse,new THREE.TubeGeometry(maneCurve,36,0.052,10,false),mane);
      const highlightCurve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.55,1.29,side*0.12),
        new THREE.Vector3(0.42,1.28,side*0.16),
        new THREE.Vector3(0.26,1.13,side*0.19),
        new THREE.Vector3(0.1,0.99,side*0.17)
      ]);
      addMesh(horse,new THREE.TubeGeometry(highlightCurve,28,0.009,6,false),materials.gold,null,null,false,false);
    });
    const forelockCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.72,1.19,0),
      new THREE.Vector3(0.76,1.35,-0.03),
      new THREE.Vector3(0.62,1.43,-0.08),
      new THREE.Vector3(0.52,1.31,-0.12)
    ]);
    addMesh(horse,new THREE.TubeGeometry(forelockCurve,24,0.045,8,false),mane);
    const tailCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.52,0.72,0),
      new THREE.Vector3(-0.69,0.66,-0.02),
      new THREE.Vector3(-0.81,0.48,-0.05),
      new THREE.Vector3(-0.79,0.28,-0.09)
    ]);
    addMesh(horse,new THREE.TubeGeometry(tailCurve,28,0.048,8,false),mane);
    const tailStrand=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56,0.7,0.035),
      new THREE.Vector3(-0.73,0.56,0.03),
      new THREE.Vector3(-0.78,0.39,0.015)
    ]);
    addMesh(horse,new THREE.TubeGeometry(tailStrand,20,0.012,6,false),materials.gold,null,null,false,false);
    // Sculpted saddle blanket, rounded leather seat and fine perimeter piping.
    const saddleLeather=makeMaterial(0x43365f,0.38,0.24,{clearcoat:0.72,clearcoatRoughness:0.18});
    addMesh(horse,new THREE.SphereGeometry(0.28,24,16),materials.trim,[0.02,0.86,0],[1.02,0.42,1.12]);
    addMesh(horse,new THREE.SphereGeometry(0.22,24,16),saddleLeather,[0.02,0.94,0],[1.02,0.34,1.04]);
    const saddlePiping=addMesh(horse,new THREE.TorusGeometry(0.21,0.018,7,40),materials.gold,[0.02,0.91,0]);
    saddlePiping.rotation.x=Math.PI/2;saddlePiping.scale.set(1.2,1.0,1.0);
    addMesh(horse,new THREE.OctahedronGeometry(0.095,1),materials.crystal,[0.03,1.11,0.24],[0.72,1.2,0.72],null,false,false);
    addMesh(horse,new THREE.TorusGeometry(0.15,0.022,6,28),materials.gold,[0.02,1.04,0.22]);
    for(let leg=0;leg<4;leg++){
      const lx=leg<2?0.27:-0.25,lz=leg%2?0.23:-0.23;
      addMesh(horse,new THREE.CylinderGeometry(0.055,0.07,0.56,12),coat,[lx,0.2,lz]);
      addMesh(horse,new THREE.TorusGeometry(0.069,0.016,6,18),materials.gold,[lx,0.075,lz]).rotation.x=Math.PI/2;
      addMesh(horse,new THREE.CylinderGeometry(0.07,0.09,0.12,12),materials.darkStone,[lx,0.02,lz]);
      addMesh(horse,new THREE.CylinderGeometry(0.075,0.082,0.035,12),materials.silverMetal,[lx,-0.035,lz],null,false,false);
    }
    addMesh(horse,new THREE.TorusGeometry(0.26,0.035,7,24),materials.gold,[0,0.78,0]);
    addMesh(horse,new THREE.TorusGeometry(0.19,0.025,6,24),materials.gold,[0.48,0.76,0]).rotation.y=Math.PI/2;
    addMesh(horse,new THREE.OctahedronGeometry(0.075,1),materials.crystal,[0.46,0.82,0.18],[0.7,1.15,0.7],null,false,false);
    addMesh(horse,new THREE.TorusGeometry(0.12,0.025,6,24),materials.trim,[0.86,1.05,0.02]);
  }
  const rideSeat=new THREE.Group();rideSeat.position.set(1.48,1.34,0);rideSeat.rotation.y=-Math.PI/2;ride.add(rideSeat);
  const sign=makeLabelSprite({title:"星光旋轉木馬",subtitle:"STARLIGHT CAROUSEL · RIDE"});
  if(sign){sign.position.set(0,5.12,0);sign.scale.set(4.4,1.16,1);root.add(sign)}
  return {id:"carousel",name:"星光旋轉木馬",action:"ride-carousel",root,object:ride,rideSeat,axis:"y",speed:0.24,interactionRadius:5.25,dismountRadius:5.55};
}

function buildFerrisWheel(scene,materials,x,y,z){
  const root=new THREE.Group();root.position.set(x,y,z);root.scale.setScalar(1.4);root.userData.action="ride-ferris";scene.add(root);
  // A broad octagonal foundation ties both supports into one intentional ride footprint.
  addMesh(root,new THREE.CylinderGeometry(1.88,2.08,0.28,48),materials.darkStone,[0,0.14,0]);
  const foundationRim=addMesh(root,new THREE.TorusGeometry(1.88,0.075,9,80),materials.gold,[0,0.29,0]);
  foundationRim.rotation.x=Math.PI/2;
  addMesh(root,new THREE.CylinderGeometry(1.68,1.72,0.07,48),materials.top,[0,0.31,0]);
  for(let mark=0;mark<12;mark++){
    const angle=mark/12*Math.PI*2,rr=1.76;
    const star=addMesh(root,new THREE.OctahedronGeometry(0.075,0),mark%3===0?materials.crystal:materials.silverMetal,
      [Math.cos(angle)*rr,0.36,Math.sin(angle)*rr],[0.72,0.28,1.35],null,false,false);
    star.rotation.y=angle;
  }
  [-0.82,0.82].forEach((sx,i)=>{
    addMesh(root,new THREE.CylinderGeometry(0.34,0.4,0.26,12),materials.darkStone,[sx,0.16,0]);
    addMesh(root,new THREE.TorusGeometry(0.31,0.045,8,28),materials.gold,[sx,0.31,0]).rotation.x=Math.PI/2;
    const leg=addMesh(root,new THREE.BoxGeometry(0.23,3.5,0.28),materials.silverMetal,[sx,1.6,0]);leg.rotation.z=i===0?-0.26:0.26;
    const inlay=addMesh(root,new THREE.BoxGeometry(0.045,3.02,0.045),materials.gold,[sx+(i===0?0.12:-0.12),1.58,0.15]);inlay.rotation.z=i===0?-0.26:0.26;
    [-1,1].forEach(side=>{
      const fluting=addMesh(root,new THREE.BoxGeometry(0.026,2.75,0.035),materials.trim,
        [sx+side*0.071,1.55,0.16],null,false,false);
      fluting.rotation.z=i===0?-0.26:0.26;
    });
    addMesh(root,new THREE.BoxGeometry(0.62,0.18,0.72),materials.gold,[sx,0.12,0]);
    addMesh(root,new THREE.CylinderGeometry(0.48,0.54,0.18,12),materials.darkStone,[sx,0.25,0]);
    const footRing=addMesh(root,new THREE.TorusGeometry(0.45,0.04,8,40),materials.silverMetal,[sx,0.35,0]);
    footRing.rotation.x=Math.PI/2;
  });
  const wheel=new THREE.Group();wheel.position.set(0,3.45,0.18);root.add(wheel);
  addMesh(wheel,new THREE.TorusGeometry(2.62,0.085,12,80),materials.gold,[0,0,0]);
  addMesh(wheel,new THREE.TorusGeometry(2.28,0.045,8,72),materials.silver,[0,0,0]);
  addMesh(wheel,new THREE.TorusGeometry(2.8,0.028,7,88),materials.crystal,[0,0,0]);
  let rideSeat=null;const gondolas=[];
  const cabinGlass=new THREE.MeshPhysicalMaterial({color:0x8fd7ee,emissive:0x203d67,emissiveIntensity:0.18,roughness:0.16,metalness:0.2,transparent:true,opacity:0.58,clearcoat:1,side:THREE.DoubleSide});
  // One shared bevelled cabin shell keeps the ten gondolas visually consistent and lightweight.
  const cabinShape=new THREE.Shape();
  cabinShape.moveTo(-0.24,-0.28);
  cabinShape.lineTo(0.24,-0.28);
  cabinShape.lineTo(0.24,0.04);
  cabinShape.quadraticCurveTo(0.24,0.2,0,0.26);
  cabinShape.quadraticCurveTo(-0.24,0.2,-0.24,0.04);
  cabinShape.closePath();
  const cabinGeometry=new THREE.ExtrudeGeometry(cabinShape,{depth:0.46,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:0.022,bevelThickness:0.022,curveSegments:16});
  cabinGeometry.translate(0,0,-0.23);
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    const spoke=addMesh(wheel,new THREE.BoxGeometry(0.075,5.18,0.09),materials.silverMetal,[0,0,0]);spoke.rotation.z=a;
    const pin=addMesh(wheel,new THREE.BoxGeometry(0.025,4.9,0.035),materials.gold,[0,0,0]);pin.rotation.z=a;
    const cx=Math.cos(a)*2.62,cy=Math.sin(a)*2.62;
    const gondola=new THREE.Group();gondola.position.set(cx,cy,0.18);wheel.add(gondola);gondolas.push(gondola);
    const gondolaMat=makeMaterial([0x6f8fc5,0xb18bcf,0xd7ad70,0x81a9a0,0xc27ea1][i%5],0.42,0.28);
    addMesh(gondola,cabinGeometry,gondolaMat,[0,-0.08,0]);
    addMesh(gondola,new THREE.TorusGeometry(0.27,0.028,7,40),materials.gold,[0,0.2,0]).rotation.x=Math.PI/2;
    // Arched glass, slim mullions and a lower sill replace the flat rectangular front window.
    addMesh(gondola,makeLancetGeometry(0.385,0.405),materials.gold,[0,-0.05,0.238],null,false,false);
    addMesh(gondola,makeLancetGeometry(0.325,0.35),cabinGlass,[0,-0.05,0.255],null,false,false);
    addMesh(gondola,new THREE.BoxGeometry(0.025,0.31,0.018),materials.gold,[0,-0.05,0.271],null,false,false);
    addMesh(gondola,new THREE.BoxGeometry(0.28,0.022,0.018),materials.gold,[0,-0.12,0.271],null,false,false);
    addMesh(gondola,new THREE.BoxGeometry(0.06,0.33,0.48),materials.trim,[-0.28,-0.05,0]);
    addMesh(gondola,new THREE.BoxGeometry(0.06,0.33,0.48),materials.trim,[0.28,-0.05,0]);
    addMesh(gondola,new THREE.BoxGeometry(0.37,0.055,0.06),materials.gold,[0,-0.2,0.27],null,false,false);
    addMesh(gondola,new THREE.BoxGeometry(0.34,0.07,0.22),materials.paving,[0,-0.25,0],null,false,false);
    addMesh(gondola,new THREE.OctahedronGeometry(0.075,1),materials.crystal,[0,-0.38,0.265],[0.72,1.25,0.72],null,false,false);
    const canopy=addMesh(gondola,new THREE.SphereGeometry(0.34,20,12,0,Math.PI*2,0,Math.PI/2),materials.trim,[0,0.2,0],[1.05,0.78,0.92]);
    const canopyRim=addMesh(gondola,new THREE.TorusGeometry(0.32,0.026,7,40),materials.gold,[0,0.2,0]);
    canopyRim.rotation.x=Math.PI/2;
    addMesh(gondola,new THREE.OctahedronGeometry(0.085,0),materials.crystal,[0,0.53,0],[0.8,1.2,0.8],null,false,false);
    addMesh(gondola,new THREE.SphereGeometry(0.075,10,8),materials.crystal,[0,-0.36,0.24]);
    const anchor=new THREE.Group();anchor.position.set(0,-0.1,0.32);gondola.add(anchor);
    if(i===0)rideSeat=anchor;
  }
  const hub=addMesh(wheel,new THREE.CylinderGeometry(0.42,0.42,0.52,24),materials.gold,[0,0,0]);hub.rotation.x=Math.PI/2;
  addMesh(wheel,new THREE.TorusGeometry(0.49,0.055,8,48),materials.trim,[0,0,0]).rotation.x=Math.PI/2;
  const hubGem=addMesh(wheel,new THREE.OctahedronGeometry(0.28,1),materials.crystal,[0,0,0.32],[0.8,1.15,0.8],null,false,false);hubGem.rotation.z=Math.PI/4;
  const sign=makeLabelSprite({title:"星河摩天輪",subtitle:"GALAXY FERRIS WHEEL · RIDE"});
  if(sign){sign.position.set(0,6.6,0.22);sign.scale.set(4.1,1.1,1);root.add(sign)}
  return {id:"ferris",name:"星河摩天輪",action:"ride-ferris",root,object:wheel,rideSeat,gondolas,axis:"z",speed:-0.105,interactionRadius:6.1,dismountRadius:6.8};
}

function buildRollerCoaster(scene,materials){
  const root=new THREE.Group();root.position.set(-24.5,0.72,-19.0);root.scale.setScalar(1.55);root.userData.action="ride-coaster";scene.add(root);
  // A small departure pavilion gives the coaster a legible boarding station and architectural scale.
  addMesh(root,new THREE.BoxGeometry(2.72,0.16,1.3),materials.darkStone,[-2.3,0.13,1.14]);
  addMesh(root,new THREE.BoxGeometry(2.58,0.045,1.16),materials.gold,[-2.3,0.23,1.14]);
  addMesh(root,new THREE.BoxGeometry(2.42,0.04,1.0),materials.top,[-2.3,0.27,1.14]);
  [-3.38,-1.22].forEach(x=>{
    [0.58,1.78].forEach(z=>{
      addMesh(root,new THREE.CylinderGeometry(0.09,0.13,2.42,10),materials.silverMetal,[x,1.42,z]);
      addMesh(root,new THREE.CylinderGeometry(0.17,0.17,0.12,10),materials.gold,[x,2.66,z]);
      addMesh(root,new THREE.OctahedronGeometry(0.12,1),materials.crystal,[x,2.83,z],[0.72,1.35,0.72],null,false,false);
    });
  });
  addMesh(root,new THREE.BoxGeometry(2.55,0.16,1.56),materials.roof,[-2.3,2.76,1.17]);
  addMesh(root,new THREE.BoxGeometry(2.7,0.075,0.16),materials.gold,[-2.3,2.66,1.97]);
  const stationArch=addMesh(root,new THREE.TubeGeometry(
    makeLancetArchCurve(-2.3,0.92,2.34,2.5,1.52),64,0.065,8,false),
    materials.gold,null,null,false,false);
  const stationArchInner=addMesh(root,new THREE.TubeGeometry(
    makeLancetArchCurve(-2.3,0.98,2.3,2.25,1.35),56,0.022,6,false),
    materials.crystal,null,null,false,false);
  for(let rail=0;rail<2;rail++){
    const z=0.74+rail*0.32;
    addMesh(root,new THREE.BoxGeometry(2.25,0.035,0.055),materials.silverMetal,[-2.3,0.47,z],null,false,false);
  }
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
  if(sign){sign.position.set(-2.3,3.75,2.44);sign.scale.set(4.0,1.02,1);root.add(sign)}
  return {id:"coaster",name:"星際雲霄飛車",action:"ride-coaster",root,object:cart,rideSeat,curve,axis:"track",progress:0,direction:1,speed:0.105,interactionRadius:7.4,dismountRadius:8.0};
}

function buildTeacupRide(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.scale.setScalar(1.08);root.userData.action="ride-teacups";scene.add(root);
  addMesh(root,new THREE.CylinderGeometry(2.65,2.82,0.34,48),materials.darkStone,[0,0.18,0]);
  addMesh(root,new THREE.TorusGeometry(2.7,0.11,10,64),materials.gold,[0,0.38,0]).rotation.x=Math.PI/2;
  const ride=new THREE.Group();ride.position.y=0.42;root.add(ride);
  addMesh(ride,new THREE.CylinderGeometry(0.25,0.32,2.4,16),materials.silverMetal,[0,1.2,0]);
  addMesh(ride,new THREE.CylinderGeometry(1.45,0.48,0.32,32),materials.roof,[0,2.42,0]);
  addMesh(ride,new THREE.ConeGeometry(0.68,0.62,12),materials.gold,[0,2.9,0]);
  const colors=[0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9,0xb59be5,0xe49b82];
  const cupProfile=[
    new THREE.Vector2(0,0),new THREE.Vector2(0.28,0),new THREE.Vector2(0.36,0.07),
    new THREE.Vector2(0.43,0.42),new THREE.Vector2(0.45,0.53),new THREE.Vector2(0.4,0.57),
    new THREE.Vector2(0.35,0.5),new THREE.Vector2(0.33,0.18),new THREE.Vector2(0.27,0.11),
    new THREE.Vector2(0,0.11)
  ];
  const cupGeometry=new THREE.LatheGeometry(cupProfile,32);
  let rideSeat=null;
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,cup=new THREE.Group();
    cup.position.set(Math.cos(a)*1.72,0.45,Math.sin(a)*1.72);ride.add(cup);
    const mat=makeMaterial(colors[i],0.34,0.28);
    addMesh(cup,new THREE.CylinderGeometry(0.48,0.52,0.075,32),materials.trim,[0,0.055,0]);
    addMesh(cup,cupGeometry,mat,[0,0.03,0]);
    addMesh(cup,new THREE.TorusGeometry(0.45,0.035,8,40),materials.gold,[0,0.56,0]);
    addMesh(cup,new THREE.TorusGeometry(0.33,0.018,6,32),materials.silver,[0,0.47,0]);
    const handle=addMesh(cup,new THREE.TorusGeometry(0.16,0.035,8,32),materials.gold,[0.39,0.29,0]);
    handle.scale.set(1,1.25,0.82);
    addMesh(cup,new THREE.OctahedronGeometry(0.055,1),materials.crystal,[0.43,0.29,0],[0.7,1.3,0.7],null,false,false);
    addMesh(cup,new THREE.TorusGeometry(0.49,0.028,6,32),materials.gold,[0,0.03,0]).rotation.x=Math.PI/2;
    addMesh(cup,new THREE.SphereGeometry(0.14,12,10),materials.lampGlow,[0,0.62,0],null,false,false);
    addMesh(cup,new THREE.OctahedronGeometry(0.085,1),materials.crystal,[0,0.78,0.18],[0.72,1.2,0.72],null,false,false);
    if(i===0){rideSeat=new THREE.Group();rideSeat.position.set(0,0.59,0);cup.add(rideSeat)}
  }
  const sign=makeLabelSprite({title:"星月茶杯",subtitle:"MOONLIGHT TEA CUPS · RIDE"});
  if(sign){sign.position.set(0,4.15,0);sign.scale.set(3.5,0.92,1);root.add(sign)}
  return {id:"teacups",name:"星月茶杯",action:"ride-teacups",root,object:ride,rideSeat,axis:"y",speed:0.34,interactionRadius:4.6,dismountRadius:5.5};
}

function buildDropTower(scene,materials,x,z){
  const root=new THREE.Group();root.position.set(x,0.78,z);root.userData.action="ride-drop";scene.add(root);
  // A broad layered plinth gives the ride a deliberate architectural footprint.
  addMesh(root,new THREE.CylinderGeometry(2.2,2.45,0.38,48),materials.darkStone,[0,0.2,0]);
  addMesh(root,new THREE.TorusGeometry(2.28,0.1,10,72),materials.gold,[0,0.42,0]).rotation.x=Math.PI/2;
  addMesh(root,new THREE.CylinderGeometry(1.98,2.05,0.08,48),materials.paving,[0,0.43,0]);
  // Central mast, fluted rails and stepped collars.
  addMesh(root,new THREE.CylinderGeometry(0.34,0.52,7.1,24,3),materials.silverMetal,[0,3.95,0]);
  for(let rib=0;rib<10;rib++){
    const angle=rib/10*Math.PI*2;
    const radius=0.43;
    const flute=addMesh(root,new THREE.BoxGeometry(0.038,6.62,0.055),rib%2?materials.gold:materials.trim,
      [Math.cos(angle)*radius,3.92,Math.sin(angle)*radius],null,false,false);
    flute.rotation.y=-angle;
  }
  [0.82,3.78,6.7].forEach((yy,index)=>{
    const radius=index===1?0.66:0.54;
    const band=addMesh(root,new THREE.TorusGeometry(radius,index===1?0.065:0.042,9,56),
      index===1?materials.gold:materials.trim,[0,yy,0]);
    band.rotation.x=Math.PI/2;
    addMesh(root,new THREE.CylinderGeometry(radius*0.9,radius*0.92,0.08,32),
      materials.darkStone,[0,yy,0]);
  });
  const supportPoints=[];
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2+Math.PI/4,xp=Math.cos(a)*1.08,zp=Math.sin(a)*1.08;
    supportPoints.push({x:xp,z:zp,a});
    const leg=addMesh(root,new THREE.CylinderGeometry(0.11,0.16,6.82,12),materials.darkStone,[xp,3.62,zp]);
    leg.rotation.z=-Math.cos(a)*0.14;leg.rotation.x=Math.sin(a)*0.14;
    const inlay=addMesh(root,new THREE.BoxGeometry(0.035,5.95,0.04),materials.gold,
      [xp+Math.cos(a)*0.1,3.62,zp+Math.sin(a)*0.1]);
    inlay.rotation.z=-Math.cos(a)*0.14;inlay.rotation.x=Math.sin(a)*0.14;
    addMesh(root,new THREE.SphereGeometry(0.16,14,10),materials.lampGlow,[xp,7.0,zp],null,false,false);
  }
  // Cross-bracing connects the four pylons into a believable steel ride frame.
  const addBrace=(start,end,radius,material)=>{
    const from=new THREE.Vector3(start[0],start[1],start[2]);
    const to=new THREE.Vector3(end[0],end[1],end[2]);
    const direction=to.clone().sub(from);
    const beam=addMesh(root,new THREE.CylinderGeometry(radius*0.78,radius,direction.length(),9),material,
      [(start[0]+end[0])/2,(start[1]+end[1])/2,(start[2]+end[2])/2],null,true,false);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    return beam;
  };
  [1.1,3.7,6.25].forEach((yy,index)=>{
    const rail=addMesh(root,new THREE.TorusGeometry(1.18,index===1?0.052:0.034,8,64),
      index===1?materials.gold:materials.silverMetal,[0,yy,0]);
    rail.rotation.x=Math.PI/2;
  });
  supportPoints.forEach(point=>{
    addBrace([0,2.45,0],[point.x*0.92,4.25,point.z*0.92],0.055,materials.silverMetal);
    addBrace([0,5.35,0],[point.x*0.96,6.45,point.z*0.96],0.042,materials.gold);
  });
  const crown=addMesh(root,new THREE.CylinderGeometry(0.72,0.88,0.2,16),materials.gold,[0,7.48,0]);
  addMesh(root,new THREE.TorusGeometry(0.72,0.055,8,48),materials.trim,[0,7.6,0]).rotation.x=Math.PI/2;
  addMesh(root,new THREE.OctahedronGeometry(0.32,1),materials.crystal,[0,7.82,0],[0.76,1.3,0.76],null,false,false);
  // The lifting ring is a complete circular platform with individual sculpted open seats.
  const gondola=new THREE.Group();root.add(gondola);gondola.position.y=1.7;
  addMesh(gondola,new THREE.TorusGeometry(1.05,0.16,12,64),materials.gold,[0,0,0]);
  addMesh(gondola,new THREE.TorusGeometry(0.9,0.045,8,56),materials.trim,[0,0.1,0]);
  const seatProfile=[
    new THREE.Vector2(0,-0.18),new THREE.Vector2(0.22,-0.18),new THREE.Vector2(0.34,-0.08),
    new THREE.Vector2(0.36,0.10),new THREE.Vector2(0.31,0.18),new THREE.Vector2(0.26,0.10),
    new THREE.Vector2(0.24,-0.055),new THREE.Vector2(0,-0.055)
  ];
  const seatShellGeometry=new THREE.LatheGeometry(seatProfile,24);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,xp=Math.cos(a)*0.93,zp=Math.sin(a)*0.93;
    const seat=new THREE.Group();seat.position.set(xp,0,zp);seat.rotation.y=-a;gondola.add(seat);
    const seatColor=[0x8bb5dd,0xd88dba,0xe6c17f,0x8fc2a9][i%4];
    const seatMaterial=makeMaterial(seatColor,0.32,0.2,{clearcoat:0.68,clearcoatRoughness:0.2});
    addMesh(seat,seatShellGeometry,seatMaterial,[0,0,0]);
    const cushion=addMesh(seat,new THREE.SphereGeometry(0.22,18,12),materials.darkStone,[0,-0.115,0],[1,0.28,1]);
    const rim=addMesh(seat,new THREE.TorusGeometry(0.34,0.024,7,36),materials.gold,[0,0.12,0]);
    rim.rotation.x=Math.PI/2;
    addMesh(seat,new THREE.OctahedronGeometry(0.065,1),materials.crystal,[0,0.19,0.32],[0.72,1.2,0.72],null,false,false);
  }
  // A clear central mount point keeps the existing ride interaction and camera behavior intact.
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
  const gableShape=new THREE.Shape();
  gableShape.moveTo(-3.58,3.62);gableShape.lineTo(-3.48,3.94);
  gableShape.lineTo(0,5.62);gableShape.lineTo(3.48,3.94);
  gableShape.lineTo(3.58,3.62);gableShape.closePath();
  const gableGeometry=new THREE.ExtrudeGeometry(gableShape,{
    depth:0.16,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:0.035,bevelThickness:0.025
  });
  addMesh(hall,gableGeometry,materials.wall,[0,0,-0.54],null,true,true);
  const gableRidge=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.5,3.78,-0.34),new THREE.Vector3(-2.1,4.45,-0.34),
    new THREE.Vector3(0,5.62,-0.34),new THREE.Vector3(2.1,4.45,-0.34),
    new THREE.Vector3(3.5,3.78,-0.34)
  ]);
  addMesh(hall,new THREE.TubeGeometry(gableRidge,64,0.065,8,false),materials.gold,null,null,false,false);
  [-1,1].forEach(side=>{
    makeWindow(hall,side*1.55,4.34,-0.34,0.36,0.68,materials.lampGlow);
    addMesh(hall,new THREE.OctahedronGeometry(0.075,1),materials.crystal,
      [side*1.55,4.77,-0.31],[0.72,1.35,0.72],null,false,false);
  });
  const gableCrest=addMesh(hall,new THREE.OctahedronGeometry(0.22,1),materials.crystal,[0,5.35,-0.31],[0.72,1.4,0.72],null,false,false);
  gableCrest.rotation.z=Math.PI/4;
  // A broad pointed entry portal frames the open shooting gallery.
  const galleryArch=addMesh(hall,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.58,0.74,5.4,2.72),72,0.095,8,false),materials.gold,null,null,false,false);
  const galleryArchInner=addMesh(hall,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.66,0.68,5.12,2.48),64,0.028,6,false),materials.crystal,null,null,false,false);
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
  if(sign){sign.position.set(0,5.85,0.1);sign.scale.set(4.8,1.12,1);hall.add(sign)}
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
  // The mirror portal is a pointed crystal threshold, matching the castle's Gothic architecture.
  const portalMaterial=new THREE.MeshPhysicalMaterial({
    color:0x7b8de1,emissive:0x303c8a,emissiveIntensity:0.42,metalness:0.18,roughness:0.2,
    transparent:true,opacity:0.62,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:0.08
  });
  addMesh(hall,makeLancetGeometry(2.22,2.6),portalMaterial,[0,0.72,0.16],null,false,false);
  addMesh(hall,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.63,0.24,2.78,2.86),72,0.16,12,false),materials.gold,null,null,false,false);
  addMesh(hall,new THREE.TubeGeometry(
    makeLancetArchCurve(0,0.72,0.19,2.48,2.62),64,0.045,8,false),materials.crystal,null,null,false,false);
  const portalCrest=addMesh(hall,new THREE.OctahedronGeometry(0.18,1),materials.crystal,
    [0,3.42,0.2],[0.72,1.35,0.72],null,false,false);
  portalCrest.rotation.z=Math.PI/4;
  const gableShape=new THREE.Shape();
  gableShape.moveTo(-3.18,4.0);gableShape.lineTo(-3.08,4.29);
  gableShape.lineTo(0,5.72);gableShape.lineTo(3.08,4.29);
  gableShape.lineTo(3.18,4.0);gableShape.closePath();
  const gableGeometry=new THREE.ExtrudeGeometry(gableShape,{
    depth:0.16,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:0.035,bevelThickness:0.025
  });
  addMesh(hall,gableGeometry,materials.wall,[0,0,-0.73],null,true,true);
  const gableRib=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.1,4.12,-0.51),new THREE.Vector3(-1.9,4.66,-0.51),
    new THREE.Vector3(0,5.72,-0.51),new THREE.Vector3(1.9,4.66,-0.51),
    new THREE.Vector3(3.1,4.12,-0.51)
  ]);
  addMesh(hall,new THREE.TubeGeometry(gableRib,64,0.06,8,false),materials.gold,null,null,false,false);
  [-1,1].forEach(side=>{
    makeWindow(hall,side*1.55,4.42,-0.5,0.34,0.62,materials.lampGlow);
    addMesh(hall,new THREE.OctahedronGeometry(0.07,1),materials.crystal,
      [side*1.55,4.83,-0.48],[0.72,1.3,0.72],null,false,false);
  });
  for(let i=0;i<5;i++){
    const shard=addMesh(hall,new THREE.BoxGeometry(0.12,2.3,0.14),materials.silverMetal,[-2.0+i,1.92,-0.68]);
    shard.rotation.z=(i-2)*0.11;
  }
  const sign=makeLabelSprite({title:"幻影鏡屋",subtitle:"MIRROR MAZE · MEMORY TRIAL"});
  if(sign){sign.position.set(0,5.9,0.2);sign.scale.set(4.4,1.08,1);hall.add(sign)}
  return hall;
}

function buildArcadeStalls(scene,materials){
  const market=new THREE.Group();
  market.name="CelestialServicePavilions";
  scene.add(market);
  const stalls=[];
  const glass=new THREE.MeshPhysicalMaterial({
    color:0xc4d9f2,roughness:0.18,metalness:0.08,transparent:true,
    opacity:0.52,clearcoat:1,clearcoatRoughness:0.08,side:THREE.DoubleSide
  });
  const gemMaterials=[
    makeMaterial(0x8edcf0,0.24,0.28,{emissive:0x245b83,emissiveIntensity:0.22,clearcoat:0.85}),
    makeMaterial(0xc9a7f3,0.22,0.26,{emissive:0x67449b,emissiveIntensity:0.2,clearcoat:0.85}),
    makeMaterial(0xf0d38e,0.24,0.3,{emissive:0x9b6b2e,emissiveIntensity:0.18,clearcoat:0.85})
  ];

  function makeStall(config){
    const root=new THREE.Group();
    root.name=config.name;
    root.position.set(config.x,0.76,config.z);
    root.userData.kind=config.kind;
    market.add(root);

    // The former striped market awning is replaced by a small permanent stone-and-metal pavilion.
    addMesh(root,new THREE.CylinderGeometry(1.16,1.28,0.28,10),materials.darkStone,[0,0.14,0]);
    const plinthRing=addMesh(root,new THREE.TorusGeometry(1.13,0.06,8,64),materials.gold,[0,0.29,0]);
    plinthRing.rotation.x=Math.PI/2;
    addMesh(root,new THREE.CylinderGeometry(1.02,1.04,0.075,10),materials.top,[0,0.31,0]);

    // Recessed rear wall and pointed front display aperture.
    addMesh(root,new THREE.BoxGeometry(1.72,1.78,0.2),materials.wall,[0,1.34,-0.52]);
    addMesh(root,makeLancetGeometry(1.43,1.35),materials.darkStone,[0,1.58,-0.395],null,false,false);
    addMesh(root,makeLancetGeometry(1.22,1.14),glass,[0,1.58,-0.36],null,false,false);
    const aperture=addMesh(root,new THREE.TubeGeometry(
      makeLancetArchCurve(0,0.88,0.02,1.78,1.58),56,0.062,8,false),
      materials.gold,null,null,false,false);
    const apertureInset=addMesh(root,new THREE.TubeGeometry(
      makeLancetArchCurve(0,0.93,-0.045,1.56,1.45),52,0.022,6,false),
      materials.silverMetal,null,null,false,false);

    // Four narrow supports, bevelled capitals and restrained crystal finials.
    [-1,1].forEach(side=>{
      [-0.22,0.22].forEach(depth=>{
        addMesh(root,new THREE.CylinderGeometry(0.082,0.13,2.12,10),materials.silverMetal,
          [side*0.91,1.25,depth],null,true,false);
        addMesh(root,new THREE.CylinderGeometry(0.16,0.16,0.12,10),materials.gold,
          [side*0.91,2.35,depth],null,false,false);
        const capital=addMesh(root,new THREE.OctahedronGeometry(0.11,1),materials.crystal,
          [side*0.91,2.51,depth],[0.72,1.35,0.72],null,false,false);
        capital.rotation.z=side*Math.PI/4;
      });
    });

    // A compact service counter sits within the pavilion footprint.
    addMesh(root,new THREE.BoxGeometry(1.52,0.56,0.48),materials.darkStone,[0,0.73,0.44]);
    addMesh(root,new THREE.BoxGeometry(1.62,0.09,0.56),materials.gold,[0,1.055,0.46]);
    addMesh(root,new THREE.BoxGeometry(1.44,0.035,0.42),materials.wood,[0,1.11,0.46],null,false,false);
    addMesh(root,new THREE.BoxGeometry(1.34,0.045,0.05),materials.trim,[0,0.55,0.7],null,false,false);

    // A compact octagonal roof and crystal crown complete the silhouette without an awning.
    addMesh(root,new THREE.CylinderGeometry(1.18,1.31,0.16,10),materials.trim,[0,2.63,-0.02]);
    const roof=addMesh(root,new THREE.ConeGeometry(1.32,0.82,8),materials.roof,[0,3.08,-0.02]);
    roof.rotation.y=Math.PI/8;
    const roofBand=addMesh(root,new THREE.TorusGeometry(1.12,0.035,7,48),materials.gold,[0,2.72,-0.02]);
    roofBand.rotation.x=Math.PI/2;
    addMesh(root,new THREE.CylinderGeometry(0.13,0.19,0.22,10),materials.gold,[0,3.55,-0.02]);
    const crown=addMesh(root,new THREE.OctahedronGeometry(0.22,1),materials.crystal,
      [0,3.78,-0.02],[0.72,1.45,0.72],null,false,false);
    crown.rotation.z=Math.PI/4;

    const sign=makeLabelSprite({title:config.title,subtitle:config.subtitle});
    if(sign){sign.position.set(0,3.05,0.72);sign.scale.set(3.25,0.87,1);root.add(sign)}

    if(config.kind==="exchange"){
      // Three crystal samples are displayed in individual glass housings.
      [-0.42,0,0.42].forEach((x,index)=>{
        const caseGroup=new THREE.Group();caseGroup.position.set(x,1.24,0.48);root.add(caseGroup);
        addMesh(caseGroup,new THREE.CylinderGeometry(0.12,0.14,0.28,20),glass,[0,0.14,0],null,false,false);
        addMesh(caseGroup,new THREE.TorusGeometry(0.13,0.018,6,24),materials.gold,[0,0.29,0],null,false,false);
        const gem=addMesh(caseGroup,new THREE.OctahedronGeometry(0.105+index*0.018,1),
          gemMaterials[index],[0,0.18,0.01],[0.72,1.4,0.72],null,false,false);
        gem.rotation.y=index*0.7;
      });
      addMesh(root,new THREE.OctahedronGeometry(0.13,1),materials.crystal,
        [0.68,1.44,0.43],[0.72,1.45,0.72],null,false,false);
    }else{
      // The supply pavilion displays travel elixirs on a clean built-in shelf.
      [-0.48,0.48].forEach((x,index)=>{
        const bottle=new THREE.Group();bottle.position.set(x,1.17,0.49);root.add(bottle);
        addMesh(bottle,new THREE.CylinderGeometry(0.09,0.12,0.31,16),glass,[0,0.16,0],null,false,false);
        addMesh(bottle,new THREE.SphereGeometry(0.095,14,12),gemMaterials[index],[0,0.36,0],[0.9,1.1,0.9],null,false,false);
        addMesh(bottle,new THREE.CylinderGeometry(0.045,0.05,0.09,10),materials.gold,[0,0.44,0],null,false,false);
        addMesh(bottle,new THREE.TorusGeometry(0.12,0.018,6,24),materials.silverMetal,[0,0.045,0],null,false,false);
      });
      addMesh(root,new THREE.OctahedronGeometry(0.14,1),materials.crystal,[0,1.38,0.49],[0.72,1.4,0.72],null,false,false);
    }

    const lamp=new THREE.PointLight(config.light,1.65,3.8,2);
    lamp.position.set(0,1.92,0.7);root.add(lamp);
    return root;
  }

  stalls.push(makeStall({
    name:"StardustExchangePavilion",kind:"exchange",x:5.1,z:6.9,
    title:"星塵兌換所",subtitle:"STARDUST EXCHANGE",
    panel:makeMaterial(0x574879,0.4,0.28,{emissive:0x21143b,emissiveIntensity:0.12}),
    light:0xe6bdff
  }));
  stalls.push(makeStall({
    name:"TravelerSupplyPavilion",kind:"supplies",x:8.25,z:5.45,
    title:"旅人補給站",subtitle:"TRAVELER SUPPLIES",
    panel:makeMaterial(0x42617a,0.42,0.24,{emissive:0x102f49,emissiveIntensity:0.1}),
    light:0x9edcf4
  }));

  return {root:market,stalls};
}

function addReflectingPool(parent,materials,x,z){
 const pool=new THREE.Group();pool.name="MoonlitReflectingPool";pool.position.set(x,0.72,z);parent.add(pool);
 addMesh(pool,new THREE.CylinderGeometry(1.13,1.28,0.24,56),materials.darkStone,[0,0.12,0],[1.12,1,0.88]);
 const outerRim=addMesh(pool,new THREE.TorusGeometry(1.12,0.09,10,72),materials.gold,[0,0.25,0],[1.12,1,0.88],false,false);
 outerRim.rotation.x=Math.PI/2;
 const innerRim=addMesh(pool,new THREE.TorusGeometry(0.94,0.035,8,72),materials.silverMetal,[0,0.27,0],[1.12,1,0.88],false,false);
 innerRim.rotation.x=Math.PI/2;
 addMesh(pool,new THREE.CylinderGeometry(0.98,0.98,0.035,56),materials.water,[0,0.25,0],[1.12,1,0.88],false,true);
 for(let ripple=0;ripple<3;ripple++){
  const ring=addMesh(pool,new THREE.TorusGeometry(0.28+ripple*0.19,0.012,5,48),materials.crystal,
   [0,0.28+ripple*0.003,0],[1.12,1,0.88],false,false);
  ring.rotation.x=Math.PI/2;
 }
 addMesh(pool,new THREE.CylinderGeometry(0.22,0.3,0.2,16),materials.trim,[0,0.42,0]);
 addMesh(pool,new THREE.OctahedronGeometry(0.2,1),materials.crystal,[0,0.68,0],[0.72,1.55,0.72],null,false,false);
 for(let gem=0;gem<8;gem++){
  const angle=gem/8*Math.PI*2,rr=0.72;
  addMesh(pool,new THREE.OctahedronGeometry(0.07,1),gem%2?materials.gold:materials.crystal,
   [Math.cos(angle)*rr,0.35,Math.sin(angle)*rr],[0.7,1.35,0.7],null,false,false);
 }
 return pool;
}

function buildEnvironment(scene) {
  const materials = {
    rock: makeMaterial(0x211e39, 0.92, 0.12),
    rockLight: makeMaterial(0x39345d, 0.84, 0.18),
    wall: makeMaterial(0x625a7d, 0.66, 0.12, {clearcoat:0.36,clearcoatRoughness:0.3}),
    roof: makeMaterial(0x302b4e, 0.4, 0.38, {clearcoat:0.62,clearcoatRoughness:0.2}),
    trim: makeMaterial(0xc4b9df, 0.31, 0.48, {clearcoat:0.82}),
    gold: makeMaterial(0xf0d49a, 0.3, 0.5, {clearcoat:0.9,clearcoatRoughness:0.17}),
    silver: makeMaterial(0xd8e1f1, 0.32, 0.42, {clearcoat:0.82}),
    silverMetal: new THREE.MeshPhysicalMaterial({color:0xcbd4e6,roughness:0.34,metalness:0.42,clearcoat:0.68}),
    darkStone: makeMaterial(0x1c1b35, 0.84, 0.18),
    top: makeMaterial(0x34324f, 0.84, 0.12),
    wood: makeMaterial(0x352940, 0.88, 0.05),
    foliageA: makeMaterial(0x405775, 0.95, 0.02), foliageB: makeMaterial(0x56658a, 0.95, 0.02),
    foliageC: makeMaterial(0x756b98, 0.94, 0.02),
    crystal: new THREE.MeshPhysicalMaterial({color:0xe0d5ff,emissive:0x8064d7,emissiveIntensity:0.48,roughness:0.1,metalness:0.38,clearcoat:1,clearcoatRoughness:0.045,ior:1.42,thickness:0.72}),
    water: new THREE.MeshPhysicalMaterial({color:0x9aaddf,emissive:0x202b68,emissiveIntensity:0.24,roughness:0.16,metalness:0.18,transparent:true,opacity:0.84,clearcoat:1,clearcoatRoughness:0.08,ior:1.36}),
    road: makeMaterial(0x292d50, 0.94, 0.08), roadEdge: makeMaterial(0xb5a0c9, 0.48, 0.48),
    paving: makeMaterial(0x45415f, 0.84, 0.12),
    lampGlow: new THREE.MeshStandardMaterial({color:0xfff2d8,emissive:0xffc979,emissiveIntensity:1.72,roughness:0.2,metalness:0.08}),
  };
  applyPattern(materials.wall,"stone","#655b83","rgba(15,13,36,0.42)","#e2d7ff",2.2,2.2);
  applyPattern(materials.roof,"roof","#393253","rgba(9,8,27,0.48)","#e5c58d",2.4,2.4);
  applyPattern(materials.road,"paving","#343451","rgba(13,13,34,0.5)","#bda7e6",1.4,2.8);
  applyPattern(materials.paving,"paving","#4a456b","rgba(22,18,48,0.34)","#ddc89b",2.8,2.8);
  applyPattern(materials.top,"stone","#373451","rgba(12,11,33,0.4)","#9c8cc6",2.5,2.5);
  applyPattern(materials.wood,"wood","#352940","rgba(16,10,24,0.44)","#c6a77d",1.8,5.2);
  // Metals need a balanced dielectric response in this lightweight scene (no HDR reflection probe).
  [materials.trim,materials.gold,materials.silver,materials.silverMetal].forEach((material,index)=>{
    material.metalness=[0.34,0.46,0.38,0.44][index];
    material.roughness=Math.max(material.roughness,0.31);
    material.clearcoat=0.82;
    material.clearcoatRoughness=0.2;
    material.needsUpdate=true;
  });
  materials.wall.roughness=0.72;
  materials.wall.metalness=0.08;
  materials.wall.clearcoat=0.38;
  [materials.trim,materials.gold,materials.silver,materials.silverMetal].forEach((material,index)=>{
    material.envMapIntensity=[0.72,0.86,0.78,1.0][index];
    material.needsUpdate=true;
  });
  materials.crystal.envMapIntensity=0.68;
  materials.water.envMapIntensity=0.82;

  // A large connected floating island gives the park room for real exploration.
  const island = new THREE.Group();
  island.name = "OpenWorldParkIsland";
  scene.add(island);
  const colliders = [];
  const walkSegments = [];
  const terrainZones = [];
  const addCollider = (x,z,radius,label)=>colliders.push({x,z,radius,label});
  // Large, feathered contact shadows give hero buildings visual weight without extra lights.
  const shadowCanvas=document.createElement("canvas");shadowCanvas.width=shadowCanvas.height=256;
  const shadowContext=shadowCanvas.getContext("2d");
  const shadowGradient=shadowContext?.createRadialGradient(128,128,8,128,128,126);
  if(shadowContext&&shadowGradient){
    shadowGradient.addColorStop(0,"rgba(2,5,18,0.52)");
    shadowGradient.addColorStop(0.34,"rgba(3,6,21,0.34)");
    shadowGradient.addColorStop(0.68,"rgba(5,8,26,0.12)");
    shadowGradient.addColorStop(1,"rgba(5,8,26,0)");
    shadowContext.fillStyle=shadowGradient;shadowContext.fillRect(0,0,256,256);
  }
  const shadowTexture=shadowContext?new THREE.CanvasTexture(shadowCanvas):null;
  if(shadowTexture){shadowTexture.colorSpace=THREE.SRGBColorSpace;shadowTexture.anisotropy=4;}
  const contactShadowMaterial=shadowTexture?new THREE.MeshBasicMaterial({
    map:shadowTexture,color:0x111528,transparent:true,opacity:0.78,
    depthWrite:false,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2
  }):null;
  function addContactShadow(x,z,width,depth,y=0.79){
    if(!contactShadowMaterial)return null;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),contactShadowMaterial);
    mesh.name="SoftContactShadow";
    mesh.position.set(x,y,z);
    mesh.scale.set(width,depth,1);
    mesh.rotation.x=-Math.PI/2;
    mesh.renderOrder=1;
    island.add(mesh);
    return mesh;
  }
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
  // A continuous silver balustrade finishes the floating-island edge without entering the walkable radius.
  const edgeRail=new THREE.Group();edgeRail.name="FloatingIslandPerimeterBalustrade";island.add(edgeRail);
  [1.05,1.62].forEach((height,index)=>{
    const rail=addMesh(edgeRail,new THREE.TorusGeometry(42.7,index===0?0.055:0.07,8,192),
      index===0?materials.gold:materials.silverMetal,[0,height,0],null,false,false);
    rail.rotation.x=Math.PI/2;
  });
  const postGeometry=new THREE.CylinderGeometry(0.065,0.09,0.86,8);
  const postInstances=new THREE.InstancedMesh(postGeometry,materials.silverMetal,128);
  const capGeometry=new THREE.OctahedronGeometry(0.09,0);
  const capInstances=new THREE.InstancedMesh(capGeometry,materials.crystal,128);
  const railDummy=new THREE.Object3D();
  for(let i=0;i<128;i++){
    const angle=i/128*Math.PI*2, radius=42.7;
    railDummy.position.set(Math.sin(angle)*radius,1.31,Math.cos(angle)*radius);
    railDummy.rotation.set(0,-angle,0);railDummy.updateMatrix();
    postInstances.setMatrixAt(i,railDummy.matrix);
    railDummy.position.set(Math.sin(angle)*radius,1.78,Math.cos(angle)*radius);
    railDummy.scale.set(0.8,1.25,0.8);railDummy.updateMatrix();
    capInstances.setMatrixAt(i,railDummy.matrix);
    railDummy.scale.set(1,1,1);
  }
  postInstances.instanceMatrix.needsUpdate=true;
  capInstances.instanceMatrix.needsUpdate=true;
  postInstances.castShadow=false;postInstances.receiveShadow=false;
  capInstances.castShadow=false;capInstances.receiveShadow=false;
  edgeRail.add(postInstances,capInstances);

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

  // Two mirrored rest gardens give the central promenade a human-scale pause point.
  // Their low plinths share the park paving height; only the bench footprint blocks movement.
  function addPromenadeRestNook(x,z,rotation,accent=PALETTE.blue){
    const nook=new THREE.Group();
    nook.name="MoonlitPromenadeRestNook";
    nook.position.set(x,0.70,z);
    nook.rotation.y=rotation;
    island.add(nook);

    addMesh(nook,new THREE.CylinderGeometry(1.62,1.74,0.12,48),materials.darkStone,
      [0,0.06,0],[1.16,1,0.88],false,true);
    const padRim=addMesh(nook,new THREE.TorusGeometry(1.56,0.035,8,64),materials.gold,
      [0,0.13,0],[1.16,1,0.88],false,false);
    padRim.rotation.x=Math.PI/2;
    const padInlay=addMesh(nook,new THREE.TorusGeometry(1.34,0.018,6,64),materials.trim,
      [0,0.132,0],[1.12,1,0.84],false,false);
    padInlay.rotation.x=Math.PI/2;

    // Brushed-metal feet, dark timber slats and fine champagne-gold seat inlays.
    [-1,1].forEach(side=>{
      addMesh(nook,new THREE.BoxGeometry(0.24,0.085,0.68),materials.gold,
        [side*0.76,0.17,0.02],null,false,false);
      const leg=addMesh(nook,new THREE.CylinderGeometry(0.052,0.078,0.42,12),materials.silverMetal,
        [side*0.76,0.39,-0.035]);
      leg.rotation.z=side*0.045;
      addMesh(nook,new THREE.CylinderGeometry(0.035,0.04,0.48,10),materials.trim,
        [side*0.78,0.94,-0.285],null,false,false);
    });
    for(let slat=0;slat<5;slat++){
      const px=(slat-2)*0.36;
      addMesh(nook,new THREE.BoxGeometry(0.34,0.095,0.58),materials.wood,[px,0.585,0.02]);
      addMesh(nook,new THREE.BoxGeometry(0.25,0.014,0.022),materials.gold,
        [px,0.638,0.312],null,false,false);
    }

    // A softly pointed, bevelled back panel replaces a plain rectangular board.
    const backrestShape=new THREE.Shape();
    backrestShape.moveTo(-0.94,0);
    backrestShape.lineTo(0.94,0);
    backrestShape.lineTo(0.94,0.55);
    backrestShape.quadraticCurveTo(0.92,0.79,0,0.88);
    backrestShape.quadraticCurveTo(-0.92,0.79,-0.94,0.55);
    backrestShape.closePath();
    const backrestGeometry=new THREE.ExtrudeGeometry(backrestShape,{
      depth:0.085,steps:1,bevelEnabled:true,bevelSegments:2,
      bevelSize:0.025,bevelThickness:0.02,curveSegments:12
    });
    addMesh(nook,backrestGeometry,materials.top,[0,0.625,-0.34]);
    const backCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.88,1.28,-0.225),
      new THREE.Vector3(-0.68,1.42,-0.225),
      new THREE.Vector3(0,1.50,-0.225),
      new THREE.Vector3(0.68,1.42,-0.225),
      new THREE.Vector3(0.88,1.28,-0.225)
    ]);
    addMesh(nook,new THREE.TubeGeometry(backCurve,28,0.028,8,false),materials.gold,
      null,null,false,false);
    const inset=addMesh(nook,makeLancetGeometry(0.43,0.57),materials.crystal,
      [0,1.03,-0.242],null,false,false);
    inset.renderOrder=2;
    const crest=addMesh(nook,new THREE.OctahedronGeometry(0.13,1),materials.gold,
      [0,1.08,-0.205],[0.72,1.25,0.42],false,false);
    crest.rotation.z=Math.PI/4;
    addMesh(nook,new THREE.TorusGeometry(0.19,0.018,6,36),materials.silver,
      [0,1.08,-0.205],[1,1.2,0.55],false,false);

    // Curved arm rails and faceted end caps finish both sides of the seat.
    [-1,1].forEach(side=>{
      const armCurve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(side*0.98,0.60,0.25),
        new THREE.Vector3(side*1.02,0.77,0.14),
        new THREE.Vector3(side*1.02,0.83,-0.08),
        new THREE.Vector3(side*0.96,0.86,-0.28)
      ]);
      addMesh(nook,new THREE.TubeGeometry(armCurve,18,0.043,8,false),materials.gold,
        null,null,false,false);
      addMesh(nook,new THREE.OctahedronGeometry(0.075,1),materials.crystal,
        [side*0.98,0.82,0.12],[0.8,1.1,0.8],false,false);
    });

    // Paired crystal-flower bowls sit behind the seat, away from the walking line.
    [-1,1].forEach(side=>{
      const bowl=new THREE.Group();
      bowl.position.set(side*1.02,0.015,-1.03);
      nook.add(bowl);
      addMesh(bowl,new THREE.CylinderGeometry(0.31,0.4,0.18,18),materials.darkStone,[0,0.09,0]);
      const bowlRim=addMesh(bowl,new THREE.TorusGeometry(0.305,0.035,8,32),materials.gold,[0,0.19,0]);
      bowlRim.rotation.x=Math.PI/2;
      addMesh(bowl,new THREE.CylinderGeometry(0.25,0.28,0.045,18),materials.wood,
        [0,0.19,0],null,false,false);
      for(let bloom=0;bloom<3;bloom++){
        const angle=bloom/3*Math.PI*2+side*0.28;
        addMesh(bowl,new THREE.SphereGeometry(0.095,12,10),bloom%2?materials.lampGlow:materials.trim,
          [Math.cos(angle)*0.12,0.31,Math.sin(angle)*0.12],[1,0.62,0.82],null,false,false);
        const crystal=addCrystal(bowl,Math.cos(angle)*0.13,0.36,Math.sin(angle)*0.13,
          0.12+(bloom%2)*0.035,accent);
        crystal.rotation.z=(bloom%2?1:-1)*0.2;
      }
      addMesh(bowl,new THREE.OctahedronGeometry(0.12,1),materials.crystal,
        [0,0.38,0],[0.72,1.25,0.72],false,false);
    });

    terrainZones.push({x,z,radius:2.3,surfaceY:0.82});
    addCollider(x,z,1.75,"星夢休憩長椅");
    return nook;
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
    // Pointed double-lancet arches repeat the castle and park entrance language.
    const crown=addMesh(arch,new THREE.TubeGeometry(
      makeLancetArchCurve(0,3.06,0,width-0.76,1.55),72,0.13,10,false),materials.gold,null,null,false,false);
    const inner=addMesh(arch,new THREE.TubeGeometry(
      makeLancetArchCurve(0,3.09,-0.065,width-1.18,1.34),64,0.038,8,false),materials.crystal,null,null,false,false);
    const crest=addMesh(arch,new THREE.OctahedronGeometry(0.25,1),materials.crystal,[0,4.69,0],[0.8,1.2,0.8],false,false);
    crest.rotation.y=Math.PI/4;
    addMesh(arch,new THREE.TorusGeometry(0.44,0.022,6,40),materials.silverMetal,[0,4.69,0.06],null,false,false);
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
  // Symmetrical moonstone seating alcoves frame the promenade without narrowing it.
  addPromenadeRestNook(-12,23.2,Math.PI/2,PALETTE.violet);
  addPromenadeRestNook(12,23.2,-Math.PI/2,PALETTE.blue);

  // Moonlit path lanterns: a restrained, repeatable fixture that gives the
  // pedestrian routes a deliberate rhythm without filling the paths with props.
  function addPathLantern(x,z,scale=1,tint=PALETTE.gold){
    const lamp=new THREE.Group();lamp.position.set(x,0.78,z);lamp.scale.setScalar(scale);island.add(lamp);
    addMesh(lamp,new THREE.CylinderGeometry(0.25,0.34,0.16,16),materials.darkStone,[0,0.08,0]);
    const footRing=addMesh(lamp,new THREE.TorusGeometry(0.25,0.035,7,32),materials.gold,[0,0.17,0]);footRing.rotation.x=Math.PI/2;
    addMesh(lamp,new THREE.CylinderGeometry(0.075,0.12,1.18,12),materials.silverMetal,[0,0.78,0]);
    addMesh(lamp,new THREE.CylinderGeometry(0.14,0.18,0.12,12),materials.gold,[0,1.38,0]);
    const cage=new THREE.Group();cage.position.set(0,1.68,0);lamp.add(cage);
    const glass=new THREE.MeshPhysicalMaterial({color:tint,emissive:tint,emissiveIntensity:0.52,roughness:0.16,metalness:0.16,transparent:true,opacity:0.82,clearcoat:1});
    addMesh(cage,new THREE.OctahedronGeometry(0.31,1),glass,[0,0,0],[0.78,1.12,0.78],false,false);
    const halo=addMesh(cage,new THREE.TorusGeometry(0.39,0.025,6,40),materials.gold,[0,0,0]);halo.rotation.x=Math.PI/2;
    addMesh(cage,new THREE.OctahedronGeometry(0.11,1),materials.lampGlow,[0,0.48,0],[0.7,1.35,0.7],false,false);
    addMesh(lamp,new THREE.ConeGeometry(0.22,0.34,8),materials.trim,[0,2.13,0],null,false,false);
    const finial=addMesh(lamp,new THREE.OctahedronGeometry(0.105,1),materials.crystal,[0,2.38,0],[0.72,1.35,0.72],false,false);
    finial.rotation.y=Math.PI/4;
  }
  [
    [-3.35,35,0.88], [3.35,35,0.88],
    [-3.35,25,0.92], [3.35,25,0.92],
    [-3.35,14,0.92], [3.35,14,0.92],
    [-3.35,3,0.92], [3.35,3,0.92],
    [-3.35,-9,0.9], [3.35,-9,0.9],
    [-3.35,-20,0.86], [3.35,-20,0.86]
  ].forEach(([x,z,scale],index)=>addPathLantern(x,z,scale,index%3===0?PALETTE.blue:PALETTE.gold));


  // Moonlit flower species for the observatory-side garden island.
  // Shared geometry/materials keep this detail light on mobile devices.
  const moonflowerPetalGeometry=new THREE.SphereGeometry(1,12,8);
  const moonflowerLeafGeometry=new THREE.SphereGeometry(1,10,8);
  const moonflowerPetals=[
    new THREE.MeshPhysicalMaterial({color:0xd9ccff,roughness:0.28,metalness:0.12,clearcoat:0.82,clearcoatRoughness:0.18}),
    new THREE.MeshPhysicalMaterial({color:0xa9c9ed,roughness:0.3,metalness:0.1,clearcoat:0.8,clearcoatRoughness:0.2}),
    new THREE.MeshPhysicalMaterial({color:0xe8b8dc,roughness:0.3,metalness:0.1,clearcoat:0.8,clearcoatRoughness:0.2})
  ];
  const moonflowerStem=makeMaterial(0x557b72,0.86,0.04);
  const moonflowerLeaf=makeMaterial(0x416c68,0.9,0.02);
  function addMoonflower(parent,x,z,scale=1,variant=0){
    const flower=new THREE.Group();
    flower.position.set(x,0.22,z);
    parent.add(flower);
    addMesh(flower,new THREE.CylinderGeometry(0.018,0.032,0.48*scale,8),
      moonflowerStem,[0,0.24*scale,0],null,false,false);
    [-1,1].forEach(side=>{
      const leaf=addMesh(flower,moonflowerLeafGeometry,moonflowerLeaf,
        [side*0.12*scale,0.2*scale,0.025],
        [0.34*scale,0.09*scale,0.68*scale],false,false);
      leaf.rotation.z=-side*0.58;
      leaf.rotation.y=side*0.28;
    });
    const head=new THREE.Group();
    head.position.y=0.48*scale;
    flower.add(head);
    for(let petal=0;petal<6;petal++){
      const angle=petal/6*Math.PI*2+(variant%2)*0.16;
      const bloom=addMesh(head,moonflowerPetalGeometry,moonflowerPetals[variant%moonflowerPetals.length],
        [Math.cos(angle)*0.13*scale,0.025*scale,Math.sin(angle)*0.13*scale],
        [0.72*scale,0.18*scale,1.22*scale],false,false);
      bloom.rotation.y=angle;
    }
    addMesh(head,new THREE.SphereGeometry(0.085*scale,12,10),materials.lampGlow,
      [0,0.065*scale,0],[1,0.8,1],null,false,false);
    const star=addMesh(head,new THREE.OctahedronGeometry(0.055*scale,0),materials.gold,
      [0,0.12*scale,0],[0.9,0.6,0.9],false,false);
    star.rotation.y=Math.PI/4;
    return flower;
  }

  // The old satellite islands become reachable themed gardens at the far end of the park.
  buildCastle(scene,materials);
  addCollider(0,-18.2,5.7,"星夢城堡");
  addReflectingPool(island,materials,-5.35,-14.95);
  addReflectingPool(island,materials,5.35,-14.95);
  addCollider(-5.35,-14.95,1.35,"月光倒影池");
  addCollider(5.35,-14.95,1.35,"月光倒影池");
  const left=makeIsland(scene,-30,0.68,-16.5,4.4,{rock:materials.rock,top:materials.top,trim:materials.gold});
  left.rotation.y=-0.12;
  buildObservatory(scene,-30,0.68,-16.5,materials);
  addCollider(-30,-16.5,3.0,"星辰觀測站");
  const right=makeIsland(scene,30,0.68,-16.5,4.1,{rock:materials.rock,top:materials.top,trim:materials.silver});
  right.rotation.y=0.18;
  // Seat every tree on the satellite island's actual deck height (0.21), not the main island's 0.62 level.
  for(let i=0;i<5;i++){
    const tree=createTree(right,-1.45+i*0.72,-0.35+(i%2)*0.85,0.7+(i%2)*0.16,{wood:materials.wood});
    tree.position.y=0.21;
  }

  // A quiet silver-and-champagne promenade ring and stepping stones frame the flower grove.
  const gardenEdge=addMesh(right,new THREE.TorusGeometry(3.52,0.052,8,96),materials.gold,[0,0.245,0]);
  gardenEdge.rotation.x=Math.PI/2;
  const gardenInner=addMesh(right,new THREE.TorusGeometry(2.02,0.026,7,80),materials.trim,[0,0.238,0]);
  gardenInner.rotation.x=Math.PI/2;
  for(let tile=0;tile<8;tile++){
    const angle=tile/8*Math.PI*2+Math.PI/8;
    const x=Math.cos(angle)*3.04,z=Math.sin(angle)*3.04;
    const stepping=addMesh(right,new THREE.CylinderGeometry(0.25,0.29,0.085,8),
      tile%2?materials.top:materials.paving,[x,0.255,z],[1,1,0.86],false,true);
    stepping.rotation.y=angle;
    const inset=addMesh(right,new THREE.OctahedronGeometry(0.065,0),tile%2?materials.crystal:materials.gold,
      [x,0.315,z],[0.78,0.3,1.4],false,false);
    inset.rotation.y=angle;
  }
  for(let bloom=0;bloom<6;bloom++){
    const angle=bloom/6*Math.PI*2+Math.PI/6;
    addMoonflower(right,Math.cos(angle)*2.55,Math.sin(angle)*2.55,0.88+(bloom%2)*0.1,bloom%3);
  }
  addCrystal(right,1.1,0.55,-1.0,0.6,PALETTE.pink);

  const planet=new THREE.Group();planet.position.set(58,27,-82);scene.add(planet);
  addMesh(planet,new THREE.SphereGeometry(6.2,48,32),new THREE.MeshStandardMaterial({color:0x545e9d,emissive:0x151d55,emissiveIntensity:0.55,roughness:0.92,metalness:0.06}),[0,0,0],[1,1,0.92],false,false);
  const planetRing=addMesh(planet,new THREE.TorusGeometry(8.5,0.11,8,96),makeMaterial(0xaab7ef,0.24,0.8),[0,0,0]);
  planetRing.rotation.x=1.15;planetRing.rotation.y=0.45;

  // Soft aurora arcs sit behind the castle skyline. They are mesh-based and
  // static, so they add depth without a costly full-screen shader or extra lights.
  const auroraPalette=[0x8e83dc,0x72a9d5,0xc59bdc];
  for(let band=0;band<3;band++){
    const points=[];
    for(let step=0;step<7;step++){
      const x=-48+step*16;
      const z=-56+band*4+Math.sin(step*0.92+band*0.8)*3.2;
      const y=20+Math.sin(step*0.78+band*0.65)*3.8+band*1.15;
      points.push(new THREE.Vector3(x,y,z));
    }
    const curve=new THREE.CatmullRomCurve3(points);
    const veil=new THREE.Mesh(
      new THREE.TubeGeometry(curve,96,0.19+band*0.035,7,false),
      new THREE.MeshBasicMaterial({color:auroraPalette[band],transparent:true,opacity:0.105,depthWrite:false,blending:THREE.AdditiveBlending})
    );
    veil.renderOrder=1;scene.add(veil);
    const highlight=new THREE.Mesh(
      new THREE.TubeGeometry(curve,96,0.035,5,false),
      new THREE.MeshBasicMaterial({color:0xe1d8ff,transparent:true,opacity:0.12,depthWrite:false,blending:THREE.AdditiveBlending})
    );
    highlight.renderOrder=2;scene.add(highlight);
  }

  for(let i=0;i<17;i++){
    const angle=(i/17)*Math.PI*2,radius=25+(i%3)*5;
    const crystal=addCrystal(island,Math.cos(angle)*radius,-2.8-(i%3)*0.24,Math.sin(angle)*radius,0.34+(i%3)*0.12,i%2?PALETTE.blue:PALETTE.violet);
    crystal.rotation.z=(i%2?1:-1)*0.28;
  }

  const portals=[];
  [-7.2,0,7.2].forEach((x,i)=>{portals.push(buildPortal(scene,gameMeta[i],x,8.2,materials));addCollider(x,8.2,1.62,gameMeta[i].title)});

  // Wide soft grounding shadows sit beneath the park's largest silhouettes.
  addContactShadow(0,-18.2,13.2,12.4,0.79);
  addContactShadow(-30,-16.5,9.2,8.5,0.895);
  addContactShadow(-4.8,30.5,6.2,5.4,0.79);
  addContactShadow(-24.5,-19.0,13.5,11.8,0.79);
  addContactShadow(18,9,10.4,9.4,0.79);
  addContactShadow(-19,-8,10.5,9.4,0.79);
  const rides=[];
  const carousel=buildCarousel(scene,materials,-21.5,0.7);rides.push(carousel);addCollider(-21.5,0.7,4.1,"星光旋轉木馬");
  const teacups=buildTeacupRide(scene,materials,-13,-11.5);rides.push(teacups);addCollider(-13,-11.5,3.55,"星月茶杯");
  const drop=buildDropTower(scene,materials,13,-10);rides.push(drop);addCollider(13,-10,2.7,"星際自由落體");
  const ferris=buildFerrisWheel(scene,materials,25,0.78,-17);rides.push(ferris);addCollider(25,-17,5.0,"星河摩天輪");
  const coaster=buildRollerCoaster(scene,materials);rides.push(coaster);addCollider(-24.5,-19.0,6.6,"星際雲霄飛車");
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
  function addParkLamp(x,z,scale=1,hasLocalLight=false){
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
    if(hasLocalLight){const glow=new THREE.PointLight(0xffd48d,0.48,5.5,2);glow.position.set(0,2.82,0);lamp.add(glow);}
  }
  [
    [-4,25],[4,25],[-5,14],[5,14],[-10,2],[10,2],[-17,8],[-26,8],
    [-17,-9],[-29,-17],[17,8],[27,2],[18,-10],[31,-12],[-9,-20],[9,-20],
    [-4,-28],[4,-28],[-34,15],[35,10],[-34,-5],[36,-3]
  ].forEach((p,i)=>addParkLamp(p[0],p[1],i%4===0?1.12:1,i%5===0));

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
    const discoveryZones=[
    {id:"entrance_gate",name:"星夢入口",description:"穿過星環拱門，正式踏入夜遊園。",x:0,z:45,radius:6.5},
    {id:"stardream_ticket_booth",name:"星夢票亭",description:"在入口旁確認今晚的園區訊息。",x:-4.8,z:30.5,radius:4.2},
    {id:"astral_plaza",name:"星象中庭",description:"在中央星盤感受浮島的星光脈動。",x:0,z:0,radius:9.0},
    {id:"star_dream_castle",name:"星夢城堡",description:"抬頭欣賞彩繪星窗與多層塔樓。",x:0,z:-18.2,radius:7.2},
    {id:"starlight_carnival",name:"星光嘉年華",description:"走到旋轉木馬與嘉年華花園。",x:-21.5,z:0.7,radius:4.8},
    {id:"moonlight_teacups",name:"月光茶苑",description:"靠近旋轉的星月茶杯。",x:-13,z:-11.5,radius:4.5},
    {id:"galaxy_drop_tower",name:"星際自由落體",description:"走到高聳的銀河升降塔前。",x:13,z:-10,radius:4.0},
    {id:"galaxy_ferris_wheel",name:"星河摩天輪",description:"找到遠處的星河觀景座艙。",x:25,z:-17,radius:4.7},
    {id:"stargazer_observatory",name:"星辰觀測站",description:"抵達遠端浮島上的天文圓頂。",x:-30,z:-16.5,radius:3.8},
    {id:"cosmic_coaster",name:"星際雲霄飛車",description:"找到蜿蜒的星際軌道與列車。",x:-24.5,z:-19,radius:5.6},
    {id:"neon_shooting_gallery",name:"霓虹神射手",description:"走到霓虹靶場的大廳門前。",x:18,z:9,radius:5.2},
    {id:"phantom_mirror_house",name:"幻影鏡屋",description:"抵達鏡面建築外的入口。",x:-19,z:-8,radius:4.9}
  ];
  return {materials,island,compass,compassHalo,portals,planet,planetRing,clouds,rides,rideStations,carousel,ticketBooth,arcadeStalls,shootingGallery,mirrorHouse,interactables,colliders,walkSegments,terrainZones,discoveryZones,playableRadius:41.2};
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

function createSkyDome(scene){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;
 const ctx=canvas.getContext("2d");
 if(!ctx)return null;
 const gradient=ctx.createLinearGradient(0,0,0,512);
 gradient.addColorStop(0,"#050716");
 gradient.addColorStop(0.28,"#0a1230");
 gradient.addColorStop(0.56,"#18244a");
 gradient.addColorStop(0.78,"#30335f");
 gradient.addColorStop(1,"#5c4a75");
 ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
 const horizon=ctx.createRadialGradient(512,430,20,512,430,470);
 horizon.addColorStop(0,"rgba(168,132,194,0.34)");
 horizon.addColorStop(0.45,"rgba(104,111,179,0.16)");
 horizon.addColorStop(1,"rgba(24,29,66,0)");
 ctx.fillStyle=horizon;ctx.fillRect(0,0,1024,512);
 for(let band=0;band<5;band++){
  const y=270+band*30;
  const veil=ctx.createLinearGradient(0,y-35,0,y+35);
  veil.addColorStop(0,"rgba(133,128,207,0)");
  veil.addColorStop(0.5,band%2?"rgba(157,138,207,0.055)":"rgba(115,158,213,0.06)");
  veil.addColorStop(1,"rgba(133,128,207,0)");
  ctx.fillStyle=veil;ctx.fillRect(0,y-35,1024,70);
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 const dome=new THREE.Mesh(new THREE.SphereGeometry(210,64,32),new THREE.MeshBasicMaterial({
  map:texture,side:THREE.BackSide,depthWrite:false,fog:false
 }));
 dome.name="LayeredIndigoTwilightSky";
 dome.renderOrder=-100;
 dome.frustumCulled=false;
 scene.add(dome);
 return dome;
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
    if(world.onParkChat)window.removeEventListener("starry-3d-player-chat",world.onParkChat);
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
  world.postFX?.dispose();
  world.reflectionTarget?.dispose();
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
  const robe=new THREE.MeshPhysicalMaterial({color:style.robe,roughness:0.48,metalness:0.12,clearcoat:0.48,clearcoatRoughness:0.24,sheen:0.62,sheenColor:new THREE.Color(0x9f9acb),sheenRoughness:0.72});
  const mantle=new THREE.MeshPhysicalMaterial({color:style.mantle,roughness:0.42,metalness:0.1,clearcoat:0.56,clearcoatRoughness:0.2,sheen:0.78,sheenColor:new THREE.Color(0xc8b8ee),sheenRoughness:0.66});
  const trim=makeMaterial(hex(appearance.accentColor),0.2,0.82,{clearcoat:1});
  const hair=makeMaterial(hex(appearance.hairColor),0.5,0.08);
  const hairHighlight=makeMaterial(hex(appearance.hairColor),0.28,0.1,{clearcoat:0.92,clearcoatRoughness:0.12});
  const skin=makeMaterial(hex(appearance.skinTone),0.78,0.02);
  const metal=makeMaterial(style.metal,0.2,0.76,{clearcoat:1});
  const shadow=makeMaterial(0x1a1930,0.82,0.05);
  const eyeWhite=makeMaterial(0xfff7ea,0.22,0.02,{clearcoat:1});
  const iris=makeMaterial(hex(appearance.accentColor),0.18,0.32,{clearcoat:1,emissive:hex(appearance.accentColor),emissiveIntensity:0.13});
  const pupil=makeMaterial(0x15172e,0.15,0.04);
  const blush=makeMaterial(0xd78a9e,0.72,0.01);
  const lip=makeMaterial(0x9a657f,0.55,0.02);
  // Declare shared couture materials before any trim, seam or garment geometry uses them.
  const coutureGold=makeMaterial(0xe8cb91,0.24,0.62,{clearcoat:0.9,clearcoatRoughness:0.12});
  const coutureSilver=makeMaterial(0xdce4f4,0.24,0.54,{clearcoat:0.88,clearcoatRoughness:0.14});
  const coutureGem=new THREE.MeshPhysicalMaterial({color:hex(appearance.accentColor),emissive:hex(appearance.accentColor),emissiveIntensity:0.22,roughness:0.12,metalness:0.2,clearcoat:1,clearcoatRoughness:0.04,ior:1.46,thickness:0.45});

  // Tailored robe, layered mantle and a gemstone clasp.
  // Sculpted couture silhouette: a softly tailored waist flowing into a layered bell-shaped hem.
  const robeProfile=[
    new THREE.Vector2(0.49,-0.49),new THREE.Vector2(0.475,-0.39),
    new THREE.Vector2(0.45,-0.25),new THREE.Vector2(0.405,-0.08),
    new THREE.Vector2(0.36,0.12),new THREE.Vector2(0.295,0.34),
    new THREE.Vector2(0.255,0.49)
  ];
  const robeBody=addMesh(player,new THREE.LatheGeometry(robeProfile,40),robe,[0,0.77,0]);
  robeBody.castShadow=true;
  // A second overskirt gives the silhouette depth without a flat boxy cape.
  const overskirtMat=new THREE.MeshPhysicalMaterial({color:style.mantle,roughness:0.42,metalness:0.16,clearcoat:0.62,clearcoatRoughness:0.24,sheen:0.42,sheenColor:new THREE.Color(0xb9a8e8),side:THREE.DoubleSide});
  const overskirt=addMesh(player,new THREE.LatheGeometry([
    new THREE.Vector2(0.505,-0.44),new THREE.Vector2(0.49,-0.34),
    new THREE.Vector2(0.46,-0.2),new THREE.Vector2(0.42,-0.03),
    new THREE.Vector2(0.365,0.16),new THREE.Vector2(0.31,0.34)
  ],40),overskirtMat,[0,0.77,-0.012]);
  overskirt.rotation.y=Math.PI/8;
  addMesh(player,new THREE.CylinderGeometry(0.28,0.31,0.12,24),trim,[0,1.19,0]);
  const cape=addMesh(player,new THREE.CylinderGeometry(0.12,0.53,0.9,24,2,true),mantle,[0,0.72,-0.16]);
  cape.rotation.x=-0.1;
  addMesh(player,new THREE.TorusGeometry(0.31,0.045,8,40),trim,[0,0.98,0]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.BoxGeometry(0.54,0.1,0.18),metal,[0,0.99,0.02]);
  addMesh(player,new THREE.OctahedronGeometry(0.13,1),trim,[0,1.0,0.14],[0.72,1.15,0.72]);
  // Layered collar, fitted waist sash, embroidered front panel and plated hem.
  addMesh(player,new THREE.TorusGeometry(0.245,0.035,8,40),metal,[0,1.18,0.02]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.TorusGeometry(0.34,0.034,8,48),trim,[0,0.78,0]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.BoxGeometry(0.33,0.58,0.035),mantle,[0,0.68,0.238]);
  addMesh(player,new THREE.BoxGeometry(0.055,0.48,0.025),trim,[-0.1,0.69,0.263],null,false,false);
  addMesh(player,new THREE.BoxGeometry(0.055,0.48,0.025),trim,[0.1,0.69,0.263],null,false,false);
  addMesh(player,new THREE.OctahedronGeometry(0.095,1),metal,[0,0.83,0.28],[0.75,1.15,0.55],null,false,false);
  for(let seam=0;seam<5;seam++){
    const x=-0.25+seam*0.125;
    const stitch=addMesh(player,new THREE.BoxGeometry(0.018,0.34,0.012),seam%2?trim:metal,[x,0.43,0.27],null,false,false);
    stitch.rotation.z=(seam-2)*0.035;
  }
  // Double-layered metallic hem with fine radial stitchwork catches the rim light.
  addMesh(player,new THREE.TorusGeometry(0.50,0.026,8,56),coutureGold,[0,0.345,0]).rotation.x=Math.PI/2;
  addMesh(player,new THREE.TorusGeometry(0.482,0.012,6,56),coutureSilver,[0,0.385,0]).rotation.x=Math.PI/2;
  for(let pleat=0;pleat<16;pleat++){
    const angle=pleat/16*Math.PI*2;
    const radius=0.50;
    const stitch=addMesh(player,new THREE.OctahedronGeometry(0.018,0),pleat%4===0?coutureGem:coutureGold,
      [Math.sin(angle)*radius,0.355,Math.cos(angle)*radius],[0.8,0.42,1.2],false,false);
    stitch.rotation.y=angle;
  }

  // Couture detailing: raised shoulder pieces, a jeweled collar and fine embroidery.
  const curveLine=(points,material,radius=0.012)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(point[0],point[1],point[2])));
    return addMesh(player,new THREE.TubeGeometry(curve,36,radius,7,false),material,null,null,false,false);
  };
  // Split velvet mantle tails make the rear silhouette read as layered formalwear, not a plain cylinder cape.
  const backMantleMaterial=new THREE.MeshPhysicalMaterial({
    color:style.mantle,roughness:0.48,metalness:0.12,clearcoat:0.72,
    clearcoatRoughness:0.2,sheen:0.86,sheenColor:new THREE.Color(0xc9b9eb),
    sheenRoughness:0.58,side:THREE.DoubleSide
  });
  [-1,1].forEach(side=>{
    const tailShape=new THREE.Shape();
    tailShape.moveTo(0,0);
    tailShape.quadraticCurveTo(side*0.17,-0.12,side*0.19,-0.34);
    tailShape.quadraticCurveTo(side*0.23,-0.62,side*0.10,-0.86);
    tailShape.quadraticCurveTo(side*0.34,-0.69,side*0.39,-0.43);
    tailShape.quadraticCurveTo(side*0.40,-0.15,side*0.21,0.035);
    tailShape.closePath();
    const tail=addMesh(player,new THREE.ExtrudeGeometry(tailShape,{
      depth:0.035,steps:1,bevelEnabled:true,bevelSegments:2,
      bevelSize:0.012,bevelThickness:0.012,curveSegments:14
    }),backMantleMaterial,[side*0.12,1.01,-0.265],null,true,false);
    tail.rotation.y=side*0.025;
    curveLine([[side*0.13,1.0,-0.285],[side*0.28,0.8,-0.29],[side*0.31,0.52,-0.29],[side*0.22,0.2,-0.285]],coutureGold,0.009);
    [0.78,0.56,0.34].forEach((y,index)=>addMesh(player,new THREE.OctahedronGeometry(index===1?0.035:0.025,0),
      index===1?coutureGem:coutureSilver,[side*(0.22+index*0.018),y,-0.292],[0.7,1.25,0.7],false,false));
  });
  addMesh(player,new THREE.OctahedronGeometry(0.085,1),coutureGem,[0,1.03,-0.285],[0.72,1.25,0.72],false,false);
  const backClasp=addMesh(player,new THREE.TorusGeometry(0.17,0.012,6,36,Math.PI),coutureSilver,[0,1.02,-0.29],null,false,false);
  backClasp.rotation.z=Math.PI;
  [-1,1].forEach(side=>{
    const shoulder=addMesh(player,new THREE.SphereGeometry(0.19,20,14),mantle,[side*0.285,1.105,-0.015],[1.22,0.58,1.0]);
    shoulder.rotation.z=side*-0.16;
    const shoulderRim=addMesh(player,new THREE.TorusGeometry(0.145,0.022,7,32),coutureGold,[side*0.29,1.105,0.105]);
    shoulderRim.rotation.x=Math.PI/2;
    const shoulderGem=addMesh(player,new THREE.OctahedronGeometry(0.075,1),coutureGem,[side*0.29,1.13,0.17],[0.72,1.25,0.72],null,false,false);
    shoulderGem.rotation.z=side*0.24;
    curveLine([[side*0.17,1.18,0.105],[side*0.25,1.24,0.12],[side*0.36,1.19,0.1],[side*0.42,1.11,0.04]],coutureSilver,0.009);
  });
  curveLine([[-0.23,1.19,0.12],[-0.16,1.12,0.22],[0,1.075,0.255],[0.16,1.12,0.22],[0.23,1.19,0.12]],coutureGold,0.022);
  addMesh(player,new THREE.OctahedronGeometry(0.105,1),coutureGem,[0,1.075,0.27],[0.72,1.32,0.72],null,false,false);
  addMesh(player,new THREE.SphereGeometry(0.035,12,10),coutureSilver,[0,1.075,0.29],null,false,false);
  curveLine([[-0.12,0.94,0.275],[-0.08,0.82,0.286],[0,0.72,0.292],[0.08,0.82,0.286],[0.12,0.94,0.275]],coutureGold,0.012);
  curveLine([[-0.19,0.9,0.268],[-0.16,0.75,0.285],[-0.11,0.62,0.278]],coutureSilver,0.008);
  curveLine([[0.19,0.9,0.268],[0.16,0.75,0.285],[0.11,0.62,0.278]],coutureSilver,0.008);
  const breastStar=addMesh(player,new THREE.OctahedronGeometry(0.07,1),coutureGem,[0,0.69,0.302],[0.72,1.35,0.72],null,false,false);
  breastStar.rotation.z=Math.PI/4;
  [-1,1].forEach(side=>{
    const sash=addMesh(player,new THREE.ConeGeometry(0.105,0.52,8,1,true),side<0?mantle:robe,[side*0.23,0.48,-0.12],[0.82,1,0.38]);
    sash.rotation.z=side*0.12;
    curveLine([[side*0.23,0.72,0.02],[side*0.25,0.5,0.015],[side*0.22,0.25,0.01]],coutureGold,0.009);
    addMesh(player,new THREE.OctahedronGeometry(0.045,0),coutureGem,[side*0.22,0.2,0.02],[0.8,1.4,0.8],null,false,false);
  });

  // Boots, anatomically connected sleeves, gloves and decorative arm cuffs.
  [-0.19,0.19].forEach(x=>{
    addMesh(player,new THREE.CylinderGeometry(0.105,0.13,0.31,14),shadow,[x,0.19,0.02]);
    addMesh(player,new THREE.TorusGeometry(0.11,0.025,6,22),trim,[x,0.31,0.02]);
    addMesh(player,new THREE.SphereGeometry(0.09,14,10),metal,[x,0.115,0.105],[0.94,0.52,1.25],false,false);
    const bootPiping=addMesh(player,new THREE.TorusGeometry(0.083,0.012,6,22),coutureGold,[x,0.18,0.105]);
    bootPiping.rotation.x=Math.PI/2;
    const sleeve=addMesh(player,new THREE.CylinderGeometry(0.082,0.12,0.37,18,2),mantle,[x*1.66,0.91,0.025]);
    sleeve.rotation.z=x<0?0.13:-0.13;
    const sleeveBand=addMesh(player,new THREE.TorusGeometry(0.092,0.018,6,24),coutureGold,[x*1.78,0.79,0.04]);
    sleeveBand.rotation.x=Math.PI/2;
    addMesh(player,new THREE.SphereGeometry(0.13,16,12),robe,[x*1.55,1.03,0],[1,0.86,0.92]);
    addMesh(player,new THREE.SphereGeometry(0.09,14,10),skin,[x*1.78,0.76,0.06]);
    const cuff=addMesh(player,new THREE.TorusGeometry(0.095,0.022,6,20),metal,[x*1.78,0.82,0.06]);
    cuff.rotation.x=Math.PI/2;
  });
  // Keep facial features, hair and neck in one scaled rig. Slightly smaller head proportions
  // move the avatar away from a toy-like silhouette while preserving all customization coordinates.
  const headRig=new THREE.Group();
  const headScale=0.86;
  headRig.scale.setScalar(headScale);
  headRig.position.set(0,1.45*(1-headScale),0.025*(1-headScale));
  player.add(headRig);
  let hairStrandCount=0;
  const addHairStrand=(points,radius=0.012,material=hairHighlight)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(point[0],point[1],point[2])));
    const strand=addMesh(headRig,new THREE.TubeGeometry(curve,18,radius,5,false),material,null,null,false,false);
    hairStrandCount++;
    return strand;
  };
  const addFaceCurve=(points,radius,material)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(point[0],point[1],point[2])));
    return addMesh(headRig,new THREE.TubeGeometry(curve,18,radius,6,false),material,null,null,false,false);
  };
  // A visible neck and jeweled collar bridge the face and tailored mantle.
  addMesh(headRig,new THREE.CylinderGeometry(0.105,0.12,0.19,18),skin,[0,1.34,0.035]);
  const neckCollar=addMesh(headRig,new THREE.TorusGeometry(0.14,0.022,7,32),coutureGold,[0,1.285,0.035]);
  neckCollar.rotation.x=Math.PI/2;
  addMesh(headRig,new THREE.OctahedronGeometry(0.045,1),coutureGem,[0,1.29,0.17],[0.72,1.2,0.72],false,false);
  // Face and selectable hair styles. The hood is an actual garment silhouette.
  addMesh(headRig,new THREE.SphereGeometry(0.255,24,18),skin,[0,1.48,0.025],[0.94,1.05,0.9]);
  addMesh(headRig,new THREE.SphereGeometry(0.27,24,16,0,Math.PI*2,0,Math.PI/2),hair,[0,1.56,-0.015],
    appearance.hairStyle==="short"?[1.04,0.58,0.98]:[1.04,0.86,0.98]);
  if(appearance.hairStyle==="long"){
    [-1,1].forEach(side=>{
      addMesh(headRig,new THREE.SphereGeometry(0.085,14,12),hair,[side*0.235,1.34,-0.015],[0.8,2.3,0.98]);
      addMesh(headRig,new THREE.ConeGeometry(0.07,0.48,10),hair,[side*0.245,1.03,-0.12]);
    });
    addMesh(headRig,new THREE.SphereGeometry(0.18,14,12),hair,[0,1.34,-0.19],[1.0,1.2,0.75]);
  }else if(appearance.hairStyle==="twin"){
    [-1,1].forEach(side=>{
      addMesh(headRig,new THREE.SphereGeometry(0.12,16,12),hair,[side*0.29,1.62,-0.015],[1,1.05,1]);
      addMesh(headRig,new THREE.ConeGeometry(0.07,0.42,10),hair,[side*0.34,1.31,-0.04]);
      addMesh(headRig,new THREE.TorusGeometry(0.13,0.022,6,20),trim,[side*0.29,1.64,-0.015]);
    });
  }else if(appearance.hairStyle==="hood"){
    const hood=addMesh(headRig,new THREE.SphereGeometry(0.34,24,16,0,Math.PI*2,0,Math.PI/1.65),mantle,[0,1.54,-0.075],[1.08,1.16,1.08]);
    hood.rotation.x=-0.1;
    addMesh(headRig,new THREE.TorusGeometry(0.28,0.045,8,36),trim,[0,1.39,0.12]).rotation.x=Math.PI/2;
  }else{
    [-1,1].forEach(side=>addMesh(headRig,new THREE.SphereGeometry(0.07,12,10),hair,[side*0.23,1.39,-0.01],[0.8,1.4,0.9]));
    addMesh(headRig,new THREE.TorusGeometry(0.11,0.018,6,24),trim,[0,1.67,-0.02]);
  }
  // Refined, low-segment hair locks add readable silhouettes without a heavy skinned mesh.
  if(appearance.hairStyle==="long"){
    [-1,1].forEach(side=>addHairStrand([
      [side*0.235,1.61,0.15],[side*0.27,1.48,0.155],
      [side*0.27,1.29,0.135],[side*0.245,1.08,0.095]
    ],0.022,hair));
  }else if(appearance.hairStyle==="twin"){
    [-1,1].forEach(side=>addHairStrand([
      [side*0.29,1.56,-0.035],[side*0.36,1.4,-0.055],
      [side*0.34,1.2,-0.025],[side*0.29,1.12,0.015]
    ],0.028,hair));
  }else if(appearance.hairStyle==="short"){
    addHairStrand([[-0.18,1.62,0.18],[-0.12,1.68,0.22],[-0.02,1.67,0.235],
      [0.09,1.64,0.22],[0.17,1.59,0.18]],0.025,hair);
  }else{
    addHairStrand([[-0.24,1.68,0.08],[-0.18,1.74,0.13],[0,1.77,0.16],
      [0.18,1.74,0.13],[0.24,1.68,0.08]],0.012,coutureSilver);
  }
  if(appearance.hairStyle==="hood"){
    addHairStrand([[-0.18,1.66,0.12],[-0.1,1.7,0.16],[0,1.71,0.17]],0.007,hairHighlight);
  }else{
    addHairStrand([[-0.11,1.68,0.2],[-0.06,1.71,0.235],[0,1.72,0.24]],0.006,hairHighlight);
    addHairStrand([[0.02,1.72,0.24],[0.09,1.7,0.23],[0.14,1.66,0.21]],0.006,hairHighlight);
  }

  // Secondary locks create finer, directional highlights without adding a heavy hair mesh.
  if(appearance.hairStyle==="long"){
    [-1,1].forEach(side=>addHairStrand([
      [side*0.19,1.6,0.18],[side*0.225,1.47,0.185],
      [side*0.23,1.3,0.16],[side*0.205,1.14,0.12]
    ],0.0065,hairHighlight));
  }else if(appearance.hairStyle==="twin"){
    [-1,1].forEach(side=>addHairStrand([
      [side*0.3,1.58,0.035],[side*0.355,1.43,0.015],
      [side*0.35,1.25,0.035],[side*0.305,1.14,0.06]
    ],0.007,hairHighlight));
  }else if(appearance.hairStyle==="short"){
    addHairStrand([[-0.17,1.61,0.2],[-0.13,1.64,0.235],[-0.08,1.63,0.25],[-0.035,1.61,0.25]],0.0065,hairHighlight);
    addHairStrand([[0.02,1.65,0.25],[0.08,1.64,0.245],[0.13,1.61,0.22],[0.18,1.58,0.19]],0.0065,hairHighlight);
  }else{
    [-1,1].forEach(side=>addHairStrand([
      [side*0.2,1.61,0.12],[side*0.22,1.55,0.16],
      [side*0.2,1.48,0.17],[side*0.17,1.42,0.16]
    ],0.006,hairHighlight));
  }
  addMesh(headRig,new THREE.OctahedronGeometry(0.12,1),trim,[0,1.77,0.05],[0.72,1.2,0.72],false,false);

  // A delicate diadem bridges the hairline; tiny side stones catch the rim light.
  const diademCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-0.22,1.66,0.16),new THREE.Vector3(-0.13,1.72,0.2),new THREE.Vector3(0,1.76,0.205),new THREE.Vector3(0.13,1.72,0.2),new THREE.Vector3(0.22,1.66,0.16)]);
  addMesh(headRig,new THREE.TubeGeometry(diademCurve,32,0.014,7,false),coutureGold,null,null,false,false);
  [-1,1].forEach(side=>addMesh(headRig,new THREE.OctahedronGeometry(0.045,1),coutureGem,[side*0.2,1.665,0.19],[0.72,1.28,0.72],null,false,false));
  // Face sculpt: softly tapered eye shapes, curved lids and brows read clearly at park distance.
  [-1,1].forEach(side=>{
    const eyeX=side*0.095;
    addMesh(headRig,new THREE.SphereGeometry(0.047,20,16),eyeWhite,[eyeX,1.5,0.236],[1.22,0.84,0.48]);
    addMesh(headRig,new THREE.SphereGeometry(0.029,18,14),iris,[eyeX,1.5,0.26],[1.04,0.96,0.5]);
    addMesh(headRig,new THREE.SphereGeometry(0.015,14,12),pupil,[eyeX,1.5,0.276],[1,1,0.52]);
    addMesh(headRig,new THREE.SphereGeometry(0.009,10,8),eyeWhite,[eyeX+side*0.011,1.517,0.284],null,false,false);
    const upperLid=addFaceCurve([
      [side*0.15,1.5,0.235],[side*0.13,1.532,0.252],
      [side*0.095,1.541,0.26],[side*0.06,1.532,0.252],[side*0.04,1.5,0.235]
    ],0.007,skin);
    const lowerLid=addFaceCurve([
      [side*0.04,1.497,0.235],[side*0.07,1.472,0.25],
      [side*0.095,1.466,0.253],[side*0.125,1.472,0.25],[side*0.15,1.497,0.235]
    ],0.0055,skin);
    const brow=addFaceCurve([
      [side*0.15,1.565,0.226],[side*0.125,1.582,0.239],
      [side*0.092,1.586,0.243],[side*0.06,1.576,0.235]
    ],0.0085,hairHighlight);
    addMesh(headRig,new THREE.SphereGeometry(0.052,16,12),skin,[side*0.252,1.455,0.012],[0.72,1,0.58]);
    const earInner=addMesh(headRig,new THREE.SphereGeometry(0.022,12,10),blush,[side*0.263,1.458,0.056],[0.62,1.25,0.48],false,false);
    const earring=addMesh(headRig,new THREE.TorusGeometry(0.043,0.012,6,24),trim,[side*0.255,1.38,0.055]);
    earring.rotation.x=Math.PI/2;
    addMesh(headRig,new THREE.OctahedronGeometry(0.018,1),coutureGem,[side*0.255,1.325,0.06],[0.62,1.1,0.62],false,false);
    addMesh(headRig,new THREE.SphereGeometry(0.023,12,10),blush,[side*0.155,1.415,0.226],[1.2,0.62,0.22],false,false);
  });
  // A subtle bridge, rounded tip and tiny nostril shadows give the face a more sculpted profile.
  const noseBridge=addMesh(headRig,new THREE.SphereGeometry(0.026,18,14),skin,[0,1.462,0.266],[0.68,1.5,0.72],false,false);
  const noseTip=addMesh(headRig,new THREE.SphereGeometry(0.024,16,12),skin,[0,1.431,0.287],[0.94,0.72,0.78],false,false);
  [-1,1].forEach(side=>{
    addMesh(headRig,new THREE.SphereGeometry(0.006,10,8),shadow,[side*0.016,1.423,0.296],[1,0.8,0.55],false,false);
  });
  // Fine lip curves replace the single cartoon-like smile arc.
  const upperLip=addFaceCurve([
    [-0.047,1.373,0.246],[-0.024,1.379,0.257],[0,1.373,0.261],
    [0.024,1.379,0.257],[0.047,1.373,0.246]
  ],0.0058,lip);
  const lowerLip=addFaceCurve([
    [-0.038,1.369,0.249],[0,1.359,0.258],[0.038,1.369,0.249]
  ],0.005,blush);
  addMesh(headRig,new THREE.TorusGeometry(0.285,0.045,8,36),trim,[0,1.68,0]).rotation.x=Math.PI/2;

  // Traveler archetype controls the silhouette; outfits remain independently selectable.
  if(avatarType==="mage"||(avatarType==="wanderer"&&avatarId==="crystal-witch")){
    addMesh(headRig,new THREE.CylinderGeometry(0.43,0.43,0.07,24),mantle,[0,1.78,0]);
    addMesh(headRig,new THREE.ConeGeometry(0.34,0.68,16),mantle,[0,2.12,0]);
    addMesh(headRig,new THREE.TorusGeometry(0.25,0.035,8,28),trim,[0,1.93,0]);
  }else if(avatarType==="guardian"||(avatarType==="wanderer"&&avatarId==="celestial-guardian")){
    [-1,1].forEach(side=>{
      const wing=new THREE.Group();wing.position.set(side*0.27,1.1,-0.13);wing.rotation.z=side*-0.2;player.add(wing);
      for(let feather=0;feather<3;feather++){
        const plume=addMesh(wing,new THREE.ConeGeometry(0.14,0.78-feather*0.12,8),feather%2?trim:metal,
          [side*feather*0.13,0.22-feather*0.12,-0.03],[1,1,0.56]);
        plume.rotation.z=side*0.68;
      }
    });
    addMesh(headRig,new THREE.TorusGeometry(0.52,0.035,8,48),trim,[0,2.13,0]);
  }else if(avatarType==="knight"||(avatarType==="wanderer"&&avatarId==="astral-knight")){
    addMesh(headRig,new THREE.CylinderGeometry(0.31,0.35,0.12,16),metal,[0,1.74,0]);
    addMesh(headRig,new THREE.ConeGeometry(0.18,0.48,8),trim,[0,1.99,0]);
    [-1,1].forEach(side=>{
      const horn=addMesh(headRig,new THREE.ConeGeometry(0.09,0.34,8),metal,[side*0.26,1.9,0]);
      horn.rotation.z=side*0.48;
      addMesh(player,new THREE.SphereGeometry(0.2,16,12),metal,[side*0.29,1.08,-0.015],[1.12,0.56,1.08]);
      const pauldronTrim=addMesh(player,new THREE.TorusGeometry(0.17,0.025,6,24),trim,[side*0.29,1.12,0.03]);
      pauldronTrim.rotation.x=Math.PI/2;
    });
    addMesh(player,new THREE.SphereGeometry(0.29,18,12),metal,[0,1.0,0.13],[0.9,0.85,0.35]);
  }else if(avatarType==="priest"||(avatarType==="wanderer"&&avatarId==="moon-priestess")){
    addMesh(headRig,new THREE.TorusGeometry(0.36,0.045,8,48),trim,[0,1.9,0.02]);
    const crescent=addMesh(headRig,new THREE.TorusGeometry(0.24,0.052,8,36,Math.PI*1.3),metal,[0,2.15,0.05]);
    crescent.rotation.z=Math.PI*0.62;
    addMesh(headRig,new THREE.OctahedronGeometry(0.14,1),trim,[0,2.4,0.05],[0.72,1.25,0.72]);
    [-1,1].forEach(side=>{
      const drape=addMesh(player,new THREE.ConeGeometry(0.065,0.74,8),mantle,[side*0.29,1.14,-0.1]);
      drape.rotation.z=side*0.22;
    });
  }else{
    addMesh(headRig,new THREE.CylinderGeometry(0.36,0.28,0.08,24),mantle,[0,1.76,0]);
    addMesh(headRig,new THREE.ConeGeometry(0.25,0.42,12),mantle,[0,1.98,0]);
    addMesh(headRig,new THREE.OctahedronGeometry(0.12,1),trim,[0,2.23,0],null,false,false);
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

  const floatingStar=addMesh(headRig,new THREE.OctahedronGeometry(0.105,1),trim,[0,2.34,0],null,false,false);
  const halo=addMesh(headRig,new THREE.TorusGeometry(0.49,0.028,8,44),metal,[0,2.21,0]);
  halo.rotation.x=Math.PI/2;
  [-0.26,0.26].forEach(x=>addMesh(player,new THREE.OctahedronGeometry(0.075,1),trim,[x,1.08,0.09],null,false,false));
  player.userData.halo=halo;player.userData.floatingStar=floatingStar;player.userData.walkPhase=0;
  player.userData.hairStrandCount=hairStrandCount;
  scene.add(player);return player;
}



function mount(host) {
  window.STARRY_3D_BOOT_STAGE = "host";
  if (!host || !host.isConnected) return;
  if (activeWorld && activeWorld.host === host) return;
  disposeWorld(activeWorld);
  activeWorld = null;

  host.dataset.status = "loading";
  const status = document.getElementById("starry-3d-status");
  if (status) status.textContent = "正在喚醒星夢廣場…";

  let renderer;
  window.STARRY_3D_BOOT_STAGE = "renderer";
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

  window.STARRY_3D_BOOT_STAGE = "scene and camera";
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.night);
  scene.fog = new THREE.FogExp2(PALETTE.night, 0.00325);

  const isSmall = width < 650;
  const camera = new THREE.PerspectiveCamera(isSmall ? 62 : 60,width/height,0.1,320);
  const cameraState = { yaw: 0, pitch: 0.035, distance: isSmall ? 10.2 : 9.5 };
  camera.position.set(0, 3.2, 42.2);
  camera.lookAt(0, 1.7, 33.0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.0 : 1.25));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "starry-3d-canvas";
  renderer.domElement.setAttribute("aria-label", "可自由探索星夢夜遊園、漫遊各主題園區並點擊挑戰星門");
  host.appendChild(renderer.domElement);

  const reflectionTarget=createReflectionEnvironment(renderer,scene);
  const postFX=createCinematicPostFX(renderer,width,height,isSmall);

  const hemisphere = new THREE.HemisphereLight(0xe4e7ff, 0x211832, 1.18);
  scene.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(0xffefd0, 2.42);
  moonLight.position.set(-15, 28, 18);
  moonLight.castShadow = true;
  const shadowResolution = isSmall ? 1024 : 2048;
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

  const fillLight = new THREE.DirectionalLight(0x9c91eb, 0.82);
  fillLight.position.set(12, 8, -12);
  scene.add(fillLight);

  const warmLight = new THREE.PointLight(0xf2c884, 19, 30, 2);
  warmLight.position.set(0, 7, -4);
  scene.add(warmLight);

  const castleRimLight = new THREE.DirectionalLight(0xc7b7ff, 0.42);
  castleRimLight.position.set(7, 13, -28);
  scene.add(castleRimLight);

  const blueLight = new THREE.PointLight(0x6d80dc, 23, 28, 2);
  blueLight.position.set(-7, 4, 5);
  scene.add(blueLight);

  window.STARRY_3D_BOOT_STAGE = "sky and park environment";
  const skyDome = createSkyDome(scene);
  const starfield = createStarfield(scene, isSmall ? 460 : 820);
  const parkMotes = createParkMotes(scene,isSmall?28:56);
  const environment = buildEnvironment(scene);
  let initialCustomization={};
  try{initialCustomization=JSON.parse(host.dataset.avatarCustomization||"{}")}catch(error){}
  window.STARRY_3D_BOOT_STAGE = "player avatar";
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

  let savedDiscoveryIds=[];
  try{savedDiscoveryIds=JSON.parse(host.dataset.parkDiscoveries||"[]")}catch(error){}
  const world = {
    host, scene, renderer, camera, skyDome, starfield, parkMotes, environment, reflectionTarget, postFX,
    portals: environment.portals, raycaster, pointer, canvas: renderer.domElement, player,
    cameraState, cameraMode: host.dataset.cameraMode || "first", keys: new Set(),
    touchMove: {x:0,y:0}, touchRun: false, mountedRide: null, mountedRideData:null, minimapLast: 0, nearbyHintLast:0,
    discoveredZones:new Set(Array.isArray(savedDiscoveryIds)?savedDiscoveryIds:[]),activeDiscoveryZone:null,
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
  world.onParkChat = event => {
    const detail=event.detail||{};
    if(!detail.sessionId||!detail.message)return;
    const model=detail.sessionId===world.localUserId?player:world.otherPlayers.get(String(detail.sessionId))?.model;
    if(model)showChatBubble(model,detail.message,clock.elapsedTime+5.5);
  };
  window.addEventListener("starry-3d-players",world.onRemotePlayers);
  window.addEventListener("starry-3d-player-move",world.onRemoteMove);
  window.addEventListener("starry-3d-player-chat",world.onParkChat);

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
        if(ride&&rideDistance(ride)<=ride.interactionRadius+0.5)mountRide(ride);
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
    starfield.rotation.y += delta * 0.0011;
    starfield.material.opacity = 0.84 + Math.sin(t * 0.34) * 0.035;
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
    if(world.mountedRide){
      world.activeDiscoveryZone=null;
    }else{
      const nearestZone=environment.discoveryZones
        .map(zone=>({zone,distance:Math.hypot(player.position.x-zone.x,player.position.z-zone.z)}))
        .filter(entry=>entry.distance<=entry.zone.radius)
        .sort((a,b)=>a.distance-b.distance)[0]||null;
      const activeZoneId=nearestZone?.zone.id||null;
      if(activeZoneId!==world.activeDiscoveryZone){
        world.activeDiscoveryZone=activeZoneId;
        if(nearestZone&&!world.discoveredZones.has(activeZoneId)){
          const zone=nearestZone.zone;
          world.discoveredZones.add(zone.id);
          window.dispatchEvent(new CustomEvent("starry-3d-discovery",{detail:{
            id:zone.id,name:zone.name,description:zone.description,x:zone.x,z:zone.z
          }}));
        }
      }
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
    if(player.userData.chatBubble&&t>player.userData.chatBubbleUntil)clearChatBubble(player);
    world.otherPlayers.forEach(entry=>{
      if(entry.model.userData.chatBubble&&t>entry.model.userData.chatBubbleUntil)clearChatBubble(entry.model);
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
      if(nearest&&nearest.distance<=nearest.ride.interactionRadius)hint={label:"搭乘　E",name:nearest.ride.name};
      else if(nearest&&nearest.distance<=nearest.ride.interactionRadius+1.25)hint={label:"靠近設施",name:nearest.ride.name};
      else if(Math.hypot(player.position.x-environment.ticketBooth.position.x,player.position.z-environment.ticketBooth.position.z)<4.5)hint={label:"票亭　E",name:"星夢入園票亭"};
      window.dispatchEvent(new CustomEvent("starry-3d-nearby",{detail:hint}));
    }
    if(t-world.minimapLast>0.15){
      world.minimapLast=t;
      window.dispatchEvent(new CustomEvent("starry-3d-map",{detail:{x:player.position.x,z:player.position.z,yaw:cameraState.yaw}}));
    }
    if(postFX)postFX.render(scene,camera);
    else renderer.render(scene,camera);
  };
  window.STARRY_3D_BOOT_STAGE = "animation loop";
  renderer.setAnimationLoop(world.renderFrame);

  window.STARRY_3D_BOOT_STAGE = "resize observer";
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
    postFX?.setSize(w,h,renderer.getPixelRatio());
  });
  world.resizeObserver.observe(host);

  world.visibilityHandler = () => {
    world.running = !document.hidden;
    if (world.running) clock.start();
  };
  document.addEventListener("visibilitychange", world.visibilityHandler);

  window.STARRY_3D_BOOT_STAGE = "ready";
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
