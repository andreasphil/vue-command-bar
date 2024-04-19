<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type Component,
} from "vue";

const props = withDefaults(
  defineProps<{
    /** When true, closes the command bar when ESC is pressed. */
    allowEscape?: boolean;

    /** When true, repeats the most recent command when ⌘. is pressed. */
    allowRepeat?: boolean;

    /** Allows you to set a custom hotkey. Defaults to ⌘K. */
    hotkey?: KeyboardShortcut;

    /** Limit the number of results that are shown. Defaults to 10. */
    limitResults?: number;

    /** Changes the placeholder of the search field. Defaults to "Search...". */
    placeholder?: string;
  }>(),
  {
    allowEscape: true,
    allowRepeat: true,
    hotkey: () => ({ key: "k", metaKey: true }),
    limitResults: 10,
    placeholder: "Search...",
  }
);

/* -------------------------------------------------- *
 * Visibility                                         *
 * -------------------------------------------------- */

const dialogEl = ref<HTMLDialogElement | null>(null);

const searchEl = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);

watch(isOpen, (is, was) => {
  if (is === was) return;
  else if (is) dialogEl.value?.showModal();
  else dialogEl.value?.close();
});

async function toggle(open = !isOpen.value) {
  isOpen.value = open;

  if (!open) {
    query.value = "";
    focusedResult.value = 0;
  }
}

function onEscape() {
  if (query.value) {
    query.value = "";
    focusedResult.value = 0;
  } else if (props.allowEscape) {
    toggle(false);
  }
}

function onToggleShortcut(e: KeyboardEvent) {
  let match = Object.entries(props.hotkey).reduce((match, [key, value]) => {
    return match && e[key as keyof KeyboardEvent] === value;
  }, true);

  if (!match) return;

  toggle();
  e.preventDefault();
  e.stopPropagation();
}

onMounted(() => {
  addEventListener("keydown", onToggleShortcut);
});

onBeforeUnmount(() => {
  removeEventListener("keydown", onToggleShortcut);
});

/* -------------------------------------------------- *
 * Command registration                               *
 * -------------------------------------------------- */

const commands = ref<Command[]>([]);

const chords = computed<Map<string, Command>>(() =>
  commands.value
    .filter((c) => Boolean(c.chord))
    .reduce(
      (all, current) => all.set(current.chord!, current),
      new Map<string, Command>()
    )
);

function registerCommand(...toRegister: Command[]): () => void {
  const ids = toRegister.map((c) => c.id);
  removeCommand(...ids);
  commands.value = [...commands.value, ...toRegister];

  return () => {
    removeCommand(...ids);
  };
}

function removeCommand(...toRemove: string[]): void {
  commands.value = commands.value.filter((c) => !toRemove.includes(c.id));

  if (mostRecent.value && toRemove.includes(mostRecent.value.id)) {
    mostRecent.value = null;
  }
}

function runCommand(command: Command) {
  command.action();
  mostRecent.value = command;
  toggle(false);
}

/* -------------------------------------------------- *
 * Repeatable commands                                *
 * -------------------------------------------------- */

const mostRecent = ref<Command | null>(null);

function runMostRecent() {
  if (mostRecent.value) runCommand(mostRecent.value);
}

function onRunMostRecent(e: KeyboardEvent) {
  if (!(e.metaKey && e.key === ".")) return;

  e.preventDefault();
  e.stopPropagation();
  runMostRecent();
}

onMounted(() => {
  addEventListener("keydown", onRunMostRecent);
});

onBeforeUnmount(() => {
  removeEventListener("keydown", onRunMostRecent);
});

/* -------------------------------------------------- *
 * Searching and running                              *
 * -------------------------------------------------- */

const query = ref("");

const focusedResult = ref(0);

const filteredCommands = computed(() => {
  if (!query.value) return [];

  const queryTokens = query.value.toLowerCase().split(" ");

  const result: Array<Command & { chordMatch?: true }> = commands.value
    .filter((i) => {
      const commandStr = [i.name, ...(i.alias ?? []), i.groupName ?? ""]
        .join(" ")
        .toLowerCase();

      return queryTokens.every((token) => commandStr.includes(token));
    })
    .slice(0, props.limitResults);

  const matchingChord = chords.value.get(query.value);
  if (matchingChord) result.unshift({ ...matchingChord, chordMatch: true });

  return result;
});

function moveFocusDown() {
  const next = focusedResult.value + 1;
  focusedResult.value = Math.min(filteredCommands.value.length - 1, next);
}

function moveFocusUp() {
  focusedResult.value = Math.max(focusedResult.value - 1, 0);
}

function runFocusedCommand() {
  const command = filteredCommands.value[focusedResult.value];
  if (command) runCommand(command);
}

/* -------------------------------------------------- *
 * Public interface                                   *
 * -------------------------------------------------- */

function openWithQuery(initialQuery = "") {
  query.value = initialQuery;
  toggle(true);
}

provide(CommandBarContext, {
  registerCommand,
  removeCommand,
  open: openWithQuery,
});
</script>

<script lang="ts">
import { InjectionKey } from "vue";

