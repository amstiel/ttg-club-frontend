<template>
  <content-layout
    :filter-instance="filter"
    :show-right-side="showRightSide"
    :is-end="isEnd"
    :on-load-more="nextPage"
    title="Бестиарий"
    @search="onSearch"
    @update="initPages"
  >
    <virtual-grouped-list
      :list="getListProps({ items: bestiary, size: 'medium' })"
      :get-group="getGroupByChallengeRating"
      :grid="{
        flat: checkIsListGridFlat({ showRightSide, fullscreen }),
        reference: setReference
      }"
    >
      <template #default="{ item: creature }">
        <creature-link
          :creature="creature"
          :to="{ path: creature.url }"
        />
      </template>
    </virtual-grouped-list>
  </content-layout>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia';
  import { computed, onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import CreatureLink from '@/pages/Workshop/Bestiary/CreatureLink.vue';

  import ContentLayout from '@/layouts/ContentLayout.vue';

  import { useFilter } from '@/shared/compositions/useFilter';
  import { usePagination } from '@/shared/compositions/usePagination';
  import { useScrollToPathInList } from '@/shared/compositions/useScrollToPathInList';
  import { isAutoOpenAvailable } from '@/shared/helpers/isAutoOpenAvailable';
  import { useUIStore } from '@/shared/stores/UIStore';
  import type { AnyObject } from '@/shared/types/Utility';
  import { BestiaryFilterDefaults } from '@/shared/types/Workshop/Bestiary.d';
  import { checkIsListGridFlat } from '@/shared/ui/virtual-views/VirtualGridList/helpers';
  import VirtualGroupedList from '@/shared/ui/virtual-views/VirtualGroupedList/VirtualGroupedList.vue';
  import { getListProps } from '@/shared/ui/virtual-views/VirtualList/helpers';

  const route = useRoute();
  const router = useRouter();
  const uiStore = useUIStore();
  const { fullscreen } = storeToRefs(uiStore);

  const filter = useFilter({
    url: BestiaryFilterDefaults.url,
    dbName: BestiaryFilterDefaults.dbName
  });

  const {
    initPages,
    nextPage,
    isEnd,
    items: bestiary
  } = usePagination({
    url: '/bestiary',
    filter: {
      isCustomized: filter.isCustomized,
      value: filter.queryParams
    },
    search: filter.search,
    order: [
      {
        field: 'exp',
        direction: 'asc'
      },
      {
        field: 'name',
        direction: 'asc'
      }
    ]
  });

  const onSearch = async () => {
    await initPages();

    if (isAutoOpenAvailable(bestiary)) {
      await router.push({ path: bestiary.value[0].url });
    }
  };

  const getGroupByChallengeRating = (item: AnyObject) => ({
    name: item.challengeRating,
    url: item.challengeRating
  });

  onBeforeMount(async () => {
    await filter.initFilter();

    await initPages();
  });

  const showRightSide = computed(() => route.name === 'creatureDetail');

  const { setReference } = useScrollToPathInList({
    items: bestiary,
    showRightSide
  });
</script>
