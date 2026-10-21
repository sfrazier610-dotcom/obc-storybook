// Source: practice site (sites.google.com/view/openbooktherapist) + Psychology Today, per brief. null = not listed publicly -> CONFIRM.
window.OBC = {
 clinicians: [
  {id:"scott",name:"Scott Frazier",cred:"CMHC, CCTP",ages:["teen","adult"],formats:["individual","couples","family"],
   concerns:["trauma","anxiety","depression","eating","ocd","adhd","addiction","personality","highprofile","lgbtq"],
   mods:["ART","EMDR","CBT","EFT","Imago","SFBT"],style:"Direct, nonjudgmental, non-shame-based; LGBTQ+ affirming. Works with high-profile / high-stress clients.",
   award:"City Weekly Best of Utah 2026 — Best Experiential Therapist, 1st place"},
  {id:"amber",name:"Amber Frazier",cred:"CMHC",ages:["child","teen","adult"],formats:["individual","couples","family","child"],
   concerns:["trauma","abuse","anxiety","depression","attachment","addiction","dysregulation"],
   mods:["EMDR","ART","CBT","DBT","EFT","Play"],style:"Sex-positive and inclusive. Foster care and adoption experience.",
   award:"City Weekly Best of Utah 2026 — Best Psychotherapist/Counselor, 3rd place"},
  {id:"shanna",name:"Shanna Manjang",cred:"LCSW",ages:["child","teen","adult"],formats:["individual","family","child"],
   concerns:["trauma","autism","bodyimage","faith","eating","selfharm","chronic"],
   mods:["IFS","CBT","DBT","TF-CBT","SFBT"],style:"Trauma certificate (Simmons). Autism, body image, faith transitions, chronic illness."},
  {id:"amanda",name:"Amanda Lloyd",cred:"ACMHC",ages:null,formats:null,
   concerns:["grief","shame","family","faith","addiction","lgbtq"],
   mods:["EMDR","IFS","ACT","CBT","DBT"],style:"LGBTQ-informed. Grief, shame, family issues, transitioning beliefs, substance use."},
  {id:"aspen",name:"Aspen Johnson",cred:"ACMHC",ages:null,formats:["individual","couples"],
   concerns:["burnout","highprofile","trauma","anxiety","depression","addiction","relationships"],
   mods:["CBT","TF-CBT","DBT"],style:"For high-functioning but overwhelmed people: burnout, relationship patterns, moving from surviving to thriving."},
  {id:"abby",name:"Abby Locke",cred:"ACMHC",ages:null,formats:null,
   concerns:["transitions","relationships","trauma"],mods:[],style:"Tough transitions, rocky relationships, and trauma in a safe, nonjudgmental space."}
 ],
 concernLabels:{trauma:"Trauma / PTSD",abuse:"Abuse",anxiety:"Anxiety",depression:"Depression",addiction:"Addiction / substance use",eating:"Eating disorders",bodyimage:"Body image",relationships:"Relationship strain",burnout:"Burnout / overwhelmed",highprofile:"High-stress or high-visibility role",grief:"Grief",shame:"Shame",family:"Family conflict",faith:"Faith transitions / changing beliefs",lgbtq:"LGBTQ+ concerns",ocd:"OCD",adhd:"ADHD",personality:"BPD / NPD patterns",attachment:"Attachment, foster care, adoption",dysregulation:"Emotional dysregulation",autism:"Autism",selfharm:"Self-harm",chronic:"Chronic illness",transitions:"Life transitions"},
 modLabels:{EMDR:"EMDR",ART:"Accelerated Resolution Therapy",CBT:"CBT","TF-CBT":"Trauma-Focused CBT",DBT:"DBT",IFS:"Internal Family Systems",EFT:"Emotionally Focused Therapy",ACT:"ACT",Imago:"Imago",SFBT:"Solution-Focused",Play:"Play therapy"},
 insurance:["Aetna","BCBS","Cigna","EMI Health","Evernorth","MultiPlan","Optum","PEHP","Regence","Select Health (incl. Medicare)","UnitedHealthcare / UBH / UMR","UHC Global","Medicare","TriWest"],
 eap:["Intermountain EAP","Optum EAP","Lyra","Select Health EAP"],
 fees:{individual:150,couples:200,group:40}
};
