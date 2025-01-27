<template>
  <content-layout
    :filter-instance="filter"
    :is-end="isEnd"
    :on-load-more="nextPage"
    :show-right-side="showRightSide"
    title="Правила и термины"
    @search="onSearch"
    @update="initPages"
  >
    <virtual-grid-list
      :flat="checkIsListGridFlat({ showRightSide, fullscreen })"
      :reference="setReference"
      :list="getListProps({ items: rules, size: 'small' })"
    >
      <template #default="{ item: rule }">
        <rule-link
          :rule="rule"
          :to="{ path: rule.url }"
        />
      </template>
    </virtual-grid-list>
  </content-layout>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import RuleLink from '@/pages/Wiki/Rules/RuleLink.vue';

  import ContentLayout from '@/layouts/ContentLayout.vue';

  import { useFilter } from '@/shared/compositions/useFilter';
  import { usePagination } from '@/shared/compositions/usePagination';
  import { useScrollToPathInList } from '@/shared/compositions/useScrollToPathInList';
  import { isAutoOpenAvailable } from '@/shared/helpers/isAutoOpenAvailable';
  import { useUIStore } from '@/shared/stores/UIStore';
  import { RulesFilterDefaults } from '@/shared/types/Wiki/Rules.d';
  import { checkIsListGridFlat } from '@/shared/ui/virtual-views/VirtualGridList/helpers';
  import VirtualGridList from '@/shared/ui/virtual-views/VirtualGridList/VirtualGridList.vue';
  import { getListProps } from '@/shared/ui/virtual-views/VirtualList/helpers';

  const route = useRoute();
  const router = useRouter();
  const uiStore = useUIStore();

  const { fullscreen } = storeToRefs(uiStore);

  const filter = useFilter({
    dbName: RulesFilterDefaults.dbName,
    url: RulesFilterDefaults.url
  });

  const {
    initPages,
    nextPage,
    isEnd,
    items: rules
  } = usePagination({
    url: '/rules',
    filter: {
      isCustomized: filter.isCustomized,
      value: filter.queryParams
    },
    search: filter.search,
    order: [
      {
        field: 'name',
        direction: 'asc'
      }
    ]
  });

  const onSearch = async () => {
    await initPages();

    if (isAutoOpenAvailable(rules)) {
      await router.push({ path: rules.value[0].url });
    }
  };

  onBeforeMount(async () => {
    await filter.initFilter();
    await initPages();
  });

  const showRightSide = computed(() => route.name === 'ruleDetail');

  const { setReference } = useScrollToPathInList({
    items: rules,
    showRightSide
  });
</script>
