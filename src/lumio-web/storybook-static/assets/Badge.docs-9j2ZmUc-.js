import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as t}from"./index-FZkeZIx-.js";import{M as d,C as r,a as o}from"./blocks-BnPCfxAb.js";import{B as c,D as i,A as l}from"./Badge.stories-Df3i3Iey.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";function a(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...t(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(d,{of:c}),`
`,e.jsx(n.h1,{id:"badge",children:"Badge"}),`
`,e.jsx(n.p,{children:"Badges display short status indicators. Use them to show counts, labels, or states."}),`
`,e.jsx(r,{of:i}),`
`,e.jsx(o,{of:i}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"variants",children:"Variants"}),`
`,e.jsxs(n.p,{children:[`| Variant | Use Case |\r
|---------|----------|\r
| `,e.jsx(n.code,{children:"default"}),` | Primary badge |\r
| `,e.jsx(n.code,{children:"secondary"}),` | Neutral, less prominent |\r
| `,e.jsx(n.code,{children:"destructive"}),` | Error, critical |\r
| `,e.jsx(n.code,{children:"outline"}),` | Minimal, bordered only |\r
| `,e.jsx(n.code,{children:"success"}),` | Completed, active |\r
| `,e.jsx(n.code,{children:"warning"}),` | Attention needed |\r
| `,e.jsx(n.code,{children:"danger"}),` | Error state |\r
| `,e.jsx(n.code,{children:"info"}),` | Informational |\r
| `,e.jsx(n.code,{children:"security"})," | Security-related |"]}),`
`,e.jsx(r,{of:l}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"common-patterns",children:"Common Patterns"}),`
`,e.jsx(n.h3,{id:"status-indicators",children:"Status Indicators"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Badge variant="success">Actief</Badge>\r
<Badge variant="warning">In behandeling</Badge>\r
<Badge variant="danger">Mislukt</Badge>
`})}),`
`,e.jsx(n.h3,{id:"counts",children:"Counts"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Badge>3</Badge>\r
<Badge variant="secondary">99+</Badge>
`})}),`
`,e.jsx(n.h3,{id:"labels",children:"Labels"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Badge variant="outline">Concept</Badge>\r
<Badge variant="secondary">Nieuw</Badge>
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Keep badge text short (1-2 words)"}),`
`,e.jsx(n.li,{children:"Use semantic colors for statuses"}),`
`,e.jsx(n.li,{children:"Place badges near the item they describe"}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"outline"})," for subtle, non-urgent labels"]}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Don't put long sentences in badges"}),`
`,e.jsx(n.li,{children:"Don't use badges for navigation"}),`
`,e.jsx(n.li,{children:"Don't animate badges (except subtle count updates)"}),`
`,e.jsxs(n.li,{children:["Don't use ",e.jsx(n.code,{children:"destructive"})," for neutral negative states (use ",e.jsx(n.code,{children:"danger"}),")"]}),`
`]})]})}function B(s={}){const{wrapper:n}={...t(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(a,{...s})}):a(s)}export{B as default};
