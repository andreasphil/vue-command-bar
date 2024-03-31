<h1 align="center">
  Command Bar 🐝
</h1>

<p align="center">
  <strong>Simple `⌘K` command bar for Vue</strong>
</p>

> ⚠️ Work in progress. Things are most certainly incomplete and/or broken, and will definitely change.

- 🚀 Fast, efficient, keyboard-driven UX
- 😌 Simple and opinionated
- 👌 Fully typed and tested
- 🛝 Check out Tasks for a [demo](https://tasks.a13i.dev) and [example usage](https://github.com/andreasphil/tasks)

## Installation

```sh
npm i github:andreasphil/vue-command-bar#<tag>
```

## Usage

Import the styling for the command bar in your `App.vue` (or where you need it):

```ts
import "@andreasphil/design-system/style.css" layer(theme);
import "@andreasphil/vue-command-bar/style.css";
```

To make the command bar available to your app, wrap the part of the application that should have access to it inside the `VueCommandBar` component:

```vue
<script setup lang="ts">
import VueCommandBar from "@andreasphil/vue-command-bar";
</script>

<template>
  <VueCommandBar>
    <!-- Your app -->
  </VueCommandBar>
</template>
```

In any component inside the `VueCommandBar`, you can now call the `useCommandBar` composable to get access to the context. This will provide you with methods for registering and removing commands, as well as opening the bar manually:

```ts
import { useCommandBar } from "@andreasphil/vue-command-bar";

// This will be returned by the method for registering commands. We can use
// this to clean up commands only needed by specific components/views when
// the user navigates away from those.
let cleanup;

const { registerCommand } = useCommandBar();

cleanup = registerCommand({
  id: "a_command",
  name: "A command",
  // See the Command type for all available options
});
```

To learn more about the available props, check out the docs in [CommandBar.vue](./src/components/CommandBar.vue). For examples, see [the demo](./src/Demo.vue).

## Development

The library is compatible with [Vue 3](https://vuejs.org) and built with [Vite](https://vitejs.dev). Packages are managed by [pnpm](https://pnpm.io). Tests are powered by [Vitest](https://vitest.dev). The following commands are available for developing and running the demo:

```
pnpm run dev       # Start development server
pnpm run build     # Create a production bundle
pnpm run test      # Run tests
```

## Credits

This library uses a number of open source packages listed in [package.json](package.json).

Thanks 🙏
