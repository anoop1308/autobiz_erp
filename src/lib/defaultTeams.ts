interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // Array of user IDs
}

export function createDefaultTeams(): Team[] {
  return [
    {
      id: 'management',
      name: 'Management Team',
      description: 'Executive and senior management team',
      members: []
    },
    {
      id: 'sales',
      name: 'Sales Team',
      description: 'Sales and business development team',
      members: []
    },
    {
      id: 'operations',
      name: 'Operations Team',
      description: 'Day-to-day operations team',
      members: []
    },
    {
      id: 'finance',
      name: 'Finance Team',
      description: 'Finance and accounting team',
      members: []
    }
  ];
}
