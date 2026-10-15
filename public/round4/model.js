import {render as uiRender} from '../ui/index.js';
import {takeCrystal} from '../reference/model-bridge.js';
import * as T from "../vendor/round4/model.js";
import {
  $,
  box,
  row,
  field,
  button,
  select,
  number,
  setStatus,
  download,
  watchSize,
  finite,
} from "./common.js";
export function validateGLTF(buffer, isBinary) {
  let data;
  if (isBinary) {
    const v = new DataView(buffer);
    if (
      buffer.byteLength < 20 ||
      v.getUint32(0, true) !== 0x46546c67 ||
      v.getUint32(4, true) !== 2 ||
      v.getUint32(8, true) !== buffer.byteLength ||
      v.getUint32(16, true) !== 0x4e4f534a
    )
      throw Error("无效 GLB 2.0 文件。");
    const n = v.getUint32(12, true);
    if (n > buffer.byteLength - 20) throw Error("GLB 数据长度无效。");
    data = JSON.parse(
      new TextDecoder().decode(new Uint8Array(buffer, 20, n)).trim(),
    );
  } else data = JSON.parse(new TextDecoder().decode(buffer));
  if (!String(data.asset?.version || "").startsWith("2"))
    throw Error("仅支持 glTF 2.0。");
  for (const item of [...(data.buffers || []), ...(data.images || [])])
    if (
      item.uri &&
      !/^data:(?:application\/octet-stream|application\/gltf-buffer|image\/(?:png|jpeg|webp));base64,[A-Za-z0-9+/=\r\n]+$/.test(
        item.uri,
      )
    )
      throw Error(
        "模型引用了外部资源。请导出为内嵌资源的 GLB 后打开，本站不会联网下载模型附件。",
      );
  if (data.extensionsRequired?.some((x) => /draco|meshopt|basisu/i.test(x)))
    throw Error("暂不支持 Draco、Meshopt 或 KTX2 压缩，请导出未压缩 GLB。");
  const bounded = (n, max) => Number.isSafeInteger(n) && n >= 0 && n <= max;
  for (const b of data.buffers || [])
    if (!bounded(b.byteLength, 32 * 1024 * 1024))
      throw Error("模型缓冲区大小无效或超限。");
  for (const a of data.accessors || [])
    if (!bounded(a.count, 1000000)) throw Error("模型顶点或索引数量超限。");
  if ((data.nodes?.length || 0) > 10000 || (data.images?.length || 0) > 32)
    throw Error("模型节点或纹理数量超限。");
  return data;
}
export function validateMesh(buffer, extension) {
  if (extension === "stl") {
    const v = new DataView(buffer),
      header = new TextDecoder().decode(
        new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 80)),
      );
    if (buffer.byteLength >= 84) {
      const triangles = v.getUint32(80, true);
      if (84 + triangles * 50 === buffer.byteLength) {
        if (triangles * 3 > 1000000) throw Error("模型超过 100 万顶点。");
        return;
      }
    }
    if (!header.trimStart().startsWith("solid"))
      throw Error("STL 长度与三角面计数不符。");
    const text = new TextDecoder().decode(buffer);
    if ((text.match(/\bvertex\s/g) || []).length > 1000000)
      throw Error("模型超过 100 万顶点。");
  } else if (extension === "obj") {
    let vertices = 0;
    for (const line of new TextDecoder().decode(buffer).split(/\r?\n/)) {
      if (/^\s*f\s/.test(line))
        vertices += Math.max(0, line.trim().split(/\s+/).length - 3) * 3;
      if (vertices > 1000000) throw Error("展开后的模型超过 100 万顶点。");
    }
  }
}
export function init(root) {
  uiRender(root, box(
    row(
      field(
        "本地模型（STL / OBJ / GLB / 内嵌 glTF）",
        '<input id="model-file" type="file" accept=".stl,.obj,.glb,.gltf">',
      ) +
        button("model-reset", "重置视角") +
        button("model-save", "下载视图 PNG"),
    ) +
      row(
        field(
          "显示方式",
          select("model-style", [
            ["solid", "实体"],
            ["wire", "线框"],
          ]),
        ) +
          field(
            "自动旋转",
            select("model-rotate", [
              ["off", "关闭"],
              ["on", "开启"],
            ]),
          ) +
          field(
            "剖切轴",
            select("model-clip", [
              ["none", "关闭"],
              ["x", "X 轴"],
              ["y", "Y 轴"],
              ["z", "Z 轴"],
            ]),
          ) +
          field(
            "剖切位置（归一化）",
            number("model-offset", 0, -1.8, 1.8, 0.05),
          ),
      ) +
      '<div id="model-view" class="r4-view" aria-label="三维模型，拖动旋转，双指缩放和平移"></div><pre id="model-info" class="r4-output"></pre>',
  ));
  const host = $("model-view");
  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
  } catch {
    host.textContent =
      "此浏览器无法启用 WebGL。请在支持 WebGL 的浏览器中打开。";
    setStatus("model-status", "三维渲染不可用。", true);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  host.append(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color("#0b111b");
  scene.add(new T.HemisphereLight(0xffffff, 0x34445b, 3));
  const light = new T.DirectionalLight(0xffffff, 3);
  light.position.set(3, 4, 5);
  scene.add(light);
  const camera = new T.PerspectiveCamera(45, 1, 0.01, 100),
    controls = new T.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  const plane = new T.Plane(new T.Vector3(1, 0, 0), 0);
  let object = null,
    token = 0,
    frame = 0,
    active = !$("panel-model").hidden;
  function dispose(o) {
    if (!o) return;
    const textures = new Set();
    o.traverse((n) => {
      n.geometry?.dispose();
      for (const m of Array.isArray(n.material)
        ? n.material
        : n.material
          ? [n.material]
          : []) {
        for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
        m.dispose();
      }
    });
    textures.forEach((t) => {
      t.source?.data?.close?.();
      t.dispose();
    });
  }
  function render() {
    renderer.render(scene, camera);
  }
  function home() {
    camera.position.set(2.8, 2, 3);
    controls.target.set(0, 0, 0);
    controls.update();
    render();
  }
  function animate() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (
      !active ||
      document.hidden ||
      $("model-rotate").value !== "on" ||
      !object
    )
      return;
    controls.autoRotate = true;
    controls.update();
    render();
    frame = requestAnimationFrame(animate);
  }
  controls.addEventListener("change", render);
  function appearance() {
    if (object)
      object.traverse((n) => {
        if (n.isMesh)
          for (const m of Array.isArray(n.material)
            ? n.material
            : [n.material]) {
            m.wireframe = $("model-style").value === "wire";
            m.clippingPlanes = $("model-clip").value === "none" ? [] : [plane];
            m.side = T.DoubleSide;
            m.needsUpdate = true;
          }
      });
    const axis = $("model-clip").value;
    plane.normal.set(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0,
    );
    plane.constant = finite($("model-offset").value, -1.8, 1.8);
    render();
  }
  $("model-file").onchange = async () => {
    const version = ++token,
      file = $("model-file").files[0];
    if (!file) return;
    setStatus("model-status", "正在解析本地模型…");
    let next;
    try {
      if (file.size > 16 * 1024 * 1024) throw Error("模型不能超过 16 MB。");
      const buffer = await file.arrayBuffer();
      if (version !== token) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "stl") {
        validateMesh(buffer, ext);
        const geometry = new T.STLLoader().parse(buffer);
        next = new T.Mesh(
          geometry,
          new T.MeshStandardMaterial({ color: 0xd6b575, roughness: 0.65 }),
        );
      } else if (ext === "obj") {
        validateMesh(buffer, ext);
        next = new T.OBJLoader().parse(new TextDecoder().decode(buffer));
      } else if (ext === "glb" || ext === "gltf") {
        validateGLTF(buffer, ext === "glb");
        const manager = new T.LoadingManager();
        manager.setURLModifier((url) => {
          if (url.startsWith("data:") || url.startsWith("blob:")) return url;
          throw Error("禁止获取模型外部资源。");
        });
        const loader = new T.GLTFLoader(manager);
        const gltf = await loader.parseAsync(
          ext === "glb" ? buffer : new TextDecoder().decode(buffer),
          "",
        );
        next = gltf.scene;
      } else throw Error("请选择 STL、OBJ、GLB 或内嵌 glTF。");
      if (version !== token) {
        dispose(next);
        return;
      }
      let vertices = 0,
        triangles = 0,
        meshes = 0;
      next.traverse((n) => {
        if (n.isMesh) {
          meshes++;
          const p = n.geometry.attributes.position;
          if (!p) return;
          vertices += p.count;
          triangles += (n.geometry.index?.count || p.count) / 3;
          for (const v of p.array)
            if (!Number.isFinite(v)) throw Error("模型包含无效顶点。");
        }
      });
      if (!meshes || !vertices) throw Error("模型没有可显示的三角网格。");
      if (vertices > 1000000) throw Error("模型超过 100 万顶点。");
      const bounds = new T.Box3().setFromObject(next),
        size = bounds.getSize(new T.Vector3()),
        center = bounds.getCenter(new T.Vector3()),
        extent = Math.max(size.x, size.y, size.z);
      if (!Number.isFinite(extent) || extent <= 0)
        throw Error("模型尺寸无效。");
      const wrapper = new T.Group();
      wrapper.add(next);
      next.position.sub(center);
      wrapper.scale.setScalar(2 / extent);
      if (object) {
        scene.remove(object);
        dispose(object);
      }
      object = wrapper;
      scene.add(object);
      $("model-info").textContent =
        `${file.name}\n网格 ${meshes} · 顶点 ${vertices} · 三角面 ${Math.round(triangles)}\n原始包围盒 ${size.x.toPrecision(5)} × ${size.y.toPrecision(5)} × ${size.z.toPrecision(5)}（模型单位）`;
      $("model-info").dataset.kind="mesh";
      home();
      appearance();
      animate();
      setStatus("model-status", "模型已载入，文件未上传。");
    } catch (e) {
      dispose(next);
      if (version === token)
        setStatus("model-status", "无法读取模型：" + e.message, true);
    }
  };
  $("model-reset").onclick = home;
  $("model-style").onchange =
    $("model-clip").onchange =
    $("model-offset").oninput =
      () => {
        try {
          appearance();
        } catch (e) {
          setStatus("model-status", e.message, true);
        }
      };
  $("model-rotate").onchange = () => {
    controls.autoRotate = $("model-rotate").value === "on";
    animate();
  };
  $("model-save").onclick = () => {
    if (!object) {
      setStatus("model-status", "先打开模型。", true);
      return;
    }
    render();
    renderer.domElement.toBlob((b) => {
      if (b) download(b, "模型视图.png", "image/png");
    });
  };
  watchSize(host, (w, h) => {
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  });
  document.addEventListener("arg:panelchange", (e) => {
    active = e.detail.name === "model";
    animate();
  });
  document.addEventListener("visibilitychange", animate);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(frame);
    setStatus(
      "model-status",
      "图形上下文已丢失，请重新打开网页后载入模型。",
      true,
    );
  });
  function loadPendingCrystal() {
    const model = takeCrystal();
    if (!model) return;
    ++token; // A pending local file parse cannot replace a newer crystal.
    let next;
    try {
      if (!Array.isArray(model.atoms) || model.atoms.length > 2000 || !model.atoms.length)
        throw Error('晶体原子数量无效。');
      next = new T.Group();
      const palette = {H:0xeeeeee,C:0x657589,N:0x5077ff,O:0xe85454,F:0x90db75,Na:0xab7aff,Mg:0x65cf5c,Al:0xc3c9cf,Si:0xe1bd92,P:0xf6a24a,S:0xf0d64b,Cl:0x64d369,K:0x9871df,Ca:0x70b79d,Fe:0xc4774b,Cu:0xcf914c,Mn:0xa683a9};
      const geometry = new T.SphereGeometry(1,12,8),materials = new Map();
      for (const atom of model.atoms) {
        if (!Array.isArray(atom.position) || atom.position.length!==3 || atom.position.some(n=>!Number.isFinite(n)))
          throw Error('原子位置无效。');
        const key=atom.element+':'+atom.occupancy;
        if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:palette[atom.element]??0xbda7b5,roughness:.55,transparent:atom.occupancy<1,opacity:Math.max(.2,atom.occupancy)}));
        const mesh=new T.Mesh(geometry,materials.get(key));
        mesh.position.set(...atom.position);mesh.scale.setScalar(atom.element==='H'?.16:.27);next.add(mesh);
      }
      const edges=[];
      for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))edges.push(...model.corners[i],...model.corners[i|bit]);
      const cellGeometry=new T.BufferGeometry();cellGeometry.setAttribute('position',new T.Float32BufferAttribute(edges,3));
      next.add(new T.LineSegments(cellGeometry,new T.LineBasicMaterial({color:0x50c4ce})));
      const bounds=new T.Box3().setFromObject(next),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),extent=Math.max(size.x,size.y,size.z);
      if(!Number.isFinite(extent)||extent<=0)throw Error('晶体尺寸无效。');
      const wrapper=new T.Group();wrapper.add(next);next.position.sub(center);wrapper.scale.setScalar(2/extent);
      if(object){scene.remove(object);dispose(object);}object=wrapper;scene.add(object);
      const counts={};for(const atom of model.atoms)counts[atom.element]=(counts[atom.element]||0)+1;
      $("model-info").textContent=`${model.title} · ${model.formula}\n空间群 ${model.group || '未提供'} · ${model.repeat} × ${model.repeat} × ${model.repeat} 晶胞\n独立位点 ${model.sites} · 每晶胞展开 ${model.unitAtoms} 原子 · 当前 ${model.atoms.length} 原子\n${Object.entries(counts).map(([k,v])=>k+': '+v).join(' · ')}\n晶胞 a/b/c：${model.cell.join(' / ')} Å\nα/β/γ：${model.angles.join(' / ')}°\n${model.citation}\n球体大小仅为示意，不代表真实原子半径；透明度表示部分占位，不推断化学键。`;
      $("model-info").dataset.kind='crystal';
      home();appearance();animate();setStatus('model-status','晶体已载入，可拖动、缩放、剖切或下载视图。');
    } catch(e) {dispose(next);setStatus('model-status','晶体无法显示：'+e.message,true);}
  }
  document.addEventListener('arg:crystal-ready',loadPendingCrystal);
  home();
  setStatus("model-status", "选择本地模型开始观察，也可从晶体查询送入结构。");
  loadPendingCrystal();
}
