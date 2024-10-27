<script setup lang="ts">
import CommandBar from "@/components/CommandBar.vue";
import Demo from "@/Demo.vue";
import { useThemeColor } from "@andreasphil/design-system";
import { onMounted, ref, watchEffect } from "vue";

onMounted(() => {
  useThemeColor();
});

const commandBarEl = ref<InstanceType<typeof CommandBar> | null>(null);

watchEffect(() => {
  if (commandBarEl.value)
    commandBarEl.value.registerCommand({
      id: "hello-world",
      name: "Hello world",
      groupName: "Test",
      action: () => alert("Hello world!"),
    });
});
</script>

<template>
  <CommandBar ref="commandBarEl">
    <main data-trim="both">
      <h1>Command Bar Demo</h1>
      <Demo />
    </main>
  </CommandBar>
</template>

<style>
@import "@andreasphil/design-system/style.css" layer(theme);

main {
  text-align: center;
}
</style>
