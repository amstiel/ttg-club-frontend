import { defineStore } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import localforage from 'localforage';
import { DB_NAME } from '@/common/const/UI';
import errorHandler from '@/common/helpers/errorHandler';
import isArray from 'lodash/isArray';
import { v4 as uuidV4 } from 'uuid';

// eslint-disable-next-line import/prefer-default-export
export const useDefaultBookmarkStore = defineStore('DefaultBookmarkStore', {
    state: () => ({
        bookmarks: [],
        store: localforage.createInstance({
            name: DB_NAME,
            storeName: 'bookmarks'
        })
    }),

    getters: {
        getBookmarks: state => state.bookmarks,
        isBookmarkSaved() {
            return url => !!this.getBookmarkByURL(url);
        }
    },

    actions: {
        getNewUUID() {
            let uuid = uuidV4();

            if (this.bookmarks.find(item => item.uuid === uuid)) {
                uuid = this.getNewUUID();
            }

            return uuid;
        },

        async convertOldBookmarks() {
            try {
                await this.store.ready();

                if (this.$isDev) {
                    await this.store.setItem(
                        'saved',
                        [
                            {
                                label: 'Расы',
                                links: [
                                    {
                                        label: 'Полуэльф (лесной)',
                                        url: '/races/Half-Elf/Forest'
                                    },
                                    {
                                        label: 'Полуэльф (водный)',
                                        url: '/races/Half-Elf/Water'
                                    }
                                ]
                            },
                            {
                                label: 'Классы',
                                links: [
                                    {
                                        label: 'Варвар',
                                        url: '/classes/Barbarian'
                                    },
                                    {
                                        label: 'Варвар Путь Священного Рода',
                                        url: '/classes/Barbarian/Sacred_Family'
                                    },
                                    {
                                        label: 'Варвар Путь Титана',
                                        url: '/classes/Barbarian/Titanium'
                                    }
                                ]
                            },
                            {
                                label: 'Разделы',
                                links: [
                                    {
                                        label: 'Классы',
                                        url: '/classes'
                                    },
                                    {
                                        label: 'Расы',
                                        url: '/races'
                                    },
                                    {
                                        label: 'Черты',
                                        url: '/traits'
                                    },
                                    {
                                        label: 'Особенности классов',
                                        url: '/options'
                                    },
                                    {
                                        label: 'Оружие',
                                        url: '/weapons'
                                    },
                                    {
                                        label: 'Доспехи',
                                        url: '/armors'
                                    },
                                    {
                                        label: 'Снаряжение',
                                        url: '/items'
                                    }
                                ]
                            },
                            {
                                label: 'Заклинания',
                                links: [
                                    {
                                        label: 'Анализ устройства',
                                        url: '/spells/Analyze_device'
                                    },
                                    {
                                        label: 'Брызги кислоты',
                                        url: '/spells/Acid_splash'
                                    },
                                    {
                                        label: 'Власть над огнём',
                                        url: '/spells/Control_Flames'
                                    },
                                    {
                                        label: 'Волшебная рука',
                                        url: '/spells/Mage_hand'
                                    }
                                ]
                            },
                            {
                                label: 'Ширма Мастера',
                                links: [
                                    {
                                        label: 'Урон и атака',
                                        url: '/screens/Damage_and_Attack'
                                    },
                                    {
                                        label: 'Реакция',
                                        url: '/screens/Reaction'
                                    },
                                    {
                                        label: 'Окружающая среда',
                                        url: '/screens/Environment'
                                    },
                                    {
                                        label: 'Падение',
                                        url: '/screens/Falling'
                                    },
                                    {
                                        label: 'Истинное зрение',
                                        url: '/screens/True_sight'
                                    },
                                    {
                                        label: 'Тусклый свет',
                                        url: '/screens/Dim_Light'
                                    }
                                ]
                            }
                        ]
                    );
                }

                const oldFormat = await this.store.getItem('saved');

                if (isArray(oldFormat) && oldFormat.length) {
                    const parent = cloneDeep({
                        uuid: this.getNewUUID(),
                        order: -1,
                        name: 'Общие'
                    });
                    const list = [parent];

                    for (let i = 0; i < oldFormat.length; i++) {
                        const category = oldFormat[i];
                        const updatedCat = cloneDeep({
                            uuid: this.getNewUUID(),
                            order: i,
                            name: category.label,
                            parentUUID: parent.uuid
                        });

                        list.push(updatedCat);

                        for (let j = 0; j < category.links.length; j++) {
                            const bookmark = category.links[j];

                            list.push({
                                uuid: this.getNewUUID(),
                                order: j,
                                name: bookmark.label,
                                url: bookmark.url,
                                parentUUID: updatedCat.uuid
                            });
                        }
                    }

                    this.bookmarks = list;

                    await this.saveBookmarks();

                    await this.store.removeItem('saved');
                }
            } catch (err) {
                errorHandler(err);
            }
        },

        async restoreBookmarks() {
            try {
                await this.store.ready();

                await this.convertOldBookmarks();

                const restored = await this.store.getItem('default');

                this.bookmarks = isArray(restored) && restored.length
                    ? cloneDeep(restored)
                    : [];
            } catch (err) {
                errorHandler(err);
            }
        },

        async saveBookmarks() {
            try {
                await this.store.ready();

                await this.store.setItem('default', cloneDeep(this.bookmarks));
            } catch (err) {
                errorHandler(err);
            }
        },

        async getCategories() {
            try {
                const resp = await this.$http.get('/bookmarks/categories');

                if (resp.status !== 200) {
                    return Promise.reject(resp.statusText);
                }

                return Promise.resolve(resp.data);
            } catch (err) {
                return Promise.reject(err);
            }
        },

        async getCategoryByURL(url) {
            try {
                const resp = await this.$http.get('/bookmarks/category', {
                    url: encodeURIComponent(url)
                });

                if (resp.status !== 200) {
                    return Promise.reject(resp.statusText);
                }

                return Promise.resolve(resp.data);
            } catch (err) {
                return Promise.reject(err);
            }
        },

        async getCategoryByCode(code) {
            try {
                const resp = await this.$http.get('/bookmarks/category', { code });

                if (resp.status !== 200) {
                    return Promise.reject(resp.statusText);
                }

                return Promise.resolve(resp.data);
            } catch (err) {
                return Promise.reject(err);
            }
        },

        createDefaultGroup() {
            const defaultGroup = cloneDeep({
                uuid: this.getNewUUID(),
                name: 'Общие',
                order: -1
            });

            this.bookmarks.push(defaultGroup);

            return defaultGroup;
        },

        getDefaultGroup() {
            let group = this.bookmarks.find(bookmark => bookmark.order === -1);

            if (!group) {
                group = this.createDefaultGroup();
            }

            return group;
        },

        createCategory(category) {
            const parent = this.getDefaultGroup();
            const newCategory = cloneDeep({
                uuid: this.getNewUUID(),
                name: category.name,
                order: category.order,
                parentUUID: parent.uuid
            });

            this.bookmarks.push(newCategory);

            return newCategory;
        },

        async addBookmark(url, name, category) {
            try {
                if (!url || !name) {
                    return Promise.reject();
                }

                let cat;

                if (typeof category === 'string') {
                    cat = await this.getCategoryByCode(category);
                }

                if (!cat) {
                    cat = await this.getCategoryByURL(url);
                }

                let savedCat = this.bookmarks.find(bookmark => bookmark.name === cat.name);

                if (!savedCat) {
                    savedCat = await this.createCategory(cat);
                }

                this.bookmarks.push(cloneDeep({
                    uuid: this.getNewUUID(),
                    name,
                    url,
                    order: this.bookmarks.filter(bookmark => bookmark.parentUUID === savedCat.uuid).length,
                    parentUUID: savedCat.uuid
                }));

                await this.saveBookmarks();

                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            }
        },

        getBookmarkByURL(url) {
            const defaultGroup = this.bookmarks.find(bookmark => bookmark.order === -1);
            const categoriesUUIDs = this.bookmarks
                .filter(bookmark => bookmark.parentUUID === defaultGroup?.uuid)
                .map(category => category.uuid);

            return this.bookmarks
                .filter(bookmark => categoriesUUIDs.includes(bookmark.parentUUID))
                .find(bookmark => bookmark.url === url);
        },

        async removeBookmark(url) {
            if (!url || !this.isBookmarkSaved(url)) {
                return;
            }

            const deleteUUIDs = [];
            const addEmptyParents = bookmark => {
                const parent = this.bookmarks.find(item => item.uuid === bookmark?.parentUUID);

                if (!parent) {
                    return;
                }

                const siblings = this.bookmarks.filter(item => item.parentUUID === parent.uuid);

                if (siblings?.length !== 1) {
                    return;
                }

                deleteUUIDs.push(parent.uuid);

                if (parent.parentUUID) {
                    addEmptyParents(parent);
                }
            };
            const bookmark = this.getBookmarkByURL(url);

            deleteUUIDs.push(bookmark.uuid);

            if (bookmark.parentUUID) {
                addEmptyParents(bookmark);
            }

            this.bookmarks = this.bookmarks.filter(item => !deleteUUIDs.includes(item.uuid));

            await this.saveBookmarks();
        },

        async updateBookmark(url, name, category) {
            if (this.isBookmarkSaved(url)) {
                await this.removeBookmark(url);

                return;
            }

            await this.addBookmark(url, name, category);
        }
    }
});
