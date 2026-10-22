// Source: practice site (sites.google.com/view/openbooktherapist) + Psychology Today, per brief. null = not listed publicly -> CONFIRM.
// Ages: "under8" = child under 8 (only if explicitly confirmed), "child8" = child 8–12, "teen", "adult". null = not publicly listed. settings: "inperson"/"telehealth" (confirmed by Scott Oct 21 2026; office per clinician not confirmed). agesPending = only children (incl. under 8) confirmed by Scott, Oct 21 2026; teen/adult still to confirm.
window.OBC = {
 clinicians: [
  {id:"scott",name:"Scott Frazier",cred:"CMHC, CCTP",ages:["child8","teen","adult"],agesLabel:"Ages 8+",formats:["individual","couples","family"],settings:["inperson","telehealth"],
   concerns:["trauma","anxiety","depression","eating","ocd","adhd","addiction","personality","highprofile","lgbtq"],
   mods:["ART","EMDR","CBT","DBT","EFT","IFS","Imago","SFBT"],style:"Direct, nonjudgmental, non-shame-based; LGBTQ+ affirming. Works with high-profile / high-stress clients.",
   card:"Scott Frazier, CMHC, CCTP, is a Licensed Clinical Mental Health Counselor who works with children 8+, teens, adults and couples on trauma, PTSD, depression, anxiety and relationships. He uses ART, EMDR, CBT, DBT, EFT and Imago in a direct, nonjudgmental, non-shame-based style.",
   bio:"Scott Frazier, CMHC, CCTP, is a Licensed Clinical Mental Health Counselor and the co-founder of Open Book Counseling, City Weekly's Best of Utah two years running. For more than 25 years, he has worked in forensic counseling, residential treatment, and clinical leadership, including as Program Manager at Sierra Tucson, where he was named Employee of the Year in 2019 for strengthening suicide-prevention and client-safety systems. Earlier, he designed a juvenile re-entry program recognized by the Federal Bureau of Prisons as a best practice. Today, Scott helps children (8+), teens, adults, and couples heal from trauma, PTSD, depression, anxiety, addiction, eating disorders, and relationship strain, including clients in high-visibility roles who need discreet care. He's direct, honest, and non-shame-based, and draws on ART, EMDR, CBT, DBT, EFT, IFS, and Imago. He also mentors and supervises clinicians. He holds a master's in Community Counseling from the University of Phoenix and sees clients in Draper, Bountiful, and online.",
   award:"City Weekly Best of Utah 2026 — Best Experiential Therapist, 1st place"},
  {id:"amber",name:"Amber Frazier",cred:"CMHC",ages:["under8","child8","teen","adult"],formats:["individual","couples","family","child"],settings:["inperson","telehealth"],
   concerns:["trauma","abuse","anxiety","depression","attachment","addiction","dysregulation"],
   mods:["EMDR","ART","CBT","DBT","EFT","Play"],style:"Sex-positive and inclusive. Foster care and adoption experience.",
   award:"City Weekly Best of Utah 2026 — Best Psychotherapist/Counselor, 3rd place"},
  {id:"shanna",name:"Shanna Manjang",cred:"LCSW",ages:["child8","teen","adult"],formats:["individual","couples","family","child"],settings:["inperson","telehealth"],
   concerns:["trauma","autism","bodyimage","faith","eating","selfharm","chronic"],
   mods:["IFS","CBT","DBT","TF-CBT","SFBT"],style:"Trauma certificate (Simmons). Autism, body image, faith transitions, chronic illness."},
  {id:"amanda",name:"Amanda Lloyd",cred:"ACMHC",ages:["under8","child8","teen"],agesPending:true,formats:["individual","couples","family"],settings:["telehealth"],
   concerns:["grief","shame","family","faith","addiction","lgbtq"],
   mods:["EMDR","IFS","ACT","CBT","DBT"],style:"LGBTQ-informed. Grief, shame, family issues, transitioning beliefs, substance use."},
  {id:"aspen",name:"Aspen Johnson",cred:"ACMHC",ages:["under8","child8","teen"],agesPending:true,formats:["individual","couples","family"],settings:["inperson","telehealth"],
   concerns:["burnout","highprofile","trauma","anxiety","depression","addiction","relationships"],
   mods:["CBT","TF-CBT","DBT"],style:"For high-functioning but overwhelmed people: burnout, relationship patterns, moving from surviving to thriving."},
  {id:"abby",name:"Abby Locke",cred:"ACMHC",ages:["under8","child8","teen"],agesPending:true,formats:["individual","couples","family"],settings:["inperson","telehealth"],
   concerns:["transitions","relationships","trauma"],mods:[],style:"Tough transitions, rocky relationships, and trauma in a safe, nonjudgmental space."}
 ],
 concernLabels:{trauma:"Trauma / PTSD",abuse:"Abuse",anxiety:"Anxiety",depression:"Depression",addiction:"Addiction / substance use",eating:"Eating disorders",bodyimage:"Body image",relationships:"Relationship strain",burnout:"Burnout / overwhelmed",highprofile:"High-stress or high-visibility role",grief:"Grief",shame:"Shame",family:"Family conflict",faith:"Faith transitions / changing beliefs",lgbtq:"LGBTQ+ concerns",ocd:"OCD",adhd:"ADHD",personality:"BPD / NPD patterns",attachment:"Attachment, foster care, adoption",dysregulation:"Emotional dysregulation",autism:"Autism",selfharm:"Self-harm",chronic:"Chronic illness",transitions:"Life transitions"},
 modLabels:{EMDR:"EMDR",ART:"Accelerated Resolution Therapy",CBT:"CBT","TF-CBT":"Trauma-Focused CBT",DBT:"DBT",IFS:"Internal Family Systems",EFT:"Emotionally Focused Therapy",ACT:"ACT",Imago:"Imago",SFBT:"Solution-Focused",Play:"Play therapy"},
 insurance:["Aetna","BCBS","Cigna","EMI Health","Evernorth","MultiPlan","Optum","PEHP","Regence","Select Health (incl. Medicare)","UnitedHealthcare / UBH / UMR","UHC Global","Medicare","TriWest"],
 eap:["Intermountain EAP","Optum EAP","Lyra","Select Health EAP"],
 fees:{individual:150,couples:200,group:40}
};
