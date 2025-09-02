export const STAKEHOLDER_DATA = {
  stakeholder: [
    { id: '1', name: 'Senior Citizen', description: 'Elderly residents of the ward' },
    { id: '2', name: 'Business Owner', description: 'Owners of local businesses and shops' },
    { id: '3', name: 'Civic Official', description: 'Government and municipal officials' },
    { id: '4', name: 'Student', description: 'Students residing or studying in the ward' },
    { id: '5', name: 'Person with Disability', description: 'Residents with physical or mental disabilities' },
    { id: '6', name: 'Resident', description: 'General residents of the ward' },
    { id: '7', name: 'Street Vendor', description: 'Local street vendors and hawkers' },
    { id: '8', name: 'Volunteer', description: 'Community volunteers and activists' },
    { id: '9', name: 'Educator', description: 'Teachers and education professionals' },
    { id: '10', name: 'Healthcare Worker', description: 'Medical professionals and health workers' },
    { id: '11', name: 'Urbanist', description: 'Urban planners and development professionals' }
  ]
};

export const StakeholderService = {
  getStakeholder: () => STAKEHOLDER_DATA.stakeholder,

  getStakeholderById: (id) =>
    STAKEHOLDER_DATA.stakeholder.find(s => s.id === id)
};