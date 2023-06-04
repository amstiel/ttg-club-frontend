<template>
  <label class="ui-input">
    <span
      v-if="label"
      class="ui-input__label"
    >
      {{ label }}
    </span>

    <span
      :class="{ 'is-error': errorText }"
      class="ui-input__control"
    >
      <input
        ref="input"
        class="ui-input__input"
        :value="model"
        :min="min"
        :max="max"
        :autocomplete="inputAutocomplete"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :spellcheck="spellcheck"
        :type="inputType"
        :inputmode="inputMode"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
      >

      <span
        v-if="type === 'password'"
        class="ui-input__control_icon"
        @click.left.exact.prevent="togglePass"
      >
        <svg-icon
          :icon="`password/${showedPass ? 'show' : 'hide'}`"
        />
      </span>

      <ui-erase-button
        v-if="isClearable && model"
        @clear="clear"
      />
    </span>

    <span
      v-if="!!errorText"
      class="ui-input__error"
    >
      {{ errorText }}
    </span>
  </label>
</template>

<script setup lang="ts">
  import {
    computed, nextTick, onMounted, ref, unref, watch
  } from 'vue';
  import { useFocus, useVModel } from '@vueuse/core';
  import { isNil } from 'lodash';
  import SvgIcon from '@/components/UI/icons/SvgIcon.vue';
  import UiEraseButton from '@/components/UI/kit/button/UiEraseButton.vue';
  import { useInputCursor } from '@/common/composition/useInputCursor';
  import type { IUiInputProps } from '@/components/UI/kit/input/UiInput.types';

  defineOptions({
    inheritAttrs: false
  });

  const props = withDefaults(
    defineProps<IUiInputProps>(),
    {
      label: '',
      placeholder: '',
      autofocus: false,
      autocomplete: false,
      type: 'text',
      isInteger: true,
      disableNegative: false,
      isError: false,
      isClearable: false,
      min: undefined,
      max: undefined,
      maxLength: 255,
      required: false,
      errorText: '',
      spellcheck: false
    }
  );

  type TEmit = {
    (e: 'focus', v: FocusEvent): void;
    (e: 'input', v: typeof props.modelValue): void;
    (e: 'change', v: typeof props.modelValue): void;
    (e: 'clear'): void;
    (e: 'blur', v: FocusEvent): void;
    (e: 'update:modelValue', v: typeof props.modelValue): void;
    (e: 'compositionstart', v: CompositionEvent): void;
    (e: 'compositionupdate', v: CompositionEvent): void;
    (e: 'compositionend', v: CompositionEvent): void;
  }

  const emit = defineEmits<TEmit>();
  const showedPass = ref(false);
  const input = ref<HTMLInputElement>();
  const isComposing = ref(false);
  const model = useVModel(props, 'modelValue');
  const { recordCursor, setCursor } = useInputCursor(input);

  const { focused } = useFocus(input, {
    initialValue: props.autofocus
  });

  const error = ref({
    status: false,
    text: ''
  });

  const nativeInputValue = computed(() => (isNil(props.modelValue) ? '' : String(props.modelValue)));

  const inputType = computed(() => {
    if (props.type === 'password') {
      return showedPass.value ? 'text' : 'password';
    }

    return props.type;
  });

  const inputMode = computed(() => {
    switch (props.type) {
      case 'number':
        return 'numeric';

      default:
        return 'verbatim';
    }
  });

  const inputAutocomplete = computed(() => {
    switch (typeof props.autocomplete) {
      case 'boolean':
        return props.autocomplete ? 'on' : 'off';

      case 'string':
        return props.autocomplete;

      default:
        return 'off';
    }
  });

  const clear = () => {
    emit('update:modelValue', '');
    emit('change', '');
    emit('clear');
    emit('input', '');
  };

  const focus = async () => {
    await nextTick();

    focused.value = true;
  };

  const togglePass = () => {
    showedPass.value = !showedPass.value;
    focus();
  };

  const typeValidate = (e: KeyboardEvent) => {
    const isControlKey = e.key.length > 1;
    const key = Number(e.key);
    const isNum = Number.isInteger(key);
    const isValueEmpty = e.target.value;

    if (props.type === 'number' && !isControlKey) {
      if (!isNum || (!isValueEmpty && !key)) {
        e.preventDefault();
      }
    }
  };

  const configNegativeValue = (value: string) => {
    if (value.length <= 1) {
      return value;
    }

    if (value[1] === '-') {
      return value[0];
    }

    if (value[value.length - 1] === '-') {
      return value.substring(0, value.length - 1);
    }

    return value;
  };

  const getNumberValue = (value: string) => {
    let numberValue = !props.disableNegative
      ? value
        .replace(/,/g, '.')
        .replace(/[^\d.-]/g, '')
      : value
        .replace(/,/g, '.')
        .replace(/[^.\d]+/g, '');

    if (!props.disableNegative) {
      numberValue = configNegativeValue(numberValue);
    }

    if (numberValue.includes('.')) {
      const valueArr = numberValue.split('.');
      const integer = valueArr[0];
      const decimal = valueArr[1].substring(0);

      numberValue = props.isInteger
        ? integer
        : `${ integer }.${ decimal }`;
    }

    return numberValue;
  };

  const getUpdatedValue = (value: string) => {
    let inputValue = value;

    switch (props.type) {
      case 'number':
        inputValue = getNumberValue(value);

        break;

      default:
        break;
    }

    return inputValue;
  };

  const setNativeInputValue = () => {
    const control = unref(input) as HTMLInputElement;
    const newValue = getUpdatedValue(control.value);

    if (!control.value || control.value === newValue) {
      return;
    }

    control.value = newValue;
  };

  const onFocus = (e: FocusEvent) => {
    focused.value = true;

    emit('focus', e);
  };

  const onBlur = (e: FocusEvent) => {
    focused.value = false;

    emit('blur', e);
  };

  const onInput = async (e: Event) => {
    recordCursor();

    const { value } = e.target as HTMLInputElement;

    if (isComposing.value) {
      return;
    }

    if (value === nativeInputValue.value) {
      setNativeInputValue();

      return;
    }

    emit('input', value);
    emit('update:modelValue', value);

    await nextTick();
    setNativeInputValue();
    setCursor();
  };

  const handleCompositionStart = (event: CompositionEvent) => {
    emit('compositionstart', event);

    isComposing.value = true;
  };

  const handleCompositionUpdate = (event: CompositionEvent) => {
    emit('compositionupdate', event);
  };

  const handleCompositionEnd = (event: CompositionEvent) => {
    emit('compositionend', event);

    if (isComposing.value) {
      isComposing.value = false;

      onInput(event);
    }
  };

  watch(nativeInputValue, () => setNativeInputValue());

  watch(
    () => props.type,
    async () => {
      await nextTick();
      setNativeInputValue();
    }
  );

  onMounted(() => {
    if (props.autofocus) {
      focus();
    }

    setNativeInputValue();
  });
