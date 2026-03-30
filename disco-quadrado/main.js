// ================= GLOBALS =================
let gl;
let program;
let vao;

let colorLoc;

let showWireframe = false;

const inSS = 200;
const outSS = 400;
const bL = 100;

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
    setupEvents();
    draw();
}

// ================= SHADERS =================
function setupShaders() {
    const vs = `#version 300 es
    in vec2 position;

    void main() {
        vec2 clip = (position / 300.0) - 1.0;
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
    // quadrado externo e interno intercalados
    const vertices = new Float32Array([
        bL,bL,              bL+(outSS-inSS)/2,bL+(outSS-inSS)/2,
        bL+outSS,bL,        bL+(outSS-inSS)/2+inSS,bL+(outSS-inSS)/2,
        bL+outSS,bL+outSS,  bL+(outSS-inSS)/2+inSS,bL+(outSS-inSS)/2+inSS,
        bL,bL+outSS,        bL+(outSS-inSS)/2,bL+(outSS-inSS)/2+inSS,
        bL,bL,              bL+(outSS-inSS)/2,bL+(outSS-inSS)/2
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

// ================= EVENTS =================
function setupEvents() {
    document.addEventListener("keydown", e => {
        if (e.key === "c") {
            showWireframe = !showWireframe;
            draw();
        }
    });
}

// ================= DRAW =================
function draw() {
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);

    // preenchido (azul)
    gl.uniform4f(colorLoc, 0,1,0,1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);

    // contorno
    if (showWireframe) {
        gl.uniform4f(colorLoc, 0,0,0,1);
        gl.drawArrays(gl.LINE_STRIP, 0, 10);
    }
}