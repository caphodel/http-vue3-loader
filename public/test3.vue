<template>
    <div>
        <div class="content">
            <h1>{{title}}</h1>
            <label for="title">
                <input type="text" name="title" v-model="inputVal" />
            </label>
            <button @click="addTitle" class="add-btn">Add</button>
            <button @click="clearInput">Clear</button>
        </div>
    </div>
</template>
<script>
    module.exports = {
        setup() {
            const inputVal = 'asd';
            const title = 'bcd';

            function clearInput() {
                this.inputVal = "";
            }

            function addTitle() {
                this.title = this.inputVal;
            }

            return {
                inputVal,
                title,
                clearInput,
                addTitle
            };
        }
    };
</script>