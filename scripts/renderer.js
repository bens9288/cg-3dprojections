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
        //cone
        this.coneVert = [];
        let centerCone = this.scene.models[2].center;
        let radius = this.scene.models[2].radius;
        let heightCone = this.scene.models[2].height;
        let numSides = this.scene.models[2].sides;
        let angle = 2 * Math.PI / numSides;

        for (let i = 0; i < numSides+1; i++) {   // Loops through the numSides and 1 extra for peak of Cone

            this.coneVert[i] = new Vector(4);
            this.coneVert[i].values = [0, 0, 0, 1];
            
           
            //console.log(center.y);
            if (i < 1) {  //peak cone x,y,z and peak is vert 0
                this.coneVert[i].x = centerCone.x;
                this.coneVert[i].y = centerCone.y;
                this.coneVert[i].z = centerCone.z + heightCone;
            }
            else {  // points on circle 1-numSides+1 
                this.coneVert[i].x = centerCone.x + (radius * Math.sin(i*angle));
                this.coneVert[i].y = centerCone.y + (radius * Math.cos(i*angle));
                this.coneVert[i].z = centerCone.z;
                this.scene.models[2].edges[i+1] = [0,i];
            }
            

        }
         
        //cylinder
        this.cylVert = [];
        let centerCyl = this.scene.models[3].center;
        let radiusCyl = this.scene.models[3].radius;
        let heightCyl = this.scene.models[3].height;
        let numCyl = this.scene.models[3].sides;
        console.log(numCyl);
        let angleCyl = 2 * Math.PI / numCyl;

        for (let i = 0; i < (numCyl * 2)+1; i++) {   // Loops through the numCyl twice for top and bottom circle

            this.cylVert[i] = new Vector(4);
            this.cylVert[i].values = [0, 0, 0, 1];
            // console.log(this.scene.models[3].edges[i]);
           
            //console.log(center.y);
            if (i <= numCyl) {  //first Circle
                this.cylVert[i].x = centerCyl.x + (radiusCyl * Math.sin(i*angleCyl));
                this.cylVert[i].y = centerCyl.y + (radiusCyl * Math.cos(i*angleCyl));
                this.cylVert[i].z = centerCyl.z;
                this.scene.models[3].edges[2+i] = [i, i+numCyl];
                console.log(this.scene.models[3].edges[2+i] = [i, i+numCyl]);
            }
            else {  // second Circle 
                this.cylVert[i].x = centerCyl.x + (radiusCyl * Math.sin((i-numCyl)*angleCyl));
                this.cylVert[i].y = centerCyl.y + (radiusCyl * Math.cos((i-numCyl)*angleCyl));
                this.cylVert[i].z = centerCyl.z + heightCyl;
                
            }
            
        }

        //
        // sphere
        //

        this.sphereVert = [];
        let centerS = this.scene.models[4].center;
        let radiusS = this.scene.models[4].radius;
        let stacks = this.scene.models[4].stacks;
        let slices = this.scene.models[4].slices;
        let angleSlices = 2 * Math.PI / (slices + 1);
        let angleStacks = 2 * Math.PI / (stacks + 1);
        for (let i = 0; i < stacks + 1; i++) {

            this.sphereVert[i] = new Vector(4);
            this.sphereVert[i].x = centerS.x;// + Math.sin(i * angleStacks);
            this.sphereVert[i].z = centerS.z + Math.sin(i * angleStacks);
            this.sphereVert[i].y = centerS.y + Math.cos(i * angleStacks);
            this.sphereVert[i].w = 1;
            let translateNeg = new Matrix(4, 4);
            mat4x4Translate(translateNeg, -this.sphereVert[i].x, -this.sphereVert[i].y, -this.sphereVert[i].z);
            let rotate = new Matrix(4, 4);
            mat4x4RotateZ(rotate, 90);
            console.log(rotate);
            let translatePos = new Matrix(4, 4);
            mat4x4Translate(translatePos, this.sphereVert[i].x, this.sphereVert[i].y, this.sphereVert[i].z);

            console.log(this.sphereVert[i].values);
            this.sphereVert[i] = Matrix.multiply([translatePos, rotate, translateNeg, this.sphereVert[i]]);
            console.log(this.sphereVert[i].values);
            //console.log(temp.values);

            // angle = 180 / slices
            // rotate using transform matrix around the z axis

        }

    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();

        let u = this.scene.view.vup.cross(n);
        u.normalize();

        let v = n.cross(u);
        let prp = new Vector4(this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z, 1);
        let srp = new Vector4(this.scene.view.srp.x, this.scene.view.srp.y, this.scene.view.srp.z, 1)

        let translateNeg = new Matrix(4, 4);
        mat4x4Translate(translateNeg, -this.scene.view.prp.x, -this.scene.view.prp.y, -this.scene.view.prp.z);
        let translatePos = new Matrix(4, 4);
        mat4x4Translate(translatePos, this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z);
    
        let rotate = new Matrix(4, 4);
        rotate.values = [[u.x, u.y, u.z, 0],
                         [v.x, v.y, v.z, 0],
                         [n.x, n.y, n.z, 0],
                         [0, 0, 0, 1]];
        
        this.scene.view.prp = Matrix.multiply([rotate, translateNeg, prp]);

        let rotateY = new Matrix(4, 4);
        mat4x4RotateY(rotateY, 30);
        srp = Matrix.multiply([rotateY, srp]);
        this.scene.view.srp.values = [srp.x/srp.w, srp.y/srp.w, srp.z/srp.w];

        prp = Matrix.multiply([translatePos, rotate, this.scene.view.prp]);
        this.scene.view.prp = new Vector3(prp.x/prp.w, prp.y/prp.w, prp.z/prp.w);

        console.log("post");
        console.log(this.scene.view.srp.values);
        
        //transform and rotate

        // shoot only srp will

        // mathc to xyz coords
        // then use rotate transform to rotate along whichever axis
        // then transform back

    }
    
    //
    rotateRight() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();

        u = this.scene.view.vup.cross(n);
        u.normalize();

        let v = n.cross(u);
        let prp = new Vector4(this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z, 1);
        let srp = new Vector4(this.scene.view.srp.x, this.scene.view.srp.y, this.scene.view.srp.z, 1)

        let translateNeg = new Matrix(4, 4);
        mat4x4Translate(translateNeg, -this.scene.view.prp.x, -this.scene.view.prp.y, -this.scene.view.prp.z);
        let translatePos = new Matrix(4, 4);
        mat4x4Translate(translatePos, this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z);
    
        let rotate = new Matrix(4, 4);
        rotate.values = [[u.x, u.y, u.z, 0],
                         [v.x, v.y, v.z, 0],
                         [n.x, n.y, n.z, 0],
                         [0, 0, 0, 1]];
        
        this.scene.view.prp = Matrix.multiply([rotate, translateNeg, prp]);

        let rotateY = new Matrix(4, 4);
        mat4x4RotateY(rotateY, -30);
        srp = Matrix.multiply([rotateY, srp]);
        this.scene.view.srp.values = [srp.x/srp.w, srp.y/srp.w, srp.z/srp.w];

        prp = Matrix.multiply([translatePos, rotate, this.scene.view.prp]);
        this.scene.view.prp = new Vector3(prp.x/prp.w, prp.y/prp.w, prp.z/prp.w);

        console.log("post");
        console.log(this.scene.view.srp);
        console.log(this.scene.view.prp);

    }
    
    //
    moveLeft() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();
        u = this.scene.view.vup.cross(n);
        u.normalize();

        this.scene.view.prp = this.scene.view.prp.subtract(u);
        this.scene.view.srp = this.scene.view.srp.subtract(u);

    }
    
    //
    moveRight() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();
        u = this.scene.view.vup.cross(n);
        u.normalize();

        this.scene.view.prp = this.scene.view.prp.add(u);
        this.scene.view.srp = this.scene.view.srp.add(u);

    }
    
    //
    moveBackward() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();

        this.scene.view.prp = this.scene.view.prp.add(n);
        this.scene.view.srp = this.scene.view.srp.add(n);

    }
    
    //
    moveForward() {

        let n = new Vector(3);
        n.values = [this.scene.view.prp.x-this.scene.view.srp.x, this.scene.view.prp.y-this.scene.view.srp.y, this.scene.view.prp.z-this.scene.view.srp.z];
        n.normalize();

        this.scene.view.prp = this.scene.view.prp.subtract(n);
        this.scene.view.srp = this.scene.view.srp.subtract(n);

    }

    //
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // console.log('draw()');
        let nPer = mat4x4Perspective(this.scene.view.prp, this.scene.view.srp, this.scene.view.vup, this.scene.view.clip);
        let mPer = mat4x4MPer();
        let view = mat4x4Viewport(800, 600);


        // house = intial

        for (let e = 0; e < this.scene.models[0].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[0].edges[e].length-1; i++) {  // Loops Verts

                //animation

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

        // square = 2

        for (let e = 0; e < this.scene.models[1].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[1].edges[e].length-1; i++) {  // Loops Verts

                //console.log("vert1");
                let vert1Index2 = this.scene.models[1].edges[e][i];
                let vert1W2 = Matrix.multiply([nPer, this.cubeVert[vert1Index2]]);

                //console.log("vert2");
                let vert2Index2 = this.scene.models[1].edges[e][(i+1)];
                let vert2W2 = Matrix.multiply([nPer, this.cubeVert[vert2Index2]]);

                //
                //  Clip Here
                let line2 = {pt0: vert1W2, pt1: vert2W2};
                // console.log(line);
                let z_min2 = 10/100;
                let returned2 = this.clipLinePerspective(line2, z_min2);
                // console.log(returned);
                if(returned2 != null){
                    vert1W2 = returned2.pt0;
                    vert2W2 = returned2.pt1;
                    vert1W2 = Matrix.multiply([view, mPer, vert1W2]);                     // Projects to 2D then to view
                    let vert12 = new Vector3(vert1W2.x / vert1W2.w, vert1W2.y / vert1W2.w);  // Converts Vectors to x-y Coords
    
                    vert2W2 = Matrix.multiply([view, mPer, vert2W2]);
                    let vert22 = new Vector3(vert2W2.x / vert2W2.w, vert2W2.y / vert2W2.w);
    
                    //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                    this.drawLine(vert12.x, vert12.y, vert22.x, vert22.y);
                }
                
            }
        }

        //cone = 3

        for (let e = 0; e < this.scene.models[2].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[2].edges[e].length-1; i++) {  // Loops Verts

                //animation

                let vert1Index3 = this.scene.models[2].edges[e][i];
                let vert1W3 = Matrix.multiply([nPer, this.coneVert[vert1Index3]]);

                //console.log("vert2");
                let vert2Index3 = this.scene.models[2].edges[e][(i+1)];
                let vert2W3 = Matrix.multiply([nPer, this.coneVert[vert2Index3]]);
                // console.log(vert2W);
                //
                //  Clip Here
                //
                let line3 = {pt0: vert1W3, pt1: vert2W3};
                // console.log(line);
                let z_min3 = 10/100;
                let returned3 = this.clipLinePerspective(line3, z_min3);
                // console.log(returned);
                if(returned3 != null){
                    vert1W3 = returned3.pt0;
                    vert2W3 = returned3.pt1;
                    vert1W3 = Matrix.multiply([view, mPer, vert1W3]);                     // Projects to 2D then to view
                    let vert13 = new Vector3(vert1W3.x / vert1W3.w, vert1W3.y / vert1W3.w);  // Converts Vectors to x-y Coords
                    
                    // wtf happened here
                //vert1W = Matrix.multiply([view, mPer, vert1W]);                     // Projects to 2D then to view
                //let vert1 = new Vector3(vert1W.x / vert1W.w, vert1W.y / vert1W.w);  // Converts Vectors to x-y Coords

                //vert2W = Matrix.multiply([view, mPer, vert2W]);
                //let vert2 = new Vector3(vert2W.x / vert2W.w, vert2W.y / vert2W.w);

                //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                //this.drawLine(vert1.x, vert1.y, vert2.x, vert2.y);
                    vert2W3 = Matrix.multiply([view, mPer, vert2W3]);
                    let vert23 = new Vector3(vert2W3.x / vert2W3.w, vert2W3.y / vert2W3.w);
    
                    //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                    this.drawLine(vert13.x, vert13.y, vert23.x, vert23.y);
                }
                

            }
        }



        for (let e = 0; e < this.scene.models[3].edges.length; e++) {   // Loops Edges
            for (let i = 0; i < this.scene.models[3].edges[e].length-1; i++) {  // Loops Verts

                //animation

                let vert1Index4 = this.scene.models[3].edges[e][i];
                let vert1W4 = Matrix.multiply([nPer, this.cylVert[vert1Index4]]);

                //console.log("vert2");
                let vert2Index4 = this.scene.models[3].edges[e][(i+1)];
                let vert2W4 = Matrix.multiply([nPer, this.cylVert[vert2Index4]]);

                
                let line4 = {pt0: vert1W4, pt1: vert2W4};
                // console.log(line4);
                let z_min4 = 10/100;
                let returned4 = this.clipLinePerspective(line4, z_min4);
                // console.log(returned);
                if(returned4 != null){
                    vert1W4 = returned4.pt0;
                    vert2W4 = returned4.pt1;
                    vert1W4 = Matrix.multiply([view, mPer, vert1W4]);                     // Projects to 2D then to view
                    let vert14 = new Vector3(vert1W4.x / vert1W4.w, vert1W4.y / vert1W4.w);  // Converts Vectors to x-y Coords
                    

                    vert2W4 = Matrix.multiply([view, mPer, vert2W4]);
                    let vert24 = new Vector3(vert2W4.x / vert2W4.w, vert2W4.y / vert2W4.w);
    
                    //console.log([vert1.x, vert1.y, vert2.x, vert2.y]);
                    this.drawLine(vert14.x, vert14.y, vert24.x, vert24.y);
                }
                

            }
        }

        // sphere

        let vertw = [];
        let vert = [];
        //console.log("check");
        for (let i = 0; i < this.sphereVert.length; i++) {
            vertw[i] = Matrix.multiply([nPer, this.sphereVert[i]]);
            //console.log("HERE");
            //console.log(this.sphereVert[i].y);
            //console.log(vertw[i].y);
            vertw[i] = Matrix.multiply([view, mPer, vertw[i]]);
            vert[i] = new Vector3(vertw[i].x / vertw[i].w, vertw[i].y / vertw[i].w, vertw[i].z / vertw[i].w);
        }
        for (let i = 0; i < vert.length; i++) {
         //   for (let j = 0; j < vert.length; j++) {
         //       this.drawLine(vert[i].x, vert[i].y, vert[j].x, vert[j].y);
         //   }
            this.drawLine(vert[i].x, vert[i].y, vert[i].x, vert[i].y);
        }

       /* for (let i = 0; i < this.sphereVert.length; i++) {
            this.drawLine(this.sphereVert[i].x, this.sphereVert[i].y, this.sphereVert[i].x, this.sphereVert[i].y);
        }*/

    }


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
        // let deltaX = p1.x - p0.x;
        // let deltaY = p1.y - p0.y;
        // let deltaZ = p1.z - p0.z;
        // console.log("out0", out0, "out1", out1);
        // TODO: implement clipping here!
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
                    console.log("near");
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
