import { getListRows } from '@/shared/helpers/list';
import type {
  TFilterItemsByGroupIdOptions,
  TGetGroupedListItemsOptions,
  TGroupedListGroup,
  TGroupedListItem
} from '@/shared/ui/virtual-views/VirtualGroupedList/types';

export const filterItemsByGroupId = <Item, Group, KeyField extends keyof Group>(
  items: Item[],
  groupId: Group[KeyField],
  { getGroup, keyField }: TFilterItemsByGroupIdOptions<Item, Group, KeyField>
): Item[] =>
  items.filter((item: Item) => {
    const itemGroup = getGroup(item);
    const itemGroupId = itemGroup[keyField];

    return itemGroupId === groupId;
  });

export const getListItemsWithGroups = <
  Item,
  Group,
  KeyField extends keyof Item & keyof Group
>(
  groups: Group[],
  items: Item[],
  {
    getGroup,
    keyField,
    chunks
  }: TGetGroupedListItemsOptions<Item, Group, KeyField>
) =>
  groups.reduce<TGroupedListItem<Item, Group, KeyField>[]>((result, group) => {
    const groupId = group[keyField];

    const groupRow: TGroupedListGroup<Group> = {
      isGroup: true,
      [keyField]: groupId,
      ...group
    };

    result.push(groupRow);

    const itemsOfGroup = filterItemsByGroupId(items, groupId, {
      keyField,
      getGroup
    });

    const columns = getListRows(itemsOfGroup, {
      chunks,
      keyField
    });

    result.push(...columns);

    return result;
  }, []);
