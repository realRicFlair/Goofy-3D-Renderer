import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////
function getDist(v0, v1) {
  return Math.sqrt((v1[0] - v0[0]) ^ 2 + (v1[1] - v0[1]) ^ 2);
}
function getTriangleArea(v0, v1, v2) {
  // Formula for the area of a triangle given its vertices
  //const area = 0.5 * Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)));
  return 0.5 * Math.abs((v0[0] * (v1[1] - v2[1]) + v1[0] * (v2[1] - v0[1]) + v2[0] * (v0[1] - v1[1])));
}
function lerp(a, b, t) {
  return a + (t * (b - a));
}
function colorLerp(c1, c2, t) {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t)
  ]
}
// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function (v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xInc = dx / steps;
  const yInc = dy / steps;


  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    const color = colorLerp([r1, g1, b1], [r2, g2, b2], i / steps);
    this.setPixel(Math.round(x), Math.round(y), color);
    x += xInc;
    y += yInc;
  }

  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function (v1, v2, v3) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
  //this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  //this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
  //this.setPixel(Math.floor(x3), Math.floor(y3), [r3, g3, b3]);

  // get bounding box
  const xmax = Math.max(x1, x2, x3);
  const ymax = Math.max(y1, y2, y3);
  const xmin = Math.min(x1, x2, x3);
  const ymin = Math.min(y1, y2, y3);

  // unused since ima assume all triangles are winded CCW. 
  //const area = (x2 - x1)*(y3 - y1) - (y2 - y1)*(x3 - x1); 
  //const sign = area > 0 ? 1 : -1;

  function checkHalfPlane(x, y, l0, l1) {
    const a = l1[1] - l0[1];
    const b = l0[0] - l1[0];
    const c = (l1[0] * l0[1]) - (l0[0] * l1[1]);

    return (a * (x) + b * (y) + c) >= 0;
  }

  let pixelsWritten = 0
  for (let x = Math.floor(xmin); x <= Math.ceil(xmax); x++) {
    for (let y = Math.floor(ymin); y <= Math.ceil(ymax); y++) {
      if (
        checkHalfPlane(x, y, v1, v2) &&
        checkHalfPlane(x, y, v2, v3) &&
        checkHalfPlane(x, y, v3, v1)
      ) {
        const p = [x, y];
        const a0 = getTriangleArea(p, v2, v3);
        const a1 = getTriangleArea(p, v1, v3);
        const a2 = getTriangleArea(p, v1, v2);
        const A = a0 + a1 + a2
        const u = a0 / A;
        const v = a1 / A;
        const w = a2 / A;

        const r = u * r1 + v * r2 + w * r3;
        const g = u * g1 + v * g2 + w * g3;
        const b = u * b1 + v * b2 + w * b3;

        this.setPixel(x, y, [r, g, b]);
        //console.log("Painting pixel: ", a0, a1, a2, A);
      }
    }
  }


}



////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////

/*
const DEF_INPUT = [
  "v,10,10,1.0,0.0,0.0;",
  "v,52,52,0.0,1.0,0.0;",
  "v,52,10,0.0,0.0,1.0;",
  "v,10,52,1.0,1.0,1.0;",
  "t,0,1,2;",
  "t,0,3,1;",
  "v,10,10,1.0,1.0,1.0;",
  "v,10,52,0.0,0.0,0.0;",
  "v,52,52,1.0,1.0,1.0;",
  "v,52,10,0.0,0.0,0.0;",
  "l,4,5;",
  "l,5,6;",
  "l,6,7;",
  "l,7,4;"
].join("\n");
*/


function exportTriangles(triangles) {
  const vertices = [];
  const lines = [];
  let vertexIndex = 0;

  for (const tri of triangles) {
    // tri = { v1: {x,y,r,g,b}, v2: {...}, v3: {...} }
    for (const v of [tri.v1, tri.v2, tri.v3]) {
      const existing = vertices.findIndex(
        (p) => p.x === v.x && p.y === v.y && p.r === v.r && p.g === v.g && p.b === v.b
      );
      if (existing === -1) {
        vertices.push(v);
      }
    }
  }

  // Write out vertices
  for (const v of vertices) {
    lines.push(`v,${v.x},${v.y},${v.r},${v.g},${v.b};`);
  }

  // Write out triangles using vertex indices
  for (const tri of triangles) {
    const i = vertices.findIndex(
      (v) => v.x === tri.v1.x && v.y === tri.v1.y && v.r === tri.v1.r && v.g === tri.v1.g && v.b === tri.v1.b
    );
    const j = vertices.findIndex(
      (v) => v.x === tri.v2.x && v.y === tri.v2.y && v.r === tri.v2.r && v.g === tri.v2.g && v.b === tri.v2.b
    );
    const k = vertices.findIndex(
      (v) => v.x === tri.v3.x && v.y === tri.v3.y && v.r === tri.v3.r && v.g === tri.v3.g && v.b === tri.v3.b
    );

    lines.push(`t,${i},${j},${k};`);
  }

  return lines.join("\n");
}


