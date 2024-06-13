varying vec2 vUv;

uniform float uTime;
uniform float uMouseEnter;
uniform vec2 uOffset;
uniform vec2 uMeshSize;

float PI = 3.1415926535897932384626433832795;

vec2 scale(in vec2 st,in vec2 s,in vec2 center){
  return( st - center ) * s + center;
}

float saturate(float a){
  return clamp( a, 0.0, 1.0 );
}

// https://tympanus.net/codrops/2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/
vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
  position.x = position.x + ( sin( uv.y * PI ) * offset.x);
  position.y = position.y + (sin( uv.x * PI ) * offset.y);
  return position;
}

vec2 getUVScale(){
  // return vec2(.63);
  float d = length(uMeshSize);
  float longEdge = max(uMeshSize.x, uMeshSize.y);
  float dRatio = d / longEdge;
  float mRatio = uMeshSize.x / uMeshSize.y;
  return vec2(mRatio / dRatio);
}

// https://github.com/Anemolo/GridToFullscreenAnimations/blob/master/js/GridToFullscreenEffect.js
float getProgress(float activation, float latestStart, float progress, float progressLimit){
  float startAt = activation * latestStart;
  float pr = smoothstep( startAt, 1.0, progress );
  float p = min( saturate( pr / progressLimit ), saturate(( 1.0 - pr ) / (1.0 - progressLimit)));
  return p;
}

vec3 distort(vec3 p){
  vec2 uvDistortion = uv;
  vec2 uvScale = getUVScale();
  uvDistortion = scale( uvDistortion, uvScale, vec2(0.5) );
  uvDistortion = ( uvDistortion - 0.5) * 2.0;
  // vDummy=uvDistortion;
  float d = length( uvDistortion );
  float pr = getProgress( d, 0.8, uMouseEnter, 0.75) * 0.08;
  // vDummy=vec2(pr*3.);
  p.xy *= ( 1.0 + pr);
  return p;
}

void main() {
  // vUv = uv + (uOffset * 2.0);
  // // vUv = uv;
  // vec3 newPosition = deformationCurve(position, uv, uOffset);

  // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);


  vUv = uv;
  vec3 newPosition = deformationCurve(position, uv, uOffset);
  newPosition = distort(newPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}