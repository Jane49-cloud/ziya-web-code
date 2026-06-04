import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import {
    Button,
    Divider,
    Form,
    Input,
    Select,
    Space,
    Spin,
    Typography,
    message,
} from "antd";

import { useCreateSaccoMutation } from "../features";
import {
    useLazyGetAllCustomersQuery,
    useLazySearchCustomersQuery,
} from "../../customer/features/customerSlice";
import { formatFullName, formatName } from "../../utils";

const { Title, Text } = Typography;

const CUSTOMER_BATCH_SIZE = 20;
const INITIAL_CUSTOMER_PAGE = 1;

type CreateSaccoFormValues = {
    saccoName: string;
    location: string;
    chairPerson: number;
};

type CreateSaccoTabProps = {
    onCancel: () => void;
    onCreated: () => void;
};

type CustomerRow = {
    id: number;
    firstname?: string;
    lastname?: string;
    country_code?: string;
    phone_number?: string;
    identification_number?: string;
    group_name?: string;
    status?: number;
    last_login?: string;
};

const getCustomerRows = (data: any): CustomerRow[] => {
    if (Array.isArray(data)) return data;

    const rows =
        data?.customers ??
        data?.data ??
        data?.results ??
        data?.items ??
        [];

    return Array.isArray(rows) ? rows : [];
};

const getCustomerName = (customer: CustomerRow) => {
    return (
        formatFullName(customer.firstname, customer.lastname, "") ||
        formatName(`${customer.firstname ?? ""} ${customer.lastname ?? ""}`.trim()) ||
        "Unnamed Customer"
    );
};

const getCustomerPhone = (customer: CustomerRow) => {
    const countryCode = customer.country_code ?? "";
    const phoneNumber = customer.phone_number ?? "";

    return `${countryCode}${phoneNumber}`.trim();
};

const mergeCustomerRows = (rows: CustomerRow[]) => {
    const map = new Map<number, CustomerRow>();

    rows.forEach((row) => {
        if (row.id !== undefined && row.id !== null) {
            map.set(row.id, row);
        }
    });

    return Array.from(map.values());
};

