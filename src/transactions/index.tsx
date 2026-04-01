/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";

import TransactionSummaryCards from "./components/transactionSummaryCards";
import {
    useGetAllGroupTransactionsQuery,
    useGetAllCustomerTransactionsQuery,
} from "./features";

const { Title, Text } = Typography;

const TransactionsIndex = () => {
    const location = useLocation();

    const { data: groupResponse } = useGetAllGroupTransactionsQuery({});
    const { data: personalResponse } = useGetAllCustomerTransactionsQuery({});

    const groupRows = useMemo(
        () => groupResponse?.transactions ?? [],
        [groupResponse?.transactions]
    );

    const personalRows = useMemo(
        () => personalResponse?.transactions ?? [],
        [personalResponse?.transactions]
    );

    const summary = useMemo(() => {
        const totalGroupTransactions = groupRows.length;
        const totalPersonalTransactions = personalRows.length;

        const totalTransactionValue =
            [...groupRows, ...personalRows].reduce(
                (sum: number, item: any) => sum + Math.abs(Number(item?.amount ?? 0)),
                0
            );

        return {
            totalGroupTransactions,
            totalPersonalTransactions,
            totalTransactionValue,
        };
    }, [groupRows, personalRows]);

    const isGroup = location.pathname.includes("group-transactions");

    return (
        <div className="space-y-6 p-6">
            <div>
                <Title level={3} className="!mb-1">
                    Transactions
                </Title>
                <Text type="secondary">
                    Monitor group and personal wallet transaction activity at a glance.
                </Text>
            </div>

            <TransactionSummaryCards summary={summary} />

            <div className="rounded-xl bg-white shadow-sm">
                <Outlet context={{ isGroup }} />
            </div>
        </div>
    );
};

export default TransactionsIndex;