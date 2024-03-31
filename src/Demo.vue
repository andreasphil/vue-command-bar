<script setup lang="ts">
import { useCommandBar } from "@/components/CommandBar.vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const { open, registerCommand } = useCommandBar();

const color = ref("");
const animal = ref("");

const selection = computed(() => {
  if (!color.value && !animal.value) return "Nothing selected.";
  return `You selected a ${color.value ?? ""}${
    animal.value ? ` ${animal.value}` : " animal"
  }.`;
});

let cleanup: () => void;

onMounted(() => {
  cleanup = registerCommand(
    {
      id: "red",
      groupName: "Colors",
      name: "Red",
      action: () => {
        color.value = "red";
      },
      icon: () => "🔴",
    },
    {
      id: "orange",
      groupName: "Colors",
      name: "Orange",
      action: () => {
        color.value = "orange";
      },
      icon: () => "🟠",
    },
    {
      id: "yellow",
      groupName: "Colors",
      name: "Yellow",
      action: () => {
        color.value = "yellow";
      },
      icon: () => "🟡",
    },
    {
      id: "green",
      groupName: "Colors",
      name: "Green",
      action: () => {
        color.value = "green";
      },
      icon: () => "🟢",
    },
    {
      id: "blue",
      groupName: "Colors",
      name: "Blue",
      action: () => {
        color.value = "blue";
      },
      icon: () => "🔵",
    },
    {
      id: "purple",
      groupName: "Colors",
      name: "Purple",
      action: () => {
        color.value = "purple";
      },
      icon: () => "🟣",
    },
    {
      id: "black",
      groupName: "Colors",
      name: "Black",
      action: () => {
        color.value = "black";
      },
      icon: () => "⚫️",
    },
    {
      id: "white",
      groupName: "Colors",
      name: "White",
      action: () => {
        color.value = "white";
      },
      icon: () => "⚪️",
    },
    {
      id: "crab",
      groupName: "Animals",
      name: "Crab",
      alias: ["red"],
      action: () => {
        animal.value = "crab";
      },
      icon: () => "🦀",
    },
    {
      id: "fox",
      groupName: "Animals",
      name: "Fox",
      alias: ["orange"],
      action: () => {
        animal.value = "fox";
      },
      icon: () => "🦊",
    },
    {
      id: "chick",
      groupName: "Animals",
      name: "Chick",
      alias: ["yellow"],
      action: () => {
        animal.value = "chick";
      },
      icon: () => "🐥",
    },
    {
      id: "snake",
      groupName: "Animals",
      name: "Snake",
      alias: ["green"],
      action: () => {
        animal.value = "snake";
      },
      icon: () => "🐍",
    },
    {
      id: "whale",
      groupName: "Animals",
      name: "Whale",
      alias: ["blue"],
      action: () => {
        animal.value = "whale";
      },
      icon: () => "🐳",
    },
    {
      id: "unicorn",
      groupName: "Animals",
      name: "Unicorn",
      alias: ["purple"],
      action: () => {
        animal.value = "unicorn";
      },
      icon: () => "🦄",
    },
    {
      id: "blackbird",
      groupName: "Animals",
      name: "Blackbird",
      alias: ["black"],
      action: () => {
        animal.value = "blackbird";
      },
      icon: () => "🐦‍⬛",
    },
    {
      id: "polar_bear",
      groupName: "Animals",
      name: "Polar bear",
      alias: ["white"],
      action: () => {
        animal.value = "polar bear";
      },
      icon: () => "🐻‍❄️",
    },
    {
      id: "clear_color",
      groupName: "Reset",
      name: "Clear color",
      chord: "cc",
      action: () => {
        color.value = "";
      },
    },
    {
      id: "clear_animal",
      groupName: "Reset",
      name: "Clear animal",
      chord: "ca",
      action: () => {
        animal.value = "";
      },
    },
    {
      id: "clear_all",
      name: "Reset",
      action: () => {
        animal.value = "";
        color.value = "";
      },
    }
  );
});

onBeforeUnmount(() => {
  cleanup?.();
});
</script>

<template>
  <button @click="open()">Press ⌘K or click here</button>
  <p>{{ selection }}</p>
</template>

<style scoped></style>
