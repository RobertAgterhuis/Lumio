import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as d}from"./index-FZkeZIx-.js";import{M as i}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function n(s){const r={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...d(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(i,{title:"Foundations/Borders"}),`
`,e.jsx(r.h1,{id:"borders",children:"Borders"}),`
`,e.jsx(r.p,{children:"Border tokens ensure consistent stroke widths across the design system."}),`
`,e.jsx(r.h2,{id:"border-width-scale",children:"Border Width Scale"}),`
`,e.jsxs(r.p,{children:[`| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| `,e.jsx(r.code,{children:"--border-0"})," | 0 | ",e.jsx(r.code,{children:"border-0"}),` | Remove borders |
| `,e.jsx(r.code,{children:"--border-1"})," | 1px | ",e.jsx(r.code,{children:"border"}),` | Default borders (inputs, cards) |
| `,e.jsx(r.code,{children:"--border-2"})," | 2px | ",e.jsx(r.code,{children:"border-2"}),` | Emphasis borders, active states |
| `,e.jsx(r.code,{children:"--border-4"})," | 4px | ",e.jsx(r.code,{children:"border-4"}),` | Strong separators, focus rings |
| `,e.jsx(r.code,{children:"--border-8"})," | 8px | ",e.jsx(r.code,{children:"border-8"})," | Decorative, section dividers |"]}),`
`,e.jsx(r.hr,{}),`
`,e.jsx(r.h2,{id:"visual-reference",children:"Visual Reference"}),`
`,e.jsxs("div",{className:"space-y-4 mt-8",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-24 h-12 border border-primary rounded flex items-center justify-center text-xs",children:e.jsx(r.p,{children:"border (1px)"})}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Default — inputs, cards"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-24 h-12 border-2 border-primary rounded flex items-center justify-center text-xs",children:e.jsx(r.p,{children:"border-2"})}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Emphasis — active, selected"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-24 h-12 border-4 border-primary rounded flex items-center justify-center text-xs",children:e.jsx(r.p,{children:"border-4"})}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Strong — focus indicators"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-24 h-12 border-8 border-primary rounded flex items-center justify-center text-xs",children:e.jsx(r.p,{children:"border-8"})}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Decorative — section dividers"})]})]}),`
`,e.jsx(r.hr,{}),`
`,e.jsx(r.h2,{id:"border-colors",children:"Border Colors"}),`
`,e.jsx(r.p,{children:"Borders use semantic color tokens:"}),`
`,e.jsxs(r.p,{children:[`| Tailwind Class | Use Case |
|----------------|----------|
| `,e.jsx(r.code,{children:"border-border"}),` | Default neutral border |
| `,e.jsx(r.code,{children:"border-input"}),` | Form input borders |
| `,e.jsx(r.code,{children:"border-primary"}),` | Primary accent borders |
| `,e.jsx(r.code,{children:"border-destructive"}),` | Error state borders |
| `,e.jsx(r.code,{children:"border-ring"})," | Focus ring color |"]}),`
`,e.jsx(r.hr,{}),`
`,e.jsx(r.h2,{id:"common-patterns",children:"Common Patterns"}),`
`,e.jsx(r.h3,{id:"card-border",children:"Card Border"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-tsx",children:`<Card className="border border-border">
  {/* default 1px neutral border */}
</Card>
`})}),`
`,e.jsx(r.h3,{id:"input-error-state",children:"Input Error State"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-tsx",children:`<Input className={error ? "border-destructive" : "border-input"} />
`})}),`
`,e.jsx(r.h3,{id:"active-tab-indicator",children:"Active Tab Indicator"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-tsx",children:`<div className={isActive ? "border-b-2 border-primary" : "border-b border-transparent"}>
  Tab
</div>
`})}),`
`,e.jsx(r.hr,{}),`
`,e.jsx(r.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(r.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:["Use ",e.jsx(r.code,{children:"border"})," (1px) for most UI elements"]}),`
`,e.jsxs(r.li,{children:["Use ",e.jsx(r.code,{children:"border-2"})," to indicate active/selected states"]}),`
`,e.jsxs(r.li,{children:["Combine with semantic colors: ",e.jsx(r.code,{children:"border-destructive"})]}),`
`]}),`
`,e.jsx(r.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:["Don't use arbitrary border widths like ",e.jsx(r.code,{children:"border-[3px]"})]}),`
`,e.jsxs(r.li,{children:["Don't use ",e.jsx(r.code,{children:"border-8"})," for functional UI — it's decorative only"]}),`
`,e.jsx(r.li,{children:"Don't mix border-width tokens inconsistently within a component"}),`
`]})]})}function x(s={}){const{wrapper:r}={...d(),...s.components};return r?e.jsx(r,{...s,children:e.jsx(n,{...s})}):n(s)}export{x as default};
