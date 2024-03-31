<script setup lang="ts">
import CommandBar from "@/components/CommandBar.vue";
import Demo from "@/Demo.vue";
import { useThemeColor } from "@andreasphil/design-system";
import { onMounted } from "vue";

onMounted(() => {
  useThemeColor();
});
</script>

<template>
  <CommandBar>
    <main data-trim="both">
      <h1>Command Bar Demo</h1>
      <Demo />
    </main>
  </CommandBar>
</template>

<style>
@import "@andreasphil/design-system/dist/index.min.css" layer(theme);

main {
  text-align: center;
}
</style>
