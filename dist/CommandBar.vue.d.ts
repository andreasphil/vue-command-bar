import { type Component } from "vue";
import { InjectionKey } from "vue";
export type KeyboardShortcut = Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">>;
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
export declare const CommandBarContext: InjectionKey<{
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
    open: () => void;
}>;
/**
 * Returns access to the context of the command bar, which allows you to
 * register or remove commands, and other stuff. For this to work, it needs
 * to be called inside a descendant component of the CommandBar. When called
 * outside of that, the function will still return all the expected values,
 * but they won't do anything.
 */
export declare function useCommandBar(): {
    registerCommand(..._: Command[]): () => void;
    removeCommand(..._: string[]): void;
    open(): void;
};
declare const _default: __VLS_WithTemplateSlots<import("vue").DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    hotkey?: Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">> | undefined;
    limitResults?: number | undefined;
    placeholder?: string | undefined;
    allowEscape?: boolean | undefined;
    allowRepeat?: boolean | undefined;
}>, {
    hotkey: () => {
        key: string;
        metaKey: boolean;
    };
    limitResults: number;
    placeholder: string;
    allowEscape: boolean;
    allowRepeat: boolean;
}>, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    hotkey?: Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">> | undefined;
    limitResults?: number | undefined;
    placeholder?: string | undefined;
    allowEscape?: boolean | undefined;
    allowRepeat?: boolean | undefined;
}>, {
    hotkey: () => {
        key: string;
        metaKey: boolean;
    };
    limitResults: number;
    placeholder: string;
    allowEscape: boolean;
    allowRepeat: boolean;
}>>>, {
    hotkey: KeyboardShortcut;
    limitResults: number;
    placeholder: string;
    allowEscape: boolean;
    allowRepeat: boolean;
}, {}>, {
    default?(_: {}): any;
    empty?(_: {}): any;
}>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
