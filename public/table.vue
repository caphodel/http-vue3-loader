<style scoped>
    th {
        cursor: pointer;
    }

    .arrow {
        color: gray;
    }

    .active {
        color: black;
    }
</style>

<template>
    <div v-if="workers.length === 0">No workers available.</div>

    <div v-else>
        <input v-model="searchString" placeholder="search" class="mb-1">
        <table>
            <thead>
                <th v-for="header in headers" @click="setSortColumn(header.key)">
                    {{ header.value }}
                    <span class="arrow" :class="{ active: this.sortColumn === header.key && this.order === 'ASC'}">
                        &#8593;
                    </span>
                    <span class="arrow" :class="{ active: this.sortColumn === header.key && this.order === 'DESC'}">
                        &#8595;
                    </span>
                </th>
            </thead>
            <tbody>
                <tr v-for="worker in filteredWorkers">
                    <td>{{worker.name}}</td>
                    <td>{{worker.position}}</td>
                    <td>{{worker.office}}</td>
                    <td>{{worker.age}}</td>
                </tr>
            </tbody>
        </table>
        <div>component 1.1 </div>
		<v-test></v-test>
        <div>component 1.2 (using js)</div>
		<v-sync></v-sync>
    </div>
</template>

<script>
    module.exports = {
		name: 'VTable',
        props: ["headers", "workers", ],
		components:{
			'v-test': 'url:a.vue',
			'v-sync': 'url:table.js'
		},
        data() {
            return {
                sortColumn: "",
                order: "ASC",
                searchString: "",
            }
        },
        computed: {
            filteredWorkers() {
                const filteredWorkers = this.searchString === "" ?
                    this.workers :
                    this.workers.filter(wo => Object.values(wo).join("").indexOf(this.searchString) !== -1);

                const column = this.sortColumn
                const order = this.order;

                filteredWorkers.sort(function(a, b) {
                    var nameA = a[column] + "".toUpperCase();
                    var nameB = b[column] + "".toUpperCase();
                    if (order === "DESC" && nameA > nameB) {
                        return -1;
                    }
                    if (order === "DESC" && nameA < nameB) {
                        return 1;
                    }
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });

                return filteredWorkers;
            },
        },
        methods: {
            setSortColumn(column) {
                if (this.sortColumn === column) {
                    this.order = this.order === "ASC" ? "DESC" : "ASC";
                } else {
                    this.order = "ASC";
                    this.sortColumn = column;
                }
            },
        },
    }
</script>