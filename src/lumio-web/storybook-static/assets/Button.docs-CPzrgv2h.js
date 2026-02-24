import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as d}from"./index-FZkeZIx-.js";import{M as a,C as i,a as l,A as c}from"./blocks-BnPCfxAb.js";import{B as t,D as o,A as h,a as x,L as j,b as u,W as p}from"./Button.stories-DUev9C9N.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Fj27Zx3k.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";import"./arrow-right-DRpLBAn6.js";function r(s){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...d(),...s.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(a,{of:t}),`
`,n.jsx(e.h1,{id:"button",children:"Button"}),`
`,n.jsx(e.p,{children:"Buttons trigger actions and navigation. Use the appropriate variant and size for the context."}),`
`,n.jsx(i,{of:o}),`
`,n.jsx(l,{of:o}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"variants",children:"Variants"}),`
`,n.jsxs(e.p,{children:[`| Variant | Use Case |
|---------|----------|
| `,n.jsx(e.code,{children:"default"}),` | Primary actions (Save, Submit, Confirm) |
| `,n.jsx(e.code,{children:"secondary"}),` | Secondary actions, less prominent |
| `,n.jsx(e.code,{children:"destructive"}),` | Dangerous actions (Delete, Remove) |
| `,n.jsx(e.code,{children:"outline"}),` | Tertiary actions, low emphasis |
| `,n.jsx(e.code,{children:"ghost"}),` | Inline actions, minimal footprint |
| `,n.jsx(e.code,{children:"link"})," | Navigation that looks like text |"]}),`
`,n.jsx(i,{of:h}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"sizes",children:"Sizes"}),`
`,n.jsxs(e.p,{children:[`| Size | Use Case |
|------|----------|
| `,n.jsx(e.code,{children:"default"}),` | Standard buttons |
| `,n.jsx(e.code,{children:"sm"}),` | Compact contexts, tables |
| `,n.jsx(e.code,{children:"lg"}),` | Hero sections, prominent CTAs |
| `,n.jsx(e.code,{children:"icon"})," | Icon-only buttons |"]}),`
`,n.jsx(i,{of:x}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"loading-state",children:"Loading State"}),`
`,n.jsxs(e.p,{children:["Use ",n.jsx(e.code,{children:"loading={true}"})," during async operations. The button shows a spinner and becomes disabled."]}),`
`,n.jsx(i,{of:j}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"aschild-pattern",children:"asChild Pattern"}),`
`,n.jsxs(e.p,{children:["Use ",n.jsx(e.code,{children:"asChild"})," to render the button styles on a different element (e.g., a link):"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
`})}),`
`,n.jsx(i,{of:u}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"with-icons",children:"With Icons"}),`
`,n.jsx(e.p,{children:"Place icons before or after text using flex alignment:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Button>
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>
`})}),`
`,n.jsx(i,{of:p}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"props",children:"Props"}),`
`,n.jsx(c,{of:t}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"default"})," variant for the primary action in a form"]}),`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"destructive"})," only for permanently destructive actions"]}),`
`,n.jsxs(e.li,{children:["Add ",n.jsx(e.code,{children:"loading"})," state during API calls"]}),`
`,n.jsx(e.li,{children:'Keep button labels short and action-oriented ("Save", not "Click here to save")'}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Don't use multiple ",n.jsx(e.code,{children:"default"})," buttons in the same section — choose one primary"]}),`
`,n.jsxs(e.li,{children:["Don't use ",n.jsx(e.code,{children:"destructive"})," for cancel buttons — use ",n.jsx(e.code,{children:"outline"})," or ",n.jsx(e.code,{children:"ghost"})]}),`
`,n.jsx(e.li,{children:"Don't disable buttons without explaining why"}),`
`,n.jsxs(e.li,{children:["Don't use ",n.jsx(e.code,{children:"link"})," variant inside body text — use actual links"]}),`
`]})]})}function A(s={}){const{wrapper:e}={...d(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(r,{...s})}):r(s)}export{A as default};
