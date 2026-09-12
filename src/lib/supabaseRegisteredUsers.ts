export type RegisteredUser = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};

export async function fetchRegisteredUsers(): Promise<{ data: RegisteredUser[] | null; error: string | null }> {
  try {
    const res = await fetch("/api/admin/list-registered-users");
    const body = await res.json();

    if (!res.ok || body.error) {
      return { data: null, error: body.error || "Could not load registered members." };
    }

    return { data: body.users as RegisteredUser[], error: null };
  } catch {
    return { data: null, error: "Could not reach the server. Please try again." };
  }
}
