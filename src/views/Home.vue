<template>
  <div class="home-container">
    <div class="three-box" id="bot-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
let scene = null,
  light = null,
  camera = null,
  renderer = null;
export default {
  name: '',
  components: {},
  data() {
    return {};
  },
  watch: {},
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let container = document.getElementById('bot-container');

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(0, 100, 500);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // 场景
      scene = new THREE.Scene();
      light = new THREE.DirectionalLight(0xff0000, 1.0, 0);
      light.position.set(100, 100, 200);
      scene.add(light);
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

      // 初始化渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true });
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
    },
    animate() {
      // 浏览器自动渲染下一帧
      requestAnimationFrame(this.animate);

      // 渲染到页面
      renderer.render(scene, camera);
    },
  },
  destroyed() {},
};
</script>

<style lang="less">
.home-container {
  width: 100%;
  height: 100%;
  .three-box {
    width: 100%;
    height: 100%;
  }
}
</style>
