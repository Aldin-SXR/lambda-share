<template>
  <div class="container">
    <div class="row d-flex justify-content-center">
      <div class="col-12 col-md-8">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroupFileAddon01">Upload</span>
          </div>
          <div class="custom-file">
            <input
              type="file"
              class="custom-file-input"
              id="file"
              ref="file"
              v-on:change="handleFileUpload()"
              aria-describedby="inputGroupFileAddon01"
            />
            <label class="custom-file-label" for="inputGroupFile01">{{ fileName }}</label>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-1">
        <button class="btn btn-primary" v-bind:disabled="disabled" v-on:click="submitFile()">
            <span v-if="disabled">
                <span style="width: 20px; height: 20px;" class="spinner-border" role="status">
                </span>
            </span>
            <span v-else>Submit</span>
        </button>
      </div>
    </div>
    <div class="row d-flex justify-content-center" style="margin-top: 10px">
      <div v-if="newUpload">
        <p>
          <strong>Latest uploaded file:</strong>
          <a v-bind:href="latestFilePath" target="_blank">{{ latestFilePath }}</a>
        </p>
      </div>
      <div v-if="previousUpload">
        <p>
          <strong>The file you were trying to upload is available at:</strong>
          <a v-bind:href="latestFilePath" target="_blank">{{ latestFilePath }}</a>
        </p>
      </div>
    </div>
    <div v-if="files && files.length > 0" class="row d-flex" style="margin-top: 10px">
        <h4><i class="far fa-file"></i>&nbsp;Most recent files</h4>
      <table class="table">
        <thead class="thead-dark">
          <tr>
            <th scope="col">File (click to download)</th>
            <!-- <th scope="col">Original name</th> -->
            <!-- <th scope="col">Uploader</th> -->
            <!-- <th scope="col">Content type</th> -->
            <th scope="col">Size (KB)</th>
            <th scope="col">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, i) in files" v-bind:key="i">
            <td> <a v-bind:href="file.file_path" target="_blank">{{ file.name }}</a></td>
            <!-- <td>{{ file.original_name }}</td> -->
            <!-- <td>{{ file.uploaded_by }}</td> -->
            <!-- <td>{{ file.content_type }}</td> -->
            <td>{{ file.kb_size }}</td>
            <td>{{ file.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
        <p class='text-muted'>Loading recent files...</p>
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/index.css";
import Vue from "vue";

Vue.use(VueToast);

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      file: "",
      disabled: false,
      fileName: "Choose file",
      buttonText: "Submit",
      latestFilePath: "",
      previousUpload: false,
      newUpload: false,
      files: []
    };
  },
  mounted() {
    this.getFiles();
  },
  methods: {
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
      this.fileName = this.$refs.file.files[0].name;
    },
    submitFile() {
      let self = this;
      let formData = new FormData();
      formData.append("file", this.file);

      if (!this.file || this.fileName === "") {
        Vue.$toast.error("You did not specify a file.", {
          position: "top-right"
        });
        return;
      }

      self.disabled = true;
      axios
        .post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          self.file = "";
          self.fileName = "Choose file";
          if (response.data.file_exists) {
            Vue.$toast.info("This file has been previously uploaded.", {
              position: "top-right"
            });
            self.previousUpload = true;
            self.newUpload = false;
          } else {
            Vue.$toast.success("File successfully uploaded.", {
              position: "top-right"
            });
            self.previousUpload = false;
            self.newUpload = true;
            self.getFiles();
          }
          self.latestFilePath = response.data.file_path;
          self.disabled = false;
        })
        .catch(error => {
          console.log(error);
          Vue.$toast.error("File upload failed.", {
            position: "top-right"
          });
          self.disabled = false;
        });
    },
    getFiles() {
        let self = this;
      axios
        .get("/files?limit=10")
        .then(response => {
          self.files = response.data.files;
        })
        .catch(error => {
          Vue.$toast.error("File retrieval failed.", {
            position: "top-right"
          });
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
