import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as c}from"./index-FZkeZIx-.js";import{M as a}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function i(n){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...c(),...n.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(a,{title:"Foundations/Spacing"}),`
`,e.jsx(s.h1,{id:"spacing",children:"Spacing"}),`
`,e.jsx(s.p,{children:"The spacing system follows an 8-point grid with named tokens. Consistent spacing creates visual rhythm and improves scannability."}),`
`,e.jsx(s.h2,{id:"spacing-scale",children:"Spacing Scale"}),`
`,e.jsxs(s.p,{children:[`| Token | Value | Tailwind | Common Use |
|-------|-------|----------|------------|
| `,e.jsx(s.code,{children:"--space-1"})," | 4px | ",e.jsx(s.code,{children:"p-1"}),", ",e.jsx(s.code,{children:"m-1"}),", ",e.jsx(s.code,{children:"gap-1"}),` | Icon padding, tight gaps |
| `,e.jsx(s.code,{children:"--space-2"})," | 8px | ",e.jsx(s.code,{children:"p-2"}),", ",e.jsx(s.code,{children:"m-2"}),", ",e.jsx(s.code,{children:"gap-2"}),` | Form field gaps, button padding |
| `,e.jsx(s.code,{children:"--space-3"})," | 16px | ",e.jsx(s.code,{children:"p-3"}),", ",e.jsx(s.code,{children:"m-3"}),", ",e.jsx(s.code,{children:"gap-3"}),` | Card padding, section gaps |
| `,e.jsx(s.code,{children:"--space-4"})," | 24px | ",e.jsx(s.code,{children:"p-4"}),", ",e.jsx(s.code,{children:"m-4"}),", ",e.jsx(s.code,{children:"gap-4"}),` | Card content, form sections |
| `,e.jsx(s.code,{children:"--space-5"})," | 32px | ",e.jsx(s.code,{children:"p-5"}),", ",e.jsx(s.code,{children:"m-5"}),", ",e.jsx(s.code,{children:"gap-5"}),` | Page margins, major sections |
| `,e.jsx(s.code,{children:"--space-6"})," | 48px | ",e.jsx(s.code,{children:"p-6"}),", ",e.jsx(s.code,{children:"m-6"}),", ",e.jsx(s.code,{children:"gap-6"}),` | Card containers, large spacing |
| `,e.jsx(s.code,{children:"--space-7"})," | 64px | ",e.jsx(s.code,{children:"p-7"}),", ",e.jsx(s.code,{children:"m-7"}),", ",e.jsx(s.code,{children:"gap-7"})," | Page sections, hero areas |"]}),`
`,e.jsx(s.h2,{id:"visual-reference",children:"Visual Reference"}),`
`,e.jsxs("div",{className:"flex flex-col gap-4 mt-8",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-1 h-8 bg-primary",style:{minWidth:"4px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-1 (4px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-2 h-8 bg-primary",style:{minWidth:"8px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-2 (8px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"h-8 bg-primary",style:{minWidth:"16px",width:"16px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-3 (16px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"h-8 bg-primary",style:{minWidth:"24px",width:"24px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-4 (24px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"h-8 bg-primary",style:{minWidth:"32px",width:"32px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-5 (32px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"h-8 bg-primary",style:{minWidth:"48px",width:"48px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-6 (48px)"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"h-8 bg-primary",style:{minWidth:"64px",width:"64px"}}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"space-7 (64px)"})]})]}),`
`,e.jsx(s.hr,{}),`
`,e.jsx(s.h2,{id:"common-patterns",children:"Common Patterns"}),`
`,e.jsx(s.h3,{id:"card-layout",children:"Card Layout"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-tsx",children:`<Card>
  <CardHeader className="p-6">    {/* space-6 for header */}
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">  {/* space-6 sides, 0 top */}
    <div className="space-y-4">   {/* space-4 between items */}
      ...
    </div>
  </CardContent>
</Card>
`})}),`
`,e.jsx(s.h3,{id:"form-layout",children:"Form Layout"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-tsx",children:`<form className="space-y-6">       {/* space-6 between sections */}
  <div className="space-y-2">      {/* space-2 between label and input */}
    <Label>Email</Label>
    <Input />
  </div>
</form>
`})}),`
`,e.jsx(s.h3,{id:"button-groups",children:"Button Groups"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-tsx",children:`<div className="flex gap-2">       {/* space-2 between buttons */}
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
`})}),`
`,e.jsx(s.hr,{}),`
`,e.jsx(s.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(s.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Use consistent spacing within component types"}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.code,{children:"space-y-*"})," and ",e.jsx(s.code,{children:"space-x-*"})," for uniform gaps"]}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.code,{children:"gap-*"})," with flexbox and grid layouts"]}),`
`,e.jsxs(s.li,{children:["Start with ",e.jsx(s.code,{children:"space-6"})," (48px) for page/card containers"]}),`
`]}),`
`,e.jsx(s.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Don't use arbitrary spacing like ",e.jsx(s.code,{children:"p-[13px]"})]}),`
`,e.jsx(s.li,{children:"Don't mix spacing systems (margin + padding for the same gap)"}),`
`,e.jsxs(s.li,{children:["Don't use ",e.jsx(s.code,{children:"space-1"})," between major sections — too tight"]}),`
`,e.jsx(s.li,{children:"Don't add spacing tokens unnecessarily — let components handle their own internal spacing"}),`
`]})]})}function o(n={}){const{wrapper:s}={...c(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{o as default};
