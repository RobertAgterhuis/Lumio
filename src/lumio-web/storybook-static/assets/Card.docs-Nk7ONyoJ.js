import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as t}from"./index-FZkeZIx-.js";import{M as s,C as i}from"./blocks-BnPCfxAb.js";import{C as a,D as o,W as c}from"./Card.stories-DDsQU9vX.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./card-Bh23J6St.js";import"./utils-BQHNewu7.js";import"./button-Fj27Zx3k.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";function d(r){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...t(),...r.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(s,{of:a}),`
`,n.jsx(e.h1,{id:"card",children:"Card"}),`
`,n.jsx(e.p,{children:"Cards group related content and actions. They provide visual containment and hierarchy."}),`
`,n.jsx(i,{of:o}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"anatomy",children:"Anatomy"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>
`})}),`
`,n.jsxs(e.p,{children:[`| Part | Purpose |
|------|---------|
| `,n.jsx(e.code,{children:"Card"}),` | Container with border and shadow |
| `,n.jsx(e.code,{children:"CardHeader"}),` | Top section with padding |
| `,n.jsx(e.code,{children:"CardTitle"}),` | H3-level heading |
| `,n.jsx(e.code,{children:"CardDescription"}),` | Muted supporting text |
| `,n.jsx(e.code,{children:"CardContent"})," | Main content area |"]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"with-action",children:"With Action"}),`
`,n.jsx(e.p,{children:"Cards can contain interactive elements:"}),`
`,n.jsx(i,{of:c}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"multiple-cards",children:"Multiple Cards"}),`
`,n.jsx(e.p,{children:"Use consistent card layouts in grids:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
`})}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Use cards to group related content"}),`
`,n.jsx(e.li,{children:"Include a descriptive title"}),`
`,n.jsx(e.li,{children:"Keep card content focused on a single topic"}),`
`,n.jsx(e.li,{children:"Use consistent card heights in grids when possible"}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Don't nest cards inside cards"}),`
`,n.jsx(e.li,{children:"Don't use cards for single elements that don't need grouping"}),`
`,n.jsx(e.li,{children:"Don't put multiple unrelated actions in one card"}),`
`,n.jsx(e.li,{children:"Don't make cards too wide — max ~500px for readability"}),`
`]})]})}function M(r={}){const{wrapper:e}={...t(),...r.components};return e?n.jsx(e,{...r,children:n.jsx(d,{...r})}):d(r)}export{M as default};
