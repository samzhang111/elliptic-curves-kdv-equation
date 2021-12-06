import JXG from "jsxgraph"

const initPage = () => {

    /*****
     * Initialize controlling board
    *****/

    const controlRange = 5

    let boardControls = JXG.JSXGraph.initBoard("controls", {
        boundingbox: [-controlRange, controlRange, controlRange, -controlRange],
        showCopyright: false,
        showNavigation: false, 
        showInfobox: false, drag: {enabled: true}, pan: {enabled: false}, axis: true, grid: false,
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
                            offset: [5, -10]
                    }
            }
        }
    });

    let controlPoint = boardControls.create("point", [4/3, -8/27], { name: "(a, b)", size: 5, fixed: false })
    let guideCurveTop = boardControls.create('functiongraph', [function(x){return Math.sqrt(-4/27 * x**3)}], {dash: 1})
    let guideCurveBottom = boardControls.create('functiongraph', [function(x){return -Math.sqrt(-4/27 * x**3)}], {dash: 1})
    let moveControlPointButton = boardControls.create('button', [1, 4, 'Reset point', function() {
         controlPoint.moveTo([4/3, -8/27], 0);
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

    let ellipticCurveTop = boardCurve.create('functiongraph', [function(x){return Math.sqrt(x**3 + controlPoint.X() *x + controlPoint.Y())}])
    let ellipticCurveBottom = boardCurve.create('functiongraph', [function(x){return -Math.sqrt(x**3 + controlPoint.X() *x + controlPoint.Y())}])

    let ellipticEqn = boardCurve.create("text", [-2.4, 2.7, function(x) {return `y^2 = x^3 + ${controlPoint.X().toFixed(2)}*x + ${controlPoint.Y().toFixed(2)}`}], {fontSize: 18})

    /*****
     * KdV equation
    *****/

    const kdvBoardWidth = 10
    let boardKdV = JXG.JSXGraph.initBoard("kdv", {
        boundingbox: [-kdvBoardWidth, kdvBoardWidth, kdvBoardWidth, -kdvBoardWidth],
        showCopyright: false,
        showNavigation: false, 
        showInfobox: false, drag: {enabled: true}, pan: {enabled: true}, axis: true, grid: false}
    );

    const robustWeierstrassP = (x, k1, k2) => {
        let result
        try {
            result = weierstrassP(x, k1, k2).re
        }
        catch {
            result = -1000
        }

        return result
    }

    let kdvCurve = boardKdV.create('functiongraph', [function(x){
        return -2 * robustWeierstrassP(complex(x, -pi/2), controlPoint.X(), controlPoint.Y()) + 2/3
    }])

    /*****
     * Update events
    *****/

    boardControls.addChild(boardCurve)
    boardControls.addChild(boardKdV)
}

window.addEventListener('load', initPage)
