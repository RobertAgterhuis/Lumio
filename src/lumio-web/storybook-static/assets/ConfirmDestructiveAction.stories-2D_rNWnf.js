import{C as t}from"./ConfirmDestructiveAction-B2dqDBBC.js";import"./jsx-runtime-D4KrBPkj.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Fj27Zx3k.js";import"./utils-BQHNewu7.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";import"./input-DocKjuCE.js";import"./label-DmNWg_6T.js";import"./alert-DAD2EhLd.js";import"./shield-C13dSADR.js";import"./triangle-alert-BVH98Qf5.js";import"./dialog-CmKZs74s.js";import"./shield-alert-CiYLILDg.js";const C={title:"Security/ConfirmDestructiveAction",component:t,tags:["autodocs"],parameters:{status:{type:"experimental"},governance:{maturity:"experimental",a11yLevel:"AA"}},argTypes:{open:{control:"boolean"},requirePassword:{control:"boolean"}}},e={args:{open:!0,onOpenChange:()=>{},title:"Account verwijderen",description:"Weet u zeker dat u uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",confirmLabel:"Verwijderen",onConfirm:async()=>{await new Promise(o=>setTimeout(o,1e3))}}},r={args:{open:!0,onOpenChange:()=>{},title:"Alle gegevens wissen",description:"Alle opgeslagen gegevens worden permanent verwijderd. Voer uw wachtwoord in ter bevestiging.",confirmLabel:"Alles wissen",requirePassword:!0,onConfirm:async o=>{if(o!=="test")throw new Error("Ongeldig wachtwoord")}}},n={args:{open:!0,onOpenChange:()=>{},title:"Backup overschrijven",description:"De bestaande backup wordt overschreven.",confirmLabel:"Overschrijven",cancelLabel:"Terug",onConfirm:async()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Backup overschrijven",
    description: "De bestaande backup wordt overschreven.",
    confirmLabel: "Overschrijven",
    cancelLabel: "Terug",
    onConfirm: async () => {}
  }
}`,...n.parameters?.docs?.source}}};const j=["Default","WithPassword","CustomLabels"];export{n as CustomLabels,e as Default,r as WithPassword,j as __namedExportsOrder,C as default};
