import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{r as u}from"./iframe-BZkGcvi5.js";import{B as h}from"./button-6i_qtU0N.js";import{I as q}from"./input-BXBGUmDW.js";import{L as P}from"./label-Bz9iGEJ6.js";import{A as k,a as O}from"./alert-CxRsJbPF.js";import{D as S,a as V,b as E,c as W,d as N}from"./dialog-pZ5-40IS.js";import{S as B}from"./shield-alert-DpzB0IX5.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";import"./shield-DL8sdY7P.js";import"./createLucideIcon-sem_sh0Z.js";function v({open:n,onOpenChange:p,title:b,description:y,confirmLabel:j,cancelLabel:x="Annuleren",requirePassword:s=!1,passwordLabel:C="Wachtwoord",passwordPlaceholder:D="Voer uw wachtwoord in ter bevestiging",onConfirm:L,children:A}){const[i,d]=u.useState(""),[c,m]=u.useState(!1),[g,l]=u.useState(""),T=async r=>{r.preventDefault(),l(""),m(!0);try{await L(s?i:void 0),d(""),p(!1)}catch(f){l(f instanceof Error?f.message:"Er is een fout opgetreden")}finally{m(!1)}},w=r=>{r||(d(""),l("")),p(r)};return e.jsx(S,{open:n,onOpenChange:w,children:e.jsxs("form",{onSubmit:T,children:[e.jsxs(V,{children:[e.jsx("div",{className:"mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger",children:e.jsx(B,{className:"h-6 w-6"})}),e.jsx(E,{children:b}),e.jsx(W,{children:y})]}),e.jsxs("div",{className:"my-4 space-y-4",children:[A,s&&e.jsxs("div",{className:"space-y-2",children:[e.jsx(P,{htmlFor:"confirm-password",children:C}),e.jsx(q,{id:"confirm-password",type:"password",value:i,onChange:r=>d(r.target.value),placeholder:D,required:!0,autoFocus:!0})]}),g&&e.jsx(k,{variant:"danger",children:e.jsx(O,{children:g})})]}),e.jsxs(N,{children:[e.jsx(h,{type:"button",variant:"outline",onClick:()=>w(!1),disabled:c,children:x}),e.jsx(h,{type:"submit",variant:"destructive",disabled:c||s&&!i,children:c?"Bezig...":j})]})]})})}v.__docgenInfo={description:"",methods:[],displayName:"ConfirmDestructiveAction",props:{open:{required:!0,tsType:{name:"boolean"},description:"Whether the dialog is open"},onOpenChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(open: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"open"}],return:{name:"void"}}},description:"Callback when open state changes"},title:{required:!0,tsType:{name:"string"},description:"Dialog title"},description:{required:!0,tsType:{name:"string"},description:"Description of what will happen"},confirmLabel:{required:!0,tsType:{name:"string"},description:"Label for the confirm button"},cancelLabel:{required:!1,tsType:{name:"string"},description:"Label for the cancel button",defaultValue:{value:'"Annuleren"',computed:!1}},requirePassword:{required:!1,tsType:{name:"boolean"},description:"Whether password re-entry is required",defaultValue:{value:"false",computed:!1}},passwordLabel:{required:!1,tsType:{name:"string"},description:"Password input label",defaultValue:{value:'"Wachtwoord"',computed:!1}},passwordPlaceholder:{required:!1,tsType:{name:"string"},description:"Password input placeholder",defaultValue:{value:'"Voer uw wachtwoord in ter bevestiging"',computed:!1}},onConfirm:{required:!0,tsType:{name:"signature",type:"function",raw:"(password?: string) => Promise<void> | void",signature:{arguments:[{type:{name:"string"},name:"password"}],return:{name:"union",raw:"Promise<void> | void",elements:[{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"},{name:"void"}]}}},description:"Callback when user confirms — receives password if required"},children:{required:!1,tsType:{name:"ReactNode"},description:"Optional extra content in the dialog body"}}};const Y={title:"Security/ConfirmDestructiveAction",component:v,tags:["autodocs"],argTypes:{open:{control:"boolean"},requirePassword:{control:"boolean"}}},t={args:{open:!0,onOpenChange:()=>{},title:"Account verwijderen",description:"Weet u zeker dat u uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",confirmLabel:"Verwijderen",onConfirm:async()=>{await new Promise(n=>setTimeout(n,1e3))}}},o={args:{open:!0,onOpenChange:()=>{},title:"Alle gegevens wissen",description:"Alle opgeslagen gegevens worden permanent verwijderd. Voer uw wachtwoord in ter bevestiging.",confirmLabel:"Alles wissen",requirePassword:!0,onConfirm:async n=>{if(n!=="test")throw new Error("Ongeldig wachtwoord")}}},a={args:{open:!0,onOpenChange:()=>{},title:"Backup overschrijven",description:"De bestaande backup wordt overschreven.",confirmLabel:"Overschrijven",cancelLabel:"Terug",onConfirm:async()=>{}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Account verwijderen",
    description: "Weet u zeker dat u uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
    confirmLabel: "Verwijderen",
    onConfirm: async () => {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Alle gegevens wissen",
    description: "Alle opgeslagen gegevens worden permanent verwijderd. Voer uw wachtwoord in ter bevestiging.",
    confirmLabel: "Alles wissen",
    requirePassword: true,
    onConfirm: async (password?: string) => {
      if (password !== "test") throw new Error("Ongeldig wachtwoord");
    }
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Backup overschrijven",
    description: "De bestaande backup wordt overschreven.",
    confirmLabel: "Overschrijven",
    cancelLabel: "Terug",
    onConfirm: async () => {}
  }
}`,...a.parameters?.docs?.source}}};const Z=["Default","WithPassword","CustomLabels"];export{a as CustomLabels,t as Default,o as WithPassword,Z as __namedExportsOrder,Y as default};
