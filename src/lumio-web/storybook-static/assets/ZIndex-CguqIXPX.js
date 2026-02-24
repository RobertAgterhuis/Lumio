import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as o}from"./index-FZkeZIx-.js";import{M as i}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function d(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(i,{title:"Foundations/Z-Index"}),`
`,e.jsx(n.h1,{id:"z-index",children:"Z-Index"}),`
`,e.jsx(n.p,{children:"The z-index scale ensures predictable layering of overlapping elements. Always use token values — never arbitrary numbers."}),`
`,e.jsx(n.h2,{id:"z-index-scale",children:"Z-Index Scale"}),`
`,e.jsxs(n.p,{children:[`| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| `,e.jsx(n.code,{children:"--z-base"})," | 0 | ",e.jsx(n.code,{children:"z-0"}),` | Default layer, page content |
| `,e.jsx(n.code,{children:"--z-dropdown"})," | 50 | ",e.jsx(n.code,{children:"z-50"}),` | Dropdowns, popovers, autocomplete |
| `,e.jsx(n.code,{children:"--z-sticky"})," | 100 | ",e.jsx(n.code,{children:"z-sticky"}),` | Sticky headers, floating toolbars |
| `,e.jsx(n.code,{children:"--z-modal"})," | 200 | ",e.jsx(n.code,{children:"z-modal"}),` | Modal dialogs, full-screen overlays |
| `,e.jsx(n.code,{children:"--z-toast"})," | 300 | ",e.jsx(n.code,{children:"z-toast"}),` | Toast notifications |
| `,e.jsx(n.code,{children:"--z-tooltip"})," | 400 | ",e.jsx(n.code,{children:"z-tooltip"}),` | Tooltips, help popovers |
| `,e.jsx(n.code,{children:"--z-max"})," | 9999 | ",e.jsx(n.code,{children:"z-max"})," | Critical overlays (loading screens) |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"visual-stacking",children:"Visual Stacking"}),`
`,e.jsxs("div",{className:"relative h-64 mt-8 border rounded-lg overflow-hidden bg-muted/50",children:[e.jsx("div",{className:"absolute inset-x-4 top-4 h-12 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center px-4 text-sm",children:e.jsx(n.p,{children:"z-base (0) — Page content"})}),e.jsx("div",{className:"absolute inset-x-8 top-16 h-12 bg-primary/20 border border-primary rounded flex items-center px-4 text-sm",style:{zIndex:50},children:e.jsx(n.p,{children:"z-dropdown (50) — Menus"})}),e.jsx("div",{className:"absolute inset-x-12 top-28 h-12 bg-secondary rounded flex items-center px-4 text-sm",style:{zIndex:100},children:e.jsx(n.p,{children:"z-sticky (100) — Headers"})}),e.jsx("div",{className:"absolute inset-x-16 top-40 h-12 bg-card border shadow-lg rounded flex items-center px-4 text-sm",style:{zIndex:200},children:e.jsx(n.p,{children:"z-modal (200) — Dialogs"})})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"component-defaults",children:"Component Defaults"}),`
`,e.jsx(n.p,{children:"The design system components use these z-index values by default:"}),`
`,e.jsxs(n.p,{children:[`| Component | Z-Index | Token |
|-----------|---------|-------|
| `,e.jsx(n.code,{children:"Dialog"})," overlay | 50 | ",e.jsx(n.code,{children:"z-50"}),` |
| `,e.jsx(n.code,{children:"Dialog"})," content | 50 | ",e.jsx(n.code,{children:"z-50"}),` |
| Sidebar (sticky) | 100 | `,e.jsx(n.code,{children:"z-sticky"}),` |
| Toast container | 300 | `,e.jsx(n.code,{children:"z-toast"}),` |
| `,e.jsx(n.code,{children:"HelpTooltip"})," | 400 | ",e.jsx(n.code,{children:"z-tooltip"})," |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"stacking-context-rules",children:"Stacking Context Rules"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Modal dialogs"})," create a new stacking context"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Toasts"})," always appear above modals"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tooltips"})," appear above everything except ",e.jsx(n.code,{children:"z-max"})]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["Never use ",e.jsx(n.code,{children:"z-max"})]})," unless absolutely necessary (e.g., global loading overlay)"]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Use the token scale: ",e.jsx(n.code,{children:"z-dropdown"}),", ",e.jsx(n.code,{children:"z-modal"}),", ",e.jsx(n.code,{children:"z-toast"}),", ",e.jsx(n.code,{children:"z-tooltip"})]}),`
`,e.jsx(n.li,{children:"Let components manage their own z-index"}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"z-sticky"})," for fixed/sticky positioned headers"]}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Don't use arbitrary z-index values like ",e.jsx(n.code,{children:"z-[999]"})]}),`
`,e.jsx(n.li,{children:"Don't fight z-index wars — if things overlap unexpectedly, check stacking contexts"}),`
`,e.jsxs(n.li,{children:["Don't put page content above ",e.jsx(n.code,{children:"z-base"})," unless it's truly overlapping"]}),`
`,e.jsxs(n.li,{children:["Don't use ",e.jsx(n.code,{children:"z-max"})," for modals — that's what ",e.jsx(n.code,{children:"z-modal"})," is for"]}),`
`]})]})}function x(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(d,{...s})}):d(s)}export{x as default};
