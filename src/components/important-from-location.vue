<template>
  <div class="import-location">
    <el-upload
      class="upload-demo"
      action=""
      :accept="'.text'"
      :limit="1"
      :file-list="fileList"
      :auto-upload="false"
      :on-remove="() => (fileList = [])"
      :on-change="onAddFileUpload"
    >
      <el-button size="small" type="primary" @click="Upload">从文件中导入指令</el-button>
      <!-- <div slot="tip" class="el-upload__tip">请选择一个.text文件进行上传</div> -->
    </el-upload>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      fileList: [],
    };
  },
  created() {},
  mounted() {},
  methods: {
    Upload() {
      this.fileList = [];
      this.$emit('upload');
    },
    onAddFileUpload(file, fileList) {
      let reader = new FileReader();
      reader.readAsText(file.raw, 'UTF-8');
      reader.onload = (e) => {
        console.log(reader.result);
        let result = reader.result.replaceAll('\r', ''); // \r\n 需要将多余的\r去掉
        this.$emit('confirm', result);
      };
    },
  },
};
</script>
<style lang="less">
.import-location {
  .el-upload {
    display: flex;
    justify-content: center;
  }
}
</style>