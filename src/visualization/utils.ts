import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
    GroupCreditHealthRow,
    LoanIssuedVsBorrowedPoint,
    RepaymentRateTrendPoint,
    ActiveBorrowersVsLoansPoint,
    SubscriptionLeakagePoint,
    SubscriptionLeakageByGroupPoint,
    GlobalBorrowerPenetrationTrendPoint,
} from "./types";

dayjs.extend(customParseFormat);

export type ChartRange = "6M" | "12M" | "YTD" | "ALL";

type WithMonthLabel = {
    month_label: string;
};

export const aggregateLoansIssuedVsBorrowedVolume = (
    rows: GroupCreditHealthRow[]
): LoanIssuedVsBorrowedPoint[] => {
    const grouped = new Map<string, LoanIssuedVsBorrowedPoint>();

    for (const row of rows) {
        const month = row.month_label?.trim();
        if (!month) continue;

        const existing = grouped.get(month);

        if (existing) {
            existing.loans_issued += Number(row.total_loans ?? 0);
            existing.borrowed_volume += Number(row.total_amount_borrowed ?? 0);
        } else {
            grouped.set(month, {
                month_label: month,
                loans_issued: Number(row.total_loans ?? 0),
                borrowed_volume: Number(row.total_amount_borrowed ?? 0),
            });
        }
    }

    return Array.from(grouped.values()).sort((a, b) => {
        const aDate = dayjs(a.month_label, "MMM YYYY", true);
        const bDate = dayjs(b.month_label, "MMM YYYY", true);
        return aDate.valueOf() - bDate.valueOf();
    });
};

export const aggregateAverageRepaymentRateTrend = (
    rows: GroupCreditHealthRow[]
): RepaymentRateTrendPoint[] => {
    const grouped = new Map<
        string,
        {
            month_label: string;
            total_repaid: number;
            total_borrowed: number;
        }
    >();

    for (const row of rows) {
        const month = row.month_label?.trim();
        if (!month) continue;

        const existing = grouped.get(month);

        if (existing) {
            existing.total_repaid += Number(row.total_amount_repaid ?? 0);
            existing.total_borrowed += Number(row.total_amount_borrowed ?? 0);
        } else {
            grouped.set(month, {
                month_label: month,
                total_repaid: Number(row.total_amount_repaid ?? 0),
                total_borrowed: Number(row.total_amount_borrowed ?? 0),
            });
        }
    }

    return Array.from(grouped.values())
        .map((item) => ({
            month_label: item.month_label,
            repayment_rate_pct:
                item.total_borrowed > 0
                    ? (item.total_repaid / item.total_borrowed) * 100
                    : 0,
        }))
        .sort((a, b) => {
            const aDate = dayjs(a.month_label, "MMM YYYY", true);
            const bDate = dayjs(b.month_label, "MMM YYYY", true);
            return aDate.valueOf() - bDate.valueOf();
        });
};

export const filterChartDataByRange = <T extends WithMonthLabel>(
    data: T[],
    range: ChartRange
): T[] => {
    if (range === "ALL") return data;
    if (!data.length) return data;

    const dated = data
        .map((item) => ({
            item,
            parsedMonth: dayjs(item.month_label, "MMM YYYY", true),
        }))
        .filter((entry) => entry.parsedMonth.isValid());

    if (!dated.length) return [];

    const latestMonth = dated[dated.length - 1].parsedMonth;

    if (range === "6M") {
        const start = latestMonth.subtract(5, "month").startOf("month");
        return dated
            .filter((entry) => !entry.parsedMonth.isBefore(start, "month"))
            .map((entry) => entry.item);
    }

    if (range === "12M") {
        const start = latestMonth.subtract(11, "month").startOf("month");
        return dated
            .filter((entry) => !entry.parsedMonth.isBefore(start, "month"))
            .map((entry) => entry.item);
    }

    if (range === "YTD") {
        const start = latestMonth.startOf("year");
        return dated
            .filter((entry) => !entry.parsedMonth.isBefore(start, "month"))
            .map((entry) => entry.item);
    }

    return data;
};

export const filterChartDataByMonth = <T extends WithMonthLabel>(
    data: T[],
    selectedMonth: string | null
): T[] => {
    if (!selectedMonth) return data;
    return data.filter((item) => item.month_label === selectedMonth);
};

export const getAvailableMonths = <T extends WithMonthLabel>(
    data: T[]
): { label: string; value: string }[] => {
    return data.map((item) => ({
        label: item.month_label,
        value: item.month_label,
    }));
};

export const buildActiveBorrowersVsLoansSeries = (
    rows: GroupCreditHealthRow[]
): ActiveBorrowersVsLoansPoint[] => {
    const grouped = new Map<string, ActiveBorrowersVsLoansPoint>();

    for (const row of rows) {
        const month = row.month_label?.trim();
        if (!month) continue;

        const existing = grouped.get(month);

        if (existing) {
            existing.total_loans += Number(row.total_loans ?? 0);
            existing.active_borrowers += Number(row.active_borrowers ?? 0);
        } else {
            grouped.set(month, {
                month_label: month,
                total_loans: Number(row.total_loans ?? 0),
                active_borrowers: Number(row.active_borrowers ?? 0),
            });
        }
    }

    return Array.from(grouped.values()).sort((a, b) => {
        const aDate = dayjs(a.month_label, "MMM YYYY", true);
        const bDate = dayjs(b.month_label, "MMM YYYY", true);
        return aDate.valueOf() - bDate.valueOf();
    });
};

