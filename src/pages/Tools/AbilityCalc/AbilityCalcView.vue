<template>
  <page-layout
    :use-social-links="false"
    class="ability-calc"
  >
    <template #title> Калькулятор характеристик </template>

    <template #default>
      <ability-races
        v-model="raceBonuses"
        class="ability-calc__row"
      />

      <ui-switch
        v-model="currentTab"
        :options="tabs"
        class="ability-calc__row"
        pre-select-first
        full-width
      />

      <transition
        mode="out-in"
        name="fade"
      >
        <keep-alive v-if="!!component">
          <component
            :is="component"
            v-model="rolls"
            class="ability-calc__row"
          />
        </keep-alive>
      </transition>

      <ability-table
        :race-bonuses="raceBonuses"
        :rolls="rolls"
        class="ability-calc__row"
      />
    </template>
  </page-layout>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, shallowRef } from 'vue';

  import AbilityArray from '@/pages/Tools/AbilityCalc/AbilityArray.vue';
  import AbilityPointBuy from '@/pages/Tools/AbilityCalc/AbilityPointBuy.vue';
  import AbilityRaces from '@/pages/Tools/AbilityCalc/AbilityRaces/AbilityRaces.vue';
  import AbilityRandom from '@/pages/Tools/AbilityCalc/AbilityRandom.vue';
  import AbilityTable from '@/pages/Tools/AbilityCalc/AbilityTable.vue';

  import PageLayout from '@/layouts/PageLayout.vue';

  import type { AbilityRoll } from '@/shared/types/Tools/AbilityCalc.d';
  import UiSwitch from '@/shared/ui/kit/UiSwitch.vue';

  import type { Component } from 'vue';

  type TCalcTab = {
    id: string;
    name: string;
    component: Component;
  };

  export default defineComponent({
    components: {
      AbilityRaces,
      AbilityTable,
      PageLayout,
      UiSwitch
    },
    setup() {
      const tabs: TCalcTab[] = [
        {
          id: 'random',
          name: 'Случайный набор',
          component: shallowRef(AbilityRandom)
        },
        {
          id: 'point-buy',
          name: '«Покупка» значений',
          component: shallowRef(AbilityPointBuy)
        },
        {
          id: 'standard',
          name: 'Стандартный набор',
          component: shallowRef(AbilityArray)
        }
      ];

      const raceBonuses = ref<Array<AbilityRoll>>([]);
      const currentTab = ref(tabs[0]);
      const rolls = ref<Array<AbilityRoll>>([]);

      const component = computed(() => currentTab.value?.component || null);

      return {
        tabs,
        currentTab,
        component,
        rolls,
        raceBonuses
      };
    }
  });
</script>

<style lang="scss" scoped>
  .ability-calc {
    &__row {
      & + & {
        margin-top: 40px;
      }
    }
  }
</style>
