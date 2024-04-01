import { defineComponent as A, ref as r, watch as G, onMounted as S, onBeforeUnmount as D, computed as R, provide as H, openBlock as d, createElementBlock as v, Fragment as L, renderSlot as F, createElementVNode as n, normalizeClass as u, withKeys as g, withModifiers as k, toDisplayString as C, withDirectives as I, vModelText as J, renderList as Q, createBlock as W, resolveDynamicComponent as X, createCommentVNode as w, inject as Y } from "vue";
const Z = { "data-hidden": "" }, x = ["placeholder"], ee = ["onClick"], te = ["title"], oe = {
  key: 0,
  "data-when": "empty"
}, ne = /* @__PURE__ */ n("p", null, "☹️", -1), se = /* @__PURE__ */ n("p", null, "Sorry, couldn't find anything.", -1), K = Symbol();
function _e() {
  return Y(K, {
    registerCommand(...c) {
      return () => {
      };
    },
    removeCommand(...c) {
    },
    open() {
    }
  });
}
const le = /* @__PURE__ */ A({
  __name: "CommandBar",
  props: {
    allowEscape: { type: Boolean, default: !0 },
    allowRepeat: { type: Boolean, default: !0 },
    hotkey: { default: () => ({ key: "k", metaKey: !0 }) },
    limitResults: { default: 10 },
    placeholder: { default: "Search..." }
  },
  setup(c) {
    const y = c, i = r(null), $ = r(null), m = r(!1);
    G(m, (e, o) => {
      var t, s;
      e !== o && (e ? (t = i.value) == null || t.showModal() : (s = i.value) == null || s.close());
    });
    async function h(e = !m.value) {
      m.value = e, e || (l.value = "", a.value = 0);
    }
    function j() {
      l.value ? (l.value = "", a.value = 0) : y.allowEscape && h(!1);
    }
    function N(e) {
      Object.entries(y.hotkey).reduce((t, [s, _]) => t && e[s] === _, !0) && (h(), e.preventDefault(), e.stopPropagation());
    }
    S(() => {
      addEventListener("keydown", N);
    }), D(() => {
      removeEventListener("keydown", N);
    });
    const f = r([]), O = R(
      () => f.value.filter((e) => !!e.chord).reduce(
        (e, o) => e.set(o.chord, o),
        /* @__PURE__ */ new Map()
      )
    );
    function T(...e) {
      const o = e.map((t) => t.id);
      return M(...o), f.value = [...f.value, ...e], () => {
        M(...o);
      };
    }
    function M(...e) {
      f.value = f.value.filter((o) => !e.includes(o.id)), p.value && e.includes(p.value.id) && (p.value = null);
    }
    function B(e) {
      e.action(), p.value = e, h(!1);
    }
    const p = r(null);
    function U() {
      p.value && B(p.value);
    }
    function b(e) {
      e.metaKey && e.key === "." && (e.preventDefault(), e.stopPropagation(), U());
    }
    S(() => {
      addEventListener("keydown", b);
    }), D(() => {
      removeEventListener("keydown", b);
    });
    const l = r(""), a = r(0), E = R(() => {
      if (!l.value)
        return [];
      const e = l.value.toLowerCase().split(" "), o = f.value.filter((s) => {
        const _ = [s.name, ...s.alias ?? [], s.groupName ?? ""].join(" ").toLowerCase();
        return e.every((z) => _.includes(z));
      }).slice(0, y.limitResults), t = O.value.get(l.value);
      return t && o.unshift({ ...t, chordMatch: !0 }), o;
    });
    function V() {
      const e = a.value + 1;
      a.value = Math.min(E.value.length - 1, e);
    }
    function q() {
      a.value = Math.max(a.value - 1, 0);
    }
    function P() {
      const e = E.value[a.value];
      e && B(e);
    }
    return H(K, {
      registerCommand: T,
      removeCommand: M,
      open: () => h(!0)
    }), (e, o) => (d(), v(L, null, [
      F(e.$slots, "default"),
      n("dialog", {
        class: u(e.$style.commandBar),
        onClose: o[1] || (o[1] = (t) => m.value = !1),
        onKeydown: [
          o[2] || (o[2] = g(k((t) => V(), ["stop", "prevent"]), ["down"])),
          o[3] || (o[3] = g(k((t) => P(), ["stop", "prevent"]), ["enter"])),
          o[4] || (o[4] = g(k((t) => j(), ["stop", "prevent"]), ["escape"])),
          o[5] || (o[5] = g(k((t) => q(), ["stop", "prevent"]), ["up"]))
        ],
        ref_key: "dialogEl",
        ref: i
      }, [
        n("header", {
          class: u(e.$style.header)
        }, [
          n("label", null, [
            n("span", Z, C(e.placeholder), 1),
            I(n("input", {
              placeholder: e.placeholder,
              autofocus: "",
              ref_key: "searchEl",
              ref: $,
              type: "search",
              "onUpdate:modelValue": o[0] || (o[0] = (t) => l.value = t)
            }, null, 8, x), [
              [J, l.value]
            ])
          ])
        ], 2),
        n("div", {
          class: u(e.$style.body),
          "data-with-fallback": ""
        }, [
          n("ul", {
            class: u(e.$style.resultsList)
          }, [
            (d(!0), v(L, null, Q(E.value, (t, s) => (d(), v("li", {
              key: t.id
            }, [
              n("button", {
                class: u({
                  [e.$style.result]: !0,
                  [e.$style.focused]: s === a.value,
                  [e.$style.chordMatch]: t.chordMatch
                }),
                onClick: (_) => B(t)
              }, [
                t.icon ? (d(), W(X(t.icon), { key: 0 })) : w("", !0),
                t.groupName ? (d(), v(L, { key: 1 }, [
                  n("span", {
                    class: u(e.$style.groupName)
                  }, C(t.groupName), 3),
                  n("span", {
                    class: u(e.$style.groupName)
                  }, "›", 2)
                ], 64)) : w("", !0),
                n("span", {
                  "data-clamp": "",
                  title: t.name
                }, C(t.name), 9, te),
                t.chord ? (d(), v("span", {
                  key: 2,
                  class: u(e.$style.chord)
                }, C(t.chord), 3)) : w("", !0)
              ], 10, ee)
            ]))), 128))
          ], 2),
          l.value ? (d(), v("div", oe, [
            F(e.$slots, "empty", {}, () => [
              ne,
              se
            ])
          ])) : w("", !0)
        ], 2)
      ], 34)
    ], 64));
  }
}), ae = "_commandBar_f90uu_6", ue = "_body_f90uu_11", re = "_resultsList_f90uu_20", de = "_result_f90uu_20", ce = "_focused_f90uu_44", ie = "_chordMatch_f90uu_48", me = "_groupName_f90uu_56", fe = "_chord_f90uu_48", pe = {
  commandBar: ae,
  body: ue,
  resultsList: re,
  result: de,
  focused: ce,
  chordMatch: ie,
  groupName: me,
  chord: fe
}, ve = (c, y) => {
  const i = c.__vccOpts || c;
  for (const [$, m] of y)
    i[$] = m;
  return i;
}, ye = {
  $style: pe
}, ge = /* @__PURE__ */ ve(le, [["__cssModules", ye]]);
export {
  K as CommandBarContext,
  ge as default,
  _e as useCommandBar
};
