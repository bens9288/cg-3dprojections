const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;

        //this.prp = this.scene.view.prp;
        //this.srp = this.scene.view.srp;
        ///this.vup = this.scene.view.vup;

        this.prp = new Vector3(0, 10, -5);
        this.srp = new Vector3(20, 15, -40);
        this.vup = new Vector3(1, 1, 0);

        //
        //  Square
        //

        this.cubeVert = [];
        let center = this.scene.models[1].center;
        let width = this.scene.models[1].width;
        let height = this.scene.models[1].height;
        let depth = this.scene.models[1].depth;

        for (let i = 0; i < 8; i++) {   // Loops all 8

            this.cubeVert[i] = new Vector(4);
            this.cubeVert[i].values = [0, 0, 0, 1];
           
            //console.log(center.y);
            if (i < 4) {  // Left Verts
                this.cubeVert[i].x = center.x - (width / 2);
            }
            else {  // Right Verts
                this.cubeVert[i].x = center.x + (width / 2);
            }

            if (i % 2 == 0) {   // Top Verts
                this.cubeVert[i].y = center.y + (height / 2);
            }
            else {  // Bottom Verts
                this.cubeVert[i].y = center.y - (height / 2);
            }
            
            if (i == 2 || i == 3 || i == 6 || i == 7) { // Near Verts
                this.cubeVert[i].z = center.z + (depth / 2);
            }
            else {  // Far Verts
                this.cubeVert[i].z = center.z - (depth / 2);
            }

        }

    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {

    }
    
    //
    rotateRight() {

    }
    
    //
    moveLeft() {

        this.prp.x--;
        this.srp.x--;
        // not right but onto something
        //this.prp.y++;   
        //this.srp.y++;

    }
    
    //
    moveRight() {

        this.prp.x++;
        this.srp.x++;

    }
    
    //
    moveBackward() {

        this.prp.z++;
        this.srp.z++;

    }
    
    //
    moveForward() {

        this.prp.z--;
        this.srp.z--;

    }

    //
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // console.log('draw()');
        let nPer = mat4x4Perspective(this.prp, this.srp, this.vup, [-15, 9, -12, 6, 10, 100]);
        let mPer = mat4x4MPer();
        let view = mat4x4Viewport(800, 600);

        for (let e = 0; e < this.scene.models[0].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[0].edges[e].length-1; i++) {  // Loops Verts

                
                let vert1Index = this.scene.models[0].edges[e][i];
                let vert1W = Matrix.multiply([nPer, this.scene.models[0].vertices[vert1Index]]);

                //console.log("vert2");
                let vert2Index = this.scene.models[0].edges[e][(i+1)];
                let vert2W = Matrix.multiply([nPer, this.scene.models[0].vertices[vert2Index]]);
                // console.log(vert2W);
                //
                //  Clip Here
                //
                let line = {pt0: vert1W, pt1: vert2W};
                // console.log(line);
                let z_min = 0.0;
                let returned = this.clipLinePerspective(line, z_min);
                // console.log(returned);
                vert1W = returned.pt0;
                vert2W = returned.pt1;
                // console.log("returnedp0:", vert1W, "returnedp1:", vert2W);
                // let vert1 = returned.pt0;
                // let vert2 = returned.pt1;

                vert1W = Matrix.multiply([view, mPer, vert1W]);                     // Projects to 2D then to view
                let vert1 = new Vector3(vert1W.x / vert1W.w, vert1W.y / vert1W.w);  // Converts Vectors to x-y Coords

                vert2W = Matrix.multiply([view, mPer, vert2W]);
                let vert2 = new Vector3(vert2W.x / vert2W.w, vert2W.y / vert2W.w);

                //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                this.drawLine(vert1.x, vert1.y, vert2.x, vert2.y);

            }
        }

        for (let e = 0; e < this.scene.models[1].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[1].edges[e].length-1; i++) {  // Loops Verts

                //console.log("vert1");
                let vert1Index = this.scene.models[1].edges[e][i];
                let vert1W = Matrix.multiply([nPer, this.cubeVert[vert1Index]]);

                //console.log("vert2");
                let vert2Index = this.scene.models[1].edges[e][(i+1)];
                let vert2W = Matrix.multiply([nPer, this.cubeVert[vert2Index]]);

                //
                //  Clip Here
                //

                vert1W = Matrix.multiply([view, mPer, vert1W]);                     // Projects to 2D then to view
                let vert1 = new Vector3(vert1W.x / vert1W.w, vert1W.y / vert1W.w);  // Converts Vectors to x-y Coords

                vert2W = Matrix.multiply([view, mPer, vert2W]);
                let vert2 = new Vector3(vert2W.x / vert2W.w, vert2W.y / vert2W.w);

                //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                this.drawLine(vert1.x, vert1.y, vert2.x, vert2.y);

            }
        }

