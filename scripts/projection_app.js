const { createApp } = Vue;

let app;

// Initialization function - called when web page loads
function init() {
    app = createApp({
        data() {
            return {
                view: {
                    id: 'view',
                    width: 800,
                    height: 600
                },
                renderer: {}
            };
        },
        methods: {
            loadNewScene() {
                let scene_file = document.getElementById('scene_file');

                let reader = new FileReader();
                reader.onload = (event) => {
                    let scene = JSON.parse(event.target.result);
                    this.renderer.updateScene(scene);
                };
                reader.readAsText(scene_file.files[0], 'UTF-8');
            },

            onKeyDown(event) {
                switch (event.keyCode) {
                    case 37: // LEFT Arrow
                        this.renderer.rotateLeft();
                        break;
                    case 39: // RIGHT Arrow
                        this.renderer.rotateRight();
                        break;
                    case 65: // A key
                        this.renderer.moveLeft();
                        break;
                    case 68: // D key
                        this.renderer.moveRight();
                        break;
                    case 83: // S key
                        this.renderer.moveBackward();
                        break;
                    case 87: // W key
                        this.renderer.moveForward();
                        break;
                }
            }
        }
    }).mount('#content');

    let initial_scene = {
        view: {
            prp: [44, 20, -16],
            srp: [20, 20, -40],
            vup: [0, 1, 0],
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    [ 0.0,  0.0, -30.0],
                    [20.0,  0.0, -30.0],
                    [20.0, 12.0, -30.0],
                    [10.0, 20.0, -30.0],
                    [ 0.0, 12.0, -30.0],
                    [ 0.0,  0.0, -60.0],
                    [20.0,  0.0, -60.0],
                    [20.0, 12.0, -60.0],
                    [10.0, 20.0, -60.0],
                    [ 0.0, 12.0, -60.0]
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            },
            {
                type: 'cube',
                center: [5, 5, -20],
                width: 5,
                height: 5,
                depth: 5,
                edges: [    // Ask Prof if this ok to keep
                    [0, 4, 6, 2, 0],
                    [1, 5, 7, 3, 1],
                    [0, 1],
                    [2, 3],
                    [4, 5],
                    [6, 7]
                ]
            },
            {
                type: 'sphere',
                center: [0, 10, -30],
                radius: 10,
                slices: 4,
                stacks: 4
            },
            {
                type: 'cone',
                center: [5, 20, -30],
                radius: 3,
                height: 5,
                sides: 9,
                edges : [       //only edges defined is peak to the top
                    [0,1],
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
                ]
            },
            {
                type: 'cylinder',
                center: [5, 20, -20],
                radius: 3,
                height: 5,
                sides: 10,
                edges : [       //only edges defined is peak to the top
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1],
                    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 11]
                ]
            }
        ]
    };

    document.addEventListener('keydown', app.onKeyDown, false);
    
    app.renderer = new Renderer(app.view, initial_scene);
    window.requestAnimationFrame((timestamp) => {
        app.renderer.animate(timestamp);
    });
}
