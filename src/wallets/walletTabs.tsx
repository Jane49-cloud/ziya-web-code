/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Space, Tabs, Typography } from "antd";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
// import { FiCreditCard, FiArrowLeft, FiDownload } from "react-icons/fi";

import WalletSummaryCards from "./components/walletSummaryCards";
import GroupWalletsTab from "./pages/groupWalletsTab";
import WalletTransactionsTab from "./pages/walletTransactionsTab";
// import WalletDepositsTab from "../components/walletDepositsTab";
import {
    useGetGroupWalletsQuery,
    useGetAllGroupTransactionsQuery
} from "./features";

const { Title, Text } = Typography;

const WalletTabs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") ?? "group-wallets";

    const { data: walletsResponse } = useGetGroupWalletsQuery({});
    const { data: transactionsResponse } = useGetAllGroupTransactionsQuery({});

    const walletRows = useMemo(
        () => walletsResponse?.wallets ?? [],
        [walletsResponse?.wallets]
    );

    const transactionRows = useMemo(
        () => transactionsResponse?.transactions ?? [],
        [transactionsResponse?.transactions]
    );

    const summary = useMemo(() => {
        const totalWallets = walletRows.length;
        const totalBalance = walletRows.reduce(
            (sum: number, item: any) => sum + Number(item?.balance ?? 0),
            0
        );
        const totalTransactions = transactionRows.length;

        return {
            totalWallets,
            totalBalance,
            totalTransactions,
        };
    }, [walletRows, transactionRows]);

    const tabItems = [
        {
            key: "group-wallets",
            label: (
                <Space size={6}>
                    Group Wallets
                    <Badge count={summary.totalWallets} showZero color="#2563eb" overflowCount={9999} />
                </Space>
            ),
            children: <GroupWalletsTab />,
        },
        {
            key: "transactions",
            label: (
                <Space size={6}>
                    Transactions
                    <Badge count={summary.totalTransactions} showZero color="#10b981" overflowCount={9999} />
                </Space>
            ),
            children: <WalletTransactionsTab />,
        },
        // {
        //     key: "deposits",
        //     label: (
        //         <Space size={6}>
        //             Deposit
        //             <FiDownload />
        //         </Space>
        //     ),
        //     children: <WalletDepositsTab />,
        // },
    ];

    return (
        <div className="space-y-6 p-6">
            <div>
                <Title level={3} className="!mb-1">
                    Wallet Management
                </Title>
                <Text type="secondary">
                    Manage group wallets, transaction activity, and deposits at a glance.
                </Text>
            </div>

            <WalletSummaryCards summary={summary} />

            <Tabs
                activeKey={activeTab}
                onChange={(key) => setSearchParams({ tab: key }, { replace: true })}
                items={tabItems}
                type="card"
                size="large"
                tabBarGutter={12}
                className="[&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:py-2
                   [&_.ant-tabs-tab-active]:bg-white [&_.ant-tabs-nav]:mb-0"
            />
        </div>
    );
}





export default WalletTabs;