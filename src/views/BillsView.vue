<script setup lang="ts">
import EmptyView from './EmptyView.vue'

const bills: [] = []
</script>

<template>
  <section>
    <EmptyView v-if="bills.length === 0" />
  </section>
</template>

<style scoped></style>
