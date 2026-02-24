import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as a}from"./index-FZkeZIx-.js";import{M as o,C as i,a as r}from"./blocks-BnPCfxAb.js";import{S as d,D as l,a as c,b as h,A as x}from"./Skeleton.stories-BJEORZ9E.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./card-Bh23J6St.js";function t(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...a(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(o,{of:d}),`
`,e.jsx(n.h1,{id:"skeleton",children:"Skeleton"}),`
`,e.jsx(n.p,{children:"Skeleton components provide loading placeholders that maintain layout stability while content loads."}),`
`,e.jsx(i,{of:l}),`
`,e.jsx(r,{of:l}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"variants",children:"Variants"}),`
`,e.jsxs(n.p,{children:[`| Variant | Animation | Use Case |
|---------|-----------|----------|
| `,e.jsx(n.code,{children:"pulse"}),` | Opacity fade | Default, subtle loading |
| `,e.jsx(n.code,{children:"shimmer"})," | Gradient sweep | More prominent loading |"]}),`
`,e.jsx(i,{of:c}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"shape-presets",children:"Shape Presets"}),`
`,e.jsxs(n.p,{children:[`| Shape | Dimensions | Use Case |
|-------|-----------|----------|
| `,e.jsx(n.code,{children:"line"}),` | h-4 full width | Text placeholders |
| `,e.jsx(n.code,{children:"circle"}),` | Square with rounded-full | Avatars, icons |
| `,e.jsx(n.code,{children:"card"}),` | h-24 full width | Card content |
| `,e.jsx(n.code,{children:"button"})," | h-10 w-24 | Button placeholders |"]}),`
`,e.jsx(i,{of:h}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"pre-composed-components",children:"Pre-composed Components"}),`
`,e.jsx(n.h3,{id:"skeletontext",children:"SkeletonText"}),`
`,e.jsx(n.p,{children:"Multiple text lines with varying widths:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<SkeletonText lines={3} />
`})}),`
`,e.jsx(i,{of:void 0}),`
`,e.jsx(n.h3,{id:"skeletonavatar",children:"SkeletonAvatar"}),`
`,e.jsx(n.p,{children:"Circular avatar placeholder:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<SkeletonAvatar size="lg" />  {/* sm, md, lg */}
`})}),`
`,e.jsx(i,{of:x}),`
`,e.jsx(n.h3,{id:"skeletoncard",children:"SkeletonCard"}),`
`,e.jsx(n.p,{children:"Card layout placeholder:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<SkeletonCard />
`})}),`
`,e.jsx(i,{of:void 0}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"common-patterns",children:"Common Patterns"}),`
`,e.jsx(n.h3,{id:"list-loading",children:"List Loading"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton shape="line" className="w-1/2" />
          <Skeleton shape="line" className="w-3/4" />
        </div>
      </div>
    ))}
  </div>
) : (
  <ActualList data={data} />
)}
`})}),`
`,e.jsx(n.h3,{id:"card-content-loading",children:"Card Content Loading"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Card>
  <CardHeader>
    <Skeleton shape="line" className="w-1/3 h-6" />
    <Skeleton shape="line" className="w-2/3 h-4" />
  </CardHeader>
  <CardContent>
    <SkeletonText lines={4} />
  </CardContent>
</Card>
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Match skeleton dimensions to actual content"}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"pulse"})," (default) for most cases"]}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"shimmer"})," for prominent loading states"]}),`
`,e.jsx(n.li,{children:"Show skeletons immediately, don't delay"}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Don't use skeletons for micro-interactions (use spinners)"}),`
`,e.jsx(n.li,{children:"Don't animate skeleton elements in and out"}),`
`,e.jsx(n.li,{children:"Don't use bright or distracting skeleton colors"}),`
`,e.jsx(n.li,{children:"Don't show skeletons indefinitely — set reasonable timeouts"}),`
`]})]})}function S(s={}){const{wrapper:n}={...a(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{S as default};
