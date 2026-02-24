import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as o}from"./index-FZkeZIx-.js";import{M as t,C as i,a,A as c}from"./blocks-BnPCfxAb.js";import{I as s,D as l,a as h}from"./Input.stories-C-G911QG.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./input-DocKjuCE.js";import"./utils-BQHNewu7.js";import"./label-DmNWg_6T.js";function d(r){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...o(),...r.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(t,{of:s}),`
`,e.jsx(n.h1,{id:"input",children:"Input"}),`
`,e.jsxs(n.p,{children:["Standard text input for forms. Use within ",e.jsx(n.code,{children:"FormField"})," for full accessibility."]}),`
`,e.jsx(i,{of:l}),`
`,e.jsx(a,{of:l}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"types",children:"Types"}),`
`,e.jsx(n.p,{children:"Standard HTML input types are supported:"}),`
`,e.jsxs(n.p,{children:[`| Type | Use Case |
|------|----------|
| `,e.jsx(n.code,{children:"text"}),` | General text input |
| `,e.jsx(n.code,{children:"email"}),` | Email addresses |
| `,e.jsx(n.code,{children:"password"}),` | Passwords |
| `,e.jsx(n.code,{children:"number"}),` | Numeric values |
| `,e.jsx(n.code,{children:"tel"}),` | Phone numbers |
| `,e.jsx(n.code,{children:"url"})," | URLs |"]}),`
`,e.jsx(i,{of:void 0}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"states",children:"States"}),`
`,e.jsx(n.h3,{id:"disabled",children:"Disabled"}),`
`,e.jsx(i,{of:h}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"with-formfield",children:"With FormField"}),`
`,e.jsxs(n.p,{children:["For proper accessibility, wrap inputs in ",e.jsx(n.code,{children:"FormField"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<FormField.Root error={errors.email?.message} required>
  <FormField.Label>Email</FormField.Label>
  <FormField.Input type="email" {...register("email")} />
  <FormField.Helper>We'll never share your email.</FormField.Helper>
  <FormField.Error />
</FormField.Root>
`})}),`
`,e.jsx(n.p,{children:"This provides:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Label association (",e.jsx(n.code,{children:"htmlFor"})," → ",e.jsx(n.code,{children:"id"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"aria-invalid"})," on error"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"aria-describedby"})," for helper/error text"]}),`
`,e.jsx(n.li,{children:"Required indicator (*)"}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"props",children:"Props"}),`
`,e.jsx(c,{of:s}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Always use a label (via ",e.jsx(n.code,{children:"FormField.Label"})," or separate ",e.jsx(n.code,{children:"<label>"}),")"]}),`
`,e.jsx(n.li,{children:"Use appropriate input types for validation"}),`
`,e.jsx(n.li,{children:"Provide placeholder text as a hint, not a replacement for labels"}),`
`,e.jsx(n.li,{children:"Show validation errors below the input"}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Don't use placeholder as the only label"}),`
`,e.jsx(n.li,{children:"Don't disable inputs without explaining why"}),`
`,e.jsxs(n.li,{children:["Don't use ",e.jsx(n.code,{children:'type="number"'})," for things like phone numbers (use ",e.jsx(n.code,{children:"tel"}),")"]}),`
`,e.jsx(n.li,{children:"Don't create custom inputs when standard types work"}),`
`]})]})}function w(r={}){const{wrapper:n}={...o(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(d,{...r})}):d(r)}export{w as default};
