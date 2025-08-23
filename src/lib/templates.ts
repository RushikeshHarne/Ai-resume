export const templates = [
  {
    id: "classic",
    name: "Classic",
    previewUrl: "https://placehold.co/400x560.png",
    content: `
# {{name}}
{{email}} | {{phone}} | {{linkedin}}

## Professional Summary
{{summary}}

## Skills
- {{skills}}

## Experience
{{#each experience}}
### {{title}} at {{company}}
**{{startDate}} - {{endDate}}**
- {{description}}
{{/each}}

## Education
{{#each education}}
### {{degree}}, {{institution}}
**{{graduationDate}}**
{{/each}}

## Projects
{{#each projects}}
### {{name}}
- {{description}}
{{/each}}
    `,
  },
  {
    id: "modern",
    name: "Modern",
    previewUrl: "https://placehold.co/400x560.png",
    content: `
# {{name}}
{{email}} | {{phone}} | {{linkedin}}

### SUMMARY
---
{{summary}}

### SKILLS
---
- {{skills}}

### PROFESSIONAL EXPERIENCE
---
{{#each experience}}
**{{title}}** | {{company}} | {{startDate}} - {{endDate}}
  - {{description}}
{{/each}}

### EDUCATION
---
{{#each education}}
**{{institution}}** - {{degree}}, {{graduationDate}}
{{/each}}

### PROJECTS
---
{{#each projects}}
**{{name}}**
  - {{description}}
{{/each}}
    `,
  },
  {
    id: "technical",
    name: "Technical",
    previewUrl: "https://placehold.co/400x560.png",
    content: `
# {{name}}
Contact: {{email}}, {{phone}}
LinkedIn: {{linkedin}}

## OVERVIEW
{{summary}}

## TECHNICAL SKILLS
- **Languages & Frameworks:** {{skills}}
- **Developer Tools:** (Git, Docker, Jenkins, etc.)
- **Libraries:** (React, Node.js, etc.)

## PROFESSIONAL EXPERIENCE
{{#each experience}}
### {{company}} - *{{title}}*
*{{startDate}} - {{endDate}}*
- {{description}}
{{/each}}

## PROJECTS
{{#each projects}}
### {{name}}
- {{description}}
{{/each}}

## EDUCATION
{{#each education}}
### {{institution}}
*{{degree}}*, graduated {{graduationDate}}
{{/each}}
    `,
  },
];
