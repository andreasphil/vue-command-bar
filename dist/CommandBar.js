import { defineComponent as W, ref as d, watch as A, onMounted as R, onBeforeUnmount as F, computed as O, provide as G, openBlock as i, createElementBlock as f, Fragment as b, renderSlot as T, createElementVNode as l, withKeys as h, withModifiers as g, normalizeClass as c, toDisplayString as $, withDirectives as I, vModelText as J, renderList as X, createBlock as Y, resolveDynamicComponent as Z, createCommentVNode as M, inject as x } from "vue";
const ee = { "data-hidden": "" }, te = ["placeholder"], oe = ["onClick", "onKeydown"], ne = ["title"], le = {
  key: 0,
  "data-when": "empty"
}, U = Symbol();
function ge() {
  return x(U, {
    registerCommand(...r) {
      return () => {
      };
    },
    removeCommand(...r) {
    },
    open(r) {
    }
  });
}
const se = /* @__PURE__ */ W({
  __name: "CommandBar",
  props: {
    allowEscape: { type: Boolean, default: !0 },
    allowRepeat: { type: Boolean, default: !0 },
    hotkey: { default: () => ({ key: "k", metaKey: !0 }) },
    limitResults: { default: 10 },
    placeholder: { default: "Search..." }
  },
  setup(r, { expose: E }) {
    const m = r, y = d(null), j = d(null), k = d(!1);
    A(k, (e, t) => {
      var o, n;
      e !== t && (e ? (o = y.value) == null || o.showModal() : (n = y.value) == null || n.close());
    });
    async function w(e = !k.value) {
      k.value = e, e || (s.value = "", a.value = 0);
    }
    function V() {
      s.value ? (s.value = "", a.value = 0) : m.allowEscape && w(!1);
    }
    function K(e) {
      const t = Object.assign(
        { altKey: !1, ctrlKey: !1, metaKey: !1, shiftKey: !1, key: "" },
        m.hotkey
      );
      Object.entries(t).reduce((n, [u, L]) => n && e[u] === L, !0) && (w(), e.preventDefault(), e.stopPropagation());
    }
    R(() => {
      addEventListener("keydown", K);
    }), F(() => {
      removeEventListener("keydown", K);
    });
    const p = d([]), q = O(
      () => p.value.filter((e) => !!e.chord).reduce(
        (e, t) => e.set(t.chord, t),
        /* @__PURE__ */ new Map()
      )
    );
    function N(...e) {
      const t = e.map((o) => o.id);
      return C(...t), p.value = [...p.value, ...e], () => {
        C(...t);
      };
    }
    function C(...e) {
      p.value = p.value.filter((t) => !e.includes(t.id)), v.value && e.includes(v.value.id) && (v.value = null);
    }
    function _(e) {
      e.action(), v.value = e, w(!1);
    }
    const v = d(null);
    function P() {
      v.value && _(v.value);
    }
    function S(e) {
      e.metaKey && e.key === "." && (e.preventDefault(), e.stopPropagation(), P());
    }
    R(() => {
      addEventListener("keydown", S);
    }), F(() => {
      removeEventListener("keydown", S);
    });
    const s = d(""), a = d(0), B = O(() => {
      if (!s.value) return [];
      const e = q.value.get(s.value), t = s.value.toLowerCase().split(" "), o = p.value.filter((n) => {
        if (e && e.id === n.id) return !1;
        const u = [n.name, ...n.alias ?? [], n.groupName ?? ""].join(" ").toLowerCase();
        return t.every((L) => u.includes(L));
      }).slice(0, m.limitResults).sort((n, u) => (u.weight ?? 0) - (n.weight ?? 0));
      return e && o.unshift({ ...e, chordMatch: !0 }), o;
    });
    function z() {
      const e = a.value + 1;
      a.value = Math.min(B.value.length - 1, e);
    }
    function H() {
      a.value = Math.max(a.value - 1, 0);
    }
    function Q() {
      const e = B.value[a.value];
      e && _(e);
    }
    function D(e = "") {
      s.value = e, w(!0);
    }
    return G(U, {
      registerCommand: N,
      removeCommand: C,
      open: D
    }), E({ registerCommand: N, removeCommand: C, open: D }), (e, t) => (i(), f(b, null, [
      T(e.$slots, "default"),
      l("dialog", {
        onClose: t[1] || (t[1] = (o) => k.value = !1),
        onKeydown: [
          t[2] || (t[2] = h(g((o) => z(), ["stop", "prevent"]), ["down"])),
          t[3] || (t[3] = h(g((o) => Q(), ["stop", "prevent"]), ["enter"])),
          t[4] || (t[4] = h(g((o) => V(), ["stop", "prevent"]), ["escape"])),
          t[5] || (t[5] = h(g((o) => H(), ["stop", "prevent"]), ["up"]))
        ],
        ref_key: "dialogEl",
        ref: y
      }, [
        l("header", {
          class: c(e.$style.header)
        }, [
          l("label", null, [
            l("span", ee, $(e.placeholder), 1),
            I(l("input", {
              placeholder: e.placeholder,
              autofocus: "",
              ref_key: "searchEl",
              ref: j,
              type: "search",
              "onUpdate:modelValue": t[0] || (t[0] = (o) => s.value = o)
            }, null, 8, te), [
              [J, s.value]
            ])
          ])
        ], 2),
        l("div", {
          class: c(e.$style.body),
          "data-with-fallback": ""
        }, [
          l("ul", {
            class: c(e.$style.resultsList)
          }, [
            (i(!0), f(b, null, X(B.value, (o, n) => (i(), f("li", {
              key: o.id
            }, [
              l("button", {
                class: c({
                  [e.$style.result]: !0,
                  [e.$style.focused]: n === a.value,
                  [e.$style.chordMatch]: o.chordMatch
                }),
                onClick: (u) => _(o),
                onKeydown: h(g((u) => _(o), ["stop", "prevent"]), ["enter"])
              }, [
                o.icon ? (i(), Y(Z(o.icon), { key: 0 })) : M("", !0),
                o.groupName ? (i(), f(b, { key: 1 }, [
                  l("span", {
                    class: c(e.$style.groupName)
                  }, $(o.groupName), 3),
                  l("span", {
                    class: c(e.$style.groupName)
                  }, "›", 2)
                ], 64)) : M("", !0),
                l("span", {
                  "data-clamp": "",
                  title: o.name
                }, $(o.name), 9, ne),
                o.chord ? (i(), f("span", {
                  key: 2,
                  class: c(e.$style.chord)
                }, $(o.chord), 3)) : M("", !0)
              ], 42, oe)
            ]))), 128))
          ], 2),
          s.value ? (i(), f("div", le, [
            T(e.$slots, "empty", {}, () => [
              t[6] || (t[6] = l("p", null, "☹️", -1)),
              t[7] || (t[7] = l("p", null, "Sorry, couldn't find anything.", -1))
            ])
          ])) : M("", !0)
        ], 2)
      ], 544)
    ], 64));
  }
}), ae = "_header_1tjcl_6", re = "_body_1tjcl_11", ue = "_resultsList_1tjcl_20", de = "_result_1tjcl_20", ie = "_focused_1tjcl_44", ce = "_chordMatch_1tjcl_48", me = "_groupName_1tjcl_56", pe = "_chord_1tjcl_48", ve = {
  header: ae,
  body: re,
  resultsList: ue,
  result: de,
  focused: ie,
  chordMatch: ce,
  groupName: me,
  chord: pe
}, fe = (r, E) => {
  const m = r.__vccOpts || r;
  for (const [y, j] of E)
    m[y] = j;
  return m;
}, ye = {
  $style: ve
}, ke = /* @__PURE__ */ fe(se, [["__cssModules", ye]]);
export {
  U as CommandBarContext,
  ke as default,
  ge as useCommandBar
};
