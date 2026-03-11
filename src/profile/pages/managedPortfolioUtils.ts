/* eslint-disable @typescript-eslint/no-explicit-any */
export type ManagedCustomer = {
  id: string | number;
  fullName: string;
  phone?: string;
  subscriptionStatus?: number | null;
  groupName?: string;
};

const pickMemberCollection = (group: any): any[] => {
  const candidates = [
    group?.members,
    group?.group_members,
    group?.groupMembers,
    group?.memberships,
  ];

  return (candidates.find((candidate) => Array.isArray(candidate)) as any[]) ?? [];
};

const resolveMemberCandidate = (raw: any) =>
  raw?.member ??
  raw?.customer ??
  raw?.customerData ??
  raw?.customer_details ??
  raw;

export const extractManagedCustomers = (
  groups: any[]
): ManagedCustomer[] => {
  const deduped = new Map<string | number, ManagedCustomer>();

  groups.forEach((group) => {
    const members = pickMemberCollection(group);

    members.forEach((rawMember: any) => {
      const candidate = resolveMemberCandidate(rawMember);
      const memberId =
        candidate?.id ?? rawMember?.member_id ?? rawMember?.customer_id;

      if (!memberId || deduped.has(memberId)) {
        return;
      }

      const rawFirst =
        candidate?.firstname ?? candidate?.first_name ?? candidate?.name ?? "";
      const rawLast = candidate?.lastname ?? candidate?.last_name ?? "";
      const fullName = `${rawFirst} ${rawLast}`.trim() ||
        candidate?.name ||
        "Unnamed Customer";

      deduped.set(memberId, {
        id: memberId,
        fullName,
        phone: candidate?.phone_number ?? candidate?.phone ?? "",
        subscriptionStatus:
          typeof candidate?.subscription_status === "number"
            ? candidate.subscription_status
            : typeof candidate?.subscriptionStatus === "number"
            ? candidate.subscriptionStatus
            : null,
        groupName: group?.name,
      });
    });
  });

  return Array.from(deduped.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );
};

const getDeclaredMemberCount = (group: any) => {
  const possibleCounts = [
    group?.member_count,
    group?.members_count,
    group?.membersCount,
    group?.total_members,
    group?.totalMembers,
  ];

  for (const value of possibleCounts) {
    if (typeof value === "number") {
      return value;
    }
  }

  return pickMemberCollection(group).length;
};

export const buildPortfolioSummary = (
  customers: ManagedCustomer[],
  groups: any[]
) => {
  if (!groups.length) {
    return {
      totalGroups: 0,
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      totalMembers: 0,
      averageMemberCount: 0,
    };
  }

  const totalGroups = groups.length;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.subscriptionStatus === 1
  ).length;
  const inactiveCustomers = totalCustomers - activeCustomers;

  const memberTotals = groups.reduce((accumulator, group) => {
    const declared = getDeclaredMemberCount(group);
    return accumulator + (typeof declared === "number" ? declared : 0);
  }, 0);

  return {
    totalGroups,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    totalMembers: memberTotals,
    averageMemberCount:
      totalGroups > 0 ? Math.round(memberTotals / totalGroups) : 0,
  };
};