async function loadOBJasTriangles(url) {
  const res = await fetch(url);
  const text = await res.text();

  const vertices = [];
  const triangles = [];

  // Parse obj file
  for (const line of text.split('\n')) {
    const parts = line.trim().split(/\s+/);

    if (parts[0] === 'v') {
      // vertex line: v x y z
      const [_, x, y, z] = parts;
      vertices.push({ x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) });
    }
    else if (parts[0] === 'f') {
      // face line: f a b c  
      const [_, ...indices] = parts;
      if (indices.length < 3) continue; // skip invalid faces

      // OBJ indices can include texture/normal info, like "3/1/2"
      const toIndex = (token) => parseInt(token.split('/')[0]) - 1;
      const [i1, i2, i3] = indices.map(toIndex);

      /*
      // default vertex color
      const c1 = { r: 0.5, g: 0.5, b: 0.5 };
      const c2 = { r: 0.5, g: 0.5, b: 0.5 };
      const c3 = { r: 0.5, g: 0.5, b: 0.5 };
      */

      triangles.push({
        v1: { ...vertices[i1]},
        v2: { ...vertices[i2]},
        v3: { ...vertices[i3]}
      });
    }
  }

  return triangles;
}

// Lmabertian shadeing
// Unused. Code shades by vertex now
function shadeTriangles(triangles, lightDir) {
  const L = normalize(lightDir);

  function computeNormal(v1, v2, v3) {
    const ux = v2.x - v1.x;
    const uy = v2.y - v1.y;
    const uz = v2.z - v1.z;

    const vx = v3.x - v1.x;
    const vy = v3.y - v1.y;
    const vz = v3.z - v1.z;

    return normalize([
      uy * vz - uz * vy,
      uz * vx - ux * vz,
      ux * vy - uy * vx
    ]);
  }

  return triangles.map(tri => {
    const n = computeNormal(tri.v1, tri.v2, tri.v3);

    // lambert: max(0, NdotL)
    const intensity = Math.max(0, dot(n, L));


    const base = 0.8;
    const color = {
      r: base * intensity,
      g: base * intensity,
      b: base * intensity
    };

    return {
      v1: { ...tri.v1, ...color },
      v2: { ...tri.v2, ...color },
      v3: { ...tri.v3, ...color }
    };
  });
}


// shade per vertex instead 
function computeVertexNormals(triangles) {
  const normalMap = new Map();

  function key(v) {
    return `${v.x},${v.y},${v.z}`;
  }

  function addNormal(v, n) {
    const k = key(v);
    if (!normalMap.has(k)) normalMap.set(k, [0, 0, 0]);
    normalMap.get(k)[0] += n[0];
    normalMap.get(k)[1] += n[1];
    normalMap.get(k)[2] += n[2];
  }

  function computeFaceNormal(v1, v2, v3) {
    const ux = v2.x - v1.x, uy = v2.y - v1.y, uz = v2.z - v1.z;
    const vx = v3.x - v1.x, vy = v3.y - v1.y, vz = v3.z - v1.z;
    return normalize([
      uy*vz - uz*vy,
      uz*vx - ux*vz,
      ux*vy - uy*vx
    ]);
  }

  for (const tri of triangles) {
    const n = computeFaceNormal(tri.v1, tri.v2, tri.v3);
    addNormal(tri.v1, n);
    addNormal(tri.v2, n);
    addNormal(tri.v3, n);
  }

  return triangles.map(tri => {
    return {
      v1: { ...tri.v1, n: normalize(normalMap.get(key(tri.v1))) },
      v2: { ...tri.v2, n: normalize(normalMap.get(key(tri.v2))) },
      v3: { ...tri.v3, n: normalize(normalMap.get(key(tri.v3))) }
    };
  });
}

const CameraPos = [0, 0, 0];

function shadeVertices(triangles, lightDir) {
  const L = normalize(lightDir);

  return triangles.map(tri => {
    function shadeVertex(v) {
      const ndotl = Math.max(0, dot(v.n, L));
      const rbase = 0.95;
      const gbase = 0.95;
      const bbase = 0.95;

      const V = [CameraPos, CameraPos, CameraPos-3.5];
      

      return {
        ...v,
        r: rbase * ndotl,
        g: gbase * ndotl,
        b: bbase * ndotl
      };
    }

    return {
      v1: shadeVertex(tri.v1),
      v2: shadeVertex(tri.v2),
      v3: shadeVertex(tri.v3)
    };
  });
}




// ========================= Helper funcs ==============================
function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  return len ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}


function projectVertex(v, fov, aspect) {
  const f = 1 / Math.tan(fov / 2);
  const x = v.x, y = v.y, z = v.z;
  const xp = (f / aspect) * (x / z);
  const yp = f * (y / z);
  return { x: xp, y: yp, ...v };
}

function projectTriangles(triangles, fov, aspect) {
  return triangles.map(t => ({
    v1: projectVertex(t.v1, fov, aspect),
    v2: projectVertex(t.v2, fov, aspect),
    v3: projectVertex(t.v3, fov, aspect)
  }));
}

