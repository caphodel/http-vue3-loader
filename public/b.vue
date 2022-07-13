<template>
    <button @click="count++">Count 2 is: {{ count }} <span> test</span></button>
</template>
<script>
    module.exports = {
		name: 'VTest2',
        data() {
            return {
                count: 0
            }
        }
    }
</script>
<style scoped>
    button {
        font-weight: bold;
		color: red;
    }
	button > span{
		color: yellow;
	}
</style>