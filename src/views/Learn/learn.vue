<template>
  <div class="learn-container">
    <three-box @ready="sceneReady" />
  </div>
</template>

<script>
import * as THREE from 'three';
import ThreeBox from '@/components/three-box';
export default {
  name: '',
  components: { ThreeBox },
  data() {
    return {
    };
  },
  watch: {},
  created() { },
  mounted() { },
  methods: {
    sceneReady(data) {
      console.log(data)
      this.load2()
    },
    load() {
      const geometry = new THREE.BufferGeometry(); //创建一个几何体对象
      // 三维样条曲线
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-50, 20, 90),
        new THREE.Vector3(-10, 40, 40),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(60, -60, 0),
        new THREE.Vector3(70, 0, 80)
      ]);
      const pointsArr = curve.getSpacedPoints(100); //曲线取点      
      geometry.setFromPoints(pointsArr); //pointsArr赋值给顶点位置属性 
      const pos = geometry.attributes.position;
      const count = pos.count; //顶点数量
      // 计算每个顶点的颜色值
      const colorsArr = [];
      for (let i = 0; i < count; i++) {
        const percent = i / count; //点索引值相对所有点数量的百分比
        //根据顶点位置顺序大小设置颜色渐变
        // 红色分量从0到1变化，蓝色分量从1到0变化
        colorsArr.push(percent, 0, 1 - percent); //蓝色到红色渐变色
      }
      //类型数组创建顶点颜色color数据
      const colors = new Float32Array(colorsArr);
      // 设置几何体attributes属性的颜色color属性
      geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
      const material = new THREE.LineBasicMaterial({
        vertexColors: true, //使用顶点颜色渲染
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    },
    load2() {
      // 创建多段线条的顶点数据
      const p1 = new THREE.Vector3(0, 0, 100)
      const p2 = new THREE.Vector3(0, 0, 30);
      const p3 = new THREE.Vector3(0, 0, 0);
      const p4 = new THREE.Vector3(30, 0, 0);
      const p5 = new THREE.Vector3(100, 0, 0);
      // 1. 3D直线线段
      const line1 = new THREE.LineCurve3(p1, p2);
      // 2. 三维二次贝塞尔曲线
      const curve = new THREE.QuadraticBezierCurve3(p2, p3, p4);
      // 3. 3D直线线段
      const line2 = new THREE.LineCurve3(p4, p5);

      const CurvePath = new THREE.CurvePath();
      // 三条线拼接为一条曲线
      CurvePath.curves.push(line1, curve, line2);

      // CurvePath:路径   40：沿着轨迹细分数  2：管道半径   25：管道截面圆细分数
      const geometry = new THREE.TubeGeometry(CurvePath, 50, 2, 25);
      const material = new THREE.LineBasicMaterial({
        vertexColors: true, //使用顶点颜色渲染
      });
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh);
    }
  },
  destroyed() { },
};
</script>

<style lang="less">
.learn-container {
  width: 100%;
  height: 100%;
}
</style>
