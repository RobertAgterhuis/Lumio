import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{B as x}from"./button-Fj27Zx3k.js";import{c as y}from"./utils-BQHNewu7.js";import{P as z,U as k}from"./users-Bu7OPm_g.js";import{c as u}from"./createLucideIcon-B_yB00Wp.js";import{S as N}from"./shield-C13dSADR.js";import{F as v}from"./file-text-DyGo25iB.js";import{T as j}from"./triangle-alert-BVH98Qf5.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";const T=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],L=u("heart",T);const S=[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]],C=u("wallet",S);function d({icon:b=z,title:f,description:m,ctaLabel:p,onCtaClick:g,children:h,className:w}){return e.jsxs("div",{className:y("flex flex-col items-center justify-center py-12 px-4 text-center",w),role:"status","aria-live":"polite",children:[e.jsx(b,{className:"h-12 w-12 text-muted-foreground mb-4","aria-hidden":"true"}),e.jsx("p",{className:"text-base font-medium text-foreground mb-1",children:f}),m&&e.jsx("p",{className:"text-sm text-muted-foreground max-w-sm mb-4",children:m}),p&&g&&e.jsx(x,{onClick:g,className:"mt-2",children:p}),h]})}d.__docgenInfo={description:`EmptyState - A consistent empty state component with icon, guidance text, and CTA.

Usage:
\`\`\`tsx
<EmptyState
  icon={Users}
  title="Nog geen erfgenamen"
  description="Voeg erfgenamen toe om uw nalatenschap te verdelen"
  ctaLabel="Erfgenaam toevoegen"
  onCtaClick={() => openDialog()}
/>
\`\`\``,methods:[],displayName:"EmptyState",props:{icon:{required:!1,tsType:{name:"LucideIcon"},description:"Icon to display (defaults to Package)",defaultValue:{value:"Package",computed:!0}},title:{required:!0,tsType:{name:"string"},description:"Main title/message"},description:{required:!1,tsType:{name:"string"},description:"Optional description providing more context"},ctaLabel:{required:!1,tsType:{name:"string"},description:"CTA button label"},onCtaClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"CTA click handler"},children:{required:!1,tsType:{name:"ReactNode"},description:"Optional additional content"},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes"}}};const M={title:"UI/EmptyState",component:d,parameters:{layout:"centered",status:{type:"stable"},governance:{maturity:"stable",a11yLevel:"AA"}},tags:["autodocs"],argTypes:{icon:{control:!1,description:"Lucide icon component to display"},title:{control:"text",description:"Main message displayed to the user"},description:{control:"text",description:"Supporting text with additional guidance"},ctaLabel:{control:"text",description:"Button label for the call-to-action"},onCtaClick:{action:"clicked",description:"Handler for CTA button click"}}},t={args:{title:"Nog geen items",description:"Voeg uw eerste item toe om te beginnen.",ctaLabel:"Item toevoegen"}},n={args:{icon:k,title:"Nog geen erfgenamen",description:"Erfgenamen zijn de personen die uw nalatenschap ontvangen. Voeg minimaal één erfgenaam toe.",ctaLabel:"Erfgenaam toevoegen"}},a={args:{icon:v,title:"Nog geen documenten",description:"Upload belangrijke documenten zoals uw testament, legitimatiebewijs of verzekeringspolissen.",ctaLabel:"Document uploaden"}},o={args:{icon:C,title:"Nog geen bezittingen",description:"Registreer uw bezittingen, rekeningen, verzekeringen en schulden voor een compleet overzicht.",ctaLabel:"Bezit toevoegen"}},r={args:{icon:N,title:"Nog geen digitale accounts",description:"Voeg uw online accounts toe zodat nabestaanden weten wat er moet gebeuren.",ctaLabel:"Account toevoegen"}},i={args:{icon:L,title:"Nog geen uitvaartwensen",description:"Leg uw wensen vast voor uw uitvaart zodat uw nabestaanden weten wat u wilt.",ctaLabel:"Wensen vastleggen"}},s={args:{icon:j,title:"Er zijn geen zoekresultaten",description:"Probeer een andere zoekterm of pas uw filters aan."}},c={args:{title:"Geen items",ctaLabel:"Toevoegen"}},l={render:()=>e.jsx(d,{icon:v,title:"Documenten verlopen binnenkort",description:"De volgende documenten hebben aandacht nodig",children:e.jsxs("div",{className:"mt-4 space-y-2 text-sm text-muted-foreground",children:[e.jsx("p",{children:"• Paspoort - verloopt over 30 dagen"}),e.jsx("p",{children:"• Rijbewijs - verloopt over 45 dagen"})]})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Nog geen items",
    description: "Voeg uw eerste item toe om te beginnen.",
    ctaLabel: "Item toevoegen"
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Users,
    title: "Nog geen erfgenamen",
    description: "Erfgenamen zijn de personen die uw nalatenschap ontvangen. Voeg minimaal één erfgenaam toe.",
    ctaLabel: "Erfgenaam toevoegen"
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    icon: FileText,
    title: "Nog geen documenten",
    description: "Upload belangrijke documenten zoals uw testament, legitimatiebewijs of verzekeringspolissen.",
    ctaLabel: "Document uploaden"
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Wallet,
    title: "Nog geen bezittingen",
    description: "Registreer uw bezittingen, rekeningen, verzekeringen en schulden voor een compleet overzicht.",
    ctaLabel: "Bezit toevoegen"
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Shield,
    title: "Nog geen digitale accounts",
    description: "Voeg uw online accounts toe zodat nabestaanden weten wat er moet gebeuren.",
    ctaLabel: "Account toevoegen"
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Heart,
    title: "Nog geen uitvaartwensen",
    description: "Leg uw wensen vast voor uw uitvaart zodat uw nabestaanden weten wat u wilt.",
    ctaLabel: "Wensen vastleggen"
  }
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    icon: AlertTriangle,
    title: "Er zijn geen zoekresultaten",
    description: "Probeer een andere zoekterm of pas uw filters aan."
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Geen items",
    ctaLabel: "Toevoegen"
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <EmptyState icon={FileText} title="Documenten verlopen binnenkort" description="De volgende documenten hebben aandacht nodig">\r
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">\r
        <p>• Paspoort - verloopt over 30 dagen</p>\r
        <p>• Rijbewijs - verloopt over 45 dagen</p>\r
      </div>\r
    </EmptyState>
}`,...l.parameters?.docs?.source}}};const R=["Default","Erfgenamen","Documenten","Boedel","DigitaalBezit","Uitvaart","WithoutCTA","MinimalWithCTA","WithCustomContent"];export{o as Boedel,t as Default,r as DigitaalBezit,a as Documenten,n as Erfgenamen,c as MinimalWithCTA,i as Uitvaart,l as WithCustomContent,s as WithoutCTA,R as __namedExportsOrder,M as default};
