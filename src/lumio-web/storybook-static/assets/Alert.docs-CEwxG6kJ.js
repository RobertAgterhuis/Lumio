import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as l}from"./index-FZkeZIx-.js";import{M as o,C as i,a as c}from"./blocks-BnPCfxAb.js";import{A as a,I as r,a as d}from"./Alert.stories-DJd8Zb6K.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./alert-DAD2EhLd.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";import"./shield-C13dSADR.js";import"./createLucideIcon-B_yB00Wp.js";import"./triangle-alert-BVH98Qf5.js";function t(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...l(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(o,{of:a}),`
`,e.jsx(n.h1,{id:"alert",children:"Alert"}),`
`,e.jsx(n.p,{children:"Alerts display contextual messages with semantic meaning. They include an icon by default based on the variant."}),`
`,e.jsx(i,{of:r}),`
`,e.jsx(c,{of:r}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"variants",children:"Variants"}),`
`,e.jsxs(n.p,{children:[`| Variant | Use Case | Icon |
|---------|----------|------|
| `,e.jsx(n.code,{children:"info"}),` | General information, tips | ℹ️ Info |
| `,e.jsx(n.code,{children:"success"}),` | Successful actions, confirmations | ✓ CheckCircle |
| `,e.jsx(n.code,{children:"warning"}),` | Caution, potential issues | ⚠️ AlertTriangle |
| `,e.jsx(n.code,{children:"danger"}),` | Errors, destructive alerts | ✕ XCircle |
| `,e.jsx(n.code,{children:"security"})," | Security-related messages | 🛡️ Shield |"]}),`
`,e.jsx(i,{of:d}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"anatomy",children:"Anatomy"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>
`})}),`
`,e.jsxs(n.p,{children:[`| Part | Purpose |
|------|---------|
| `,e.jsx(n.code,{children:"Alert"}),` | Container with role="alert" |
| `,e.jsx(n.code,{children:"AlertTitle"}),` | Bold heading (optional) |
| `,e.jsx(n.code,{children:"AlertDescription"})," | Body text |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"custom-icon",children:"Custom Icon"}),`
`,e.jsx(n.p,{children:"Override the default icon:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Alert variant="info" icon={<CustomIcon />}>
  <AlertDescription>Custom icon message</AlertDescription>
</Alert>
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"without-icon",children:"Without Icon"}),`
`,e.jsx(n.p,{children:"Hide the icon when space is limited:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<Alert variant="warning" hideIcon>
  <AlertDescription>Compact warning message</AlertDescription>
</Alert>
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Use semantic variants that match the message intent"}),`
`,e.jsx(n.li,{children:"Keep alert text concise"}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"AlertTitle"})," for multi-line alerts"]}),`
`,e.jsx(n.li,{children:"Place alerts near the relevant content"}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Don't use ",e.jsx(n.code,{children:"danger"})," for warnings — that's what ",e.jsx(n.code,{children:"warning"})," is for"]}),`
`,e.jsx(n.li,{children:"Don't use alerts for success confirmations that should be toasts"}),`
`,e.jsx(n.li,{children:"Don't stack multiple alerts of the same type"}),`
`,e.jsx(n.li,{children:"Don't use alerts for marketing messages — they're for system feedback"}),`
`]})]})}function y(s={}){const{wrapper:n}={...l(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{y as default};
