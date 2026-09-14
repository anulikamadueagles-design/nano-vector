let scene, camera, renderer, holoParticles;
function initHologram() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 1.5, color: 0x00f0ff });
    holoParticles = new THREE.Points(geometry, material);
    scene.add(holoParticles);
    animate();
}
function animate() {
    requestAnimationFrame(animate);
    if (holoParticles) holoParticles.rotation.y += 0.002;
    renderer.render(scene, camera);
}
function initUI() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '';
    Object.keys(NANO_VECTOR_CATEGORIES).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        categoryFilter.appendChild(opt);
    });
    updateFeatureDropdown();
}
function updateFeatureDropdown() {
    const cat = document.getElementById('categoryFilter').value;
    const featureSelect = document.getElementById('featureSelect');
    featureSelect.innerHTML = '';
    (NANO_VECTOR_CATEGORIES[cat] || []).forEach(f => {
        const opt = document.createElement('option');
        opt.value = f; opt.textContent = f;
        featureSelect.appendChild(opt);
    });
}
async function runNanoVector() {
    const category = document.getElementById('categoryFilter').value;
    const feature = document.getElementById('featureSelect').value;
    const prompt = document.getElementById('promptInput').value;
    const outputBox = document.getElementById('outputBox');
    outputBox.innerText = "Nano Vector AI Engine processing...";
    try {
        const response = await fetch('/api/nano-vector', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, feature, prompt })
        });
        const data = await response.json();
        outputBox.innerText = data.success ? data.result : "Error: " + data.error;
    } catch (err) {
        outputBox.innerText = "Connection Error: " + err.message;
    }
}
window.onload = () => { initHologram(); initUI(); };
