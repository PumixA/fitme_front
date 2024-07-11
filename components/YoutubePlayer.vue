<template>
  <div class="youtube-player">
    <iframe
      :src="embedUrl"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  props: {
    videoId: {
      type: String,
      required: true
    }
  },
  computed: {
    embedUrl() {
      return `https://www.youtube.com/embed/${this.videoId}`;
    }
  }
};
</script>

<style scoped>
.youtube-player iframe {
  width: 100%;
  height: 100%;
}
</style>
