<template>
  <div class="home-container">
    <div class="three-box" id="bot-container"></div>
    <div class="panle-form">
      <el-input v-model="order" placeholder="请输入指令" type="textarea"></el-input>
      <div class="form-footer">
        <el-button type="primary" @click="sendOrder">发送指令</el-button>
        <el-button @click="clearOrder">清空指令</el-button>
      </div>
    </div>
    <div class="panle-export" v-show="showResult">
      输出结果
      <el-input v-model="result" disabled placeholder="" type="textarea"></el-input>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
// import '@/utils/loader/GLTFloader';
require('@/utils/loader/GLTFloader');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// let scene = null,
//   light = null,
//   camera = null,
//   renderer = null;
export default {
  name: '',
  components: {},
  data() {
    return {
      order: '',
      showResult: false,
      result: '',
    };
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
      window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(-385, 244, 63);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      camera.add(new THREE.PointLight('#fff', 4));
      window.camera = camera;
      // 场景
      window.scene = new THREE.Scene();
      // 光源
      let light = new THREE.DirectionalLight(0xffffff);
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
    loadGltf() {
      let loader = new THREE.GLTFLoader();
      loader.load(
        'data/RobotExpressive.glb',
        (gltf) => {
          let model = gltf.scene;
          window.model = model; // 存储gltf模型备用
          model.scale.set(10, 10, 10);
          // this.createGUI(model, gltf.animations);
        },
        undefined,
        (e) => {
          console.error(e);
        }
      );
    },
    addGltf(x, y, direction) {
      const rotationY = this.getPosiotnYBydirection(direction);
      model.rotation.y = rotationY; // 沿y轴旋转方向 默认正东为模型初始方向
      model.position.copy(new THREE.Vector3(y * 50, 0, x * 50)); // 坐标原点 西南角 x:50代表北方向1格 z:50代表东方向1格子
      scene.add(model);
    },
    getPosiotnYBydirection(direction) {
      let rotationY = null;
      switch (direction) {
        case 'NORTH':
          rotationY = 0;
          break;
        case 'WEST':
          rotationY = Math.PI;
          break;
        case 'SOUTH':
          rotationY = -Math.PI / 2;
          break;
        case 'EAST':
          rotationY = Math.PI / 2;
          break;
      }
      return rotationY;
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
    sendOrder() {
      console.log(this.order);
      this.testRule(this.order);
      this.showResult = true;
    },
    testRule() {
      const conditions = this.order.split('\n');
      let flag = false; // 需要遇到PLACE 语句才能正常执行指令
      conditions.map((condition) => {
        if (condition.includes('PLACE')) {
          flag = true;
          const section = condition.split(' ');
          const [x, y, direction] = section[1].split(',');
          const task = this.testPosition(Number(x), Number(y), direction);
          if (task) {
            this.addGltf(Number(x), Number(y), direction);
          }
        }
        if (flag) {
        }
      });
    },
    // 验证位置是否满足要求 需要满足在5*5的方格之内
    testPosition(z, x, direction) {
      return true;
    },
    clearOrder() {
      this.order = '';
      scene.remove(model);
      this.showResult = false;
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
  .panle-form {
    position: absolute;
    left: 10px;
    top: 10px;
    background: #cccc;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    textarea {
      width: 260px;
      height: 200px;
    }
    .form-footer {
      display: flex;
      justify-content: space-around;
      margin-top: 10px;
    }
  }
  .panle-export {
    position: absolute;
    left: 10px;
    bottom: 10px;
    background: #cccc;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    textarea {
      width: 260px;
      height: 100px;
    }
  }
}
</style>
