import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{D as l,a as t,b as i,c as a,d as s}from"./dialog-pZ5-40IS.js";import{B as o}from"./button-6i_qtU0N.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";const D={title:"Primitives/Dialog",component:l,tags:["autodocs"],argTypes:{open:{control:"boolean"}}},n={args:{open:!0,onOpenChange:()=>{},children:e.jsxs(e.Fragment,{children:[e.jsxs(t,{children:[e.jsx(i,{children:"Bevestiging"}),e.jsx(a,{children:"Weet u zeker dat u deze actie wilt uitvoeren?"})]}),e.jsxs(s,{children:[e.jsx(o,{variant:"outline",children:"Annuleren"}),e.jsx(o,{children:"Bevestigen"})]})]})}},r={args:{open:!0,onOpenChange:()=>{},children:e.jsxs(e.Fragment,{children:[e.jsxs(t,{children:[e.jsx(i,{children:"Profiel bewerken"}),e.jsx(a,{children:"Pas uw persoonlijke gegevens aan."})]}),e.jsx("div",{className:"py-4",children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Formulierinhoud wordt hier getoond."})}),e.jsxs(s,{children:[e.jsx(o,{variant:"outline",children:"Annuleren"}),e.jsx(o,{children:"Opslaan"})]})]})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    children: <>\r
        <DialogHeader>\r
          <DialogTitle>Bevestiging</DialogTitle>\r
          <DialogDescription>\r
            Weet u zeker dat u deze actie wilt uitvoeren?\r
          </DialogDescription>\r
        </DialogHeader>\r
        <DialogFooter>\r
          <Button variant="outline">Annuleren</Button>\r
          <Button>Bevestigen</Button>\r
        </DialogFooter>\r
      </>
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    children: <>\r
        <DialogHeader>\r
          <DialogTitle>Profiel bewerken</DialogTitle>\r
          <DialogDescription>\r
            Pas uw persoonlijke gegevens aan.\r
          </DialogDescription>\r
        </DialogHeader>\r
        <div className="py-4">\r
          <p className="text-sm text-muted-foreground">\r
            Formulierinhoud wordt hier getoond.\r
          </p>\r
        </div>\r
        <DialogFooter>\r
          <Button variant="outline">Annuleren</Button>\r
          <Button>Opslaan</Button>\r
        </DialogFooter>\r
      </>
  }
}`,...r.parameters?.docs?.source}}};const x=["Default","WithContent"];export{n as Default,r as WithContent,x as __namedExportsOrder,D as default};