export type KeyboardShortcut = Partial<
  Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">
>;

export type Command = {
  /** The unique identifier of the command. Can be any string. */
  id: string;

  /** The visible name of the command. */
  name: string;

  /**
   * A list of aliases of the command. If the user searches for one of them,
   * the alias will be treated as if it was the name of the command.
   */
  alias?: string[];

  /**
   * A unique combination of characters. If the user types those exact
   * characters in the search field, the associated command will be shown
   * prominently and highlighted.
   */
  chord?: string;

  /** An additional label displayed before the name. */
  groupName?: string;

  /**
   * Icon of the command. Should be a component, for example an SVG or a
   * function returning some string (e.g. an emoji).
   */
  icon?: Component;

  /** Callback to run when the command is invoked. */
  action: () => void;
};

export const CommandBarContext: InjectionKey<{
  /**
   * Register one or multiple commands. This will return a cleanup function
   * which can be used for removing all registered commands.
   *
   * @param toRegister The commands that should be registered.
   */
  registerCommand: (...toRegister: Command[]) => () => void;

  /**
   * Remove one or multiple commands by their IDs.
   *
   * @param toRemove The IDs of the commands that should be removed.
   */
  removeCommand: (...toRemove: string[]) => void;

  /** Manually open the command bar. */
  open: (query?: string) => void;
}> = Symbol();

/**
 * Returns access to the context of the command bar, which allows you to
 * register or remove commands, and other stuff. For this to work, it needs
 * to be called inside a descendant component of the CommandBar. When called
 * outside of that, the function will still return all the expected values,
 * but they won't do anything.
 */
export function useCommandBar() {
  return inject(CommandBarContext, {
    registerCommand(..._: Command[]) {
      return () => {};
    },

    removeCommand(..._: string[]) {},

    open(_?: string) {},
  });
}
</script>

<template>
  <slot />

  <dialog
    @close="isOpen = false"
    @keydown.down.stop.prevent="moveFocusDown()"
    @keydown.enter.stop.prevent="runFocusedCommand()"
    @keydown.escape.stop.prevent="onEscape()"
    @keydown.up.stop.prevent="moveFocusUp()"
    ref="dialogEl"
  >
    <!-- Search field -->
    <header :class="$style.header">
      <label>
        <span data-hidden>{{ placeholder }}</span>
        <input
          :placeholder
          autofocus
          ref="searchEl"
          type="search"
          v-model="query"
        />
      </label>
    </header>

    <div :class="$style.body" data-with-fallback>
      <!-- Commands list -->
      <ul :class="$style.resultsList">
        <li v-for="(c, i) in filteredCommands" :key="c.id">
          <button
            :class="{
              [$style.result]: true,
              [$style.focused]: i === focusedResult,
              [$style.chordMatch]: c.chordMatch,
            }"
            @click="runCommand(c)"
            @keydown.enter.stop.prevent="runCommand(c)"
          >
            <component v-if="c.icon" :is="c.icon" />
            <template v-if="c.groupName">
              <span :class="$style.groupName">{{ c.groupName }}</span>
              <span :class="$style.groupName">&rsaquo;</span>
            </template>
            <span data-clamp :title="c.name">{{ c.name }}</span>
            <span v-if="c.chord" :class="$style.chord">{{ c.chord }}</span>
          </button>
        </li>
      </ul>

      <div v-if="query" data-when="empty">
        <slot name="empty">
          <p>☹️</p>
          <p>Sorry, couldn't find anything.</p>
        </slot>
      </div>
    </div>
  </dialog>
</template>

<style module>
/* -------------------------------------------------- *
 * Dialog                                             *
 * -------------------------------------------------- */

.header {
  font-weight: normal;
  margin: 0;
}

.body {
  max-height: calc(80dvh - 12rem);
  overflow: auto;
}

.body > * {
  margin-top: 0.625rem;
}

.resultsList {
  list-style-type: none;
  margin: 0.625rem 0 0 0;
  padding: 0;
}

/* -------------------------------------------------- *
 * List items                                         *
 * -------------------------------------------------- */

.result {
  --\$button-outline-offset: var(--outline-inset);

  background: transparent;
  color: var(--c-fg);
  justify-content: start;
  padding: 0.375rem 0.5rem;
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--c-surface-variant-bg);
  }

  &.focused {
    background: var(--c-surface-variant-bg);
  }

  &.chordMatch {
    background: var(--primary-50);
    color: var(--primary-500);

    &:hover {
      background: var(--primary-100);
    }

    .groupName {
      color: var(--primary-400);
    }

    .chord {
      border-color: var(--primary-200);
      color: var(--primary-400);
    }
  }
}

.groupName {
  color: var(--c-fg-variant);
  display: inline-block;
  flex: none;
  font-weight: var(--font-weight-normal);
}

.chord {
  background: var(--c-surface-bg);
  border-radius: var(--border-radius-small);
  border: var(--border-width) solid var(--c-border);
  color: var(--c-fg-variant);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-mono);
  margin-left: auto;
  padding: 0 0.25rem;
}
</style>
