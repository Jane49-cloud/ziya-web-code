import {
    Button,
    Col,
    Row,
    Space,
    Typography,
} from "antd";

const { Text } = Typography;

type TabPaginationProps = {
    page: number;
    pageSize: number;
    recordCount: number;
    loading: boolean;
    onPageChange: (page: number) => void;
};

const TabPagination = ({
    page,
    pageSize,
    recordCount,
    loading,
    onPageChange,
}: TabPaginationProps) => {
    if (recordCount === 0 && page === 0) {
        return null;
    }

    return (
        <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{ marginTop: 16 }}
        >
            <Col>
                <Text type="secondary">
                    Page {page + 1}
                </Text>
            </Col>

            <Col>
                <Space>
                    <Button
                        disabled={loading || page === 0}
                        onClick={() =>
                            onPageChange(page - 1)
                        }
                    >
                        Previous
                    </Button>

                    <Button
                        type="primary"
                        disabled={
                            loading ||
                            recordCount < pageSize
                        }
                        onClick={() =>
                            onPageChange(page + 1)
                        }
                    >
                        Next
                    </Button>
                </Space>
            </Col>
        </Row>
    );
};

export default TabPagination;