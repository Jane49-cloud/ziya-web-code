interface Role {
  id: string;
  name: string;
  description: string;
  status?: string;
  date_created: string;
  date_updated: string;
  deleted_at?: string | null;
}

interface RoleFormDetails {
  name: string;
  description: string;
}
