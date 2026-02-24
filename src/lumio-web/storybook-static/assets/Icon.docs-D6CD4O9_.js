import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as r}from"./index-FZkeZIx-.js";import{M as t,C as i,a as l}from"./blocks-BnPCfxAb.js";import{I as d,D as c,W as a,C as h}from"./Icon.stories-C2eWHvJS.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./createLucideIcon-B_yB00Wp.js";import"./triangle-alert-BVH98Qf5.js";import"./x-BO3TY1gv.js";function o(s){const e={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...s.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(t,{of:d}),`
`,n.jsx(e.h1,{id:"icon",children:"Icon"}),`
`,n.jsx(e.p,{children:"The Icon component wraps Lucide icons with consistent sizing and accessibility attributes."}),`
`,n.jsx(i,{of:c}),`
`,n.jsx(l,{of:c}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"sizes",children:"Sizes"}),`
`,n.jsxs(e.p,{children:[`| Size | Pixels | Use Case |
|------|--------|----------|
| `,n.jsx(e.code,{children:"sm"}),` | 16px | Inline with text, compact UI |
| `,n.jsx(e.code,{children:"md"}),` | 20px | Default, buttons, lists |
| `,n.jsx(e.code,{children:"lg"}),` | 24px | Headers, navigation |
| `,n.jsx(e.code,{children:"xl"})," | 32px | Hero sections, empty states |"]}),`
`,n.jsx(i,{of:void 0}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"accessibility",children:"Accessibility"}),`
`,n.jsx(e.h3,{id:"decorative-icons-default",children:"Decorative Icons (Default)"}),`
`,n.jsx(e.p,{children:"By default, icons are decorative and hidden from screen readers:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Icon icon={Mail} />
// Renders with aria-hidden="true"
`})}),`
`,n.jsx(e.h3,{id:"accessible-icons",children:"Accessible Icons"}),`
`,n.jsxs(e.p,{children:["Add a ",n.jsx(e.code,{children:"label"})," prop for icons that convey meaning:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Icon icon={AlertCircle} label="Warning" />
// Renders with role="img" and aria-label="Warning"
`})}),`
`,n.jsx(i,{of:a}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"with-colors",children:"With Colors"}),`
`,n.jsx(e.p,{children:"Icons inherit text color. Use Tailwind color classes:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Icon icon={Check} className="text-success" />
<Icon icon={X} className="text-danger" />
<Icon icon={AlertTriangle} className="text-warning" />
`})}),`
`,n.jsx(i,{of:void 0}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"common-icons",children:"Common Icons"}),`
`,n.jsxs(e.p,{children:["The design system uses ",n.jsx(e.a,{href:"https://lucide.dev/icons/",rel:"nofollow",children:"Lucide React"})," for icons."]}),`
`,n.jsx(i,{of:h}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"sm"})," (16px) for inline icons in text"]}),`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"md"})," (20px) for button icons"]}),`
`,n.jsxs(e.li,{children:["Add ",n.jsx(e.code,{children:"label"})," prop when the icon conveys meaning not present in adjacent text"]}),`
`,n.jsx(e.li,{children:"Keep icon color consistent with surrounding text"}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Don't use icons without accompanying text for critical actions"}),`
`,n.jsxs(e.li,{children:["Don't use ",n.jsx(e.code,{children:"label"})," for decorative icons — it adds unnecessary screen reader noise"]}),`
`,n.jsx(e.li,{children:"Don't mix icon libraries — stick to Lucide"}),`
`,n.jsx(e.li,{children:"Don't apply arbitrary sizes — use the size presets"}),`
`]})]})}function w(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(o,{...s})}):o(s)}export{w as default};