/*
        //
        //  Square
        //

        let changeVertW = [];
        let vert = [];
        for (let i = 0; i < 8; i++) {
            changeVertW[i] = Matrix.multiply([nPer, this.cubeVert[i]]);

            //
            // Clip Here
            //

            changeVertW[i] = Matrix.multiply([view, mPer, changeVertW[i]]);
            vert[i] = new Vector3(changeVertW[i].x / changeVertW[i].w, changeVertW[i].y / changeVertW[i].w, changeVertW[i].z / changeVertW[i].w);
        }
        // let changeVertW = [];
        // let vert = [];
        // for (let i = 0; i < 8; i++) {
        //     changeVertW[i] = Matrix.multiply([nPer, this.cubeVert[i]]);
        //     changeVertW[i] = Matrix.multiply([view, mPer, changeVertW[i]]);

        //     //attempt to clip cube?

        //     // changeVertW[i+1] = Matrix.multiply([nPer, this.cubeVert[i+1]]);
        //     // // changeVertW[i+1] = Matrix.multiply([view, mPer, changeVertW[i+1]]);

        //     // // let line = {pt0: changeVertW[i], pt1: changeVertW[i+1]};
        //     // //     console.log(line);
        //     // //     let z_min = -10/100;
        //     // //     let returned = this.clipLinePerspective(line, z_min);
        //     // //     changeVertW[i] = returned.pt0;
        //     // //     changeVertW[i+1] = returned.pt1;
        //     // //     console.log("p0:", vert1W, "p1:", vert2W);

        //     vert[i] = new Vector3(changeVertW[i].x / changeVertW[i].w, changeVertW[i].y / changeVertW[i].w, changeVertW[i].z / changeVertW[i].w);
        // }

        // for (let i = 0; i < 8; i++) {
        //     this.drawLine(vert[i].x, vert[i].y, vert[i].x, vert[i].y);
        // }

        // // Its beautfiul... isn't it
        // this.drawLine(vert[0].x, vert[0].y, vert[1].x, vert[1].y);
        // this.drawLine(vert[0].x, vert[0].y, vert[2].x, vert[2].y);
        // this.drawLine(vert[0].x, vert[0].y, vert[4].x, vert[4].y);
        // this.drawLine(vert[7].x, vert[7].y, vert[3].x, vert[3].y);
        // this.drawLine(vert[7].x, vert[7].y, vert[5].x, vert[5].y);
        // this.drawLine(vert[7].x, vert[7].y, vert[6].x, vert[6].y);
        // this.drawLine(vert[1].x, vert[1].y, vert[3].x, vert[3].y);
        // this.drawLine(vert[2].x, vert[2].y, vert[3].x, vert[3].y);
        // this.drawLine(vert[1].x, vert[1].y, vert[5].x, vert[5].y);
        // this.drawLine(vert[6].x, vert[6].y, vert[2].x, vert[2].y);
        // this.drawLine(vert[6].x, vert[6].y, vert[4].x, vert[4].y);
        // this.drawLine(vert[4].x, vert[4].y, vert[5].x, vert[5].y);

*/

        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //   * For each line segment in each edge
        //     * clip in 3D
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line
    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {
            outcode += NEAR;
        }
        return outcode;
    }

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        let result = null;
        let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
        let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        //added 'this' here
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        let t, pointOut, deltaX, deltaY, deltaZ;
        let lineOut = line;
        let bool = true;
        // let deltaX = p1.x - p0.x;
        // let deltaY = p1.y - p0.y;
        // let deltaZ = p1.z - p0.z;
        
        // TODO: implement clipping here!
       while(!(out0 | out1)) {
            if(!(out0 | out1)) {
                //trivial accept
                bool = false;
                return lineOut;
            } else if (out0 & out1) {
                //trivial reject
                bool = false;
                return result;
            } else {
                //choose outcode that has first 1
                deltaX = p1.x - p0.x;
                deltaY = p1.y - p0.y;
                deltaZ = p1.z - p0.z;
                if (out0 > out1) {
                    pointOut = out0;
                    // point = p0;
                } else {
                    pointOut = out1;
                    // point = p1;
                }

                if (pointOut & TOP) {
                    t = (p0.y + p0.z) / (-deltaY - deltaZ);
                    console.log("top");
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & BOTTOM) {
                    t = (-p0.y + p0.z) / (deltaY - deltaZ);
                    console.log("bot");
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & RIGHT) {
                    t = (p0.x + p0.z) / (-deltaX - deltaZ);
                    console.log("right");
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & LEFT) {
                    t = (-p0.x + p0.z) / (deltaX - deltaZ);
                    console.log("left");
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & FAR) {
                    t = (-p0.z - 1) / deltaZ
                    console.log("far");
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & NEAR) {
                    console.log("near");
                    t = (p0.z - z_min) / -deltaZ;
                    lineOut.pt0.x = line.pt0.x + (t *deltaX);
                    lineOut.pt0.y = line.pt0.y + (t *deltaY);
                    lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                }
            }
            if(pointOut == out0) {
                // lineOut.pt0.x = line.pt0.x + (t *deltaX);
                // lineOut.pt0.y = line.pt0.y + (t *deltaY);
                // lineOut.pt0.z = line.pt0.z + (t *deltaZ);
                out0 = this.outcodePerspective(lineOut.pt0, z_min);
            } else {
                // lineOut.pt1.x = line.pt1.x + (t *deltaX);
                // lineOut.pt1.y = line.pt1.y + (t *deltaY);
                // lineOut.pt1.z = line.pt1.z + (t *deltaZ);
                out1 = this.outcodePerspective(lineOut.pt1, z_min);
            }
        }
        // console.log(lineOut);
        return lineOut;
    }

    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(Vector4(scene.models[i].vertices[j][0],
                                                scene.models[i].vertices[j][1],
                                                scene.models[i].vertices[j][2],
                                                1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = Vector4(scene.models[i].center[0],
                                       scene.models[i].center[1],
                                       scene.models[i].center[2],
                                       1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
};
