import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{c as h}from"./utils-BQHNewu7.js";import{C as N,a as j,d as S}from"./card-Bh23J6St.js";function s({className:a,variant:r="pulse",shape:l,...n}){const f={line:"h-4 w-full rounded",circle:"rounded-full aspect-square",card:"h-24 w-full rounded-lg",button:"h-10 w-24 rounded-md"};return e.jsx("div",{className:h("bg-muted",r==="pulse"&&"animate-pulse",r==="shimmer"&&"animate-shimmer bg-linear-to-r from-muted via-muted-foreground/10 to-muted bg-size-[200%_100%]",l&&f[l],a),...n})}function v({lines:a=3,className:r}){return e.jsx("div",{className:h("space-y-2",r),children:Array.from({length:a}).map((l,n)=>e.jsx(s,{shape:"line",className:h(n===a-1&&"w-3/4")},n))})}function t({size:a="md",showText:r=!0,className:l}){const n={sm:"h-8 w-8",md:"h-10 w-10",lg:"h-12 w-12"};return e.jsxs("div",{className:h("flex items-center gap-3",l),children:[e.jsx(s,{shape:"circle",className:n[a]}),r&&e.jsxs("div",{className:"space-y-2 flex-1",children:[e.jsx(s,{className:"h-4 w-24"}),e.jsx(s,{className:"h-3 w-16"})]})]})}function g({className:a}){return e.jsxs("div",{className:h("p-4 space-y-4",a),children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(s,{shape:"circle",className:"h-10 w-10"}),e.jsxs("div",{className:"space-y-2 flex-1",children:[e.jsx(s,{className:"h-4 w-32"}),e.jsx(s,{className:"h-3 w-20"})]})]}),e.jsx(v,{lines:2}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(s,{shape:"button"}),e.jsx(s,{shape:"button",className:"w-20"})]})]})}s.__docgenInfo={description:`Skeleton loading placeholder component.

Use to indicate content loading state while maintaining layout stability.
Inherits dimensions from parent or uses shape presets.

@example
// Basic skeleton with custom size
<Skeleton className="h-4 w-32" />

@example
// Text line placeholder
<Skeleton shape="line" />

@example
// Avatar placeholder
<Skeleton shape="circle" className="h-10 w-10" />

@example
// Card content loading state
<Card>
  <CardContent className="space-y-3">
    <Skeleton shape="line" className="w-3/4" />
    <Skeleton shape="line" />
    <Skeleton shape="line" className="w-1/2" />
  </CardContent>
</Card>`,methods:[],displayName:"Skeleton",props:{variant:{required:!1,tsType:{name:"union",raw:'"pulse" | "shimmer"',elements:[{name:"literal",value:'"pulse"'},{name:"literal",value:'"shimmer"'}]},description:'Variant determines the animation style.\n- `pulse`: Default subtle opacity animation\n- `shimmer`: Gradient sweep animation\n@default "pulse"',defaultValue:{value:'"pulse"',computed:!1}},shape:{required:!1,tsType:{name:"union",raw:'"line" | "circle" | "card" | "button"',elements:[{name:"literal",value:'"line"'},{name:"literal",value:'"circle"'},{name:"literal",value:'"card"'},{name:"literal",value:'"button"'}]},description:"Pre-defined shape presets for common use cases.\n- `line`: Full-width text placeholder\n- `circle`: Avatar/icon placeholder\n- `card`: Card content placeholder\n- `button`: Button-sized rectangle"}}};v.__docgenInfo={description:`Pre-composed skeleton for text content loading.
Renders multiple lines with varying widths.

@example
<SkeletonText lines={3} />`,methods:[],displayName:"SkeletonText",props:{lines:{required:!1,tsType:{name:"number"},description:"Number of text lines to render",defaultValue:{value:"3",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};t.__docgenInfo={description:`Pre-composed skeleton for avatar with text (e.g., user cards).

@example
<SkeletonAvatar />`,methods:[],displayName:"SkeletonAvatar",props:{size:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"Avatar size preset",defaultValue:{value:'"md"',computed:!1}},showText:{required:!1,tsType:{name:"boolean"},description:"Show text lines next to avatar",defaultValue:{value:"true",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};g.__docgenInfo={description:`Pre-composed skeleton for card content.

@example
<Card>
  <SkeletonCard />
</Card>`,methods:[],displayName:"SkeletonCard",props:{className:{required:!1,tsType:{name:"string"},description:""}}};const w={title:"Primitives/Skeleton",component:s,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"},docs:{description:{component:"Skeleton loading placeholders for indicating content loading state while maintaining layout stability."}}},argTypes:{variant:{control:"select",options:["pulse","shimmer"],description:"Animation style"},shape:{control:"select",options:["line","circle","card","button"],description:"Pre-defined shape preset"}}},o={args:{className:"h-4 w-48"}},d={args:{variant:"pulse",className:"h-16 w-64"}},i={args:{variant:"shimmer",className:"h-16 w-64"}},m={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Line"}),e.jsx(s,{shape:"line",className:"max-w-md"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Circle"}),e.jsx(s,{shape:"circle",className:"h-12 w-12"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Button"}),e.jsx(s,{shape:"button"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Card"}),e.jsx(s,{shape:"card",className:"max-w-md"})]})]})},c={render:()=>e.jsxs("div",{className:"max-w-md space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"2 Lines"}),e.jsx(v,{lines:2})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"4 Lines"}),e.jsx(v,{lines:4})]})]})},p={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Small"}),e.jsx(t,{size:"sm"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Medium"}),e.jsx(t,{size:"md"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Large"}),e.jsx(t,{size:"lg"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Without Text"}),e.jsx(t,{showText:!1})]})]})},u={render:()=>e.jsx(N,{className:"max-w-sm",children:e.jsx(g,{})})},x={render:()=>e.jsx("div",{className:"space-y-4 max-w-lg",children:e.jsxs(N,{children:[e.jsx(j,{className:"pb-2",children:e.jsx(s,{className:"h-5 w-32"})}),e.jsxs(S,{className:"space-y-4",children:[e.jsx(t,{}),e.jsx(v,{lines:3}),e.jsxs("div",{className:"flex gap-2 pt-2",children:[e.jsx(s,{shape:"button"}),e.jsx(s,{shape:"button",className:"w-16"})]})]})]})})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    className: "h-4 w-48"
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "pulse",
    className: "h-16 w-64"
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "shimmer",
    className: "h-16 w-64"
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Line</p>\r
        <Skeleton shape="line" className="max-w-md" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Circle</p>\r
        <Skeleton shape="circle" className="h-12 w-12" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Button</p>\r
        <Skeleton shape="button" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Card</p>\r
        <Skeleton shape="card" className="max-w-md" />\r
      </div>\r
    </div>
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-md space-y-6">\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">2 Lines</p>\r
        <SkeletonText lines={2} />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">4 Lines</p>\r
        <SkeletonText lines={4} />\r
      </div>\r
    </div>
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Small</p>\r
        <SkeletonAvatar size="sm" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Medium</p>\r
        <SkeletonAvatar size="md" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Large</p>\r
        <SkeletonAvatar size="lg" />\r
      </div>\r
      <div>\r
        <p className="text-sm text-muted-foreground mb-2">Without Text</p>\r
        <SkeletonAvatar showText={false} />\r
      </div>\r
    </div>
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="max-w-sm">\r
      <SkeletonCard />\r
    </Card>
}`,...u.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 max-w-lg">\r
      <Card>\r
        <CardHeader className="pb-2">\r
          <Skeleton className="h-5 w-32" />\r
        </CardHeader>\r
        <CardContent className="space-y-4">\r
          <SkeletonAvatar />\r
          <SkeletonText lines={3} />\r
          <div className="flex gap-2 pt-2">\r
            <Skeleton shape="button" />\r
            <Skeleton shape="button" className="w-16" />\r
          </div>\r
        </CardContent>\r
      </Card>\r
    </div>
}`,...x.parameters?.docs?.source}}};const b=["Default","Pulse","Shimmer","Shapes","TextLines","Avatar","CardLoading","RealWorldExample"],T=Object.freeze(Object.defineProperty({__proto__:null,Avatar:p,CardLoading:u,Default:o,Pulse:d,RealWorldExample:x,Shapes:m,Shimmer:i,TextLines:c,__namedExportsOrder:b,default:w},Symbol.toStringTag,{value:"Module"}));export{p as A,o as D,T as S,i as a,m as b};
