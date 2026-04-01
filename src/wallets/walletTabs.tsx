/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Space, Tabs, Typography } from "antd";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import WalletSummaryCards from "./components/walletSummaryCards";
import GroupWalletsTab from "./pages/groupWalletsTab";
import PersonalWalletsTab from "./pages/personalWalletsTab";

// import WalletTransactionsTab from "./pages/groupTransactionsTab";
// import WalletDepositsTab from "../components/walletDepositsTab";

// import PersonalTransactionsTab from "./pages/personalTransactionsTab";
import {
    useGetGroupWalletsQuery,
    useGetPersonalWalletsQuery,
    // useGetAllGroupTransactionsQuery,


    // useGetAllCustomerTransactionsQuery
} from "./features";

const { Title, Text } = Typography;

const WalletTabs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") ?? "group-wallets";

    const { data: walletsResponse } = useGetGroupWalletsQuery({});
    const { data: personalWalletResponse } = useGetPersonalWalletsQuery({});

    const walletRows = useMemo(
        () => walletsResponse?.wallets ?? [],
        [walletsResponse?.wallets]
    );



    const personalWalletRows = useMemo(
        () => personalWalletResponse?.wallets ?? [],
        [personalWalletResponse?.wallets]
    );



    const summary = useMemo(() => {
        const totalGroupWallets = walletRows.length;
        const totalPersonalWallets = personalWalletRows.length;

        const totalBalance =
            [...walletRows, ...personalWalletRows].reduce(
                (sum: number, item: any) => sum + Number(item?.balance ?? 0),
                0
            );

        return {
            totalGroupWallets,
            totalPersonalWallets,
            totalBalance,
            // totalTransactions,
        };
    }, [walletRows, personalWalletRows]);



    const tabItems = [
        {
            key: "group-wallets",
            label: (
                <Space size={6}>
                    Group Wallets
                    <Badge count={summary.totalGroupWallets} showZero color="#2563eb" overflowCount={9999} />
                </Space>
            ),
            children: <GroupWalletsTab />,
        },
        {
            key: "personal-wallets",
            label: (
                <Space size={6}>
                    Personal Wallets
                    <Badge count={personalWalletRows.length} showZero color="#7c3aed" overflowCount={9999} />
                </Space>
            ),
            children: <PersonalWalletsTab />,
        },

    ];

    return (
        <div className="space-y-6 p-6">
            <div>
                <Title level={3} className="!mb-1">
                    Wallet Management
                </Title>
                <Text type="secondary">
                    Manage group and personal wallets at a glance.
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