//subscription
export const getLatestMonthLabel = <T extends { month_label: string }>(
    data: T[]
): string | null => {
    if (!data.length) return null;

    const sorted = [...data].sort((a, b) => {
        const aDate = dayjs(a.month_label, "MMM YYYY", true);
        const bDate = dayjs(b.month_label, "MMM YYYY", true);
        return aDate.valueOf() - bDate.valueOf();
    });

    return sorted[sorted.length - 1]?.month_label ?? null;
};

export const aggregateSubscriptionLeakageMonthly = (
    rows: GroupCreditHealthRow[]
): SubscriptionLeakagePoint[] => {
    const grouped = new Map<
        string,
        {
            month_label: string;
            collected_amount: number;
            missed_amount: number;
        }
    >();

    for (const row of rows) {
        const month = row.month_label?.trim();
        if (!month) continue;

        const existing = grouped.get(month);

        if (existing) {
            existing.collected_amount += Number(row.total_subscription_amount ?? 0);
            existing.missed_amount += Number(row.missed_subscriptions_amount ?? 0);
        } else {
            grouped.set(month, {
                month_label: month,
                collected_amount: Number(row.total_subscription_amount ?? 0),
                missed_amount: Number(row.missed_subscriptions_amount ?? 0),
            });
        }
    }

    return Array.from(grouped.values())
        .map((item) => {
            const total = item.collected_amount + item.missed_amount;

            return {
                month_label: item.month_label,
                collected_amount: item.collected_amount,
                missed_amount: item.missed_amount,
                collected_pct: total > 0 ? (item.collected_amount / total) * 100 : 0,
                missed_pct: total > 0 ? (item.missed_amount / total) * 100 : 0,
            };
        })
        .sort((a, b) => {
            const aDate = dayjs(a.month_label, "MMM YYYY", true);
            const bDate = dayjs(b.month_label, "MMM YYYY", true);
            return aDate.valueOf() - bDate.valueOf();
        });
};

export const aggregateSubscriptionLeakageByGroupForMonth = (
    rows: GroupCreditHealthRow[],
    monthLabel: string
): SubscriptionLeakageByGroupPoint[] => {
    const grouped = new Map<
        string,
        {
            group_name: string;
            collected_amount: number;
            missed_amount: number;
        }
    >();

    for (const row of rows) {
        if (row.month_label !== monthLabel) continue;

        const groupName = row.group_name?.trim() || `Group ${row.group_id}`;

        const existing = grouped.get(groupName);

        if (existing) {
            existing.collected_amount += Number(row.total_subscription_amount ?? 0);
            existing.missed_amount += Number(row.missed_subscriptions_amount ?? 0);
        } else {
            grouped.set(groupName, {
                group_name: groupName,
                collected_amount: Number(row.total_subscription_amount ?? 0),
                missed_amount: Number(row.missed_subscriptions_amount ?? 0),
            });
        }
    }

    return Array.from(grouped.values())
        .map((item) => {
            const total = item.collected_amount + item.missed_amount;

            return {
                group_name: item.group_name,
                collected_amount: item.collected_amount,
                missed_amount: item.missed_amount,
                collected_pct: total > 0 ? (item.collected_amount / total) * 100 : 0,
                missed_pct: total > 0 ? (item.missed_amount / total) * 100 : 0,
            };
        })
        .sort((a, b) => b.missed_amount - a.missed_amount);
};


export const aggregateGlobalBorrowerPenetrationTrend = (
    rows: GroupCreditHealthRow[]
): GlobalBorrowerPenetrationTrendPoint[] => {
    const grouped = new Map<
        string,
        {
            month_label: string;
            active_borrowers: number;
            total_members: number;
        }
    >();

    for (const row of rows) {
        const month = row.month_label?.trim();
        if (!month) continue;

        const existing = grouped.get(month);

        if (existing) {
            existing.active_borrowers += Number(row.active_borrowers ?? 0);
            existing.total_members += Number(row.total_members ?? 0);
        } else {
            grouped.set(month, {
                month_label: month,
                active_borrowers: Number(row.active_borrowers ?? 0),
                total_members: Number(row.total_members ?? 0),
            });
        }
    }

    return Array.from(grouped.values())
        .map((item) => ({
            month_label: item.month_label,
            active_borrowers: item.active_borrowers,
            total_members: item.total_members,
            borrower_penetration_pct:
                item.total_members > 0
                    ? (item.active_borrowers / item.total_members) * 100
                    : 0,
        }))
        .sort((a, b) => {
            const aDate = dayjs(a.month_label, "MMM YYYY", true);
            const bDate = dayjs(b.month_label, "MMM YYYY", true);
            return aDate.valueOf() - bDate.valueOf();
        });
};

//Ranking

