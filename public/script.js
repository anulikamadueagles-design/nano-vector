let scene, camera, renderer, headGroup, ringGroup;

function initHologram() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 110);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    headGroup = new THREE.Group();
    scene.add(headGroup);

    // 1. Generate Holographic AI Face Particles
    const faceParticlesCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(faceParticlesCount * 3);
    const colors = new Float32Array(faceParticlesCount * 3);

    let idx = 0;
    for (let i = 0; i < faceParticlesCount; i++) {
        let u = Math.random() * Math.PI * 2;
        let v = (Math.random() - 0.5) * Math.PI;

        let radius = 32;
        let x = radius * 0.85 * Math.cos(v) * Math.sin(u);
        let y = radius * 1.25 * Math.sin(v);
        let z = radius * 0.9 * Math.cos(v) * Math.cos(u);

        if (y < 0) {
            let jawFactor = 1 - Math.abs(y) / (radius * 1.25);
            x *= (0.5 + 0.5 * jawFactor);
            z *= (0.6 + 0.4 * jawFactor);
        }

        if (y > 2 && y < 14 && Math.abs(x) < 18 && z > 0) {
            z -= 4;
            x *= 0.9;
        }

        if (y > -6 && y < 8 && Math.abs(x) < 5 && z > 10) {
            z += 6 - Math.abs(x);
        }

        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;

        colors[idx] = 0.0;
        colors[idx + 1] = 0.8 + (y / 80);
        colors[idx + 2] = 1.0;

        idx += 3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    const facePoints = new THREE.Points(geometry, material);
    headGroup.add(facePoints);

    // 2. Add Glowing Quantum Eyes
    const eyeGeo = new THREE.BufferGeometry();
    const eyePos = new Float32Array([-8, 6, 22, 8, 6, 22]);
    eyeGeo.setAttribute('position', new THREE.BufferAttribute(eyePos, 3));
    const eyeMat = new THREE.PointsMaterial({
        size: 4.5,
        color: 0x00ffff,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    const eyes = new THREE.Points(eyeGeo, eyeMat);
    headGroup.add(eyes);

    // 3. Add Rotating Sci-Fi Cyber Orbit Rings
    ringGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(42, 43, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ringGroup.add(ring);
    scene.add(ringGroup);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0015;

    if (headGroup) {
        headGroup.rotation.y = Math.sin(time * 0.5) * 0.25;
        headGroup.rotation.x = Math.cos(time * 0.3) * 0.08;
        headGroup.position.y = Math.sin(time * 1.5) * 1.5;
    }

    if (ringGroup) {
        ringGroup.rotation.z += 0.005;
        ringGroup.rotation.x = Math.sin(time * 0.4) * 0.2;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    
    if (headGroup) headGroup.rotation.y += 0.8;
    outputBox.innerText = "Nano Vector AI Engine processing query...";
    
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
