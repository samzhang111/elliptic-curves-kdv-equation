import JXG from "jsxgraph"

const robustWeierstrassP = (x, k1, k2, fallback) => {
    let result
    try {
        result = weierstrassP(x, k1, k2).re
    }
    catch {
        result = fallback
    }

    return result
}

const initPage = () => {

    /*****
     * Initialize controlling board
    *****/

    const controlRange = 5

    let boardControls = JXG.JSXGraph.initBoard("controls", {
        boundingbox: [-controlRange, controlRange, controlRange, -controlRange],
        showCopyright: false,
        showNavigation: false, 
        showInfobox: false, drag: {enabled: true}, pan: {enabled: false}, axis: true, grid: false, zoom: {min: 1, max: 1},
        defaultAxes: {
            x : {
                name: 'a',
                    withLabel: true,
                    label: {
                        position: 'rt',
                            offset: [-10, 10]
                    }
            },
            y : {
                withLabel:true,
                    name: 'b',
                    label: {
                        position: 'rt',
                            offset: [-10, -10]
                    }
            }
        }
    });

    let controlPoint = boardControls.create("point", [4/3, -8/27], { name: "Drag me", size: 8, fixed: false, label: {fontSize: 16, offset: [10, 20]} })
    let guideCurveTop = boardControls.create('functiongraph', [function(x){return Math.sqrt(-4/27 * x**3)}], {dash: 1})
    let guideCurveBottom = boardControls.create('functiongraph', [function(x){return -Math.sqrt(-4/27 * x**3)}], {dash: 1})

    let controlPointInputA = boardControls.create("input", [0.5, -3, "4/3", "a="], {cssStyle: 'width: 5em'})
    let controlPointInputB = boardControls.create("input", [0.5, -3.5, "-8/27", "b="], {cssStyle: 'width: 5em'})
    let moveControlPointButton = boardControls.create('button', [0.5, -4, 'Move point', function() {
         controlPoint.moveTo([eval(controlPointInputA.Value()), eval(controlPointInputB.Value())], 0);
     }], {});


    /*****
     * Elliptic curve board
    *****/

    const curveBoardWidth = 3
    let boardCurve = JXG.JSXGraph.initBoard("curve", {
        boundingbox: [-curveBoardWidth, curveBoardWidth, curveBoardWidth, -curveBoardWidth],
        showCopyright: false,
        showNavigation: false, 
        showInfobox: false, drag: {enabled: true}, pan: {enabled: true}, axis: true, grid: false}
    );

    let ellipticCurveTop = boardCurve.create('functiongraph', [function(x){return Math.sqrt(x**3 + controlPoint.X() *x + controlPoint.Y())}], {strokeWidth: 5, strokeColor: "#d1462f"})
    let ellipticCurveBottom = boardCurve.create('functiongraph', [function(x){return -Math.sqrt(x**3 + controlPoint.X() *x + controlPoint.Y())}], {strokeWidth: 5, strokeColor: "#d1462f"})

    let ellipticEqn = boardControls.create("text", [0.2, 4.2, function(x) {return `y^2 = x^3 + ${controlPoint.X().toFixed(2)}x + ${controlPoint.Y().toFixed(2)}`}], {fontSize: 18})

    /*****
     * KdV equation
    *****/

    let mathbox2d = mathBox({
      element: document.querySelector("#kdv"),
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: {
        // Orbit controls, i.e. Euler angles, with gimbal lock
        klass: THREE.OrbitControls,

        // Trackball controls, i.e. Free quaternion rotation
        //klass: THREE.TrackballControls,
      },
      renderer: { parameters: { alpha: true } }
    });
    if (mathbox2d.fallback) throw "WebGL not supported"

    let three = mathbox2d.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    three.renderer.setClearAlpha(0);

    let camera = mathbox2d.camera({
        proxy: true,
        position: [0, -4, 0]
    })
    mathbox2d.set('focus', 1);

    const xmin = -5;
    const ymin = -5;
    const zmin = -3;
    const xmax = 5;
    const ymax = 5;
    const zmax = 5;
    const mbxmin = xmin* 2
    const mbxmax = xmax* 2
    const colors = {
        x: new THREE.Color(0xFF4136),
        y: new THREE.Color(0x2ECC40),
        z: new THREE.Color(0x0074D9),
    };
    const offset = 3



    let view = mathbox2d.cartesian({
      range: [[xmin, xmax], [ymin, ymax], [zmin, zmax]],
      scale: [2, 2, 2],
    });

    view.transform({
        rotation: [pi/2, 0, 0]
    }).grid({
      divideX: 20,
      divideY: 20,
      width: 8,
      opacity: 0.9,
      zBias: -5,
    });

    let lastPoint = -1000

    view.interval({
        id: 'sampler',
        width: 128,
        expr: function (emit, x, j, t) {
            let p = robustWeierstrassP(complex(x - (0.5*t % 10) + offset, -pi/2), controlPoint.X(), controlPoint.Y(), lastPoint) 
            let z = -2 * p + 2/3
            lastPoint = p
            emit(x, 0, z);
        },
        channels: 3,
    });

    view.line({
      points: '#sampler',
      color: 0xd1462f,
      width: 20,
    });

    /*
    for (let i = 1; i < 5; i++) {
        //view.transform({
        //    position: [0.5*i, 0.5*i, 0]
        //}).line({
        //    points: '#sampler',
        //    color: 0x3090FF,
        //    width: 5,
        //})

        view.interval({
          id: `sampler${i}`,
          width: 128,
          expr: function (emit, x, j, t) {
            let z = -2 * robustWeierstrassP(complex(x + offset - i, -pi/2), controlPoint.X(), controlPoint.Y()) + 2/3
            emit(x, i, z);
          },
          channels: 3,
        });

        view.line({
          points: `#sampler${i}`,
          color: 0x3090FF,
          width: 5,
          opacity: 1/i
        });
    }
    */

    /*****
     * Update events
    *****/

    boardControls.addChild(boardCurve)
    //boardControls.addChild(boardKdV)
}

window.addEventListener('load', initPage)
