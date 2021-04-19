import {Canvas} from "./Canvas/canvas.js";

window.addEventListener('load', init);

// このクラス内にページごとのcanvas外の処理を書いていきます
function init(){
    const canvas = new Canvas();

    window.addEventListener('mousemove', e => {
      canvas.mouseMoved(e.clientX, e.clientY);
    });
}
// export class Page00 {
//   constructor() {
//     const canvas = new Canvas();

//     console.log("awake");

//     window.addEventListener('mousemove', e => {
//       canvas.mouseMoved(e.clientX, e.clientY);
//     });
//   }
// };