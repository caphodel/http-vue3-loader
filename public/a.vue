<template>
    <button @click="count++">Count is: {{ count }}<span> test</span></button>
	<v-test23></v-test23>
</template>
<script>
    module.exports = {
		name: 'VTest',
		components:{
			'v-test23': 'url:b.vue'
		},
        data() {
            return {
                count: 0
            }
        }
    }
</script>
<style>
    button {
        font-weight: bold;
		
    }
</style>