export const fragmentSource = `
    varying vec4 vColor;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        // 丸い形に色をぬるための計算
        // float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
        // if ( f < 0.1 ) {
        //     discard;
        // }
        // gl_FragColor = vColor;

      }
    
	`;