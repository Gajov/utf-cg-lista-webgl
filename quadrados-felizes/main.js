// ================= GLOBALS =================
let gl;
let program;
let vao;

let offsetLoc;
let colorLoc;

// ================= MAIN =================
function main() {
    const canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("WebGL2 not supported");
        return;
    }

    setupShaders();
    setupBuffers();
    draw();
}

// ================= SHADERS =================
function setupShaders() {
    const vs = `#version 300 es
    in vec2 position;
    uniform vec2 offset;

    void main() {
        vec2 pos = position + offset;

        // convert to clip space (-1 to 1)
        vec2 clip = (pos / 300.0) - 1.0;

        // invert Y axis
        gl_Position = vec4(clip * vec2(1, -1), 0, 1);
    }`;

    const fs = `#version 300 es
    precision mediump float;

    uniform vec4 color;
    out vec4 outColor;

    void main() {
        outColor = color;
    }`;

    const vsObj = createShader(gl.VERTEX_SHADER, vs);
    const fsObj = createShader(gl.FRAGMENT_SHADER, fs);

    program = gl.createProgram();
    gl.attachShader(program, vsObj);
    gl.attachShader(program, fsObj);
    gl.linkProgram(program);
    gl.useProgram(program);

    offsetLoc = gl.getUniformLocation(program, "offset");
    colorLoc = gl.getUniformLocation(program, "color");
}

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

// ================= BUFFERS =================
function setupBuffers() {
    const size = 60;

    const vertices = new Float32Array([
        0,0,  size,0,  0,size,
        0,size, size,0, size,size
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
}

// ================= DATA =================
function createSquares() {
    const colors = [
        [1,0,0,1],[0,1,0,1],[0,0,1,1],
        [1,1,0,1],[1,0,1,1],[0,1,1,1],
        [0.5,0.5,0.5,1],[1,0.5,0,1],[0,0.5,1,1]
    ];

    const squares = [];
    let k = 0;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            squares.push({
                x: 100 + j * 120,
                y: 100 + i * 120,
                color: colors[k++]
            });
        }
    }

    return squares;
}

// ================= DRAW =================
function draw() {
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);

    const squares = createSquares();

    squares.forEach(s => {
        gl.uniform2f(offsetLoc, s.x, s.y);
        gl.uniform4fv(colorLoc, s.color);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
}