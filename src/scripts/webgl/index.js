import { SetControls } from "./lib/SetControls";
import { SetGui } from "./lib/SetGui";

import { Stage } from "./Stage";
import { Object } from "./Object";

export class WebGL {
  constructor(body, params) {
    this.body = body;
    this.params = params;

    this.gui = null;
    this.controls = null;

    this.stage = null;
    this.object = null;

    this.time = null;

    this.setModule();
  }

  setModule() {
    // this.gui = new SetGui();
    this.stage = new Stage("#webgl", this.params);
    this.object = new Object(this.stage, this.params);
    // this.controls = new SetControls(this.stage);
    this.onMouseMove();
    this.onUpdate();
  }

  onMouseMove() {
    this.body.addEventListener("pointermove", (event) => {
      this.object.onPointerMove(event);
    });
  }

  // 毎フレーム呼び出す
  onUpdate() {
    requestAnimationFrame(this.onUpdate.bind(this));
    this.time += 0.05;
    if (this.stage != null) this.stage.onUpdate();
    if (this.object != null) this.object.onUpdate(this.time);
    // if (this.background != null) this.background.onUpdate(this.time);
    // if (this.controls != null) this.controls.onUpdate();
  }

  onResize(props) {
    this.params.w = props.w;
    this.params.h = props.h;
    this.params.aspect = props.aspect;
    this.params.shorter = props.shorter;
    this.params.longer = props.longer;

    this.stage.onResize(props);
    this.object.onResize(props);
  }
}
