<template>
  <div class="home-container">
    <div class="three-box" id="bot-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
// import '@/utils/loader/GLTFloader';
require('@/utils/loader/GLTFloader');
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
      // 相机
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(-385, 244, 63);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      camera.add(new THREE.PointLight('#fff', 4));
      window.camera = camera;
      // 场景
      scene = new THREE.Scene();
      // 光源
      light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);

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
      this.addGltf();
    },
    addGltf() {
      let loader = new THREE.GLTFLoader();
      loader.load(
        'data/RobotExpressive.glb',
        (gltf) => {
          debugger;
          let model = gltf.scene;
          window.model = model;
          // model.rotation.x = Math.PI / 2;
          model.scale.set(10, 10, 10);
          model.position.copy(new THREE.Vector3(0, 0, 0)); // 坐标原点 西南角 x:50代表北方向1格 z:50代表东方向1格子
          scene.add(model);
          // this.createGUI(model, gltf.animations);
          this.animate();
        },
        undefined,
        (e) => {
          console.error(e);
        }
      );
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
