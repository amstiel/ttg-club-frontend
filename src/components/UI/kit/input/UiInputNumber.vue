<template>
  <ui-input
    :model-value="modelValue"
    @keydown.up.prevent="increase"
    @keydown.down.prevent="decrease"
    @blur="handleBlur"
    @focus="handleFocus"
    @input="handleInput"
    @change="handleInputChange"
  />
</template>

<script setup lang="ts">
  import UiInput from '@/components/UI/kit/input/UiInput.vue';
  import type { IUiInputNumberProps } from '@/components/UI/kit/input/UiInput.types';

  const props = withDefaults(
    defineProps<IUiInputNumberProps>(),
    {
      isInteger: false,
      disableNegative: false,
      min: Number.NEGATIVE_INFINITY,
      max: Number.POSITIVE_INFINITY
    }
  );
</script>

<style module lang="scss">

</style>
