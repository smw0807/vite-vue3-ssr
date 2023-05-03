<script setup lang="ts">
// import { ref } from 'vue';
// import type { Ref } from 'vue';
import { useTestStore } from '~/store';
const testStore = useTestStore();

/**
 * Ref로는 반응형 적용이 안됨...??
 */
// const count: Ref<number> = ref(testStore.count);
const up = () => {
  testStore.increment();
};
</script>
<template>
  <div>
    <p>index.vue</p>
    <p>{{ testStore.count }}</p>
    <button @click="up">UP!!</button>
  </div>
</template>
