import { defineComponent as Q, ref as d, watch as W, onMounted as N, onBeforeUnmount as S, computed as D, provide as A, openBlock as c, createElementBlock as y, Fragment as L, renderSlot as R, createElementVNode as l, withKeys as _, withModifiers as g, normalizeClass as i, toDisplayString as C, withDirectives as G, vModelText as I, renderList as J, createBlock as X, resolveDynamicComponent as Y, createCommentVNode as $, inject as Z } from "vue";
const x = { "data-hidden": "" }, ee = ["placeholder"], te = ["onClick", "onKeydown"], oe = ["title"], ne = {
  key: 0,
  "data-when": "empty"
}, le = /* @__PURE__ */ l("p", null, "☹️", -1), se = /* @__PURE__ */ l("p", null, "Sorry, couldn't find anything.", -1), F = Symbol();
function ge() {
  return Z(F, {
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
const ae = /* @__PURE__ */ Q({
  __name: "CommandBar",
  props: {
    allowEscape: { type: Boolean, default: !0 },
    allowRepeat: { type: Boolean, default: !0 },
    hotkey: { default: () => ({ key: "k", metaKey: !0 }) },
    limitResults: { default: 10 },
    placeholder: { default: "Search..." }
  },
  setup(r) {
    const h = r, m = d(null), M = d(null), p = d(!1);
    W(p, (e, o) => {
      var t, n;
      e !== o && (e ? (t = m.value) == null || t.showModal() : (n = m.value) == null || n.close());
    });
    async function k(e = !p.value) {
      p.value = e, e || (s.value = "", a.value = 0);
    }
    function O() {
      s.value ? (s.value = "", a.value = 0) : h.allowEscape && k(!1);
    }
    function b(e) {
      const o = Object.assign(
        { altKey: !1, ctrlKey: !1, metaKey: !1, shiftKey: !1, key: "" },
        h.hotkey
      );
      Object.entries(o).reduce((n, [u, B]) => n && e[u] === B, !0) && (k(), e.preventDefault(), e.stopPropagation());
    }
    N(() => {
      addEventListener("keydown", b);
    }), S(() => {
      removeEventListener("keydown", b);
    });
    const v = d([]), T = D(
      () => v.value.filter((e) => !!e.chord).reduce(
        (e, o) => e.set(o.chord, o),
        /* @__PURE__ */ new Map()
      )
    );
    function U(...e) {
      const o = e.map((t) => t.id);
      return E(...o), v.value = [...v.value, ...e], () => {
        E(...o);
      };
    }
    function E(...e) {
      v.value = v.value.filter((o) => !e.includes(o.id)), f.value && e.includes(f.value.id) && (f.value = null);
    }
    function w(e) {
      e.action(), f.value = e, k(!1);
    }
    const f = d(null);
    function V() {
      f.value && w(f.value);
    }
    function K(e) {
      e.metaKey && e.key === "." && (e.preventDefault(), e.stopPropagation(), V());
    }
    N(() => {
      addEventListener("keydown", K);
    }), S(() => {
      removeEventListener("keydown", K);
    });
    const s = d(""), a = d(0), j = D(() => {
      if (!s.value) return [];
      const e = T.value.get(s.value), o = s.value.toLowerCase().split(" "), t = v.value.filter((n) => {
        if (e && e.id === n.id) return !1;
        const u = [n.name, ...n.alias ?? [], n.groupName ?? ""].join(" ").toLowerCase();
        return o.every((B) => u.includes(B));
      }).slice(0, h.limitResults).sort((n, u) => (u.weight ?? 0) - (n.weight ?? 0));
      return e && t.unshift({ ...e, chordMatch: !0 }), t;
    });
    function q() {
      const e = a.value + 1;
      a.value = Math.min(j.value.length - 1, e);
    }
    function P() {
      a.value = Math.max(a.value - 1, 0);
    }
    function z() {
      const e = j.value[a.value];
      e && w(e);
    }
    function H(e = "") {
      s.value = e, k(!0);
    }
    return A(F, {
      registerCommand: U,
      removeCommand: E,
      open: H
    }), (e, o) => (c(), y(L, null, [
      R(e.$slots, "default"),
      l("dialog", {
        onClose: o[1] || (o[1] = (t) => p.value = !1),
        onKeydown: [
          o[2] || (o[2] = _(g((t) => q(), ["stop", "prevent"]), ["down"])),
          o[3] || (o[3] = _(g((t) => z(), ["stop", "prevent"]), ["enter"])),
          o[4] || (o[4] = _(g((t) => O(), ["stop", "prevent"]), ["escape"])),
          o[5] || (o[5] = _(g((t) => P(), ["stop", "prevent"]), ["up"]))
        ],
        ref_key: "dialogEl",
        ref: m
      }, [
        l("header", {
          class: i(e.$style.header)
        }, [
          l("label", null, [
            l("span", x, C(e.placeholder), 1),
            G(l("input", {
              placeholder: e.placeholder,
              autofocus: "",
              ref_key: "searchEl",
              ref: M,
              type: "search",
              "onUpdate:modelValue": o[0] || (o[0] = (t) => s.value = t)
            }, null, 8, ee), [
              [I, s.value]
            ])
          ])
        ], 2),
        l("div", {
          class: i(e.$style.body),
          "data-with-fallback": ""
        }, [
          l("ul", {
            class: i(e.$style.resultsList)
          }, [
            (c(!0), y(L, null, J(j.value, (t, n) => (c(), y("li", {
              key: t.id
            }, [
              l("button", {
                class: i({
                  [e.$style.result]: !0,
                  [e.$style.focused]: n === a.value,
                  [e.$style.chordMatch]: t.chordMatch
                }),
                onClick: (u) => w(t),
                onKeydown: _(g((u) => w(t), ["stop", "prevent"]), ["enter"])
              }, [
                t.icon ? (c(), X(Y(t.icon), { key: 0 })) : $("", !0),
                t.groupName ? (c(), y(L, { key: 1 }, [
                  l("span", {
                    class: i(e.$style.groupName)
                  }, C(t.groupName), 3),
                  l("span", {
                    class: i(e.$style.groupName)
                  }, "›", 2)
                ], 64)) : $("", !0),
                l("span", {
                  "data-clamp": "",
                  title: t.name
                }, C(t.name), 9, oe),
                t.chord ? (c(), y("span", {
                  key: 2,
                  class: i(e.$style.chord)
                }, C(t.chord), 3)) : $("", !0)
              ], 42, te)
            ]))), 128))
          ], 2),
          s.value ? (c(), y("div", ne, [
            R(e.$slots, "empty", {}, () => [
              le,
              se
            ])
          ])) : $("", !0)
        ], 2)
      ], 544)
    ], 64));
  }
}), re = "_header_1tjcl_6", ue = "_body_1tjcl_11", de = "_resultsList_1tjcl_20", ce = "_result_1tjcl_20", ie = "_focused_1tjcl_44", me = "_chordMatch_1tjcl_48", pe = "_groupName_1tjcl_56", ve = "_chord_1tjcl_48", fe = {
  header: re,
  body: ue,
  resultsList: de,
  result: ce,
  focused: ie,
  chordMatch: me,
  groupName: pe,
  chord: ve
}, ye = (r, h) => {
  const m = r.__vccOpts || r;
  for (const [M, p] of h)
    m[M] = p;
  return m;
}, he = {
  $style: fe
}, ke = /* @__PURE__ */ ye(ae, [["__cssModules", he]]);
export {
  F as CommandBarContext,
  ke as default,
  ge as useCommandBar
};
