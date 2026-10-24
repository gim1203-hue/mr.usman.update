export const categories = ['Foundation', 'Structural', 'Exterior', 'Interior'];
export const emptyProject = { description: '', location: '', propertyType: 'Residential', timeline: '', budget: '', name: '', email: '', phone: '' };
export function recommend(description = '') {
  const rules = [
    ['Foundation', /\b(basement|foundation|footing|underpinning|crawl.?space|sump|excavat|drainage)\w*/i],
    ['Structural', /\b(beam|column|joist|load.bearing|framing|lintel|structural|sagging)\w*/i],
    ['Exterior', /\b(roof|gutter|siding|deck|brick|pointing|stucco|paver|sidewalk|concrete|exterior|waterproof)\w*/i],
    ['Interior', /\b(kitchen|bathroom|paint|floor|tile|plaster|interior|remodel|cabinet)\w*/i],
  ];
  return rules.filter(([, pattern]) => pattern.test(description)).map(([name]) => name);
}
export function summaryText(project, photos = []) {
  return ['NEW PRIME - ESTIMATE REQUEST', '',
    ...Object.entries({ Name: project.name, Email: project.email, Phone: project.phone, Location: project.location, Property: project.propertyType, Timeline: project.timeline, Budget: project.budget, Description: project.description }).map(([k,v]) => `${k}: ${v || 'Not supplied'}`),
    `Suggested services (text matching): ${recommend(project.description).join(', ') || 'Team review needed'}`,
    `Photos: ${photos.map(p => p.name).join(', ') || 'None'}`, '',
    'Photos must be attached separately when sending by email. This is a request for review, not a price quote.'
  ].join('\n');
}
