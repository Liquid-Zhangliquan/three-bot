<template>
  <div class="three-box" id="bot-container"></div>
</template>

<script>
import * as THREE from 'three';
// import '@/utils/loader/GLTFloader';
require('@/utils/loader/GLTFloader');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export default {
  name: 'three-box',
  data() {
    return {
      model: null,
    };
  },
  watch: {},
  created() { },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 全局化camera scene renderer model
      let container = document.getElementById('bot-container');
      // 相机
      window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(-385, 244, 63);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      camera.add(new THREE.PointLight('#fff', 4));
      // 场景
      window.scene = new THREE.Scene();
      // 光源
      let light = new THREE.DirectionalLight(0xffffff);
      light.position.set(-385, 244, 63).normalize();
      scene.add(light);
      // 点光源
      let pointLight = new THREE.PointLight('#ccffcc');
      pointLight.position.set(250, 250, 250);
      scene.add(pointLight);
      // 环境光
      // let ambientLight = new THREE.AmbientLight(0x523318);
      // scene.add(ambientLight);

      // 坐标轴
      let axesHelper = new THREE.AxesHelper(250);
      scene.add(axesHelper);
      // 创建网格
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(-500, 0, 0));
      geometry.vertices.push(new THREE.Vector3(500, 0, 0));
      for (var i = 0; i <= 20; i++) {
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2 }));
        line.position.z = i * 50 - 500;
        scene.add(line);

        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2 }));
        line.position.x = i * 50 - 500;
        line.rotation.y = (90 * Math.PI) / 180;
        scene.add(line);
      }
      // 创建桌面
      let groundGeom = new THREE.PlaneGeometry(250, 250, 1, 1);
      let groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({ color: 0x777777 }));
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.position.copy(new THREE.Vector3(125, 0, 125));
      window.groundMesh = groundMesh;
      scene.add(groundMesh);

      // 初始化渲染器
      window.renderer = new THREE.WebGLRenderer({ antialias: true });
      // 渲染器的大小
      renderer.setSize(container.clientWidth, container.clientHeight);
      // 将渲染器添加到页面
      container.appendChild(renderer.domElement);

      // 创建轨道控制器 相机围绕模型看到的角度
      const OrbitControl = new OrbitControls(camera, renderer.domElement);
      // 设置轨道自然
      OrbitControl.enableDamping = true;
      // 设置惯性
      OrbitControl.update();
      this.animate();
      this.loadGltf();
    },
    animate() {
      // 浏览器自动渲染下一帧
      requestAnimationFrame(this.animate);

      // 渲染到页面
      renderer.render(scene, camera);
    },
    loadGltf() {
      let loader = new THREE.GLTFLoader();
      loader.load(
        'data/RobotExpressive.glb',
        (gltf) => {
          let model = gltf.scene; // 存储gltf模型备用
          this.model = model;
          this.model.scale.set(10, 10, 10);
          window.model = model;
          this.$emit('ready', { model, gltf });
        },
        undefined,
        (e) => {
          console.error(e);
        }
      );
    },
  },
  destroyed() { },
};
</script>

<style lang="less">
.three-box {
  width: 100%;
  height: 100%;
}
</style>
