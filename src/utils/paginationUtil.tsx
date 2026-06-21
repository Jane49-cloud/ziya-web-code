import { Pagination } from "antd";

type TabPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    loading?: boolean;
    itemName?: string;
    onPaginationChange: (
        page: number,
        pageSize: number,
    ) => void;
};

const TabPagination = ({
    page,
    pageSize,
    total,
    loading = false,
    onPaginationChange,
}: TabPaginationProps) => {
    if (total === 0 && page === 0) {
        return null;
    }

    return (
        <Pagination
            current={page + 1}
            pageSize={pageSize}
            total={total}
            disabled={loading}
            showSizeChanger
            pageSizeOptions={["5", "10", "20", "50"]}
            showTotal={(recordTotal, range) =>
                `${range[0]}-${range[1]} of ${recordTotal}`
            }
            onChange={(nextPage, nextPageSize) => {
                const pageSizeChanged =
                    nextPageSize !== pageSize;

                onPaginationChange(
                    pageSizeChanged ? 0 : nextPage - 1,
                    nextPageSize,
                );
            }}
            style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
            }}
        />
    );
};

export default TabPagination;