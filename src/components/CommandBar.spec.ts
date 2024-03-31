import "@testing-library/jest-dom/vitest";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { cleanup, configure, render, screen } from "@testing-library/vue";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { Component, defineComponent } from "vue";
import CommandBar, { useCommandBar } from "./CommandBar.vue";

function withCommandBar(inner: Component) {
  const Wrapper = defineComponent({
    components: { CommandBar, inner },
    template: `<CommandBar><inner /></CommandBar>`,
  });

  return Wrapper;
}

describe("CommandBar", () => {
  let user: UserEvent;

  beforeAll(() => {
    // Needs to be set because the dialog and all its children will always be
    // hidden. This is because jsdom doesn't really support the dialog element
    // yet, but since it's in the DOM, we can still access it (kind of). One
    // limitation, however, is that the dialog and its contents will always
    // appear as hidden.
    configure({ defaultHidden: true });
  });

  beforeEach(() => {
    user = userEvent.setup();

    // Default stubs for dialog methods in case they get called during the
    // tests.
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  test("renders", () => {
    render(CommandBar);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("renders the slot content", () => {
    const example = defineComponent({
      template: `<button>Hello</button>`,
    });

    render(withCommandBar(example));

    expect(screen.getByRole("button", { name: "Hello" })).toBeInTheDocument();
  });

  test("falls back to no-op methods when using the composable without a command bar", () => {
    let bar: ReturnType<typeof useCommandBar> | null = null;
    const example = defineComponent({
      template: `<span />`,
      setup() {
        bar = useCommandBar();
      },
    });

    render(example);

    expect(bar).not.toBeNull();
    expect(typeof bar!.open).toBe("function");
    expect(typeof bar!.registerCommand).toBe("function");
    expect(typeof bar!.removeCommand).toBe("function");
  });

  describe("shows and hides", () => {
    test("opens when the hotkey is pressed", async () => {
      const showModal = vi.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render(CommandBar);

      await user.keyboard("{Meta>}k{/Meta}");
      expect(showModal).toHaveBeenCalled();
    });

    test("opens when a custom hotkey is pressed", async () => {
      const showModal = vi.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render(CommandBar, {
        props: { hotkey: { ctrlKey: true, shiftKey: true, key: "p" } },
      });

      await user.keyboard("{Meta>}k{/Meta}");
      expect(showModal).not.toHaveBeenCalled();

      await user.keyboard("{Control>}{Shift>}p{/Control}{/Shift}");
      expect(showModal).toHaveBeenCalled();
    });

    test("opens when the composable method is called", async () => {
      const example = defineComponent({
        template: `<button @click="open()">Open</button>`,
        setup() {
          const { open } = useCommandBar();
          return { open };
        },
      });

      const showModal = vi.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render(withCommandBar(example));

      await user.click(screen.getByRole("button", { name: "Open" }));
      expect(showModal).toHaveBeenCalled();
    });

    test("closes when escape is pressed", async () => {
      const close = vi.fn();
      HTMLDialogElement.prototype.close = close;
      render(CommandBar);

      await user.keyboard("{Meta>}k{/Meta}");
      await user.click(screen.getByLabelText("Search..."));
      await user.keyboard("{Escape}");
      expect(close).toHaveBeenCalled();
    });

    test("doesn't close when escape is pressed", async () => {
      const close = vi.fn();
      HTMLDialogElement.prototype.close = close;
      render(CommandBar, { props: { allowEscape: false } });

      await user.keyboard("{Meta>}k{/Meta}");
      await user.click(screen.getByLabelText("Search..."));
      await user.keyboard("{Escape}");
      expect(close).not.toHaveBeenCalled();
    });

    test("closes when a command is run", async () => {
      const action = vi.fn();
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand, open } = useCommandBar();
          registerCommand({ id: "foo", name: "Foo", action });
          open();
        },
      });

      const close = vi.fn();
      HTMLDialogElement.prototype.close = close;
      render(withCommandBar(example));

      await user.type(screen.getByLabelText("Search..."), "Foo{Enter}");
      expect(action).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  describe("manages commands", () => {
    test("registers commands", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand(
            { id: "1", name: "1A", action: vi.fn() },
            { id: "2", name: "2A", action: vi.fn() },
            { id: "3", name: "3A", action: vi.fn() }
          );
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByLabelText("Search..."), "a");
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    test("unregisters commands via cleanup function", async () => {
      const example = defineComponent({
        template: `<button @click="cleanup()">Cleanup</button>`,
        setup() {
          const { registerCommand } = useCommandBar();
          const cleanup = registerCommand(
            { id: "1", name: "1A", action: vi.fn() },
            { id: "2", name: "2A", action: vi.fn() },
            { id: "3", name: "3A", action: vi.fn() }
          );

          return { cleanup };
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByLabelText("Search..."), "a");
      expect(screen.getAllByRole("button")).toHaveLength(4); // 3 commands + cleanup

      await user.click(screen.getByRole("button", { name: "Cleanup" }));
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("unregisters commands via composable method", async () => {
      const example = defineComponent({
        template: `<button @click="cleanup()">Cleanup</button>`,
        setup() {
          const { registerCommand, removeCommand } = useCommandBar();
          registerCommand(
            { id: "1", name: "1A", action: vi.fn() },
            { id: "2", name: "2A", action: vi.fn() },
            { id: "3", name: "3A", action: vi.fn() }
          );

          function cleanup() {
            removeCommand("1", "2", "3");
          }

          return { cleanup };
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByLabelText("Search..."), "a");
      expect(screen.getAllByRole("button")).toHaveLength(4); // 3 commands + cleanup

      await user.click(screen.getByRole("button", { name: "Cleanup" }));
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("renders commands", () => {
    test.todo("limits visible results to 10 by default", async () => {});

    test.todo("limits visible results by a custom amount", async () => {});

    test.todo("shows the name", async () => {});

    test.todo("shows the group name", async () => {});

    test.todo("doesn't show an empty group name", async () => {});

    test.todo("shows the icon", async () => {});

    test.todo("doesn't show an empty icon", async () => {});

    test.todo("shows the chord", async () => {});

    test.todo("doesn't show an empty chord", async () => {});
  });

  describe("runs commands", () => {
    test.todo("runs the focused command on enter", async () => {});

    test.todo("runs a command on click", async () => {});

    test.todo("runs a command on tab + enter", async () => {});

    test.todo("runs the command focused via tab when in doubt", async () => {});
  });

  describe("searches and selects commands", () => {
    test.todo("focuses the first command by default", async () => {});

    test.todo("doesn't show commands when the search is empty", async () => {});

    test.todo("finds commands by chord", async () => {});

    test.todo("highlights matches by chord", async () => {});

    test.todo("doesn't highlight matches not found via chord", async () => {});

    test.todo("shows chord matches before other commands", async () => {});

    test.todo("clears search on escape", async () => {});

    test.todo("moves focus down", async () => {});

    test.todo("moves focus up", async () => {});

    test.todo("doesn't move focus before the first item", async () => {});

    test.todo("doesn't move focus past the last item", async () => {});

    test.todo("starts focus at the first item", async () => {});

    test.todo("finds commands by name", async () => {});

    test.todo("finds commands by group name", async () => {});

    test.todo("finds commands by alias", async () => {});

    test.todo(
      "finds commands by a combination of name, group name, and alias",
      () => {}
    );

    test.todo("narrows selection with additional search terms", async () => {});

    test.todo("searches case-insensitive", async () => {});

    test.todo(
      "shows the default empty state when no result is found",
      () => {}
    );

    test.todo(
      "shows a custom empty state when no result is found",
      async () => {}
    );

    test.todo(
      "doesn't show the empty state if search is empty",
      async () => {}
    );
  });
});
