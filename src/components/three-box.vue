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
  created() {},
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
      let axesHelper = new THREE.AxesHelper(100);
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
      var groundGeom = new THREE.PlaneGeometry(250, 250, 4, 4);
      var groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({ color: 0x777777 }));
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
    createGUI(model, animations) {
      var states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
      var emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
      var api = { state: 'Walking' };
      let previousAction = null;
      let gui = new dat.GUI();

      let mixer = new THREE.AnimationMixer(model);

      let actions = {};

      for (var i = 0; i < animations.length; i++) {
        var clip = animations[i];
        var action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;
        }
      }

      // states

      var statesFolder = gui.addFolder('States');

      var clipCtrl = statesFolder.add(api, 'state').options(states);

      clipCtrl.onChange(function () {
        fadeToAction(api.state, 0.5);
      });

      statesFolder.open();

      // emotes

      var emoteFolder = gui.addFolder('Emotes');

      function fadeToAction(name, duration) {
        previousAction = activeAction;
        activeAction = actions[name];
        if (previousAction !== activeAction) {
          previousAction.fadeOut(duration);
        }
        activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
      }

      function createEmoteCallback(name) {
        api[name] = function () {
          fadeToAction(name, 0.2);

          mixer.addEventListener('finished', restoreState);
        };

        emoteFolder.add(api, name);
      }

      function restoreState() {
        mixer.removeEventListener('finished', restoreState);

        fadeToAction(api.state, 0.2);
      }

      for (var i = 0; i < emotes.length; i++) {
        createEmoteCallback(emotes[i]);
      }

      emoteFolder.open();

      // expressions

      let face = model.getObjectByName('Head_2');

      var expressions = Object.keys(face.morphTargetDictionary);
      var expressionFolder = gui.addFolder('Expressions');

      for (var i = 0; i < expressions.length; i++) {
        expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i]);
      }

      let activeAction = actions['Walking'];
      activeAction.play();

      expressionFolder.open();
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
          // this.createGUI(model, gltf.animations);
        },
        undefined,
        (e) => {
          console.error(e);
        }
      );
    },
  },
  destroyed() {},
};
</script>

<style lang="less">
.three-box {
  width: 100%;
  height: 100%;
}
</style>