const CreateSaccoTab = ({ onCancel, onCreated }: CreateSaccoTabProps) => {
    const [form] = Form.useForm<CreateSaccoFormValues>();
    const [messageApi, contextHolder] = message.useMessage();

    const [customers, setCustomers] = useState<CustomerRow[]>([]);
    const [customerPage, setCustomerPage] = useState(INITIAL_CUSTOMER_PAGE - 1);
    const [hasMoreCustomers, setHasMoreCustomers] = useState<boolean>(true);
    const [customerSearch, setCustomerSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [createSacco, { isLoading: isCreating }] = useCreateSaccoMutation();

    const [fetchCustomers, { isFetching: isFetchingCustomers }] =
        useLazyGetAllCustomersQuery();

    const [searchCustomers, { isFetching: isSearchingCustomers }] =
        useLazySearchCustomersQuery();

    const isLoadingCustomers = isFetchingCustomers || isSearchingCustomers;

    const loadCustomerBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            try {
                const response = await fetchCustomers({
                    page: pageToLoad,
                    page_size: CUSTOMER_BATCH_SIZE,
                }).unwrap();

                const newRows = getCustomerRows(response);

                setCustomers((previousRows) => {
                    const baseRows = reset ? [] : previousRows;
                    return mergeCustomerRows([...baseRows, ...newRows]);
                });

                setCustomerPage(pageToLoad);
                setHasMoreCustomers(newRows.length === CUSTOMER_BATCH_SIZE);
            } catch (error) {
                messageApi.error("Failed to load customers.");
            }
        },
        [fetchCustomers, messageApi]
    );

    const handleSearchCustomers = useCallback(
        (value: string) => {
            setCustomerSearch(value);

            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }

            searchTimerRef.current = setTimeout(async () => {
                const term = value.trim();

                if (!term) {
                    setCustomerPage(INITIAL_CUSTOMER_PAGE - 1);
                    setHasMoreCustomers(true);
                    await loadCustomerBatch(INITIAL_CUSTOMER_PAGE, true);
                    return;
                }

                try {
                    const response = await searchCustomers({ q: term }).unwrap();

                    setCustomers(mergeCustomerRows(response));
                    setHasMoreCustomers(false);
                } catch (error) {
                    messageApi.error("Failed to search customers.");
                }
            }, 450);
        },
        [loadCustomerBatch, messageApi, searchCustomers]
    );

    const handleLoadMoreCustomers = useCallback(async () => {
        if (isLoadingCustomers || !hasMoreCustomers || customerSearch.trim()) return;

        await loadCustomerBatch(customerPage + 1);
    }, [
        customerPage,
        customerSearch,
        hasMoreCustomers,
        isLoadingCustomers,
        loadCustomerBatch,
    ]);

    const handleDropdownScroll = async (event: UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;

        const isNearBottom =
            target.scrollTop + target.offsetHeight >= target.scrollHeight - 40;

        if (isNearBottom) {
            await handleLoadMoreCustomers();
        }
    };

    useEffect(() => {
        if (!isDropdownOpen) return;

        if (customers.length === 0 && !customerSearch.trim()) {
            void loadCustomerBatch(INITIAL_CUSTOMER_PAGE, true);
        }
    }, [
        customers.length,
        customerSearch,
        isDropdownOpen,
        loadCustomerBatch,
    ]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    const customerOptions = useMemo(() => {
        return customers.map((customer) => {
            const name = getCustomerName(customer);
            const phone = getCustomerPhone(customer);
            const groupName = formatName(customer.group_name);

            return {
                value: customer.id,
                selectedLabel: name,
                label: (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.3fr 1fr 1.2fr",
                            alignItems: "center",
                            columnGap: 16,
                            width: "100%",
                            minHeight: 38,
                        }}
                    >
                        <Text strong ellipsis style={{ minWidth: 0 }}>
                            {name}
                        </Text>

                        <Text
                            type="secondary"
                            ellipsis
                            style={{ fontSize: 14, minWidth: 0 }}
                        >
                            {phone || "—"}
                        </Text>

                        <Text
                            type="secondary"
                            ellipsis
                            style={{ fontSize: 14, minWidth: 0 }}
                        >
                            {groupName || "-"}
                        </Text>
                    </div>
                ),
                searchLabel: `${name} ${phone} ${customer.identification_number ?? ""} ${groupName ?? ""}`,
            };
        });
    }, [customers]);

    const handleCreateSacco = async (values: CreateSaccoFormValues) => {
        try {
            await createSacco({
                saccoName: values.saccoName.trim(),
                location: values.location.trim(),
                chairPerson: Number(values.chairPerson),
            }).unwrap();

            messageApi.success("Sacco created successfully");
            form.resetFields();
            onCreated();
        } catch (error: any) {
            messageApi.error(
                error?.data?.message ||
                error?.data?.error ||
                "Failed to create Sacco. Please try again."
            );
        }
    };

    return (
        <>
            {contextHolder}

            <div style={{ maxWidth: 760 }}>
                <Title level={4} style={{ marginBottom: 4 }}>
                    Create Sacco
                </Title>

                <Text type="secondary">
                    Onboard a new Sacco by adding the Sacco name, location, and chairperson.
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateSacco}
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        label="Sacco Name"
                        name="saccoName"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the Sacco name",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="Sacco name" />
                    </Form.Item>

                    <Form.Item
                        label="Location"
                        name="location"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the Sacco location",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="Sacco location" />
                    </Form.Item>

                    <Form.Item
                        label="Choose Chairperson"
                        name="chairPerson"
                        rules={[
                            {
                                required: true,
                                message: "Please choose the chairperson",
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            size="large"
                            placeholder="Search or choose a customer"
                            options={customerOptions}
                            loading={isLoadingCustomers}
                            filterOption={false}
                            onSearch={handleSearchCustomers}
                            onPopupScroll={handleDropdownScroll}
                            onDropdownVisibleChange={setIsDropdownOpen}
                            optionLabelProp="selectedLabel"
                            notFoundContent={
                                isLoadingCustomers ? <Spin size="small" /> : "No customers found"
                            }
                            dropdownRender={(menu) => (
                                <>
                                    {menu}

                                    <Divider style={{ margin: "8px 0" }} />

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "0 8px 8px",
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            loading={isLoadingCustomers}
                                            disabled={
                                                !hasMoreCustomers ||
                                                Boolean(customerSearch.trim())
                                            }
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                            onClick={handleLoadMoreCustomers}
                                        >
                                            {customerSearch.trim()
                                                ? "Clear search to load more"
                                                : hasMoreCustomers
                                                    ? "Load More"
                                                    : "No more customers"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        />
                    </Form.Item>

                    <Space wrap>
                        <Button type="primary" htmlType="submit" loading={isCreating}>
                            Create Sacco
                        </Button>

                        <Button onClick={onCancel}>Cancel</Button>
                    </Space>
                </Form>
            </div>
        </>
    );
};

export default CreateSaccoTab;