import gsap from "gsap";
import { Mesh, PlaneGeometry, Raycaster, ShaderMaterial, MeshBasicMaterial, TextureLoader, Vector2, Vector4, Vector3 } from "three";
import vertexShader from "./shader/plane/vertex.glsl";
import fragmentShader from "./shader/plane/fragment.glsl";
import { loadTexture } from "./loadTexture";
import { lerp, easeOutCubic } from "./utils";

export class Object {
  constructor(stage, params) {
    this.stage = stage;
    this.params = params;

    this.geometry = null;
    this.material = null;
    this.mesh = null;

    this.canvas = this.stage.renderer.domElement;
    this.canvasRect = this.canvas.getBoundingClientRect();

    this.elements = [...document.querySelectorAll(".hover-item")];

    this.os = [];

    this.textureLoader = new TextureLoader();
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();
    this.mousePos = new Vector2();
    this.mouseCurrentPos = new Vector2();

    this.init();
  }

  init() {
    this.setObjects();
  }

  onPointerMove(event) {
    // this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    // this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    // console.log(this.pointer);
    // console.log(this.mousePos);
    // this.raycast();
  }

  raycast() {
    this.raycaster.setFromCamera(this.pointer, this.stage.camera);
    const intersects = this.raycaster.intersectObjects(this.stage.scene.children);
    // console.log(this.stage.scene.children);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      // console.log(obj);
      obj.material.uniforms.uMouse.value = intersects[i].uv;
    }
  }

  getPostion(rect, canvasRect) {
    const x = rect.left + rect.width / 2 - canvasRect.width / 2;
    const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
    return { x, y };
  }

  // getScroll(o) {
  //   const { $el, mesh } = o;
  //   const rect = $el.getBoundingClientRect();
  //   const { x, y } = this.getPostion(rect, this.canvasRect);
  //   // mesh.position.x = x;
  //   mesh.position.y = y;
  // }

  getResize(o, newCanvasRect) {
    const { $el, mesh, geometry, rect } = o;
    const img = $el.querySelector("img");
    const nextRect = img.getBoundingClientRect();
    const { x, y } = this.getPostion(nextRect, newCanvasRect);
    // mesh.position.x = x;
    // mesh.position.y = y;
    mesh.position.x = 0;
    mesh.position.y = 0;
    console.log(mesh.position);
    // geometry.scale(nextRect.width / rect.width, nextRect.height / rect.height, 1);
    o.rect = nextRect;
    // console.log(o.rect.width);
  }

  async setObjects() {
    this.materials = [];
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector4() },
        uTexture: { value: null }, //texture data
        uOffset: { value: new Vector2(0.0, 0.0) }, //distortion strength
        uMeshSize: { value: new Vector2(0.0, 0.0) },
        uMediaSize: { value: new Vector2(0.0, 0.0) },
        uAlpha: { value: 0.0 }, //opacity
        uMouseEnter: { value: 0.0 },
        uMouseEnterMask: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      // map: texture,
      // wireframe: true,
      // side: DoubleSide,
    });

    for (const el of this.elements) {
      const plane = document.querySelector(".plane");

      const img = el.querySelector("img");
      // const img = el.dataset["glImg"];
      const rect = img.getBoundingClientRect();

      this.geometry = new PlaneGeometry(1, 1, 64, 64);
      // this.geometry = new PlaneGeometry(rect.width, rect.height, 32, 32);

      try {
        // const texture = await loadTexture(this.textureLoader, img.src);
        const material = this.material.clone();
        // material.uniforms.uTexture.value = texture;

        // el.addEventListener("pointerenter", () => {
        //   gsap.to(material.uniforms.uAlpha, {
        //     value: 1,
        //     duration: 0.5,
        //     ease: "power4.out",
        //   });
        //   gsap.fromTo(
        //     material.uniforms.uMouseEnter,
        //     {
        //       value: 0,
        //     },
        //     {
        //       value: 1,
        //       duration: 1.2,
        //       ease: "power2.out",
        //     },
        //   );
        //   gsap.fromTo(
        //     material.uniforms.uMouseEnterMask,
        //     {
        //       value: 0,
        //     },
        //     {
        //       value: 1,
        //       duration: 0.7,
        //       ease: "power2.out",
        //     },
        //   );
        // });

        // el.addEventListener("pointerout", () => {
        //   gsap.to(material.uniforms.uAlpha, {
        //     value: 0,
        //     duration: 0.5,
        //     ease: "power4.out",
        //   });
        // });

        // this.materials.push(material);

        // console.log(plane.clientWidth);

        this.mesh = new Mesh(this.geometry, material);
        // this.mesh.scale.set(rect.width, rect.height, 0);
        this.mesh.scale.set(plane.clientWidth, plane.clientHeight, 1);

        // this.mesh.material.uniforms.uMeshSize.value.w = this.mesh.scale.x;
        // this.mesh.material.uniforms.uMeshSize.value.h = this.mesh.scale.y;
        // // this.mesh.material.uniforms.uMediaSize.value.w = rect.width;
        // // this.mesh.material.uniforms.uMediaSize.value.h = rect.height;
        // this.mesh.material.uniforms.uMediaSize.value.w = img.naturalWidth;
        // this.mesh.material.uniforms.uMediaSize.value.h = img.naturalHeight;
        // // console.log(rect.width);
        // // console.log(this.mesh.material.uniforms.uMeshSize.value.h);

        const { x, y } = this.getPostion(rect, this.canvasRect);
        this.mesh.position.x = this.mousePos.x;
        this.mesh.position.y = this.mousePos.y;
        this.mesh.position.z = 0;
        console.log(this.mesh.position);

        const viewAnimation = async (item) => {
          if (item) {
            const img = item.querySelector("img");
            const texture = await loadTexture(this.textureLoader, img.src);
            // const material = this.material.clone();
            this.mesh.material.uniforms.uTexture.value = texture;
            this.materials.push(this.mesh.material);
            // this.mesh.material.uniforms.uMeshSize.value.w = this.mesh.scale.x;
            // this.mesh.material.uniforms.uMeshSize.value.h = this.mesh.scale.y;
            // this.mesh.material.uniforms.uMediaSize.value.w = img.naturalWidth;
            // this.mesh.material.uniforms.uMediaSize.value.h = img.naturalHeight;

            this.mesh.material.uniforms.uMeshSize.value = new Vector2(this.mesh.scale.x, this.mesh.scale.y);
            this.mesh.material.uniforms.uMediaSize.value = new Vector2(img.naturalWidth, img.naturalHeight);

            gsap.to(this.mesh.material.uniforms.uAlpha, {
              value: 1,
              duration: 0.3,
              delay: 0.025,
              ease: "power4.out",
            });
            gsap.fromTo(
              this.mesh.material.uniforms.uMouseEnter,
              {
                value: 0,
              },
              {
                value: 1,
                duration: 1.2,
                ease: easeOutCubic,
              },
            );
            gsap.fromTo(
              this.mesh.material.uniforms.uMouseEnterMask,
              {
                value: 0,
              },
              {
                value: 1,
                duration: 0.7,
                ease: easeOutCubic,
              },
            );
          } else {
            gsap.to(this.mesh.material.uniforms.uAlpha, {
              value: 0,
              duration: 0.3,
              ease: "power4.out",
            });
          }
        };

        let currentItem = null;

        el.addEventListener("pointerenter", () => {
          currentItem = el;
          viewAnimation(currentItem);
        });

        el.addEventListener("pointerout", () => {
          currentItem = null;
          viewAnimation(currentItem);
        });

        const o = {
          mesh: this.mesh,
          geometry: this.geometry,
          material: material,
          rect: rect,
          $el: el,
        };

        this.stage.scene.add(this.mesh);
        this.os.push(o);
      } catch (error) {
        console.error(`Failed to load texture for ${img.src}:`, error);
      }
    }
  }

  onUpdate(time) {
    this.os.forEach((o) => {
      // this.getScroll(o);
      o.material.uniforms.uTime.value = time;
      this.mousePos.x = lerp(this.mousePos.x, this.pointer.x, 0.1);
      this.mousePos.y = lerp(this.mousePos.y, this.pointer.y, 0.1);
      this.mesh.material.uniforms.uOffset.value.set((this.pointer.x - this.mousePos.x) * 0.006, -(this.pointer.y - this.mousePos.y) * 0.006);
      o.mesh.position.set(this.mousePos.x - window.innerWidth / 2, -this.mousePos.y + window.innerHeight / 2, 0);
      // o.mesh.position.set(this.mousePos.x, this.mousePos.y, 0);
      // console.log(this.mousePos);
    });
  }

  onResize(props) {
    this.params.w = props.w;
    this.params.h = props.h;
    this.params.aspect = props.aspect;
    this.params.shorter = props.shorter;
    this.params.longer = props.longer;

    const newCanvasRect = this.canvas.getBoundingClientRect();
    this.os.forEach((o) => this.getResize(o, newCanvasRect));
  }
}
