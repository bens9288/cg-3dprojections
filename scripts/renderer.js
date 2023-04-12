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

        // this.prp = new Vector3(0, 10, -5);
        // this.srp = new Vector3(20, 15, -40);
        // this.vup = new Vector3(1, 1, 0);
        this.prp = this.scene.view.prp;
        this.srp = this.scene.view.srp;
        this.vup = this.scene.view.vup;

        //1 rotation every 4 seconds in terms of rev/sec
        this.angleOfRot = 1/15;
        this.cameraAngle = 1/15;

        this.genericType = false;
        this.coneType = false;
        this.cubeType = false;
        this.cylinderType = false;
        //constructors for shapes
        this.cubeVert = [];
        this.coneVert = [];
        this.cylVert = [];
        this.rotate = [];
       
        
        for (let i = 0; i < this.scene.models.length; i++) {
            if(this.scene.models[i].type == "generic") {
                this.genericType = true;
                
                this.scene.models[i].center = new Vector4(10, 6, -45, 1);
                // this.rotateHouse = new Matrix(4,4);
                // this.houseAxis = this.scene.models[i].animation.axis;
                // this.houseSpeed = this.scene.models[i].animation.rps;
            } else if (this.scene.models[i].type == "cube") {
                this.cubeType = true;
                // this.rotateCube= new Matrix(4,4);
                // this.cubeAxis = this.scene.models[i].animation.axis;
                // this.cubeSpeed = this.scene.models[i].animation.rps;
                let center = this.scene.models[i].center;
                let width = this.scene.models[i].width;
                let height = this.scene.models[i].height;
                let depth = this.scene.models[i].depth;
                // console.log(center);

                for (let c = 0; c < 8; c++) {   // Loops all 8

                    this.cubeVert[c] = new Vector(4);
                    this.cubeVert[c].values = [0, 0, 0, 1];
                
                    //console.log(center.y);
                    if (c < 4) {  // Left Verts
                        this.cubeVert[c].x = center.x - (width / 2);
                    }
                    else {  // Right Verts
                        this.cubeVert[c].x = center.x + (width / 2);
                    }

                    if (c % 2 == 0) {   // Top Verts
                        this.cubeVert[c].y = center.y + (height / 2);
                    }
                    else {  // Bottom Verts
                        this.cubeVert[c].y = center.y - (height / 2);
                    }
                    
                    if (c == 2 || c == 3 || c == 6 || c == 7) { // Near Verts
                        this.cubeVert[c].z = center.z + (depth / 2);
                    }
                    else {  // Far Verts
                        this.cubeVert[c].z = center.z - (depth / 2);
                    }
                    // console.log(this.cubeVert[c]);
                }
                
            } else if (this.scene.models[i].type == "cone") {
                this.coneType = true;
                // this.rotateCone= new Matrix(4,4);
                // this.coneAxis = this.scene.models[i].animation.axis;
                // this.coneSpeed = this.scene.models[i].animation.rps;
                let centerCone = this.scene.models[i].center;
                let radius = this.scene.models[i].radius;
                let heightCone = this.scene.models[i].height;
                let numSides = this.scene.models[i].sides;
                let angle = 2 * Math.PI / numSides;

                for (let k = 0; k < numSides+1; k++) {   // Loops through the numSides and 1 extra for peak of Cone

                    this.coneVert[k] = new Vector(4);
                    this.coneVert[k].values = [0, 0, 0, 1];
                    
                
                    //console.log(center.y);
                    if (k < 1) {  //peak cone x,y,z and peak is vert 0
                        this.coneVert[k].x = centerCone.x;
                        this.coneVert[k].y = centerCone.y;
                        this.coneVert[k].z = centerCone.z + heightCone;
                    }
                    else {  // points on circle 1-numSides+1 
                        this.coneVert[k].x = centerCone.x + (radius * Math.sin(k*angle));
                        this.coneVert[k].y = centerCone.y + (radius * Math.cos(k*angle));
                        this.coneVert[k].z = centerCone.z;
                        this.scene.models[i].edges[k+1] = [0,k];
                    }
                    

                }
            } else if (this.scene.models[i].type == "cylinder") {
                
                //cylinder
                // this.rotateCylinder = new Matrix(4,4);
                // this.cylinderAxis = this.scene.models[i].animation.axis;
                // this.cylinderSpeed = this.scene.models[i].animation.rps;
                let centerCyl = this.scene.models[i].center;
                let radiusCyl = this.scene.models[i].radius;
                let heightCyl = this.scene.models[i].height;
                let numCyl = this.scene.models[i].sides;
                // console.log(numCyl);
                let angleCyl = 2 * Math.PI / numCyl;
        
                for (let j = 0; j < (numCyl * 2)+1; j++) {   // Loops through the numCyl twice for top and bottom circle
        
                    this.cylVert[j] = new Vector(4);
                    this.cylVert[j].values = [0, 0, 0, 1];
                    // console.log(this.scene.models[3].edges[i]);
                    
                    //console.log(center.y);
                    if (j <= numCyl) {  //first Circle
                        this.cylVert[j].x = centerCyl.x + (radiusCyl * Math.sin(j*angleCyl));
                        this.cylVert[j].y = centerCyl.y + (radiusCyl * Math.cos(j*angleCyl));
                        this.cylVert[j].z = centerCyl.z;
                        this.scene.models[i].edges[2+j] = [j, j+numCyl];
                        // console.log(this.scene.models[3].edges[2+i] = [i, i+numCyl]);
                    }
                    else {  // second Circle 
                        this.cylVert[j].x = centerCyl.x + (radiusCyl * Math.sin((j-numCyl)*angleCyl));
                        this.cylVert[j].y = centerCyl.y + (radiusCyl * Math.cos((j-numCyl)*angleCyl));
                        this.cylVert[j].z = centerCyl.z + heightCyl;
                        
                    }
                    
                        
            } 
        }
    
        // if (this.genericType){
            
        // } else if (this.cubeType) {
        //     this.rotateCube = new Matrix(4,4);
        // } else if (this.cylinderType) {
        //     this.rotateCylinder = new Matrix(4,4);
        // } else if (this.coneType) {
        //     this.rotateCone = new Matrix(4,4);
        // }
       
        
        

    }
}


    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation

        let x = new Matrix(4,4);
        let y = new Matrix(4,4);
        let z = new Matrix(4,4);
        let transForward = new Matrix(4,4);
        let transBackward = new Matrix(4,4);
        for (let j = 0; j < this.scene.models.length; j++) {
            let center = this.scene.models[j].center;

            if (this.scene.models[j].animation.axis == 'x') {
                mat4x4RotateX(x, this.scene.models[j].animation.rps*time);
                
                this.rotate[j] = new Matrix(4,4);
                mat4x4Translate(transForward, -center.x, -center.y, -center.z);
                mat4x4Translate(transBackward, center.x, center.y, center.z);
                this.rotate[j] = Matrix.multiply([transBackward, x, transForward]);
            } else if (this.scene.models[j].animation.axis == 'y') {
                mat4x4RotateY(y, this.scene.models[j].animation.rps*time);
                this.rotate[j] = new Matrix(4,4);
                // console.log(j, center);
                mat4x4Translate(transForward, -center.x, -center.y, -center.z);
                mat4x4Translate(transBackward, center.x, center.y, center.z);
                this.rotate[j] = Matrix.multiply([transBackward, y, transForward]);
                
            } else if (this.scene.models[j].animation.axis == 'z') {
                mat4x4RotateZ(z, this.scene.models[j].animation.rps*time);
                this.rotate[j] = new Matrix(4,4);
                // console.log(j, center);
                mat4x4Translate(transForward, -center.x, -center.y, -center.z);
                mat4x4Translate(transBackward, center.x, center.y, center.z);
                this.rotate[j] = Matrix.multiply([transBackward, z, transForward]);
            } 
        }
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
        // house = intial
        
        for (let m = 0; m < this.scene.models.length; m++){
            for (let e = 0; e < this.scene.models[m].edges.length; e++) {   // Loops Edges
                for (let i = 0; i < this.scene.models[m].edges[e].length-1; i++) {  // Loops Verts
    
                    //animation
    
                    let vert1W = new Matrix(4,4);
                    let vert2W = new Matrix(4,4);
                    let vert1Index = this.scene.models[m].edges[e][i];
                    
                    if (this.scene.models[m].type == 'generic'){
                        vert1W = Matrix.multiply([nPer, this.rotate[m], this.scene.models[m].vertices[vert1Index]]);
                    } else if (this.scene.models[m].type == 'cube'){
                        vert1W = Matrix.multiply([nPer, this.rotate[m], this.cubeVert[vert1Index]]);
                    } else if (this.scene.models[m].type == 'cone'){
                        vert1W = Matrix.multiply([nPer, this.rotate[m], this.coneVert[vert1Index]]);
                    } else if (this.scene.models[m].type == 'cylinder'){
                        vert1W = Matrix.multiply([nPer, this.rotate[m], this.cylVert[vert1Index]]);
                    }


                    let vert2Index = this.scene.models[m].edges[e][(i+1)];
                    
                    if (this.scene.models[m].type == 'generic'){
                        vert2W = Matrix.multiply([nPer, this.rotate[m], this.scene.models[m].vertices[vert2Index]]);
                    } else if (this.scene.models[m].type == 'cube'){
                        vert2W = Matrix.multiply([nPer, this.rotate[m], this.cubeVert[vert2Index]]);
                    } else if (this.scene.models[m].type == 'cone'){
                        vert2W = Matrix.multiply([nPer, this.rotate[m], this.coneVert[vert2Index]]);
                    } else if (this.scene.models[m].type == 'cylinder'){
                        vert2W = Matrix.multiply([nPer, this.rotate[m], this.cylVert[vert2Index]]);
                    }
                    // console.log(this.scene.models[m].type, "edge", e, "vert: ", i);
                    // console.log("vert1W: ", vert1W, "vert2W", vert2W);
                    if (vert1W == null | vert2W == null) {
                        console.log(this.scene.models[m].type, "edge", e, "vert: ", i);
                        console.log(vert1W, vert2W);
                    }
                    //
                    //  Clip Here
                    //
                    let line = {pt0: vert1W, pt1: vert2W};
                    // console.log(line);
                    let z_min = 10/100;
                    let returned = this.clipLinePerspective(line, z_min);
                    // console.log(returned);
                    if(returned != null){
                        vert1W = returned.pt0;
                        vert2W = returned.pt1;
                        vert1W = Matrix.multiply([view, mPer, vert1W]);                     // Projects to 2D then to view
                        let vert1 = new Vector3(vert1W.x / vert1W.w, vert1W.y / vert1W.w);  // Converts Vectors to x-y Coords
                        
    
                        vert2W = Matrix.multiply([view, mPer, vert2W]);
                        let vert2 = new Vector3(vert2W.x / vert2W.w, vert2W.y / vert2W.w);
        
                        //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                        this.drawLine(vert1.x, vert1.y, vert2.x, vert2.y);
                    }
                    
                
                }

        
            }
        }
        
    }

