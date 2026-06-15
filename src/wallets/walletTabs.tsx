/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography } from "antd";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

import WalletSummaryCards from "./components/walletSummaryCards";
import {
    useGetGroupWalletsQuery,
    useGetPersonalWalletsQuery,
} from "./features";

const { Title, Text } = Typography;

const SHOW_WALLET_SUMMARY = false;

const WalletTabs = () => {
    const location = useLocation();

    const isPersonalWalletPage =
        location.pathname.includes("/wallets/personal");

    const isPartnerWalletPage =
        location.pathname.includes("/wallets/partners");

    const pageDetails = isPartnerWalletPage
        ? {
              title: "Partner Wallets",
              description:
                  "View partner wallet balances, assets and loan summaries.",
          }
        : isPersonalWalletPage
          ? {
                title: "Personal Wallets",
                description: "Manage personal wallets at a glance.",
            }
          : {
                title: "Group Wallets",
                description: "Manage group wallets at a glance.",
            };

    const { data: walletsResponse } = useGetGroupWalletsQuery(
        {},
        { skip: !SHOW_WALLET_SUMMARY }
    );

    const { data: personalWalletResponse } = useGetPersonalWalletsQuery(
        {},
        { skip: !SHOW_WALLET_SUMMARY }
    );

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

        const totalBalance = [...walletRows, ...personalWalletRows].reduce(
            (sum: number, item: any) =>
                sum + Number(item?.balance ?? item?.cash_balance ?? 0),
            0
        );

        return {
            totalGroupWallets,
            totalPersonalWallets,
            totalBalance,
        };
    }, [walletRows, personalWalletRows]);

    return (
        <div className="space-y-6 p-6">
            <div>
                <Title level={3} className="!mb-1">
                    {pageDetails.title}
                </Title>

                <Text type="secondary">{pageDetails.description}</Text>
            </div>

            {SHOW_WALLET_SUMMARY && (
                <WalletSummaryCards summary={summary} />
            )}

            <Outlet />
        </div>
    );
};

export default WalletTabs;