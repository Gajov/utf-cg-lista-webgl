// ================= GLOBALS =================
let gl;
let program;
let vao;


const radius = 200;

let numSides = 5;

let vertexCount = 0;

// ================= MAIN =================
function main() {
    const canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("WebGL2 not supported");
        return;
    }

    setupShaders();
    setupEvents();
    generatePolygon();
    draw();
}

// ================= SHADERS =================
function setupShaders() {
    const vs = `#version 300 es
    in vec2 position;
    in vec4 color;
    out vec4 vColor;

    void main() {
        vec2 clip = (position / 300.0) - 1.0;
        gl_Position = vec4(clip * vec2(1, -1), 0, 1);
        vColor = color;
    }`
    ;

    const fs = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    out vec4 outColor;
    

    void main() {
        outColor = vColor;
    }`;

    const vsObj = createShader(gl.VERTEX_SHADER, vs);
    const fsObj = createShader(gl.FRAGMENT_SHADER, fs);

    program = gl.createProgram();
    gl.attachShader(program, vsObj);
    gl.attachShader(program, fsObj);
    gl.linkProgram(program);
    gl.useProgram(program);

}

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

// ================= GEOMETRY =================
function generatePolygon() {
    const data = [];

    const edgeColor = [1, 0.7, 0.0, 0.8];

    // centro branco
    data.push(300, 300, 1, 1, 1, 1); // ✅

    for (let i = 0; i <= numSides; i++) {
        const t = (i / numSides) * 2 * Math.PI;

        const x = 300 + radius * Math.cos(t);
        const y = 300 + radius * Math.sin(t);

        // borda com cor fixa
        data.push(x, y, ...edgeColor); // ✅
    }

    vertexCount = data.length / 6;

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    const colorLocAttr = gl.getAttribLocation(program, "color");

    // posição
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 6 * 4, 0);

    // cor
    gl.enableVertexAttribArray(colorLocAttr);
    gl.vertexAttribPointer(colorLocAttr, 4, gl.FLOAT, false, 6 * 4, 2 * 4);
}

// ================= EVENTS =================
function setupEvents() {
    document.addEventListener("keydown", e => {
        if (e.key === "+") numSides++;
        if (e.key === "-") numSides = Math.max(3, numSides-1);

        generatePolygon();
        draw();
        if (numSides<30) {
            document.getElementById("titulo").textContent = "Regular Polygon: " + numSides + " Sides";
        } else document.getElementById("titulo").textContent = "Regular Polygon: " + numSides + " Sides   SUN?!";
    });
}

// ================= DRAW =================
function draw() {
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
}