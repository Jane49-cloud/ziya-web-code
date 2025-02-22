/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/LoanManagementPage.tsx

import { FC, useState } from "react";
import { Tabs, Pagination } from "antd";
import LoanCard from "../components/loanCard";
import LoanTable from "../components/loansTable";
import { useGetAllLoansQuery } from "../features/loanSlice";
import { Loan } from "../@types/common";

const LoanManagementPage: FC = () => {
  const { data, isLoading } = useGetAllLoansQuery({});
  const loans = data?.loans || [];

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Paginated loans for card view
  const paginatedLoans = loans?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Table View Tab */}
        <Tabs.TabPane tab="Loans" key="1">
          <LoanTable loans={loans} isLoading={isLoading} />
        </Tabs.TabPane>

        {/* Card View Tab with Pagination */}
        <Tabs.TabPane tab="Card View" key="2">
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              {paginatedLoans.map((loan: Loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>

            {/* Pagination Component */}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={loans.length}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default LoanManagementPage;