</script>

<style lang="scss" scoped>
  .ui-input {
    display: inline-flex;
    width: 100%;

    &__label {
      margin-bottom: 8px;
      display: block;
    }

    &__control {
      @include css_anim();

      border: 1px solid var(--border);
      background: var(--bg-sub-menu);
      border-radius: 8px;
      display: flex;
      overflow: hidden;
      width: 100%;

      &.is-error {
        border-color: var(--error);
      }

      &_icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 38px;
        width: 38px;
        cursor: pointer;
        padding: 10px;
        color: var(--text-color-title);
      }
    }

    &__input {
      width: 100%;
      background-color: transparent;
      color: var(--text-color);
      font-size: var(--main-font-size);
      height: 42px;
      font-family: 'Open Sans', serif;
      padding: 4px 12px;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      border: 0;
      flex: 1 1 auto;
    }

    &__error {
      color: var(--text-btn-color);
      font-size: calc(var(--main-font-size) - 2px);
      z-index: 1;
      padding: 0 6px;
      display: block;
      position: absolute;
      background-color: var(--error);
      border-radius: 4px;
      top: 32px;
      left: 8px;
    }

    &:focus-within {
      .ui-input {
        &__control {
          @include css_anim();

          border-color: var(--primary-active);
        }

        &__input {
          background-color: transparent;
        }
      }
    }

    &:hover {
      .ui-input {
        &__control {
          border-color: var(--primary-hover);
        }

        &__input {
          background-color: transparent;
        }
      }
    }
  }
</style>
