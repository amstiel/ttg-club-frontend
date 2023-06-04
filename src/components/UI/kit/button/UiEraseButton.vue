<template>
  <ui-button
    v-tippy="{ content: 'Стереть строку поиска' }"
    :class="$style['ui-erase-button']"
    type="text"
    icon="close"
    color="text"
    @click.left.exact.prevent="onClick"
  />
</template>

<script setup lang="ts">
  import UiButton from '@/components/UI/kit/button/UiButton.vue';

  type TEmit = {
    (e: 'clear'): void;
  }

  const emit = defineEmits<TEmit>();

  const onClick = () => {
    emit('clear');
  };
</script>

<style lang="scss" module>
  .ui-erase-button {
    button {
      height: 100%;
      border-radius: 0;
    }
  }
</style>
