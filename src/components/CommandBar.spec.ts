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

type CommandBarProps = InstanceType<typeof CommandBar>["$props"];

function withCommandBar(inner: Component, props?: CommandBarProps) {
  const Wrapper = defineComponent({
    components: { CommandBar, inner },
    setup() {
      return { commandBarProps: props ?? {} };
    },
    template: `
      <CommandBar v-bind="commandBarProps">
        <inner />
      </CommandBar>
    `,
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

    test("does not open when additional keys are pressed", async () => {
      const showModal = vi.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render(CommandBar);

      await user.keyboard("{Meta>}{Shift>}k{/Meta}{/Shift}");
      expect(showModal).not.toHaveBeenCalled();
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

    test("sets a default search when opening through the composable method", async () => {
      const example = defineComponent({
        template: `<button @click="open('foo')">Open</button>`,
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
      expect(screen.getByRole("searchbox")).toHaveValue("foo");
    });

    test("closes when escape is pressed", async () => {
      const close = vi.fn();
      HTMLDialogElement.prototype.close = close;
      render(CommandBar);

      await user.keyboard("{Meta>}k{/Meta}");
      await user.click(screen.getByRole("searchbox"));
      await user.keyboard("{Escape}");
      expect(close).toHaveBeenCalled();
    });

    test("doesn't close when escape is pressed", async () => {
      const close = vi.fn();
      HTMLDialogElement.prototype.close = close;
      render(CommandBar, { props: { allowEscape: false } });

      await user.keyboard("{Meta>}k{/Meta}");
      await user.click(screen.getByRole("searchbox"));
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

      await user.type(screen.getByRole("searchbox"), "Foo{Enter}");
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

      await user.type(screen.getByRole("searchbox"), "a");
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

      await user.type(screen.getByRole("searchbox"), "a");
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

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getAllByRole("button")).toHaveLength(4); // 3 commands + cleanup

      await user.click(screen.getByRole("button", { name: "Cleanup" }));
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("renders commands", () => {
    test("limits visible results to 10 by default", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand(
            { id: "1", name: "1A", action: vi.fn() },
            { id: "2", name: "2A", action: vi.fn() },
            { id: "3", name: "3A", action: vi.fn() },
            { id: "4", name: "4A", action: vi.fn() },
            { id: "5", name: "5A", action: vi.fn() },
            { id: "6", name: "6A", action: vi.fn() },
            { id: "7", name: "7A", action: vi.fn() },
            { id: "8", name: "8A", action: vi.fn() },
            { id: "9", name: "9A", action: vi.fn() },
            { id: "10", name: "10A", action: vi.fn() },
            { id: "11", name: "11A", action: vi.fn() }
          );
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getAllByRole("button")).toHaveLength(10);
    });

    test("limits visible results by a custom amount", async () => {
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

      render(withCommandBar(example, { limitResults: 2 }));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    test("shows the name", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getByText("1A")).toBeInTheDocument();
    });

    test("shows the group name", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({
            id: "1",
            name: "1A",
            groupName: "Group",
            action: vi.fn(),
          });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(
        screen.getByRole("button", { name: "Group › 1A" })
      ).toBeInTheDocument();
    });

    test("doesn't show an empty group name", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.queryByText("›")).not.toBeInTheDocument();
    });

    test("shows the icon", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({
            id: "1",
            name: "1A",
            icon: () => "😎",
            action: vi.fn(),
          });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getByText("😎")).toBeInTheDocument();
    });

    test("shows the chord", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", chord: "x", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getByText("x")).toBeInTheDocument();
    });
  });

  describe("runs commands", () => {
    test("runs the focused command on enter", async () => {
      const action = vi.fn();

      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a{enter}");
      expect(action).toHaveBeenCalled();
    });

    test("runs a command on click", async () => {
      const action = vi.fn();

      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      await user.click(screen.getByRole("button", { name: "1A" }));
      expect(action).toHaveBeenCalled();
    });

    test.todo("runs a command on tab + enter", async () => {
      // TODO: Somehow can't get the focus to the command in the test ...
    });

    test.todo("runs the command focused via tab when in doubt", async () => {
      // TODO: Somehow can't get the focus to the command in the test ...
    });
  });

  describe("searches and selects commands", () => {
    test("focuses the first command by default", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getByRole("button", { name: "1A" })).toHaveClass("focused");
    });

    test("doesn't show commands when the search is empty", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.clear(screen.getByRole("searchbox"));
      expect(screen.queryByRole("button")).toBeFalsy();
    });

    test("finds commands by chord", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", chord: "x", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", chord: "y", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", chord: "z", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "y");
      expect(screen.getByRole("button", { name: "2A y" })).toBeInTheDocument();
    });

    test("does not show the same command twice when found by chord and query", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({
            id: "1",
            name: "1A",
            chord: "1A",
            action: vi.fn(),
          });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "1A");
      expect(screen.getAllByRole("button", { name: "1A 1A" })).toHaveLength(1);
    });

    test("highlights matches by chord", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", chord: "x", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", chord: "y", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", chord: "z", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "y");
      expect(screen.getByRole("button", { name: "2A y" })).toHaveClass(
        "chordMatch"
      );
    });

    test("doesn't highlight matches not found via chord", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", chord: "x", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", chord: "y", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", chord: "z", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "2A");
      expect(screen.getByRole("button", { name: "2A y" })).not.toHaveClass(
        "chordMatch"
      );
    });

    test("shows chord matches before other commands", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", chord: "x", action: vi.fn() });
          registerCommand({ id: "2", name: "2B", chord: "a", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", chord: "z", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      const chordMatch = screen.getByRole("button", { name: "2B a" });
      const nextMatch = screen.getByRole("button", { name: "1A x" });
      expect(chordMatch.compareDocumentPosition(nextMatch)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    test("clears search on escape", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      const el = screen.getByRole("searchbox");
      await user.type(el, "something");
      expect(el).toHaveValue("something");
      await user.type(el, "{escape}");
      expect(el).toHaveValue("");
    });

    test("moves focus down", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      const { container } = render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a{down}");
      expect(screen.getByRole("button", { name: "2A" })).toHaveClass("focused");
      expect(container.querySelectorAll(".focused")).toHaveLength(1);
    });

    test("moves focus up", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      const { container } = render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a{down}{down}{up}");
      expect(screen.getByRole("button", { name: "2A" })).toHaveClass("focused");
      expect(container.querySelectorAll(".focused")).toHaveLength(1);
    });

    test("doesn't move focus before the first item", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      const { container } = render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a{up}");
      expect(screen.getByRole("button", { name: "1A" })).toHaveClass("focused");
      expect(container.querySelectorAll(".focused")).toHaveLength(1);
    });

    test("doesn't move focus past the last item", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      const { container } = render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a{down}{down}{down}");
      expect(screen.getByRole("button", { name: "3A" })).toHaveClass("focused");
      expect(container.querySelectorAll(".focused")).toHaveLength(1);
    });

    test("starts focus at the first item", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      const { container } = render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      expect(screen.getByRole("button", { name: "1A" })).toHaveClass("focused");
      expect(container.querySelectorAll(".focused")).toHaveLength(1);
    });

    test("finds commands by name", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "1A");
      expect(screen.getByRole("button", { name: "1A" })).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("finds commands by group name", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({
            id: "1",
            name: "1A",
            groupName: "GX",
            action: vi.fn(),
          });
          registerCommand({
            id: "2",
            name: "2A",
            groupName: "GY",
            action: vi.fn(),
          });
          registerCommand({
            id: "3",
            name: "3A",
            groupName: "GZ",
            action: vi.fn(),
          });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "GX");
      expect(
        screen.getByRole("button", { name: "GX › 1A" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("finds commands by alias", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({
            id: "1",
            name: "1A",
            alias: ["AX"],
            action: vi.fn(),
          });
          registerCommand({
            id: "2",
            name: "2A",
            alias: ["AY"],
            action: vi.fn(),
          });
          registerCommand({
            id: "3",
            name: "3A",
            alias: ["AZ"],
            action: vi.fn(),
          });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "AX");
      expect(screen.getByRole("button", { name: "1A" })).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("narrows selection with additional search terms", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A One", action: vi.fn() });
          registerCommand({ id: "2", name: "1A Two", action: vi.fn() });
          registerCommand({ id: "3", name: "1A Three", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "1 tw");
      expect(
        screen.getByRole("button", { name: "1A Two" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("searches case-insensitive", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "1a");
      expect(screen.getByRole("button", { name: "1A" })).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    test("ranks results by weight", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn(), weight: 20 });
          registerCommand({ id: "3", name: "3A", action: vi.fn(), weight: 10 });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "a");
      const els = screen.getAllByRole("button");
      expect(els[0]).toHaveTextContent("2A");
      expect(els[1]).toHaveTextContent("3A");
      expect(els[2]).toHaveTextContent("1A");
    });

    test("shows the default empty state when no result is found", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.type(screen.getByRole("searchbox"), "foo");
      expect(screen.queryAllByRole("button")).toHaveLength(0);
      expect(
        screen.getByText("Sorry, couldn't find anything.")
      ).toBeInTheDocument();
    });

    test("shows a custom empty state when no result is found", async () => {
      const component = defineComponent({
        components: { CommandBar },
        template: `
            <CommandBar v-bind="commandBarProps">
              <span />
              <template #empty>
                <p>Custom empty state</p>
              </template>
            </CommandBar>
          `,
      });

      render(component);

      await user.type(screen.getByRole("searchbox"), "foo");
      expect(screen.getByText("Custom empty state")).toBeInTheDocument();
    });

    test("doesn't show the empty state if search is empty", async () => {
      const example = defineComponent({
        template: `<span />`,
        setup() {
          const { registerCommand } = useCommandBar();
          registerCommand({ id: "1", name: "1A", action: vi.fn() });
          registerCommand({ id: "2", name: "2A", action: vi.fn() });
          registerCommand({ id: "3", name: "3A", action: vi.fn() });
        },
      });

      render(withCommandBar(example));

      await user.clear(screen.getByRole("searchbox"));
      expect(screen.queryAllByRole("button")).toHaveLength(0);
      expect(
        screen.queryByText("Sorry, couldn't find anything.")
      ).not.toBeInTheDocument();
    });
  });
});
