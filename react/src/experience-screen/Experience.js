import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/* global OnirixSDK */

export class Experience {

    _renderer = null;
    _scene = null;
    _camera = null;
    _model = null;

    oxSDK;

    async init() {
        this._raycaster = new THREE.Raycaster();
        this._animationMixers = [];
        this._clock = new THREE.Clock(true);

        const renderCanvas = await this.initSDK();
        this.setupRenderer(renderCanvas);

        // Add transparent floor for model placement using raycasting
        this._floor = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.0,
                side: THREE.DoubleSide,
            })
        );

        this._floor.rotateX(Math.PI / 2);
        this._floor.position.set(0, -1, 0);
        this._scene.add(this._floor);

        this.oxSDK.subscribe(OnirixSDK.Events.OnTouch, (touchPos) => {
            this.onTouch(touchPos);
        })

        this.oxSDK.subscribe(OnirixSDK.Events.OnFrame, () => {
            const delta = this._clock.getDelta();
            this._animationMixers.forEach((mixer) => {
                mixer.update(delta);
            });

            this.render();
        })

        this.oxSDK.subscribe(OnirixSDK.Events.OnFrame, () => {
            this.render();
        })

        this.oxSDK.subscribe(OnirixSDK.Events.OnPose, (pose) => {
            this.updatePose(pose);
        });

        this.oxSDK.subscribe(OnirixSDK.Events.OnResize, () => {
            this.onResize();
        });
    }

    async initSDK() {
        this.oxSDK = new OnirixSDK("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMDIsInByb2plY3RJZCI6MTQ0MjksInJvbGUiOjMsImlhdCI6MTYxNjc2MDI5M30.knKDX5vda6UyqB8CobqgPQ8BS7OYQo4RDfIuGm-EJGg");
        const config = {
            mode: OnirixSDK.TrackingMode.Surface,
        }
        return this.oxSDK.init(config);
    }

    async dispose() {
        this._renderer.dispose();
        await this.oxSDK.destroy();
    }

    setupRenderer(renderCanvas) {
        const width = renderCanvas.width;
        const height = renderCanvas.height;

        // Initialize renderer with renderCanvas provided by Onirix SDK
        this._renderer = new THREE.WebGLRenderer({ canvas: renderCanvas, alpha: true });
        this._renderer.setClearColor(0x000000, 0);
        this._renderer.setSize(width, height);

        // Ask Onirix SDK for camera parameters to create a 3D camera that fits with the AR projection.
        const cameraParams = this.oxSDK.getCameraParameters();
        this._camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
        this._camera.matrixAutoUpdate = false;

        // Create an empty scene
        this._scene = new THREE.Scene();

        // Add some lights
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        this._scene.add(ambientLight);
        const hemisphereLight = new THREE.HemisphereLight(0xbbbbff, 0x444422);
        this._scene.add(hemisphereLight);
    }

    render() {
        this._renderer.render(this._scene, this._camera);
    }

    updatePose(pose) {
        // When a new pose is detected, update the 3D camera
        let modelViewMatrix = new THREE.Matrix4();
        modelViewMatrix = modelViewMatrix.fromArray(pose);
        this._camera.matrix = modelViewMatrix;
        this._camera.matrixWorldNeedsUpdate = true;
    }

    onResize() {
        // When device orientation changes, it is required to update camera params.
        const width = this._renderer.domElement.width;
        const height = this._renderer.domElement.height;
        const cameraParams = this.oxSDK.getCameraParameters();
        this._camera.fov = cameraParams.fov;
        this._camera.aspect = cameraParams.aspect;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(width, height);
    }

    onTouch(touchPos) {
        // Raycast
        this._raycaster.setFromCamera(touchPos, this._camera);
        const intersects = this._raycaster.intersectObject(this._floor);

        if (intersects.length > 0 && intersects[0].object === this._floor) {
            // Load a 3D model and add it to the scene over touched position
            const gltfLoader = new GLTFLoader();
            gltfLoader.load("bear.glb", (gltf) => {
                const model = gltf.scene;
                const animations = gltf.animations;
                model.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
                // Model looking to the camera on Y axis
                model.rotation.y = Math.atan2(this._camera.position.x - model.position.x, this._camera.position.z - model.position.z);
                this._scene.add(model);
                // Play model animation
                const mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(animations[0]);
                action.play();
                this._animationMixers.push(mixer);
            });

            if (!this._started) {
                // Start tracking on first touch
                this.oxSDK.start();
                this._started = true;
            }
        }
    }
}
