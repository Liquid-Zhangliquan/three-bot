<template>
  <div class="home-container">
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
  created() {},
  mounted() {},
  methods: {
    sceneReady(data) {
    },
  },
  destroyed() {},
};
</script>

<style lang="less">
.home-container {
  width: 100%;
  height: 100%;
}
</style>
