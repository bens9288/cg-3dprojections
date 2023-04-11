// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    
    let n = new Vector(3);
    n.values = [prp.x-srp.x, prp.y-srp.y, prp.z-srp.z];
    n.normalize();
    //console.log("n:");
    //console.log(n);

    u = vup.cross(n);
    u.normalize();
    //console.log("u:");
    //console.log(u);

    let v = n.cross(u);
    //console.log("v:");
    //console.log(v);

    let cw = new Vector(3);
    cw.values = [(clip[0] + clip[1])/2, (clip[2] + clip[3])/2, -clip[4]];
    //console.log("cw:");
    //console.log(cw);

    let dop = new Vector(3);
    //dop.values = [cw.x-prp.x, cw.y-prp.y, cw.z-prp.z] CHECK THIS PRP* at origin?
    dop.values = cw.values;
    //console.log("dop:");
    //console.log(dop);

    let translate = new Matrix(4, 4);
    mat4x4Translate(translate, -prp.x, -prp.y, -prp.z);
    //console.log("trans:");
    //console.log(translate);

    let rotate = new Matrix(4, 4);
    rotate.values = [[u.x, u.y, u.z, 0],
                     [v.x, v.y, v.z, 0],
                     [n.x, n.y, n.z, 0],
                     [0, 0, 0, 1]];
    //console.log("rotate:");
    //console.log(rotate);

    let shear = new Matrix(4, 4);
    let shx = -dop.x / dop.z;
    let shy = -dop.y / dop.z;
    //console.log(shx);
    //console.log(shy);
    mat4x4ShearXY(shear, shx, shy);
    //console.log("shear:");
    //console.log(shear);

    let scale = new Matrix(4, 4);
    let sx = 2 * clip[4] / ((clip[1] - clip[0]) * clip[5]);
    let sy = 2 * clip[4] / ((clip[3] - clip[2]) * clip[5]);
    let sz = 1 / clip[5];
    //console.log(sx);
    //console.log(sy);
    //console.log(sz);
    mat4x4Scale(scale, sx, sy, sz);
    //console.log("scale:");
    //console.log(scale);

    let nPer = Matrix.multiply([scale, shear, rotate, translate]);
    //console.log(nPer);

    return nPer;

}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, -1, 0]];
    return mper;
}

// create a 4x4 matrix to translate/scale projected vertices to the viewport (window)
function mat4x4Viewport(width, height) {
    let viewport = new Matrix(4, 4);
    viewport.values = [[width/2, 0, 0, width/2],
                       [0, height/2, 0, height/2],
                       [0, 0, 1, 0],
                       [0, 0, 0, 1]];
    return viewport;
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, Math.cos(theta * (Math.PI / 180)), -Math.sin(theta * (Math.PI / 180)), 0],
                     [0, Math.sin(theta * (Math.PI / 180)), Math.cos(theta * (Math.PI / 180)), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta * (Math.PI / 180)), 0, Math.sin(theta * (Math.PI / 180)), 0],
                     [0, 1, 0, 0],
                     [-Math.sin(theta * (Math.PI / 180)), 0, Math.cos(theta * (Math.PI / 180)), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta * (Math.PI / 180)), -Math.sin(theta * (Math.PI / 180)), 0, 0],
                     [Math.sin(theta * (Math.PI / 180)), Math.cos(theta * (Math.PI / 180)), 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
