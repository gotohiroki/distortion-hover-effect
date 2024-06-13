import GSAP from "gsap";
import { CustomEase } from "gsap/CustomEase";
GSAP.registerPlugin(CustomEase);

// 線形補間
export const lerp = (start, end, multiplier) => {
  return (1 - multiplier) * start + multiplier * end;
};

export const easeOutCubic = CustomEase.create("easeOutCubic", "0.215, 0.61, 0.355, 1");
