<template>
  <div class="introuvable">
    <div class="message">
      Page introuvable!
    </div>
    <div class="robot">
      <img id="robot" src="~@/assets/img/robot.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Introuvable',
};
</script>

<style scoped>
.introuvable {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.message {
  font-size: 3em;
  font-family: 'Caviar Dreams';
  font-weight: bold;
}

.robot {
  height: 70%;
}

.robot img {
  max-height: 100%;
  max-width: 100%;
}
</style>