/*

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
        let p0 = Vector4(line.pt0.x, line.pt0.y, line.pt0.z, line.pt1.w); 
        let p1 = Vector4(line.pt1.x, line.pt1.y, line.pt1.z, line.pt1.w);
        //added 'this' here
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        let t, pointOut, deltaX, deltaY, deltaZ;
        let lineOut = {pt0:p0, pt1:p1};
        // console.log(lineOut);
        let bool = false;
        let point;
       while(true) {
            if(!(out0 | out1)) {
                //trivial accept
                // return lineOut;
                bool = true;
                break;
            } else if (out0 & out1) {
                //trivial reject
                // return result;
                break;
            } else {
                //choose outcode that has first 1
                deltaX = p1.x - p0.x;
                deltaY = p1.y - p0.y;
                deltaZ = p1.z - p0.z;
                if (out0 > out1) {
                    pointOut = out0;
                    point = p0;
                } else {
                    pointOut = out1;
                    point = p1;
                }

                if (pointOut & TOP) {
                    t = (p0.y + p0.z) / (-deltaY - deltaZ);
                    // console.log("top");
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & BOTTOM) {
                    t = (-p0.y + p0.z) / (deltaY - deltaZ);
                    // console.log("bot");
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & RIGHT) {
                    t = (p0.x + p0.z) / (-deltaX - deltaZ);
                    // console.log("right");
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & LEFT) {
                    t = (-p0.x + p0.z) / (deltaX - deltaZ);
                    // console.log("left");
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & FAR) {
                    t = (-p0.z - 1) / deltaZ
                    // console.log("far");
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                } else if (pointOut & NEAR) {
                    t = (p0.z - z_min) / -deltaZ;
                    point.x = line.pt0.x + (t *deltaX);
                    point.y = line.pt0.y + (t *deltaY);
                    point.z = line.pt0.z + (t *deltaZ);
                }
            }
            if(pointOut == out0) {
                out0 = this.outcodePerspective(lineOut, z_min);
            } else {
                out1 = this.outcodePerspective(lineOut, z_min);
            }
        }
        // console.log(lineOut);
        if (bool) {
            return lineOut;
        }
        return result;
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
