import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{A as p,b as n,a as r}from"./alert-DAD2EhLd.js";const u={title:"Primitives/Alert",component:p,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{variant:{control:"select",options:["info","success","warning","danger","security"]},hideIcon:{control:"boolean"}}},s={args:{variant:"info",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:"Informatie"}),e.jsx(r,{children:"Dit is een informatief bericht voor de gebruiker."})]})}},t={args:{variant:"success",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:"Gelukt"}),e.jsx(r,{children:"De wijzigingen zijn succesvol opgeslagen."})]})}},a={args:{variant:"warning",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:"Let op"}),e.jsx(r,{children:"Controleer uw gegevens voordat u verdergaat."})]})}},i={args:{variant:"danger",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:"Fout"}),e.jsx(r,{children:"Er is een fout opgetreden bij het opslaan van uw gegevens."})]})}},o={args:{variant:"security",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:"Beveiligd"}),e.jsx(r,{children:"Uw gegevens worden versleuteld opgeslagen."})]})}},c={args:{variant:"info",hideIcon:!0,children:e.jsx(r,{children:"Alert zonder icoon."})}},l={args:{variant:"warning",children:e.jsx(r,{children:"Een korte waarschuwing zonder titel."})}},d={render:()=>e.jsx("div",{className:"flex flex-col gap-4 w-full max-w-lg",children:["info","success","warning","danger","security"].map(g=>e.jsxs(p,{variant:g,children:[e.jsx(n,{className:"capitalize",children:g}),e.jsxs(r,{children:["Voorbeeld van een ",g," melding."]})]},g))})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: <>\r
        <AlertTitle>Informatie</AlertTitle>\r
        <AlertDescription>\r
          Dit is een informatief bericht voor de gebruiker.\r
        </AlertDescription>\r
      </>
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "success",
    children: <>\r
        <AlertTitle>Gelukt</AlertTitle>\r
        <AlertDescription>\r
          De wijzigingen zijn succesvol opgeslagen.\r
        </AlertDescription>\r
      </>
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: <>\r
        <AlertTitle>Let op</AlertTitle>\r
        <AlertDescription>\r
          Controleer uw gegevens voordat u verdergaat.\r
        </AlertDescription>\r
      </>
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "danger",
    children: <>\r
        <AlertTitle>Fout</AlertTitle>\r
        <AlertDescription>\r
          Er is een fout opgetreden bij het opslaan van uw gegevens.\r
        </AlertDescription>\r
      </>
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "security",
    children: <>\r
        <AlertTitle>Beveiligd</AlertTitle>\r
        <AlertDescription>\r
          Uw gegevens worden versleuteld opgeslagen.\r
        </AlertDescription>\r
      </>
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info",
    hideIcon: true,
    children: <AlertDescription>\r
        Alert zonder icoon.\r
      </AlertDescription>
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: <AlertDescription>\r
        Een korte waarschuwing zonder titel.\r
      </AlertDescription>
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 w-full max-w-lg">\r
      {(["info", "success", "warning", "danger", "security"] as const).map(variant => <Alert key={variant} variant={variant}>\r
            <AlertTitle className="capitalize">{variant}</AlertTitle>\r
            <AlertDescription>\r
              Voorbeeld van een {variant} melding.\r
            </AlertDescription>\r
          </Alert>)}\r
    </div>
}`,...d.parameters?.docs?.source}}};const m=["Info","Success","Warning","Danger","Security","WithoutIcon","DescriptionOnly","AllVariants"],A=Object.freeze(Object.defineProperty({__proto__:null,AllVariants:d,Danger:i,DescriptionOnly:l,Info:s,Security:o,Success:t,Warning:a,WithoutIcon:c,__namedExportsOrder:m,default:u},Symbol.toStringTag,{value:"Module"}));export{A,s as I,d as a};
