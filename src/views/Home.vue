<template>
  <div class="home-container">
    <three-box @ready="sceneReady" />
    <div class="panle-form">
      <el-input v-model="order" placeholder="请输入指令" type="textarea"></el-input>
      <div class="form-footer">
        <div class="import-com">
          <import-from-location @upload="clearOrder" @confirm="confirmData" />
        </div>
        <div class="order-btn">
          <el-button type="primary" @click="sendOrder">发送指令</el-button>
          <el-button @click="clearOrder">清空指令</el-button>
        </div>
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
import ThreeBox from '@/components/three-box';
import ImportFromLocation from '@/components/important-from-location.vue';
export default {
  name: '',
  components: { ThreeBox, ImportFromLocation },
  data() {
    return {
      order: '',
      showResult: false,
      result: '',
      model: null,
    };
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    sceneReady(data) {
      console.log(data);
      const { model } = data;
      this.model = model;
    },
    /**
     * 添加模型
     */
    addGltf(x, y, direction) {
      if (!this.model) {
        this.$message.error('模型未加载成功');
        return;
      }
      const model = this.setModelPositon(x, y, direction);
      scene.add(model);
    },
    /**
     * 根据方向设置模型旋转角度
     */
    getPosiotnYBydirection(direction) {
      let rotationY = null;
      switch (direction) {
        case 'NORTH':
          rotationY = Math.PI / 2;
          break;
        case 'WEST':
          rotationY = Math.PI;
          break;
        case 'SOUTH':
          rotationY = -Math.PI / 2;
          break;
        case 'EAST':
          rotationY = 0;
          break;
      }
      return rotationY;
    },
    /**
     * 设置模型位置
     */
    setModelPositon(x, y, direction) {
      const rotationY = this.getPosiotnYBydirection(direction);
      this.model['direction'] = direction;
      this.model.rotation.y = rotationY; // 沿y轴旋转方向 默认正东为模型初始方向
      this.model.position.copy(new THREE.Vector3(y * 50, 0, x * 50)); //Vector3(x,y,z) 坐标原点 西南角 x:50代表北方向1格 z:50代表东方向1格子
      return this.model;
    },
    /**
     * 向前前进一格
     */
    moveDirection() {
      const { direction } = this.model;
      let { x, z } = this.model.position; // 实际x对应y，z对应x
      x = x / 50;
      z = z / 50;
      switch (direction) {
        case 'NORTH':
          x = x + 1;
          break;
        case 'WEST':
          z = z - 1;
          break;
        case 'SOUTH':
          x = x - 1;
          break;
        case 'EAST':
          z = z + 1;
          break;
      }
      // 实际x对应y，z对应x
      return {
        mx: z,
        my: x,
        mDirection: direction,
      };
    },
    /**
     * 改变模型前进方向
     */
    changeDirection(action) {
      let { direction } = this.model;
      switch (direction) {
        case 'NORTH':
          action === 'LEFT' ? (direction = 'WEST') : (direction = 'EAST');
          break;
        case 'WEST':
          action === 'LEFT' ? (direction = 'SOUTH') : (direction = 'NORTH');
          break;
        case 'SOUTH':
          action === 'LEFT' ? (direction = 'EAST') : (direction = 'WEST');
          break;
        case 'EAST':
          action === 'LEFT' ? (direction = 'NORTH') : (direction = 'SOUTH');
          break;
      }
      const rotationY = this.getPosiotnYBydirection(direction);
      this.model.rotation.y = rotationY;
      this.model['direction'] = direction;
    },
    reportPostion() {
      this.showResult = true;
      const { direction } = this.model;
      let { x, z } = this.model.position; // 实际x对应y，z对应x
      x = x / 50;
      z = z / 50;
      this.result = `${z},${x},${direction}`;
    },
    sendOrder() {
      console.log(this.order);
      this.testRule(this.order);
    },
    testRule() {
      const instructs = this.order.split('\n');
      let DoTask = false; // 是否执行指令标识
      for (let i = 0; i < instructs.length; i++) {
        const instruct = instructs[i];
        if (instruct.includes('PLACE')) DoTask = true;
        if (!DoTask) continue;
        // 没有放置到桌面上的机器人应当忽略 MOVE、LEFT、RIGHT 和 REPORT 命令
        console.log(instruct);
        const action = this.getAction(instruct);
        switch (action) {
          case 'PLACE':
            const section = instruct.split(' ');
            const [x, y, direction] = section[1].split(',');
            if (!this.testPosition(Number(x), Number(y))) return;
            this.addGltf(Number(x), Number(y), direction);
            break;
          case 'MOVE':
            const { mx, my, mDirection } = this.moveDirection();
            if (!this.testPosition(mx, my)) return;
            this.setModelPositon(mx, my, mDirection);
            break;
          case 'LEFT':
          case 'RIGHT':
            this.changeDirection(action);
            break;
          case 'REPORT':
            this.reportPostion();
            break;
          default:
            this.$message.info('未识别到有效指令');
            break;
        }
      }
    },
    /**
     * 获取指令
     * @param {*} instruct
     * PLACE MOVE LEFT RIGHT REPORT
     */
    getAction(instruct) {
      const action = instruct.split(' ')[0];
      return action;
    },
    /**
     * 验证位置是否满足要求 需要满足在5*5的方格之内
     * 在初始放置或运动过程中，机器人一定不要从桌面掉落
     * @param {*} x
     * @param {*} y
     */
    testPosition(x, y) {
      let xflag = false;
      if (0 <= x && x <= 5) xflag = true;
      let yflag = false;
      if (0 <= y && y <= 5) yflag = true;
      let flag = xflag && yflag;
      if (!flag) {
        this.$message.info('初始放置或者运动过程中坐标超出范围');
        // this.clearOrder();
      }
      return flag;
    },
    // 清除指令
    clearOrder() {
      this.order = '';
      scene.remove(model);
      this.showResult = false;
    },
    // 从文件中读取的指令
    confirmData(data) {
      this.order = data;
    },
  },
  destroyed() {},
};
</script>

<style lang="less">
.home-container {
  width: 100%;
  height: 100%;
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
      flex-direction: column;
      .import-com {
        margin-top: 10px;
      }
      .order-btn {
        display: flex;
        justify-content: space-around;
        margin-top: 10px;
      }
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
