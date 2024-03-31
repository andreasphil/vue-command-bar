import { defineComponent as A, ref as u, watch as G, onMounted as b, onBeforeUnmount as S, computed as D, provide as H, openBlock as c, createElementBlock as p, Fragment as E, renderSlot as R, createElementVNode as n, normalizeClass as r, withKeys as k, withModifiers as C, withDirectives as I, vModelText as J, renderList as Q, createBlock as W, resolveDynamicComponent as X, createCommentVNode as w, toDisplayString as j, inject as Y, nextTick as Z } from "vue";
const x = /* @__PURE__ */ n("span", { "data-hidden": "" }, "Search pages and actions", -1), ee = ["placeholder"], te = ["onClick"], oe = ["title"], ne = {
  key: 0,
  "data-when": "empty"
}, se = /* @__PURE__ */ n("p", null, "☹️", -1), le = /* @__PURE__ */ n("p", null, "Sorry, couldn't find anything.", -1), F = Symbol();
function ge() {
  return Y(F, {
    registerCommand(...d) {
      return () => {
      };
    },
    removeCommand(...d) {
    },
    open() {
    }
  });
}
const ae = /* @__PURE__ */ A({
  __name: "CommandBar",
  props: {
    hotkey: { default: () => ({ key: "k", metaKey: !0 }) },
    limitResults: { default: 10 },
    placeholder: { default: "Search..." },
    allowEscape: { type: Boolean, default: !0 },
    allowRepeat: { type: Boolean, default: !0 }
  },
  setup(d) {
    const y = d, i = u(null), h = u(null), m = u(!1);
    G(m, (e, t) => {
      var o, s;
      e !== t && (e ? (o = i.value) == null || o.showModal() : (s = i.value) == null || s.close());
    });
    async function _(e = !m.value) {
      var t;
      m.value = e, e ? (await Z(), (t = h.value) == null || t.focus()) : (l.value = "", a.value = 0);
    }
    function K() {
      l.value ? (l.value = "", a.value = 0) : _(!1);
    }
    function L(e) {
      Object.entries(y.hotkey).reduce((o, [s, g]) => o && e[s] === g, !0) && (_(), e.preventDefault(), e.stopPropagation());
    }
    b(() => {
      addEventListener("keydown", L);
    }), S(() => {
      removeEventListener("keydown", L);
    });
    const f = u([]), T = D(
      () => f.value.filter((e) => !!e.chord).reduce(
        (e, t) => e.set(t.chord, t),
        /* @__PURE__ */ new Map()
      )
    );
    function O(...e) {
      const t = e.map((o) => o.id);
      return $(...t), f.value = [...f.value, ...e], () => {
        $(...t);
      };
    }
    function $(...e) {
      f.value = f.value.filter((t) => !e.includes(t.id)), v.value && e.includes(v.value.id) && (v.value = null);
    }
    function M(e) {
      e.action(), v.value = e, _(!1);
    }
    const v = u(null);
    function U() {
      v.value && M(v.value);
    }
    function N(e) {
      e.metaKey && e.key === "." && (e.preventDefault(), e.stopPropagation(), U());
    }
    b(() => {
      addEventListener("keydown", N);
    }), S(() => {
      removeEventListener("keydown", N);
    });
    const l = u(""), a = u(0), B = D(() => {
      if (!l.value)
        return [];
      const e = l.value.toLowerCase().split(" "), t = f.value.filter((s) => {
        const g = [s.name, ...s.alias ?? [], s.groupName ?? ""].join(" ").toLowerCase();
        return e.every((z) => g.includes(z));
      }).slice(0, y.limitResults), o = T.value.get(l.value);
      return o && t.unshift({ ...o, chordMatch: !0 }), t;
    });
    function V() {
      const e = a.value + 1;
      a.value = Math.min(B.value.length - 1, e);
    }
    function q() {
      a.value = Math.max(a.value - 1, 0);
    }
    function P() {
      const e = B.value[a.value];
      e && M(e);
    }
    return H(F, {
      registerCommand: O,
      removeCommand: $,
      open: () => _(!0)
    }), (e, t) => (c(), p(E, null, [
      R(e.$slots, "default"),
      n("dialog", {
        class: r(e.$style.commandBar),
        onClose: t[1] || (t[1] = (o) => m.value = !1),
        onKeydown: [
          t[2] || (t[2] = k(C((o) => V(), ["stop", "prevent"]), ["down"])),
          t[3] || (t[3] = k(C((o) => P(), ["stop", "prevent"]), ["enter"])),
          t[4] || (t[4] = k(C((o) => K(), ["stop", "prevent"]), ["escape"])),
          t[5] || (t[5] = k(C((o) => q(), ["stop", "prevent"]), ["up"]))
        ],
        ref_key: "dialogEl",
        ref: i
      }, [
        n("header", {
          class: r(e.$style.header)
        }, [
          n("label", null, [
            x,
            I(n("input", {
              placeholder: e.placeholder,
              ref_key: "searchEl",
              ref: h,
              type: "search",
              "onUpdate:modelValue": t[0] || (t[0] = (o) => l.value = o)
            }, null, 8, ee), [
              [J, l.value]
            ])
          ])
        ], 2),
        n("div", {
          class: r(e.$style.body),
          "data-with-fallback": ""
        }, [
          n("ul", {
            class: r(e.$style.resultsList)
          }, [
            (c(!0), p(E, null, Q(B.value, (o, s) => (c(), p("li", {
              key: o.id
            }, [
              n("button", {
                class: r({
                  [e.$style.result]: !0,
                  [e.$style.focused]: s === a.value,
                  [e.$style.chordMatch]: o.chordMatch
                }),
                onClick: (g) => M(o)
              }, [
                o.icon ? (c(), W(X(o.icon), { key: 0 })) : w("", !0),
                o.groupName ? (c(), p(E, { key: 1 }, [
                  n("span", {
                    class: r(e.$style.groupName)
                  }, j(o.groupName), 3),
                  n("span", {
                    class: r(e.$style.groupName)
                  }, "›", 2)
                ], 64)) : w("", !0),
                n("span", {
                  "data-clamp": "",
                  title: o.name
                }, j(o.name), 9, oe),
                o.chord ? (c(), p("span", {
                  key: 2,
                  class: r(e.$style.chord)
                }, j(o.chord), 3)) : w("", !0)
              ], 10, te)
            ]))), 128))
          ], 2),
          l.value ? (c(), p("div", ne, [
            R(e.$slots, "empty", {}, () => [
              se,
              le
            ])
          ])) : w("", !0)
        ], 2)
      ], 34)
    ], 64));
  }
}), re = "_commandBar_cfej6_6", ue = "_body_cfej6_11", ce = "_resultsList_cfej6_20", de = "_result_cfej6_20", ie = "_focused_cfej6_44", me = "_chordMatch_cfej6_48", fe = "_groupName_cfej6_56", ve = "_chord_cfej6_48", pe = {
  commandBar: re,
  body: ue,
  resultsList: ce,
  result: de,
  focused: ie,
  chordMatch: me,
  groupName: fe,
  chord: ve
}, ye = (d, y) => {
  const i = d.__vccOpts || d;
  for (const [h, m] of y)
    i[h] = m;
  return i;
}, he = {
  $style: pe
}, ke = /* @__PURE__ */ ye(ae, [["__cssModules", he]]);
export {
  F as CommandBarContext,
  ke as default,
  ge as useCommandBar
};
