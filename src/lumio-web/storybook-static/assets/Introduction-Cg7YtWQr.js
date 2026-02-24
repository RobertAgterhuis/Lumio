import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as r}from"./index-FZkeZIx-.js";import{M as o}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function i(s){const e={a:"a",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(o,{title:"Foundations/Introduction"}),`
`,n.jsx(e.h1,{id:"design-foundations",children:"Design Foundations"}),`
`,n.jsx(e.p,{children:"The Lumio design system is built on a layered token architecture. These foundations ensure visual consistency, accessibility, and maintainability across the application."}),`
`,n.jsx(e.h2,{id:"token-architecture",children:"Token Architecture"}),`
`,n.jsx(e.p,{children:"Tokens are organized in layers, from primitive values to application-specific semantics:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{children:`┌─────────────────────────────────────────────────────────┐
│  Layer 9: Accessibility Tokens                          │
│  (focus rings, disabled states, touch targets)          │
├─────────────────────────────────────────────────────────┤
│  Layer 8: State Tokens                                  │
│  (success/warning/danger/info bg/border/text triplets)  │
├─────────────────────────────────────────────────────────┤
│  Layer 7: Border Width                                  │
├─────────────────────────────────────────────────────────┤
│  Layer 6: Z-Index                                       │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Typography                                    │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Motion                                        │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Shadows                                       │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Spacing                                       │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Base Colors                                   │
│  (primary, sage, secure, semantic, neutral)             │
└─────────────────────────────────────────────────────────┘
`})}),`
`,n.jsx(e.h2,{id:"source-files",children:"Source Files"}),`
`,n.jsxs(e.p,{children:[`| File | Purpose |
|------|---------|
| `,n.jsx(e.code,{children:"src/styles/tokens.css"}),` | CSS custom properties (source of truth) |
| `,n.jsx(e.code,{children:"src/app/globals.css"})," | Tailwind @theme mappings |"]}),`
`,n.jsx(e.h2,{id:"how-tokens-flow",children:"How Tokens Flow"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Define"})," tokens in ",n.jsx(e.code,{children:"tokens.css"})," as CSS custom properties"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Map"})," tokens to Tailwind via ",n.jsx(e.code,{children:"@theme"})," in ",n.jsx(e.code,{children:"globals.css"})]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Use"})," Tailwind utility classes in components"]}),`
`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`// ❌ Don't use raw values
<div className="p-[24px] text-[#2C4A52]">

// ✅ Do use token-backed utilities
<div className="p-6 text-primary">
`})}),`
`,n.jsx(e.h2,{id:"dark-mode",children:"Dark Mode"}),`
`,n.jsxs(e.p,{children:["Dark mode is handled automatically via the ",n.jsx(e.code,{children:".dark"})," class on ",n.jsx(e.code,{children:"<html>"}),". Token overrides in ",n.jsx(e.code,{children:"tokens.css"})," ensure all components adapt correctly:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-css",children:`/* Light mode */
:root {
  --base-primary-700: #2C4A52;
}

/* Dark mode override */
.dark {
  --base-primary-700: #7AB5C0;
}
`})}),`
`,n.jsx(e.h2,{id:"grote-tekst-accessibility",children:"Grote Tekst (Accessibility)"}),`
`,n.jsxs(e.p,{children:["The ",n.jsx(e.code,{children:".grote-tekst"})," class scales typography tokens for users who need larger text. This is toggled via user preferences in the application settings."]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"foundation-sections",children:"Foundation Sections"}),`
`,n.jsx(e.p,{children:"Explore each foundation area:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-colors--docs",children:"Colors"})})," — Color palettes and semantic meanings"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-typography--docs",children:"Typography"})})," — Font sizes, weights, line heights"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-spacing--docs",children:"Spacing"})})," — 8-point grid spacing scale"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-motion--docs",children:"Motion"})})," — Animation durations and easing"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-z-index--docs",children:"Z-Index"})})," — Layering scale for overlays"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:n.jsx(e.a,{href:"/docs/foundations-borders--docs",children:"Borders"})})," — Border width tokens"]}),`
`]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"enforced-in-ci",children:"Enforced in CI"}),`
`,n.jsx(e.p,{children:"The design system is enforced through:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsxs(e.strong,{children:["ESLint ",n.jsx(e.code,{children:"no-raw-colors"})," rule"]})," — Prevents hardcoded hex values"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"TypeScript"})," — Component prop types ensure correct usage"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Storybook"})," — Visual documentation and interaction tests"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Token validation"})," — CI script checks token consistency"]}),`
`]})]})}function h(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(i,{...s})}):i(s)}export{h as default};
