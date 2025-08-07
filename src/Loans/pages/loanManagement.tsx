/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/LoanManagementPage.tsx

import { FC, useState } from "react";
import { Tabs, Pagination } from "antd";
import LoanCard from "../components/loanCard";
import LoanTable, { GroupLoan } from "../components/loansTable";
import { useGetAllGroupLoansQuery } from "../features/loanSlice";

const LoanManagementPage: FC = () => {
  const { data, isLoading } = useGetAllGroupLoansQuery({});
  const loans = data?.loans || [];
  console.log(loans, "loans data from query");

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
          <LoanTable data={data?.loans || []} isLoading={isLoading} />
        </Tabs.TabPane>

        {/* Card View Tab with Pagination */}
        <Tabs.TabPane tab="Card View" key="2">
          <div style={{ marginTop: 16 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 ">
              {paginatedLoans.map((loan: GroupLoan) => (
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
