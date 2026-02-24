import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as t}from"./index-FZkeZIx-.js";import{M as l,C as o}from"./blocks-BnPCfxAb.js";import{D as r,a}from"./Dialog.stories-BRMGMJdU.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./dialog-CmKZs74s.js";import"./utils-BQHNewu7.js";import"./button-Fj27Zx3k.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";function s(i){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...t(),...i.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(l,{of:r}),`
`,n.jsx(e.h1,{id:"dialog",children:"Dialog"}),`
`,n.jsx(e.p,{children:"Dialogs are modal overlays that require user attention. They block interaction with the page until dismissed."}),`
`,n.jsx(o,{of:a}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"anatomy",children:"Anatomy"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogHeader>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogHeader>
  <DialogContent>
    {/* Form fields or content */}
  </DialogContent>
  <DialogFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </DialogFooter>
</Dialog>
`})}),`
`,n.jsxs(e.p,{children:[`| Part | Purpose |
|------|---------|
| `,n.jsx(e.code,{children:"Dialog"}),` | Root component, controls open state |
| `,n.jsx(e.code,{children:"DialogHeader"}),` | Contains title and description |
| `,n.jsx(e.code,{children:"DialogTitle"}),` | Required for accessibility |
| `,n.jsx(e.code,{children:"DialogDescription"}),` | Optional supporting text |
| `,n.jsx(e.code,{children:"DialogContent"}),` | Main content (forms, messages) |
| `,n.jsx(e.code,{children:"DialogFooter"})," | Action buttons |"]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"accessibility",children:"Accessibility"}),`
`,n.jsx(e.p,{children:"The Dialog component handles:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Focus trap"})," — Tab cycles within the dialog"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Return focus"})," — Focus returns to trigger on close"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Escape key"})," — Closes the dialog"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"ARIA attributes"})," — ",n.jsx(e.code,{children:'role="dialog"'}),", ",n.jsx(e.code,{children:"aria-modal"}),", ",n.jsx(e.code,{children:"aria-labelledby"})]}),`
`]}),`
`,n.jsx(o,{of:void 0}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"animation",children:"Animation"}),`
`,n.jsx(e.p,{children:"Dialogs animate on open/close with scale + fade:"}),`
`,n.jsx(o,{of:void 0}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"destructive-confirmation",children:"Destructive Confirmation"}),`
`,n.jsx(e.p,{children:"Use for dangerous actions like deletion:"}),`
`,n.jsx(o,{of:void 0}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Always include a ",n.jsx(e.code,{children:"DialogTitle"})," for accessibility"]}),`
`,n.jsxs(e.li,{children:["Put the primary action on the right in ",n.jsx(e.code,{children:"DialogFooter"})]}),`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:'variant="destructive"'})," for the confirm button in delete dialogs"]}),`
`,n.jsx(e.li,{children:"Use concise, action-oriented button labels"}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Don't open dialogs from within dialogs (nested modals)"}),`
`,n.jsx(e.li,{children:"Don't use dialogs for simple confirmations — consider inline confirmation"}),`
`,n.jsx(e.li,{children:"Don't put long forms in dialogs — use a dedicated page"}),`
`,n.jsx(e.li,{children:"Don't auto-close dialogs on success — let the user see feedback first"}),`
`]})]})}function C(i={}){const{wrapper:e}={...t(),...i.components};return e?n.jsx(e,{...i,children:n.jsx(s,{...i})}):s(i)}export{C as default};
