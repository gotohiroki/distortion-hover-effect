varying vec2 vUv;

uniform float uAlpha;
uniform float uMouseEnter;
uniform float uMouseEnterMask;
uniform vec2 uOffset;
uniform vec2 uMeshSize;
uniform vec2 uMediaSize;
uniform sampler2D uTexture;

// https://gist.github.com/statico/df64c5d167362ecf7b34fca0b1459a44
vec2 cover(vec2 s, vec2 i, vec2 uv) {
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2( i.x * s.y / i.y, s.y ) : vec2( s.x, i.y * s.x / i.x );
  vec2 offset = ( rs < ri ? vec2((new.x-s.x) / 2.0, 0.0 ) : vec2( 0.0,( new.y - s.y ) / 2.0)) / new;
  uv = uv * s / new + offset;
  return uv;
}

vec2 scale(in vec2 st, in vec2 s, in vec2 center) {
  return ( st - center ) * s + center;
}

vec2 ratio2(in vec2 v, in vec2 s) {
  return mix(vec2( v.x, v.y * (s.y / s.x)),
  vec2((v.x * s.x / s.y), v.y),
  step(s.x, s.y));
}

float ccLensScale(float distortion, float rsqLimit) {
  float distPulse = 1.+distortion*rsqLimit;
  float distMinus = 1./(1.-distortion*rsqLimit);
  return mix(distPulse, distMinus, step(distortion, 0.));
}

vec2 distort(vec2 uv){
  uv -= 0.5;
  float mRatio = uMeshSize.x / uMeshSize.y;
  // float mRatio = 300.0 / 300.0;
  
  // key lines
  float pUvX = pow( uv.x * mRatio, 2.0);
  float pUvY = pow( uv.y, 2.0 );
  float pSum = pUvX + pUvY;
  float multiplier = 10.0 * ( 1.0 - uMouseEnter );
  float strength = 1.0 - multiplier * pSum;
  // float strength = 1.0 + ccLensScale(multiplier, pSum);
  uv *= strength;
  uv += 0.5;
  return uv;
}

float getMaskDist(vec2 uv){
  uv = uv * 2.0 - 1.0;
  uv = ratio2( uv, uMeshSize );
  float d = length(uv);
  float aspectXY = uMeshSize.x / uMeshSize.y;
  float aspectYX = uMeshSize.y / uMeshSize.x;
  float aspect = min(aspectXY, aspectYX);
  d /= sqrt(1.0 + pow( aspect, 2.0 ));
  return d;
}

vec2 scaleUV(vec2 uv, float scale) {
  float center = 0.5;
  return ((uv - center) * scale) + center;
}

// vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset) {
//   float r = texture2D(textureimage, uv + offset).r;
//   vec2 gb = texture2D(textureimage, uv).gb;
//   return vec3(r, gb);
// }


void main() {
  // vec3 color = texture2D(uTexture, scaleUV(vUv, 0.8)).rgb;
  // // vec3 color = rgbShift(uTexture, vUv, uOffset);
  
  // gl_FragColor = vec4(color, uAlpha);


  vec2 uv = vUv;
  uv = cover( uMeshSize, uMediaSize.xy, uv);
  
  // vec2 s = vec2(900.0, 900.0);
  // vec2 i = vec2(300.0, 300.0);
  // uv = cover( s, i, uv);

  float d = getMaskDist( uv );
  float mask = 1.0 -step( uMouseEnterMask, d );
  uv = scale( uv, vec2( 1.0 /( 1.0 +( 1.0 -uMouseEnter ) * 0.25)), vec2(0.5));
  uv = distort(uv);
  vec4 tex = texture2D(uTexture, uv);
  vec3 color = tex.rgb;
  float alpha = mask * uAlpha;
  // float alpha = uAlpha;

  // vec3 color = texture2D(uTexture, scaleUV(vUv, 0.8)).rgb;
  gl_FragColor = vec4(color, alpha);
}