function computeTriangleDepth(tri) {
  const z1 = tri.v1.z, z2 = tri.v2.z, z3 = tri.v3.z;
  return (z1 + z2 + z3) / 3;  // average the depth
  //return Math.max(z1, z2, z3);
}

function depthToCamera(point, cameraPos) {
  const dx = point.x - cameraPos.x;
  const dy = point.y - cameraPos.y;
  const dz = point.z - cameraPos.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function clamp(num, min, max) {
  return num <= min 
    ? min 
    : num >= max 
      ? max 
      : num
}


function degToRad(d) { return (d * Math.PI) / 180; }

// rotate, scale, and translate
function transformVertex(v, transform) {
  let { x, y, z } = v;
  const { rx, ry, rz, sx, sy, sz, tx, ty, tz } = transform;

  // scale 
  x *= sx; y *= sy; z *= sz;

  // rotate x
  let y1 = y * Math.cos(rx) - z * Math.sin(rx);
  let z1 = y * Math.sin(rx) + z * Math.cos(rx);
  y = y1; z = z1;

  // rotate y
  let x2 = x * Math.cos(ry) + z * Math.sin(ry);
  let z2 = -x * Math.sin(ry) + z * Math.cos(ry);
  x = x2; z = z2;

  // rotate z
  let x3 = x * Math.cos(rz) - y * Math.sin(rz);
  let y3 = x * Math.sin(rz) + y * Math.cos(rz);
  x = x3; y = y3;

  // translate 
  x += tx; y += ty; z += tz;

  return { ...v, x, y, z };
}

function isBackFacing(tri) {
  const v1 = tri.v1, v2 = tri.v2, v3 = tri.v3;

  // screenspace vectors
  const ax = v2.x - v1.x;
  const ay = v2.y - v1.y;
  const bx = v3.x - v1.x;
  const by = v3.y - v1.y;

  const cross = ax * by - ay * bx;

  return cross <= 0;
}


// load mesh (To the TA: You can specify whichever mesh you want. I just chose this one)
const trianglesfromobj = await loadOBJasTriangles('teddybear.obj');
const corsProxy = "https://corsproxy.io/?url=";
const teapotURL = "https://graphics.stanford.edu/courses/cs148-10-summer/as3/code/as3/teapot.obj";
//const trianglesfromobj  = await loadOBJasTriangles(corsProxy + encodeURIComponent(teapotURL));

async function initDefaultInput() {
  let triangles = trianglesfromobj;

  // transform a bit
  /*
  const transform = {
    rx: 0.25*Math.sin((Date.now()/1500) - 1762912454),  // tilt
    ry: ((Date.now()/5000) - 1762912454), // spin Y
    rz: 0,
    sx: 0.3, sy: 0.3, sz: 0.3, // uniform scale
    tx: 0, ty: -0.2, tz: 3.5 // pull forward a bit
  };*/
  
  const transform = {
    rx: 0.25 * Math.sin((Date.now() / 1500) - 1762912454),  // tilt
    ry: ((Date.now() / 5000) - 1762912454), // spin Y
    rz: 0,
    sx: 0.05, sy: 0.05, sz: 0.05, // uniform scale
    tx: 0, ty: 0, tz: 3.5 // pull forward a bit
  };



  // Apply transform to all vertices to worl dpsace
  let transformed = triangles.map(t => ({
    v1: transformVertex(t.v1, transform),
    v2: transformVertex(t.v2, transform),
    v3: transformVertex(t.v3, transform)
  }));



  //shading
  const lightDir = [1, 0.8, 1.0]; 
  // unused 
  //transformed = shadeTriangles(transformed, lightDir);

  // Gourad 
  transformed = computeVertexNormals(transformed);
  transformed = shadeVertices(transformed, lightDir);

  // sort triangles by depth
  transformed.sort((a, b) => computeTriangleDepth(a) - computeTriangleDepth(b));


  // project
  const fov = (74 * Math.PI) / 180;
  const aspect = 1.0;
  let projected = projectTriangles(transformed, fov, aspect);

  projected = projected.filter(tri => !isBackFacing(tri));


  // Normalize and scale to screen space
  const scaled = projected.map(t => {
    function scaleVertex(v) {
      const sx = (v.x + 1) * (WINDOW_SIZE-1)/2;
      const sy = (1 - v.y) * (WINDOW_SIZE-1)/2;
      return { x: clamp(sx, 0, WINDOW_SIZE-1), y: clamp(sy, 0, WINDOW_SIZE-1), r: v.r, g: v.g, b: v.b };
    }
    return { v1: scaleVertex(t.v1), v2: scaleVertex(t.v2), v3: scaleVertex(t.v3) };
  });

  // Export triangles to assignment format
  return exportTriangles(scaled);
}


// Run
const WINDOW_SIZE = 300;
let DEF_INPUT = "";
await initDefaultInput().then(t => DEF_INPUT = t);

// Used only in custom HTML to update at 60hz. Unused in regular assignment
Rasterizer.prototype.heartbeat = async function (v1, v2, v3) {
  return await initDefaultInput();
}


// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
