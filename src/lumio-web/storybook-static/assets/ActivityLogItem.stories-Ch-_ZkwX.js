import{j as e}from"./jsx-runtime-Cfjfh6m4.js";import{c as y}from"./utils-BQHNewu7.js";import{c as u}from"./createLucideIcon-sem_sh0Z.js";import{S as h}from"./shield-DL8sdY7P.js";import"./iframe-BZkGcvi5.js";import"./preload-helper-PPVm8Dsz.js";const j={info:"text-info bg-info-100",success:"text-success bg-success-100",warning:"text-warning bg-warning-100",danger:"text-danger bg-danger-100"};function k(w){const i=Date.now()-w.getTime(),o=Math.floor(i/1e3),s=Math.floor(o/60),r=Math.floor(s/60),t=Math.floor(r/24),n=new Intl.RelativeTimeFormat("nl",{numeric:"auto"});return t>0?n.format(-t,"day"):r>0?n.format(-r,"hour"):s>0?n.format(-s,"minute"):n.format(-o,"second")}function a({icon:w,action:v,timestamp:i,detail:o,severity:s="info",className:r}){const t=typeof i=="string"?new Date(i):i,n=k(t);return e.jsxs("div",{className:y("flex items-start gap-3 py-2",r),children:[e.jsx("div",{className:y("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",j[s]),children:e.jsx(w,{className:"h-4 w-4","aria-hidden":"true"})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-sm font-medium text-foreground",children:v}),o&&e.jsx("p",{className:"text-xs text-muted-foreground",children:o}),e.jsx("time",{className:"text-xs text-muted-foreground",dateTime:t.toISOString(),title:t.toLocaleString("nl-NL"),children:n})]})]})}a.__docgenInfo={description:"",methods:[],displayName:"ActivityLogItem",props:{icon:{required:!0,tsType:{name:"LucideIcon"},description:"Icon to display"},action:{required:!0,tsType:{name:"string"},description:"Main action description"},timestamp:{required:!0,tsType:{name:"union",raw:"Date | string",elements:[{name:"Date"},{name:"string"}]},description:"When the action occurred"},detail:{required:!1,tsType:{name:"string"},description:"Optional additional detail text"},severity:{required:!1,tsType:{name:"union",raw:'"info" | "success" | "warning" | "danger"',elements:[{name:"literal",value:'"info"'},{name:"literal",value:'"success"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"danger"'}]},description:"Optional severity for icon coloring",defaultValue:{value:'"info"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional className"}}};const I=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],M=u("file-text",I);const S=[["path",{d:"m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4",key:"g0fldk"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}]],D=u("key",S);const N=[["path",{d:"m10 17 5-5-5-5",key:"1bsop3"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}]],f=u("log-in",N);const A=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],x=u("trash-2",A),z={title:"Security/ActivityLogItem",component:a,tags:["autodocs"],argTypes:{severity:{control:"select",options:["info","success","warning","danger"]}}},c={args:{icon:f,action:"Ingelogd via wachtwoord",timestamp:new Date(Date.now()-300*1e3),severity:"info"}},d={args:{icon:h,action:"Wachtwoord succesvol gewijzigd",timestamp:new Date(Date.now()-7200*1e3),severity:"success"}},m={args:{icon:D,action:"Shamir sleutels opnieuw gegenereerd",timestamp:new Date(Date.now()-1440*60*1e3),severity:"warning",detail:"3 van 5 sleutels verdeeld"}},l={args:{icon:x,action:"Account verwijderingspoging",timestamp:new Date(Date.now()-4320*60*1e3),severity:"danger",detail:"Geblokkeerd — wachtwoord onjuist"}},g={args:{icon:M,action:"Document geüpload",timestamp:new Date(Date.now()-600*1e3),severity:"info",detail:"testament-scan.pdf (2.4 MB)"}},p={args:{icon:f,action:"Alle severities",timestamp:new Date},render:()=>e.jsxs("div",{className:"flex flex-col gap-2 w-full max-w-md",children:[e.jsx(a,{icon:f,action:"Ingelogd",timestamp:new Date(Date.now()-300*1e3),severity:"info"}),e.jsx(a,{icon:h,action:"Wachtwoord gewijzigd",timestamp:new Date(Date.now()-3600*1e3),severity:"success"}),e.jsx(a,{icon:D,action:"Nieuwe sleutels aangemaakt",timestamp:new Date(Date.now()-1440*60*1e3),severity:"warning"}),e.jsx(a,{icon:x,action:"Account verwijderingspoging",timestamp:new Date(Date.now()-10080*60*1e3),severity:"danger",detail:"Geblokkeerd"})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    icon: LogIn,
    action: "Ingelogd via wachtwoord",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: "info"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Shield,
    action: "Wachtwoord succesvol gewijzigd",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: "success"
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Key,
    action: "Shamir sleutels opnieuw gegenereerd",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: "warning",
    detail: "3 van 5 sleutels verdeeld"
  }
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Trash2,
    action: "Account verwijderingspoging",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    severity: "danger",
    detail: "Geblokkeerd — wachtwoord onjuist"
  }
}`,...l.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    icon: FileText,
    action: "Document geüpload",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    severity: "info",
    detail: "testament-scan.pdf (2.4 MB)"
  }
}`,...g.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    icon: LogIn,
    action: "Alle severities",
    timestamp: new Date()
  },
  render: () => <div className="flex flex-col gap-2 w-full max-w-md">\r
      <ActivityLogItem icon={LogIn} action="Ingelogd" timestamp={new Date(Date.now() - 5 * 60 * 1000)} severity="info" />\r
      <ActivityLogItem icon={Shield} action="Wachtwoord gewijzigd" timestamp={new Date(Date.now() - 60 * 60 * 1000)} severity="success" />\r
      <ActivityLogItem icon={Key} action="Nieuwe sleutels aangemaakt" timestamp={new Date(Date.now() - 24 * 60 * 60 * 1000)} severity="warning" />\r
      <ActivityLogItem icon={Trash2} action="Account verwijderingspoging" timestamp={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)} severity="danger" detail="Geblokkeerd" />\r
    </div>
}`,...p.parameters?.docs?.source}}};const H=["Info","Success","Warning","Danger","WithDetail","AllSeverities"];export{p as AllSeverities,l as Danger,c as Info,d as Success,m as Warning,g as WithDetail,H as __namedExportsOrder,z as default};
