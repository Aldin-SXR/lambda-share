<template>
  <div id="app">
    <div class="jumbotron">
      <h1 class="display-4"><span style="color: #E97B22">Lambda</span>Share</h1>
      <p
        class="lead"
      >This is a simple file upload and sharing application built using AWS Lambda and AWS S3.</p>
      <hr class="my-4" />
      <p>The application allows you to upload new files, if they do not exist already. If they exist, you will get a notification and a link to the file.</p>
      <p>This functionality is achieved via two Lambda functions, one which attempts the upload, and the other (called by the first one) which checks if the file already exists. Lastly, there is a third Lambda function which fetches the most recent files from S3.</p>
      <p class="lead">
        <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
      </p>
    </div>
    <FileUpload msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import FileUpload from "./components/FileUpload.vue";

export default {
  name: "app",
  components: {
    FileUpload
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
